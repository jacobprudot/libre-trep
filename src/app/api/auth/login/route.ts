import { NextRequest, NextResponse } from 'next/server';
import { calculateDistance } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import { processQR, getQRInfo } from '@/lib/qr-crypto';

// Radio máximo permitido desde el centro de votación de la JRV: 20km
const MAX_DISTANCE_KM = 20;

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
    // 4. VALIDAR GPS - UBICACIÓN (Basado en JRV del QR)
    // =====================================
    // IMPORTANTE: El QR contiene el número de JRV, usamos ese para encontrar
    // el centro de votación correcto y validar GPS (20km de radio)

    // Buscar la JRV del QR en la base de datos
    const jrv = await prisma.jRV.findFirst({
      where: { code: qrData.jrvNumber },
      include: {
        center: {
          include: {
            municipality: true,
          },
        },
      },
    });

    if (!jrv) {
      return NextResponse.json(
        { error: `JRV ${qrInfo.jrv.numeroFormateado} no encontrada en el sistema. Contacta al coordinador.` },
        { status: 404 }
      );
    }

    // Determinar coordenadas de referencia del centro de la JRV
    let referenceLatitude: number;
    let referenceLongitude: number;
    let referenceName: string;

    if (jrv.center.latitude && jrv.center.longitude) {
      // Usar coordenadas del centro de votación
      referenceLatitude = jrv.center.latitude;
      referenceLongitude = jrv.center.longitude;
      referenceName = jrv.center.name;
    } else if (jrv.center.municipality?.latitude && jrv.center.municipality?.longitude) {
      // Fallback: usar coordenadas del municipio
      referenceLatitude = jrv.center.municipality.latitude;
      referenceLongitude = jrv.center.municipality.longitude;
      referenceName = jrv.center.municipality.name;
    } else {
      return NextResponse.json(
        { error: 'No hay coordenadas de referencia configuradas para tu JRV.' },
        { status: 500 }
      );
    }

    // Calcular distancia en km
    const distanceKm = calculateDistance(
      latitude,
      longitude,
      referenceLatitude,
      referenceLongitude
    ) / 1000; // Convertir metros a km

    console.log('📍 Validación GPS basada en JRV:', {
      jrvNumber: qrInfo.jrv.numeroFormateado,
      jrvCode: qrData.jrvNumber,
      centroVotacion: referenceName,
      delegatePosition: { latitude, longitude },
      centerPosition: { referenceLatitude, referenceLongitude },
      distanceKm: distanceKm.toFixed(2),
      maxAllowed: MAX_DISTANCE_KM,
      resultado: distanceKm <= MAX_DISTANCE_KM ? '✅ VÁLIDO' : '❌ RECHAZADO',
    });

    if (distanceKm > MAX_DISTANCE_KM) {
      return NextResponse.json(
        {
          error: `Tu ubicación está muy lejos del centro de votación de tu JRV (${distanceKm.toFixed(1)} km de ${referenceName}). Debes estar a máximo ${MAX_DISTANCE_KM} km.`,
          distance: distanceKm,
          maxDistance: MAX_DISTANCE_KM,
          jrv: qrInfo.jrv.numeroFormateado,
          centro: referenceName,
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
        jrvCode: qrData.jrvNumber,
        cargo: qrInfo.cargo.nombre,
        cargoTipo: qrInfo.cargo.tipo,
        puedeVotar: qrInfo.cargo.puedeVotar,
        restriccionHoraria: qrInfo.cargo.restriccionHoraria,
        // Centro de votación (del QR/JRV, no del perfil del delegado)
        center: {
          id: jrv.center.id,
          name: jrv.center.name,
          code: jrv.center.code,
          latitude: jrv.center.latitude,
          longitude: jrv.center.longitude,
        },
        // Validación GPS
        gpsValidation: {
          distanceKm: parseFloat(distanceKm.toFixed(2)),
          maxAllowed: MAX_DISTANCE_KM,
          withinRange: true,
        },
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
