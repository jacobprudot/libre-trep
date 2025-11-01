'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Camera, RotateCcw, Check } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (photoUrl: string, photoBlob: Blob) => void;
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Cámara trasera en móviles
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      setError('No se pudo acceder a la cámara. Por favor verifica los permisos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Configurar el canvas con el tamaño del video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dibujar el frame actual del video en el canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir a blob
    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        // Crear URL de la imagen
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
        stopCamera();
      },
      'image/jpeg',
      0.9 // Calidad 90%
    );
  }, [stopCamera]);

  const retake = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const confirmPhoto = useCallback(() => {
    if (!capturedImage || !canvasRef.current) return;

    canvasRef.current.toBlob(
      (blob) => {
        if (!blob) return;
        onCapture(capturedImage, blob);
      },
      'image/jpeg',
      0.9
    );
  }, [capturedImage, onCapture]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border-2 border-red-600 rounded-lg p-4">
          <p className="text-sm text-black">{error}</p>
        </div>
      )}

      {!stream && !capturedImage && (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-100 rounded-lg border-2 border-gray-300">
          <Camera className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-700 mb-4">Cámara no iniciada</p>
          <Button
            onClick={startCamera}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Camera className="w-4 h-4 mr-2" />
            {isLoading ? 'Cargando...' : 'Iniciar Cámara'}
          </Button>
        </div>
      )}

      {stream && !capturedImage && (
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto"
              style={{ maxHeight: '60vh' }}
            />
          </div>

          <Button
            onClick={capturePhoto}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            size="lg"
          >
            <Camera className="w-5 h-5 mr-2" />
            Capturar Foto
          </Button>
        </div>
      )}

      {capturedImage && (
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <img
              src={capturedImage}
              alt="Foto capturada"
              className="w-full h-auto"
              style={{ maxHeight: '60vh' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={retake}
              variant="outline"
              className="border-gray-300 hover:bg-gray-100"
              size="lg"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Repetir
            </Button>
            <Button
              onClick={confirmPhoto}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              <Check className="w-4 h-4 mr-2" />
              Confirmar
            </Button>
          </div>
        </div>
      )}

      {/* Canvas oculto para procesar la imagen */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
