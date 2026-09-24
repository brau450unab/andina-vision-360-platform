import React, { useEffect, useRef, useState } from 'react';
import { Layers, Smartphone, Wand2, ArrowRight, CheckCircle2, Eye, Sparkles, Zap, Shield } from 'lucide-react';
import { DynamicCloudTourViewer } from '../DynamicCloudTourViewer';
import { INITIAL_DEPARTMENT_TOUR } from './panoramasData';

interface TourCommercialLandingProps {
  onNavigateToLibrary: () => void;
  onNavigateToStudio: () => void;
}

// ── Reveal-on-scroll hook ──────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
}

// ── Stat card ─────────────────────────────────────────────
function StatCard({ val, label, desc, delay }: { val: string; label: string; desc: string; delay: number }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className="reveal-entry"
      style={{ transitionDelay: `${delay}ms`, ...(visible ? { opacity: 1, transform: 'translateY(0)' } : {}) }}
    >
      {/* Double-bezel stat card */}
      <div
        className="h-full"
        style={{
          padding: '4px',
          borderRadius: '1.25rem',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.7)',
        }}
      >
        <div
          className="h-full p-5 flex flex-col gap-1"
          style={{
            borderRadius: 'calc(1.25rem - 4px)',
            background: 'linear-gradient(160deg, rgba(20,27,41,0.9) 0%, rgba(10,14,22,0.95) 100%)',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.08)',
          }}
        >
          <div className="text-emerald-400 font-display font-black text-xl">{val}</div>
          <div className="text-white text-xs font-display font-semibold">{label}</div>
          <div className="text-white/35 text-[11px] font-mono leading-relaxed">{desc}</div>
        </div>
      </div>
    </div>
  );
}

