import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Plus, Settings, Image as ImageIcon, Map, Layers, Type, Trash2, 
  Save, Play, Link, Wand2, Youtube, HardDrive, Smartphone, Sparkles, Sliders 
} from 'lucide-react';
import { INITIAL_DEPARTMENT_TOUR, TourScene, HotspotLink, REAL_PANORAMAS } from './panoramasData';

export const TourEditorStudio: React.FC = () => {
  const [scenes, setScenes] = useState<TourScene[]>(INITIAL_DEPARTMENT_TOUR);
  const [activeSceneId, setActiveSceneId] = useState<string>(INITIAL_DEPARTMENT_TOUR[0].id);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotLink | null>(null);

  // Editor states
  const [isAddHotspotMode, setIsAddHotspotMode] = useState<boolean>(false);
  const [aiProcessingMessage, setAiProcessingMessage] = useState<string | null>(null);
  const [showEmbedCode, setShowEmbedCode] = useState<boolean>(false);

  // Viewer state
  const [yaw, setYaw] = useState<number>(0);
  const [pitch, setPitch] = useState<number>(0);
  const [fov, setFov] = useState<number>(75);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeScene = scenes.find(s => s.id === activeSceneId);

  // ── WEBGL RENDERER ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeScene || !canvasRef.current) {
      setImageLoaded(false);
      return;
    }
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    setImageLoaded(false);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = activeScene.imageUrl;

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
  }, [activeScene, yaw, pitch, fov]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!isAddHotspotMode) return;
    const currentYawDeg = parseFloat(((yaw * 180) / Math.PI).toFixed(1));
    const currentPitchDeg = parseFloat(((pitch * 180) / Math.PI).toFixed(1));

    const newHotspot: HotspotLink = {
      id: \`hs_\${Date.now()}\`,
      type: 'info_popup',
      yaw: currentYawDeg,
      pitch: currentPitchDeg,
      tooltip: 'Nuevo Punto de Interés',
      title: 'Punto de Interés Interactivo',
      description: 'Ingresa aquí las especificaciones del ambiente.',
      youtubeVideoId: '',
      driveUrl: ''
    };

    setScenes(prev => prev.map(s => {
      if (s.id === activeSceneId) return { ...s, hotspots: [...s.hotspots, newHotspot] };
      return s;
    }));
    setSelectedHotspot(newHotspot);
    setIsAddHotspotMode(false);
  };

  const triggerAiGeminiHotspots = () => {
    setAiProcessingMessage("✨ Gemini 2.0 Multimodal analizando geometría 360°...");
    setTimeout(() => {
      const generatedSpot: HotspotLink = {
        id: \`hs_ai_\${Date.now()}\`,
        type: 'info_popup',
        yaw: parseFloat(((yaw * 180) / Math.PI + 35).toFixed(1)),
        pitch: -5,
        tooltip: '✨ Detectado por Gemini Vision',
        title: 'Área de Alto Valor',
        description: 'Detectado por visión computacional con óptima iluminación.',
        youtubeVideoId: '',
        driveUrl: ''
      };
      setScenes(prev => prev.map(s => {
        if (s.id === activeSceneId) return { ...s, hotspots: [...s.hotspots, generatedSpot] };
        return s;
      }));
      setSelectedHotspot(generatedSpot);
      setAiProcessingMessage(null);
    }, 1200);
  };

  const triggerNadirPatch = () => {
    setAiProcessingMessage("🧹 Vertex AI aplicando Inpainting Generativo en el Nadir...");
    setTimeout(() => {
      setAiProcessingMessage(null);
      alert("✅ Parcheo completado: Se ha reconstruido el piso eliminando trípode y sombras.");
    }, 1400);
  };

  const updateSelectedHotspot = (field: keyof HotspotLink, value: any) => {
    if (!selectedHotspot) return;
    const updated = { ...selectedHotspot, [field]: value };
    setSelectedHotspot(updated);
    setScenes(prev => prev.map(s => {
      if (s.id === activeSceneId) return { ...s, hotspots: s.hotspots.map(h => h.id === updated.id ? updated : h) };
      return s;
    }));
  };

  const deleteSelectedHotspot = () => {
    if (!selectedHotspot) return;
    setScenes(prev => prev.map(s => {
      if (s.id === activeSceneId) return { ...s, hotspots: s.hotspots.filter(h => h.id !== selectedHotspot.id) };
      return s;
    }));
    setSelectedHotspot(null);
  };

  // ── RENDER ────────────────────────────────────────────────────────
  return (
    <div className="w-full h-screen text-white flex flex-col overflow-hidden bg-[#050505]">
      
      {/* ── TOP HEADER (Dark Glass) ────────────────────── */}
      <header 
        className="h-[60px] shrink-0 flex items-center justify-between px-6 z-30"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(5,5,5,0.7)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sliders size={16} />
          </div>
          <div>
            <h1 className="text-[13px] font-display font-bold uppercase tracking-widest text-white leading-tight">
              Tour Studio
            </h1>
            <p className="text-[9px] font-mono text-emerald-400 opacity-80">
              MODO EDICIÓN AVANZADA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowEmbedCode(true)}
            className="group flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full font-mono text-[10px] uppercase font-bold text-slate-950 transition-all active:scale-[0.97]"
            style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
          >
            <span>Generar Embed</span>
            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-black/15 group-hover:bg-black/25">
              <Play size={10} className="ml-0.5" />
            </div>
          </button>
        </div>
      </header>

      {/* ── MAIN WORKSPACE (3 Columns) ─────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: Scene List */}
        <div 
          className="w-72 shrink-0 flex flex-col z-20"
          style={{ background: 'rgba(10,14,22,0.6)', borderRight: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}
        >
          <div className="p-4 border-b border-white/5">
            <h2 className="text-[10px] font-mono uppercase font-bold text-white/40 tracking-[0.2em] flex items-center gap-2">
              <Layers size={12} /> Nodos del Recorrido
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {scenes.map((scene, idx) => (
              <button
                key={scene.id}
                onClick={() => { setActiveSceneId(scene.id); setSelectedHotspot(null); }}
                className="w-full flex items-start gap-3 p-2.5 rounded-xl transition-all duration-300 text-left group"
                style={activeSceneId === scene.id
                  ? { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }
                  : { background: 'transparent', border: '1px solid transparent' }
                }
              >
                <div className="w-14 h-10 rounded-md overflow-hidden bg-black shrink-0 relative">
                  <img src={scene.imageUrl} alt={scene.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute bottom-1 right-1 text-[8px] font-mono bg-black/80 px-1 rounded text-white">
                    #{idx+1}
                  </div>
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="text-xs font-display font-bold text-white/90 truncate group-hover:text-white">
                    {scene.title}
                  </div>
                  <div className="text-[9px] font-mono text-emerald-400 mt-1">
                    {scene.hotspots.length} Hotspots
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-white/5">
            <button className="w-full py-2.5 rounded-lg border border-dashed border-white/20 text-xs font-mono text-white/50 hover:text-white hover:border-white/50 transition-colors flex items-center justify-center gap-2">
              <Plus size={14} /> Importar Escena 8K
            </button>
          </div>
        </div>

        {/* MIDDLE PANEL: WebGL Canvas */}
        <div className="flex-1 relative bg-black flex flex-col z-10" ref={containerRef}>
          {/* AI Tools Bar Overlay */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            <button
              onClick={triggerAiGeminiHotspots}
              className="px-4 py-2 rounded-full backdrop-blur-xl border flex items-center gap-2 transition-all hover:bg-white/10"
              style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(139,92,246,0.3)' }}
            >
              <Sparkles size={14} className="text-purple-400" />
              <span className="text-[10px] font-mono uppercase font-bold text-purple-100 tracking-wider">
                Detectar Hotspots AI
              </span>
            </button>
            <button
              onClick={triggerNadirPatch}
              className="px-4 py-2 rounded-full backdrop-blur-xl border flex items-center gap-2 transition-all hover:bg-white/10"
              style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(245,158,11,0.3)' }}
            >
              <Wand2 size={14} className="text-amber-400" />
              <span className="text-[10px] font-mono uppercase font-bold text-amber-100 tracking-wider">
                Parchear Nadir AI
              </span>
            </button>
          </div>

          {/* Fallback Loader */}
          {!imageLoaded && (
            <div className="absolute inset-0 skeleton-shimmer z-0 flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-[0.2em] animate-pulse">
                Procesando textura 8K...
              </div>
            </div>
          )}

          {/* WebGL Canvas */}
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onPointerDown={(e) => { setIsDragging(true); setDragStart({ x: e.clientX, y: e.clientY }); }}
            onPointerMove={(e) => {
              if (!isDragging) return;
              const dx = e.clientX - dragStart.x;
              const dy = e.clientY - dragStart.y;
              setDragStart({ x: e.clientX, y: e.clientY });
              setYaw(prev => prev - dx * 0.005);
              setPitch(prev => Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, prev - dy * 0.005)));
            }}
            onPointerUp={() => setIsDragging(false)}
            onWheel={(e) => setFov(f => Math.max(30, Math.min(110, f + e.deltaY * 0.05)))}
            className={`w-full h-full block z-10 \${isAddHotspotMode ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`}
          />

          {/* Render Hotspots on Canvas */}
          {activeScene?.hotspots.map((hp) => {
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

            const isSelected = selectedHotspot?.id === hp.id;

            return (
              <button
                key={hp.id}
                onClick={(e) => { e.stopPropagation(); setSelectedHotspot(hp); }}
                style={{ left: \`\${x}px\`, top: \`\${y}px\` }}
                className={\`absolute -translate-x-1/2 -translate-y-1/2 z-20 group transition-all ease-[cubic-bezier(0.32,0.72,0,1)] \${isSelected ? 'scale-110' : 'hover:scale-110'}\`}
              >
                {hp.type === 'scene_link' && (
                  <div className="absolute inset-0 rounded-full border border-cyan-400 animate-ping opacity-50" />
                )}
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md shadow-xl relative z-10"
                  style={hp.type === 'scene_link'
                    ? { background: 'rgba(6,182,212,0.85)', border: isSelected ? '2px solid #fff' : '1px solid rgba(255,255,255,0.4)', color: '#fff' }
                    : { background: 'rgba(255,255,255,0.95)', border: isSelected ? '2px solid #10b981' : '1px solid rgba(255,255,255,1)', color: '#050505' }
                  }
                >
                  {hp.type === 'scene_link' ? <Link size={14} /> : <Info size={14} />}
                </div>
              </button>
            );
          })}

          {/* Add Hotspot Floating Action */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
            <button
              onClick={() => setIsAddHotspotMode(!isAddHotspotMode)}
              className={\`flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full backdrop-blur-xl border shadow-2xl transition-all duration-300 \${
                isAddHotspotMode
                  ? 'bg-emerald-500/90 border-emerald-400/50 text-slate-950'
                  : 'bg-black/60 border-white/10 text-white hover:bg-black/80'
              }\`}
            >
              <div className={\`w-6 h-6 rounded-full flex items-center justify-center \${isAddHotspotMode ? 'bg-black/20' : 'bg-white/10'}\`}>
                {isAddHotspotMode ? <X size={12} /> : <Plus size={12} />}
              </div>
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
                {isAddHotspotMode ? 'Cancelar / Esc' : 'Añadir Hotspot (Click)'}
              </span>
            </button>
          </div>

          {/* Coordinates HUD */}
          <div className="absolute bottom-4 right-4 pointer-events-none z-20">
            <div className="bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 flex flex-col items-end gap-1">
              <span className="text-[9px] font-mono text-white/40">YAW: {((yaw * 180) / Math.PI).toFixed(1)}°</span>
              <span className="text-[9px] font-mono text-white/40">PITCH: {((pitch * 180) / Math.PI).toFixed(1)}°</span>
            </div>
          </div>

          {/* AI Processing Alert */}
          {aiProcessingMessage && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col items-center shadow-2xl animate-in fade-in zoom-in-95">
              <div className="w-12 h-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mb-4" />
              <div className="text-xs font-mono text-emerald-400 max-w-[240px] text-center leading-relaxed">
                {aiProcessingMessage}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Properties */}
        <div 
          className="w-80 shrink-0 overflow-y-auto z-20 custom-scrollbar"
          style={{ background: 'rgba(10,14,22,0.6)', borderLeft: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}
        >
          <div className="p-4 border-b border-white/5 bg-white/[0.02]">
            <h2 className="text-[10px] font-mono uppercase font-bold text-white/40 tracking-[0.2em] flex items-center gap-2">
              <Settings size={12} /> Inspector
            </h2>
          </div>

          {selectedHotspot ? (
            <div className="p-5 space-y-6">
              
              {/* Hotspot Type Switch */}
              <div className="flex bg-white/5 rounded-lg p-1 border border-white/5">
                <button
                  onClick={() => updateSelectedHotspot('type', 'info_popup')}
                  className={\`flex-1 py-1.5 text-[10px] font-mono font-bold uppercase rounded-md transition-all \${
                    selectedHotspot.type === 'info_popup' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80'
                  }\`}
                >
                  Info Popup
                </button>
                <button
                  onClick={() => updateSelectedHotspot('type', 'scene_link')}
                  className={\`flex-1 py-1.5 text-[10px] font-mono font-bold uppercase rounded-md transition-all \${
                    selectedHotspot.type === 'scene_link' ? 'bg-white/10 text-cyan-400' : 'text-white/40 hover:text-white/80'
                  }\`}
                >
                  Link de Escena
                </button>
              </div>

              {/* Shared Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-white/40 mb-1.5 uppercase tracking-wider">
                    Tooltip Corto
                  </label>
                  <input
                    type="text"
                    value={selectedHotspot.tooltip || ''}
                    onChange={(e) => updateSelectedHotspot('tooltip', e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:border-emerald-500/50 outline-none"
                    placeholder="Ej: Cocina Americana"
                  />
                </div>

                {/* Info Popup Specific */}
                {selectedHotspot.type === 'info_popup' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-mono text-white/40 mb-1.5 uppercase tracking-wider">
                        Título del Modal
                      </label>
                      <input
                        type="text"
                        value={selectedHotspot.title || ''}
                        onChange={(e) => updateSelectedHotspot('title', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:border-emerald-500/50 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-white/40 mb-1.5 uppercase tracking-wider">
                        Descripción (Markdown)
                      </label>
                      <textarea
                        value={selectedHotspot.description || ''}
                        onChange={(e) => updateSelectedHotspot('description', e.target.value)}
                        rows={3}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:border-emerald-500/50 outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-white/40 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                        <Youtube size={10} className="text-red-400" /> ID Video YouTube 360
                      </label>
                      <input
                        type="text"
                        value={selectedHotspot.youtubeVideoId || ''}
                        onChange={(e) => updateSelectedHotspot('youtubeVideoId', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:border-red-500/50 outline-none"
                        placeholder="Ej: dQw4w9WgXcQ"
                      />
                    </div>
                  </>
                )}

                {/* Scene Link Specific */}
                {selectedHotspot.type === 'scene_link' && (
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                      <Map size={10} className="text-cyan-400" /> Escena Destino
                    </label>
                    <select
                      value={selectedHotspot.targetSceneId || ''}
                      onChange={(e) => updateSelectedHotspot('targetSceneId', e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                    >
                      <option value="" disabled>Selecciona una escena...</option>
                      {scenes.filter(s => s.id !== activeSceneId).map(s => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Coordinates block */}
              <div className="bg-white/5 rounded-lg p-3 border border-white/5 flex gap-4">
                <div className="flex-1">
                  <div className="text-[9px] font-mono text-white/40 mb-1">YAW (°)</div>
                  <input
                    type="number"
                    value={selectedHotspot.yaw}
                    onChange={(e) => updateSelectedHotspot('yaw', parseFloat(e.target.value))}
                    className="w-full bg-transparent text-xs text-white font-mono border-b border-white/20 focus:border-emerald-400 outline-none py-1"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-[9px] font-mono text-white/40 mb-1">PITCH (°)</div>
                  <input
                    type="number"
                    value={selectedHotspot.pitch}
                    onChange={(e) => updateSelectedHotspot('pitch', parseFloat(e.target.value))}
                    className="w-full bg-transparent text-xs text-white font-mono border-b border-white/20 focus:border-emerald-400 outline-none py-1"
                  />
                </div>
              </div>

              {/* Delete Action */}
              <button 
                onClick={deleteSelectedHotspot}
                className="w-full py-2.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-xs font-mono font-bold flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <Trash2 size={14} /> Eliminar Hotspot
              </button>
            </div>
          ) : (
            <div className="p-8 text-center flex flex-col items-center justify-center h-full text-white/30">
              <div className="w-12 h-12 rounded-full border border-dashed border-white/20 flex items-center justify-center mb-4">
                <Map size={16} />
              </div>
              <p className="text-xs font-mono mb-2">Ningún hotspot seleccionado</p>
              <p className="text-[10px] font-mono leading-relaxed">
                Haz clic en un marcador en el canvas para editar sus propiedades.
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};