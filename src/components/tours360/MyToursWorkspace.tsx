import React, { useState } from 'react';
import {
  Plus, Compass, Eye, Edit3, Trash2, Share2, Check, Layers, MapPin,
  Search, Sparkles, Code2
} from 'lucide-react';
import { useTourSaaS, VirtualTour360 } from '../../context/TourSaaSContext';
import { PSVEngine360 } from './PSVEngine360';

interface MyToursWorkspaceProps {
  onOpenEditor: (tourId: string) => void;
}

export const MyToursWorkspace: React.FC<MyToursWorkspaceProps> = ({ onOpenEditor }) => {
  const { tours, createTour, deleteTour, setActiveTourId } = useTourSaaS();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedEmbedId, setCopiedEmbedId] = useState<string | null>(null);
  const [previewTour, setPreviewTour] = useState<VirtualTour360 | null>(null);
  const [previewSceneId, setPreviewSceneId] = useState<string>('');

  const filteredTours = tours.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const created = createTour(
      newTitle.trim(),
      newDesc.trim() || 'Recorrido virtual comercial interactivo 360°.'
    );
    setNewTitle('');
    setNewDesc('');
    setIsCreating(false);
    onOpenEditor(created.id);
  };

  const handleShare = (tour: VirtualTour360) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?tour=${tour.id}`;
    navigator.clipboard?.writeText(shareUrl);
    setCopiedId(tour.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCopyEmbed = (tour: VirtualTour360) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?tour=${tour.id}&embed=true`;
    const iframeCode = `<iframe src="${shareUrl}" width="100%" height="600" style="border:0;border-radius:16px;" allowfullscreen loading="lazy"></iframe>`;
    navigator.clipboard?.writeText(iframeCode);
    setCopiedEmbedId(tour.id);
    setTimeout(() => setCopiedEmbedId(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8 text-slate-900">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5 text-sky-600" />
            Cartera Comercial de Activos 360°
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Mis Propiedades y Recorridos 360°
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Gestione sus propiedades publicadas, comparta enlaces de venta por WhatsApp o copie el código HTML para su sitio web.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar propiedad o proyecto..."
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white w-64 transition-colors"
            />
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/15 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nueva Propiedad 360°
          </button>
        </div>
      </div>

      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-sky-500/40 shadow-xl space-y-5"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-600" />
              Registrar Nueva Propiedad o Proyecto 360°
            </h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Nombre Comercial de la Propiedad / Proyecto
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ej: Departamento Piloto Edificio Costanera - 14.500 UF"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Ficha Resumen / Características Principales
              </label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Ej: 3 Dormitorios, 2 Baños, Terraza Panorámica 145 m²"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md cursor-pointer"
            >
              Crear y Abrir en Tour Studio →
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTours.map((tour) => {
          const hotspotCount = tour.scenes.reduce((acc, s) => acc + s.hotspots.length, 0);
          return (
            <div
              key={tour.id}
              className="group rounded-3xl bg-white border border-slate-200 overflow-hidden hover:border-sky-400 transition-all flex flex-col justify-between shadow-sm hover:shadow-lg"
            >
              <div>
                <div className="relative h-52 bg-slate-100 overflow-hidden">
                  <img
                    src={tour.scenes[0]?.panoramaUrl || '/panoramas/depto_living_terraza.jpg'}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-2xs ${
                        tour.status === 'published'
                          ? 'bg-white/95 text-emerald-700 border-emerald-200'
                          : 'bg-white/95 text-amber-700 border-amber-200'
                      }`}
                    >
                      {tour.status === 'published' ? 'Publicado Online' : 'Borrador'}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-semibold">
                    <span className="flex items-center gap-1.5 bg-slate-900/75 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                      <Layers className="w-3.5 h-3.5 text-sky-400" />
                      {tour.scenes.length} Escenas
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-900/75 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      {hotspotCount} Hotspots
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-extrabold text-slate-900 mb-1.5">{tour.title}</h3>
                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">
                    {tour.description}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveTourId(tour.id);
                      onOpenEditor(tour.id);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Editar en Studio
                  </button>

                  <button
                    onClick={() => {
                      setPreviewTour(tour);
                      setPreviewSceneId(tour.scenes[0]?.id || '');
                    }}
                    className="py-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Vista Previa Interactiva 360°"
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-600" />
                    Ver 360°
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleShare(tour)}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedId === tour.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ¡Enlace Copiado!
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                        Copiar Link Comercial
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleCopyEmbed(tour)}
                    className="py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Copiar código HTML Iframe para Portal Inmobiliario o Sitio Web"
                  >
                    {copiedEmbedId === tour.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-sky-600" />
                        Iframe Listo
                      </>
                    ) : (
                      <>
                        <Code2 className="w-3.5 h-3.5 text-slate-500" />
                        Iframe
                      </>
                    )}
                  </button>

                  {tours.length > 1 && (
                    <button
                      onClick={() => deleteTour(tour.id)}
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer"
                      title="Eliminar Propiedad"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {previewTour && (
        <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-6xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Vista Cliente Final • Sala de Ventas 360°
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">{previewTour.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const id = previewTour.id;
                    setPreviewTour(null);
                    onOpenEditor(id);
                  }}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold cursor-pointer"
                >
                  Editar en Studio
                </button>
                <button
                  onClick={() => setPreviewTour(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cerrar Vista
                </button>
              </div>
            </div>
            <div className="p-4 bg-slate-50">
              <PSVEngine360
                tour={previewTour}
                activeSceneId={previewSceneId || previewTour.scenes[0]?.id}
                onSceneChange={(scId) => setPreviewSceneId(scId)}
                height="h-[70vh]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
