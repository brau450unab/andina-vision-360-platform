/**
 * Utilidad para resolver y normalizar enlaces de video e imagen desde:
 * - Google Drive (enlaces compartidos o IDs)
 * - YouTube (enlaces completos, cortos o IDs)
 * - Servidores en la nube (Hostinger, administrable.cl, CDN, MP4 directo)
 * - Archivos locales (/input_file_X.png)
 */

export interface ResolvedVideo {
  type: 'drive' | 'youtube' | 'direct';
  embedUrl: string;
  rawInput: string;
  driveId?: string;
  youtubeId?: string;
}

/**
 * Extrae el ID de un enlace o ID de Google Drive
 */
export function extractGoogleDriveId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  
  // Si ya es un ID simple (alfanumérico de entre 20 y 45 caracteres sin barras)
  if (/^[a-zA-Z0-9_-]{20,45}$/.test(trimmed)) {
    return trimmed;
  }
  
  // drive.google.com/file/d/FILE_ID/...
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)\//);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];
  
  // drive.google.com/open?id=FILE_ID o ?id=FILE_ID
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) return idParamMatch[1];

  return null;
}

/**
 * Extrae el ID de un enlace o ID de YouTube
 */
export function extractYouTubeId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Si ya es un ID simple de YouTube (11 caracteres)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // youtu.be/VIDEO_ID
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch && shortMatch[1]) return shortMatch[1];

  // youtube.com/watch?v=VIDEO_ID
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) return watchMatch[1];

  // youtube.com/embed/VIDEO_ID
  const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch && embedMatch[1]) return embedMatch[1];

  return null;
}

/**
 * Resuelve cualquier entrada de video a un objeto con tipo y URL de incrustación
 */
export function resolveVideoSource(input: string): ResolvedVideo {
  if (!input) {
    return {
      type: 'drive',
      embedUrl: '',
      rawInput: input
    };
  }

  const trimmed = input.trim();

  // 1. Verificar si es YouTube
  const ytId = extractYouTubeId(trimmed);
  if (ytId) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`,
      rawInput: trimmed,
      youtubeId: ytId
    };
  }

  // 2. Verificar si es Google Drive
  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    return {
      type: 'drive',
      embedUrl: `https://drive.google.com/file/d/${driveId}/preview`,
      rawInput: trimmed,
      driveId
    };
  }

  // 3. Servidor en la nube directo (Hostinger, administrable.cl, MP4, WebM, etc.)
  return {
    type: 'direct',
    embedUrl: trimmed,
    rawInput: trimmed
  };
}

/**
 * Resuelve cualquier entrada de imagen (Google Drive, Hostinger, local)
 */
export function resolveImageSource(input: string, fallback = '/input_file_0.png'): string {
  if (!input) return fallback;
  const trimmed = input.trim();

  // Si es un enlace de Google Drive
  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    // Thumbnail de alta resolución desde Google Drive
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1920`;
  }

  return trimmed;
}