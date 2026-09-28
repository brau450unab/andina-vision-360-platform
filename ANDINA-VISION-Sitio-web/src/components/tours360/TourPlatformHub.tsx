import React, { useState, useEffect } from 'react';
import {
  Globe2,
  Camera,
  Sliders,
  Home,
  ArrowLeft,
  ChevronRight,
  FolderKanban,
  CreditCard,
} from 'lucide-react';
import { TourCommercialLanding } from './TourCommercialLanding';
import { MyToursWorkspace } from './MyToursWorkspace';
import { ImageLibrary360 } from './ImageLibrary360';
import { TourEditorStudio } from './TourEditorStudio';
import { TourPricingSection } from './TourPricingSection';
import { TourPlatformAuthModal } from './TourPlatformAuthModal';
import { TourSaaSProvider, useTourSaaS } from '../../context/TourSaaSContext';
import { DashboardCentral } from './DashboardCentral';

export type TourPlatformView = 'commercial' | 'dashboard' | 'my_tours' | 'library' | 'studio' | 'pricing';

interface TourPlatformHubProps {
  initialView?: TourPlatformView;
}

const NAV_TABS: {
  id: TourPlatformView;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}[] = [
  { id: 'commercial', label: 'Landing 360°', shortLabel: 'Inicio', icon: Home },
  { id: 'dashboard', label: 'Panel', shortLabel: 'Panel', icon: Home }, // Will hide one of these based on auth state later
  { id: 'my_tours', label: 'Mis Tours', shortLabel: 'Tours', icon: FolderKanban },
  { id: 'library', label: 'Galería 360°', shortLabel: 'Fotos', icon: Camera },
  { id: 'studio', label: 'Tour Studio', shortLabel: 'Editor', icon: Sliders },
  { id: 'pricing', label: 'Planes', shortLabel: 'Planes', icon: CreditCard },
];

import { useNavigate } from 'react-router-dom';

