import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { delegateId, type, jrvId, qrData, photoUrl } = body;

    // Validaciones básicas
    if (!delegateId || !type || !jrvId) {
      return NextResponse.json(
        { error: 'delegateId, type y jrvId son requeridos' },
        { status: 400 }
      );
    }

    // Validar tipo de acta
    if (type !== 'deputies' && type !== 'mayors') {
      return NextResponse.json({ error: 'Tipo de acta inválido' }, { status: 400 });
    }

    // Convertir tipo a formato del schema
    const actaType = type === 'deputies' ? 'DEPUTIES' : 'MAYORS';

    // Verificar que existe un acta presidencial
    const presidentialActa = await prisma.acta.findFirst({
      where: {
        delegateId,
        type: 'PRESIDENTIAL',
      },
    });

    if (!presidentialActa) {
      return NextResponse.json(
        { error: 'Debes completar el acta presidencial primero' },
        { status: 403 }
      );
    }

    // Verificar si ya existe un acta de este tipo para esta JRV
    const existingActa = await prisma.acta.findFirst({
      where: {
        jrvId: jrvId,
        type: actaType,
      },
    });

    if (existingActa) {
      return NextResponse.json(
        {
          error: `Ya existe un acta de ${
            type === 'deputies' ? 'Diputados' : 'Alcaldes'
          } para esta JRV`,
        },
        { status: 409 }
      );
    }

    // Obtener información del delegado para department y municipality
    const delegate = await prisma.delegate.findUnique({
      where: { id: delegateId },
      include: {
        center: {
          include: {
            department: true,
            municipality: true,
          },
        },
      },
    });

    if (!delegate || !delegate.center) {
      return NextResponse.json(
        { error: 'Delegado o centro no encontrado' },
        { status: 404 }
      );
    }

    // Generar código único para el acta
    const actaCode = `${actaType}-${delegate.center.code}-${jrvId}-${Date.now()}`;

    // Crear el acta
    const acta = await prisma.acta.create({
      data: {
        code: actaCode,
        type: actaType,
        delegateId,
        centerId: delegate.center.id,
        jrvId,
        departmentId: delegate.center.departmentId,
        municipalityId: delegate.center.municipalityId,
        imageUrl: photoUrl || '',
        imageHash: '', // TODO: calcular hash de la imagen
        status: 'PENDING',
        ocrProcessed: false,
      },
    });

    // Crear audit log
    await prisma.auditLog.create({
      data: {
        action: 'ACTA_ADDITIONAL_SUBMITTED',
        entity: 'acta',
        entityId: acta.id,
        userId: delegateId,
        changes: {
          type: actaType,
          jrvId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      actaId: acta.id,
      message: `Acta de ${type === 'deputies' ? 'Diputados' : 'Alcaldes'} guardada exitosamente`,
    });
  } catch (error) {
    console.error('Error al guardar acta adicional:', error);
    return NextResponse.json({ error: 'Error al guardar el acta' }, { status: 500 });
  }
}
