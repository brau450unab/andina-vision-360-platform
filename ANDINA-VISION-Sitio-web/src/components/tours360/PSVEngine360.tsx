import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { CompassPlugin } from '@photo-sphere-viewer/compass-plugin';
import { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';
import '@photo-sphere-viewer/compass-plugin/index.css';

import {
  TourScene,
  HotspotLink,
  PolygonRegion360,
  FloorPlanInstance,
  NadirConfig,
  HotspotFontFamily,
  HotspotIconType,
  DEFAULT_HOTSPOT_STYLE_LINK,
  DEFAULT_HOTSPOT_STYLE_INFO,
  computeCssFilterFromGrading,
} from './panoramasData';
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  Compass,
  Map as MapIcon,
  Layers,
  X,
  ExternalLink,
  ChevronRight,
  Volume2,
  VolumeX,
  Eye,
  Sparkles,
  CheckCircle2,
  Move,
} from 'lucide-react';

export type EditorInteractionMode =
  | 'navigate'
  | 'add_hotspot'
  | 'draw_polygon'
  | 'place_nadir';

interface PSVEngine360Props {
  scene: TourScene;
  allScenes?: TourScene[];
  tourTitle?: string;
  defaultFontFamily?: HotspotFontFamily;
  primaryBrandColor?: string;
  transitionStyle?: 'walkthrough_zoom' | 'smooth_fade' | 'instant';
  autoRotate?: boolean;
  showCompass?: boolean;
  showGalleryBar?: boolean;
  showFloorPlanByDefault?: boolean;
  nadir?: NadirConfig;
  floorPlans?: FloorPlanInstance[];
  selectedHotspotId?: string | null;
  selectedPolygonId?: string | null;
  editorMode?: EditorInteractionMode;
  isEditor?: boolean;
  className?: string;
  onSceneChange?: (sceneId: string, targetYaw?: number, targetPitch?: number) => void;
  onSelectHotspot?: (hotspot: HotspotLink | null) => void;
  onSelectPolygon?: (polygon: PolygonRegion360 | null) => void;
  onAddHotspotAtCoords?: (yawDeg: number, pitchDeg: number) => void;
  onMoveHotspotCoords?: (hotspotId: string, yawDeg: number, pitchDeg: number) => void;
  onAddPolygonPoint?: (yawDeg: number, pitchDeg: number) => void;
  onCameraMove?: (yawDeg: number, pitchDeg: number, fovDeg: number) => void;
  onUpdateFloorPlanPin?: (floorPlanId: string, sceneId: string, xPercent: number, yPercent: number) => void;
  polygonDraftPoints?: [number, number][];
}

