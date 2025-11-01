'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, FileCheck, LogOut, MapPin, User } from 'lucide-react';

interface DelegateInfo {
  id: string;
  fullName: string;
  dni: string;
  phone: string;
  center: {
    id: string;
    name: string;
    code: string;
  } | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [delegate, setDelegate] = useState<DelegateInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticación
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Decodificar token (simplificado)
    try {
      const decoded = JSON.parse(atob(token));

      // Verificar expiración
      if (decoded.exp < Date.now()) {
        localStorage.removeItem('auth_token');
        router.push('/login');
        return;
      }

      // Cargar datos del delegado desde localStorage o API
      const delegateData = localStorage.getItem('delegate_info');
      if (delegateData) {
        setDelegate(JSON.parse(delegateData));
      }
    } catch (error) {
      console.error('Token inválido:', error);
      router.push('/login');
      return;
    }

    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('delegate_info');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="container max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo-libre.png"
              alt="Partido Libre"
              width={160}
              height={64}
              className="h-14 w-auto"
            />
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-black mb-1">Bienvenido, {delegate?.fullName}</h1>
              <p className="text-gray-700 text-sm">Panel de Delegado</p>
            </div>
            <Button variant="outline" onClick={handleLogout} size="sm" className="border-gray-300 hover:bg-gray-100">
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>

        {/* Delegate Info Card */}
        <Card className="mb-6 border-gray-200">
          <CardHeader className="bg-gray-50">
            <CardTitle className="flex items-center gap-2 text-black">
              <User className="w-5 h-5 text-red-600" />
              Información del Delegado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">DNI:</span>
              <span className="font-bold text-black">{delegate?.dni}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">Teléfono:</span>
              <span className="font-bold text-black">{delegate?.phone}</span>
            </div>
            {delegate?.center && (
              <>
                <div className="border-t border-gray-200 pt-3 mt-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 font-medium mb-1">Centro de Votación</p>
                      <p className="font-bold text-black">{delegate.center.name}</p>
                      <p className="text-sm text-gray-600 mt-1">Código: {delegate.center.code}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-gray-200">
            <CardHeader className="bg-gray-50">
              <CardTitle className="flex items-center gap-2 text-lg text-black">
                <Camera className="w-5 h-5 text-red-600" />
                Capturar Acta Presidencial
              </CardTitle>
              <CardDescription className="text-gray-700">
                Fotografía y digitación del acta presidencial
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                size="lg"
                onClick={() => router.push('/dashboard/capture-acta')}
              >
                Iniciar Captura
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-gray-200">
            <CardHeader className="bg-gray-50">
              <CardTitle className="flex items-center gap-2 text-lg text-black">
                <User className="w-5 h-5 text-blue-600" />
                Capturar Acta de Diputados
              </CardTitle>
              <CardDescription className="text-gray-700">
                Fotografía del acta de diputados (departamental)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
                onClick={() => router.push('/dashboard/capture-additional-acta?type=deputies')}
              >
                Iniciar Captura
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-gray-200">
            <CardHeader className="bg-gray-50">
              <CardTitle className="flex items-center gap-2 text-lg text-black">
                <MapPin className="w-5 h-5 text-green-600" />
                Capturar Acta de Alcaldes
              </CardTitle>
              <CardDescription className="text-gray-700">
                Fotografía del acta de alcaldes (municipal)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
                onClick={() => router.push('/dashboard/capture-additional-acta?type=mayors')}
              >
                Iniciar Captura
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-red-50 border-2 border-red-600 rounded-lg p-4">
          <p className="text-sm text-black">
            <strong className="text-red-600">Importante:</strong> Solo puedes capturar actas desde tu ubicación validada.
            Si cambias de ubicación, deberás iniciar sesión nuevamente.
          </p>
        </div>
      </div>
    </div>
  );
}
