'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface QRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualQR, setManualQR] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isInitialized = useRef(false);

  const startScanning = async () => {
    try {
      setCameraError(null);
      setIsScanning(true);

      // Crear instancia del escáner
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader');
      }

      // Configuración del escáner
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      // Iniciar el escáner
      await scannerRef.current.start(
        { facingMode: 'environment' }, // Cámara trasera
        config,
        (decodedText) => {
          // QR detectado exitosamente
          console.log('QR detectado:', decodedText);
          stopScanning();
          onScan(decodedText);
        },
        (errorMessage) => {
          // Error de escaneo (normal mientras busca QR)
          // No mostrar estos errores al usuario
        }
      );
    } catch (err: any) {
      console.error('Error iniciando escáner:', err);
      const errorMsg = err?.message || 'No se pudo acceder a la cámara';
      setCameraError(errorMsg);
      if (onError) onError(errorMsg);
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
    } catch (err) {
      console.error('Error deteniendo escáner:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        stopScanning();
      }
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Contenedor del escáner */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
        <div id="qr-reader" className={isScanning ? 'block' : 'hidden'} />

        {/* Estado inicial - mostrar botón */}
        {!isScanning && !cameraError && (
          <div className="aspect-square flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gray-800 rounded-full flex items-center justify-center">
                <Camera className="w-10 h-10 text-gray-400" />
              </div>
              <div>
                <p className="text-white font-medium mb-2">Escanear Credencial</p>
                <p className="text-gray-400 text-sm">
                  Presiona el botón para activar la cámara
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error de cámara */}
        {cameraError && (
          <div className="aspect-square flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-red-900/20 rounded-full flex items-center justify-center">
                <X className="w-10 h-10 text-red-400" />
              </div>
              <div>
                <p className="text-white font-medium mb-2">Error de Cámara</p>
                <p className="text-gray-400 text-sm">{cameraError}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controles */}
      {!manualMode ? (
        <div className="space-y-3">
          <div className="flex gap-3">
            {!isScanning ? (
              <Button
                onClick={startScanning}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                size="lg"
                disabled={isScanning}
              >
                <Camera className="w-5 h-5 mr-2" />
                Activar Cámara
              </Button>
            ) : (
              <Button
                onClick={stopScanning}
                variant="outline"
                className="flex-1 border-gray-300 hover:bg-gray-100"
                size="lg"
              >
                <X className="w-5 h-5 mr-2" />
                Cancelar
              </Button>
            )}
          </div>

          {/* Botón para modo manual */}
          {!isScanning && (
            <Button
              onClick={() => setManualMode(true)}
              variant="outline"
              className="w-full border-gray-300 hover:bg-gray-100"
              size="sm"
            >
              <Keyboard className="w-4 h-4 mr-2" />
              Ingresar código manualmente
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="DEL-FM-001-2025"
              value={manualQR}
              onChange={(e) => setManualQR(e.target.value)}
              autoFocus
            />
            <p className="text-xs text-gray-600">
              Ingresa el código QR de tu credencial
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                if (manualQR.trim()) {
                  onScan(manualQR.trim());
                }
              }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              size="lg"
              disabled={!manualQR.trim()}
            >
              Continuar
            </Button>
            <Button
              onClick={() => {
                setManualMode(false);
                setManualQR('');
              }}
              variant="outline"
              className="border-gray-300 hover:bg-gray-100"
              size="lg"
            >
              <Camera className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Instrucciones */}
      {isScanning && (
        <div className="text-center text-sm text-gray-700">
          <p>Coloca el código QR de tu credencial dentro del marco</p>
        </div>
      )}
    </div>
  );
}
