import React, { useState } from 'react';
import {
  Compass, FolderKanban, Image as ImageIcon, Plus, Layers,
  MapPin, ArrowRight, CheckCircle2, Crown,
  Building2, Sliders, Share2
} from 'lucide-react';
import { useTourSaaS } from '../../context/TourSaaSContext';
import { PhotopeaStudioModal } from './PhotopeaStudioModal';

interface DashboardCentralProps {
  onNavigate: (tab: 'landing' | 'dashboard' | 'mis-tours' | 'biblioteca' | 'editor' | 'planes') => void;
  onOpenAuth: () => void;
}

export const DashboardCentral: React.FC<DashboardCentralProps> = ({
  onNavigate,
  onOpenAuth
}) => {
  const { user, tours, library, setActiveTourId, createTour, addImageToLibrary } = useTourSaaS();
  const [isPhotopeaOpen, setIsPhotopeaOpen] = useState(false);

  const totalScenes = tours.reduce((acc, t) => acc + t.scenes.length, 0);
  const totalHotspots = tours.reduce(
    (acc, t) => acc + t.scenes.reduce((sAcc, s) => sAcc + s.hotspots.length, 0),
    0
  );
  const publishedTours = tours.filter((t) => t.status === 'published').length;

  const handleQuickCreateTour = () => {
    const newTour = createTour(
      `Propiedad Comercial #${tours.length + 1}`,
      'Recorrido virtual interactivo 360° para comercialización inmobiliaria y corporativa.'
    );
    setActiveTourId(newTour.id);
    onNavigate('editor');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8 text-slate-900">
      <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5 text-sky-600" />
            Centro de Control Comercial • Andina 360°
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {user ? `Bienvenido, ${user.name}` : 'Escritorio Comercial de Proyectos 360°'}
          </h1>
          <p className="text-slate-600 text-sm max-w-2xl">
            Administre su cartera de propiedades 360°, edite panorámicas equirrectangulares con Photopea & Magnific AI 8K y genere enlaces comerciales para sus clientes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!user && (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              Guardar en Cuenta Corporativa
            </button>
          )}
          <button
            onClick={() => setIsPhotopeaOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-sky-600" />
            Suite Photopea 8K
          </button>
          <button
            onClick={handleQuickCreateTour}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-sky-600/15 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nueva Propiedad 360°
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Proyectos Activos</span>
            <FolderKanban className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{tours.length}</div>
          <div className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> {publishedTours} publicados online
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Escenas 360°</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{totalScenes}</div>
          <div className="text-xs text-slate-500 mt-1">Renderizado 8K HDR activo</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Hotspots Comerciales</span>
            <MapPin className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{totalHotspots}</div>
          <div className="text-xs text-slate-500 mt-1">Navegación y fichas UF/CLP</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Biblioteca 2:1</span>
            <ImageIcon className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{library.length}</div>
          <div className="text-xs text-sky-700 font-semibold mt-1">Panorámicas listas para usar</div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
          <Compass className="w-5 h-5 text-sky-600" />
          Módulos de Gestión y Comercialización
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div
            onClick={() => onNavigate('mis-tours')}
            className="group cursor-pointer rounded-2xl bg-white border border-slate-200 hover:border-sky-500 p-6 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 mb-4">
                <FolderKanban className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1.5">
                1. Mis Propiedades 360°
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Administre su cartera de recorridos, obtenga enlaces para clientes y códigos iframe para portales inmobiliarios.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-700">
              <span>Abrir Cartera ({tours.length})</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => onNavigate('biblioteca')}
            className="group cursor-pointer rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 p-6 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1.5">
                2. Biblioteca 360° & Capturas
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Suba fotos equirrectangulares 2:1 desde su cámara 360° o dron y retóquelas con Photopea y Magnific AI.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>Gestionar Activos ({library.length})</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => onNavigate('editor')}
            className="group cursor-pointer rounded-2xl bg-white border border-slate-200 hover:border-indigo-500 p-6 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1.5">
                3. Tour Studio Visual
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Conecte habitaciones con un clic sobre la esfera 3D, agregue precios UF/CLP y configure el radar de planta.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-700">
              <span>Abrir Editor Espacial</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => onNavigate('planes')}
            className="group cursor-pointer rounded-2xl bg-white border border-slate-200 hover:border-amber-500 p-6 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4">
                <Crown className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1.5">
                4. Licencias y Captura
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Escala tu cuenta a Inmobiliaria Pro, activa marca blanca o solicita levantamiento con drones en terreno.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
              <span>Ver Licencias B2B</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Propiedades y Recorridos 360° Recientes
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Seleccione cualquier propiedad para editar sus escenas o compartir el enlace de venta con sus clientes.
            </p>
          </div>
          <button
            onClick={() => onNavigate('mis-tours')}
            className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
          >
            Ver todas las propiedades <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tours.slice(0, 3).map((tour) => (
            <div
              key={tour.id}
              className="rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden hover:border-sky-400 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="h-40 bg-slate-200 relative overflow-hidden">
                  <img
                    src={tour.scenes[0]?.panoramaUrl || '/panoramas/depto_living_terraza.jpg'}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider shadow-2xs">
                      {tour.status === 'published' ? 'Publicado' : 'Borrador'}
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-900/75 backdrop-blur-xs text-white text-[11px] font-bold">
                    {tour.scenes.length} Escenas 360°
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{tour.title}</h4>
                  <p className="text-slate-600 text-xs line-clamp-2 mt-1">{tour.description}</p>
                </div>
              </div>

              <div className="px-4 pb-4 pt-2 border-t border-slate-200/70 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setActiveTourId(tour.id);
                    onNavigate('editor');
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors text-center cursor-pointer"
                >
                  Editar en Studio
                </button>
                <button
                  onClick={() => {
                    setActiveTourId(tour.id);
                    onNavigate('mis-tours');
                  }}
                  className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-sky-600" />
                  Compartir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PhotopeaStudioModal
        isOpen={isPhotopeaOpen}
        onClose={() => setIsPhotopeaOpen(false)}
        imageUrl={library[0]?.url || '/panoramas/depto_living_terraza.jpg'}
        imageName={library[0]?.name || 'Panorámica Principal 360°'}
        onSaveEditedImage={(newUrl, newName) => {
          addImageToLibrary(newName, newUrl, 'Equirrectangular 2:1 (Photopea 8K)');
        }}
      />
    </div>
  );
};
