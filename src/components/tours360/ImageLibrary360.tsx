import React, { useState, useRef } from 'react';
import {
  Upload, Image as ImageIcon, Trash2, CheckCircle2, Plus,
  Link2, Sparkles, Compass, Sliders
} from 'lucide-react';
import { useTourSaaS, PanoramaAsset } from '../../context/TourSaaSContext';
import { PSVEngine360 } from './PSVEngine360';
import { PhotopeaStudioModal } from './PhotopeaStudioModal';

interface ImageLibrary360Props {
  onUseInActiveTour?: (asset: PanoramaAsset) => void;
}

const SAMPLE_PRESETS = [
  {
    name: 'Salón & Terraza Inmobiliaria',
    url: '/panoramas/depto_living_terraza.jpg',
    dimensions: 'Equirrectangular 2:1 (8K HDR)'
  },
  {
    name: 'Suite Principal & Hotelería',
    url: '/panoramas/depto_dormitorio.jpg',
    dimensions: 'Equirrectangular 2:1 (8K HDR)'
  },
  {
    name: 'Hall & Cocina Equipada',
    url: '/panoramas/depto_hall_cocina.jpg',
    dimensions: 'Equirrectangular 2:1 (8K HDR)'
  }
];

export const ImageLibrary360: React.FC<ImageLibrary360Props> = ({ onUseInActiveTour }) => {
  const { library, addImageToLibrary, removeImageFromLibrary, activeTour, addScene } = useTourSaaS();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [customName, setCustomName] = useState('');
  const [showUrlForm, setShowUrlForm] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<PanoramaAsset | null>(null);
  const [photopeaAsset, setPhotopeaAsset] = useState<PanoramaAsset | null>(null);
  const [addedFeedbackId, setAddedFeedbackId] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          addImageToLibrary(
            file.name.replace(/\.[^/.]+$/, ''),
            dataUrl,
            'Equirrectangular 2:1 (Local)'
          );
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAddByUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    addImageToLibrary(
      customName.trim() || 'Panorámica Cloud 360°',
      customUrl.trim(),
      'Equirrectangular 2:1 (Cloud URL)'
    );
    setCustomUrl('');
    setCustomName('');
    setShowUrlForm(false);
  };

  const handleSendToActiveTour = (asset: PanoramaAsset) => {
    if (onUseInActiveTour) {
      onUseInActiveTour(asset);
    } else if (activeTour) {
      addScene(activeTour.id, asset.name, asset.url);
    }
    setAddedFeedbackId(asset.id);
    setTimeout(() => setAddedFeedbackId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8 text-slate-900">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
            <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
            Repositorio de Panorámicas 2:1
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Biblioteca de Imágenes Equirrectangulares 360°
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Suba capturas 360° desde cámaras Insta360, Ricoh Theta o drones DJI, retóquelas con Photopea & Magnific AI 8K y agréguelas a sus propiedades.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => setShowUrlForm(!showUrlForm)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Link2 className="w-4 h-4 text-sky-600" />
            Vincular desde URL / Cloud
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/15 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Subir Foto 360° (JPG/PNG)
          </button>
        </div>
      </div>

      {showUrlForm && (
        <form
          onSubmit={handleAddByUrl}
          className="p-6 rounded-3xl bg-white border-2 border-sky-500/40 shadow-lg space-y-4"
        >
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-sky-600" />
            Vincular Panorámica Equirrectangular desde Servidor o Google Cloud Storage
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Nombre del recinto (Ej: Terraza Piso 18)"
              className="px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-600 focus:bg-white"
            />
            <input
              type="url"
              required
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://.../panorama-360.jpg"
              className="px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-600 focus:bg-white"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowUrlForm(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold cursor-pointer"
            >
              Guardar en Biblioteca
            </button>
          </div>
        </form>
      )}

      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-xs text-slate-700">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Plantillas Comerciales 360° Certificadas:</strong> Cargue panorámicas de demostración con proyección equirrectangular 2:1 perfecta.
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PRESETS.map((preset, i) => (
            <button
              key={i}
              onClick={() => addImageToLibrary(preset.name, preset.url, preset.dimensions)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              + {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {library.map((asset) => (
          <div
            key={asset.id}
            className="group rounded-3xl bg-white border border-slate-200 overflow-hidden hover:border-sky-400 transition-all flex flex-col justify-between shadow-sm hover:shadow-md"
          >
            <div>
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs border border-slate-200 text-[10px] font-bold text-sky-700 uppercase tracking-wider shadow-2xs">
                  360° Equirrectangular
                </div>
                <button
                  onClick={() => setPreviewAsset(asset)}
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-sky-600 text-slate-900 hover:text-white border border-slate-200 text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs transition-colors shadow-sm cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  Inspeccionar 360°
                </button>
              </div>

              <div className="p-5">
                <h4 className="font-extrabold text-slate-900 text-sm mb-1 truncate">
                  {asset.name}
                </h4>
                <p className="text-xs text-slate-500 font-medium">{asset.dimensions}</p>
              </div>
            </div>

            <div className="px-5 pb-5 pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSendToActiveTour(asset)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  {addedFeedbackId === asset.id ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      ¡Añadida al Tour!
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      Usar en Propiedad Activa
                    </>
                  )}
                </button>

                {library.length > 1 && (
                  <button
                    onClick={() => removeImageFromLibrary(asset.id)}
                    className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer"
                    title="Eliminar de la biblioteca"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setPhotopeaAsset(asset)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                Editar en Photopea / Magnific AI 8K
              </button>
            </div>
          </div>
        ))}
      </div>

      {previewAsset && (
        <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
                  Inspección Esférica WebGL
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">{previewAsset.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const target = previewAsset;
                    setPreviewAsset(null);
                    setPhotopeaAsset(target);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Retocar en Photopea 8K
                </button>
                <button
                  onClick={() => setPreviewAsset(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cerrar Vista
                </button>
              </div>
            </div>
            <div className="p-4 bg-slate-50">
              <PSVEngine360
                tour={{
                  id: 'preview-asset',
                  title: previewAsset.name,
                  description: previewAsset.dimensions,
                  createdAt: '',
                  status: 'published',
                  scenes: [
                    {
                      id: 'sc-preview',
                      title: previewAsset.name,
                      subtitle: previewAsset.dimensions,
                      panoramaUrl: previewAsset.url,
                      hotspots: []
                    }
                  ]
                }}
                activeSceneId="sc-preview"
                onSceneChange={() => {}}
                height="h-[65vh]"
              />
            </div>
          </div>
        </div>
      )}

      {photopeaAsset && (
        <PhotopeaStudioModal
          isOpen={!!photopeaAsset}
          onClose={() => setPhotopeaAsset(null)}
          imageUrl={photopeaAsset.url}
          imageName={photopeaAsset.name}
          onSaveEditedImage={(newUrl, newName) => {
            addImageToLibrary(newName, newUrl, 'Equirrectangular 2:1 (Photopea 8K)');
            setPhotopeaAsset(null);
          }}
        />
      )}
    </div>
  );
};
