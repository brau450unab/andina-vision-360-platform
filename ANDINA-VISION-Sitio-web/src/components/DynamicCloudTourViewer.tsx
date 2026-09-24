import React, { useState, useEffect, useRef } from 'react';
import { 
  Maximize2, 
  RotateCcw, 
  Compass, 
  Smartphone, 
  ZoomIn, 
  ZoomOut, 
  Info, 
  ExternalLink, 
  Play, 
  X,
  Layers,
  ChevronRight
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
  id: 'tour_cordillera_dji',
  title: 'Vuelo Panorámico Dron DJI - Cordillera de los Andes',
  allow_gyroscope: true,
  first_scene_id: 'scene_aerial',
  scenes: [
    {
      id: 'scene_aerial',
      title: 'Cota Aérea 1500m (DJI Mavic 3E)',
      preview_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=2048&q=80',
      default_yaw: 0,
      default_pitch: -15,
      hotspots: [
        {
          id: 'hp1',
          type: 'info_popup',
          yaw: 35,
          pitch: -8,
          title: 'Estación de Monitoreo & Faena',
          description: 'Inspección de avance de obras civiles con fotogrametría de alta precisión.',
          youtube_video_id: 'dQw4w9WgXcQ',
          drive_url: 'https://drive.google.com',
          drive_label: 'Ver entregables en Google Drive'
        },
        {
          id: 'hp2',
          type: 'scene_link',
          yaw: -95,
          pitch: -12,
          tooltip: 'Descender a Zona de Acceso',
          target_scene_id: 'scene_ground'
        }
      ]
    },
    {
      id: 'scene_ground',
      title: 'Zona de Acceso y Casona (Toma Frontal)',
      preview_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=2048&q=80',
      default_yaw: 160,
      default_pitch: 0,
      hotspots: [
        {
          id: 'hp3',
          type: 'scene_link',
          yaw: 160,
          pitch: 15,
          tooltip: 'Subir a Cota Aérea 1500m',
          target_scene_id: 'scene_aerial'
        }
      ]
    }
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

  useEffect(() => {
    async function fetchTour() {
      try {
        const res = await fetch(`${apiBaseUrl}/embed/${tourId}`);
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
        console.log("Usando tour local de demostración:", err);
      }
    }
    fetchTour();
  }, [tourId, apiBaseUrl]);

  const toggleGyroscope = async () => {
    if (gyroActive) {
      setGyroActive(false);
      return;
    }

    if (typeof (DeviceOrientationEvent as any) !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setGyroActive(true);
        } else {
          alert('Permiso de sensores de orientación denegado en Safari/iOS.');
        }
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
      className={`relative w-full rounded-3xl overflow-hidden border border-emerald-500/30 bg-slate-950 select-none shadow-2xl ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[550px]'
      }`}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          setIsDragging(true);
          setDragStart({ x: e.clientX, y: e.clientY });
        }}
        onPointerMove={(e) => {
          if (!isDragging) return;
          const dx = e.clientX - dragStart.x;
          const dy = e.clientY - dragStart.y;
          setDragStart({ x: e.clientX, y: e.clientY });
          setYaw(prev => prev - dx * 0.004);
          setPitch(prev => Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, prev - dy * 0.004)));
        }}
        onPointerUp={() => setIsDragging(false)}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold">{tour.title}</span>
          <span className="text-white/50">| {currentScene.title}</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <select 
            value={quality}
            onChange={(e) => setQuality(e.target.value as any)}
            className="bg-slate-900/80 text-white text-xs rounded-xl px-2.5 py-1.5 border border-white/10 backdrop-blur-md cursor-pointer outline-none"
          >
            <option value="auto">Calidad: Auto</option>
            <option value="low">Baja (1080p)</option>
            <option value="medium">Media (4K)</option>
            <option value="high">Alta (8K)</option>
            <option value="ultra">Ultra (DJI Raw)</option>
          </select>

          <button
            onClick={toggleGyroscope}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-medium flex items-center gap-1.5 transition-all ${
              gyroActive 
                ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-lg shadow-emerald-500/30' 
                : 'bg-slate-900/80 text-white border-white/10 hover:border-emerald-500'
            }`}
          >
            <Smartphone size={14} />
            <span className="hidden sm:inline">{gyroActive ? 'Giroscopio ON' : 'Giroscopio'}</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-slate-900/80 text-white border border-white/10 hover:border-white/30 transition-colors"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

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
            style={{ left: `${x}px`, top: `${y}px` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group"
          >
            <div className={`p-2.5 rounded-full border-2 border-white shadow-xl transition-transform group-hover:scale-110 ${
              hp.type === 'scene_link' 
                ? 'bg-blue-600 animate-bounce' 
                : 'bg-amber-500 shadow-amber-500/50'
            }`}>
              {hp.type === 'scene_link' ? <ChevronRight size={16} className="text-white" /> : <Info size={16} className="text-white" />}
            </div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900/90 text-white text-xs px-2.5 py-1 rounded-md whitespace-nowrap border border-white/10 shadow-lg">
              {hp.tooltip || hp.title || 'Ver detalles'}
            </div>
          </button>
        );
      })}

      {activeModalHotspot && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-white relative shadow-2xl animate-in fade-in zoom-in-95">
            <button 
              onClick={() => setActiveModalHotspot(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-emerald-400 mb-2">
              {activeModalHotspot.title || 'Punto de Interés'}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              {activeModalHotspot.description}
            </p>

            {activeModalHotspot.youtube_video_id && (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 bg-black border border-white/10">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeModalHotspot.youtube_video_id}?autoplay=1&enablejsapi=1`}
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
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md"
              >
                <ExternalLink size={14} />
                <span>{activeModalHotspot.drive_label || 'Abrir en Google Drive'}</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
