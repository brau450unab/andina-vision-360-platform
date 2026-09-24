import React, { useState, useEffect, useRef } from 'react';
import { 
  Maximize2, RotateCcw, Smartphone, Info, 
  ExternalLink, X, ChevronRight, Minimize2
} from 'lucide-react';

interface Hotspot {
  id: string;
  type: 'scene_link' | 'info_popup';
  yaw: number;
  pitch: number;
  tooltip?: string;
  target_scene_id?: string;
  title?: string;
  description?: string;
  youtube_video_id?: string;
  drive_url?: string;
  drive_label?: string;
}

interface Scene {
  id: string;
  title: string;
  preview_url?: string;
  tiles_base_url?: string;
  default_yaw?: number;
  default_pitch?: number;
  hotspots?: Hotspot[];
}

interface TourConfig {
  id: string;
  title: string;
  allow_gyroscope?: boolean;
  first_scene_id?: string;
  scenes: Scene[];
}

interface DynamicCloudTourViewerProps {
  tourId?: string;
  apiBaseUrl?: string;
  fallbackTour?: TourConfig;
}

const DEFAULT_DEMO_TOUR: TourConfig = {
  id: 'tour_demo',
  title: 'Demo Tour',
  scenes: [
    { id: 's1', title: 'Scene 1', preview_url: '', default_yaw: 0, default_pitch: 0 }
  ]
};

