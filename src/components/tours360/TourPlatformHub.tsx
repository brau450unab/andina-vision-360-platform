import React, { useState, useEffect } from 'react';
import {
  Compass, FolderKanban, Image as ImageIcon, Crown, LogIn, LogOut,
  User as UserIcon, Sparkles, ArrowLeft, LayoutDashboard, Building2,
  ShieldCheck, ExternalLink
} from 'lucide-react';
import { useTourSaaS } from '../../context/TourSaaSContext';
import { TourCommercialLanding } from './TourCommercialLanding';
import { DashboardCentral } from './DashboardCentral';
import { MyToursWorkspace } from './MyToursWorkspace';
import { ImageLibrary360 } from './ImageLibrary360';
import { TourEditorStudio } from './TourEditorStudio';
import { TourPricingSection } from './TourPricingSection';
import { TourPlatformAuthModal } from './TourPlatformAuthModal';

export type PlatformTab =
  | 'landing'
  | 'dashboard'
  | 'mis-tours'
  | 'biblioteca'
  | 'editor'
  | 'planes';

interface TourPlatformHubProps {
  initialTab?: PlatformTab;
  onRequestTurnkeyQuote?: () => void;
  standaloneMode?: boolean;
  agencyUrl?: string;
}

export const TourPlatformHub: React.FC<TourPlatformHubProps> = ({
  initialTab = 'landing',
  onRequestTurnkeyQuote,
  standaloneMode = false,
  agencyUrl
}) => {
  const { user, logout, setActiveTourId, tours } = useTourSaaS();
  const [activeTab, setActiveTab] = useState<PlatformTab>(initialTab);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tourIdParam = params.get('tour');
    const tabParam = params.get('tab') as PlatformTab | null;
    const loginParam = params.get('login');

    if (tourIdParam && tours.some((t) => t.id === tourIdParam)) {
      setActiveTourId(tourIdParam);
      setActiveTab('editor');
    } else if (tabParam) {
      setActiveTab(tabParam);
    }

    if (loginParam === 'true' && !user) {
      setIsAuthOpen(true);
    }
  }, []);

  const navItems: { id: PlatformTab; label: string; icon: React.ElementType }[] = [
    { id: 'landing', label: 'Inicio Comercial', icon: Sparkles },
    { id: 'planes', label: 'Planes y Licencias', icon: Crown },
    { id: 'dashboard', label: 'Centro de Control', icon: LayoutDashboard },
    { id: 'mis-tours', label: 'Mis Propiedades 360°', icon: FolderKanban },
    { id: 'biblioteca', label: 'Biblioteca 360°', icon: ImageIcon },
    { id: 'editor', label: 'Tour Studio & Photopea', icon: Compass }
  ];

  const resolvedAgencyUrl =
    agencyUrl ||
    (import.meta as any).env?.VITE_AGENCY_URL ||
    (standaloneMode ? 'https://andina-vision-landing-106335345720.us-west1.run.app' : '/');

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-sky-600 selection:text-white">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a
              href={resolvedAgencyUrl}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-xs font-bold text-slate-700 hover:text-slate-900 transition-all"
              title="Ir al portal principal de Andina Visión (Agencia Audiovisual & Drones)"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Agencia Andina Visión</span>
              {standaloneMode && <ExternalLink className="w-3 h-3 text-slate-400" />}
            </a>

            <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />

            <div
              onClick={() => setActiveTab('landing')}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-600 to-emerald-600 flex items-center justify-center text-white shadow-sm">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black tracking-tight text-slate-900">
                    ANDINA <span className="text-sky-600">360°</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-[10px] font-extrabold text-sky-700 uppercase">
                    Comercial B2B
                  </span>
                </div>
                <span className="block text-[10px] font-semibold text-slate-500">
                  Plataforma SaaS de Recorridos Virtuales
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-white text-sky-700 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <div className="w-7 h-7 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-none">{user.name}</div>
                  <div className="text-[10px] text-emerald-700 uppercase font-extrabold mt-0.5">
                    Licencia {user.plan.toUpperCase()}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                  title="Cerrar sesión corporativa"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Iniciar Sesión / Registro</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 bg-[#F8FAFC]">
        {activeTab === 'landing' && (
          <TourCommercialLanding
            onStartBuilder={() => setActiveTab('editor')}
            onOpenDashboard={() => setActiveTab('dashboard')}
            onOpenLibrary={() => setActiveTab('biblioteca')}
            onOpenAuth={() => setIsAuthOpen(true)}
            onRequestTurnkeyService={onRequestTurnkeyQuote}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardCentral
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeTab === 'mis-tours' && (
          <MyToursWorkspace
            onOpenEditor={(tourId) => {
              setActiveTourId(tourId);
              setActiveTab('editor');
            }}
          />
        )}

        {activeTab === 'biblioteca' && (
          <ImageLibrary360
            onUseInActiveTour={() => {
              setActiveTab('editor');
            }}
          />
        )}

        {activeTab === 'editor' && <TourEditorStudio />}

        {activeTab === 'planes' && (
          <div className="py-8">
            <TourPricingSection
              onSelectPlanAction={() => {
                if (user) {
                  setActiveTab('dashboard');
                } else {
                  setIsAuthOpen(true);
                }
              }}
              onRequestService={onRequestTurnkeyQuote}
            />
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-black">
              360
            </div>
            <div>
              <span className="font-bold text-slate-900">
                Andina 360° Cloud — Plataforma Comercial SaaS
              </span>
              <span className="block text-[11px] text-slate-500">
                División de Comercialización Inmobiliaria & Gemelos Digitales de Andina Visión Chile
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1 text-emerald-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Google Cloud Run Active
            </span>
            <button
              onClick={() => setActiveTab('planes')}
              className="hover:text-sky-700 transition-colors cursor-pointer"
            >
              Licencias Comerciales
            </button>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="hover:text-sky-700 transition-colors cursor-pointer"
            >
              Portal Clientes
            </button>
            <a
              href={resolvedAgencyUrl}
              className="text-sky-700 hover:text-sky-800 font-bold flex items-center gap-1"
            >
              Ir a Andina Visión Agencia ↗
            </a>
          </div>
        </div>
      </footer>

      <TourPlatformAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => setActiveTab('dashboard')}
      />
    </div>
  );
};
