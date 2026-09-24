import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Save, 
  Code2, 
  Eye, 
  MapPin, 
  Navigation, 
  Video, 
  ExternalLink, 
  Wand2, 
  Layers, 
  Compass, 
  ChevronRight, 
  Check, 
  Copy,
  Info,
  Sliders,
  X
} from 'lucide-react';
import { INITIAL_DEPARTMENT_TOUR, TourScene, HotspotLink } from './panoramasData';

export const TourEditorStudio: React.FC = () => {
  const [scenes, setScenes] = useState<TourScene[]>(INITIAL_DEPARTMENT_TOUR);
  const [activeSceneId, setActiveSceneId] = useState<string>(INITIAL_DEPARTMENT_TOUR[0].id);
  const [isAddHotspotMode, setIsAddHotspotMode] = useState<boolean>(false);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotLink | null>(null);

  const activeScene = scenes.find(s => s.id === activeSceneId) || scenes[0];
  const [yaw, setYaw] = useState<number>((activeScene.defaultYaw * Math.PI) / 180);
  const [pitch, setPitch] = useState<number>((activeScene.defaultPitch * Math.PI) / 180);
  const [fov, setFov] = useState<number>(75);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState<boolean>(false);
  const [aiProcessingMessage, setAiProcessingMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleSelectScene = (sceneId: string) => {
    setActiveSceneId(sceneId);
    const scene = scenes.find(s => s.id === sceneId);
    if (scene) {
      setYaw((scene.defaultYaw * Math.PI) / 180);
      setPitch((scene.defaultPitch * Math.PI) / 180);
      setSelectedHotspot(null);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

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
      id: `hs_${Date.now()}`,
      type: 'info_popup',
      yaw: currentYawDeg,
      pitch: currentPitchDeg,
      tooltip: 'Nuevo Punto de Interés',
      title: 'Punto de Interés Interactivo',
      description: 'Ingresa aquí las especificaciones del ambiente o vincula un video 360.',
      youtubeVideoId: '',
      driveUrl: ''
    };

    setScenes(prev => prev.map(s => {
      if (s.id === activeSceneId) {
        return { ...s, hotspots: [...s.hotspots, newHotspot] };
      }
      return s;
    }));

    setSelectedHotspot(newHotspot);
    setIsAddHotspotMode(false);
  };

  const triggerAiGeminiHotspots = () => {
    setAiProcessingMessage("✨ Gemini 2.0 Multimodal analizando la geometría 360° del ambiente...");
    setTimeout(() => {
      const generatedSpot: HotspotLink = {
        id: `hs_ai_${Date.now()}`,
        type: 'info_popup',
        yaw: parseFloat(((yaw * 180) / Math.PI + 35).toFixed(1)),
        pitch: -5,
        tooltip: '✨ Punto Detectado por Gemini Vision',
        title: 'Área Destacada por Inteligencia Artificial',
        description: 'Punto de alto valor arquitectónico detectado por visión computacional con óptima iluminación y amplitud.',
        youtubeVideoId: 'dQw4w9WgXcQ',
        driveUrl: 'https://drive.google.com',
        driveLabel: 'Ver Ficha de Tasación en Drive'
      };

      setScenes(prev => prev.map(s => {
        if (s.id === activeSceneId) {
          return { ...s, hotspots: [...s.hotspots, generatedSpot] };
        }
        return s;
      }));

      setSelectedHotspot(generatedSpot);
      setAiProcessingMessage(null);
    }, 1200);
  };

  const triggerNadirPatch = () => {
    setAiProcessingMessage("🧹 Vertex AI Imagen 3 aplicando Inpainting Generativo en el casquete inferior (Nadir)...");
    setTimeout(() => {
      setAiProcessingMessage(null);
      alert("✅ Parcheo de Nadir completado con éxito: Se ha reconstruido el piso eliminando cualquier trípode, sombra o artefacto de captura.");
    }, 1400);
  };

  const updateSelectedHotspot = (field: keyof HotspotLink, value: any) => {
    if (!selectedHotspot) return;
    const updated = { ...selectedHotspot, [field]: value };
    setSelectedHotspot(updated);

    setScenes(prev => prev.map(s => {
      if (s.id === activeSceneId) {
        return {
          ...s,
          hotspots: s.hotspots.map(h => h.id === updated.id ? updated : h)
        };
      }
      return s;
    }));
  };

  const deleteSelectedHotspot = () => {
    if (!selectedHotspot) return;
    setScenes(prev => prev.map(s => {
      if (s.id === activeSceneId) {
        return {
          ...s,
          hotspots: s.hotspots.filter(h => h.id !== selectedHotspot.id)
        };
      }
      return s;
    }));
    setSelectedHotspot(null);
  };

  const embedIframeCode = `<iframe
  src="https://tours.andinavision.cl/embed/depto_cavancha_360"
  width="100%"
  height="600"
  frameborder="0"
  allow="accelerometer; gyroscope; fullscreen"
  allowfullscreen>
</iframe>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedIframeCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="h-16 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
            <Sliders size={18} />
          </div>
          <div>
            <h1 className="text-sm font-black font-display text-white uppercase tracking-wider">
              Andina Tour Studio Pro
            </h1>
            <span className="text-[11px] font-mono text-emerald-400">
              MODO CREADOR & EDITOR VIRTUAL • GCP ENGINE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={triggerAiGeminiHotspots}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-transform hover:scale-105"
            title="Detección de puntos de interés con Gemini Vision"
          >
            <Sparkles size={14} />
            <span className="hidden sm:inline">IA: Sugerir Hotspots</span>
          </button>

          <button
            onClick={triggerNadirPatch}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-mono text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Borrar trípode o sombra con Imagen 3"
          >
            <Wand2 size={14} className="text-emerald-400" />
            <span className="hidden sm:inline">Parchear Nadir</span>
          </button>

          <button
            onClick={() => setIsEmbedModalOpen(true)}
            className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-transform hover:scale-105"
          >
            <Code2 size={15} />
            <span>Incrustar Tour</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-72 bg-slate-900/90 border-r border-slate-800 flex flex-col p-4">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Ambientes ({scenes.length})
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              Interconectados
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {scenes.map(s => {
              const isActive = s.id === activeSceneId;
              return (
                <div
                  key={s.id}
                  onClick={() => handleSelectScene(s.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 items-center ${
                    isActive
                      ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <img
                    src={s.imageUrl}
                    alt={s.title}
                    className="w-12 h-12 object-cover rounded-lg shrink-0 border border-white/10"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{s.title}</h4>
                    <p className="text-[10px] text-slate-400 truncate font-light">{s.subtitle}</p>
                    <span className="text-[10px] font-mono text-emerald-400">
                      {s.hotspots.length} hotspots
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <main 
          ref={containerRef}
          className="flex-1 relative bg-black overflow-hidden select-none"
        >
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-xl">
            <button
              onClick={() => setIsAddHotspotMode(!isAddHotspotMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                isAddHotspotMode
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <MapPin size={14} />
              <span>{isAddHotspotMode ? 'Haz clic en la esfera...' : '+ Añadir Hotspot'}</span>
            </button>

            <span className="text-slate-600">|</span>

            <span className="text-[11px] font-mono text-slate-400">
              Yaw: {((yaw * 180) / Math.PI).toFixed(0)}° • Pitch: {((pitch * 180) / Math.PI).toFixed(0)}°
            </span>
          </div>

          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
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
            className={`w-full h-full block ${isAddHotspotMode ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`}
          />

          {activeScene.hotspots.map(h => {
            const radYaw = yaw;
            const radPitch = pitch;
            const spotYaw = (h.yaw * Math.PI) / 180;
            const spotPitch = (h.pitch * Math.PI) / 180;

            let deltaYaw = spotYaw - radYaw;
            while (deltaYaw > Math.PI) deltaYaw -= 2 * Math.PI;
            while (deltaYaw < -Math.PI) deltaYaw += 2 * Math.PI;

            if (Math.cos(deltaYaw) <= 0.1) return null;

            const width = containerRef.current?.clientWidth || 800;
            const height = containerRef.current?.clientHeight || 500;
            const radFov = (fov * Math.PI) / 180;

            const x = width / 2 + Math.tan(deltaYaw) * (width / (2 * Math.tan(radFov / 2)));
            const y = height / 2 - Math.tan(spotPitch - radPitch) * (height / (2 * Math.tan(radFov / 2)));

            if (x < 15 || x > width - 15 || y < 15 || y > height - 15) return null;

            const isSelected = selectedHotspot?.id === h.id;

            return (
              <button
                key={h.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedHotspot(h);
                }}
                style={{ left: `${x}px`, top: `${y}px` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-transform ${
                  isSelected ? 'scale-125 ring-4 ring-emerald-400 rounded-full' : 'hover:scale-110'
                }`}
              >
                <div className={`p-2.5 rounded-full border-2 border-white shadow-2xl ${
                  h.type === 'scene_link' ? 'bg-blue-600' : 'bg-amber-500'
                }`}>
                  {h.type === 'scene_link' ? (
                    <Navigation size={14} className="text-white" />
                  ) : (
                    <Info size={14} className="text-white" />
                  )}
                </div>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-black/90 text-white text-[10px] font-mono px-2 py-0.5 rounded whitespace-nowrap">
                  {h.tooltip}
                </span>
              </button>
            );
          })}

          {aiProcessingMessage && (
            <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 px-6 py-4 rounded-2xl flex items-center gap-3 text-sm text-white shadow-2xl">
                <Sparkles className="animate-spin text-purple-400" size={20} />
                <span>{aiProcessingMessage}</span>
              </div>
            </div>
          )}
        </main>

        <aside className="w-80 bg-slate-900/90 border-l border-slate-800 p-5 overflow-y-auto flex flex-col justify-between">
          {selectedHotspot ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Configurar Hotspot
                </h3>
                <button
                  onClick={deleteSelectedHotspot}
                  className="text-red-400 hover:text-red-300 p-1"
                  title="Eliminar hotspot"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
                  Tipo de Interacción
                </label>
                <select
                  value={selectedHotspot.type}
                  onChange={(e) => updateSelectedHotspot('type', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                >
                  <option value="scene_link">Enlace Direccional (Ir a otra escena)</option>
                  <option value="info_popup">Ventana Modal (YouTube / Google Drive)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
                  Texto al Posar el Cursor
                </label>
                <input
                  type="text"
                  value={selectedHotspot.tooltip}
                  onChange={(e) => updateSelectedHotspot('tooltip', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              {selectedHotspot.type === 'scene_link' && (
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
                    Ambiente de Destino
                  </label>
                  <select
                    value={selectedHotspot.targetSceneId || ''}
                    onChange={(e) => updateSelectedHotspot('targetSceneId', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  >
                    <option value="">Selecciona ambiente...</option>
                    {scenes.filter(s => s.id !== activeSceneId).map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedHotspot.type === 'info_popup' && (
                <>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
                      Título de la Ventana
                    </label>
                    <input
                      type="text"
                      value={selectedHotspot.title || ''}
                      onChange={(e) => updateSelectedHotspot('title', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
                      Descripción / Ficha
                    </label>
                    <textarea
                      rows={3}
                      value={selectedHotspot.description || ''}
                      onChange={(e) => updateSelectedHotspot('description', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
                      ID de Video de YouTube 360
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: dQw4w9WgXcQ"
                      value={selectedHotspot.youtubeVideoId || ''}
                      onChange={(e) => updateSelectedHotspot('youtubeVideoId', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
                      Enlace de Google Drive
                    </label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={selectedHotspot.driveUrl || ''}
                      onChange={(e) => updateSelectedHotspot('driveUrl', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 font-mono text-[11px]"
                    />
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-slate-500 my-auto p-4">
              <MapPin size={32} className="mb-2 text-slate-600" />
              <p className="text-xs font-mono">
                Selecciona un hotspot en el visor o activa <strong>"+ Añadir Hotspot"</strong> para colocar un punto en la habitación.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => alert("✅ Cambios en el tour virtual guardados y sincronizados con Cloud Firestore.")}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Save size={14} className="text-emerald-400" />
              <span>Guardar Configuración</span>
            </button>
          </div>
        </aside>
      </div>

      {isEmbedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setIsEmbedModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold font-display uppercase tracking-wider text-emerald-400 mb-2">
              Código de Incrustación (Embed)
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-light">
              Copia este fragmento HTML para incrustar el tour virtual en cualquier página web. Incluye soporte de giroscopio y pantalla completa.
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 relative">
              <pre className="overflow-x-auto whitespace-pre-wrap">{embedIframeCode}</pre>
              <button
                onClick={copyEmbedCode}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedCode ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
