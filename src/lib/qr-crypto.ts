/**
 * Librería de cifrado/descifrado de códigos QR
 * Basado en especificaciones CNE-Smartmatic para Elecciones Generales 2025
 *
 * Formato QR:
 * - 12 dígitos numéricos sin separadores
 * - Estructura: [AA][BBBBB][CC][D][EE]
 *   AA: Código Partido (2)
 *   BBBBB: Número JRV (5)
 *   CC: Tipo Documento (2)
 *   D: Movimiento (1) - Siempre "1" para EG2025
 *   EE: Código Cargo (2)
 *
 * Cifrado:
 * - Algoritmo: AES-256-CBC
 * - Formato: Base64 del contenido cifrado
 * - Llave: 256 bits (32 bytes)
 * - IV: 128 bits (16 bytes)
 */

import crypto from 'crypto';

/**
 * Estructura del QR descifrado
 */
export interface QRData {
  partyCode: string;      // 01-05
  jrvNumber: string;      // 00001-99999
  docType: string;        // 17=JRV, 18=CIE
  movement: string;       // Siempre "1"
  cargoCode: string;      // 01-17
  raw: string;            // Código completo de 12 dígitos
}

/**
 * Catálogo de partidos políticos oficiales
 */
export const PARTIDOS = {
  '01': { code: 'DC', name: 'Partido Demócrata Cristiano' },
  '02': { code: 'LIBRE', name: 'Partido Libertad y Refundación' },
  '03': { code: 'PINU', name: 'Partido Innovación y Unidad Social Demócrata' },
  '04': { code: 'PLH', name: 'Partido Liberal de Honduras' },
  '05': { code: 'PNH', name: 'Partido Nacional de Honduras' },
} as const;

/**
 * Tipos de documento
 */
export const TIPOS_DOCUMENTO = {
  '17': 'CREDENCIAL MIEMBRO JRV',
  '18': 'CREDENCIAL CUSTODIO INFORMÁTICO ELECTORAL',
} as const;

/**
 * Catálogo de cargos JRV
 */
export const CARGOS_JRV = {
  '01': { name: 'Presidente Propietario', canVote: true, type: 'MIEMBRO DE JRV', timeRestriction: '1:00PM' },
  '02': { name: 'Presidente Suplente', canVote: true, type: 'MIEMBRO DE JRV', timeRestriction: '1:00PM' },
  '03': { name: 'Secretario Propietario', canVote: true, type: 'MIEMBRO DE JRV', timeRestriction: '1:00PM' },
  '04': { name: 'Secretario Suplente', canVote: true, type: 'MIEMBRO DE JRV', timeRestriction: '1:00PM' },
  '05': { name: 'Escrutador Propietario', canVote: true, type: 'MIEMBRO DE JRV', timeRestriction: '1:00PM' },
  '06': { name: 'Escrutador Suplente', canVote: true, type: 'MIEMBRO DE JRV', timeRestriction: '1:00PM' },
  '07': { name: 'Vocal I Propietario', canVote: true, type: 'MIEMBRO DE JRV', timeRestriction: '1:00PM' },
  '08': { name: 'Vocal I Suplente', canVote: true, type: 'MIEMBRO DE JRV', timeRestriction: '1:00PM' },
  '09': { name: 'Vocal II Propietario', canVote: true, type: 'MIEMBRO DE JRV', timeRestriction: '1:00PM' },
  '10': { name: 'Vocal II Suplente', canVote: true, type: 'MIEMBRO DE JRV', timeRestriction: '1:00PM' },
  '11': { name: 'Vocal III Propietario', canVote: true, type: 'MIEMBRO DE JRV', timeRestriction: '1:00PM' },
  '12': { name: 'Vocal III Suplente', canVote: true, type: 'MIEMBRO DE JRV', timeRestriction: '1:00PM' },
  '13': { name: 'Vocal IV Propietario', canVote: true, type: 'MIEMBRO DE JRV', timeRestriction: '1:00PM' },
  '14': { name: 'Vocal IV Suplente', canVote: true, type: 'MIEMBRO DE JRV', timeRestriction: '1:00PM' },
  '15': { name: 'Custodio Informático Electoral - 1', canVote: true, type: 'CIE', timeRestriction: '1:00PM' },
  '16': { name: 'Custodio Informático Electoral - 2', canVote: true, type: 'CIE', timeRestriction: '1:00PM' },
  '17': { name: 'Custodio Informático Electoral - 3', canVote: true, type: 'CIE', timeRestriction: '1:00PM' },
} as const;

/**
 * Descifra un código QR usando AES-256-CBC
 * @param encryptedQR - Código QR cifrado en Base64
 * @returns Código QR descifrado (12 dígitos) o null si falla
 */