export const DynamicCloudTourViewer: React.FC<DynamicCloudTourViewerProps> = ({
  tourId = 'tour_cordillera_dji',
  apiBaseUrl = 'http://localhost:8080/api/v1',
  fallbackTour = DEFAULT_DEMO_TOUR
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [tour, setTour] = useState<TourConfig>(fallbackTour);
  const [currentScene, setCurrentScene] = useState<Scene>(fallbackTour.scenes[0]);
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [fov, setFov] = useState(75);
  const [quality, setQuality] = useState<'auto' | 'low' | 'medium' | 'high' | 'ultra'>('auto');

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [gyroActive, setGyroActive] = useState(false);
  const [activeModalHotspot, setActiveModalHotspot] = useState<Hotspot | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // New state for loader
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    async function fetchTour() {
      try {
        const res = await fetch(`\${apiBaseUrl}/embed/\${tourId}`);
        if (res.ok) {
          const data = await res.json();
          setTour(data);
          if (data.scenes && data.scenes.length > 0) {
            const first = data.scenes.find((s: Scene) => s.id === data.first_scene_id) || data.scenes[0];
            setCurrentScene(first);
            setYaw(first.default_yaw || 0);
            setPitch(first.default_pitch || 0);
          }
        }
      } catch (err) {
        console.log("Usando tour local");
      }
    }
    fetchTour();
  }, [tourId, apiBaseUrl]);

  const toggleGyroscope = async () => {
    if (gyroActive) { setGyroActive(false); return; }
    if (typeof (DeviceOrientationEvent as any) !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') setGyroActive(true);
        else alert('Permiso de sensores denegado.');
      } catch (e) {
        console.error('Error al solicitar permiso de orientación:', e);
      }
    } else if ('ondeviceorientation' in window) {
      setGyroActive(true);
    } else {
      alert('Tu navegador o dispositivo no dispone de giroscopio.');
    }
  };

  useEffect(() => {
    if (!gyroActive) return;
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null && e.beta !== null) {
        setYaw((-e.alpha * Math.PI) / 180);
        setPitch(Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, ((e.beta - 90) * Math.PI) / 180)));
      }
    };
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [gyroActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    setImageLoaded(false);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentScene.preview_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=2048&q=80';
    
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
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      varying vec2 v_uv;
      uniform sampler2D u_image;
      uniform vec2 u_resolution;
      uniform float u_yaw;
      uniform float u_pitch;
      uniform float u_fov;
      #define PI 3.14159265359

      void main() {
        vec2 uv = (gl_FragCoord.xy / u_resolution) * 2.0 - 1.0;
        uv.x *= u_resolution.x / u_resolution.y;

        float tanFov = tan(radians(u_fov) * 0.5);
        vec3 ray = normalize(vec3(uv * tanFov, 1.0));

        float cp = cos(u_pitch);
        float sp = sin(u_pitch);
        mat3 rotPitch = mat3(1.0, 0.0, 0.0, 0.0, cp, -sp, 0.0, sp, cp);

        float cy = cos(u_yaw);
        float sy = sin(u_yaw);
        mat3 rotYaw = mat3(cy, 0.0, sy, 0.0, 1.0, 0.0, -sy, 0.0, cy);

        vec3 dir = rotYaw * rotPitch * ray;
        float longitude = atan(dir.x, dir.z);
        float latitude = asin(clamp(dir.y, -1.0, 1.0));

        vec2 panoUv = vec2((longitude / (2.0 * PI)) + 0.5, (latitude / PI) + 0.5);
        gl_FragColor = texture2D(u_image, panoUv);
      }
    `;

    const vShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vShader, vsSource);
    gl.compileShader(vShader);

    const fShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fShader, fsSource);
    gl.compileShader(fShader);

    const program = gl.createProgram()!;
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

    let animId: number;
    const render = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);
      const posAttr = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(posAttr);
      gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), canvas.width, canvas.height);
      gl.uniform1f(gl.getUniformLocation(program, 'u_yaw'), yaw);
      gl.uniform1f(gl.getUniformLocation(program, 'u_pitch'), pitch);
      gl.uniform1f(gl.getUniformLocation(program, 'u_fov'), fov);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [currentScene, yaw, pitch, fov]);

  const handleSceneTransition = (targetId: string) => {
    const nextScene = tour.scenes.find(s => s.id === targetId);
    if (nextScene) {
      setCurrentScene(nextScene);
      setYaw((nextScene.default_yaw || 0) * (Math.PI / 180));
      setPitch((nextScene.default_pitch || 0) * (Math.PI / 180));
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none \${
        isFullscreen 
          ? 'fixed inset-0 z-50 rounded-none h-screen bg-[#050505]' 
          : 'h-[550px] bg-[#050505]'
      }`}
    >
      {/* ── LOADER SHIMMER ────────────────────────────────────── */}
      {!imageLoaded && (
        <div className="absolute inset-0 skeleton-shimmer z-0 flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-[0.2em] animate-pulse">
            Cargando Textura 8K...
          </div>
        </div>
      )}

      {/* ── WEBGL CANVAS ────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => { setIsDragging(true); setDragStart({ x: e.clientX, y: e.clientY }); }}
        onPointerMove={(e) => {
          if (!isDragging) return;
          const dx = e.clientX - dragStart.x;
          const dy = e.clientY - dragStart.y;
          setDragStart({ x: e.clientX, y: e.clientY });
          setYaw(prev => prev - dx * 0.004);
          setPitch(prev => Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, prev - dy * 0.004)));
        }}
        onPointerUp={() => setIsDragging(false)}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-10"
      />

      {/* Crosshair (subtle) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
        <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
      </div>

      {/* ── TOP HUD ─────────────────────────────────────────── */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-none z-20">
        <div 
          className="flex flex-col gap-1 pointer-events-auto px-4 py-2 rounded-2xl backdrop-blur-xl"
          style={{ background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
        >
          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {tour.title}
          </div>
          <div className="text-sm font-display font-bold text-white">
            {currentScene.title}
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Quality Selector */}
          <select 
            value={quality}
            onChange={(e) => setQuality(e.target.value as any)}
            className="text-[11px] font-mono rounded-full px-3 py-1.5 backdrop-blur-xl cursor-pointer outline-none transition-all"
            style={{ background: 'rgba(0,0,0,0.65)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <option value="auto">Auto</option>
            <option value="ultra">Ultra (8K)</option>
          </select>

          {/* Gyro Toggle */}
          <button
            onClick={toggleGyroscope}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={gyroActive 
              ? { background: '#10b981', color: '#000', fontWeight: 'bold', boxShadow: '0 0 20px rgba(16,185,129,0.4)' }
              : { background: 'rgba(0,0,0,0.65)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }
            }
          >
            <Smartphone size={13} />
            <span className="hidden sm:inline">{gyroActive ? 'Gyro ON' : 'Activar Gyro'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-500 hover:bg-white/10"
            style={{ background: 'rgba(0,0,0,0.65)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* ── BOTTOM CONTROLS HUD ─────────────────────────────── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div 
          className="pointer-events-auto flex items-center gap-1 p-1 rounded-full backdrop-blur-xl"
          style={{ background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <button 
            onClick={() => { setYaw(0); setPitch(0); setFov(75); }}
            className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            title="Restablecer vista"
          >
            <RotateCcw size={16} />
          </button>
          <div className="w-px h-5 bg-white/10 mx-1" />
          <div className="px-3 py-1 text-[10px] font-mono text-white/40">
            Arrástralo para explorar
          </div>
        </div>
      </div>

      {/* ── RENDER HOTSPOTS ─────────────────────────────────── */}
      {currentScene.hotspots?.map((hp) => {
        const radYaw = yaw;
        const radPitch = pitch;
        const spotYaw = (hp.yaw * Math.PI) / 180;
        const spotPitch = (hp.pitch * Math.PI) / 180;

        let deltaYaw = spotYaw - radYaw;
        while (deltaYaw > Math.PI) deltaYaw -= 2 * Math.PI;
        while (deltaYaw < -Math.PI) deltaYaw += 2 * Math.PI;

        if (Math.cos(deltaYaw) <= 0.1) return null;

        const width = containerRef.current?.clientWidth || 800;
        const height = containerRef.current?.clientHeight || 500;
        const radFov = (fov * Math.PI) / 180;

        const x = width / 2 + Math.tan(deltaYaw) * (width / (2 * Math.tan(radFov / 2)));
        const y = height / 2 - Math.tan(spotPitch - radPitch) * (height / (2 * Math.tan(radFov / 2)));

        if (x < 20 || x > width - 20 || y < 20 || y > height - 20) return null;

        return (
          <button
            key={hp.id}
            onClick={() => {
              if (hp.type === 'scene_link' && hp.target_scene_id) {
                handleSceneTransition(hp.target_scene_id);
              } else {
                setActiveModalHotspot(hp);
              }
            }}
            style={{ left: `\${x}px`, top: `\${y}px` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
          >
            {/* Magnetic Button Hover Physics container */}
            <div className="relative group-hover:scale-105 group-active:scale-[0.95] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]">
              {/* Ripple ring for scene links */}
              {hp.type === 'scene_link' && (
                <div className="absolute inset-0 rounded-full border border-cyan-400 animate-ping opacity-50" />
              )}
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xl relative z-10"
                style={hp.type === 'scene_link'
                  ? { background: 'rgba(6,182,212,0.85)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff' }
                  : { background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(255,255,255,1)', color: '#050505' }
                }
              >
                {hp.type === 'scene_link' ? <ChevronRight size={18} /> : <Info size={18} />}
              </div>
            </div>
            
            {/* Premium Tooltip */}
            <div 
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            >
              <div 
                className="px-3 py-1.5 rounded-lg backdrop-blur-xl whitespace-nowrap text-[11px] font-mono font-bold text-white shadow-2xl"
                style={{ background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {hp.tooltip || hp.title || 'Ver detalles'}
              </div>
            </div>
          </button>
        );
      })}

      {/* ── INTERACTIVE INFO MODAL ───────────────────────────── */}
      {activeModalHotspot && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div 
            className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-500"
            style={{
              padding: '6px',
              borderRadius: '2rem',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 32px 80px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.02)',
            }}
          >
            <div 
              className="relative flex flex-col p-6 sm:p-8"
              style={{
                borderRadius: 'calc(2rem - 6px)',
                background: 'linear-gradient(160deg, rgba(14,20,32,0.95) 0%, rgba(8,11,18,0.98) 100%)',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.08)',
              }}
            >
              <button 
                onClick={() => setActiveModalHotspot(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all hover:rotate-90 duration-500"
              >
                <X size={16} />
              </button>

              <div className="inline-flex items-center gap-2 px-2.5 py-1 mb-4 rounded-full text-[10px] font-mono font-bold uppercase w-fit"
                   style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
                Información del Punto
              </div>
              
              <h3 className="text-xl font-display font-bold text-white mb-2 leading-tight">
                {activeModalHotspot.title || 'Punto de Interés'}
              </h3>
              <p className="text-[11px] font-mono text-white/50 leading-relaxed mb-6">
                {activeModalHotspot.description}
              </p>

              {activeModalHotspot.youtube_video_id && (
                <div 
                  className="relative w-full aspect-video rounded-xl overflow-hidden mb-5 bg-black"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/\${activeModalHotspot.youtube_video_id}?autoplay=1&enablejsapi=1`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Video 360"
                  />
                </div>
              )}

              {activeModalHotspot.drive_url && (
                <a
                  href={activeModalHotspot.drive_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between w-full p-4 rounded-xl transition-all duration-500"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <ExternalLink size={14} />
                    </div>
                    <span className="text-xs font-mono font-semibold text-white/80 group-hover:text-white">
                      {activeModalHotspot.drive_label || 'Abrir en Google Drive'}
                    </span>
                  </div>
                  <ChevronRight size={14} className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};