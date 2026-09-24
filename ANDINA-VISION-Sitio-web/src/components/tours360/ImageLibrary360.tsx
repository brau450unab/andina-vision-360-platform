import React, { useState } from 'react';
import { 
  Compass, 
  Eye, 
  Download, 
  Share2, 
  Maximize2, 
  X, 
  Smartphone, 
  Layers, 
  Camera, 
  Tag, 
  Calendar, 
  HardDrive, 
  RotateCcw,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { REAL_PANORAMAS, PanoramaItem } from './panoramasData';

export const ImageLibrary360: React.FC = () => {
  const [items, setItems] = useState<PanoramaItem[]>(REAL_PANORAMAS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeViewerPano, setActiveViewerPano] = useState<PanoramaItem | null>(null);

  const [yaw, setYaw] = useState<number>(0);
  const [pitch, setPitch] = useState<number>(0);
  const [fov, setFov] = useState<number>(75);
  const [gyroActive, setGyroActive] = useState<boolean>(false);
  const [quality, setQuality] = useState<'auto' | 'low' | 'medium' | 'high' | 'ultra'>('ultra');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const filteredPanoramas = items.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesQuery = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  const toggleGyroscope = async () => {
    if (gyroActive) {
      setGyroActive(false);
      return;
    }

    if (typeof (DeviceOrientationEvent as any) !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const res = await (DeviceOrientationEvent as any).requestPermission();
        if (res === 'granted') {
          setGyroActive(true);
        } else {
          alert('Permiso de sensores de orientación denegado en Safari/iOS.');
        }
      } catch (err) {
        console.error('Error solicitando permisos:', err);
      }
    } else if ('ondeviceorientation' in window) {
      setGyroActive(true);
    } else {
      alert('Tu dispositivo no dispone de giroscopio web.');
    }
  };

  React.useEffect(() => {
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

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    if (!activeViewerPano || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = activeViewerPano.imageUrl;

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
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_pos + 1.0) * 0.5;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      varying vec2 v_uv;
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
  }, [activeViewerPano, yaw, pitch, fov]);

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <Camera size={14} />
              <span>REPOSITORIO DE ACTIVOS ESPACIALES 360°</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-white uppercase">
              Biblioteca de Imágenes 360°
            </h1>
            <p className="text-slate-400 text-sm mt-2 max-w-2xl font-light">
              Explora, previsualiza y gestiona las tomas omnidireccionales de alta definición (8K Equirrectangular) optimizadas para navegación con giroscopio y tours virtuales.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl">
              {filteredPanoramas.length} Panorámicas Activas
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 my-8 items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {[
              { id: 'all', label: 'Todos los Ambientes' },
              { id: 'living', label: 'Living & Comedor' },
              { id: 'cocina', label: 'Cocina & Hall' },
              { id: 'dormitorio', label: 'Dormitorios' },
              { id: 'bano', label: 'Baños' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === tab.id
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por ambiente o tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPanoramas.map((pano) => (
            <div 
              key={pano.id}
              className="group bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col justify-between"
            >
              <div className="relative aspect-[2/1] overflow-hidden bg-slate-950">
                <img 
                  src={pano.imageUrl} 
                  alt={pano.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>8K EQUIRRECTANGULAR</span>
                </div>

                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-300">
                  {pano.device}
                </div>

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setActiveViewerPano(pano);
                      setYaw((pano.initialYaw * Math.PI) / 180);
                      setPitch((pano.initialPitch * Math.PI) / 180);
                    }}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-emerald-500/30 transition-transform hover:scale-105"
                  >
                    <Eye size={15} />
                    <span>Inspeccionar 360°</span>
                  </button>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest mb-1">
                    {pano.environment}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                    {pano.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-light line-clamp-2 leading-relaxed mb-4">
                    {pano.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {pano.tags.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <HardDrive size={12} className="text-slate-500" />
                      {pano.fileSize}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-slate-500" />
                      {pano.uploadedAt}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setActiveViewerPano(pano);
                      setYaw((pano.initialYaw * Math.PI) / 180);
                      setPitch((pano.initialPitch * Math.PI) / 180);
                    }}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold"
                  >
                    <span>Ver</span>
                    <Maximize2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeViewerPano && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col">
          <div className="h-16 px-6 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <h2 className="text-sm font-bold text-white uppercase font-display">
                  {activeViewerPano.title}
                </h2>
                <span className="text-[11px] font-mono text-slate-400">
                  {activeViewerPano.resolution} • {activeViewerPano.device}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as any)}
                className="bg-slate-800 text-white text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 outline-none"
              >
                <option value="auto">Calidad: Auto</option>
                <option value="low">Baja (1080p)</option>
                <option value="medium">Media (4K)</option>
                <option value="high">Alta (8K)</option>
                <option value="ultra">Ultra (Original)</option>
              </select>

              <button
                onClick={toggleGyroscope}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium flex items-center gap-1.5 transition-all ${
                  gyroActive 
                    ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-lg shadow-emerald-500/30' 
                    : 'bg-slate-800 text-white border-slate-700 hover:border-emerald-500'
                }`}
                title="Activar giroscopio móvil"
              >
                <Smartphone size={14} />
                <span className="hidden sm:inline">{gyroActive ? 'Giroscopio ON' : 'Giroscopio'}</span>
              </button>

              <button
                onClick={() => {
                  setYaw((activeViewerPano.initialYaw * Math.PI) / 180);
                  setPitch((activeViewerPano.initialPitch * Math.PI) / 180);
                  setFov(75);
                }}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                title="Restablecer posición inicial"
              >
                <RotateCcw size={14} />
              </button>

              <button
                onClick={() => setActiveViewerPano(null)}
                className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/30 transition-colors"
                title="Cerrar visor"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden bg-black select-none">
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
                setYaw(prev => prev - dx * 0.0035);
                setPitch(prev => Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, prev - dy * 0.0035)));
              }}
              onPointerUp={() => setIsDragging(false)}
              className="w-full h-full cursor-grab active:cursor-grabbing block touch-none"
            />

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-2 pointer-events-none">
              <Compass size={14} className="text-emerald-400 animate-spin" />
              <span>Arrastra para rotar en 360° | Rueda del ratón para Zoom</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