export function decryptQR(encryptedQR: string): string | null {
  try {
    // Obtener llave y IV de variables de entorno
    // En producción, estas serán proporcionadas por Smartmatic
    const keyBase64 = process.env.QR_ENCRYPTION_KEY;
    const ivBase64 = process.env.QR_ENCRYPTION_IV;

    if (!keyBase64 || !ivBase64) {
      console.error('QR_ENCRYPTION_KEY o QR_ENCRYPTION_IV no configuradas');
      return null;
    }

    // Decodificar llave e IV desde Base64
    const key = Buffer.from(keyBase64, 'base64');
    const iv = Buffer.from(ivBase64, 'base64');

    // Validar tamaños
    if (key.length !== 32) {
      console.error('Llave de cifrado debe ser de 32 bytes (256 bits)');
      return null;
    }
    if (iv.length !== 16) {
      console.error('IV debe ser de 16 bytes (128 bits)');
      return null;
    }

    // Decodificar QR cifrado desde Base64
    const encryptedBuffer = Buffer.from(encryptedQR, 'base64');

    // Crear decipher
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    // Descifrar
    let decrypted = decipher.update(encryptedBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    // Convertir a string y limpiar posibles padding/whitespace
    const decryptedStr = decrypted.toString('utf8').trim();

    // Validar que sea exactamente 12 dígitos
    if (!/^\d{12}$/.test(decryptedStr)) {
      console.error('QR descifrado no tiene formato válido:', decryptedStr);
      return null;
    }

    return decryptedStr;
  } catch (error) {
    console.error('Error descifrando QR:', error);
    return null;
  }
}

/**
 * Parsea un código QR descifrado a su estructura
 * @param decrypted - Código QR de 12 dígitos
 * @returns Estructura QRData o null si inválido
 */
export function parseQRCode(decrypted: string): QRData | null {
  // Validar longitud
  if (decrypted.length !== 12) {
    console.error('QR debe tener exactamente 12 dígitos');
    return null;
  }

  // Validar que sean todos dígitos
  if (!/^\d{12}$/.test(decrypted)) {
    console.error('QR debe contener solo dígitos');
    return null;
  }

  // Extraer componentes según especificación CNE
  const partyCode = decrypted.substring(0, 2);
  const jrvNumber = decrypted.substring(2, 7);
  const docType = decrypted.substring(7, 9);
  const movement = decrypted.substring(9, 10);
  const cargoCode = decrypted.substring(10, 12);

  // Validar partido
  if (!PARTIDOS[partyCode as keyof typeof PARTIDOS]) {
    console.error('Código de partido inválido:', partyCode);
    return null;
  }

  // Validar tipo de documento
  if (!TIPOS_DOCUMENTO[docType as keyof typeof TIPOS_DOCUMENTO]) {
    console.error('Tipo de documento inválido:', docType);
    return null;
  }

  // Validar movimiento (debe ser "1" para EG2025)
  if (movement !== '1') {
    console.error('Movimiento debe ser "1" para EG2025:', movement);
    return null;
  }

  // Validar cargo
  if (!CARGOS_JRV[cargoCode as keyof typeof CARGOS_JRV]) {
    console.error('Código de cargo inválido:', cargoCode);
    return null;
  }

  return {
    partyCode,
    jrvNumber,
    docType,
    movement,
    cargoCode,
    raw: decrypted,
  };
}

/**
 * Procesa un código QR completo: descifra y parsea
 * @param encryptedQR - QR cifrado en Base64
 * @returns Estructura QRData o null si falla
 */
export function processQR(encryptedQR: string): QRData | null {
  // Paso 1: Descifrar
  const decrypted = decryptQR(encryptedQR);
  if (!decrypted) {
    return null;
  }

  // Paso 2: Parsear
  const parsed = parseQRCode(decrypted);
  if (!parsed) {
    return null;
  }

  return parsed;
}

/**
 * Obtiene información legible del QR
 */
export function getQRInfo(qrData: QRData) {
  const party = PARTIDOS[qrData.partyCode as keyof typeof PARTIDOS];
  const docType = TIPOS_DOCUMENTO[qrData.docType as keyof typeof TIPOS_DOCUMENTO];
  const cargo = CARGOS_JRV[qrData.cargoCode as keyof typeof CARGOS_JRV];

  return {
    partido: {
      codigo: qrData.partyCode,
      sigla: party.code,
      nombre: party.name,
    },
    jrv: {
      numero: qrData.jrvNumber,
      numeroFormateado: parseInt(qrData.jrvNumber).toString(), // "00001" -> "1"
    },
    documento: {
      tipo: qrData.docType,
      descripcion: docType,
    },
    cargo: {
      codigo: qrData.cargoCode,
      nombre: cargo.name,
      puedeVotar: cargo.canVote,
      tipo: cargo.type,
      restriccionHoraria: cargo.timeRestriction,
    },
    raw: qrData.raw,
  };
}

/**
 * FUNCIONES DE DESARROLLO/TESTING
 * Solo para generar datos mock mientras esperamos llaves oficiales
 */

/**
 * Cifra un código QR (solo para testing)
 * En producción, esto lo hace Smartmatic
 */
export function encryptQRMock(plainQR: string): string {
  // Llave y IV mock (32 bytes y 16 bytes random en Base64)
  const keyMock = 'Vk1mtK1YwWZMxpHHKZNoJ8Mv5sB/57sNoDYKMPk97Do=';
  const ivMock = 'UkXnuzeTy+gGVBRiG899UQ==';

  const key = Buffer.from(keyMock, 'base64');
  const iv = Buffer.from(ivMock, 'base64');

  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(plainQR, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return encrypted.toString('base64');
}

/**
 * Genera un QR de prueba válido
 */
export function generateMockQR(params: {
  partyCode: string;
  jrvNumber: string;
  docType: string;
  cargoCode: string;
}): string {
  const { partyCode, jrvNumber, docType, cargoCode } = params;

  // Validar y formatear
  const party = partyCode.padStart(2, '0');
  const jrv = jrvNumber.padStart(5, '0');
  const doc = docType.padStart(2, '0');
  const movement = '1'; // Siempre 1 para EG2025
  const cargo = cargoCode.padStart(2, '0');

  const plainQR = `${party}${jrv}${doc}${movement}${cargo}`;

  return encryptQRMock(plainQR);
}
