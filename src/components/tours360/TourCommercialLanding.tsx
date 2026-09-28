import React, { useState } from 'react';
import {
  Compass, Sparkles, Layers, Share2, ArrowRight,
  MapPin, Building2, Sliders, LogIn,
  Briefcase, Award, FileCheck2, Globe
} from 'lucide-react';
import { PSVEngine360 } from './PSVEngine360';
import { TourPricingSection } from './TourPricingSection';
import { PhotopeaStudioModal } from './PhotopeaStudioModal';
import { useTourSaaS } from '../../context/TourSaaSContext';

interface TourCommercialLandingProps {
  onStartBuilder: () => void;
  onOpenDashboard: () => void;
  onOpenLibrary: () => void;
  onOpenAuth: () => void;
  onRequestTurnkeyService?: () => void;
}

export const TourCommercialLanding: React.FC<TourCommercialLandingProps> = ({
  onStartBuilder,
  onOpenDashboard,
  onOpenLibrary,
  onOpenAuth,
  onRequestTurnkeyService
}) => {
  const { tours, activeTour, activeSceneId, setActiveSceneId, user, addImageToLibrary } = useTourSaaS();
  const demoTour = activeTour || tours[0];
  const currentSceneId = activeSceneId || demoTour?.scenes[0]?.id || 'sc-living';
  const currentScene = demoTour?.scenes.find((s) => s.id === currentSceneId) || demoTour?.scenes[0];
  const [isPhotopeaOpen, setIsPhotopeaOpen] = useState(false);

  const commercialVerticals = [
    {
      icon: Building2,
      tag: 'Inmobiliarias & Proyectos Nuevos',
      title: 'Salas de Venta Virtuales 24/7',
      metric: '+310% Conversión de Leads',
      desc: 'Permita que compradores e inversionistas de todo el país recorran departamentos piloto, loteos y áreas comunes con fichas técnicas en UF y contacto inmediato.'
    },
    {
      icon: Briefcase,
      tag: 'Corredoras de Propiedades',
      title: 'Pre-Calificación de Visitas Reales',
      metric: '-65% Visitas Improductivas',
      desc: 'Filtre curiosos mostrando cada propiedad en 360° antes de agendar en terreno. Reciba únicamente prospectos con intención real de compra o arriendo.'
    },
    {
      icon: FileCheck2,
      tag: 'Constructoras & Mandantes ITO',
      title: 'Reporte Técnico y Avance de Obra',
      metric: '100% Trazabilidad Visual',
      desc: 'Documente estados de pago, instalaciones y urbanizaciones con panorámicas equirrectangulares auditables a distancia por directorios e inspectores.'
    },
    {
      icon: Globe,
      tag: 'Hotelería, Turismo & Retail',
      title: 'Reservas Directas por Experiencia',
      metric: '+45% Ticket Promedio',
      desc: 'Muestre habitaciones, salones de eventos, clínicas o sucursales comerciales con calidad 8K HDR embebida directamente en su sitio web.'
    }
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Carga o Captura Equirrectangular',
      desc: 'Suba fotografías 360° desde cámaras Ricoh Theta, Insta360, drones DJI o utilice nuestra biblioteca certificada 2:1.',
      icon: Layers
    },
    {
      step: '02',
      title: 'Retoque Photopea & Magnific AI 8K',
      desc: 'Edite luz HDR, parches de trípode (Nadir) y aplique superresolución 8K directamente desde el navegador sin instalar software.',
      icon: Sliders
    },
    {
      step: '03',
      title: 'Hotspots Comerciales y Plano 2D',
      desc: 'Vincule habitaciones entre sí, agregue etiquetas de precios en UF/CLP, metrajes, especificaciones y radar de planta arquitectónica.',
      icon: MapPin
    },
    {
      step: '04',
      title: 'Publicación Comercial Multicanal',
      desc: 'Obtenga un enlace seguro en Google Cloud CDN y código iframe listo para Portal Inmobiliario, sitio web corporativo o WhatsApp.',
      icon: Share2
    }
  ];

  return (
    <div className="space-y-20 pb-16 text-slate-900">
      <section className="relative pt-8 pb-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold uppercase tracking-wider shadow-2xs">
              <Award className="w-3.5 h-3.5 text-sky-600" />
              Plataforma SaaS Comercial • Andina 360° Cloud
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Comercialice Propiedades y Proyectos con{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-emerald-600">
                Recorridos Virtuales 360°
              </span>
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              La plataforma empresarial en la nube para <strong>inmobiliarias, corredoras, constructoras y hotelería</strong>. Cree salas de venta interactivas en 8K HDR, integre fichas comerciales y cierre negocios a distancia 24/7.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {user ? (
                <button
                  onClick={onOpenDashboard}
                  className="px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  Ir a mi Centro de Control
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión / Crear Cuenta Comercial
                </button>
              )}

              <button
                onClick={onStartBuilder}
                className="px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/15 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                Abrir Tour Studio (Demo En Vivo)
              </button>

              <button
                onClick={() => setIsPhotopeaOpen(true)}
                className="px-4 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-sky-600" />
                Suite Photopea & Magnific 8K
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
              <div>
                <p className="text-2xl font-extrabold text-slate-900">+300%</p>
                <p className="text-xs text-slate-500 font-medium">Consultas Comerciales</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-sky-700">8K HDR</p>
                <p className="text-xs text-slate-500 font-medium">Calidad Equirrectangular</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-emerald-700">24/7</p>
                <p className="text-xs text-slate-500 font-medium">Sala de Ventas Online</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-2xl shadow-slate-900/10">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                      Sala de Ventas Virtual Activa
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                    {demoTour?.title || 'Piloto Inmobiliario Vista Pacífico'}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-extrabold">
                    Valor: 14.800 UF
                  </span>
                  <button
                    onClick={onStartBuilder}
                    className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Editar en Studio →
                  </button>
                </div>
              </div>

              {demoTour && (
                <div className="rounded-2xl overflow-hidden border border-slate-200">
                  <PSVEngine360
                    tour={demoTour}
                    activeSceneId={currentSceneId}
                    onSceneChange={(id) => setActiveSceneId(id)}
                    height="h-[380px] sm:h-[420px]"
                  />
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                    Recintos:
                  </span>
                  {demoTour?.scenes.map((sc) => (
                    <button
                      key={sc.id}
                      onClick={() => setActiveSceneId(sc.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        sc.id === currentSceneId
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {sc.title}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsPhotopeaOpen(true)}
                  className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Retocar esta escena en Photopea 8K
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 border border-sky-200 px-3.5 py-1.5 rounded-full">
            Enfoque Comercial y Retorno de Inversión
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-4 mb-3">
            Diseñado para Equipos Comerciales y Técnicos
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Cada módulo de Andina 360° está estructurado para reducir tiempos de venta, transparentar activos inmobiliarios y elevar el estándar de presentación corporativa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {commercialVerticals.map((v, idx) => {
            const Icon = v.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                      {v.metric}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {v.tag}
                  </p>
                  <h3 className="text-lg font-extrabold text-slate-900 mb-2">{v.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{v.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={onStartBuilder}
                    className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1.5 cursor-pointer"
                  >
                    Probar plantilla comercial <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="py-14 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full">
                Arquitectura Cloud Simplificada
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-4">
                De la Captura 360° al Cierre Comercial en 4 Pasos
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setIsPhotopeaOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2 border border-slate-300 transition-all cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-sky-600" />
                Abrir Editor Photopea Integrado
              </button>
              <button
                onClick={onOpenLibrary}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                Explorar Biblioteca 360°
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((w, idx) => {
              const Icon = w.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black text-sky-600/30 font-mono">
                        PASO {w.step}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sky-600 shadow-2xs">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 mb-2">{w.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{w.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <TourPricingSection
        onSelectPlanAction={() => {
          if (user) {
            onOpenDashboard();
          } else {
            onOpenAuth();
          }
        }}
        onRequestService={onRequestTurnkeyService}
      />

      <PhotopeaStudioModal
        isOpen={isPhotopeaOpen}
        onClose={() => setIsPhotopeaOpen(false)}
        imageUrl={currentScene?.panoramaUrl || '/panoramas/depto_living_terraza.jpg'}
        imageName={currentScene?.title || 'Escena Principal 360°'}
        onSaveEditedImage={(newUrl, newName) => {
          addImageToLibrary(newName, newUrl, 'Equirrectangular 2:1 (Photopea 8K)');
        }}
      />
    </div>
  );
};
