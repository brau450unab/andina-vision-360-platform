import React, { useState, useMemo } from 'react';
import {
  Folder,
  UploadCloud,
  Search,
  Image as ImageIcon,
  Clock,
  MapPin,
  Eye,
  X,
  HardDrive,
  Plus,
  Check,
  Trash2,
  Sparkles,
  Sliders,
  Wand2,
  FolderPlus,
  ArrowRight,
} from 'lucide-react';
import {
  PanoramaItem,
  AI_COLOR_PRESETS,
  DEFAULT_COLOR_GRADING,
  SceneColorGrading,
} from './panoramasData';
import { useTourSaaS } from '../../context/TourSaaSContext';
import { PSVEngine360 } from './PSVEngine360';
import { uploadCloudPanoramaImage } from '../../services/tourCloudService';

interface ImageLibrary360Props {
  onOpenStudio?: (tourId?: string) => void;
}

export const ImageLibrary360: React.FC<ImageLibrary360Props> = ({ onOpenStudio }) => {
  const {
    panoramas,
    addPanoramaToGallery,
    deletePanoramaItem,
    createTourProject,
    openTourInStudio,
    storageUsedMB,
    storageLimitMB,
    user
  } = useTourSaaS();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedFolder, setSelectedFolder] = useState<string>('Todas');
  const [selectedPanoIds, setSelectedPanoIds] = useState<string[]>([]);
  const [inspectedPano, setInspectedPano] = useState<PanoramaItem | null>(null);
  const [inspectGrading, setInspectGrading] = useState<SceneColorGrading>(DEFAULT_COLOR_GRADING);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadLocation, setUploadLocation] = useState('Iquique, Chile');
  const [uploadCategory, setUploadCategory] = useState<PanoramaItem['category']>('Inmobiliaria');
  const [uploadFolder, setUploadFolder] = useState('Depto Piloto Cavancha');
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string>('');
  const [uploadFileSizeMB, setUploadFileSizeMB] = useState<number>(14.2);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Create Tour from Selection Modal State
  const [isCreateTourModalOpen, setIsCreateTourModalOpen] = useState(false);
  const [newTourTitle, setNewTourTitle] = useState('');
  const [newTourSubtitle, setNewTourSubtitle] = useState('');

  const folders = useMemo(() => {
    const map = new Map<string, number>();
    panoramas.forEach((p) => {
      const f = p.folder || 'General';
      map.set(f, (map.get(f) || 0) + 1);
    });
    return Array.from(map.entries());
  }, [panoramas]);

  const filteredPanoramas = useMemo(() => {
    return panoramas.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.location || p.environment || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'Todas' || p.category === selectedCategory;
      const matchesFolder = selectedFolder === 'Todas' || (p.folder || 'General') === selectedFolder;
      return matchesSearch && matchesCat && matchesFolder;
    });
  }, [panoramas, searchQuery, selectedCategory, selectedFolder]);

  const toggleSelectPano = (id: string) => {
    setSelectedPanoIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadPreviewUrl(url);
    setUploadTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    setUploadFileSizeMB(Number((file.size / (1024 * 1024)).toFixed(1)) || 12.5);
    setUploadFile(file);
  };

  const handleConfirmUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle) return;
    
    let finalUrl = uploadPreviewUrl || '/panoramas/depto_living_terraza.jpg';
    
    if (uploadFile) {
      setIsUploading(true);
      try {
        finalUrl = await uploadCloudPanoramaImage(user?.uid || 'anonymous', uploadFile, (progress) => {
          setUploadProgress(Math.round(progress));
        });
      } catch (err) {
        console.error('Error uploading file:', err);
        alert('Error al subir la imagen a la nube.');
        setIsUploading(false);
        return;
      }
    }
    
    addPanoramaToGallery({
      title: uploadTitle || 'Nueva Panorámica 360° 8K',
      location: uploadLocation || 'Iquique, Chile',
      date: 'Recién subido',
      resolution: '8192 × 4096 px (8K HDR)',
      size: `${uploadFileSizeMB} MB`,
      sizeMB: uploadFileSizeMB,
      category: uploadCategory,
      imageUrl: finalUrl,
      thumbnailUrl: finalUrl,
      description: `Captura equirrectangular 360° en carpeta ${uploadFolder}.`,
      folder: uploadFolder,
      aiEnhanced: true,
    });
    
    setIsUploading(false);
    setUploadProgress(0);
    setUploadFile(null);
    setUploadTitle('');
    setUploadPreviewUrl('');
    setIsUploadModalOpen(false);
  };

  const handleCreateTourFromSelection = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPanoIds.length === 0) return;
    const created = createTourProject(
      newTourTitle || 'Nuevo Tour Virtual 360°',
      newTourSubtitle || `${selectedPanoIds.length} escenas conectadas`,
      selectedPanoIds,
      'Inmobiliaria'
    );
    setIsCreateTourModalOpen(false);
    setSelectedPanoIds([]);
    openTourInStudio(created.id);
    if (onOpenStudio) onOpenStudio(created.id);
  };

  const storagePercent = Math.min(100, Math.round((storageUsedMB / storageLimitMB) * 100));

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#F5F4F3] text-[#222222] flex flex-col font-sans">
      {/* ── HEADER BAR ─────────────────────────────────────────── */}
      <header className="border-b border-[#E5E5E5] px-6 py-5 flex flex-wrap items-center justify-between gap-4 bg-white backdrop-blur-xl sticky top-0 z-20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FF3158]/10 border border-[#E5E5E5] text-[#FF3158] text-[10px] font-mono font-bold uppercase tracking-wider">
              Andina Visión · Galería de Proyectos HD
            </span>
            <span className="text-xs font-mono text-[#666666]">
              {panoramas.length} fotografías reales 8K/4K (4096×2048 px) en tu cuenta
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-black text-[#111111] tracking-tight uppercase mt-1">
            Galería de Fotos 360° &amp; Capturas HD del Proyecto
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search input */}
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FF3158]/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar foto, cliente o locación..."
              className="bg-white border border-[#E5E5E5] rounded-full pl-9 pr-4 py-2 text-xs font-mono text-[#111111] focus:outline-none focus:border-[#222222] w-60 sm:w-72 transition-colors"
            />
          </div>

          {/* Multi-select action button */}
          {selectedPanoIds.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setNewTourTitle(`Tour Virtual (${selectedPanoIds.length} escenas HD)`);
                setNewTourSubtitle('Proyecto Interactivo 360° HD');
                setIsCreateTourModalOpen(true);
              }}
              className="h-9 px-4 rounded-full bg-[#222222] hover:bg-sky-300 text-[#111111] font-display font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#222222]/20 transition-all cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Crear Tour con {selectedPanoIds.length} Fotos</span>
              <ArrowRight size={13} />
            </button>
          )}

          {/* Upload 8K button */}
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="h-9 px-4 rounded-full text-[#111111] font-display font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #FBBF24 0%, #D49B54 60%, #38BDF8 100%)',
              boxShadow: '0 6px 20px -4px rgba(212,155,84,0.45)',
            }}
          >
            <UploadCloud size={14} />
            <span>Subir Foto 360° (8K/4K)</span>
          </button>
        </div>
      </header>

      {/* ── MAIN BODY: SIDEBAR + GALLERY GRID ─────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* LEFT SIDEBAR: FOLDERS, CATEGORIES & STORAGE */}
        <aside className="w-full lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-[#E5E5E5] bg-white p-5 flex flex-col justify-between gap-6">
          <div className="space-y-6">
            {/* Folders */}
            <div>
              <div className="flex items-center justify-between mb-2.5 px-1">
                <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#FF3158]/70 font-bold">
                  Carpetas de Proyecto HD
                </h3>
                <FolderPlus size={13} className="text-[#FF3158]" />
              </div>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setSelectedFolder('Todas')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                    selectedFolder === 'Todas'
                      ? 'bg-[#FFE8EC] text-[#FF3158] border border-[#FF3158] font-bold'
                      : 'text-slate-300/70 hover:bg-[#F5F4F3] hover:text-[#111111]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Folder size={13} />
                    <span>Todas las Fotos HD</span>
                  </div>
                  <span className="text-[10px] opacity-80">{panoramas.length}</span>
                </button>

                {folders.map(([folderName, count]) => (
                  <button
                    key={folderName}
                    type="button"
                    onClick={() => setSelectedFolder(folderName)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                      selectedFolder === folderName
                        ? 'bg-[#FFE8EC] text-[#FF3158] border border-[#FF3158] font-bold'
                        : 'text-slate-300/70 hover:bg-[#F5F4F3] hover:text-[#111111]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Folder size={13} className="shrink-0" />
                      <span className="truncate">{folderName}</span>
                    </div>
                    <span className="text-[10px] opacity-80">{count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category filter */}
            <div>
              <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#222222]/70 font-bold mb-2.5 px-1">
                Categoría Vertical
              </h3>
              <div className="flex flex-wrap lg:flex-col gap-1">
                {['Todas', 'Inmobiliaria', 'Loteos y Terrenos', 'Comercial', 'Industrial'].map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-left text-xs font-mono transition-colors cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-[#E5E5E5] text-[#222222] border border-[#222222] font-bold'
                          : 'text-[#666666] hover:text-[#111111] hover:bg-[#F5F4F3]'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Storage Quota Box */}
          <div className="p-4 rounded-2xl bg-white border border-[#E5E5E5]">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#111111] mb-2">
              <HardDrive size={14} className="text-[#FF3158]" />
              <span>Espacio Cloud 360° HD</span>
            </div>
            <div className="w-full bg-[#F5F4F3] h-2 rounded-full overflow-hidden mb-2">
              <div
                className="bg-[#FF3158] h-full rounded-full transition-all"
                style={{ width: `${Math.max(5, storagePercent)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-[#666666]">
              <span>{storageUsedMB.toFixed(1)} MB usados</span>
              <span>{(storageLimitMB / 1024).toFixed(0)} GB Plan</span>
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT: PHOTO CARDS GRID */}
        <main className="flex-1 p-6">
          {/* Quick Selection Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#E5E5E5]">
            <div className="text-xs font-mono text-[#666666]">
              Mostrando <strong className="text-[#FF3158]">{filteredPanoramas.length}</strong> capturas equirrectangulares HD del proyecto (4096×2048 px)
            </div>
            <div className="flex items-center gap-2">
              {selectedPanoIds.length > 0 ? (
                <>
                  <span className="text-xs font-mono text-[#222222] font-bold">
                    {selectedPanoIds.length} seleccionadas
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedPanoIds([])}
                    className="px-2.5 py-1 rounded-lg bg-[#F5F4F3] hover:bg-[#F5F4F3] text-[11px] font-mono text-[#666666] hover:text-[#111111] cursor-pointer"
                  >
                    Deseleccionar
                  </button>
                </>
              ) : (
                <span className="text-[11px] font-mono text-[#666666]">
                  Tip: Selecciona varias fotos para armar un Tour 360° en 1 clic
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPanoramas.map((item) => {
              const isSelected = selectedPanoIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`group rounded-2xl bg-white border transition-all overflow-hidden flex flex-col shadow-xl ${
                    isSelected
                      ? 'border-[#FF3158] ring-2 ring-[#FF3158]/30'
                      : 'border-[#E5E5E5] hover:border-[#FF3158]'
                  }`}
                >
                  {/* Thumbnail with 360 badge & multi-select checkbox */}
                  <div
                    onClick={() => {
                      setInspectedPano(item);
                      setInspectGrading(item.colorGrading || DEFAULT_COLOR_GRADING);
                    }}
                    className="h-48 relative overflow-hidden bg-white cursor-pointer"
                  >
                    <img
                      src={item.thumbnailUrl || item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060E1B] via-black/20 to-transparent" />

                    {/* Select Checkbox button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectPano(item.id);
                      }}
                      title="Seleccionar foto para nuevo tour"
                      className={`absolute top-3 left-3 w-7 h-7 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#222222] border-sky-300 text-[#111111] font-bold'
                          : 'bg-[#071324]/75 border-[#E5E5E5] text-transparent hover:border-amber-300'
                      }`}
                    >
                      <Check size={14} />
                    </button>

                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {item.aiEnhanced && (
                        <span className="px-2 py-0.5 rounded-md bg-[#FF3158] backdrop-blur-md text-[9px] font-mono uppercase tracking-wider text-white font-extrabold flex items-center gap-1">
                          <Wand2 size={10} /> HDR IA
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-md bg-white backdrop-blur-md border border-[#E5E5E5] text-[10px] font-mono uppercase tracking-wider text-[#FF3158] font-bold">
                        {item.resolution}
                      </span>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-[#060E1B]/45 backdrop-blur-[2px]">
                      <div
                        className="px-4 py-2 rounded-full text-[#111111] font-display font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl"
                        style={{
                          background: 'linear-gradient(135deg, #FBBF24 0%, #D49B54 60%, #38BDF8 100%)',
                        }}
                      >
                        <Eye size={14} /> Inspeccionar en 360° HD
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-[#111111]/90">
                      <span className="flex items-center gap-1 truncate">
                        <MapPin size={11} className="text-[#FF3158] shrink-0" />
                        {item.location || item.environment}
                      </span>
                      <span className="text-[#666666] shrink-0">{item.size || item.fileSize}</span>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          onClick={() => {
                            setInspectedPano(item);
                            setInspectGrading(item.colorGrading || DEFAULT_COLOR_GRADING);
                          }}
                          className="text-sm font-display font-bold text-[#111111] group-hover:text-[#FF3158] transition-colors cursor-pointer"
                        >
                          {item.title}
                        </h4>
                        <button
                          type="button"
                          onClick={() => deletePanoramaItem(item.id)}
                          title="Eliminar foto de la galería"
                          className="text-[#111111]/30 hover:text-red-400 p-1 rounded-lg hover:bg-[#F5F4F3] transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <p className="text-xs text-[#111111]/45 mt-1 line-clamp-2">{item.description}</p>
                    </div>

                    <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#888888] flex items-center gap-1">
                        <Clock size={11} /> {item.date}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setInspectedPano(item);
                            setInspectGrading(DEFAULT_COLOR_GRADING);
                          }}
                          className="text-[#FF3158] hover:text-emerald-300 font-bold cursor-pointer"
                        >
                          Abrir Visor 360°
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* ── MODAL 1: INSPECTOR 360° CON PRESETS DE COLOR/HDR IA ───── */}
      {inspectedPano && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E5E5E5]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#222222]/15 border border-[#E5E5E5] flex items-center justify-center text-[#FF3158]">
                <ImageIcon size={18} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-display font-black text-[#111111]">
                  {inspectedPano.title}
                </h2>
                <p className="text-xs font-mono text-[#111111]/50">
                  {inspectedPano.location} · {inspectedPano.resolution} · Motor Photo Sphere Viewer v5
                </p>
              </div>
            </div>

            {/* Live AI Color Grading Quick Bar */}
            <div className="flex items-center gap-1.5 flex-wrap bg-[#F5F4F3] p-1.5 rounded-xl border border-[#E5E5E5]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 px-2 flex items-center gap-1 font-bold">
                <Wand2 size={12} /> Preset IA:
              </span>
              {Object.entries(AI_COLOR_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setInspectGrading({ ...DEFAULT_COLOR_GRADING, ...preset.grading })}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                    inspectGrading.presetName === key
                      ? 'bg-purple-500 text-[#111111] font-bold shadow'
                      : 'text-[#666666] hover:text-[#111111] hover:bg-[#F5F4F3]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const created = createTourProject(
                    `Tour · ${inspectedPano.title}`,
                    inspectedPano.location || inspectedPano.environment || 'Iquique, Chile',
                    [inspectedPano.id],
                    inspectedPano.category
                  );
                  setInspectedPano(null);
                  openTourInStudio(created.id);
                  if (onOpenStudio) onOpenStudio(created.id);
                }}
                className="px-4 py-2 rounded-xl bg-[#222222] hover:bg-black text-white font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <Sliders size={13} /> Editar en Tour Studio
              </button>
              <button
                type="button"
                onClick={() => setInspectedPano(null)}
                className="p-2 rounded-xl bg-[#F5F4F3] hover:bg-[#E5E5E5] text-[#111111] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 mt-4 rounded-2xl overflow-hidden border border-[#E5E5E5] relative">
            <PSVEngine360
              scene={{
                id: inspectedPano.id,
                title: inspectedPano.title,
                location: inspectedPano.location,
                category: inspectedPano.category,
                resolution: inspectedPano.resolution,
                imageUrl: inspectedPano.imageUrl,
                thumbnailUrl: inspectedPano.thumbnailUrl,
                description: inspectedPano.description,
                defaultYaw: 0,
                defaultPitch: 0,
                hotspots: [],
                colorGrading: inspectGrading,
              }}
              className="w-full h-full min-h-[70vh]"
              autoRotate={false}
            />
          </div>
        </div>
      )}

      {/* ── MODAL 2: SUBIR NUEVA FOTO 360° ────────────────────────── */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-[#E5E5E5] p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF3158] font-bold">
                  Repositorio Cloud 8K
                </span>
                <h3 className="text-xl font-display font-black text-[#111111] uppercase mt-0.5">
                  Subir Fotografía Equirrectangular 360°
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-2 rounded-full bg-[#F5F4F3] hover:bg-[#F5F4F3] text-[#666666] hover:text-[#111111] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmUpload} className="space-y-4">
              <label className="block border-2 border-dashed border-[#E5E5E5] hover:border-[#222222] rounded-2xl p-6 text-center cursor-pointer bg-[#F5F4F3] transition-all">
                <UploadCloud size={28} className="text-[#FF3158] mx-auto mb-2" />
                <div className="text-xs font-display font-bold text-[#111111]">
                  {uploadPreviewUrl
                    ? '¡Imagen 360° cargada y lista!'
                    : 'Haz clic para seleccionar tu archivo JPG/PNG 360° (Proyección 2:1)'}
                </div>
                <div className="text-[11px] font-mono text-[#111111]/45 mt-1">
                  Soporta cámaras Insta360, Ricoh Theta, DJI Mavic 3 Panorama hasta 12K
                </div>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#666666] mb-1">
                  Título de la Habitación / Escena *
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Ej: Living & Terraza Piso 18"
                  className="w-full bg-[#F5F4F3] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#222222]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#666666] mb-1">
                    Carpeta de Proyecto
                  </label>
                  <input
                    type="text"
                    value={uploadFolder}
                    onChange={(e) => setUploadFolder(e.target.value)}
                    placeholder="Ej: Edificio Mirador"
                    className="w-full bg-[#F5F4F3] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#222222]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#666666] mb-1">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    value={uploadLocation}
                    onChange={(e) => setUploadLocation(e.target.value)}
                    placeholder="Ej: Península Cavancha"
                    className="w-full bg-[#F5F4F3] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#222222]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#F5F4F3] text-xs font-mono text-[#111111]/70 hover:text-[#111111] cursor-pointer"
                >
                  Cancelar
                </button>
                {isUploading && (
                  <div className='flex items-center gap-2 text-xs font-bold text-[#FF3158]'>
                    Subiendo... {uploadProgress}%
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2.5 rounded-xl bg-[#222222] hover:bg-black text-white font-display font-black text-xs uppercase tracking-wider cursor-pointer"
                >
                  Guardar en Mi Galería 360°
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: CREAR TOUR DESDE SELECCIÓN ──────────────────── */}
      {isCreateTourModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-[#E5E5E5] p-6 sm:p-8 shadow-2xl">
            <h3 className="text-lg font-display font-black text-[#111111] uppercase mb-2">
              Crear Nuevo Tour con {selectedPanoIds.length} Escenas
            </h3>
            <p className="text-xs font-mono text-[#111111]/50 mb-5">
              Se generará un proyecto editable en tu Biblioteca de Tours y se abrirá inmediatamente en el Studio.
            </p>
            <form onSubmit={handleCreateTourFromSelection} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#666666] mb-1">
                  Nombre del Tour Virtual *
                </label>
                <input
                  type="text"
                  required
                  value={newTourTitle}
                  onChange={(e) => setNewTourTitle(e.target.value)}
                  className="w-full bg-[#F5F4F3] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#222222]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#666666] mb-1">
                  Subtítulo / Cliente
                </label>
                <input
                  type="text"
                  value={newTourSubtitle}
                  onChange={(e) => setNewTourSubtitle(e.target.value)}
                  className="w-full bg-[#F5F4F3] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#222222]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateTourModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F5F4F3] text-xs font-mono text-[#111111]/70 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF3158] hover:bg-[#E01E45] text-white font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} /> Crear y Abrir Studio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
