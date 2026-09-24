import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Eye, X, Smartphone, Download, 
  RotateCcw, Maximize2, Tag, Calendar, Layers, Search 
} from 'lucide-react';
import { REAL_PANORAMAS, PanoramaItem } from './panoramasData';

// ── Intersection Observer Hook for Scroll Animation ──────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

export const ImageLibrary360: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePano, setActivePano] = useState<PanoramaItem | null>(null);

  // Viewer state
  const [yaw, setYaw] = useState<number>(0);
  const [pitch, setPitch] = useState<number>(0);
  const [fov, setFov] = useState<number>(75);
  const [gyroActive, setGyroActive] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const filteredPanos = REAL_PANORAMAS.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesQuery = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  // ── GYROSCOPE LOGIC ───────────────────────────────────────
  const toggleGyroscope = async () => {
    if (gyroActive) {
      setGyroActive(false);
      return;
    }
    if (typeof (DeviceOrientationEvent as any) !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const res = await (DeviceOrientationEvent as any).requestPermission();
        if (res === 'granted') setGyroActive(true);
        else alert('Permiso de sensores denegado en Safari/iOS.');
      } catch (err) {
        console.error('Error:', err);
      }
    } else if ('ondeviceorientation' in window) {
      setGyroActive(true);
    } else {
      alert('Tu dispositivo no dispone de giroscopio web.');
    }
  };

  useEffect(() => {
    if (!gyroActive) return;
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null && e.beta !== null) {
        setYaw((-e.alpha * Math.PI) / 180);
        setPitch(Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, ((e.beta - 90) * Math.PI) / 180)));
      }
    };
    window.addEventListener('deviceorientation', onOrient);
    return () => window.removeEventListener('deviceorientation', onOrient);
  }, [gyroActive]);

  // ── WEBGL RENDERER ────────────────────────────────────────
  useEffect(() => {
    if (!activePano || !canvasRef.current) {
      setImageLoaded(false);
      return;
    }
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = activePano.imageUrl;

    let texture = gl.createTexture();
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      setImageLoaded(true);
    };

    const vsSource = `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_pos + 1.0) * 0.5;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      uniform sampler2D u_img;
      uniform vec2 u_res;
      uniform float u_yaw;
      uniform float u_pitch;
      uniform float u_fov;
      #define PI 3.14159265359

      void main() {
        vec2 uv = (gl_FragCoord.xy / u_res) * 2.0 - 1.0;
        uv.x *= u_res.x / u_res.y;

        float tanFov = tan(radians(u_fov) * 0.5);
        vec3 ray = normalize(vec3(uv * tanFov, 1.0));

        float cp = cos(u_pitch);
        float sp = sin(u_pitch);
        mat3 rotP = mat3(1.0, 0.0, 0.0, 0.0, cp, -sp, 0.0, sp, cp);

        float cy = cos(u_yaw);
        float sy = sin(u_yaw);
        mat3 rotY = mat3(cy, 0.0, sy, 0.0, 1.0, 0.0, -sy, 0.0, cy);

        vec3 dir = rotY * rotP * ray;
        float lon = atan(dir.x, dir.z);
        float lat = asin(clamp(dir.y, -1.0, 1.0));

        vec2 panoUv = vec2((lon / (2.0 * PI)) + 0.5, (lat / PI) + 0.5);
        gl_FragColor = texture2D(u_img, panoUv);
      }
    `;

    const vShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vShader, vsSource);
    gl.compileShader(vShader);

    const fShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fShader, fsSource);
    gl.compileShader(fShader);

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vShader);
    gl.attachShader(prog, fShader);
    gl.linkProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

    let animId: number;
    const render = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(prog);

      const posAttr = gl.getAttribLocation(prog, 'a_pos');
      gl.enableVertexAttribArray(posAttr);
      gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(gl.getUniformLocation(prog, 'u_res'), canvas.width, canvas.height);
      gl.uniform1f(gl.getUniformLocation(prog, 'u_yaw'), yaw);
      gl.uniform1f(gl.getUniformLocation(prog, 'u_pitch'), pitch);
      gl.uniform1f(gl.getUniformLocation(prog, 'u_fov'), fov);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activePano, yaw, pitch, fov]);

  return (
    <div className="w-full min-h-screen text-white pt-12 pb-32 px-4 sm:px-6 lg:px-12 relative">
      <div className="max-w-[1400px] mx-auto relative z-10">
        
        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-[0.2em] mb-4"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399' }}
            >
              <Camera size={11} />
              <span>Biblioteca de Activos 360°</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tight uppercase leading-tight mb-4">
              Imágenes en Alta Definición
            </h1>
            <p className="text-white/40 text-sm font-mono leading-relaxed">
              Explora, previsualiza y gestiona tomas equirrectangulares en resolución original (8K). Renderizado GPU-accelerated.
            </p>
          </div>

          {/* Stats Box */}
          <div
            className="flex items-center gap-4 px-6 py-4 rounded-2xl shrink-0"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div>
              <div className="text-2xl font-display font-black text-white">{filteredPanos.length}</div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Panorámicas</div>
            </div>
            <div className="w-px h-10 bg-white/10 mx-2" />
            <div>
              <div className="text-2xl font-display font-black text-white">8K</div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">Max Res</div>
            </div>
          </div>
        </div>

        {/* ── FILTERS ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 justify-between items-start md:items-center">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'living', label: 'Living & Comedor' },
              { id: 'cocina', label: 'Cocina & Hall' },
              { id: 'dormitorio', label: 'Dormitorios' },
              { id: 'bano', label: 'Baños' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className="px-4 py-2 rounded-full text-xs font-mono transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] whitespace-nowrap shrink-0"
                style={selectedCategory === tab.id
                  ? { background: 'white', color: '#050505', fontWeight: 'bold' }
                  : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72 shrink-0">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Buscar por tag o título..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-xs font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all"
            />
          </div>
        </div>

        {/* ── ASYMMETRICAL BENTO GRID ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {filteredPanos.map((pano, idx) => {
            const { ref, visible } = useReveal();
            
            // Layout variance:
            // First item: col-8 (large hero)
            // Second item: col-4 (tall sidebar)
            // Remaining items: col-4 (standard bento)
            const colSpan = idx === 0 ? 'md:col-span-12 lg:col-span-8' : 'md:col-span-6 lg:col-span-4';
            const isHero = idx === 0;

            return (
              <div
                key={pano.id}
                ref={ref}
                className={`reveal-entry ${colSpan}`}
                style={{
                  transitionDelay: \`\${(idx % 3) * 100}ms\`,
                  ...(visible ? { opacity: 1, transform: 'translateY(0)' } : {})
                }}
              >
                <div className="double-bezel-outer h-full group cursor-pointer" onClick={() => { setActivePano(pano); setYaw(0); setPitch(0); }}>
                  <div className="double-bezel-inner h-full flex flex-col" style={{ background: '#0a0e14' }}>
                    
                    {/* Image Thumbnail (2:1 or custom aspect based on hero) */}
                    <div 
                      className="pano-thumb-container relative overflow-hidden"
                      style={{ aspectRatio: isHero ? '21/9' : '3/2' }}
                    >
                      <img src={pano.imageUrl} alt={pano.title} loading="lazy" />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/90 text-slate-950 flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                          <Eye size={20} />
                        </div>
                      </div>

                      {/* Resolution badge */}
                      <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest">
                        8K Ultra HD
                      </div>
                    </div>

                    {/* Meta Data Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-cyan-400">
                          {pano.category}
                        </span>
                        <span className="text-[10px] font-mono text-white/30 flex items-center gap-1">
                          <Calendar size={10} /> {pano.date}
                        </span>
                      </div>
                      <h3 className="text-lg font-display font-bold text-white leading-tight mb-2 group-hover:text-emerald-300 transition-colors">
                        {pano.title}
                      </h3>
                      <p className="text-white/40 text-[11px] font-mono line-clamp-2 mb-4 flex-1">
                        {pano.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-auto">
                        {pano.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-sm bg-white/5 border border-white/5 text-[9px] font-mono text-white/50 uppercase tracking-wider">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}

          {filteredPanos.length === 0 && (
            <div className="col-span-full py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 mx-auto mb-4">
                <Search size={24} />
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-2">No se encontraron panorámicas</h3>
              <p className="text-white/40 font-mono text-xs">Intenta con otros filtros o términos de búsqueda.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL FULLSCREEN VIEWER ─────────────────────────────────────── */}
      {activePano && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-500">
          
          {/* Main Viewer Bezel */}
          <div className="w-full h-full double-bezel-outer !p-2 relative flex flex-col shadow-2xl">
            <div className="double-bezel-inner relative flex-1 bg-[#050505] overflow-hidden"
                 onMouseDown={(e) => { setIsDragging(true); setDragStart({ x: e.clientX, y: e.clientY }); }}
                 onMouseMove={(e) => {
                   if (!isDragging || gyroActive) return;
                   setYaw(y => y + (dragStart.x - e.clientX) * 0.005);
                   setPitch(p => Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, p + (e.clientY - dragStart.y) * 0.005)));
                   setDragStart({ x: e.clientX, y: e.clientY });
                 }}
                 onMouseUp={() => setIsDragging(false)}
                 onMouseLeave={() => setIsDragging(false)}
                 onTouchStart={(e) => { setIsDragging(true); setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY }); }}
                 onTouchMove={(e) => {
                   if (!isDragging || gyroActive) return;
                   setYaw(y => y + (dragStart.x - e.touches[0].clientX) * 0.005);
                   setPitch(p => Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, p + (e.touches[0].clientY - dragStart.y) * 0.005)));
                   setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
                 }}
                 onTouchEnd={() => setIsDragging(false)}
                 onWheel={(e) => {
                   if (gyroActive) return;
                   setFov(f => Math.max(30, Math.min(110, f + e.deltaY * 0.05)));
                 }}
            >
              
              {/* Fallback Loader */}
              {!imageLoaded && (
                <div className="absolute inset-0 skeleton-shimmer z-0 flex flex-col items-center justify-center gap-4">
                  <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-[0.2em] animate-pulse">
                    Cargando Textura 8K...
                  </div>
                </div>
              )}

              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-10" />
              
              {/* Crosshair */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
                <div className="absolute w-8 h-8 rounded-full border border-white/20" />
              </div>

              {/* HUD OVERLAY - Top Bar */}
              <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-30 flex justify-between items-start pointer-events-none">
                <div className="pointer-events-auto">
                  <h2 className="text-xl sm:text-2xl font-display font-black text-white drop-shadow-md">
                    {activePano.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-emerald-400 font-bold uppercase">
                      Equirrectangular HDR
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white/70">
                      {activePano.category}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => { setActivePano(null); setImageLoaded(false); }}
                  className="pointer-events-auto w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all hover:rotate-90 ease-[cubic-bezier(0.32,0.72,0,1)] duration-500"
                >
                  <X size={18} />
                </button>
              </div>

              {/* HUD OVERLAY - Bottom Controls */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
                <div className="flex items-center gap-2 p-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl">
                  
                  <button 
                    onClick={() => { setYaw(0); setPitch(0); setFov(75); }}
                    className="p-3 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    title="Restablecer vista"
                  >
                    <RotateCcw size={16} />
                  </button>
                  
                  <div className="w-px h-6 bg-white/10" />

                  <button 
                    onClick={toggleGyroscope}
                    className={`flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full transition-all ${
                      gyroActive 
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                        : 'hover:bg-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    <Smartphone size={16} />
                    <span className="text-xs font-mono">{gyroActive ? 'Gyro On' : 'Activar Gyro'}</span>
                  </button>

                  <div className="w-px h-6 bg-white/10" />

                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = activePano.imageUrl;
                      link.download = \`\${activePano.id}_8K.jpg\`;
                      link.click();
                    }}
                    className="p-3 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    title="Descargar Original 8K"
                  >
                    <Download size={16} />
                  </button>

                </div>
              </div>
              
              {/* Data Overlay Bottom Right */}
              <div className="absolute bottom-6 right-6 z-30 pointer-events-none hidden sm:block">
                <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-3 text-[10px] font-mono text-white/50 text-right space-y-1">
                  <div>YAW: {((yaw * 180) / Math.PI).toFixed(1)}°</div>
                  <div>PITCH: {((pitch * 180) / Math.PI).toFixed(1)}°</div>
                  <div>FOV: {fov.toFixed(1)}°</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};