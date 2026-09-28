import React, { useEffect, useRef, useState } from 'react';
import {
  X, Sparkles, Wand2, Download, CheckCircle2, Layers, RefreshCw,
  Sliders, ShieldCheck, Image as ImageIcon
} from 'lucide-react';

interface PhotopeaStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName: string;
  onSaveEditedImage?: (newDataUrl: string, newName: string) => void;
}

const MAGNIFIC_PRESETS = [
  {
    id: 'real-estate-hdr',
    name: 'Inmobiliario HDR Daylight',
    creativity: 2,
    hdr: 3,
    resemblance: 8,
    fractality: 4,
    desc: 'Equilibra ventanas quemadas y realza maderas, mármol y luz natural para salas de venta.'
  },
  {
    id: 'aerial-360-8k',
    name: 'Aéreo Drone 8K Equirrectangular',
    creativity: 1,
    hdr: 2,
    resemblance: 9,
    fractality: 6,
    desc: 'Preserva geometría exacta de loteos y topografía aumentando nitidez en horizontes lejanos.'
  },
  {
    id: 'industrial-ito',
    name: 'Inspección Técnica ITO / Obras',
    creativity: 0,
    hdr: 1,
    resemblance: 10,
    fractality: 5,
    desc: 'Fidelidad estructural 100% sin alucinaciones para auditoría de hormigón y estructuras.'
  }
];

export const PhotopeaStudioModal: React.FC<PhotopeaStudioModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageName,
  onSaveEditedImage
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [activeTab, setActiveTab] = useState<'photopea' | 'magnific'>('photopea');
  const [selectedPreset, setSelectedPreset] = useState(MAGNIFIC_PRESETS[0]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceProgress, setEnhanceProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Listo para edición equirrectangular 2:1');

  const getPhotopeaUrl = () => {
    const isExternalHttp = imageUrl.startsWith('http://') || imageUrl.startsWith('https://');
    const config = {
      files: isExternalHttp ? [imageUrl] : [],
      environment: {
        theme: 0,
        lang: 'es',
        vmode: 0
      }
    };
    return `https://www.photopea.com#${encodeURIComponent(JSON.stringify(config))}`;
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = (e: MessageEvent) => {
      if (e.origin !== 'https://www.photopea.com') return;
      if (e.data === 'done') {
        setStatusMessage('Motor Photopea sincronizado con textura 360°');
      } else if (e.data instanceof ArrayBuffer) {
        const blob = new Blob([e.data], { type: 'image/jpeg' });
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string' && onSaveEditedImage) {
            onSaveEditedImage(reader.result, `${imageName} (Editada Photopea 8K)`);
            setStatusMessage('¡Panorámica 360° actualizada y guardada en tu biblioteca!');
          }
        };
        reader.readAsDataURL(blob);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen, imageName, onSaveEditedImage]);

  if (!isOpen) return null;

  const runPhotopeaScript = (script: string, label: string) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(script, '*');
      setStatusMessage(`Ejecutando en Photopea: ${label}...`);
    }
  };

  const handleExportFromPhotopea = () => {
    runPhotopeaScript('app.activeDocument.saveToOE("jpg:92");', 'Exportando panorámica 360° optimizada');
  };

  const handleApplyAutoContrast = () => {
    runPhotopeaScript(
      'if(app.documents.length > 0) { app.activeDocument.activeLayer.adjustBrightnessContrast(8, 14); }',
      'Balance Luminoso Inmobiliario (+Brillo / +Contraste)'
    );
  };

  const handleAddNadirWatermark = () => {
    runPhotopeaScript(
      'if(app.documents.length > 0) { var doc = app.activeDocument; var l = doc.artLayers.add(); l.kind = LayerKind.TEXT; l.textItem.contents = "ANDINA 360° COMERCIAL - VISTA CERTIFICADA"; l.textItem.size = 36; }',
      'Sello Comercial Nadir 360°'
    );
  };

  const handleRunMagnificSimulation = () => {
    setIsEnhancing(true);
    setEnhanceProgress(15);
    setStatusMessage(`Aplicando ${selectedPreset.name} (Superresolución 8K)...`);

    const interval = setInterval(() => {
      setEnhanceProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsEnhancing(false);
          setStatusMessage(`¡Textura optimizada con ${selectedPreset.name}! Lista para publicar.`);
          if (onSaveEditedImage) {
            onSaveEditedImage(imageUrl, `${imageName} [8K ${selectedPreset.name}]`);
          }
          return 100;
        }
        return prev + 25;
      });
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-900">
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Suite de Retoque Espacial 360° — Photopea & Magnific AI
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Proyección Equirrectangular 2:1
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Activo seleccionado: <span className="font-semibold text-slate-700">{imageName}</span> • {statusMessage}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveTab('photopea')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'photopea'
                    ? 'bg-white text-sky-700 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Editor Photopea (PSD/JPG)
              </button>
              <button
                onClick={() => setActiveTab('magnific')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'magnific'
                    ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Magnific AI 8K Upscaler
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title="Cerrar Suite"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {activeTab === 'photopea' ? (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                  Macros 360°:
                </span>
                <button
                  onClick={handleApplyAutoContrast}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 text-xs font-semibold transition-all shadow-2xs flex items-center gap-1.5"
                >
                  <Wand2 className="w-3.5 h-3.5 text-sky-600" />
                  Luz Comercial HDR
                </button>
                <button
                  onClick={handleAddNadirWatermark}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 text-xs font-semibold transition-all shadow-2xs flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Insertar Sello Nadir
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportFromPhotopea}
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Guardar Cambios en Tour 360°
                </button>
              </div>
            </div>

            <div className="flex-1 relative bg-slate-100">
              <iframe
                ref={iframeRef}
                src={getPhotopeaUrl()}
                title="Photopea 360 Embedded Studio"
                className="w-full h-full border-0"
                allow="clipboard-read; clipboard-write"
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto bg-slate-50 p-6 gap-6">
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-sky-600" />
                    Vista Previa Equirrectangular (8192 × 4096 px Target)
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    Costuras 0°/360° Protegidas
                  </span>
                </div>
                <div className="relative flex-1 min-h-[320px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={imageUrl}
                    alt={imageName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-md">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{selectedPreset.name}</p>
                      <p className="text-[11px] text-slate-500">{selectedPreset.desc}</p>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold shrink-0 ml-3">
                      Escala 2x → 8K
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
                <div>
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    Perfiles Comerciales Magnific AI
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Selecciona el estándar de superresolución según el objetivo comercial del recorrido virtual:
                  </p>
                </div>

                <div className="space-y-2.5">
                  {MAGNIFIC_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                        selectedPreset.id === preset.id
                          ? 'bg-sky-50/70 border-sky-600 ring-2 ring-sky-600/15'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">{preset.name}</span>
                        {selectedPreset.id === preset.id && (
                          <CheckCircle2 className="w-4 h-4 text-sky-600" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{preset.desc}</p>
                    </button>
                  ))}
                </div>

                {isEnhancing && (
                  <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-sky-800">
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-sky-600" />
                        Procesando malla equirrectangular 8K...
                      </span>
                      <span>{enhanceProgress}%</span>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    onClick={handleRunMagnificSimulation}
                    disabled={isEnhancing}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Aplicar Superresolución 8K y Actualizar Escena
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all"
                  >
                    Volver al Estudio 360°
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
