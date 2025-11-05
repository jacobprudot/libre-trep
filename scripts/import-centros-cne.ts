/**
 * Script para importar centros de votación del CNE con coordenadas GPS
 * Fuente: carga_x_sector_20250801_1606 (2).xlsx
 *
 * Ejecutar: npx tsx scripts/import-centros-cne.ts
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

// Mapeo de departamentos CNE a códigos internos
const DEPT_MAP: Record<string, string> = {
  'ATLANTIDA': 'ATL',
  'CHOLUTECA': 'CHO',
  'COLON': 'COL',
  'COMAYAGUA': 'COM',
  'COPAN': 'COP',
  'CORTES': 'COR',
  'EL PARAISO': 'EP',
  'FRANCISCO MORAZAN': 'FM',
  'GRACIAS A DIOS': 'GD',
  'INTIBUCA': 'INT',
  'ISLAS DE LA BAHIA': 'IB',
  'LA PAZ': 'LP',
  'LEMPIRA': 'LEM',
  'OCOTEPEQUE': 'OCO',
  'OLANCHO': 'OLA',
  'SANTA BARBARA': 'SB',
  'VALLE': 'VAL',
  'YORO': 'YOR',
};

async function main() {
  console.log('🚀 Importando centros de votación del CNE...\n');

  // 1. Leer archivo Excel
  console.log('📂 Leyendo archivo Excel...');
  const workbook = XLSX.readFile('carga_x_sector_20250801_1606 (2).xlsx');
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json<CentroExcel>(worksheet);

  console.log(`✅ ${data.length} centros encontrados en el archivo\n`);

  // 2. Agrupar por departamento
  const centrosPorDepartamento = data.reduce((acc, centro) => {
    const deptName = centro.NOMBRE_DEPARTAMENTO.toUpperCase();
    if (!acc[deptName]) acc[deptName] = [];
    acc[deptName].push(centro);
    return acc;
  }, {} as Record<string, CentroExcel[]>);

  console.log(`📊 Distribución por departamento:`);
  Object.entries(centrosPorDepartamento).forEach(([dept, centros]) => {
    console.log(`   ${dept}: ${centros.length} centros`);
  });
  console.log('');

  // 3. Importar departamentos y municipios
  console.log('🏛️  Creando departamentos y municipios...');

  let deptCount = 0;
  let municCount = 0;
  let centroCount = 0;

  for (const [deptName, centros] of Object.entries(centrosPorDepartamento)) {
    const deptCode = DEPT_MAP[deptName];

    if (!deptCode) {
      console.warn(`⚠️  Departamento desconocido: ${deptName}`);
      continue;
    }

    // Crear departamento
    const dept = await prisma.department.upsert({
      where: { code: deptCode },
      update: { name: deptName },
      create: { code: deptCode, name: deptName },
    });
    deptCount++;

    // Obtener municipios únicos de este departamento
    const municipiosUnicos = new Map<string, CentroExcel>();
    centros.forEach(centro => {
      const key = `${centro.CODIGO_MUNICIPIO}-${centro.NOMBRE_MUNICIPIO}`;
      if (!municipiosUnicos.has(key)) {
        municipiosUnicos.set(key, centro);
      }
    });

    // Crear municipios
    for (const [key, centro] of municipiosUnicos) {
      const municCode = `${deptCode}-${String(centro.CODIGO_MUNICIPIO).padStart(2, '0')}`;

      await prisma.municipality.upsert({
        where: { code: municCode },
        update: { name: centro.NOMBRE_MUNICIPIO },
        create: {
          code: municCode,
          name: centro.NOMBRE_MUNICIPIO,
          departmentId: dept.id,
          // Coordenadas del primer centro como referencia
          latitude: parseFloat(centro.LATITUD),
          longitude: parseFloat(centro.LONGITUD),
        },
      });
      municCount++;
    }
  }

  console.log(`✅ ${deptCount} departamentos creados/actualizados`);
  console.log(`✅ ${municCount} municipios creados/actualizados\n`);

  // 4. Importar centros de votación
  console.log('🏫 Importando centros de votación...');

  for (const [deptName, centros] of Object.entries(centrosPorDepartamento)) {
    const deptCode = DEPT_MAP[deptName];
    if (!deptCode) continue;

    const dept = await prisma.department.findUnique({ where: { code: deptCode } });
    if (!dept) continue;

    console.log(`\n📍 Procesando ${deptName} (${centros.length} centros)...`);

    for (const centro of centros) {
      const municCode = `${deptCode}-${String(centro.CODIGO_MUNICIPIO).padStart(2, '0')}`;
      const municipality = await prisma.municipality.findUnique({ where: { code: municCode } });

      if (!municipality) {
        console.warn(`   ⚠️  Municipio no encontrado: ${municCode}`);
        continue;
      }

      // Generar código único para el centro
      const centroCode = `CNE-${deptCode}-${String(centro.CODIGO_MUNICIPIO).padStart(2, '0')}-${String(centro.CODIGO_SECTOR_ELECTORAL).padStart(3, '0')}`;

      try {
        await prisma.votingCenter.upsert({
          where: { code: centroCode },
          update: {
            name: centro.NOMBRE_CENTRO,
            address: centro.NOMBRE_SECTOR_ELECTORAL,
            latitude: parseFloat(centro.LATITUD),
            longitude: parseFloat(centro.LONGITUD),
            areaCode: centro.CODIGO_AREA,
            areaName: centro.NOMBRE_AREA,
            sectorCode: centro.CODIGO_SECTOR_ELECTORAL,
            sectorName: centro.NOMBRE_SECTOR_ELECTORAL,
            registeredVoters: centro.CARGA_ELECTORAL,
          },
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
        centroCount++;

        if (centroCount % 100 === 0) {
          console.log(`   ✅ ${centroCount} centros importados...`);
        }
      } catch (error) {
        console.error(`   ❌ Error en centro ${centro.NOMBRE_CENTRO}:`, error);
      }
    }
  }

  console.log(`\n✅ Total de ${centroCount} centros importados\n`);

  // 5. Estadísticas finales
  console.log('📊 Estadísticas finales:');

  const totalCentros = await prisma.votingCenter.count();
  const totalDepartamentos = await prisma.department.count();
  const totalMunicipios = await prisma.municipality.count();
  const totalVotantes = await prisma.votingCenter.aggregate({
    _sum: { registeredVoters: true }
  });

  console.log(`   Departamentos: ${totalDepartamentos}`);
  console.log(`   Municipios: ${totalMunicipios}`);
  console.log(`   Centros de votación: ${totalCentros}`);
  console.log(`   Votantes registrados: ${totalVotantes._sum.registeredVoters?.toLocaleString()}`);

  // 6. Centros con coordenadas
  const centrosConCoordenadas = await prisma.votingCenter.count({
    where: {
      AND: [
        { latitude: { not: null } },
        { longitude: { not: null } }
      ]
    }
  });

  console.log(`   Centros con GPS: ${centrosConCoordenadas} (${((centrosConCoordenadas / totalCentros) * 100).toFixed(1)}%)`);

  console.log('\n✨ Importación completada exitosamente!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error durante la importación:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
