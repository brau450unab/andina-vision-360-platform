import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  Smartphone, 
  Cpu, 
  Cloud, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink, 
  ShieldCheck, 
  Wand2, 
  Zap, 
  Eye, 
  Play, 
  Compass, 
  Share2, 
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { DynamicCloudTourViewer } from '../DynamicCloudTourViewer';
import { REAL_PANORAMAS, INITIAL_DEPARTMENT_TOUR } from './panoramasData';

interface TourCommercialLandingProps {
  onNavigateToLibrary: () => void;
  onNavigateToStudio: () => void;
}

export const TourCommercialLanding: React.FC<TourCommercialLandingProps> = ({
  onNavigateToLibrary,
  onNavigateToStudio
}) => {
  return (
    <div className="w-full bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* 1. HERO SECTION: Impacto Visual y Demostración en Vivo */}
      <section className="relative pt-12 pb-24 px-4 sm:px-6 lg:px-12 border-b border-slate-900 bg-gradient-to-b from-slate-900/60 via-slate-950 to-slate-950">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-widest uppercase mb-4 shadow-lg shadow-emerald-500/10 animate-pulse">
              <Sparkles size={14} />
              <span>MOTOR ESPACIAL 360° & NUBE GOOGLE CLOUD</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-display font-black tracking-tight text-white uppercase leading-none mb-6">
              Plataforma de Tours Virtuales e Imágenes 360°
            </h1>
            
            <p className="text-slate-400 text-base sm:text-lg font-light leading-relaxed mb-8">
              Visualiza capturas de drones y cámaras omnidireccionales en <strong>8K Gigapíxel</strong> con renderizado WebGL adaptable a 60 FPS, giroscopio móvil inmersivo y retoque fotográfico asistido por <strong>Inteligencia Artificial en Google Cloud</strong>.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={onNavigateToStudio}
                className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-emerald-500/25 flex items-center gap-2 hover:scale-105"
              >
                <span>Crear Nuevo Tour Virtual</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={onNavigateToLibrary}
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
              >
                <Eye size={16} className="text-emerald-400" />
                <span>Ver Biblioteca de Imágenes (5)</span>
              </button>
            </div>
          </div>

          <div className="relative mt-8">
            <div className="absolute -top-3 left-6 z-20 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-mono font-black text-[10px] uppercase tracking-wider shadow-lg">
              ● DEMO EN VIVO: DEPARTAMENTO EN CAVANCHA (8K HDR)
            </div>

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
                    drive_label: h.driveLabel
                  }))
                }))
              }}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              {[
                { label: 'Resolución Máxima', val: '8192 × 4096 px', desc: 'Sin pérdida de textura en zoom' },
                { label: 'Tasa de Cuadros', val: '60 FPS Fluido', desc: 'WebGL nativo sin bibliotecas pesadas' },
                { label: 'Soporte Móvil', val: 'iOS & Android', desc: 'Giroscopio y pirámides de mosaicos' },
                { label: 'Infraestructura', val: 'Google Cloud Run', desc: 'Escalable a 0 con Cloud CDN' }
              ].map((stat, idx) => (
                <div key={idx} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
                  <div className="text-emerald-400 font-mono text-lg font-bold">{stat.val}</div>
                  <div className="text-white text-xs font-semibold mt-0.5">{stat.label}</div>
                  <div className="text-slate-500 text-[11px] font-light mt-0.5">{stat.desc}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 2. PILARES TECNOLÓGICOS DEL MOTOR */}
      <section className="py-24 px-4 sm:px-6 lg:px-12 bg-slate-950 border-b border-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-emerald-400 font-mono text-xs font-bold uppercase tracking-widest">
              INGENIERÍA CLOUD-NATIVE
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-black text-white uppercase mt-2">
              Funcionalidades Clave del Motor
            </h2>
            <p className="text-slate-400 text-sm font-light mt-4">
              Diseñado desde cero para resolver los problemas de memoria en navegadores móviles y eliminar la dependencia de servicios SaaS privativos de terceros.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 p-8 rounded-3xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
                  <Layers size={24} />
                </div>
                <h3 className="text-xl font-display font-bold text-white uppercase mb-3">
                  Pirámides Multirresolución
                </h3>
                <p className="text-slate-400 text-xs font-light leading-relaxed mb-6">
                  Apple impone un límite estricto de textura de 4096px en Safari iOS. Nuestro procesador divide las capturas de dron en caras cúbicas y mosaicos de 512×512 píxeles organizados en niveles jerárquicos (LOD), logrando 0 crashes y zoom infinito.
                </p>
              </div>
              <ul className="space-y-2 text-xs font-mono text-slate-300 border-t border-slate-800/80 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>Selector dinámico (Baja, Media, Alta, Ultra)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>Ahorro del 70% de datos en redes 4G/5G</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 p-8 rounded-3xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6">
                  <Smartphone size={24} />
                </div>
                <h3 className="text-xl font-display font-bold text-white uppercase mb-3">
                  Giroscopio & Videos 360
                </h3>
                <p className="text-slate-400 text-xs font-light leading-relaxed mb-6">
                  Sincronización fluida con los sensores inerciales del teléfono mediante permisos explícitos conformes a iOS 13+. Los hotspots integran videos de YouTube 360 con orientación en tiempo real y enlaces a Google Drive.
                </p>
              </div>
              <ul className="space-y-2 text-xs font-mono text-slate-300 border-t border-slate-800/80 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-400" />
                  <span>DeviceOrientationEvent optimizado</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-400" />
                  <span>Puente window.postMessage para iframes</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 p-8 rounded-3xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6">
                  <Wand2 size={24} />
                </div>
                <h3 className="text-xl font-display font-bold text-white uppercase mb-3">
                  Inteligencia Artificial
                </h3>
                <p className="text-slate-400 text-xs font-light leading-relaxed mb-6">
                  Integración nativa con <strong>Google Vertex AI</strong> para parchear automáticamente el casquete polar inferior (Nadir) con Imagen 3, borrar sombras de dron y autodetectar puntos de interés y títulos mediante Gemini Vision.
                </p>
              </div>
              <ul className="space-y-2 text-xs font-mono text-slate-300 border-t border-slate-800/80 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-purple-400" />
                  <span>Inpainting generativo de piso y trípode</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-purple-400" />
                  <span>Sugerencias automáticas de hotspots</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. COMPARATIVA */}
      <section className="py-24 px-4 sm:px-6 lg:px-12 bg-slate-900/30 border-b border-slate-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-emerald-400 font-mono text-xs font-bold uppercase tracking-widest">
              POR QUÉ SOMOS DIFERENTES
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-white uppercase mt-2">
              SaaS Comerciales Tradicionales vs Andina 360 Cloud
            </h2>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-xs font-mono uppercase text-slate-400">
                  <th className="p-4 sm:p-6">Característica</th>
                  <th className="p-4 sm:p-6 text-red-400">Plataformas SaaS Tradicionales</th>
                  <th className="p-4 sm:p-6 text-emerald-400 font-bold bg-emerald-500/5">Andina 360 Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
                <tr>
                  <td className="p-4 sm:p-6 font-semibold text-white">Propiedad de los Archivos</td>
                  <td className="p-4 sm:p-6 text-slate-400">Alojados en servidores opacos del proveedor</td>
                  <td className="p-4 sm:p-6 text-emerald-300 font-bold bg-emerald-500/5">Tu propio Google Cloud Storage</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-6 font-semibold text-white">Costos Mensuales</td>
                  <td className="p-4 sm:p-6 text-slate-400">$30 a $150 USD/mes recurrentes o marcas de agua</td>
                  <td className="p-4 sm:p-6 text-emerald-300 font-bold bg-emerald-500/5">Costo por uso real en GCP (&lt;$5/mes)</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-6 font-semibold text-white">Límites de Resolución Móvil</td>
                  <td className="p-4 sm:p-6 text-slate-400">Comprimen y degradan la foto a 4K o menos</td>
                  <td className="p-4 sm:p-6 text-emerald-300 font-bold bg-emerald-500/5">8K - 12K con pirámides multirres</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-6 font-semibold text-white">Inteligencia Artificial</td>
                  <td className="p-4 sm:p-6 text-slate-400">Inexistente o cobrada por crédito extra</td>
                  <td className="p-4 sm:p-6 text-emerald-300 font-bold bg-emerald-500/5">Vertex AI (Imagen 3 & Gemini Vision)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. BANNER FINAL CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-12 text-center bg-gradient-to-t from-slate-900 to-slate-950">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-display font-black text-white uppercase tracking-tight mb-6">
            Empieza a Visualizar y Crear Recorridos en 360°
          </h2>
          <p className="text-slate-400 text-sm font-light leading-relaxed mb-8">
            Ingresa a la biblioteca para inspeccionar las 5 tomas panorámicas en alta resolución o utiliza el Tour Studio para vincular las habitaciones y generar el código embed.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onNavigateToStudio}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-emerald-500/25 flex items-center gap-2 hover:scale-105"
            >
              <span>Abrir Tour Studio</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={onNavigateToLibrary}
              className="px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
            >
              <span>Explorar Biblioteca de Fotos</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
