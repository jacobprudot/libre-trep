import { NextRequest, NextResponse } from 'next/server';

// Mock SMS service - En producción, usar Twilio
const SMS_CODE_STORE = new Map<string, { code: string; expiresAt: number }>();

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    // Validar teléfono
    if (!phone || !/^\d{8}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Teléfono inválido. Debe tener 8 dígitos.' },
        { status: 400 }
      );
    }

    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Guardar código (expira en 5 minutos)
    const expiresAt = Date.now() + 5 * 60 * 1000;
    SMS_CODE_STORE.set(phone, { code, expiresAt });

    // En desarrollo: mostrar código en consola
    if (process.env.TWILIO_ENABLED !== 'true') {
      console.log('📱 SMS CODE (MOCK):', phone, '→', code);

      return NextResponse.json({
        success: true,
        message: 'Código enviado (MOCK)',
        // En desarrollo, devolver el código para facilitar testing
        ...(process.env.NODE_ENV === 'development' && { mockCode: code }),
      });
    }

    // En producción: enviar SMS real con Twilio
    // const twilio = require('twilio');
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //   body: `Tu código de verificación LibreTrep es: ${code}`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: `+504${phone}`
    // });

    return NextResponse.json({
      success: true,
      message: 'Código de verificación enviado',
    });
  } catch (error: any) {
    console.error('Error enviando SMS:', error);
    return NextResponse.json(
      { error: 'Error al enviar código de verificación' },
      { status: 500 }
    );
  }
}

// Helper para verificar código (usado por /api/auth/login)
export function verifySMSCode(phone: string, code: string): boolean {
  const stored = SMS_CODE_STORE.get(phone);

  if (!stored) {
    return false;
  }

  // Verificar expiración
  if (Date.now() > stored.expiresAt) {
    SMS_CODE_STORE.delete(phone);
    return false;
  }

  // Verificar código
  if (stored.code !== code) {
    return false;
  }

  // Código válido - eliminarlo
  SMS_CODE_STORE.delete(phone);
  return true;
}
