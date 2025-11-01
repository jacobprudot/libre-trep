import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const delegateId = searchParams.get('delegateId');

    if (!delegateId) {
      return NextResponse.json({ error: 'delegateId es requerido' }, { status: 400 });
    }

    // Verificar si existe algún acta presidencial del delegado
    const presidentialActa = await prisma.acta.findFirst({
      where: {
        delegateId: delegateId,
        type: 'PRESIDENTIAL',
      },
    });

    return NextResponse.json({
      exists: !!presidentialActa,
      actaId: presidentialActa?.id || null,
    });
  } catch (error) {
    console.error('Error al verificar acta presidencial:', error);
    return NextResponse.json(
      { error: 'Error al verificar acta presidencial' },
      { status: 500 }
    );
  }
}
