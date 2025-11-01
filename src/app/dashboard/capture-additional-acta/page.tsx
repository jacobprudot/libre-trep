'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Check, AlertCircle, QrCode, Camera as CameraIcon, Users, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface AdditionalActaData {
  type: 'deputies' | 'mayors' | null;
  jrvId: string | null;
  qrData: string | null;
  photoUrl: string | null;
}

type Step = 'type' | 'jrv' | 'qr' | 'photo' | 'confirm';

const steps: Array<{ id: Step; title: string; number: number }> = [
  { id: 'type', title: 'Tipo de Acta', number: 1 },
  { id: 'jrv', title: 'Seleccionar JRV', number: 2 },
  { id: 'qr', title: 'Escanear QR', number: 3 },
  { id: 'photo', title: 'Fotografiar Acta', number: 4 },
  { id: 'confirm', title: 'Confirmar', number: 5 },
];

function CaptureAdditionalActaPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [delegate, setDelegate] = useState<DelegateInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<Step>('jrv'); // Start at jrv by default
  const [jrvs, setJrvs] = useState<Array<{ id: string; code: string; members: number }>>([]);
  const [loadingJrvs, setLoadingJrvs] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasPresidentialActa, setHasPresidentialActa] = useState(false);
  const [checkingPresidential, setCheckingPresidential] = useState(true);
  const [actaData, setActaData] = useState<AdditionalActaData>({
    type: null,
    jrvId: null,
    qrData: null,
    photoUrl: null,
  });

  useEffect(() => {
    // Obtener tipo de acta desde URL
    const typeParam = searchParams.get('type');
    if (typeParam === 'deputies' || typeParam === 'mayors') {
      setActaData((prev) => ({ ...prev, type: typeParam }));
    }

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

        // Verificar si existe acta presidencial
        checkPresidentialActa(parsedDelegate.id);

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
  }, [router, searchParams]);

  const checkPresidentialActa = async (delegateId: string) => {
    setCheckingPresidential(true);
    try {
      const response = await fetch(`/api/actas/check-presidential?delegateId=${delegateId}`);
      const data = await response.json();
      setHasPresidentialActa(data.exists);
    } catch (error) {
      console.error('Error al verificar acta presidencial:', error);
      setHasPresidentialActa(false);
    } finally {
      setCheckingPresidential(false);
    }
  };

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
    if (!actaData.jrvId || !actaData.type) {
      toast.error('Selecciona JRV y tipo de acta primero');
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', photoBlob, 'acta.jpg');
      formData.append('jrvId', actaData.jrvId);
      formData.append('type', actaData.type);

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
    if (!delegate || !actaData.type) {
      toast.error('Datos incompletos');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/actas/additional', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          delegateId: delegate.id,
          type: actaData.type,
          jrvId: actaData.jrvId,
          qrData: actaData.qrData,
          photoUrl: actaData.photoUrl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`¡Acta de ${actaData.type === 'deputies' ? 'Diputados' : 'Alcaldes'} enviada exitosamente!`);
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

  // Filter steps based on whether type is pre-selected
  const activeSteps = actaData.type ? steps.filter((s) => s.id !== 'type') : steps;
  const currentStepIndex = activeSteps.findIndex((s) => s.id === currentStep);

  const actaTypeLabel =
    actaData.type === 'deputies' ? 'Diputados' : actaData.type === 'mayors' ? 'Alcaldes' : 'Adicionales';

  const handleNext = () => {
    if (currentStepIndex < activeSteps.length - 1) {
      setCurrentStep(activeSteps[currentStepIndex + 1].id);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(activeSteps[currentStepIndex - 1].id);
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 'type':
        return actaData.type !== null;
      case 'jrv':
        return actaData.jrvId !== null;
      case 'qr':
        return actaData.qrData !== null;
      case 'photo':
        return actaData.photoUrl !== null;
      default:
        return false;
    }
  };

  if (loading || checkingPresidential) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!hasPresidentialActa) {
    return (
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="container max-w-2xl mx-auto">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            size="sm"
            className="mb-6 border-gray-300 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>

          <Card className="border-red-600">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-6 h-6" />
                Acta Presidencial Requerida
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700 mb-4">
                Debes completar el acta presidencial antes de poder capturar actas adicionales de
                Diputados o Alcaldes.
              </p>
              <Button
                onClick={() => router.push('/dashboard/capture-acta')}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                size="lg"
              >
                Capturar Acta Presidencial Primero
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-black">Captura de Acta de {actaTypeLabel}</h1>
            <p className="text-gray-700">{delegate?.fullName}</p>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {activeSteps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    index < currentStepIndex
                      ? 'bg-gray-800 text-white'
                      : index === currentStepIndex
                      ? 'bg-gray-800 text-white ring-4 ring-gray-200'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index < currentStepIndex ? <Check className="w-5 h-5" /> : index + 1}
                </div>

                <p
                  className={`mt-2 text-xs text-center font-medium ${
                    index === currentStepIndex ? 'text-gray-800' : 'text-gray-600'
                  }`}
                >
                  {step.title}
                </p>

                {index < activeSteps.length - 1 && (
                  <div
                    className={`absolute w-full h-1 top-5 left-1/2 -z-10 ${
                      index < currentStepIndex ? 'bg-gray-800' : 'bg-gray-200'
                    }`}
                    style={{
                      width: `calc(100% / ${activeSteps.length} - 2rem)`,
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
            <CardTitle className="text-black">{activeSteps[currentStepIndex].title}</CardTitle>
            <CardDescription className="text-gray-700">
              Paso {currentStepIndex + 1} de {activeSteps.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 min-h-[400px]">
            {/* Step 1: Type Selection */}
            {currentStep === 'type' && (
              <div className="space-y-6">
                <div className="bg-gray-800 bg-opacity-5 border-l-4 border-gray-800 p-4 rounded">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-gray-800 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-black font-medium">Tipo de Acta</p>
                      <p className="text-sm text-gray-700 mt-1">
                        Selecciona el tipo de acta que vas a capturar.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <Card
                    className={`cursor-pointer transition-all border-2 ${
                      actaData.type === 'deputies'
                        ? 'border-gray-800 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    onClick={() => setActaData({ ...actaData, type: 'deputies' })}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-black text-lg">Acta de Diputados</h3>
                          <p className="text-sm text-gray-600">Planilla departamental</p>
                        </div>
                        {actaData.type === 'deputies' && (
                          <Check className="w-6 h-6 text-gray-800" />
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all border-2 ${
                      actaData.type === 'mayors'
                        ? 'border-gray-800 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    onClick={() => setActaData({ ...actaData, type: 'mayors' })}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-black text-lg">Acta de Alcaldes</h3>
                          <p className="text-sm text-gray-600">Elección municipal</p>
                        </div>
                        {actaData.type === 'mayors' && (
                          <Check className="w-6 h-6 text-gray-800" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Step 2: JRV Selection */}
            {currentStep === 'jrv' && (
              <div className="space-y-6">
                <div className="bg-gray-800 bg-opacity-5 border-l-4 border-gray-800 p-4 rounded">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-gray-800 flex-shrink-0 mt-0.5" />
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
                    Selecciona la JRV
                  </Label>

                  {loadingJrvs ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
                    </div>
                  ) : jrvs.length === 0 ? (
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 text-center">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-700 font-medium">No hay JRVs disponibles</p>
                    </div>
                  ) : (
                    <>
                      <Select
                        value={actaData.jrvId || ''}
                        onValueChange={(value) => setActaData({ ...actaData, jrvId: value })}
                      >
                        <SelectTrigger id="jrv-select" className="h-12 text-base border-gray-300">
                          <SelectValue placeholder="Selecciona una JRV..." />
                        </SelectTrigger>
                        <SelectContent>
                          {jrvs.map((jrv) => (
                            <SelectItem key={jrv.id} value={jrv.id} className="text-base py-3">
                              <div className="flex flex-col">
                                <span className="font-medium text-black">{jrv.code}</span>
                                <span className="text-xs text-gray-600">{jrv.members} miembros</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <p className="text-sm text-gray-600">
                        {jrvs.length} JRV{jrvs.length !== 1 ? 's' : ''} disponible
                        {jrvs.length !== 1 ? 's' : ''}
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

            {/* Step 3: QR Scanning */}
            {currentStep === 'qr' && (
              <div className="space-y-6">
                <div className="bg-gray-800 bg-opacity-5 border-l-4 border-gray-800 p-4 rounded">
                  <div className="flex items-start gap-3">
                    <QrCode className="w-5 h-5 text-gray-800 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-black font-medium">Código QR del Acta</p>
                      <p className="text-sm text-gray-700 mt-1">
                        Escanea el código QR del acta de {actaData.type === 'deputies' ? 'Diputados' : 'Alcaldes'}
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
              </div>
            )}

            {/* Step 4: Photo Capture */}
            {currentStep === 'photo' && (
              <div className="space-y-6">
                <div className="bg-gray-800 bg-opacity-5 border-l-4 border-gray-800 p-4 rounded">
                  <div className="flex items-start gap-3">
                    <CameraIcon className="w-5 h-5 text-gray-800 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-black font-medium">Fotografía del Acta</p>
                      <p className="text-sm text-gray-700 mt-1">
                        Captura una foto clara del acta de {actaData.type === 'deputies' ? 'Diputados' : 'Alcaldes'}
                      </p>
                    </div>
                  </div>
                </div>

                {uploadingPhoto ? (
                  <div className="flex flex-col items-center justify-center py-12 bg-gray-100 rounded-lg border-2 border-gray-300">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mb-4"></div>
                    <p className="text-gray-700">Guardando foto...</p>
                  </div>
                ) : actaData.photoUrl ? (
                  <div className="space-y-4">
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <img src={actaData.photoUrl} alt="Foto del acta" className="w-full h-auto" />
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
                        Verifica que todos los datos sean correctos antes de enviar.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Type */}
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Tipo de Acta</p>
                  <p className="text-base font-bold text-black">
                    {actaData.type === 'deputies' ? 'Diputados (Departamental)' : 'Alcaldes (Municipal)'}
                  </p>
                </div>

                {/* JRV */}
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">JRV Seleccionada</p>
                  <p className="text-base font-bold text-black">
                    {jrvs.find((j) => j.id === actaData.jrvId)?.code || 'N/A'}
                  </p>
                </div>

                {/* Photo */}
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

                {/* QR */}
                {actaData.qrData && (
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Código QR:</p>
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
              className="flex-1 bg-gray-800 hover:bg-gray-900 text-white disabled:bg-gray-300 disabled:text-gray-500"
            >
              Siguiente
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-gray-800 hover:bg-gray-900 text-white disabled:bg-gray-300 disabled:text-gray-500"
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
        <div className="mt-6 bg-gray-800 bg-opacity-5 border-2 border-gray-800 rounded-lg p-4">
          <p className="text-sm text-black">
            <strong className="text-gray-800">Recordatorio:</strong> Esta acta corresponde a{' '}
            {actaData.type === 'deputies' ? 'Diputados' : 'Alcaldes'}. Asegúrate de capturar el acta correcta.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CaptureAdditionalActaPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    }>
      <CaptureAdditionalActaPageContent />
    </Suspense>
  );
}
