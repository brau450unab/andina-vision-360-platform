/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Check, 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  Linkedin, 
  MessageCircle, 
  Calendar, 
  CheckCircle2, 
  DollarSign,
  Lock,
  Edit3,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { cn } from './lib/utils';
import { BRAND } from './constants';
import { SiteProvider, useSiteConfig } from './context/SiteContext';
import { AdminBar } from './components/admin/AdminBar';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboardModal } from './components/admin/AdminDashboardModal';
import { NavbarWithDropdowns } from './components/NavbarWithDropdowns';
import { HeroCarousel } from './components/HeroCarousel';
import { StickyPillarsBar, PillarKey } from './components/StickyPillarsBar';
import { DynamicPillarSection } from './components/DynamicPillarSection';
import { EnhancedVideoModal, VideoModalDetails } from './components/EnhancedVideoModal';
import { TourPlatformHub } from './components/tours360/TourPlatformHub';

// --- Section: Tarifas & Packs Dinámicos con Arquitectura Double-Bezel ---
const PricingAndPacks = ({ preselectedCategory = 'cine' }: { preselectedCategory?: 'cine' | 'tours360' | 'industrial' }) => {
  const { config, isVisualEditMode, setIsDashboardOpen } = useSiteConfig();
  const [activeTab, setActiveTab] = useState<'cine' | 'tours360' | 'industrial'>(preselectedCategory);

  const filteredPlans = config.plans.filter(p => p.category === activeTab);

  return (
    <section id="tarifas" className="py-28 px-4 sm:px-8 md:px-12 bg-bg/80 relative border-t border-outline/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold tracking-widest uppercase mb-4 shadow-lg backdrop-blur-md">
            <DollarSign size={14} />
            <span>TRANSPARENCIA TOTAL & VALOR ASEGURADO</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-black text-on-surface tracking-tight uppercase mb-4">
            Tarifas y Packs Mensuales
          </h2>
          <p className="text-on-surface-variant text-sm font-light leading-relaxed">
            Planes flexibles adaptados a cada industria: suscripciones mensuales con contenido constante o proyectos únicos con entrega de alta definición.
          </p>

          <div className="inline-flex p-1.5 rounded-2xl bg-surface-container border border-outline/30 mt-8 gap-2 flex-wrap justify-center backdrop-blur-md">
            <button
              onClick={() => setActiveTab('cine')}
              className={cn(
                "px-5 py-2.5 rounded-xl font-display text-xs font-bold uppercase tracking-wider transition-all",
                activeTab === 'cine' ? "bg-cinema-cyan text-bg shadow-md font-black" : "text-on-surface-variant hover:text-white"
              )}
            >
              Cine & Marketing Dron
            </button>
            <button
              onClick={() => setActiveTab('tours360')}
              className={cn(
                "px-5 py-2.5 rounded-xl font-display text-xs font-bold uppercase tracking-wider transition-all",
                activeTab === 'tours360' ? "bg-emerald-green text-black shadow-md font-black" : "text-on-surface-variant hover:text-white"
              )}
            >
              Tours 360° + Plataforma
            </button>
            <button
              onClick={() => setActiveTab('industrial')}
              className={cn(
                "px-5 py-2.5 rounded-xl font-display text-xs font-bold uppercase tracking-wider transition-all",
                activeTab === 'industrial' ? "bg-industrial-red text-white shadow-md font-black" : "text-on-surface-variant hover:text-white"
              )}
            >
              Servicios Industriales & Minería
            </button>
          </div>

          {isVisualEditMode && (
            <div className="mt-4">
              <button
                onClick={() => setIsDashboardOpen(true)}
                className="text-xs font-mono text-secondary hover:underline font-bold"
              >
                ⚙️ Editar, agregar o modificar tarifas en el Panel Administrador
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredPlans.map((plan) => (
            <div 
              key={plan.id}
              className={cn(
                "double-bezel-outer transition-all duration-500",
                plan.featured 
                  ? "ring-1 ring-primary/50 shadow-[0_25px_60px_rgba(164,201,255,0.2)] scale-105 z-10" 
                  : "hover:ring-white/20"
              )}
            >
              <div className="double-bezel-inner p-8 flex flex-col justify-between h-full bg-surface-container/90 relative">
                {plan.badge && (
                  <div className="absolute top-4 right-6 px-3 py-1 rounded-full bg-primary text-bg font-mono font-bold text-[10px] uppercase tracking-wider shadow">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-mono uppercase text-on-surface-variant tracking-widest block mb-1">
                    {plan.type === 'monthly' ? 'Suscripción Mensual' : 'Contrato por Proyecto'}
                  </span>
                  <h3 className="text-xl font-display font-black text-on-surface mb-2">{plan.title}</h3>
                  <div className="flex items-baseline gap-1.5 mb-4">
                    <span className="text-3xl md:text-4xl font-display font-black text-on-surface">{plan.priceCLP}</span>
                    <span className="text-xs font-mono text-on-surface-variant">/ {plan.period}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant font-light leading-relaxed mb-6 border-b border-outline/20 pb-4">
                    {plan.description}
                  </p>

                  <div className="space-y-3 mb-8">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-on-surface-variant">
                        <Check size={15} className="text-primary shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <a 
                  href="#contacto"
                  className={cn(
                    "w-full py-3 px-5 rounded-full font-display font-black uppercase tracking-wider text-xs flex items-center justify-between transition-all group active:scale-[0.98]",
                    plan.featured 
                      ? "bg-primary hover:bg-white text-bg shadow-lg shadow-primary/20" 
                      : "bg-surface-container-highest hover:bg-white hover:text-black text-on-surface border border-outline/30"
                  )}
                >
                  <span>{plan.ctaText}</span>
                  <span className="w-7 h-7 rounded-full bg-black/20 flex items-center justify-center group-hover:scale-110 group-hover:translate-x-0.5 transition-transform">
                    <ArrowRight size={14} />
                  </span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Section: Contacto & Agendamiento con Google Calendar ---
const ContactAndCalendar = ({ preselectedService = '' }: { preselectedService?: string }) => {
  const { config, addLead } = useSiteConfig();
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    areaInteres: preselectedService || 'Producción & Marketing Dron',
    modalidad: 'Packs Mensuales de Contenido',
    mensaje: ''
  });

  const [submitted, setSubmitted] = useState(false);

  React.useEffect(() => {
    if (preselectedService) {
      setFormData(prev => ({ ...prev, areaInteres: preselectedService }));
    }
  }, [preselectedService]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLead({
      nombre: formData.nombre,
      empresa: formData.empresa,
      email: formData.email,
      telefono: formData.telefono,
      areaInteres: formData.areaInteres,
      modalidad: formData.modalidad,
      mensaje: formData.mensaje
    });
    setSubmitted(true);
  };

  return (
    <section id="contacto" className="py-28 px-4 sm:px-8 md:px-12 bg-bg/80 relative border-t border-outline/20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <span className="text-amber-400 font-mono font-bold uppercase tracking-[0.25em] text-xs">Atención Rápida</span>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-on-surface mt-2 mb-6">
              Hablemos de tu Próximo Proyecto
            </h2>
            <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
              Indícanos tu requerimiento para preparar una propuesta a la medida o agendar directamente una reunión virtual con nuestro equipo en Iquique y el norte de Chile.
            </p>

            {submitted ? (
              <div className="glass-card p-10 rounded-3xl hud-border text-center">
                <CheckCircle2 size={48} className="text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-display font-bold text-on-surface mb-2">¡Solicitud Registrada con Éxito!</h3>
                <p className="text-on-surface-variant text-sm max-w-md mx-auto mb-6">
                  Nos comunicaremos contigo a la brevedad vía WhatsApp o correo electrónico.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="bg-primary text-bg px-6 py-2.5 rounded-full text-xs font-bold uppercase"
                >
                  Enviar otra solicitud
                </button>
              </div>
            ) : (
              <div className="double-bezel-outer">
                <div className="double-bezel-inner p-8 bg-surface-container/90">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        required
                        placeholder="Tu Nombre / Contacto"
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        className="w-full bg-surface-container-high rounded-xl p-4 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary border border-outline/30"
                      />
                      <input 
                        type="text" 
                        required
                        placeholder="Nombre del Negocio / Empresa"
                        value={formData.empresa}
                        onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                        className="w-full bg-surface-container-high rounded-xl p-4 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary border border-outline/30"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        type="email" 
                        required
                        placeholder="Correo Electrónico"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-surface-container-high rounded-xl p-4 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary border border-outline/30"
                      />
                      <input 
                        type="tel" 
                        placeholder="WhatsApp (+56 9 ...)"
                        value={formData.telefono}
                        onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                        className="w-full bg-surface-container-high rounded-xl p-4 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary border border-outline/30 font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-on-surface-variant mb-1.5">Área de Servicio</label>
                        <select 
                          value={formData.areaInteres}
                          onChange={(e) => setFormData({...formData, areaInteres: e.target.value})}
                          className="w-full bg-surface-container-high rounded-xl p-4 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary border border-outline/30"
                        >
                          <option>Producción & Marketing Dron</option>
                          <option>Tours Virtuales 360° + Visor Web</option>
                          <option>Vuelo FPV de Alta Velocidad</option>
                          <option>Inspección de Fachadas & Minería</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-on-surface-variant mb-1.5">Modalidad Preferida</label>
                        <select 
                          value={formData.modalidad}
                          onChange={(e) => setFormData({...formData, modalidad: e.target.value})}
                          className="w-full bg-surface-container-high rounded-xl p-4 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary border border-outline/30"
                        >
                          <option>Packs Mensuales de Contenido</option>
                          <option>Por Proyecto Único Cerrado</option>
                          <option>Inspección Técnica Puntual</option>
                          <option>Demostración de Plataforma 360°</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <textarea 
                        rows={4}
                        placeholder="Cuéntanos brevemente sobre tu proyecto o qué tipo de espacio deseas registrar..."
                        value={formData.mensaje}
                        onChange={(e) => setFormData({...formData, mensaje: e.target.value})}
                        className="w-full bg-surface-container-high rounded-xl p-4 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary border border-outline/30"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-full font-display font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-amber-500/25 active:scale-[0.98]"
                    >
                      ENVIAR SOLICITUD DE COTIZACIÓN
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <span className="text-secondary font-mono font-bold uppercase tracking-[0.25em] text-xs">Agenda Virtual</span>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-on-surface mt-2 mb-4">
                Elige Día y Hora en Google Meet
              </h3>
              <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
                Revisa disponibilidad en tiempo real y agenda directamente una videollamada para revisar detalles técnicos y fechas de filmación.
              </p>

              <div className="double-bezel-outer">
                <div className="double-bezel-inner bg-white p-1 overflow-hidden aspect-[4/3] shadow-2xl relative">
                  <iframe 
                    src={config.contact.bookingUrl} 
                    style={{ border: 0, background: 'white' }} 
                    width="100%" 
                    height="100%" 
                    frameBorder="0"
                    title="Google Calendar Booking"
                    className="rounded-2xl"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 text-xs font-mono text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span>Confirmación instantánea enviada a tu correo</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Enlace de Google Meet generado automáticamente</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Footer Component ---
const Footer = () => {
  const { config, setIsLoginModalOpen } = useSiteConfig();

  return (
    <footer className="bg-slate-950 w-full py-20 px-6 md:px-12 border-t border-outline/30 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3.5 mb-6">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-600/80 shadow-[0_0_15px_rgba(217,119,6,0.35)] bg-black">
              <img 
                src="/andina_vision_logo.jpg" 
                alt="Andina Vision Logo" 
                className="w-full h-full object-cover rounded-full"
                style={{ clipPath: 'circle(48% at 50% 50%)' }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white font-display uppercase leading-none">{BRAND.name}</span>
              <span className="text-[9px] uppercase tracking-[0.16em] text-secondary font-mono font-bold opacity-90 max-w-md">{BRAND.subtitle}</span>
            </div>
          </div>
          <p className="text-on-surface-variant font-sans text-sm tracking-wide max-w-md leading-relaxed mb-6">
            {BRAND.description}
          </p>
          <div className="flex items-center gap-3 text-xs font-mono text-on-surface-variant">
            <MapPin size={14} className="text-primary" />
            <span>{config.contact.location}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-primary font-display text-xs tracking-[0.2em] font-bold uppercase mb-3">Nuestros Pilares</h4>
          <a className="text-on-surface-variant hover:text-cinema-cyan transition-colors text-sm" href="#contenido-pilar">Producción & Marketing Dron</a>
          <a className="text-on-surface-variant hover:text-emerald-glow transition-colors text-sm" href="#contenido-pilar">Tour 360° & Visor Web</a>
          <a className="text-on-surface-variant hover:text-copper-glow transition-colors text-sm" href="#contenido-pilar">Vuelos de Drone FPV (140 km/h)</a>
          <a className="text-on-surface-variant hover:text-industrial-red transition-colors text-sm" href="#contenido-pilar">Servicios Industriales & Minería</a>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-secondary font-display text-xs tracking-[0.2em] font-bold uppercase mb-3">Contacto Directo</h4>
          <a className="text-on-surface-variant hover:text-primary transition-colors text-sm flex items-center gap-2" href={`mailto:${config.contact.contactEmail}`}>
            <Mail size={14} /> {config.contact.contactEmail}
          </a>
          <a className="text-on-surface-variant hover:text-primary transition-colors text-sm flex items-center gap-2" href={config.contact.whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Phone size={14} /> {config.contact.phone}
          </a>
          <div className="flex gap-4 mt-4">
            <a className="text-on-surface-variant hover:text-primary transition-transform hover:scale-110" href={config.contact.instagramUrl} target="_blank" rel="noopener noreferrer"><Instagram size={20} /></a>
            <a className="text-on-surface-variant hover:text-primary transition-transform hover:scale-110" href={config.contact.linkedinUrl} target="_blank" rel="noopener noreferrer"><Linkedin size={20} /></a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-outline/20 mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center text-on-surface-variant/50 text-[11px] font-mono uppercase tracking-widest gap-4">
        <span>© {new Date().getFullYear()} {BRAND.fullName}. Iquique, Chile.</span>
        
        <div className="flex items-center gap-6">
          <span>GCP: {BRAND.gcpProject.id}</span>
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="flex items-center gap-1.5 text-on-surface-variant/60 hover:text-primary transition-colors cursor-pointer py-1 px-2.5 rounded-full hover:bg-white/5 border border-white/10"
            title="Ingreso de administración y edición"
          >
            <Lock size={12} />
            <span>Acceso Administrador</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

// --- WhatsApp Floating Button ---
const WhatsAppButton = () => {
  const { config } = useSiteConfig();
  return (
    <div className="fixed bottom-8 right-8 z-50 flex items-center justify-center">
      <a 
        className="bg-amber-500 text-slate-950 rounded-full h-16 w-16 shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex items-center justify-center animate-bounce hover:scale-110 transition-transform group" 
        href={config.contact.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle size={32} className="fill-current text-slate-950" />
        <span className="absolute right-20 bg-amber-500 text-slate-950 px-4 py-2 rounded-lg font-display font-black uppercase text-[10px] tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl border border-white/20">
          HABLAR POR WHATSAPP
        </span>
      </a>
    </div>
  );
};

// --- Main App Content with Ambient Mesh Backgrounds & Dynamic Sections ---
function MainAppContent() {
  const { isAdminLoggedIn } = useSiteConfig();
  const [activePillar, setActivePillar] = useState<PillarKey>('cine');
  const [selectedQuoteService, setSelectedQuoteService] = useState<string>('');
  const [isTourPlatformActive, setIsTourPlatformActive] = useState<boolean>(false);

  // Video modal state
  const [videoModalDetails, setVideoModalDetails] = useState<VideoModalDetails>({
    isOpen: false,
    source: BRAND.showreelVideoId,
    title: 'Showreel Oficial Andina Visión 4K',
    category: 'cine'
  });

  const handleOpenEnhancedVideo = (details: Omit<VideoModalDetails, 'isOpen'>) => {
    setVideoModalDetails({
      ...details,
      isOpen: true
    });
  };

  const handleCloseVideo = () => {
    setVideoModalDetails(prev => ({ ...prev, isOpen: false }));
  };

  if (isTourPlatformActive) {
    return (
      <TourPlatformHub onBackToMainSite={() => setIsTourPlatformActive(false)} />
    );
  }

  return (
    <div className="min-h-screen bg-bg text-on-surface relative overflow-x-hidden selection:bg-primary selection:text-black">
      {/* Ambient Mesh Orbs & Dot Grid (Ethereal Glass Design Archetype) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-cinema-blue/15 to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-[35%] -left-32 w-[550px] h-[450px] bg-gradient-to-tr from-emerald-green/10 to-transparent rounded-full blur-[120px]" />
        <div className="absolute top-[55%] -right-32 w-[550px] h-[450px] bg-gradient-to-tl from-copper-gold/10 to-transparent rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-1/3 w-[600px] h-[450px] bg-gradient-to-t from-industrial-red/10 to-transparent rounded-full blur-[130px]" />
        <div className="absolute inset-0 bg-dot-pattern opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
      </div>

      <div className="relative z-10">
        <AdminBar />
        <NavbarWithDropdowns 
          onSelectPillar={setActivePillar} 
          onOpenTourPlatform={() => setIsTourPlatformActive(true)}
        />
        
        <main>
          <HeroCarousel 
            onOpenVideo={(source, title) => handleOpenEnhancedVideo({
              source,
              title,
              category: activePillar,
              description: 'Producción audiovisual aérea de alta precisión con drones profesionales en Iquique.'
            })} 
            onSelectPillar={setActivePillar} 
          />

          <StickyPillarsBar 
            activePillar={activePillar} 
            onSelectPillar={setActivePillar} 
            isAdminLoggedIn={isAdminLoggedIn}
          />

          <DynamicPillarSection 
            activePillar={activePillar} 
            onOpenVideoModal={handleOpenEnhancedVideo}
            onSelectServiceForQuote={setSelectedQuoteService}
          />

          <PricingAndPacks preselectedCategory={activePillar === 'fpv' ? 'cine' : activePillar} />

          <ContactAndCalendar preselectedService={selectedQuoteService} />
        </main>

        <Footer />
        <WhatsAppButton />

        <EnhancedVideoModal 
          details={videoModalDetails}
          onClose={handleCloseVideo}
          onSelectServiceForQuote={setSelectedQuoteService}
        />

        <AdminLoginModal />
        <AdminDashboardModal />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SiteProvider>
      <MainAppContent />
    </SiteProvider>
  );
}
