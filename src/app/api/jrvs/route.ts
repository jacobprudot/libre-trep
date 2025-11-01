import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const centerId = searchParams.get('centerId');

    if (!centerId) {
      return NextResponse.json(
        { error: 'centerId es requerido' },
        { status: 400 }
      );
    }

    // Obtener todas las JRVs del centro
    const jrvs = await prisma.jRV.findMany({
      where: {
        centerId: centerId,
      },
      orderBy: {
        code: 'asc',
      },
      select: {
        id: true,
        code: true,
        members: true,
      },
    });

    return NextResponse.json({
      success: true,
      jrvs,
    });
  } catch (error) {
    console.error('Error al obtener JRVs:', error);
    return NextResponse.json(
      { error: 'Error al obtener JRVs' },
      { status: 500 }
    );
  }
}
