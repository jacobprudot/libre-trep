'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { QRScanner } from '@/components/qr-scanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2, MapPin, Phone, QrCode } from 'lucide-react';
import { toast } from 'sonner';

type Step = 'qr' | 'dni' | 'phone' | 'gps' | 'verifying';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('qr');
  const [loading, setLoading] = useState(false);

  // Form data
  const [qrCode, setQrCode] = useState('');
  const [dni, setDni] = useState('');
  const [phone, setPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Paso 1: QR Scanner
  const handleQRScan = (result: string) => {
    console.log('QR escaneado:', result);
    setQrCode(result);
    toast.success('QR escaneado correctamente');
    setStep('dni');
  };

  // Paso 2: DNI Input
  const handleDNISubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar DNI (13 dígitos)
    const cleanDNI = dni.replace(/\D/g, '');
    if (cleanDNI.length !== 13) {
      toast.error('El DNI debe tener 13 dígitos');
      return;
    }

    setDni(cleanDNI);
    toast.success('DNI validado');
    setStep('phone');
  };

  // Paso 3: Phone Verification
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar teléfono (8 dígitos)
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 8) {
      toast.error('El teléfono debe tener 8 dígitos');
      return;
    }

    setLoading(true);
    try {
      // Enviar SMS de verificación
      const response = await fetch('/api/auth/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      if (!response.ok) throw new Error('Error enviando SMS');

      toast.success('Código de verificación enviado');
      setPhone(cleanPhone);
      setStep('gps');
    } catch (error) {
      toast.error('Error al enviar código de verificación');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Paso 4: GPS Validation
  const handleGPSCapture = () => {
    setLoading(true);
    toast.info('Obteniendo ubicación...');

    if (!navigator.geolocation) {
      toast.error('Tu dispositivo no soporta GPS');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setLocation(coords);
        toast.success('Ubicación capturada');

        // Proceder con el login
        await handleLogin(coords);
      },
      (error) => {
        console.error('Error GPS:', error);
        toast.error('No se pudo obtener la ubicación. Por favor, activa el GPS.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Login final
  const handleLogin = async (coords: { latitude: number; longitude: number }) => {
    setStep('verifying');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCode,
          dni,
          phone,
          smsCode,
          latitude: coords.latitude,
          longitude: coords.longitude,
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la autenticación');
      }

      // Login exitoso
      toast.success('Autenticación exitosa');

      // Guardar token y datos del delegado
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      if (data.delegate) {
        localStorage.setItem('delegate_info', JSON.stringify(data.delegate));
      }

      // Redirigir al dashboard del delegado
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error en login:', error);
      toast.error(error.message || 'Error en la autenticación');
      setStep('qr'); // Reiniciar flujo
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="container max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo-libre.png"
              alt="Partido Libre"
              width={180}
              height={72}
              priority
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-black mb-1">LibreTrep</h1>
          <p className="text-gray-700">Verificación de Delegados</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8 px-4">
          <StepIndicator active={step === 'qr'} completed={['dni', 'phone', 'gps', 'verifying'].includes(step)} icon={QrCode} label="QR" />
          <StepIndicator active={step === 'dni'} completed={['phone', 'gps', 'verifying'].includes(step)} icon={CheckCircle2} label="DNI" />
          <StepIndicator active={step === 'phone'} completed={['gps', 'verifying'].includes(step)} icon={Phone} label="SMS" />
          <StepIndicator active={step === 'gps'} completed={['verifying'].includes(step)} icon={MapPin} label="GPS" />
        </div>

        {/* Main Card */}
        <Card className="shadow-lg border-gray-200">
          <CardHeader className="bg-gray-50">
            <CardTitle className="text-black">
              {step === 'qr' && 'Paso 1: Escanear Credencial'}
              {step === 'dni' && 'Paso 2: Ingresa tu DNI'}
              {step === 'phone' && 'Paso 3: Verificación Telefónica'}
              {step === 'gps' && 'Paso 4: Validación de Ubicación'}
              {step === 'verifying' && 'Verificando...'}
            </CardTitle>
            <CardDescription className="text-gray-700">
              {step === 'qr' && 'Escanea el código QR de tu credencial de delegado'}
              {step === 'dni' && 'Ingresa tu número de DNI (13 dígitos)'}
              {step === 'phone' && 'Te enviaremos un código de verificación'}
              {step === 'gps' && 'Validaremos que estés en tu centro de votación'}
              {step === 'verifying' && 'Verificando tus credenciales...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* PASO 1: QR Scanner */}
            {step === 'qr' && (
              <QRScanner
                onScan={handleQRScan}
                onError={(error) => toast.error(error)}
              />
            )}

            {/* PASO 2: DNI Input */}
            {step === 'dni' && (
              <form onSubmit={handleDNISubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dni">Número de DNI</Label>
                  <Input
                    id="dni"
                    type="text"
                    placeholder="0801-1990-12345"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    maxLength={17}
                    required
                    autoFocus
                  />
                  <p className="text-xs text-gray-600">
                    Ingresa tu DNI con o sin guiones (13 dígitos)
                  </p>
                </div>
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" size="lg">
                  Continuar
                </Button>
              </form>
            )}

            {/* PASO 3: Phone Input */}
            {step === 'phone' && (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Número de Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="98765432"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={8}
                    required
                    autoFocus
                  />
                  <p className="text-xs text-gray-600">
                    8 dígitos sin guiones ni espacios
                  </p>
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" size="lg" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enviar Código
                </Button>
              </form>
            )}

            {/* PASO 4: GPS Capture */}
            {step === 'gps' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-black mb-1">
                        Validación de Ubicación
                      </p>
                      <p className="text-gray-700">
                        Necesitamos verificar que estés en tu centro de votación asignado (máximo 50km de distancia).
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleGPSCapture}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <MapPin className="mr-2 h-4 w-4" />
                  Capturar Ubicación
                </Button>
              </div>
            )}

            {/* PASO 5: Verifying */}
            {step === 'verifying' && (
              <div className="py-8 text-center">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-red-600" />
                <p className="text-gray-700">Verificando credenciales...</p>
                <p className="text-sm text-gray-600 mt-2">Por favor espera</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-600">
          <p>Sistema seguro con verificación en múltiples pasos</p>
        </div>
      </div>
    </div>
  );
}

// Step Indicator Component
function StepIndicator({
  active,
  completed,
  icon: Icon,
  label,
}: {
  active: boolean;
  completed: boolean;
  icon: any;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          completed
            ? 'bg-green-600 text-white'
            : active
            ? 'bg-green-600 text-white'
            : 'bg-gray-200 text-gray-400'
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <span
        className={`text-xs font-medium ${
          active || completed ? 'text-black' : 'text-gray-500'
        }`}
      >
        {label}
      </span>
    </div>
  );
}
