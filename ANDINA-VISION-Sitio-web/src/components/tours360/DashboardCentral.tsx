import React from 'react';
import { Camera, Sliders, FolderKanban, Plus, Clock, MapPin, ChevronRight, UploadCloud } from 'lucide-react';
import { useTourSaaS } from '../../context/TourSaaSContext';

interface DashboardCentralProps {
  onNavigate: (view: 'my_tours' | 'library' | 'studio' | 'pricing') => void;
  onOpenStudio: (tourId: string) => void;
}

export const DashboardCentral: React.FC<DashboardCentralProps> = ({
  onNavigate,
  onOpenStudio
}) => {
  const { user, tours } = useTourSaaS();

  // If no user, ideally this shouldn't be rendered, but just in case
  if (!user) {
    return null;
  }

  const recentTours = tours.slice(0, 3);

  return (
    <div className="w-full min-h-screen text-white pt-10 px-6 sm:px-12 md:px-24 pb-24">
      {/* HEADER */}
      <div className="mb-12">
        <h1 className="text-3xl sm:text-5xl font-display font-black mb-2 tracking-tight">
          Bienvenido, <span className="text-emerald-400">{user.name.split(' ')[0]}</span>
        </h1>
        <p className="text-white/60 font-mono text-sm uppercase tracking-widest">
          Panel Central de Herramientas • Plan {user.planId}
        </p>
      </div>

      {/* QUICK ACTIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        
        {/* Herramienta 1: Mis Tours */}
        <button 
          onClick={() => onNavigate('my_tours')}
          className="group relative bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-emerald-500/50 transition-all duration-500 text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all text-emerald-400">
            <FolderKanban size={100} />
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 border border-emerald-500/30">
            <FolderKanban size={24} />
          </div>
          <h3 className="text-xl font-display font-bold mb-2">Mis Tours</h3>
          <p className="text-sm text-white/50 font-light mb-6">
            Gestiona y organiza todos tus recorridos virtuales.
          </p>
          <div className="flex items-center text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">
            Ver Proyectos <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Herramienta 2: Biblioteca 360 */}
        <button 
          onClick={() => onNavigate('library')}
          className="group relative bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-cyan-500/50 transition-all duration-500 text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all text-cyan-400">
            <Camera size={100} />
          </div>
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6 border border-cyan-500/30">
            <Camera size={24} />
          </div>
          <h3 className="text-xl font-display font-bold mb-2">Galería 360°</h3>
          <p className="text-sm text-white/50 font-light mb-6">
            Sube panorámicas 8K y administra tu repositorio en la nube.
          </p>
          <div className="flex items-center text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
            Abrir Biblioteca <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Herramienta 3: Studio Editor */}
        <button 
          onClick={() => onNavigate('studio')}
          className="group relative bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-500 text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all text-purple-400">
            <Sliders size={100} />
          </div>
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-6 border border-purple-500/30">
            <Sliders size={24} />
          </div>
          <h3 className="text-xl font-display font-bold mb-2">Tour Studio</h3>
          <p className="text-sm text-white/50 font-light mb-6">
            Editor avanzado para conectar nodos y agregar hotspots interactivos.
          </p>
          <div className="flex items-center text-xs font-mono text-purple-400 uppercase tracking-widest font-bold">
            Crear Nuevo <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* RECENT TOURS & STATS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Actividad Reciente */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-mono uppercase tracking-[0.2em] font-bold text-white/60">
              Tours Recientes
            </h3>
            <button 
              onClick={() => onNavigate('my_tours')}
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Ver Todos
            </button>
          </div>

          <div className="space-y-4">
            {recentTours.length > 0 ? (
              recentTours.map((tour) => (
                <div key={tour.id} className="group bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-black relative">
                      <img src={tour.thumbnailUrl} alt={tour.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                      <h4 className="text-sm font-display font-bold text-white">{tour.title}</h4>
                      <div className="flex items-center gap-3 text-[10px] font-mono text-white/40 mt-1">
                        <span className="flex items-center gap-1"><MapPin size={10}/> {tour.location}</span>
                        <span className="flex items-center gap-1"><Clock size={10}/> {tour.createdAt}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => onOpenStudio(tour.id)}
                    className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider hover:bg-emerald-500/20 transition-colors"
                  >
                    Editar
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-white/5 border border-white/10 border-dashed rounded-3xl p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-white/20">
                  <FolderKanban size={24} />
                </div>
                <h4 className="text-sm font-display font-bold text-white mb-2">Aún no hay tours</h4>
                <p className="text-xs font-mono text-white/40 mb-6 max-w-xs mx-auto">
                  Crea tu primer recorrido virtual 360° subiendo panorámicas a tu biblioteca.
                </p>
                <button 
                  onClick={() => onNavigate('studio')}
                  className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
                >
                  <Plus size={14} /> Crear Primer Tour
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Resumen de Uso */}
        <div>
          <h3 className="text-sm font-mono uppercase tracking-[0.2em] font-bold text-white/60 mb-6">
            Uso de Cuenta
          </h3>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 text-white">
              <UploadCloud size={80} />
            </div>
            
            <div className="mb-6">
              <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">
                Plan Actual
              </div>
              <div className="text-xl font-display font-bold text-emerald-400 uppercase">
                {user.planId}
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs font-mono text-white/60 mb-2">
                  <span>Panorámicas</span>
                  <span className="text-white">12 / 50</span>
                </div>
                <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 w-1/4 rounded-full" />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs font-mono text-white/60 mb-2">
                  <span>Tours Activos</span>
                  <span className="text-white">{tours.length} / 5</span>
                </div>
                <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 w-[20%] rounded-full" />
                </div>
              </div>
            </div>

            <button 
              onClick={() => onNavigate('pricing')}
              className="w-full mt-8 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-mono font-bold uppercase tracking-wider text-white transition-colors"
            >
              Mejorar Plan
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};