const TourPlatformHubInner: React.FC<TourPlatformHubProps> = ({
  initialView = 'commercial',
}) => {
  const navigate = useNavigate();
  const { user, tours, openTourInStudio } = useTourSaaS();
  const [currentView, setCurrentView] = useState<TourPlatformView>(initialView);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Protect views: if not logged in, force auth for protected views
  useEffect(() => {
    const protectedViews: TourPlatformView[] = ['dashboard', 'my_tours', 'library', 'studio'];
    if (!user && protectedViews.includes(currentView)) {
      setIsAuthModalOpen(true);
      setCurrentView('commercial'); // Fallback
    }
  }, [currentView, user]);

  // Check if URL has ?tour=<slug> or ?view=<view>
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tourSlug = params.get('tour');
    const viewParam = params.get('view') as TourPlatformView | null;
    if (tourSlug) {
      const matched = tours.find((t) => t.slug === tourSlug || t.id === tourSlug);
      if (matched) {
        openTourInStudio(matched.id);
        setCurrentView('studio');
      }
    } else if (viewParam && ['commercial', 'dashboard', 'my_tours', 'library', 'studio', 'pricing'].includes(viewParam)) {
      setCurrentView(viewParam);
    } else if (user && currentView === 'commercial') {
      setCurrentView('dashboard');
    }
  }, []);

  const handleRoleSelection = (role: 'client' | 'admin') => {
    setCurrentView('dashboard');
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
            background: 'radial-gradient(circle, rgba(16,185,129,0.16) 0%, transparent 70%)',
          }}
        />
        <div
          className="orbital-glow orbital-glow-b"
          style={{
            width: 480,
            height: 480,
            bottom: '5%',
            right: '8%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.13) 0%, transparent 70%)',
          }}
        />
        <div
          className="orbital-glow"
          style={{
            width: 300,
            height: 300,
            top: '40%',
            left: '55%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%)',
            animation: 'drift-a 28s ease-in-out infinite reverse',
          }}
        />
      </div>

      {/* ── Floating Island Nav Pill ───────────────────────── */}
      <div
        className="nav-pill flex items-center gap-1 px-1.5"
        style={{ position: 'sticky', top: '1rem', zIndex: 40, maxWidth: '96vw', overflowX: 'auto' }}
      >
        {/* Back to main site */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 pl-2.5 pr-3 py-2 rounded-full text-xs font-mono text-white/55 hover:text-white transition-all hover:bg-white/5 shrink-0 cursor-pointer"
          title="Volver al sitio principal de Andina Visión"
        >
          <ArrowLeft size={13} />
          <span className="hidden lg:inline">Agencia</span>
        </button>

        {/* Brand */}
        <button
          onClick={() => setCurrentView('commercial')}
          className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-white/5 transition-all shrink-0 cursor-pointer"
        >
          <div
            style={{
              padding: '3px',
              borderRadius: '0.625rem',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                borderRadius: '0.5rem',
                background: 'linear-gradient(135deg, #059669 0%, #0e7490 100%)',
                padding: '5px',
              }}
            >
              <Globe2 size={14} className="text-white" />
            </div>
          </div>
          <span className="hidden md:inline text-xs font-display font-bold text-white tracking-wide">
            Andina <span className="text-emerald-400">360° Cloud</span>
          </span>
        </button>

        {/* Separator */}
        <div className="w-px h-5 bg-white/10 mx-1 shrink-0" />

        {/* Tab pills */}
        {NAV_TABS.filter(tab => {
          if (!user) {
            // Logged out: show only commercial and pricing
            return tab.id === 'commercial' || tab.id === 'pricing';
          }
          // Logged in: Hide 'commercial', show everything else
          return tab.id !== 'commercial';
        }).map((tab) => {
          const Icon = tab.icon;
          const active = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={[
                'relative flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-mono transition-all whitespace-nowrap cursor-pointer',
                active
                  ? 'text-slate-950 font-bold'
                  : 'text-white/55 hover:text-white hover:bg-white/5',
              ].join(' ')}
            >
              {active && (
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                    boxShadow:
                      '0 0 16px rgba(16,185,129,0.4), inset 0 1px 1px rgba(255,255,255,0.3)',
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

        {/* Account / Auth Pill */}
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="group flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/5 transition-all shrink-0 cursor-pointer"
          title="Gestionar Cuenta o Cambiar Perfil"
        >
          <span className="relative flex h-2 w-2">
            <span
              className={[
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-60',
                user ? 'bg-emerald-400' : 'bg-amber-400',
              ].join(' ')
            }
            />
            <span
              className={[
                'relative inline-flex rounded-full h-2 w-2',
                user ? 'bg-emerald-400' : 'bg-amber-400',
              ].join(' ')
            }
            />
          </span>
          <div className="text-left hidden sm:block">
            <div className="text-[11px] font-display font-bold text-white/90 leading-none">
              {user ? user.name.split(' ')[0] : 'Iniciar Sesión'}
            </div>
            <div className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider mt-0.5">
              {user ? `Plan ${user.planId.toUpperCase()}` : 'Cuenta Gratis'}
            </div>
          </div>
          <ChevronRight
            size={11}
            className="text-white/30 group-hover:text-white/70 group-hover:translate-x-px transition-all"
          />
        </button>
      </div>

      {/* ── Main Content ───────────────────────────────────── */}
      <main className="relative" style={{ zIndex: 1 }}>
        {currentView === 'commercial' && (
          <TourCommercialLanding
            onNavigateToMyTours={() => setCurrentView('my_tours')}
            onNavigateToLibrary={() => setCurrentView('library')}
            onNavigateToStudio={() => setCurrentView('studio')}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardCentral
            onNavigate={(view) => setCurrentView(view)}
            onOpenStudio={(tourId) => {
              openTourInStudio(tourId);
              setCurrentView('studio');
            }}
          />
        )}

        {currentView === 'my_tours' && (
          <MyToursWorkspace
            onOpenEditorForTour={(tourId: string) => {
              openTourInStudio(tourId);
              setCurrentView('studio');
            }}
            onNavigateToGallery={() => setCurrentView('library')}
            onNavigateToPricing={() => setCurrentView('pricing')}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentView === 'library' && (
          <ImageLibrary360 />
        )}

        {currentView === 'studio' && (
          <TourEditorStudio />
        )}

        {currentView === 'pricing' && (
          <TourPricingSection
            onSelectTier={() => {
              if (!user) {
                setIsAuthModalOpen(true);
              } else {
                setCurrentView('my_tours');
              }
            }}
          />
        )}
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

export const TourPlatformHub: React.FC<TourPlatformHubProps> = (props) => {
  return (
    <TourSaaSProvider>
      <TourPlatformHubInner {...props} />
    </TourSaaSProvider>
  );
};