/**
 * Script de prueba para importar solo centros de Francisco Morazán
 * Para verificar que la importación funciona antes del import completo
 */

import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CentroExcel {
  CODIGO_DEPARTAMENTO: number;
  NOMBRE_DEPARTAMENTO: string;
  CODIGO_MUNICIPIO: number;
  NOMBRE_MUNICIPIO: string;
  CODIGO_AREA: number;
  NOMBRE_AREA: string;
  CODIGO_SECTOR_ELECTORAL: number;
  NOMBRE_SECTOR_ELECTORAL: string;
  NOMBRE_CENTRO: string;
  CARGA_ELECTORAL: number;
  LONGITUD: string;
  LATITUD: string;
}

async function main() {
  console.log('🧪 TEST: Importando centros de Francisco Morazán...\n');

  // Leer archivo Excel
  const workbook = XLSX.readFile('carga_x_sector_20250801_1606 (2).xlsx');
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const allData = XLSX.utils.sheet_to_json<CentroExcel>(worksheet);

  // Filtrar solo Francisco Morazán
  const fmData = allData.filter(centro =>
    centro.NOMBRE_DEPARTAMENTO.toUpperCase().includes('FRANCISCO')
  );

  console.log(`📊 Centros en Francisco Morazán: ${fmData.length}`);
  console.log(`📊 Total en archivo: ${allData.length}\n`);

  // Verificar departamento existe
  const dept = await prisma.department.findUnique({ where: { code: 'FM' } });
  if (!dept) {
    console.error('❌ Departamento FM no encontrado');
    return;
  }

  console.log(`✅ Departamento encontrado: ${dept.name}\n`);

  // Importar primeros 10 centros como prueba
  console.log('📍 Importando primeros 10 centros...\n');

  for (let i = 0; i < Math.min(10, fmData.length); i++) {
    const centro = fmData[i];

    // Buscar o crear municipio
    const municCode = `FM-${String(centro.CODIGO_MUNICIPIO).padStart(2, '0')}`;

    let municipality = await prisma.municipality.findUnique({ where: { code: municCode } });

    if (!municipality) {
      municipality = await prisma.municipality.create({
        data: {
          code: municCode,
          name: centro.NOMBRE_MUNICIPIO,
          departmentId: dept.id,
          latitude: parseFloat(centro.LATITUD),
          longitude: parseFloat(centro.LONGITUD),
        },
      });
      console.log(`   ✅ Municipio creado: ${municipality.name}`);
    }

    // Crear centro
    const centroCode = `TEST-FM-${String(centro.CODIGO_MUNICIPIO).padStart(2, '0')}-${String(centro.CODIGO_SECTOR_ELECTORAL).padStart(3, '0')}`;

    const votingCenter = await prisma.votingCenter.upsert({
      where: { code: centroCode },
      update: {},
      create: {
        code: centroCode,
        name: centro.NOMBRE_CENTRO,
        address: centro.NOMBRE_SECTOR_ELECTORAL,
        latitude: parseFloat(centro.LATITUD),
        longitude: parseFloat(centro.LONGITUD),
        areaCode: centro.CODIGO_AREA,
        areaName: centro.NOMBRE_AREA,
        sectorCode: centro.CODIGO_SECTOR_ELECTORAL,
        sectorName: centro.NOMBRE_SECTOR_ELECTORAL,
        registeredVoters: centro.CARGA_ELECTORAL,
        departmentId: dept.id,
        municipalityId: municipality.id,
      },
    });

    console.log(`   ✅ ${i + 1}. ${votingCenter.name}`);
    console.log(`      📍 GPS: ${votingCenter.latitude}, ${votingCenter.longitude}`);
    console.log(`      👥 Votantes: ${votingCenter.registeredVoters}`);
  }

  console.log('\n✅ Test completado!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
