import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      delegateId,
      jrvId,
      qrData,
      photoUrl,
      votes,
      totals,
    } = body;

    // Validaciones básicas
    if (!delegateId || !jrvId) {
      return NextResponse.json(
        { error: 'delegateId y jrvId son requeridos' },
        { status: 400 }
      );
    }

    // Validar que la suma de votos coincida con papeletas válidas
    const totalVotes =
      votes.DC +
      votes.LIBRE +
      votes.PINU +
      votes.PLH +
      votes.PNH +
      totals.blankVotes +
      totals.nullVotes;

    if (totalVotes !== totals.validBallots) {
      return NextResponse.json(
        { error: 'La suma de votos no coincide con las papeletas válidas' },
        { status: 400 }
      );
    }

    // Verificar si ya existe un acta presidencial para esta JRV
    const existingActa = await prisma.acta.findFirst({
      where: {
        jrvId: jrvId,
        type: 'PRESIDENTIAL',
      },
    });

    if (existingActa) {
      return NextResponse.json(
        { error: 'Ya existe un acta presidencial para esta JRV' },
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

    // Generar código único
    const actaCode = `PRESIDENTIAL-${delegate.center.code}-${jrvId}-${Date.now()}`;

    // Crear el acta
    const acta = await prisma.acta.create({
      data: {
        code: actaCode,
        type: 'PRESIDENTIAL',
        delegateId,
        centerId: delegate.center.id,
        jrvId,
        departmentId: delegate.center.departmentId,
        municipalityId: delegate.center.municipalityId,
        imageUrl: photoUrl || '',
        imageHash: '', // TODO: calcular hash
        status: 'PENDING',
        ocrProcessed: false,
        totalVoters: totals.totalVoters,
        validBallots: totals.validBallots,
        blankVotes: totals.blankVotes,
        nullVotes: totals.nullVotes,
      },
    });

    // Buscar los IDs de los partidos
    const parties = await prisma.party.findMany({
      where: {
        code: {
          in: ['DC', 'LIBRE', 'PINU', 'PL', 'PN'],
        },
      },
    });

    const partyMap: Record<string, string> = {};
    parties.forEach((party) => {
      partyMap[party.code] = party.id;
    });

    // Crear los votos para cada partido usando createMany para mejor performance
    const voteRecords = [
      { partyCode: 'DC', votes: votes.DC },
      { partyCode: 'LIBRE', votes: votes.LIBRE },
      { partyCode: 'PINU', votes: votes.PINU },
      { partyCode: 'PL', votes: votes.PLH },
      { partyCode: 'PN', votes: votes.PNH },
    ];

    const votesToCreate = voteRecords
      .filter((r) => partyMap[r.partyCode])
      .map((r) => ({
        actaId: acta.id,
        partyId: partyMap[r.partyCode],
        votes: r.votes,
        source: 'MANUAL' as const,
      }));

    await prisma.vote.createMany({
      data: votesToCreate,
    });

    // Crear audit log
    await prisma.auditLog.create({
      data: {
        action: 'ACTA_SUBMITTED',
        entity: 'acta',
        entityId: acta.id,
        userId: delegateId,
        changes: {
          jrvId,
          totalVotes,
          validBallots: totals.validBallots,
        },
      },
    });

    return NextResponse.json({
      success: true,
      actaId: acta.id,
      message: 'Acta guardada exitosamente',
    });
  } catch (error) {
    console.error('Error al guardar acta:', error);
    return NextResponse.json(
      { error: 'Error al guardar el acta' },
      { status: 500 }
    );
  }
}
