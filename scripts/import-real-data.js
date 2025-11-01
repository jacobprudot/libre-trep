const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient();

const baseDir = 'C:\\Users\\jprudot\\proyectos\\libre-trep\\Archivos Utiles-20251101T184857Z-1-001\\Archivos Utiles';

async function main() {
  console.log('🚀 Iniciando importación de datos reales...\n');

  try {
    // ========================================
    // 1. IMPORTAR UBICACIONES (Municipios con GPS)
    // ========================================
    console.log('📍 Importando municipios con coordenadas GPS...');

    const ubicacionesFile = path.join(baseDir, 'Ubicaciones .xlsx');
    const ubicacionesWorkbook = XLSX.readFile(ubicacionesFile);
    const ubicacionesData = XLSX.utils.sheet_to_json(ubicacionesWorkbook.Sheets['CoordenadasMunicipales']);

    let municipiosImportados = 0;

    for (const row of ubicacionesData) {
      const deptCode = String(row['CODIGO DEPARTAMENTO']).padStart(2, '0');
      const munCode = `${deptCode}-${String(row['CODIGO MUNICIPIO']).padStart(2, '0')}`;

      // Buscar o crear departamento
      const department = await prisma.department.upsert({
        where: { code: deptCode },
        update: {},
        create: {
          code: deptCode,
          name: row['DESC_DEPARTAMENTO'],
        },
      });

      // Crear o actualizar municipio con coordenadas
      await prisma.municipality.upsert({
        where: { code: munCode },
        update: {
          latitude: parseFloat(row['LATITUD']),
          longitude: parseFloat(row['LONGITUD']),
        },
        create: {
          code: munCode,
          name: row['DESC_MUNICIPIO'],
          departmentId: department.id,
          latitude: parseFloat(row['LATITUD']),
          longitude: parseFloat(row['LONGITUD']),
        },
      });

      municipiosImportados++;
    }

    console.log(`✅ ${municipiosImportados} municipios importados con coordenadas GPS\n`);

    // ========================================
    // 2. IMPORTAR CENTROS DE VOTACIÓN
    // ========================================
    console.log('🏫 Importando centros de votación...');

    const centrosFile = path.join(baseDir, 'Centros de Votacion.xlsx');
    const centrosWorkbook = XLSX.readFile(centrosFile);
    const centrosData = XLSX.utils.sheet_to_json(centrosWorkbook.Sheets['Hoja1']);

    let centrosImportados = 0;
    let centrosSkipped = 0;

    for (const row of centrosData) {
      try {
        const deptCode = String(row['codigo_departamento_domicilio']).padStart(2, '0');
        const munCode = `${deptCode}-${String(row['codigo_municipio_domicilio']).padStart(2, '0')}`;

        // Buscar departamento y municipio
        const department = await prisma.department.findUnique({ where: { code: deptCode } });
        const municipality = await prisma.municipality.findUnique({ where: { code: munCode } });

        if (!department || !municipality) {
          centrosSkipped++;
          continue;
        }

        // Generar código único para el centro
        // Formato: DEPT-MUN-AREA-SECTOR
        const centerCode = `${deptCode}-${String(row['codigo_municipio_domicilio']).padStart(2, '0')}-${row['codigo_area']}-${row['codigo_sector_electoral']}`;

        await prisma.votingCenter.upsert({
          where: { code: centerCode },
          update: {
            registeredVoters: parseInt(row['total']) || 0,
            jrvCount: parseInt(row['kit ']) || 0,
          },
          create: {
            code: centerCode,
            name: row['nombre_sector_electoral'] || 'Centro de Votación',
            address: row['nombre_sector_electoral'],
            departmentId: department.id,
            municipalityId: municipality.id,
            areaCode: parseInt(row['codigo_area']),
            areaName: row['nombre_area'],
            sectorCode: parseInt(row['codigo_sector_electoral']),
            sectorName: row['nombre_sector_electoral'],
            // Usar coordenadas del municipio
            latitude: municipality.latitude,
            longitude: municipality.longitude,
            registeredVoters: parseInt(row['total']) || 0,
            jrvCount: parseInt(row['kit ']) || 0,
          },
        });

        centrosImportados++;

        // Log progress cada 500 centros
        if (centrosImportados % 500 === 0) {
          console.log(`   Progreso: ${centrosImportados} centros importados...`);
        }
      } catch (error) {
        console.error(`   Error importando centro: ${error.message}`);
        centrosSkipped++;
      }
    }

    console.log(`✅ ${centrosImportados} centros de votación importados`);
    console.log(`⚠️  ${centrosSkipped} centros omitidos por errores\n`);

    // ========================================
    // 3. ESTADÍSTICAS FINALES
    // ========================================
    console.log('\n📊 ESTADÍSTICAS FINALES:');

    const totalDepartments = await prisma.department.count();
    const totalMunicipalities = await prisma.municipality.count();
    const totalCenters = await prisma.votingCenter.count();
    const totalRegisteredVoters = await prisma.votingCenter.aggregate({
      _sum: { registeredVoters: true },
    });

    console.log(`   - Departamentos: ${totalDepartments}`);
    console.log(`   - Municipios: ${totalMunicipalities}`);
    console.log(`   - Centros de Votación: ${totalCenters}`);
    console.log(`   - Votantes Registrados: ${totalRegisteredVoters._sum.registeredVoters?.toLocaleString() || 0}`);

    console.log('\n✨ Importación completada exitosamente!');
  } catch (error) {
    console.error('\n❌ Error durante la importación:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error fatal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
