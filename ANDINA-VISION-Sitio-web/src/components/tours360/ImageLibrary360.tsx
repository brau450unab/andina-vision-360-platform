import React, { useState, useEffect, useRef } from 'react';
import { 
  Folder, UploadCloud, Search, Filter, Image as ImageIcon,
  MoreVertical, Clock, MapPin, Eye, ExternalLink, X
} from 'lucide-react';
import { REAL_PANORAMAS } from './panoramasData';

export const ImageLibrary360: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<typeof REAL_PANORAMAS[0] | null>(null);

  return (
    <div className="w-full h-screen bg-[#050505] text-white flex flex-col font-sans overflow-hidden">
      
      {/* HEADER */}
      <header className="h-[72px] shrink-0 border-b border-white/5 px-6 flex items-center justify-between bg-black/40 backdrop-blur-md z-20">
        <div>
          <h1 className="text-lg font-display font-bold text-white tracking-wide">Biblioteca 360°</h1>
          <p className="text-xs font-mono text-emerald-400 opacity-80 uppercase tracking-widest mt-0.5">
            12 Panoramas Indexados • GCP Storage
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              placeholder="Buscar por cliente, locación..." 
              className="bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500/50 w-64 transition-colors"
            />
          </div>
          <button className="h-9 px-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all">
            <UploadCloud size={14} /> Subir 8K
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR FOLDERS */}
        <aside className="w-64 shrink-0 border-r border-white/5 bg-black/20 p-4 flex flex-col gap-6 overflow-y-auto z-10 custom-scrollbar">
          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 font-bold mb-3 px-2">Proyectos Recientes</h3>
            <div className="space-y-1">
              {['Edificio Vista Cordillera', 'Hotel Marina Bay', 'Faena Norte', 'Piloto Inmobiliaria'].map((proj, i) => (
                <button key={i} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 text-left transition-colors group">
                  <Folder size={14} className="text-white/40 group-hover:text-emerald-400 transition-colors" />
                  <span className="text-xs text-white/70 group-hover:text-white font-medium truncate">{proj}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* GRID VIEW */}
        <main className="flex-1 overflow-y-auto p-6 z-10 custom-scrollbar relative">
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-display font-bold text-white">Todos los Panoramas</h2>
            <button className="flex items-center gap-2 text-xs font-mono text-white/50 hover:text-white transition-colors">
              <Filter size={14} /> Filtrar
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {REAL_PANORAMAS.map(pano => (
              <div 
                key={pano.id} 
                onClick={() => setSelectedImage(pano)}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-white/5 border border-white/5 hover:border-emerald-500/50 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10"
              >
                <img 
                  src={pano.url} 
                  alt={pano.title}
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                />
                
                {/* 360 Badge */}
                <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10 text-[9px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  360°
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent translate-y-2 group-hover:translate-y-0 transition-transform">
                  <h3 className="text-sm font-bold text-white truncate mb-1">{pano.title}</h3>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-white/50">
                    <span className="flex items-center gap-1"><MapPin size={10} /> {pano.location}</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {pano.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </main>
      </div>

      {/* QUICK PREVIEW MODAL */}
      {selectedImage && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-6xl h-full max-h-[85vh] bg-[#0a0a0a] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden relative">
            
            <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 shrink-0 bg-black/40">
              <div className="flex items-center gap-3">
                <h3 className="font-display font-bold text-sm text-white">{selectedImage.title}</h3>
                <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-mono uppercase text-white/50 border border-white/10">
                  {selectedImage.resolution}
                </span>
              </div>
              <button 
                onClick={() => setSelectedImage(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </header>

            <div className="flex-1 relative bg-black">
              <PreviewWebGL url={selectedImage.url} />
            </div>

            <footer className="h-16 border-t border-white/10 px-6 flex items-center justify-between shrink-0 bg-black/40">
              <div className="flex items-center gap-6 text-xs font-mono text-white/40">
                <span className="flex items-center gap-2"><MapPin size={14} /> {selectedImage.location}</span>
                <span className="flex items-center gap-2"><Clock size={14} /> {selectedImage.date}</span>
                <span className="flex items-center gap-2"><HardDrive size={14} /> {selectedImage.size}</span>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold uppercase transition-colors">
                  Eliminar
                </button>
                <button className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold uppercase tracking-wider transition-colors">
                  Usar en Tour
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}

    </div>
  );
};

// MINI WEBGL VIEWER FOR PREVIEW
const PreviewWebGL = ({ url }: { url: string }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    setImageError(false);
    setImageLoaded(false);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;

    let texture = gl.createTexture();
    
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // 🔥 FIJADO
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      setImageLoaded(true);
    };

    img.onerror = () => {
      setImageError(true);
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

    let canvasWidth = canvas.clientWidth;
    let canvasHeight = canvas.clientHeight;
    
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.target === canvas) {
          canvasWidth = entry.contentRect.width;
          canvasHeight = entry.contentRect.height;
        }
      }
    });
    resizeObserver.observe(canvas);

    let animId: number;
    const render = () => {
      if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(prog);
      const posAttr = gl.getAttribLocation(prog, 'a_pos');
      gl.enableVertexAttribArray(posAttr);
      gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(gl.getUniformLocation(prog, 'u_res'), canvas.width, canvas.height);
      gl.uniform1f(gl.getUniformLocation(prog, 'u_yaw'), yaw);
      gl.uniform1f(gl.getUniformLocation(prog, 'u_pitch'), pitch);
      gl.uniform1f(gl.getUniformLocation(prog, 'u_fov'), 75);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [url, yaw, pitch]);

  return (
    <>
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center gap-4 bg-black">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {imageError && (
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center gap-4 bg-black text-red-500">
          <X size={32} />
          <span className="text-xs font-mono uppercase tracking-widest text-red-400">Error CORS / Carga</span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => { setIsDragging(true); setDragStart({ x: e.clientX, y: e.clientY }); }}
        onPointerMove={(e) => {
          if (!isDragging) return;
          const dx = e.clientX - dragStart.x;
          const dy = e.clientY - dragStart.y;
          setDragStart({ x: e.clientX, y: e.clientY });
          setYaw(y => y - dx * 0.005);
          setPitch(p => Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, p - dy * 0.005)));
        }}
        onPointerUp={() => setIsDragging(false)}
        className="w-full h-full cursor-grab active:cursor-grabbing z-10 block"
      />
    </>
  );
};
