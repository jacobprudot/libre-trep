'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Check, AlertCircle, QrCode, Camera as CameraIcon } from 'lucide-react';
import { toast } from 'sonner';
import { QRScanner } from '@/components/qr-scanner';
import CameraCapture from '@/components/camera-capture';

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

interface ActaData {
  jrvId: string | null;
  qrData: string | null;
  photoUrl: string | null;
  votes: {
    DC: number;
    LIBRE: number;
    PINU: number;
    PLH: number;
    PNH: number;
  };
  totals: {
    totalVoters: number;
    validBallots: number;
    blankVotes: number;
    nullVotes: number;
  };
}

type Step = 'jrv' | 'qr' | 'photo' | 'digitize' | 'confirm';

const steps: Array<{ id: Step; title: string; number: number }> = [
  { id: 'jrv', title: 'Seleccionar JRV', number: 1 },
  { id: 'qr', title: 'Escanear QR', number: 2 },
  { id: 'photo', title: 'Fotografiar Acta', number: 3 },
  { id: 'digitize', title: 'Digitalizar Votos', number: 4 },
  { id: 'confirm', title: 'Confirmar', number: 5 },
];

export default function CaptureActaPage() {
  const router = useRouter();
  const [delegate, setDelegate] = useState<DelegateInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<Step>('jrv');
  const [jrvs, setJrvs] = useState<Array<{ id: string; code: string; members: number }>>([]);
  const [loadingJrvs, setLoadingJrvs] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actaData, setActaData] = useState<ActaData>({
    jrvId: null,
    qrData: null,
    photoUrl: null,
    votes: {
      DC: 0,
      LIBRE: 0,
      PINU: 0,
      PLH: 0,
      PNH: 0,
    },
    totals: {
      totalVoters: 0,
      validBallots: 0,
      blankVotes: 0,
      nullVotes: 0,
    },
  });

  useEffect(() => {
    // Verificar autenticación
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const decoded = JSON.parse(atob(token));

      // Verificar expiración
      if (decoded.exp < Date.now()) {
        localStorage.removeItem('auth_token');
        router.push('/login');
        return;
      }

      // Cargar datos del delegado
      const delegateData = localStorage.getItem('delegate_info');
      if (delegateData) {
        const parsedDelegate = JSON.parse(delegateData);
        setDelegate(parsedDelegate);

        // Cargar JRVs del centro
        if (parsedDelegate.center?.id) {
          loadJrvs(parsedDelegate.center.id);
        }
      }
    } catch (error) {
      console.error('Token inválido:', error);
      router.push('/login');
      return;
    }

    setLoading(false);
  }, [router]);

  const loadJrvs = async (centerId: string) => {
    setLoadingJrvs(true);
    try {
      const response = await fetch(`/api/jrvs?centerId=${centerId}`);
      const data = await response.json();

      if (data.success) {
        setJrvs(data.jrvs);
      } else {
        toast.error('No se pudieron cargar las JRVs');
      }
    } catch (error) {
      console.error('Error al cargar JRVs:', error);
      toast.error('Error al cargar JRVs');
    } finally {
      setLoadingJrvs(false);
    }
  };

  const handlePhotoCapture = async (photoUrl: string, photoBlob: Blob) => {
    if (!actaData.jrvId) {
      toast.error('Selecciona una JRV primero');
      return;
    }

    setUploadingPhoto(true);
    try {
      // Crear FormData para subir la imagen
      const formData = new FormData();
      formData.append('file', photoBlob, 'acta.jpg');
      formData.append('jrvId', actaData.jrvId);

      // Subir imagen al servidor
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setActaData({ ...actaData, photoUrl: data.url });
        toast.success('Foto guardada exitosamente');
      } else {
        toast.error('Error al guardar la foto');
      }
    } catch (error) {
      console.error('Error al subir foto:', error);
      toast.error('Error al subir la foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async () => {
    if (!delegate) {
      toast.error('No se encontró información del delegado');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/actas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          delegateId: delegate.id,
          jrvId: actaData.jrvId,
          qrData: actaData.qrData,
          photoUrl: actaData.photoUrl,
          votes: actaData.votes,
          totals: actaData.totals,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('¡Acta enviada exitosamente!');
        // Redirigir al dashboard después de 2 segundos
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        toast.error(data.error || 'Error al enviar el acta');
      }
    } catch (error) {
      console.error('Error al enviar acta:', error);
      toast.error('Error al enviar el acta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  const handleBack = () => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 'jrv':
        return actaData.jrvId !== null;
      case 'qr':
        return actaData.qrData !== null;
      case 'photo':
        return actaData.photoUrl !== null;
      case 'digitize':
        // Validar que la suma de votos coincida con papeletas válidas
        const totalVotes =
          actaData.votes.DC +
          actaData.votes.LIBRE +
          actaData.votes.PINU +
          actaData.votes.PLH +
          actaData.votes.PNH +
          actaData.totals.blankVotes +
          actaData.totals.nullVotes;
        return (
          actaData.totals.validBallots > 0 &&
          totalVotes === actaData.totals.validBallots
        );
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="container max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            size="sm"
            className="border-gray-300 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-black">Captura de Acta Presidencial</h1>
            <p className="text-gray-700">{delegate?.fullName}</p>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center flex-1">
                {/* Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    index < currentStepIndex
                      ? 'bg-red-600 text-white'
                      : index === currentStepIndex
                      ? 'bg-red-600 text-white ring-4 ring-red-100'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index < currentStepIndex ? <Check className="w-5 h-5" /> : step.number}
                </div>

                {/* Label */}
                <p
                  className={`mt-2 text-xs text-center font-medium ${
                    index === currentStepIndex ? 'text-red-600' : 'text-gray-600'
                  }`}
                >
                  {step.title}
                </p>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`absolute w-full h-1 top-5 left-1/2 -z-10 ${
                      index < currentStepIndex ? 'bg-red-600' : 'bg-gray-200'
                    }`}
                    style={{
                      width: `calc(100% / ${steps.length} - 2rem)`,
                      marginLeft: '1rem',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="border-gray-200">
          <CardHeader className="bg-gray-50">
            <CardTitle className="text-black">{steps[currentStepIndex].title}</CardTitle>
            <CardDescription className="text-gray-700">
              Paso {steps[currentStepIndex].number} de {steps.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 min-h-[400px]">
            {/* Step 1: JRV Selection */}
            {currentStep === 'jrv' && (
              <div className="space-y-6">
                <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-black font-medium">Centro de Votación</p>
                      <p className="text-sm text-gray-700 mt-1">
                        {delegate?.center?.name || 'No asignado'}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Código: {delegate?.center?.code || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="jrv-select" className="text-gray-900 font-medium">
                    Selecciona la JRV (Junta Receptora de Votos)
                  </Label>

                  {loadingJrvs ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                    </div>
                  ) : jrvs.length === 0 ? (
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 text-center">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-700 font-medium">No hay JRVs disponibles</p>
                      <p className="text-sm text-gray-600 mt-1">
                        No se encontraron JRVs asignadas a tu centro de votación.
                      </p>
                    </div>
                  ) : (
                    <>
                      <Select
                        value={actaData.jrvId || ''}
                        onValueChange={(value) =>
                          setActaData({ ...actaData, jrvId: value })
                        }
                      >
                        <SelectTrigger
                          id="jrv-select"
                          className="h-12 text-base border-gray-300"
                        >
                          <SelectValue placeholder="Selecciona una JRV..." />
                        </SelectTrigger>
                        <SelectContent>
                          {jrvs.map((jrv) => (
                            <SelectItem key={jrv.id} value={jrv.id} className="text-base py-3">
                              <div className="flex flex-col">
                                <span className="font-medium text-black">{jrv.code}</span>
                                <span className="text-xs text-gray-600">
                                  {jrv.members} miembros
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <p className="text-sm text-gray-600">
                        {jrvs.length} JRV{jrvs.length !== 1 ? 's' : ''} disponible{jrvs.length !== 1 ? 's' : ''} en tu centro
                      </p>
                    </>
                  )}
                </div>

                {actaData.jrvId && (
                  <div className="bg-green-50 border-2 border-green-600 rounded-lg p-4">
                    <p className="text-sm text-black">
                      <strong className="text-green-600">✓ JRV seleccionada:</strong>{' '}
                      {jrvs.find((j) => j.id === actaData.jrvId)?.code}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: QR Code Scanning */}
            {currentStep === 'qr' && (
              <div className="space-y-6">
                <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
                  <div className="flex items-start gap-3">
                    <QrCode className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-black font-medium">Código QR del Acta</p>
                      <p className="text-sm text-gray-700 mt-1">
                        Escanea el código QR impreso en el acta presidencial. Este código contiene
                        información encriptada de los votos.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                  <QRScanner
                    onScan={(qrCode) => {
                      console.log('QR escaneado:', qrCode);
                      setActaData({ ...actaData, qrData: qrCode });
                      toast.success('Código QR capturado exitosamente');
                    }}
                  />
                </div>

                {actaData.qrData && (
                  <div className="bg-green-50 border-2 border-green-600 rounded-lg p-4">
                    <p className="text-sm text-black">
                      <strong className="text-green-600">✓ QR capturado:</strong>
                    </p>
                    <p className="text-xs text-gray-700 mt-2 font-mono break-all">
                      {actaData.qrData}
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-700">
                    <strong className="text-gray-900">Nota:</strong> El código QR debe ser legible
                    y estar bien iluminado. Si tienes problemas, asegúrate de que la cámara esté
                    enfocada correctamente.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Photo Capture */}
            {currentStep === 'photo' && (
              <div className="space-y-6">
                <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
                  <div className="flex items-start gap-3">
                    <CameraIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-black font-medium">Fotografía del Acta</p>
                      <p className="text-sm text-gray-700 mt-1">
                        Captura una foto clara del acta presidencial completa. Asegúrate de que todos
                        los números sean legibles.
                      </p>
                    </div>
                  </div>
                </div>

                {uploadingPhoto ? (
                  <div className="flex flex-col items-center justify-center py-12 bg-gray-100 rounded-lg border-2 border-gray-300">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
                    <p className="text-gray-700">Guardando foto...</p>
                  </div>
                ) : actaData.photoUrl ? (
                  <div className="space-y-4">
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <img
                        src={actaData.photoUrl}
                        alt="Foto del acta"
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="bg-green-50 border-2 border-green-600 rounded-lg p-4">
                      <p className="text-sm text-black">
                        <strong className="text-green-600">✓ Foto guardada exitosamente</strong>
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 border-gray-300 hover:bg-gray-100"
                        onClick={() => setActaData({ ...actaData, photoUrl: null })}
                      >
                        Tomar otra foto
                      </Button>
                    </div>
                  </div>
                ) : (
                  <CameraCapture onCapture={handlePhotoCapture} />
                )}

                <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-700">
                    <strong className="text-gray-900">Consejos:</strong>
                  </p>
                  <ul className="list-disc list-inside text-xs text-gray-700 mt-2 space-y-1">
                    <li>Asegúrate de tener buena iluminación</li>
                    <li>El acta debe ocupar la mayor parte del encuadre</li>
                    <li>Evita sombras sobre el documento</li>
                    <li>Todos los números deben ser legibles</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 4: Vote Digitization */}
            {currentStep === 'digitize' && (
              <div className="space-y-6">
                <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-black font-medium">Digitalización de Votos</p>
                      <p className="text-sm text-gray-700 mt-1">
                        Ingresa los votos de cada partido según aparecen en el acta. Verifica que la
                        suma total sea correcta.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Votos por Partido */}
                <div className="space-y-4">
                  <h3 className="font-bold text-black text-lg">Votos por Partido</h3>

                  {/* DC */}
                  <div className="space-y-2">
                    <Label htmlFor="dc" className="text-gray-900 font-medium flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
                      1. Democracia Cristiana (DC)
                    </Label>
                    <Input
                      id="dc"
                      type="number"
                      min="0"
                      value={actaData.votes.DC}
                      onChange={(e) =>
                        setActaData({
                          ...actaData,
                          votes: { ...actaData.votes, DC: parseInt(e.target.value) || 0 },
                        })
                      }
                      className="h-12 text-lg border-gray-300"
                      placeholder="0"
                    />
                  </div>

                  {/* LIBRE */}
                  <div className="space-y-2">
                    <Label htmlFor="libre" className="text-gray-900 font-medium flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#DC2626' }}></div>
                      2. Partido Libertad y Refundación (LIBRE)
                    </Label>
                    <Input
                      id="libre"
                      type="number"
                      min="0"
                      value={actaData.votes.LIBRE}
                      onChange={(e) =>
                        setActaData({
                          ...actaData,
                          votes: { ...actaData.votes, LIBRE: parseInt(e.target.value) || 0 },
                        })
                      }
                      className="h-12 text-lg border-gray-300"
                      placeholder="0"
                    />
                  </div>

                  {/* PINU */}
                  <div className="space-y-2">
                    <Label htmlFor="pinu" className="text-gray-900 font-medium flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#16A34A' }}></div>
                      3. Partido Innovación y Unidad (PINU)
                    </Label>
                    <Input
                      id="pinu"
                      type="number"
                      min="0"
                      value={actaData.votes.PINU}
                      onChange={(e) =>
                        setActaData({
                          ...actaData,
                          votes: { ...actaData.votes, PINU: parseInt(e.target.value) || 0 },
                        })
                      }
                      className="h-12 text-lg border-gray-300"
                      placeholder="0"
                    />
                  </div>

                  {/* PLH */}
                  <div className="space-y-2">
                    <Label htmlFor="plh" className="text-gray-900 font-medium flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#EF4444' }}></div>
                      4. Partido Liberal de Honduras (PLH)
                    </Label>
                    <Input
                      id="plh"
                      type="number"
                      min="0"
                      value={actaData.votes.PLH}
                      onChange={(e) =>
                        setActaData({
                          ...actaData,
                          votes: { ...actaData.votes, PLH: parseInt(e.target.value) || 0 },
                        })
                      }
                      className="h-12 text-lg border-gray-300"
                      placeholder="0"
                    />
                  </div>

                  {/* PNH */}
                  <div className="space-y-2">
                    <Label htmlFor="pnh" className="text-gray-900 font-medium flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#1E40AF' }}></div>
                      5. Partido Nacional de Honduras (PNH)
                    </Label>
                    <Input
                      id="pnh"
                      type="number"
                      min="0"
                      value={actaData.votes.PNH}
                      onChange={(e) =>
                        setActaData({
                          ...actaData,
                          votes: { ...actaData.votes, PNH: parseInt(e.target.value) || 0 },
                        })
                      }
                      className="h-12 text-lg border-gray-300"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Totales */}
                <div className="space-y-4 pt-4 border-t-2 border-gray-300">
                  <h3 className="font-bold text-black text-lg">Totales del Acta</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalVoters" className="text-gray-900 font-medium text-sm">
                        Total Votantes
                      </Label>
                      <Input
                        id="totalVoters"
                        type="number"
                        min="0"
                        value={actaData.totals.totalVoters}
                        onChange={(e) =>
                          setActaData({
                            ...actaData,
                            totals: {
                              ...actaData.totals,
                              totalVoters: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="h-12 text-base border-gray-300"
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="validBallots" className="text-gray-900 font-medium text-sm">
                        Papeletas Válidas
                      </Label>
                      <Input
                        id="validBallots"
                        type="number"
                        min="0"
                        value={actaData.totals.validBallots}
                        onChange={(e) =>
                          setActaData({
                            ...actaData,
                            totals: {
                              ...actaData.totals,
                              validBallots: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="h-12 text-base border-gray-300"
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="blankVotes" className="text-gray-900 font-medium text-sm">
                        Votos en Blanco
                      </Label>
                      <Input
                        id="blankVotes"
                        type="number"
                        min="0"
                        value={actaData.totals.blankVotes}
                        onChange={(e) =>
                          setActaData({
                            ...actaData,
                            totals: {
                              ...actaData.totals,
                              blankVotes: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="h-12 text-base border-gray-300"
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nullVotes" className="text-gray-900 font-medium text-sm">
                        Votos Nulos
                      </Label>
                      <Input
                        id="nullVotes"
                        type="number"
                        min="0"
                        value={actaData.totals.nullVotes}
                        onChange={(e) =>
                          setActaData({
                            ...actaData,
                            totals: {
                              ...actaData.totals,
                              nullVotes: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="h-12 text-base border-gray-300"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Validación Matemática */}
                <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
                  <p className="text-sm font-bold text-gray-900 mb-2">Validación:</p>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p>
                      Suma de votos:{' '}
                      <strong className="text-black">
                        {actaData.votes.DC +
                          actaData.votes.LIBRE +
                          actaData.votes.PINU +
                          actaData.votes.PLH +
                          actaData.votes.PNH +
                          actaData.totals.blankVotes +
                          actaData.totals.nullVotes}
                      </strong>
                    </p>
                    <p>
                      Papeletas válidas: <strong className="text-black">{actaData.totals.validBallots}</strong>
                    </p>
                    {actaData.votes.DC +
                      actaData.votes.LIBRE +
                      actaData.votes.PINU +
                      actaData.votes.PLH +
                      actaData.votes.PNH +
                      actaData.totals.blankVotes +
                      actaData.totals.nullVotes ===
                    actaData.totals.validBallots &&
                    actaData.totals.validBallots > 0 ? (
                      <p className="text-green-600 font-bold">✓ Los números coinciden</p>
                    ) : (
                      <p className="text-red-600 font-bold">
                        ✗ Los números no coinciden. Verifica la digitación.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Confirmation */}
            {currentStep === 'confirm' && (
              <div className="space-y-6">
                <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-black font-medium">Revisión Final</p>
                      <p className="text-sm text-gray-700 mt-1">
                        Verifica que todos los datos sean correctos antes de enviar el acta.
                      </p>
                    </div>
                  </div>
                </div>

                {/* JRV Info */}
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">JRV Seleccionada</p>
                  <p className="text-base font-bold text-black">
                    {jrvs.find((j) => j.id === actaData.jrvId)?.code || 'N/A'}
                  </p>
                </div>

                {/* Photo Preview */}
                {actaData.photoUrl && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900">Foto del Acta:</p>
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <img
                        src={actaData.photoUrl}
                        alt="Foto del acta"
                        className="w-full h-auto"
                        style={{ maxHeight: '300px', objectFit: 'contain' }}
                      />
                    </div>
                  </div>
                )}

                {/* Votes Summary */}
                <div className="space-y-3">
                  <p className="text-sm font-bold text-gray-900">Votos por Partido:</p>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
                        <span className="text-sm text-gray-700">DC</span>
                      </div>
                      <span className="text-base font-bold text-black">{actaData.votes.DC}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: '#DC2626' }}></div>
                        <span className="text-sm text-gray-700">LIBRE</span>
                      </div>
                      <span className="text-base font-bold text-black">{actaData.votes.LIBRE}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: '#16A34A' }}></div>
                        <span className="text-sm text-gray-700">PINU</span>
                      </div>
                      <span className="text-base font-bold text-black">{actaData.votes.PINU}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: '#EF4444' }}></div>
                        <span className="text-sm text-gray-700">PLH</span>
                      </div>
                      <span className="text-base font-bold text-black">{actaData.votes.PLH}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: '#1E40AF' }}></div>
                        <span className="text-sm text-gray-700">PNH</span>
                      </div>
                      <span className="text-base font-bold text-black">{actaData.votes.PNH}</span>
                    </div>
                  </div>
                </div>

                {/* Totals Summary */}
                <div className="space-y-3 pt-4 border-t-2 border-gray-300">
                  <p className="text-sm font-bold text-gray-900">Totales:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-600">Total Votantes</p>
                      <p className="text-lg font-bold text-black">{actaData.totals.totalVoters}</p>
                    </div>
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-600">Papeletas Válidas</p>
                      <p className="text-lg font-bold text-black">{actaData.totals.validBallots}</p>
                    </div>
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-600">Votos en Blanco</p>
                      <p className="text-lg font-bold text-black">{actaData.totals.blankVotes}</p>
                    </div>
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-600">Votos Nulos</p>
                      <p className="text-lg font-bold text-black">{actaData.totals.nullVotes}</p>
                    </div>
                  </div>
                </div>

                {/* QR Code (if captured) */}
                {actaData.qrData && (
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Código QR del Acta:</p>
                    <p className="text-xs text-gray-700 font-mono break-all">{actaData.qrData}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className="flex-1 border-gray-300 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          {currentStep !== 'confirm' ? (
            <Button
              onClick={handleNext}
              disabled={!canGoNext()}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-300 disabled:text-gray-500"
            >
              Siguiente
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-300 disabled:text-gray-500"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Enviar Acta
                </>
              )}
            </Button>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-red-50 border-2 border-red-600 rounded-lg p-4">
          <p className="text-sm text-black">
            <strong className="text-red-600">Importante:</strong> Asegúrate de completar cada paso
            correctamente. Toda la información será guardada para auditoría.
          </p>
        </div>
      </div>
    </div>
  );
}
