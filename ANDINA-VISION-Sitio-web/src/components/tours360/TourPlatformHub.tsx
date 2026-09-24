import React, { useState } from 'react';
import { Globe2, Camera, Sliders, Home, ArrowLeft, ChevronRight } from 'lucide-react';
import { TourCommercialLanding } from './TourCommercialLanding';
import { ImageLibrary360 } from './ImageLibrary360';
import { TourEditorStudio } from './TourEditorStudio';
import { TourPlatformAuthModal } from './TourPlatformAuthModal';

export type TourPlatformView = 'commercial' | 'library' | 'studio';

interface TourPlatformHubProps {
  onBackToMainSite?: () => void;
  initialView?: TourPlatformView;
}

const NAV_TABS: { id: TourPlatformView; label: string; shortLabel: string; icon: React.ElementType }[] = [
  { id: 'commercial', label: 'Visión Comercial', shortLabel: 'Inicio', icon: Home },
  { id: 'library',    label: 'Biblioteca 360',  shortLabel: '360°',  icon: Camera },
  { id: 'studio',     label: 'Tour Studio',      shortLabel: 'Studio', icon: Sliders },
];

export const TourPlatformHub: React.FC<TourPlatformHubProps> = ({
  onBackToMainSite,
  initialView = 'commercial'
}) => {
  const [currentView, setCurrentView] = useState<TourPlatformView>(initialView);
  const [userRole, setUserRole]       = useState<'client' | 'admin'>('client');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const handleRoleSelection = (role: 'client' | 'admin') => {
    setUserRole(role);
    setCurrentView(role === 'client' ? 'library' : 'studio');
  };

  return (
    <div className="grain-overlay relative min-h-screen text-white" style={{ background: '#050505' }}>

      {/* ── Orbital Mesh Gradient Background ──────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="orbital-glow orbital-glow-a"
          style={{
            width: 560,
            height: 560,
            top: '-12%',
            left: '15%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)',
          }}
        />
        <div
          className="orbital-glow orbital-glow-b"
          style={{
            width: 480,
            height: 480,
            bottom: '5%',
            right: '8%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 70%)',
          }}
        />
        <div
          className="orbital-glow"
          style={{
            width: 300,
            height: 300,
            top: '40%',
            left: '55%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)',
            animation: 'drift-a 28s ease-in-out infinite reverse',
          }}
        />
      </div>

      {/* ── Floating Island Nav Pill ───────────────────────── */}
      <div className="nav-pill flex items-center gap-1.5 px-1" style={{ position: 'sticky', top: '1.25rem', zIndex: 40 }}>

        {/* Back to main site */}
        {onBackToMainSite && (
          <button
            onClick={onBackToMainSite}
            className="flex items-center gap-1.5 pl-2 pr-3 py-2 rounded-full text-xs font-mono text-white/50 hover:text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/5 shrink-0"
            title="Volver al sitio principal"
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">Inicio</span>
          </button>
        )}

        {/* Brand */}
        <button
          onClick={() => setCurrentView('commercial')}
          className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-white/5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] shrink-0"
        >
          {/* Double-bezel logo mark */}
          <div className="double-bezel-outer !p-1 !rounded-xl shrink-0"
            style={{ padding: '3px', borderRadius: '0.625rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="double-bezel-inner flex items-center justify-center"
              style={{ borderRadius: '0.5rem', background: 'linear-gradient(135deg, #059669 0%, #0e7490 100%)', padding: '5px' }}>
              <Globe2 size={14} className="text-white" />
            </div>
          </div>
          <span className="hidden md:inline text-xs font-display font-bold text-white tracking-wide">
            Andina <span className="text-emerald-400">360°</span>
          </span>
        </button>

        {/* Separator */}
        <div className="w-px h-5 bg-white/10 mx-1 shrink-0" />

        {/* Tab pills */}
        {NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={[
                'relative flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-mono transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] whitespace-nowrap',
                active
                  ? 'text-slate-950 font-bold'
                  : 'text-white/50 hover:text-white hover:bg-white/5',
              ].join(' ')}
            >
              {/* Active pill fill */}
              {active && (
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                    boxShadow: '0 0 16px rgba(16,185,129,0.4), inset 0 1px 1px rgba(255,255,255,0.3)',
                  }}
                />
              )}
              <Icon size={13} className="relative z-10 shrink-0" />
              <span className="relative z-10 hidden sm:inline">{tab.label}</span>
              <span className="relative z-10 sm:hidden">{tab.shortLabel}</span>
            </button>
          );
        })}

        {/* Separator */}
        <div className="w-px h-5 bg-white/10 mx-1 shrink-0" />

        {/* Role badge */}
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="group flex items-center gap-2 px-3 py-2 rounded-full hover:bg-white/5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] shrink-0"
        >
          {/* Animated status dot */}
          <span className="relative flex h-2 w-2">
            <span
              className={[
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-60',
                userRole === 'admin' ? 'bg-emerald-400' : 'bg-cyan-400',
              ].join(' ')
            }
            />
            <span
              className={[
                'relative inline-flex rounded-full h-2 w-2',
                userRole === 'admin' ? 'bg-emerald-400' : 'bg-cyan-400',
              ].join(' ')
            }
            />
          </span>
          <span className="text-[11px] font-mono text-white/60 group-hover:text-white transition-colors duration-300 hidden sm:inline">
            {userRole === 'admin' ? 'Creador Pro' : 'Cliente'}
          </span>
          <ChevronRight size={11} className="text-white/30 group-hover:text-white/60 group-hover:translate-x-px transition-all duration-300" />
        </button>
      </div>

      {/* ── Main Content ───────────────────────────────────── */}
      <main className="relative" style={{ zIndex: 1 }}>
        {currentView === 'commercial' && (
          <TourCommercialLanding
            onNavigateToLibrary={() => setCurrentView('library')}
            onNavigateToStudio={() => setCurrentView('studio')}
          />
        )}
        {currentView === 'library' && <ImageLibrary360 />}
        {currentView === 'studio'  && <TourEditorStudio />}
      </main>

      {/* ── Auth Modal ─────────────────────────────────────── */}
      <TourPlatformAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSelectRole={handleRoleSelection}
      />
    </div>
  );
};