import { NextRequest, NextResponse } from 'next/server';
import { calculateDistance } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import { processQR, getQRInfo } from '@/lib/qr-crypto';

// Radio máximo permitido: 50km
const MAX_DISTANCE_KM = 50;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { qrCode, dni, phone, latitude, longitude, deviceInfo } = body;

    // =====================================
    // 1. VALIDACIÓN DE CAMPOS REQUERIDOS
    // =====================================
    if (!qrCode || !dni || !phone || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // =====================================
    // 1.5. PROCESAR Y VALIDAR QR CNE
    // =====================================
    const qrData = processQR(qrCode);
    if (!qrData) {
      return NextResponse.json(
        { error: 'Código QR inválido o no se pudo descifrar. Verifica tu credencial.' },
        { status: 400 }
      );
    }

    // Obtener información legible del QR
    const qrInfo = getQRInfo(qrData);
    console.log('📱 QR Procesado:', {
      partido: qrInfo.partido.nombre,
      jrv: qrInfo.jrv.numeroFormateado,
      cargo: qrInfo.cargo.nombre,
      tipo: qrInfo.cargo.tipo,
    });

    // Limpiar DNI (remover guiones)
    const cleanDNI = dni.replace(/\D/g, '');
    if (cleanDNI.length !== 13) {
      return NextResponse.json(
        { error: 'DNI inválido. Debe tener 13 dígitos.' },
        { status: 400 }
      );
    }

    // Validar teléfono
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 8) {
      return NextResponse.json(
        { error: 'Teléfono inválido. Debe tener 8 dígitos.' },
        { status: 400 }
      );
    }

    // =====================================
    // 2. BUSCAR DELEGADO EN BASE DE DATOS
    // =====================================
    // IMPORTANTE: Todos los datos deben coincidir exactamente
    // Buscamos por QR cifrado, DNI y teléfono
    const delegate = await prisma.delegate.findFirst({
      where: {
        AND: [
          { qrCodeEncrypted: qrCode },
          { dni: cleanDNI },
          { phone: cleanPhone },
        ],
      },
      include: {
        center: {
          include: {
            municipality: true,
          },
        },
      },
    });

    if (!delegate) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas. Verifica que tu QR, DNI y teléfono sean correctos.' },
        { status: 401 }
      );
    }

    // =====================================
    // 4. VALIDAR GPS - UBICACIÓN
    // =====================================
    // Determinar coordenadas de referencia (centro o municipio)
    let referenceLatitude: number;
    let referenceLongitude: number;
    let referenceName: string;

    if (delegate.center) {
      // Usar coordenadas del centro de votación
      if (delegate.center.latitude && delegate.center.longitude) {
        referenceLatitude = delegate.center.latitude;
        referenceLongitude = delegate.center.longitude;
        referenceName = delegate.center.name;
      } else if (delegate.center.municipality?.latitude && delegate.center.municipality?.longitude) {
        // Fallback: usar coordenadas del municipio
        referenceLatitude = delegate.center.municipality.latitude;
        referenceLongitude = delegate.center.municipality.longitude;
        referenceName = delegate.center.municipality.name;
      } else {
        return NextResponse.json(
          { error: 'No hay coordenadas de referencia configuradas para tu centro.' },
          { status: 500 }
        );
      }
    } else {
      // Sin centro asignado - no podemos validar ubicación
      return NextResponse.json(
        { error: 'No tienes un centro de votación asignado.' },
        { status: 400 }
      );
    }

    // Calcular distancia en km
    const distanceKm = calculateDistance(
      latitude,
      longitude,
      referenceLatitude,
      referenceLongitude
    ) / 1000; // Convertir metros a km

    console.log('📍 Validación GPS:', {
      delegatePosition: { latitude, longitude },
      referencePosition: { referenceLatitude, referenceLongitude },
      referenceName,
      distanceKm: distanceKm.toFixed(2),
      maxAllowed: MAX_DISTANCE_KM,
    });

    if (distanceKm > MAX_DISTANCE_KM) {
      return NextResponse.json(
        {
          error: `Tu ubicación está muy lejos de tu centro de votación (${distanceKm.toFixed(1)} km). Debes estar a máximo ${MAX_DISTANCE_KM} km.`,
          distance: distanceKm,
          maxDistance: MAX_DISTANCE_KM,
        },
        { status: 403 }
      );
    }

    // =====================================
    // 5. VERIFICAR SI YA INICIÓ SESIÓN DESDE OTRA UBICACIÓN
    // =====================================
    // Si el delegado ya tiene coordenadas registradas diferentes
    const previousDistance = calculateDistance(
      delegate.latitude,
      delegate.longitude,
      latitude,
      longitude
    ) / 1000;

    // Si se movió más de 5km desde el último login, alertar
    if (previousDistance > 5) {
      console.warn('⚠️ Delegado intentando login desde ubicación diferente:', {
        delegateName: delegate.fullName,
        previousLocation: { lat: delegate.latitude, lng: delegate.longitude },
        newLocation: { lat: latitude, lng: longitude },
        distanceMoved: previousDistance.toFixed(2),
      });

      // Por ahora solo logueamos, pero podrías bloquear o requerir confirmación adicional
    }

    // =====================================
    // 6. ACTUALIZAR UBICACIÓN Y DEVICE INFO
    // =====================================
    await prisma.delegate.update({
      where: { id: delegate.id },
      data: {
        latitude,
        longitude,
        deviceInfo: deviceInfo || null,
        updatedAt: new Date(),
      },
    });

    // =====================================
    // 7. CREAR AUDIT LOG
    // =====================================
    await prisma.auditLog.create({
      data: {
        action: 'LOGIN',
        entity: 'delegate',
        entityId: delegate.id,
        delegateId: delegate.id,
        changes: {
          latitude,
          longitude,
          distanceFromCenter: distanceKm,
          deviceInfo,
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    // =====================================
    // 8. GENERAR TOKEN (simplificado)
    // =====================================
    // En producción, usar JWT con secret
    const token = Buffer.from(
      JSON.stringify({
        delegateId: delegate.id,
        dni: delegate.dni,
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
      })
    ).toString('base64');

    // =====================================
    // 9. RESPUESTA EXITOSA
    // =====================================
    return NextResponse.json({
      success: true,
      token,
      delegate: {
        id: delegate.id,
        fullName: delegate.fullName,
        dni: delegate.dni,
        phone: delegate.phone,
        // Información CNE del QR
        partido: qrInfo.partido.nombre,
        partidoSigla: qrInfo.partido.sigla,
        jrv: qrInfo.jrv.numeroFormateado,
        cargo: qrInfo.cargo.nombre,
        cargoTipo: qrInfo.cargo.tipo,
        puedeVotar: qrInfo.cargo.puedeVotar,
        restriccionHoraria: qrInfo.cargo.restriccionHoraria,
        // Centro de votación
        center: delegate.center ? {
          id: delegate.center.id,
          name: delegate.center.name,
          code: delegate.center.code,
        } : null,
      },
      message: 'Autenticación exitosa',
    });
  } catch (error: any) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
