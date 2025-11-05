/**
 * Script para generar QRs de prueba en formato CNE
 * Se ejecuta con: npx ts-node scripts/generate-test-qrs.ts
 */

import { generateMockQR, getQRInfo, processQR, CARGOS_JRV, PARTIDOS } from '../src/lib/qr-crypto.ts';

console.log('🔐 Generando QRs de Prueba - Formato CNE\n');
console.log('=' .repeat(80));

// Delegado 1: Presidente JRV, Partido LIBRE, JRV 00001
const qr1 = generateMockQR({
  partyCode: '02', // LIBRE
  jrvNumber: '00001',
  docType: '17', // MIEMBRO JRV
  cargoCode: '01', // Presidente Propietario
});

console.log('\n📱 DELEGADO 1: Juan Carlos Pérez López');
console.log('DNI: 0801199001234');
console.log('Teléfono: 98765432');
console.log(`QR Cifrado: ${qr1}`);
const qr1Data = processQR(qr1);
if (qr1Data) {
  const info1 = getQRInfo(qr1Data);
  console.log(`Partido: ${info1.partido.nombre} (${info1.partido.sigla})`);
  console.log(`JRV: ${info1.jrv.numeroFormateado}`);
  console.log(`Cargo: ${info1.cargo.nombre}`);
  console.log(`Tipo: ${info1.cargo.tipo}`);
}

// Delegado 2: Secretario JRV, Partido LIBRE, JRV 00001
const qr2 = generateMockQR({
  partyCode: '02',
  jrvNumber: '00001',
  docType: '17',
  cargoCode: '03', // Secretario Propietario
});

console.log('\n📱 DELEGADO 2: María Fernanda García Ruiz');
console.log('DNI: 0801199001235');
console.log('Teléfono: 98765433');
console.log(`QR Cifrado: ${qr2}`);
const qr2Data = processQR(qr2);
if (qr2Data) {
  const info2 = getQRInfo(qr2Data);
  console.log(`Partido: ${info2.partido.nombre} (${info2.partido.sigla})`);
  console.log(`JRV: ${info2.jrv.numeroFormateado}`);
  console.log(`Cargo: ${info2.cargo.nombre}`);
}

// Delegado 3: Presidente JRV, Partido Nacional, JRV 00005
const qr3 = generateMockQR({
  partyCode: '05', // PNH
  jrvNumber: '00005',
  docType: '17',
  cargoCode: '01',
});

console.log('\n📱 DELEGADO 3: Fernando Miguel Torres Ortiz');
console.log('DNI: 0801199001242');
console.log('Teléfono: 98765440');
console.log(`QR Cifrado: ${qr3}`);
const qr3Data = processQR(qr3);
if (qr3Data) {
  const info3 = getQRInfo(qr3Data);
  console.log(`Partido: ${info3.partido.nombre} (${info3.partido.sigla})`);
  console.log(`JRV: ${info3.jrv.numeroFormateado}`);
  console.log(`Cargo: ${info3.cargo.nombre}`);
}

// Delegado 4: Custodio Informático Electoral (CIE)
const qr4 = generateMockQR({
  partyCode: '02', // LIBRE
  jrvNumber: '00009',
  docType: '18', // CIE
  cargoCode: '15', // CIE-1
});

console.log('\n📱 DELEGADO 4: Ricardo Enrique Núñez Vega (CIE)');
console.log('DNI: 0801199001250');
console.log('Teléfono: 98765448');
console.log(`QR Cifrado: ${qr4}`);
const qr4Data = processQR(qr4);
if (qr4Data) {
  const info4 = getQRInfo(qr4Data);
  console.log(`Partido: ${info4.partido.nombre} (${info4.partido.sigla})`);
  console.log(`JRV: ${info4.jrv.numeroFormateado}`);
  console.log(`Cargo: ${info4.cargo.nombre}`);
  console.log(`Tipo: ${info4.cargo.tipo}`);
}

// Delegado 5: GPS Inválido (San Pedro Sula - >50km)
const qr5 = generateMockQR({
  partyCode: '02',
  jrvNumber: '00010',
  docType: '17',
  cargoCode: '01',
});

console.log('\n📱 DELEGADO 5: Sebastián David Medina Rojas (GPS INVÁLIDO)');
console.log('DNI: 0801199001252');
console.log('Teléfono: 98765450');
console.log(`QR Cifrado: ${qr5}`);
console.log('GPS: San Pedro Sula (>50km de Tegucigalpa) - DEBE FALLAR');

console.log('\n' + '='.repeat(80));
console.log('\n✅ QRs de prueba generados exitosamente');
console.log('\n📋 Estos QRs se pueden usar para testing en la app móvil');
console.log('⚠️  IMPORTANTE: Estos QRs usan llaves MOCK de desarrollo');
console.log('🔑 En producción, se usarán llaves reales del CNE\n');
