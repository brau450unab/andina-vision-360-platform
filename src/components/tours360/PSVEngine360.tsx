import React, { useEffect, useRef, useState } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';
import {
  Compass, Maximize2, Minimize2, RotateCw, Map, Info, X,
  ZoomIn, ZoomOut, Sparkles
} from 'lucide-react';
import { VirtualTour360, TourHotspot } from '../../context/TourSaaSContext';

interface PSVEngine360Props {
  tour: VirtualTour360;
  activeSceneId: string;
  onSceneChange: (sceneId: string) => void;
  editorMode?: boolean;
  onSphereClick?: (yaw: number, pitch: number) => void;
  height?: string;
}

export const PSVEngine360: React.FC<PSVEngine360Props> = ({
  tour,
  activeSceneId,
  onSceneChange,
  editorMode = false,
  onSphereClick,
  height = 'h-[580px]'
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const markersPluginRef = useRef<MarkersPlugin | null>(null);

  const [isAutorotate, setIsAutorotate] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFloorplan, setShowFloorplan] = useState(true);
  const [selectedInfoHotspot, setSelectedInfoHotspot] = useState<TourHotspot | null>(null);
  const [viewerReady, setViewerReady] = useState(false);

  const currentScene = tour.scenes.find((s) => s.id === activeSceneId) || tour.scenes[0];

  const buildMarkerConfig = (hs: TourHotspot) => {
    const isScene = hs.type === 'scene';
    const badgeColor = isScene ? '#0284c7' : '#059669';
    const iconSvg = isScene
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`;

    return {
      id: hs.id,
      position: { yaw: hs.yaw, pitch: hs.pitch },
      html: `
        <div style="display:flex;align-items:center;gap:8px;padding:7px 14px;border-radius:999px;background:rgba(255,255,255,0.96);border:2px solid ${badgeColor};box-shadow:0 8px 24px rgba(15,23,42,0.22);cursor:pointer;transform:translate(-50%,-50%);white-space:nowrap;font-family:sans-serif;">
          <span style="width:24px;height:24px;border-radius:999px;background:${badgeColor};display:inline-flex;align-items:center;justify-content:center;">
            ${iconSvg}
          </span>
          <span style="color:#0f172a;font-size:12px;font-weight:800;letter-spacing:0.01em;">${hs.text}</span>
        </div>
      `,
      anchor: 'center center',
      data: hs
    };
  };

  useEffect(() => {
    if (!containerRef.current || !currentScene) return;

    const viewer = new Viewer({
      container: containerRef.current,
      panorama: currentScene.panoramaUrl,
      caption: `${tour.title} — ${currentScene.title}`,
      navbar: false,
      defaultZoomLvl: 45,
      minFov: 30,
      maxFov: 95,
      moveSpeed: 1.4,
      plugins: [
        [
          MarkersPlugin,
          {
            markers: currentScene.hotspots.map(buildMarkerConfig)
          }
        ]
      ]
    });

    const markersPlugin = viewer.getPlugin(MarkersPlugin) as MarkersPlugin;
    markersPluginRef.current = markersPlugin;
    viewerRef.current = viewer;

    viewer.addEventListener('ready', () => {
      setViewerReady(true);
    });

    markersPlugin.addEventListener('select-marker', ({ marker }) => {
      const hs = marker.data as TourHotspot;
      if (!hs) return;
      if (hs.type === 'scene' && hs.targetSceneId) {
        onSceneChange(hs.targetSceneId);
      } else {
        setSelectedInfoHotspot(hs);
      }
    });

    viewer.addEventListener('click', ({ data }) => {
      if (onSphereClick && data) {
        onSphereClick(Number(data.yaw.toFixed(3)), Number(data.pitch.toFixed(3)));
      }
    });

    return () => {
      viewer.destroy();
      viewerRef.current = null;
      markersPluginRef.current = null;
      setViewerReady(false);
    };
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    const markersPlugin = markersPluginRef.current;
    if (!viewer || !markersPlugin || !currentScene || !viewerReady) return;

    viewer
      .setPanorama(currentScene.panoramaUrl, {
        transition: { effect: 'fade', rotation: true },
        showLoader: true
      })
      .then(() => {
        markersPlugin.clearMarkers();
        currentScene.hotspots.forEach((hs) => {
          markersPlugin.addMarker(buildMarkerConfig(hs));
        });
      })
      .catch(() => {
        markersPlugin.clearMarkers();
        currentScene.hotspots.forEach((hs) => {
          markersPlugin.addMarker(buildMarkerConfig(hs));
        });
      });
  }, [currentScene?.id, currentScene?.panoramaUrl, currentScene?.hotspots, viewerReady]);

  useEffect(() => {
    if (!viewerReady || !isAutorotate || editorMode) return;
    const interval = setInterval(() => {
      const v = viewerRef.current;
      if (v) {
        const pos = v.getPosition();
        v.rotate({ yaw: pos.yaw + 0.003, pitch: pos.pitch });
      }
    }, 30);
    return () => clearInterval(interval);
  }, [isAutorotate, viewerReady, editorMode]);

  const handleZoom = (delta: number) => {
    const v = viewerRef.current;
    if (!v) return;
    const current = v.getZoomLevel();
    v.zoom(Math.max(0, Math.min(100, current + delta)));
  };

  const toggleFullscreen = () => {
    const v = viewerRef.current;
    if (!v) return;
    v.toggleFullscreen();
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`relative w-full ${height} rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-lg select-none`}
    >
      <div ref={containerRef} className="w-full h-full" />

      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md">
          <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-900 tracking-tight">
                {currentScene?.title || 'Escena 360°'}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                360° 8K HDR
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {currentScene?.subtitle || 'Arrastra en cualquier dirección para inspeccionar el recinto'}
            </p>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md">
          <button
            onClick={() => setIsAutorotate(!isAutorotate)}
            className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isAutorotate
                ? 'bg-sky-600 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Auto-Rotación 360°"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isAutorotate ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Giro Auto</span>
          </button>

          <button
            onClick={() => handleZoom(15)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Acercar"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleZoom(-15)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Alejar"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowFloorplan(!showFloorplan)}
            className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showFloorplan
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Plano de Planta 2D"
          >
            <Map className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Plano 2D</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Pantalla Completa"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {editorMode && (
        <div className="absolute top-18 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-amber-500 text-white text-xs font-bold shadow-lg flex items-center gap-2 pointer-events-none">
          <Sparkles className="w-4 h-4" />
          MODO ESTUDIO ACTIVO: Haz clic en cualquier punto de la esfera 360° para colocar un Hotspot
        </div>
      )}

      {showFloorplan && (
        <div className="absolute bottom-18 right-3 z-20 w-56 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 p-3 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Map className="w-3 h-3 text-emerald-600" /> Radar Planta 2D
            </span>
            <button
              onClick={() => setShowFloorplan(false)}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="relative h-28 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden">
            <div className="absolute inset-2 border border-slate-300 rounded-lg grid grid-cols-2 grid-rows-2">
              <div className="border-r border-b border-slate-200 p-1 text-[8px] font-bold text-slate-400">
                SALÓN
              </div>
              <div className="border-b border-slate-200 p-1 text-[8px] font-bold text-slate-400">
                SUITE
              </div>
              <div className="border-r border-slate-200 p-1 text-[8px] font-bold text-slate-400">
                ACCESO
              </div>
              <div className="p-1 text-[8px] font-bold text-slate-400">EXTERIOR</div>
            </div>

            {tour.scenes.map((sc, idx) => {
              const fallbackX = [28, 72, 65, 35][idx % 4];
              const fallbackY = [32, 32, 74, 74][idx % 4];
              const x = sc.floorplanX ?? fallbackX;
              const y = sc.floorplanY ?? fallbackY;
              const isActive = sc.id === currentScene?.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => onSceneChange(sc.id)}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-sky-600 border-white scale-125 shadow-md ring-4 ring-sky-500/25'
                      : 'bg-emerald-500 border-white hover:scale-110'
                  }`}
                  title={sc.title}
                />
              );
            })}
          </div>
        </div>
      )}

      <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 overflow-x-auto max-w-full shadow-lg">
          {tour.scenes.map((sc) => {
            const isActive = sc.id === currentScene?.id;
            return (
              <button
                key={sc.id}
                onClick={() => onSceneChange(sc.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <img
                  src={sc.panoramaUrl}
                  alt={sc.title}
                  className="w-6 h-6 rounded-md object-cover border border-white/40"
                />
                <span>{sc.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedInfoHotspot && (
        <div className="absolute inset-0 z-30 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-900">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    Ficha Técnica / Comercial
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900">
                    {selectedInfoHotspot.text}
                  </h4>
                </div>
              </div>
              <button
                onClick={() => setSelectedInfoHotspot(null)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              {selectedInfoHotspot.description ||
                'Especificación técnica certificada dentro del recorrido virtual 360°.'}
            </p>
            <button
              onClick={() => setSelectedInfoHotspot(null)}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Continuar Recorrido 360°
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
