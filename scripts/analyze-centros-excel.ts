/**
 * Script para analizar el archivo Excel de centros de votación del CNE
 * Lee las primeras filas para entender la estructura
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';

const filePath = 'carga_x_sector_20250801_1606 (2).xlsx';

console.log('📊 Analizando archivo de centros de votación del CNE...\n');

try {
  // Leer el archivo Excel
  const workbook = XLSX.readFile(filePath);

  console.log('📄 Hojas disponibles:', workbook.SheetNames);
  console.log('');

  // Leer la primera hoja
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  console.log(`📋 Analizando hoja: "${firstSheetName}"`);
  console.log('');

  // Convertir a JSON para ver la estructura
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

  console.log('🔍 Primeras 10 filas:');
  console.log('='.repeat(120));

  data.slice(0, 10).forEach((row, index) => {
    console.log(`Fila ${index}:`, row);
  });

  console.log('');
  console.log('📊 Estadísticas:');
  console.log(`Total de filas: ${data.length}`);
  console.log(`Columnas en primera fila: ${data[0]?.length || 0}`);

  // Intentar identificar columnas
  console.log('');
  console.log('🏷️  Encabezados (Fila 0):');
  if (data[0]) {
    data[0].forEach((header, index) => {
      console.log(`  Columna ${index}: "${header}"`);
    });
  }

  // Mostrar una fila de ejemplo con datos
  console.log('');
  console.log('📝 Ejemplo de fila con datos (Fila 1):');
  if (data[1]) {
    data[0].forEach((header, index) => {
      console.log(`  ${header}: ${data[1][index]}`);
    });
  }

  // Convertir a JSON con headers
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  console.log('');
  console.log('🔢 Primeros 3 registros (JSON):');
  console.log(JSON.stringify(jsonData.slice(0, 3), null, 2));

} catch (error) {
  console.error('❌ Error leyendo archivo:', error);
}
