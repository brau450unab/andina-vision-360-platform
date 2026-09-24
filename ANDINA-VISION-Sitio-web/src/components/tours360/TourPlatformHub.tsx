import React, { useState } from 'react';
import { 
  Globe2, 
  Layers, 
  Camera, 
  Sliders, 
  Home, 
  ArrowLeft, 
  User, 
  ShieldCheck, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { TourCommercialLanding } from './TourCommercialLanding';
import { ImageLibrary360 } from './ImageLibrary360';
import { TourEditorStudio } from './TourEditorStudio';
import { TourPlatformAuthModal } from './TourPlatformAuthModal';

export type TourPlatformView = 'commercial' | 'library' | 'studio';

interface TourPlatformHubProps {
  onBackToMainSite?: () => void;
  initialView?: TourPlatformView;
}

export const TourPlatformHub: React.FC<TourPlatformHubProps> = ({
  onBackToMainSite,
  initialView = 'commercial'
}) => {
  const [currentView, setCurrentView] = useState<TourPlatformView>(initialView);
  const [userRole, setUserRole] = useState<'client' | 'admin'>('client');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const handleRoleSelection = (role: 'client' | 'admin') => {
    setUserRole(role);
    if (role === 'client') {
      setCurrentView('library');
    } else {
      setCurrentView('studio');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navbar Dedicada de la Plataforma 360 */}
      <nav className="sticky top-0 z-40 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBackToMainSite && (
            <button
              onClick={onBackToMainSite}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-mono"
              title="Volver a la landing principal de Andina Vision"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Sitio Principal</span>
            </button>
          )}

          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setCurrentView('commercial')}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <Globe2 size={18} />
            </div>
            <div>
              <span className="text-sm font-black font-display text-white tracking-wide uppercase">
                Andina 360 Cloud
              </span>
              <span className="hidden md:inline-block ml-2 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                GCP Engine
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setCurrentView('commercial')}
            className={`px-3 sm:px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              currentView === 'commercial'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Home size={14} />
            <span className="hidden sm:inline">Visión Comercial</span>
          </button>

          <button
            onClick={() => setCurrentView('library')}
            className={`px-3 sm:px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              currentView === 'library'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Camera size={14} />
            <span>Biblioteca 360</span>
          </button>

          <button
            onClick={() => setCurrentView('studio')}
            className={`px-3 sm:px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              currentView === 'studio'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sliders size={14} />
            <span>Tour Studio</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-mono flex items-center gap-2 transition-colors"
          >
            <div className={`w-2 h-2 rounded-full ${userRole === 'admin' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
            <span className="text-slate-300 hidden md:inline">Rol:</span>
            <span className="text-white font-bold uppercase">
              {userRole === 'admin' ? 'Creador Pro' : 'Cliente'}
            </span>
          </button>
        </div>
      </nav>

      <main className="flex-1">
        {currentView === 'commercial' && (
          <TourCommercialLanding 
            onNavigateToLibrary={() => setCurrentView('library')}
            onNavigateToStudio={() => setCurrentView('studio')}
          />
        )}

        {currentView === 'library' && (
          <ImageLibrary360 />
        )}

        {currentView === 'studio' && (
          <TourEditorStudio />
        )}
      </main>

      <TourPlatformAuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSelectRole={handleRoleSelection}
      />

    </div>
  );
};