// ── Feature pillar card ────────────────────────────────────
function FeaturePillar({
  icon: Icon, title, body, items, accentColor, delay,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
  items: string[];
  accentColor: string;
  delay: number;
}) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className="reveal-entry"
      style={{ transitionDelay: `${delay}ms`, ...(visible ? { opacity: 1, transform: 'translateY(0)' } : {}) }}
    >
      <div
        className="h-full group"
        style={{
          padding: '5px',
          borderRadius: '1.75rem',
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 24px 50px -18px rgba(0,0,0,0.8)',
          transition: 'all 0.6s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        <div
          className="h-full flex flex-col p-6 sm:p-8"
          style={{
            borderRadius: 'calc(1.75rem - 5px)',
            background: 'linear-gradient(160deg, rgba(14,20,32,0.92) 0%, rgba(8,11,18,0.98) 100%)',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.07)',
          }}
        >
          {/* Icon badge */}
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center mb-6 shrink-0"
            style={{
              background: `${accentColor}18`,
              border: `1px solid ${accentColor}30`,
              boxShadow: `0 8px 24px -8px ${accentColor}22`,
            }}
          >
            <Icon size={20} style={{ color: accentColor }} />
          </div>

          {/* Eyebrow */}
          <div
            className="inline-flex w-fit items-center px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-[0.18em] mb-3"
            style={{
              color: accentColor,
              background: `${accentColor}14`,
              border: `1px solid ${accentColor}25`,
            }}
          >
            Motor Cloud
          </div>

          <h3 className="text-lg font-display font-bold text-white uppercase leading-tight mb-3">{title}</h3>
          <p className="text-white/40 text-xs font-mono leading-relaxed flex-1 mb-6">{body}</p>

          <ul className="space-y-2.5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs font-mono text-white/55">
                <CheckCircle2 size={13} style={{ color: accentColor, marginTop: 1, flexShrink: 0 }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── Comparison table ───────────────────────────────────────
const ROWS = [
  { label: 'Propiedad de archivos',   neg: 'Servidores opacos del proveedor',          pos: 'Tu propio Google Cloud Storage' },
  { label: 'Costo mensual',           neg: '$30 – $150 USD/mes o marcas de agua',      pos: 'Costo real en GCP (< $5/mes)' },
  { label: 'Resolución móvil',        neg: 'Comprimen y degradan la foto a 4K',        pos: '8K – 12K con pirámides multirres.' },
  { label: 'Inteligencia Artificial', neg: 'Inexistente o cobrada por crédito extra',  pos: 'Vertex AI (Imagen 3 & Gemini Vision)' },
];

export const TourCommercialLanding: React.FC<TourCommercialLandingProps> = ({
  onNavigateToLibrary,
  onNavigateToStudio,
}) => {
  const heroReveal = useReveal();
  const viewerReveal = useReveal();

  return (
    <div className="w-full text-white overflow-hidden" style={{ background: 'transparent' }}>

      {/* ══════════════════════════════════════════
          1. HERO — Editorial Split with live 360
         ══════════════════════════════════════════ */}
      <section className="relative pt-24 pb-32 px-4 sm:px-6 lg:px-16 overflow-hidden">
        {/* Section gradient */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(16,185,129,0.1) 0%, transparent 70%)',
          }}
        />

        <div className="max-w-7xl mx-auto">

          {/* — Eyebrow + heading ——————————————————— */}
          <div
            ref={heroReveal.ref}
            className="reveal-entry text-center max-w-4xl mx-auto mb-16"
            style={heroReveal.visible ? { opacity: 1, transform: 'translateY(0)' } : {}}
          >
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 mb-6">
              <div
                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-[0.2em]"
                style={{
                  background: 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  color: '#34d399',
                  boxShadow: '0 0 24px rgba(16,185,129,0.12)',
                }}
              >
                <Sparkles size={11} />
                Motor Espacial 360° · Google Cloud · WebGL
              </div>
            </div>

            {/* Massive heading */}
            <h1
              className="font-display font-black uppercase leading-none tracking-tight mb-6"
              style={{ fontSize: 'clamp(2.6rem, 7vw, 5.5rem)' }}
            >
              Plataforma de{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 50%, #818cf8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Tours Virtuales
              </span>{' '}
              &amp; Imágenes{' '}
              <span style={{ color: 'rgba(255,255,255,0.25)' }}>360°</span>
            </h1>

            <p className="text-white/45 text-sm sm:text-base font-mono leading-relaxed max-w-2xl mx-auto mb-10">
              Visualiza capturas de drones y cámaras omnidireccionales en{' '}
              <strong className="text-white/70">8K Gigapíxel</strong> con renderizado WebGL nativo a 60 FPS, giroscopio móvil inmersivo y retoque fotográfico asistido por{' '}
              <strong className="text-white/70">Inteligencia Artificial en Google Cloud</strong>.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* Primary button-in-button */}
              <button
                onClick={onNavigateToStudio}
                className="group flex items-center gap-3 pl-5 pr-2 py-2 rounded-full font-display font-black text-sm uppercase tracking-wider text-slate-950 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
                  boxShadow: '0 0 32px rgba(16,185,129,0.35)',
                }}
              >
                <span>Crear Tour Virtual</span>
                <span
                  className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105"
                  style={{ background: 'rgba(0,0,0,0.15)' }}
                >
                  <ArrowRight size={15} />
                </span>
              </button>

              {/* Secondary */}
              <button
                onClick={onNavigateToLibrary}
                className="group flex items-center gap-2.5 px-5 py-3 rounded-full font-mono text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
                }}
              >
                <Eye size={14} className="text-emerald-400" />
                Ver Biblioteca 360° (5 panorámicas)
              </button>
            </div>
          </div>

          {/* — Live 360 Viewer (Double-Bezel) ———————————————— */}
          <div
            ref={viewerReveal.ref}
            className="reveal-entry relative"
            style={{
              transitionDelay: '150ms',
              ...(viewerReveal.visible ? { opacity: 1, transform: 'translateY(0)' } : {}),
            }}
          >
            {/* Live badge */}
            <div
              className="absolute -top-3.5 left-6 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider"
              style={{
                background: 'linear-gradient(90deg, #059669, #0e7490)',
                boxShadow: '0 4px 20px rgba(16,185,129,0.4)',
                color: '#fff',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Demo en Vivo · Departamento Cavancha 8K HDR
            </div>

            {/* Outer bezel shell */}
            <div
              style={{
                padding: '6px',
                borderRadius: '2rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 32px 80px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.02)',
              }}
            >
              {/* Inner bezel core */}
              <div
                style={{
                  borderRadius: 'calc(2rem - 6px)',
                  overflow: 'hidden',
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)',
                }}
              >
                <DynamicCloudTourViewer
                  tourId="tour_depto_cavancha"
                  fallbackTour={{
                    id: 'tour_depto_cavancha',
                    title: 'Departamento Vista Mar & Balcón - Cavancha 360°',
                    allow_gyroscope: true,
                    first_scene_id: 'pano_living_terraza',
                    scenes: INITIAL_DEPARTMENT_TOUR.map(s => ({
                      id: s.id,
                      title: s.title,
                      preview_url: s.imageUrl,
                      default_yaw: s.defaultYaw,
                      default_pitch: s.defaultPitch,
                      hotspots: s.hotspots.map(h => ({
                        id: h.id,
                        type: h.type,
                        yaw: h.yaw,
                        pitch: h.pitch,
                        tooltip: h.tooltip,
                        target_scene_id: h.targetSceneId,
                        title: h.title,
                        description: h.description,
                        youtube_video_id: h.youtubeVideoId,
                        drive_url: h.driveUrl,
                        drive_label: h.driveLabel,
                      })),
                    })),
                  }}
                />
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {([
                { val: '8192 × 4096 px', label: 'Resolución Máxima',   desc: 'Sin pérdida de textura en zoom' },
                { val: '60 FPS',          label: 'Tasa de Cuadros',     desc: 'WebGL nativo sin librerías pesadas' },
                { val: 'iOS & Android',   label: 'Soporte Móvil',       desc: 'Giroscopio y pirámides de mosaicos' },
                { val: 'Cloud Run',       label: 'Infraestructura GCP', desc: 'Escalable a 0 con Cloud CDN' },
              ] as { val: string; label: string; desc: string }[]).map((s, i) => (
                <StatCard key={i} delay={i * 60} {...s} />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          2. FEATURE PILLARS — Asymmetric Bento
         ══════════════════════════════════════════ */}
      <section className="py-32 px-4 sm:px-6 lg:px-16 relative">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        />

        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          {(() => {
            const { ref, visible } = useReveal();
            return (
              <div
                ref={ref}
                className="reveal-entry text-center max-w-xl mx-auto mb-20"
                style={visible ? { opacity: 1, transform: 'translateY(0)' } : {}}
              >
                <div
                  className="inline-block px-3 py-1 mb-4 rounded-full text-[10px] font-mono font-bold uppercase tracking-[0.2em]"
                  style={{ color: '#34d399', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}
                >
                  Ingeniería Cloud-Native
                </div>
                <h2
                  className="font-display font-black uppercase leading-tight"
                  style={{ fontSize: 'clamp(1.8rem, 4vw, 3.2rem)' }}
                >
                  Funcionalidades Clave del Motor
                </h2>
                <p className="text-white/35 text-xs font-mono leading-relaxed mt-4">
                  Diseñado desde cero para resolver los límites de memoria en navegadores móviles y eliminar la dependencia de SaaS privativos.
                </p>
              </div>
            );
          })()}

          {/* Bento grid: 1 wide + 2 stacked on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Wide card */}
            <div className="md:col-span-2">
              <FeaturePillar
                icon={Layers}
                title="Pirámides Multirresolución"
                body="Apple impone un límite estricto de textura de 4096px en Safari iOS. Nuestro procesador divide las capturas de dron en caras cúbicas y mosaicos de 512×512 píxeles organizados en niveles jerárquicos (LOD), logrando 0 crashes y zoom infinito en cualquier dispositivo."
                items={['Selector dinámico: Baja, Media, Alta, Ultra', 'Ahorro del 70% de datos en redes 4G/5G', 'Zoom subpíxel con mipmapping GPU']}
                accentColor="#10b981"
                delay={0}
              />
            </div>

            {/* Stacked narrow cards */}
            <div className="flex flex-col gap-4">
              <FeaturePillar
                icon={Smartphone}
                title="Giroscopio & Videos 360°"
                body="Sincronización fluida con sensores inerciales mediante permisos conformes a iOS 13+. Hotspots con YouTube 360 y Drive."
                items={['DeviceOrientationEvent optimizado', 'Puente window.postMessage iframes']}
                accentColor="#06b6d4"
                delay={80}
              />
              <FeaturePillar
                icon={Wand2}
                title="IA en Vertex AI"
                body="Nadir patch con Imagen 3, borrado de sombras de dron y autodetección de hotspots por Gemini Vision."
                items={['Inpainting generativo de piso', 'Sugerencias automáticas de hotspots']}
                accentColor="#a78bfa"
                delay={160}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3. COMPARISON TABLE
         ══════════════════════════════════════════ */}
      <section className="py-32 px-4 sm:px-6 lg:px-16">
        {(() => {
          const { ref, visible } = useReveal();
          return (
            <div className="max-w-5xl mx-auto">
              <div
                ref={ref}
                className="reveal-entry text-center mb-16"
                style={visible ? { opacity: 1, transform: 'translateY(0)' } : {}}
              >
                <div
                  className="inline-block px-3 py-1 mb-4 rounded-full text-[10px] font-mono font-bold uppercase tracking-[0.2em]"
                  style={{ color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}
                >
                  Por qué somos diferentes
                </div>
                <h2
                  className="font-display font-black uppercase"
                  style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)' }}
                >
                  SaaS Tradicionales vs Andina 360 Cloud
                </h2>
              </div>

              {/* Double-bezel table container */}
              <div
                style={{
                  padding: '5px',
                  borderRadius: '1.75rem',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: '0 32px 80px -20px rgba(0,0,0,0.8)',
                }}
              >
                <div
                  style={{
                    borderRadius: 'calc(1.75rem - 5px)',
                    overflow: 'hidden',
                    background: 'linear-gradient(160deg, rgba(14,20,32,0.96) 0%, rgba(8,11,18,0.99) 100%)',
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.06)',
                  }}
                >
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr
                        className="text-[10px] font-mono uppercase tracking-[0.18em]"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <th className="p-5 sm:p-6 text-white/30">Característica</th>
                        <th className="p-5 sm:p-6 text-red-400/70">SaaS Tradicional</th>
                        <th className="p-5 sm:p-6 text-emerald-400 font-bold" style={{ background: 'rgba(16,185,129,0.04)' }}>
                          Andina 360 Platform
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ROWS.map((row, i) => (
                        <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                          <td className="p-5 sm:p-6 text-xs font-display font-semibold text-white/80">{row.label}</td>
                          <td className="p-5 sm:p-6 text-xs font-mono text-white/30">{row.neg}</td>
                          <td
                            className="p-5 sm:p-6 text-xs font-mono font-bold text-emerald-300"
                            style={{ background: 'rgba(16,185,129,0.03)' }}
                          >
                            {row.pos}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* ══════════════════════════════════════════
          4. FINAL CTA BANNER
         ══════════════════════════════════════════ */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-16 overflow-hidden">
        {/* Bottom glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 110%, rgba(16,185,129,0.12) 0%, transparent 70%)' }}
        />

        {(() => {
          const { ref, visible } = useReveal();
          return (
            <div
              ref={ref}
              className="reveal-entry max-w-2xl mx-auto text-center"
              style={visible ? { opacity: 1, transform: 'translateY(0)' } : {}}
            >
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 mb-6 rounded-full text-[10px] font-mono font-bold uppercase tracking-[0.2em]"
                style={{ color: '#34d399', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}
              >
                <Zap size={10} />
                Listo para usar
              </div>

              <h2
                className="font-display font-black uppercase leading-tight mb-5"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
              >
                Empieza a Visualizar y Crear Recorridos en 360°
              </h2>
              <p className="text-white/35 text-sm font-mono leading-relaxed mb-10 max-w-lg mx-auto">
                Inspecciona las 5 panorámicas en alta resolución o abre el Tour Studio para vincular habitaciones y generar código embed.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={onNavigateToStudio}
                  className="group flex items-center gap-3 pl-5 pr-2 py-2 rounded-full font-display font-black text-sm uppercase tracking-wider text-slate-950 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
                    boxShadow: '0 0 40px rgba(16,185,129,0.4)',
                  }}
                >
                  <span>Abrir Tour Studio</span>
                  <span
                    className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105"
                    style={{ background: 'rgba(0,0,0,0.15)' }}
                  >
                    <ArrowRight size={15} />
                  </span>
                </button>
                <button
                  onClick={onNavigateToLibrary}
                  className="px-5 py-3 rounded-full font-mono text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.09)',
                  }}
                >
                  Explorar Biblioteca
                </button>
              </div>

              {/* Trust pill */}
              <div className="mt-8 flex items-center justify-center gap-2 text-[11px] font-mono text-white/25">
                <Shield size={12} className="text-emerald-500/60" />
                Google Cloud Run · Firestore · Vertex AI
              </div>
            </div>
          );
        })()}
      </section>

    </div>
  );
};