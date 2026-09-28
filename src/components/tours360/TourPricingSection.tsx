import React from 'react';
import {
  Check, Sparkles, Building2, Rocket, ShieldCheck, ArrowRight,
  Camera, Award, PhoneCall
} from 'lucide-react';
import { useTourSaaS } from '../../context/TourSaaSContext';

interface TourPricingSectionProps {
  onSelectPlanAction: () => void;
  onRequestService?: () => void;
}

export const TourPricingSection: React.FC<TourPricingSectionProps> = ({
  onSelectPlanAction,
  onRequestService
}) => {
  const { user, upgradePlan } = useTourSaaS();

  const plans = [
    {
      id: 'free' as const,
      name: 'Licencia Inicial / Corredor',
      badge: 'Evaluación Comercial',
      price: '$0',
      period: 'CLP / siempre',
      desc: 'Ideal para corredores independientes o arquitectos que desean publicar su primera propiedad piloto en 360°.',
      icon: Rocket,
      accent: 'slate',
      features: [
        '1 Proyecto Inmobiliario 360° activo',
        'Hasta 3 escenas equirrectangulares por tour',
        'Hotspots de navegación y fichas comerciales',
        'Acceso básico a Editor Photopea embebido',
        'Enlace público compartible por WhatsApp'
      ],
      cta: 'Comenzar Licencia Gratuita'
    },
    {
      id: 'pro' as const,
      name: 'Inmobiliaria & Corredora Pro',
      badge: 'Más Contratado B2B',
      price: '$29.990',
      period: 'CLP + IVA / mes',
      desc: 'Diseñado para corredoras de propiedades, salas de venta digitales, hoteles y comercios en etapa de comercialización.',
      icon: Sparkles,
      accent: 'sky',
      popular: true,
      features: [
        'Hasta 15 Propiedades o Tours 360° activos',
        'Escenas ilimitadas en ultra-definición 8K HDR',
        'Suite completa Photopea + Magnific AI 8K Upscaler',
        'Plano de planta 2D interactivo con radar de orientación',
        'Marca blanca comercial (Logo de su Inmobiliaria)',
        'Código de inserción (iframe) para Portal Inmobiliario y Web'
      ],
      cta: 'Activar Plan Profesional'
    },
    {
      id: 'enterprise' as const,
      name: 'Constructora & Corporativo ITO',
      badge: 'Escala Empresarial',
      price: '$79.990',
      period: 'CLP + IVA / mes',
      desc: 'Para constructoras, proyectos de loteos, minería y cadenas hoteleras con múltiples obras y auditoría técnica.',
      icon: Building2,
      accent: 'emerald',
      features: [
        'Proyectos y Recorridos 360° Ilimitados',
        'Comparador cronológico de avance de obras (ITO)',
        'Integración prioritaria con vuelos de Drone 360°',
        'Dominio personalizado y CDN Google Cloud dedicado',
        'Soporte técnico prioritario y capacitación de equipo',
        'Exportación de reportes ejecutivos y respaldos JSON'
      ],
      cta: 'Contratar Licencia Corporativa'
    }
  ];

  const handlePlanClick = (planId: 'free' | 'pro' | 'enterprise') => {
    if (user) {
      upgradePlan(planId);
    }
    onSelectPlanAction();
  };

  return (
    <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto text-slate-900">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider mb-4">
          <Award className="w-3.5 h-3.5 text-sky-600" />
          Licenciamiento SaaS & Comercialización 360°
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          Planes Formales para Acelerar sus Ventas
        </h2>
        <p className="text-slate-600 text-base leading-relaxed">
          Seleccione la modalidad que mejor se adapte a su cartera de propiedades o proyectos. Puede autogestionar sus recorridos en la plataforma o solicitar captura llave en mano en terreno.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-14">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = user?.plan === plan.id;
          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all bg-white ${
                plan.popular
                  ? 'border-2 border-sky-600 shadow-xl shadow-sky-900/10 ring-4 ring-sky-600/10'
                  : 'border border-slate-200 shadow-md shadow-slate-900/5 hover:border-slate-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-sky-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
                  Recomendado Comercialización B2B
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-5">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      plan.popular
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : plan.id === 'enterprise'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {plan.badge}
                  </span>
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      plan.popular
                        ? 'bg-sky-50 border-sky-200 text-sky-600'
                        : plan.id === 'enterprise'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-6">{plan.desc}</p>

                <div className="mb-6 pb-6 border-b border-slate-200">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                    <span className="text-xs text-slate-500 font-semibold">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <Check
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          plan.popular ? 'text-sky-600' : 'text-emerald-600'
                        }`}
                      />
                      <span className="font-medium">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handlePlanClick(plan.id)}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isCurrent
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                    : plan.popular
                    ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20'
                    : plan.id === 'enterprise'
                    ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300'
                }`}
              >
                {isCurrent ? 'Plan Activo en su Cuenta' : plan.cta}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white p-8 sm:p-10 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold uppercase tracking-wider">
            <Camera className="w-3.5 h-3.5" /> Servicio Llave en Mano en Terreno
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            ¿No cuenta con cámara 360° ni drones propios?
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Nuestro equipo técnico de <strong>Andina Visión</strong> realiza el levantamiento fotogramétrico y aéreo 360° en terreno (Iquique, Tarapacá y Norte Grande), entregándole el tour armado, retocado en 8K y listo para vender desde <strong>$120.000 CLP</strong> por propiedad.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full lg:w-auto">
          {onRequestService ? (
            <button
              onClick={onRequestService}
              className="px-6 py-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-sky-600" />
              Cotizar Levantamiento en Terreno
            </button>
          ) : (
            <a
              href="https://wa.me/56962004622?text=Hola%20Andina%20360,%20deseo%20cotizar%20un%20levantamiento%20de%20Tour%20Virtual%20360%20comercial."
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              Solicitar Captura por WhatsApp
            </a>
          )}
        </div>
      </div>
    </section>
  );
};
