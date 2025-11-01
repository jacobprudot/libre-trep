const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\jprudot\\proyectos\\libre-trep\\Archivos Utiles-20251101T184857Z-1-001\\Archivos Utiles';

// Archivos a leer
const files = [
  'Candidatos .xlsx',
  'Centros de Votacion.xlsx',
  'Ubicaciones .xlsx',
  'CENTRO_JRV_kit_EG 2025 - FDemocratica EG25.xlsx',
  'DISTRIBUCION DE CARGOS-Tabla 1.xlsx'
];

console.log('📊 Leyendo archivos Excel...\n');

files.forEach(fileName => {
  const filePath = path.join(baseDir, fileName);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ No se encontró: ${fileName}\n`);
    return;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📄 ARCHIVO: ${fileName}`);
  console.log('='.repeat(60));

  try {
    const workbook = XLSX.readFile(filePath);

    // Mostrar todas las hojas
    console.log(`\n📑 Hojas encontradas: ${workbook.SheetNames.join(', ')}\n`);

    // Leer cada hoja
    workbook.SheetNames.forEach(sheetName => {
      console.log(`\n--- Hoja: ${sheetName} ---`);
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      console.log(`Total de filas: ${data.length}`);

      if (data.length > 0) {
        console.log('\n📋 Columnas:', Object.keys(data[0]).join(', '));
        console.log('\n📝 Primeras 5 filas:');
        console.log(JSON.stringify(data.slice(0, 5), null, 2));
      }
    });
  } catch (error) {
    console.error(`❌ Error leyendo ${fileName}:`, error.message);
  }
});

console.log('\n\n✅ Lectura completada');
