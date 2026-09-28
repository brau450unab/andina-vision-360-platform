import React, { useState, useRef } from 'react';
import {
  Plus, MapPin, Trash2, Check, Share2, Layers, Upload,
  Edit3, Info, Navigation, Sliders
} from 'lucide-react';
import { useTourSaaS } from '../../context/TourSaaSContext';
import { PSVEngine360 } from './PSVEngine360';
import { PhotopeaStudioModal } from './PhotopeaStudioModal';

export const TourEditorStudio: React.FC = () => {
  const {
    tours,
    activeTour,
    setActiveTourId,
    activeSceneId,
    setActiveSceneId,
    library,
    addScene,
    removeScene,
    addHotspot,
    removeHotspot,
    updateTourMeta,
    addImageToLibrary
  } = useTourSaaS();

  const [isPlacingHotspot, setIsPlacingHotspot] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<{ yaw: number; pitch: number } | null>(null);
  const [hsType, setHsType] = useState<'scene' | 'info'>('scene');
  const [hsText, setHsText] = useState('');
  const [hsTargetSceneId, setHsTargetSceneId] = useState('');
  const [hsDescription, setHsDescription] = useState('');

  const [showAddSceneModal, setShowAddSceneModal] = useState(false);
  const [newSceneTitle, setNewSceneTitle] = useState('');
  const [selectedAssetUrl, setSelectedAssetUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [isPhotopeaOpen, setIsPhotopeaOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!activeTour) {
    return (
      <div className="p-12 text-center text-slate-600">
        No hay ninguna propiedad seleccionada. Crea o selecciona una desde "Mis Propiedades 360°".
      </div>
    );
  }

  const currentScene =
    activeTour.scenes.find((s) => s.id === activeSceneId) || activeTour.scenes[0];

  const handleSphereClickCoords = (yaw: number, pitch: number) => {
    setPendingCoords({ yaw, pitch });
    const otherScene = activeTour.scenes.find((s) => s.id !== currentScene?.id);
    setHsTargetSceneId(otherScene?.id || activeTour.scenes[0]?.id || '');
    setHsText(otherScene ? `Ir a ${otherScene.title}` : 'Punto Comercial');
  };

  const handleConfirmHotspot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentScene || !pendingCoords || !hsText.trim()) return;

    addHotspot(activeTour.id, currentScene.id, {
      pitch: pendingCoords.pitch,
      yaw: pendingCoords.yaw,
      type: hsType,
      text: hsText.trim(),
      targetSceneId: hsType === 'scene' ? hsTargetSceneId : undefined,
      description: hsType === 'info' ? hsDescription.trim() : undefined
    });

    setPendingCoords(null);
    setIsPlacingHotspot(false);
    setHsText('');
    setHsDescription('');
  };

  const handleCreateScene = (e: React.FormEvent) => {
    e.preventDefault();
    const urlToUse = selectedAssetUrl || library[0]?.url;
    if (!newSceneTitle.trim() || !urlToUse) return;

    addScene(activeTour.id, newSceneTitle.trim(), urlToUse);
    setNewSceneTitle('');
    setSelectedAssetUrl('');
    setShowAddSceneModal(false);
  };

  const handleDirectUploadScene = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        addImageToLibrary(cleanName, dataUrl, 'Equirrectangular 2:1 (Subida en Studio)');
        addScene(activeTour.id, cleanName, dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePublishAndCopy = () => {
    updateTourMeta(activeTour.id, activeTour.title, activeTour.description, 'published');
    const url = `${window.location.origin}${window.location.pathname}?tour=${activeTour.id}`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:px-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block">
              Propiedad Activa en Tour Studio
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              {editingTitle ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (tempTitle.trim()) {
                      updateTourMeta(activeTour.id, tempTitle.trim(), activeTour.description);
                    }
                    setEditingTitle(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    className="px-3 py-1 bg-slate-50 border border-sky-500 rounded-lg text-slate-900 text-sm font-bold"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-sky-600 text-white rounded-lg text-xs font-bold"
                  >
                    Guardar
                  </button>
                </form>
              ) : (
                <>
                  <select
                    value={activeTour.id}
                    onChange={(e) => setActiveTourId(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 font-bold text-sm focus:outline-none focus:border-sky-600"
                  >
                    {tours.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      setTempTitle(activeTour.title);
                      setEditingTitle(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900"
                    title="Renombrar propiedad"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setIsPlacingHotspot(!isPlacingHotspot);
              setPendingCoords(null);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isPlacingHotspot
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            {isPlacingHotspot
              ? 'Cancelar Modo Hotspot'
              : '+ Agregar Hotspot (Clic en 360°)'}
          </button>

          <button
            onClick={() => setIsPhotopeaOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-emerald-600" />
            Photopea & Magnific 8K
          </button>

          <button
            onClick={handlePublishAndCopy}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/15 transition-all flex items-center gap-2 cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4" />
                ¡Publicado y Link Copiado!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Publicar y Copiar Link Comercial
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-3 rounded-2xl bg-white border border-slate-200 p-4 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              Recintos / Escenas ({activeTour.scenes.length})
            </h3>

            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleDirectUploadScene}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                title="Subir foto 360° directo desde tu PC"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setSelectedAssetUrl(library[0]?.url || '');
                  setShowAddSceneModal(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Escena
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {activeTour.scenes.map((scene, index) => {
              const isSelected = scene.id === currentScene?.id;
              return (
                <div
                  key={scene.id}
                  onClick={() => setActiveSceneId(scene.id)}
                  className={`group cursor-pointer p-2.5 rounded-xl border transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'bg-sky-50/80 border-sky-500 ring-2 ring-sky-500/15'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img
                    src={scene.panoramaUrl}
                    alt={scene.title}
                    className="w-14 h-10 rounded-lg object-cover shrink-0 border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {index + 1}. {scene.title}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {scene.hotspots.length} hotspots activos
                    </div>
                  </div>
                  {activeTour.scenes.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeScene(activeTour.id, scene.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all"
                      title="Eliminar escena"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-6 space-y-4">
          {currentScene && (
            <div className="bg-white border border-slate-200 rounded-3xl p-3 shadow-sm">
              <PSVEngine360
                tour={activeTour}
                activeSceneId={currentScene.id}
                onSceneChange={(id) => setActiveSceneId(id)}
                editorMode={isPlacingHotspot}
                onSphereClick={handleSphereClickCoords}
                height="h-[540px]"
              />
            </div>
          )}

          {pendingCoords && (
            <form
              onSubmit={handleConfirmHotspot}
              className="p-5 rounded-2xl bg-white border-2 border-sky-500 shadow-xl space-y-4 animate-fadeIn"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-sky-600" />
                  Configurar Hotspot en Coordenadas (Yaw: {pendingCoords.yaw.toFixed(2)}, Pitch:{' '}
                  {pendingCoords.pitch.toFixed(2)})
                </span>
                <button
                  type="button"
                  onClick={() => setPendingCoords(null)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Tipo de Punto
                  </label>
                  <select
                    value={hsType}
                    onChange={(e) => setHsType(e.target.value as 'scene' | 'info')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold"
                  >
                    <option value="scene">Navegar a otra habitación</option>
                    <option value="info">Ficha Comercial / Precio UF</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Título Visible en el Punto
                  </label>
                  <input
                    type="text"
                    required
                    value={hsText}
                    onChange={(e) => setHsText(e.target.value)}
                    placeholder="Ej: Ir a Suite Principal / Terminaciones"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs"
                  />
                </div>

                {hsType === 'scene' ? (
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      Escena de Destino
                    </label>
                    <select
                      value={hsTargetSceneId}
                      onChange={(e) => {
                        setHsTargetSceneId(e.target.value);
                        const sc = activeTour.scenes.find((s) => s.id === e.target.value);
                        if (sc) setHsText(`Ir a ${sc.title}`);
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold"
                    >
                      {activeTour.scenes.map((sc) => (
                        <option key={sc.id} value={sc.id}>
                          {sc.title}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      Detalle Comercial / Metraje / UF
                    </label>
                    <input
                      type="text"
                      value={hsDescription}
                      onChange={(e) => setHsDescription(e.target.value)}
                      placeholder="Ej: Cubierta de cuarzo, ventanales termopanel..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  Guardar Punto Interactivo
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="lg:col-span-3 rounded-2xl bg-white border border-slate-200 p-4 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Hotspots en Escena ({currentScene?.hotspots.length || 0})
            </h3>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Para añadir un nuevo punto de navegación o ficha comercial, pulsa{' '}
            <strong className="text-sky-700">"+ Agregar Hotspot"</strong> arriba y haz clic directamente sobre cualquier punto de la imagen 360°.
          </p>

          <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
            {currentScene?.hotspots.length === 0 && (
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                Esta escena aún no tiene puntos interactivos.
              </div>
            )}

            {currentScene?.hotspots.map((hs) => (
              <div
                key={hs.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-2"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      hs.type === 'scene'
                        ? 'bg-sky-100 text-sky-700 border border-sky-200'
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {hs.type === 'scene' ? (
                      <Navigation className="w-3.5 h-3.5" />
                    ) : (
                      <Info className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{hs.text}</div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {hs.type === 'scene'
                        ? 'Enlace de Habitación'
                        : hs.description || 'Ficha Comercial'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeHotspot(activeTour.id, currentScene.id, hs.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                  title="Eliminar hotspot"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAddSceneModal && (
        <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateScene}
            className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">
                Añadir Nuevo Recinto 360° al Proyecto
              </h3>
              <button
                type="button"
                onClick={() => setShowAddSceneModal(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900"
              >
                Cerrar
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                Nombre del Recinto / Habitación
              </label>
              <input
                type="text"
                required
                value={newSceneTitle}
                onChange={(e) => setNewSceneTitle(e.target.value)}
                placeholder="Ej: Cocina Equipada / Dormitorio Principal / Vista Aérea"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                Selecciona una Panorámica de tu Biblioteca 360°
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-1">
                {library.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAssetUrl(asset.url)}
                    className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                      selectedAssetUrl === asset.url
                        ? 'border-sky-600 ring-2 ring-sky-600/20'
                        : 'border-slate-200 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={asset.url} alt={asset.name} className="w-full h-20 object-cover" />
                    <div className="p-2 bg-white text-[11px] text-slate-800 font-bold truncate">
                      {asset.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddSceneModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs cursor-pointer"
              >
                Agregar Escena al Tour
              </button>
            </div>
          </form>
        </div>
      )}

      <PhotopeaStudioModal
        isOpen={isPhotopeaOpen}
        onClose={() => setIsPhotopeaOpen(false)}
        imageUrl={currentScene?.panoramaUrl || '/panoramas/depto_living_terraza.jpg'}
        imageName={currentScene?.title || 'Escena Activa 360°'}
        onSaveEditedImage={(newUrl, newName) => {
          addImageToLibrary(newName, newUrl, 'Equirrectangular 2:1 (Photopea 8K)');
          if (currentScene) {
            addScene(activeTour.id, newName, newUrl);
          }
        }}
      />
    </div>
  );
};
