import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  Menu, 
  X, 
  Film, 
  Globe2, 
  Zap, 
  HardHat, 
  Calendar, 
  Send, 
  CheckCircle2, 
  Sparkles,
  Phone
} from 'lucide-react';
import { BRAND } from '../constants';
import { useSiteConfig } from '../context/SiteContext';
import { PillarKey } from './StickyPillarsBar';

interface NavbarWithDropdownsProps {
  onSelectPillar: (pillar: PillarKey) => void;
  onOpenTourPlatform?: () => void;
}

export const NavbarWithDropdowns: React.FC<NavbarWithDropdownsProps> = ({ onSelectPillar, onOpenTourPlatform }) => {
  const { config, isAdminLoggedIn, addLead } = useSiteConfig();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isQuoteDropdownOpen, setIsQuoteDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Quick quote micro-form state
  const [quickForm, setQuickForm] = useState({
    nombre: '',
    telefono: '',
    servicio: 'Producción & Marketing Dron'
  });
  const [quickSubmitted, setQuickSubmitted] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLead({
      nombre: quickForm.nombre,
      empresa: 'Contacto Rápido Web',
      email: 'pendiente@contacto.cl',
      telefono: quickForm.telefono,
      areaInteres: quickForm.servicio,
      modalidad: 'Consulta Rápida Header',
      mensaje: `Solicitud rápida desde la barra superior para ${quickForm.servicio}`
    });
    setQuickSubmitted(true);
    setTimeout(() => {
      setQuickSubmitted(false);
      setIsQuoteDropdownOpen(false);
      setQuickForm({ nombre: '', telefono: '', servicio: 'Producción & Marketing Dron' });
    }, 2500);
  };

  const navSections = [
    {
      id: 'cine',
      name: 'PRODUCCIÓN Y MARKETING',
      pillarKey: 'cine' as PillarKey,
      color: 'text-cinema-cyan group-hover:text-primary',
      accent: '#38bdf8',
      items: [
        { label: 'Videos Promocionales 4K', desc: 'Hoteles, PyMEs y marcas' },
        { label: 'Reels & TikToks Multiformato', desc: 'Formato vertical 9:16 listo para pauta' },
        { label: 'Edición & Color Grading', desc: 'Narrativa cinematográfica fluida' },
        { label: 'Música con Licencias Comerciales', desc: 'Libre de reclamos de copyright publicitario' }
      ]
    },
    {
      id: 'tours360',
      name: 'TOUR 360 Y PLATAFORMA',
      pillarKey: 'tours360' as PillarKey,
      color: 'text-emerald-glow group-hover:text-emerald-green',
      accent: '#10b981',
      items: [
        { label: 'Visor Web 360° Incluido', desc: 'Alojamiento cloud sin costos sorpresa' },
        { label: 'Recorridos Inmobiliarios', desc: 'Puntos interactivos de ambientes' },
        { label: 'Integración Renders 3D', desc: 'Arquitectura y ventas en verde' },
        { label: 'Streaming YouTube & Drive', desc: 'Reproducción instantánea y fluida' }
      ]
    },
    {
      id: 'fpv',
      name: 'VUELOS DE DRONE',
      pillarKey: 'fpv' as PillarKey,
      color: 'text-copper-glow group-hover:text-copper-gold',
      accent: '#f59e0b',
      items: [
        { label: 'Dron FPV Alta Velocidad (140 km/h)', desc: 'Cinemáticas y persecución de acción' },
        { label: 'Vuelos Indoor Confinados', desc: 'Recorridos continuos interiores' },
        { label: 'Tomas Panorámicas Hasselblad', desc: 'Resolución de hasta 5.1K nativa' },
        { label: 'Pilotos Acreditados DGAC', desc: 'Seguro y protocolos aeronáuticos al día' }
      ]
    },
    {
      id: 'industrial',
      name: 'SERVICIOS INDUSTRIALES',
      pillarKey: 'industrial' as PillarKey,
      color: 'text-industrial-red group-hover:text-red-400',
      accent: '#ef4444',
      badge: 'PRO',
      items: [
        { label: 'Inspección de Fachadas sin Andamios', desc: 'Muros cortina y cubiertas en altura' },
        { label: 'Minería & Control de Volumetría', desc: 'Mapeo perimetral y stock de materiales' },
        { label: 'Prevención de Riesgos en Faena', desc: 'Cero exposición para el personal' },
        { label: 'Próximamente: Gemelos 3D & LiDAR', desc: 'Nubes de puntos densas georreferenciadas' }
      ]
    }
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 px-4 sm:px-8 py-3 flex items-center justify-between gap-4 ${
      isAdminLoggedIn ? 'top-[42px]' : 'top-0'
    } ${
      isScrolled ? 'bg-slate-950/95 backdrop-blur-xl shadow-2xl border-b border-outline/30' : 'bg-gradient-to-b from-black/90 to-transparent'
    }`}>
      {/* Brand Logo & Name */}
      <a href="#" className="flex items-center gap-3.5 group shrink-0">
        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-600/80 shadow-[0_0_15px_rgba(217,119,6,0.4)] group-hover:scale-105 transition-transform duration-300 bg-black">
          <img 
            src="/andina_vision_logo.jpg" 
            alt="Andina Vision Logo" 
            className="w-full h-full object-cover rounded-full"
            style={{ clipPath: 'circle(48% at 50% 50%)' }}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tight text-white font-display uppercase leading-none group-hover:text-primary transition-colors">
            {BRAND.name}
          </span>
          <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.16em] text-secondary font-mono font-bold opacity-90 max-w-[280px] sm:max-w-md truncate">
            {BRAND.subtitle}
          </span>
        </div>
      </a>

      {/* Center Wide Tabs with Dropdown Submenus */}
      <div className="hidden xl:flex items-center justify-center flex-1 max-w-4xl px-2">
        <div className="w-full grid grid-cols-4 gap-1">
          {navSections.map((sec) => (
            <div 
              key={sec.id}
              className="relative"
              onMouseEnter={() => setActiveDropdown(sec.id)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                onClick={() => {
                  onSelectPillar(sec.pillarKey);
                  const el = document.getElementById('contenido-pilar');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`w-full py-2.5 px-2 rounded-lg font-display text-[11px] font-black uppercase tracking-tight flex items-center justify-center gap-1.5 transition-all text-on-surface hover:bg-white/5 group ${sec.color}`}
              >
                <span className="truncate">{sec.name}</span>
                {sec.badge && (
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-industrial-red/20 text-industrial-red border border-industrial-red/40 font-bold">
                    {sec.badge}
                  </span>
                )}
                <ChevronDown size={13} className="shrink-0 transition-transform group-hover:rotate-180 opacity-70" />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {activeDropdown === sec.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 w-72 bg-slate-950/98 backdrop-blur-2xl border border-outline/40 rounded-2xl p-3 shadow-[0_15px_50px_rgba(0,0,0,0.8)] z-50 space-y-1"
                  >
                    <div 
                      className="px-3 py-1.5 text-[10px] font-mono font-bold tracking-widest uppercase border-b border-outline/20 mb-1"
                      style={{ color: sec.accent }}
                    >
                      {sec.name}
                    </div>
                    {sec.items.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          onSelectPillar(sec.pillarKey);
                          setActiveDropdown(null);
                          const el = document.getElementById('contenido-pilar');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-white/10 transition-colors group/item block"
                      >
                        <div className="text-xs font-display font-bold text-on-surface group-hover/item:text-white flex items-center justify-between">
                          <span>{item.label}</span>
                          <span className="text-[10px] opacity-0 group-hover/item:opacity-100 transition-opacity" style={{ color: sec.accent }}>→</span>
                        </div>
                        <div className="text-[10px] text-on-surface-variant font-mono opacity-80 mt-0.5 line-clamp-1">
                          {item.desc}
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Botón Acceso Plataforma 360 */}
      {onOpenTourPlatform && (
        <button
          onClick={onOpenTourPlatform}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-500/10 hover:scale-105 shrink-0"
          title="Abrir Plataforma 360: Biblioteca y Estudio de Tours"
        >
          <Globe2 size={16} />
          <span>Plataforma 360°</span>
        </button>
      )}

      {/* Big Corner Button with Hover Dropdown Micro-Form */}
      <div 
        className="relative shrink-0"
        onMouseEnter={() => setIsQuoteDropdownOpen(true)}
        onMouseLeave={() => setIsQuoteDropdownOpen(false)}
      >
        <a
          href="#contacto"
          onClick={() => {
            const el = document.getElementById('contacto');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="hidden md:flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 font-display font-black uppercase tracking-wider text-xs shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Calendar size={16} className="text-slate-950" />
          <span>COTIZAR Y AGENDAR SESIÓN</span>
          <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
        </a>

        {/* Hover Micro-Form Dropdown */}
        <AnimatePresence>
          {isQuoteDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 w-80 bg-slate-950/98 backdrop-blur-2xl border border-amber-500/40 rounded-2xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.85)] z-50 text-left"
            >
              <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs uppercase mb-2">
                <Sparkles size={14} />
                <span>Respuesta Rápida en 1 Clic</span>
              </div>
              <p className="text-[11px] text-on-surface-variant font-light mb-4">
                Déjanos tu contacto para enviarte valores y disponibilidad de grabación de inmediato.
              </p>

              {quickSubmitted ? (
                <div className="p-4 rounded-xl bg-green-500/20 border border-green-500/40 text-center text-green-300 font-mono text-xs">
                  <CheckCircle2 size={24} className="mx-auto mb-1.5" />
                  <span>¡Solicitud enviada! Te contactaremos pronto.</span>
                </div>
              ) : (
                <form onSubmit={handleQuickSubmit} className="space-y-2.5">
                  <input
                    type="text"
                    required
                    placeholder="Tu Nombre / Empresa"
                    value={quickForm.nombre}
                    onChange={(e) => setQuickForm({ ...quickForm, nombre: e.target.value })}
                    className="w-full bg-surface-container p-2.5 rounded-lg text-xs text-on-surface outline-none border border-outline/30 focus:border-amber-400"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="WhatsApp (+56 9 ...)"
                    value={quickForm.telefono}
                    onChange={(e) => setQuickForm({ ...quickForm, telefono: e.target.value })}
                    className="w-full bg-surface-container p-2.5 rounded-lg text-xs text-on-surface outline-none border border-outline/30 focus:border-amber-400 font-mono"
                  />
                  <select
                    value={quickForm.servicio}
                    onChange={(e) => setQuickForm({ ...quickForm, servicio: e.target.value })}
                    className="w-full bg-surface-container p-2 rounded-lg text-xs text-on-surface outline-none border border-outline/30 font-mono"
                  >
                    <option>Producción & Marketing Dron</option>
                    <option>Tour 360° + Plataforma Web</option>
                    <option>Vuelo FPV de Alta Velocidad</option>
                    <option>Inspección Industrial & Faena</option>
                  </select>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Send size={12} />
                    <span>Enviar Solicitud Inmediata</span>
                  </button>

                  <a 
                    href="#contacto" 
                    className="block text-center text-[10px] font-mono text-on-surface-variant hover:text-white underline pt-1"
                  >
                    O ir al formulario completo / Google Calendar →
                  </a>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Menu Button */}
      <button 
        className="xl:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container border border-outline/30 text-on-surface"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-slate-950 border-b border-outline/40 p-6 flex flex-col gap-4 xl:hidden shadow-2xl"
          >
            {navSections.map((sec) => (
              <div key={sec.id} className="border-b border-outline/20 pb-3">
                <button
                  onClick={() => {
                    onSelectPillar(sec.pillarKey);
                    setIsMobileMenuOpen(false);
                    const el = document.getElementById('contenido-pilar');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`text-sm font-black uppercase tracking-wider flex items-center justify-between w-full ${sec.color}`}
                >
                  <span>{sec.name}</span>
                  {sec.badge && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-industrial-red/20 text-industrial-red border border-industrial-red/40 font-bold">
                      {sec.badge}
                    </span>
                  )}
                </button>
              </div>
            ))}
            <a
              href="#contacto"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-2 text-center bg-amber-500 text-slate-950 py-3 rounded-xl font-bold uppercase tracking-widest text-xs"
            >
              Cotizar y Agendar Sesión
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