function getSvgIconMarkup(iconType: HotspotIconType): string {
  switch (iconType) {
    case 'arrow_3d':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/><path d="m18 9-6-6-6 6" opacity="0.5"/></svg>`;
    case 'door':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3"/><path d="M13 20h9"/><path d="M10 12v.01"/><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z"/></svg>`;
    case 'video':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>`;
    case 'photo':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`;
    case 'audio':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
    case 'cart':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>`;
    case 'pin':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
    case 'sparkles':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`;
    case 'info':
    default:
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`;
  }
}

function buildHotspotHtml(
  hp: HotspotLink,
  isSelected: boolean,
  defaultFontFamily: HotspotFontFamily = 'Plus Jakarta Sans',
  isEditor = false
): string {
  const defaultStyle = hp.type === 'scene_link' ? DEFAULT_HOTSPOT_STYLE_LINK : DEFAULT_HOTSPOT_STYLE_INFO;
  const st = { ...defaultStyle, ...(hp.style || {}) };
  const font = st.fontFamily || defaultFontFamily;
  const fontSizePx = st.fontSize === 'lg' ? 14 : st.fontSize === 'md' ? 12.5 : st.fontSize === 'sm' ? 11.5 : 10.5;
  const scale = st.scale || 1;
  const isFloorArrow = st.iconType === 'arrow_3d';
  const radiusCss =
    st.badgeShape === 'pill'
      ? '9999px'
      : st.badgeShape === 'rounded'
      ? '12px'
      : st.badgeShape === 'minimal'
      ? '6px'
      : '16px';

  const pulseHtml = st.pulseAnimation
    ? `<span style="position:absolute;inset:-6px;border-radius:9999px;border:2px solid ${st.color};opacity:0.55;animation:psvHotspotPulse 2s infinite ease-out;pointer-events:none;"></span>`
    : '';

  const selectionRing = isSelected
    ? `box-shadow: 0 0 0 3px #ffffff, 0 0 24px ${st.color};`
    : `box-shadow: 0 10px 25px -5px rgba(0,0,0,0.65), 0 0 14px ${st.color}55;`;

  const floorPerspective = isFloorArrow
    ? `transform: scale(${scale}) perspective(320px) rotateX(28deg);`
    : `transform: scale(${scale});`;

  const labelHtml =
    st.alwaysShowLabel && hp.tooltip
      ? `<span style="
          font-family: '${font}', sans-serif;
          font-size: ${fontSizePx}px;
          font-weight: 700;
          letter-spacing: 0.02em;
          color: ${st.textColor};
          padding-right: 6px;
          white-space: nowrap;
          text-shadow: 0 1px 2px rgba(0,0,0,0.6);
        ">${hp.tooltip}</span>`
      : '';

  const dragBadge =
    isEditor && isSelected
      ? `<span style="position:absolute;top:-10px;right:-10px;background:#10b981;color:#050505;font-family:monospace;font-size:9px;font-weight:900;padding:1px 5px;border-radius:999px;border:1px solid #fff;pointer-events:none;">DRAG</span>`
      : '';

  return `
    <div data-hotspot-id="${hp.id}" style="
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: ${st.alwaysShowLabel && hp.tooltip ? '6px 12px 6px 6px' : '8px'};
      border-radius: ${radiusCss};
      background: ${st.bgColor};
      border: 1.5px solid ${isSelected ? '#ffffff' : st.color};
      color: ${st.textColor};
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      cursor: ${isEditor ? 'grab' : 'pointer'};
      user-select: none;
      transition: transform 0.2s cubic-bezier(0.23,1,0.32,1), box-shadow 0.2s ease;
      ${floorPerspective}
      ${selectionRing}
    ">
      ${pulseHtml}
      ${dragBadge}
      <span style="
        width: 28px;
        height: 28px;
        border-radius: 9999px;
        background: ${st.color};
        color: #04130e;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      ">
        ${getSvgIconMarkup(st.iconType)}
      </span>
      ${labelHtml}
    </div>
  `;
}

export const PSVEngine360: React.FC<PSVEngine360Props> = ({
  scene,
  allScenes = [],
  tourTitle = 'Andina Vision 360°',
  defaultFontFamily = 'Plus Jakarta Sans',
  primaryBrandColor = '#10b981',
  transitionStyle = 'walkthrough_zoom',
  autoRotate = false,
  showCompass = true,
  showGalleryBar = true,
  showFloorPlanByDefault = true,
  nadir,
  floorPlans = [],
  selectedHotspotId = null,
  selectedPolygonId = null,
  editorMode = 'navigate',
  isEditor = false,
  className = 'w-full h-full',
  onSceneChange,
  onSelectHotspot,
  onSelectPolygon,
  onAddHotspotAtCoords,
  onMoveHotspotCoords,
  onAddPolygonPoint,
  onCameraMove,
  onUpdateFloorPlanPin,
  polygonDraftPoints = [],
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const psvContainerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const markersPluginRef = useRef<MarkersPlugin | null>(null);
  const currentPanoramaUrlRef = useRef<string>('');

  // Live telemetry state for radar & HUD
  const [cameraAngles, setCameraAngles] = useState<{ yawDeg: number; pitchDeg: number; fovDeg: number }>({
    yawDeg: scene.defaultYaw || 0,
    pitchDeg: scene.defaultPitch || 0,
    fovDeg: scene.defaultFov || 75,
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFloorPlanOpen, setIsFloorPlanOpen] = useState(showFloorPlanByDefault);
  const [activeFloorPlanId, setActiveFloorPlanId] = useState<string>(
    scene.floorPlanId || floorPlans[0]?.id || ''
  );
  const [isFloorPlanExpanded, setIsFloorPlanExpanded] = useState(false);
  const [activeModalHotspot, setActiveModalHotspot] = useState<HotspotLink | null>(null);
  const [activeModalPolygon, setActiveModalPolygon] = useState<PolygonRegion360 | null>(null);
  const [draggingHotspotId, setDraggingHotspotId] = useState<string | null>(null);
  const [ambientAudioPlaying, setAmbientAudioPlaying] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Refs for latest callbacks so PSV event listeners never use stale closures
  const callbacksRef = useRef({
    scene,
    editorMode,
    isEditor,
    onSceneChange,
    onSelectHotspot,
    onSelectPolygon,
    onAddHotspotAtCoords,
    onMoveHotspotCoords,
    onAddPolygonPoint,
    onCameraMove,
    transitionStyle,
  });

  useEffect(() => {
    callbacksRef.current = {
      scene,
      editorMode,
      isEditor,
      onSceneChange,
      onSelectHotspot,
      onSelectPolygon,
      onAddHotspotAtCoords,
      onMoveHotspotCoords,
      onAddPolygonPoint,
      onCameraMove,
      transitionStyle,
    };
  });

  useEffect(() => {
    if (scene.floorPlanId && floorPlans.some((fp) => fp.id === scene.floorPlanId)) {
      setActiveFloorPlanId(scene.floorPlanId);
    } else if (floorPlans.length > 0 && !floorPlans.some((fp) => fp.id === activeFloorPlanId)) {
      setActiveFloorPlanId(floorPlans[0].id);
    }
  }, [scene.floorPlanId, floorPlans, activeFloorPlanId]);

  // Initialize Photo Sphere Viewer v5 once on mount
  useEffect(() => {
    if (!psvContainerRef.current) return;

    const viewer = new Viewer({
      container: psvContainerRef.current,
      panorama: scene.imageUrl,
      caption: scene.title,
      defaultYaw: `${scene.defaultYaw || 0}deg`,
      defaultPitch: `${scene.defaultPitch || 0}deg`,
      defaultZoomLvl: 45,
      minFov: 30,
      maxFov: 95,
      navbar: false, // We render a bespoke high-end HUD navbar
      sphereCorrection: {
        pan: `${scene.northOffsetDeg || 0}deg`,
        tilt: `${scene.horizonPitchDeg || 0}deg`,
        roll: `${scene.horizonRollDeg || 0}deg`,
      },
      plugins: [
        [MarkersPlugin, {}],
        ...(showCompass
          ? [
              [
                CompassPlugin,
                {
                  size: '56px',
                  position: 'top left',
                  backgroundSvg: undefined,
                },
              ] as [any, any],
            ]
          : []),
        [
          AutorotatePlugin,
          {
            autostartDelay: autoRotate ? 2500 : null,
            autostartOnIdle: autoRotate,
            autorotateSpeed: '0.35rpm',
            autorotatePitch: `${scene.defaultPitch || -5}deg`,
          },
        ],
      ],
    });

    const markersPlugin = viewer.getPlugin(MarkersPlugin) as MarkersPlugin;
    viewerRef.current = viewer;
    markersPluginRef.current = markersPlugin;
    currentPanoramaUrlRef.current = scene.imageUrl;

    // Position updates for Radar Cone and HUD
    viewer.addEventListener('position-updated', ({ position }) => {
      const yawDeg = parseFloat(((position.yaw * 180) / Math.PI).toFixed(1));
      const pitchDeg = parseFloat(((position.pitch * 180) / Math.PI).toFixed(1));
      const fovDeg = parseFloat(viewer.getZoomLevel().toFixed(1));
      setCameraAngles({ yawDeg, pitchDeg, fovDeg });
      callbacksRef.current.onCameraMove?.(yawDeg, pitchDeg, fovDeg);
    });

    // Click on exact spherical coordinates (Yaw / Pitch raycasting)
    viewer.addEventListener('click', ({ data }) => {
      if (data.rightclick) return;
      const yawDeg = parseFloat(((data.yaw * 180) / Math.PI).toFixed(1));
      const pitchDeg = parseFloat(((data.pitch * 180) / Math.PI).toFixed(1));
      // Normalize yawDeg to [-180, 180]
      const normYaw = ((yawDeg + 540) % 360) - 180;

      const { editorMode: mode, onAddHotspotAtCoords: addHs, onAddPolygonPoint: addPoly } =
        callbacksRef.current;

      if (mode === 'add_hotspot' && addHs) {
        addHs(parseFloat(normYaw.toFixed(1)), pitchDeg);
      } else if (mode === 'draw_polygon' && addPoly) {
        addPoly(parseFloat(normYaw.toFixed(1)), pitchDeg);
      }
    });

    // Marker selection (Hotspots & Polygons)
    markersPlugin.addEventListener('select-marker', ({ marker }) => {
      const { scene: currScene, isEditor: edit, onSelectHotspot: selHs, onSelectPolygon: selPoly, onSceneChange: changeSc, transitionStyle: tStyle } =
        callbacksRef.current;

      const rawId = marker.id;
      if (rawId.startsWith('poly_')) {
        const polyId = rawId.replace(/^poly_/, '');
        const foundPoly = currScene.polygons?.find((p) => p.id === polyId) || null;
        if (edit && selPoly) {
          selPoly(foundPoly);
        } else if (foundPoly) {
          setActiveModalPolygon(foundPoly);
        }
        return;
      }

      if (rawId === 'nadir_cap_marker') return;

      const foundHs = currScene.hotspots.find((h) => h.id === rawId) || null;
      if (!foundHs) return;

      if (edit && selHs) {
        selHs(foundHs);
        return;
      }

      // Visitor / Preview mode: execute action
      if (foundHs.type === 'scene_link' && foundHs.targetSceneId && changeSc) {
        if (tStyle === 'walkthrough_zoom') {
          setIsTransitioning(true);
          viewer
            .animate({
              yaw: `${foundHs.yaw}deg`,
              pitch: `${foundHs.pitch}deg`,
              zoom: 80,
              speed: 420,
            })
            .then(() => {
              changeSc(foundHs.targetSceneId!, foundHs.targetYaw, foundHs.targetPitch);
              setIsTransitioning(false);
            })
            .catch(() => {
              changeSc(foundHs.targetSceneId!, foundHs.targetYaw, foundHs.targetPitch);
              setIsTransitioning(false);
            });
        } else {
          changeSc(foundHs.targetSceneId, foundHs.targetYaw, foundHs.targetPitch);
        }
      } else {
        setActiveModalHotspot(foundHs);
      }
    });

    return () => {
      viewer.destroy();
      viewerRef.current = null;
      markersPluginRef.current = null;
    };
  }, []);

  // Update panorama when scene.imageUrl changes (without recreating the WebGL viewer!)
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    if (currentPanoramaUrlRef.current !== scene.imageUrl) {
      currentPanoramaUrlRef.current = scene.imageUrl;
      viewer
        .setPanorama(scene.imageUrl, {
          caption: scene.title,
          position: {
            yaw: `${scene.defaultYaw || 0}deg`,
            pitch: `${scene.defaultPitch || 0}deg`,
          },
          zoom: 45,
          showLoader: true,
          transition: transitionStyle === 'instant' ? false : { effect: 'fade', rotation: true, speed: 500 },
        })
        .catch(() => {
          // ignore if interrupted by fast scene switching
        });
    }
  }, [scene.id, scene.imageUrl, scene.title, scene.defaultYaw, scene.defaultPitch, transitionStyle]);

  // Update sphere horizon correction when sliders change
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    try {
      viewer.setOption('sphereCorrection', {
        pan: `${scene.northOffsetDeg || 0}deg`,
        tilt: `${scene.horizonPitchDeg || 0}deg`,
        roll: `${scene.horizonRollDeg || 0}deg`,
      });
    } catch {
      // ignore before ready
    }
  }, [scene.northOffsetDeg, scene.horizonPitchDeg, scene.horizonRollDeg]);

  // Sync Markers (Hotspots, Polygons, Nadir Cap, and Draft Polygon Points)
  const syncMarkers = useCallback(() => {
    const markersPlugin = markersPluginRef.current;
    if (!markersPlugin) return;

    try {
      markersPlugin.clearMarkers();

      // 1. Add Hotspot Markers
      scene.hotspots.forEach((hp) => {
        const isSelected = selectedHotspotId === hp.id;
        const st = hp.style || (hp.type === 'scene_link' ? DEFAULT_HOTSPOT_STYLE_LINK : DEFAULT_HOTSPOT_STYLE_INFO);
        markersPlugin.addMarker({
          id: hp.id,
          position: { yaw: `${hp.yaw}deg`, pitch: `${hp.pitch}deg` },
          html: buildHotspotHtml(hp, isSelected, defaultFontFamily, isEditor),
          anchor: 'center center',
          tooltip:
            !st.alwaysShowLabel && hp.tooltip
              ? {
                  content: `<div style="font-family:'${st.fontFamily || defaultFontFamily}',sans-serif;font-size:11px;font-weight:700;padding:2px 4px;">${hp.tooltip}</div>`,
                  position: 'top center',
                }
              : undefined,
        });
      });

      // 2. Add 3D Polygon Regions (Loteos / Parcelas / Zonas Destacadas)
      (scene.polygons || []).forEach((poly) => {
        if (!poly.points || poly.points.length < 3) return;
        const isSelected = selectedPolygonId === poly.id;
        const statusColor =
          poly.status === 'disponible'
            ? '#10b981'
            : poly.status === 'reservado'
            ? '#f59e0b'
            : poly.status === 'vendido'
            ? '#ef4444'
            : '#06b6d4';

        markersPlugin.addMarker({
          id: `poly_${poly.id}`,
          polygon: poly.points.map(([yawDeg, pitchDeg]) => [`${yawDeg}deg`, `${pitchDeg}deg`]),
          svgStyle: {
            fill: poly.fillColor || `${statusColor}38`,
            stroke: isSelected ? '#ffffff' : poly.strokeColor || statusColor,
            strokeWidth: isSelected ? '3px' : '2px',
            ...(poly.status === 'reservado' ? { strokeDasharray: '6,4' } : {}),
            cursor: 'pointer',
          },
          tooltip: {
            content: `
              <div style="font-family:'${defaultFontFamily}',sans-serif;padding:4px 6px;">
                <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:${statusColor};font-weight:800;">${poly.status.toUpperCase()}</div>
                <div style="font-size:12px;font-weight:800;color:#fff;">${poly.label}</div>
                ${poly.price ? `<div style="font-size:11px;color:#cbd5e1;font-family:monospace;">${poly.price} ${poly.areaSqm ? `· ${poly.areaSqm}` : ''}</div>` : ''}
              </div>
            `,
            position: 'top center',
          },
        });
      });

      // 3. Add Draft Polygon vertices while drawing in Editor
      if (isEditor && polygonDraftPoints.length > 0) {
        polygonDraftPoints.forEach(([yawDeg, pitchDeg], idx) => {
          markersPlugin.addMarker({
            id: `draft_pt_${idx}`,
            position: { yaw: `${yawDeg}deg`, pitch: `${pitchDeg}deg` },
            html: `<div style="width:14px;height:14px;border-radius:999px;background:#10b981;border:2px solid #fff;box-shadow:0 0 10px #10b981;"></div>`,
            anchor: 'center center',
          });
        });
        if (polygonDraftPoints.length >= 2) {
          markersPlugin.addMarker({
            id: 'draft_poly_line',
            polyline: polygonDraftPoints.map(([y, p]) => [`${y}deg`, `${p}deg`]),
            svgStyle: {
              stroke: '#10b981',
              strokeWidth: '2.5px',
              strokeDasharray: '5,5',
            },
          });
        }
      }

      // 4. Add Nadir Patch (Tripod Logo / Blur Cap at pitch: -89.5deg)
      if (nadir && nadir.enabled && nadir.type !== 'none') {
        const size = nadir.sizePx || 110;
        const nadirHtml =
          nadir.type === 'logo'
            ? `<div style="
                width:${size}px;
                height:${size}px;
                border-radius:9999px;
                overflow:hidden;
                border:2px solid rgba(255,255,255,0.25);
                background:#050505;
                opacity:${nadir.opacity ?? 0.92};
                box-shadow:0 0 35px rgba(0,0,0,0.85);
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                pointer-events:none;
              ">
                <img src="${nadir.logoUrl || '/andina_vision_logo.jpg'}" alt="${nadir.label}" style="width:100%;height:100%;object-fit:cover;" />
              </div>`
            : `<div style="
                width:${size}px;
                height:${size}px;
                border-radius:9999px;
                background:radial-gradient(circle, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.6) 70%, transparent 100%);
                backdrop-filter:blur(18px);
                border:1px solid rgba(255,255,255,0.12);
                display:flex;
                align-items:center;
                justify-content:center;
                color:rgba(255,255,255,0.7);
                font-family:monospace;
                font-size:10px;
                text-align:center;
                padding:12px;
                pointer-events:none;
              ">${nadir.label || 'Andina 360°'}</div>`;

        markersPlugin.addMarker({
          id: 'nadir_cap_marker',
          position: { yaw: '0deg', pitch: '-89.5deg' },
          html: nadirHtml,
          anchor: 'center center',
        });
      }
    } catch {
      // Viewer may still be initializing texture on first tick
    }
  }, [
    scene.hotspots,
    scene.polygons,
    selectedHotspotId,
    selectedPolygonId,
    defaultFontFamily,
    isEditor,
    polygonDraftPoints,
    nadir,
  ]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    syncMarkers();
    const onReady = () => syncMarkers();
    viewer.addEventListener('ready', onReady, { once: true });
    return () => viewer.removeEventListener('ready', onReady);
  }, [syncMarkers]);

  // Direct Hotspot Drag-and-Drop on the 360° Sphere in Editor Mode
  useEffect(() => {
    if (!isEditor || !psvContainerRef.current) return;
    const container = psvContainerRef.current;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const hotspotEl = target.closest('[data-hotspot-id]') as HTMLElement | null;
      if (!hotspotEl) return;
      const hsId = hotspotEl.getAttribute('data-hotspot-id');
      if (!hsId) return;

      // Select hotspot and start drag if Shift or already selected
      const found = scene.hotspots.find((h) => h.id === hsId);
      if (found) {
        onSelectHotspot?.(found);
      }

      if (selectedHotspotId === hsId || e.shiftKey) {
        e.stopPropagation();
        setDraggingHotspotId(hsId);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!draggingHotspotId || !viewerRef.current) return;
      e.stopPropagation();
      e.preventDefault();

      const rect = container.getBoundingClientRect();
      const viewerX = e.clientX - rect.left;
      const viewerY = e.clientY - rect.top;

      try {
        const spherical = (viewerRef.current as any).dataHelper.viewerCoordsToSphericalCoords({
          x: viewerX,
          y: viewerY,
        });
        if (spherical && typeof spherical.yaw === 'number' && typeof spherical.pitch === 'number') {
          const yawDeg = parseFloat((((spherical.yaw * 180) / Math.PI + 540) % 360 - 180).toFixed(1));
          const pitchDeg = parseFloat(((spherical.pitch * 180) / Math.PI).toFixed(1));
          onMoveHotspotCoords?.(draggingHotspotId, yawDeg, pitchDeg);
        }
      } catch {
        // ignore if out of sphere bounds
      }
    };

    const handlePointerUp = () => {
      if (draggingHotspotId) {
        setDraggingHotspotId(null);
      }
    };

    container.addEventListener('pointerdown', handlePointerDown, { capture: true });
    window.addEventListener('pointermove', handlePointerMove, { capture: true });
    window.addEventListener('pointerup', handlePointerUp, { capture: true });

    return () => {
      container.removeEventListener('pointerdown', handlePointerDown, { capture: true });
      window.removeEventListener('pointermove', handlePointerMove, { capture: true });
      window.removeEventListener('pointerup', handlePointerUp, { capture: true });
    };
  }, [isEditor, scene.hotspots, selectedHotspotId, draggingHotspotId, onSelectHotspot, onMoveHotspotCoords]);

  const handleResetView = () => {
    viewerRef.current?.animate({
      yaw: `${scene.defaultYaw || 0}deg`,
      pitch: `${scene.defaultPitch || 0}deg`,
      zoom: 45,
      speed: 450,
    });
  };

  const activeFloorPlan =
    floorPlans.find((fp) => fp.id === activeFloorPlanId) || floorPlans[0] || null;
  const activePinOnPlan = activeFloorPlan?.pins.find((p) => p.sceneId === scene.id);

  // Compute CSS filter for AI Color & HDR Grading
  const gradingFilter = computeCssFilterFromGrading(scene.colorGrading);

  return (
    <div
      ref={wrapperRef}
      className={`relative overflow-hidden select-none bg-[#111111] ${
        isFullscreen ? 'fixed inset-0 z-50 w-screen h-screen' : className
      }`}
    >
      {/* Keyframes for custom hotspot pulse */}
      <style>{`
        @keyframes psvHotspotPulse {
          0% { transform: scale(0.95); opacity: 0.75; }
          70% { transform: scale(1.35); opacity: 0; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        .psv-container {
          background: #050505 !important;
        }
        .psv-canvas-container {
          filter: ${gradingFilter};
          transition: filter 0.25s ease-out;
        }
      `}</style>

      {/* Main Photo Sphere Viewer v5 WebGL Container */}
      <div
        ref={psvContainerRef}
        className={`w-full h-full ${
          editorMode === 'add_hotspot' || editorMode === 'draw_polygon'
            ? 'cursor-crosshair'
            : draggingHotspotId
            ? 'cursor-grabbing'
            : 'cursor-grab'
        }`}
      />

      {/* Smooth Walkthrough Transition Flash Overlay */}
      {isTransitioning && (
        <div className="pointer-events-none absolute inset-0 z-30 bg-[#FF3158]/10 backdrop-blur-[2px] animate-pulse transition-opacity duration-300" />
      )}

      {/* ── TOP HUD BAR (Scene Title, Active Mode & Quick Actions) ── */}
      <div className="pointer-events-none absolute top-4 left-4 right-4 z-20 flex items-start justify-between gap-4">
        {/* Scene Info Pill */}
        <div
          className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-2xl backdrop-blur-xl"
          style={{
            background: 'rgba(8, 12, 20, 0.76)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 12px 32px -8px rgba(0,0,0,0.65)',
          }}
        >
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse"
            style={{ background: primaryBrandColor }}
          />
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-white/50">
              {tourTitle}
            </div>
            <div
              className="text-sm font-bold text-white leading-tight"
              style={{ fontFamily: `'${defaultFontFamily}', sans-serif` }}
            >
              {scene.title}
            </div>
          </div>
          {scene.colorGrading && scene.colorGrading.preset !== 'original' && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-[#FF3158]/15 text-[#FF3158] border border-[#FF3158]/30">
              <Sparkles size={10} /> HDR IA
            </span>
          )}
        </div>

        {/* Editor Mode Active Banner */}
        {isEditor && editorMode !== 'navigate' && (
          <div className="pointer-events-auto px-4 py-2 rounded-full bg-[#FF3158] text-white font-mono text-xs font-bold uppercase tracking-wider shadow-xl flex items-center gap-2 animate-bounce">
            <Move size={14} />
            {editorMode === 'add_hotspot' && 'Haz clic en cualquier punto de la foto 360° para colocar el botón'}
            {editorMode === 'draw_polygon' && `Haz clic en la esfera para trazar vértices del polígono (${polygonDraftPoints.length} pts)`}
          </div>
        )}

        {/* Right HUD Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          {floorPlans.length > 0 && (
            <button
              onClick={() => setIsFloorPlanOpen(!isFloorPlanOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                isFloorPlanOpen
                  ? 'bg-[#FF3158] text-white shadow-lg shadow-[#FF3158]/25'
                  : 'bg-black/70 text-white/80 hover:text-white border border-white/10'
              }`}
              title="Mostrar/Ocultar Plano 2D con Radar"
            >
              <MapIcon size={14} />
              <span className="hidden sm:inline">Plano & Radar</span>
            </button>
          )}

          <button
            onClick={handleResetView}
            className="p-2 rounded-xl bg-black/70 text-white/75 hover:text-white border border-white/10 backdrop-blur-xl transition-colors"
            title="Restablecer orientación inicial"
          >
            <RotateCcw size={15} />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-black/70 text-white/75 hover:text-white border border-white/10 backdrop-blur-xl transition-colors"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* ── INTERACTIVE 2D FLOOR PLAN & LIVE RADAR CONE WIDGET ── */}
      {isFloorPlanOpen && activeFloorPlan && (
        <div
          className={`pointer-events-auto absolute z-20 transition-all duration-300 ${
            isFloorPlanExpanded
              ? 'top-20 right-4 w-[380px] sm:w-[460px]'
              : 'top-20 right-4 w-[240px] sm:w-[290px]'
          }`}
        >
          <div
            className="rounded-2xl overflow-hidden backdrop-blur-2xl"
            style={{
              background: 'rgba(8, 12, 20, 0.88)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 24px 48px -12px rgba(0,0,0,0.85)',
            }}
          >
            {/* Floor Plan Header + Multi-Floor Tabs */}
            <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
                {floorPlans.map((fp) => (
                  <button
                    key={fp.id}
                    onClick={() => setActiveFloorPlanId(fp.id)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider whitespace-nowrap transition-all ${
                      activeFloorPlan.id === fp.id
                        ? 'bg-[#FF3158] text-white font-bold'
                        : 'text-white/60 hover:text-white bg-white/5'
                    }`}
                  >
                    {fp.levelLabel || fp.name}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setIsFloorPlanExpanded(!isFloorPlanExpanded)}
                  className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white text-[10px] font-mono"
                  title="Ampliar/Reducir plano"
                >
                  {isFloorPlanExpanded ? '−' : '+'}
                </button>
                <button
                  onClick={() => setIsFloorPlanOpen(false)}
                  className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white"
                  title="Cerrar plano"
                >
                  <X size={12} />
                </button>
              </div>
            </div>

            {/* Blueprint Canvas with Pins & Live Radar Cone */}
            <div
              className={`relative w-full aspect-[800/540] bg-[#070b12] overflow-hidden ${
                isEditor ? 'cursor-crosshair' : 'cursor-pointer'
              }`}
              onClick={(e) => {
                if (!isEditor || !onUpdateFloorPlanPin) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const xPct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                const yPct = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                onUpdateFloorPlanPin(activeFloorPlan.id, scene.id, xPct, yPct);
              }}
            >
              <img
                src={activeFloorPlan.imageUrl}
                alt={activeFloorPlan.name}
                className="w-full h-full object-contain pointer-events-none"
              />

              {/* Render Pins + Real-Time Rotating Radar Cone */}
              {activeFloorPlan.pins.map((pin) => {
                const isCurrent = pin.sceneId === scene.id;
                const targetSceneObj = allScenes.find((s) => s.id === pin.sceneId);
                const radarAngle = cameraAngles.yawDeg + (pin.northOffsetDeg || 0);

                return (
                  <div
                    key={pin.sceneId}
                    style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (pin.sceneId !== scene.id) {
                        onSceneChange?.(pin.sceneId);
                      }
                    }}
                  >
                    {/* Rotating Radar FOV Cone for Active Scene */}
                    {isCurrent && (
                      <div
                        style={{
                          transform: `translate(-50%, -50%) rotate(${radarAngle}deg)`,
                        }}
                        className="pointer-events-none absolute top-1/2 left-1/2 w-24 h-24 origin-center transition-transform duration-75"
                      >
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <defs>
                            <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
                              <stop offset="0%" stopColor={primaryBrandColor} stopOpacity="0.65" />
                              <stop offset="100%" stopColor={primaryBrandColor} stopOpacity="0.0" />
                            </radialGradient>
                          </defs>
                          <path
                            d="M 50 50 L 15 8 A 55 55 0 0 1 85 8 Z"
                            fill="url(#radarGrad)"
                            stroke={primaryBrandColor}
                            strokeWidth="0.8"
                            strokeOpacity="0.5"
                          />
                        </svg>
                      </div>
                    )}

                    {/* Pin Dot */}
                    <div
                      className={`relative rounded-full flex items-center justify-center transition-transform ${
                        isCurrent
                          ? 'w-4 h-4 bg-emerald-400 ring-4 ring-emerald-400/30 scale-110'
                          : 'w-3 h-3 bg-white/80 hover:bg-cyan-400 hover:scale-125 ring-2 ring-black'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                    </div>

                    {/* Pin Tooltip */}
                    <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 rounded bg-black/90 border border-white/15 text-[9px] font-mono text-white whitespace-nowrap shadow-lg">
                      {targetSceneObj?.title || pin.sceneId}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer hint */}
            <div className="px-3 py-1.5 bg-black/50 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/50">
              <span>
                {isEditor
                  ? 'Clic en el plano para mover el pin actual'
                  : activePinOnPlan
                  ? `Radar activo · ${cameraAngles.yawDeg.toFixed(0)}°`
                  : 'Selecciona un punto para saltar'}
              </span>
              <span className="text-[#FF3158] font-bold">{activeFloorPlan.pins.length} nodos</span>
            </div>
          </div>
        </div>
      )}

      {/* ── BOTTOM SCENE GALLERY CAROUSEL (Kuula / Matterport Style) ── */}
      {showGalleryBar && allScenes.length > 1 && (
        <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between gap-4">
          <div
            className="pointer-events-auto flex items-center gap-2 p-2 rounded-2xl backdrop-blur-xl overflow-x-auto max-w-full sm:max-w-[75%] scrollbar-hide"
            style={{
              background: 'rgba(8, 12, 20, 0.78)',
              border: '1px solid rgba(255,255,255,0.10)',
              boxShadow: '0 16px 40px -10px rgba(0,0,0,0.75)',
            }}
          >
            {allScenes.map((sc, idx) => {
              const active = sc.id === scene.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => onSceneChange?.(sc.id, sc.defaultYaw, sc.defaultPitch)}
                  className={`group relative flex items-center gap-2.5 p-1.5 pr-3 rounded-xl transition-all shrink-0 ${
                    active
                      ? 'bg-[#FF3158]/20 border border-[#FF3158]/60 shadow-lg'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="w-12 h-8 rounded-lg overflow-hidden bg-black relative shrink-0">
                    <img
                      src={sc.imageUrl}
                      alt={sc.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0.5 right-0.5 px-1 rounded bg-black/80 text-[8px] font-mono text-white">
                      #{idx + 1}
                    </span>
                  </div>
                  <div className="text-left">
                    <div
                      className={`text-[11px] font-bold truncate max-w-[110px] ${
                        active ? 'text-[#FF3158]' : 'text-white/80 group-hover:text-white'
                      }`}
                      style={{ fontFamily: `'${defaultFontFamily}', sans-serif` }}
                    >
                      {sc.title}
                    </div>
                    <div className="text-[9px] font-mono text-white/40">
                      {sc.hotspots.length} pts
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Spherical Coordinates Telemetry Pill */}
          <div
            className="pointer-events-auto hidden md:flex items-center gap-3 px-3.5 py-2 rounded-xl backdrop-blur-xl text-[10px] font-mono text-white/60 tabular-nums"
            style={{
              background: 'rgba(8, 12, 20, 0.75)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <span>YAW: {cameraAngles.yawDeg.toFixed(1)}°</span>
            <span className="text-white/20">|</span>
            <span>PITCH: {cameraAngles.pitchDeg.toFixed(1)}°</span>
            {isEditor && (
              <>
                <span className="text-white/20">|</span>
                <span className="text-[#FF3158]">Shift+Arrastrar para mover botón</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── HOTSPOT DETAIL MODAL (Info / Video / Product) ── */}
      {activeModalHotspot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="double-bezel-outer w-full max-w-lg animate-in fade-in zoom-in-95 duration-300">
            <div className="double-bezel-inner p-6 sm:p-8 bg-white relative">
              <button
                onClick={() => setActiveModalHotspot(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-[#F5F4F3] text-[#666666] hover:text-[#111111] hover:bg-[#E5E5E5] transition-colors"
              >
                <X size={16} />
              </button>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-[#FF3158]/15 text-[#FF3158] border border-[#FF3158]/30 mb-3">
                {activeModalHotspot.priceTag ? `Valor: ${activeModalHotspot.priceTag}` : 'Ficha Interactiva 360°'}
              </div>

              <h3
                className="text-xl font-bold text-[#111111] mb-2"
                style={{ fontFamily: `'${activeModalHotspot.style?.fontFamily || defaultFontFamily}', sans-serif` }}
              >
                {activeModalHotspot.title || activeModalHotspot.tooltip || 'Punto de Interés'}
              </h3>

              {activeModalHotspot.description && (
                <p className="text-xs font-mono text-[#666666] leading-relaxed mb-5">
                  {activeModalHotspot.description}
                </p>
              )}

              {activeModalHotspot.youtubeVideoId && (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-5 bg-black border border-[#E5E5E5]">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${activeModalHotspot.youtubeVideoId}?autoplay=1`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Video incrustado"
                  />
                </div>
              )}

              {activeModalHotspot.driveUrl && (
                <a
                  href={activeModalHotspot.driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full p-3.5 rounded-xl bg-[#F5F4F3] hover:bg-[#E5E5E5] border border-[#E5E5E5] transition-colors"
                >
                  <span className="text-xs font-mono font-bold text-[#FF3158] flex items-center gap-2">
                    <ExternalLink size={14} />
                    {activeModalHotspot.driveLabel || 'Ver Documento / Plano Adjunto'}
                  </span>
                  <ChevronRight size={15} className="text-[#111111]/50" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── POLYGON LOT / ZONE MODAL (Loteos & Inmobiliaria) ── */}
      {activeModalPolygon && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="double-bezel-outer w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
            <div className="double-bezel-inner p-6 bg-white relative">
              <button
                onClick={() => setActiveModalPolygon(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-[#F5F4F3] text-[#666666] hover:text-[#111111]"
              >
                <X size={16} />
              </button>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-[#FF3158]/15 text-[#FF3158] border border-[#FF3158]/30 mb-3">
                <CheckCircle2 size={12} /> Estado: {activeModalPolygon.status.toUpperCase()}
              </span>

              <h3 className="text-lg font-display font-bold text-[#111111] mb-1">
                {activeModalPolygon.label}
              </h3>

              <div className="flex items-center gap-4 text-xs font-mono text-[#FF3158] mb-4">
                {activeModalPolygon.areaSqm && <span>Superficie: {activeModalPolygon.areaSqm}</span>}
                {activeModalPolygon.price && <span>Valor: {activeModalPolygon.price}</span>}
              </div>

              {activeModalPolygon.description && (
                <p className="text-xs font-mono text-[#666666] leading-relaxed mb-5">
                  {activeModalPolygon.description}
                </p>
              )}

              <button
                onClick={() => setActiveModalPolygon(null)}
                className="w-full py-2.5 rounded-xl bg-[#FF3158] hover:bg-emerald-400 text-[#111111] font-display font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Cerrar Ficha de Zona
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
