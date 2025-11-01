import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Camera, FileCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo-libre.png"
              alt="Partido Libre"
              width={200}
              height={80}
              priority
              className="h-20 w-auto"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-2">
            LibreTrep
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-1">
            Sistema de Conteo Rápido Electoral
          </p>
          <p className="text-sm text-gray-600">
            Partido Libre - Honduras 2025
          </p>
        </div>

        {/* Main Card */}
        <div className="max-w-md mx-auto mb-8">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Delegados Electorales</CardTitle>
              <CardDescription>
                Acceso al sistema de captura de actas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-black">Autenticación segura</p>
                    <p className="text-gray-700">Escanea tu QR + DNI + GPS</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                    <Camera className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-black">Captura de actas</p>
                    <p className="text-gray-700">Fotografía de acta presidencial</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-black">Digitación rápida</p>
                    <p className="text-gray-700">Ingresa votos de 5 partidos</p>
                  </div>
                </div>
              </div>

              {/* Login Button */}
              <Link href="/login" className="block">
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white" size="lg">
                  Iniciar Sesión
                </Button>
              </Link>

              {/* Info */}
              <div className="text-center text-xs text-gray-600 pt-2">
                <p className="mb-1">✓ Funciona sin conexión a internet</p>
                <p>✓ Sincronización automática</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="max-w-md mx-auto text-center text-sm text-gray-600 space-y-1">
          <p>Sistema PWA optimizado para dispositivos móviles</p>
          <p className="text-xs">Versión 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
