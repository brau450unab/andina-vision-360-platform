export interface PanoramaItem {
  id: string;
  title: string;
  environment: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  category: 'living' | 'dormitorio' | 'cocina' | 'bano' | 'exterior';
  resolution: string;
  aspectRatio: string;
  uploadedAt: string;
  fileSize: string;
  device: string;
  initialYaw: number;
  initialPitch: number;
  tags: string[];
}

export interface HotspotLink {
  id: string;
  type: 'scene_link' | 'info_popup';
  yaw: number;
  pitch: number;
  tooltip: string;
  targetSceneId?: string;
  targetYaw?: number;
  targetPitch?: number;
  title?: string;
  description?: string;
  youtubeVideoId?: string;
  driveUrl?: string;
  driveLabel?: string;
}

export interface TourScene {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  defaultYaw: number;
  defaultPitch: number;
  hotspots: HotspotLink[];
}

export const REAL_PANORAMAS: PanoramaItem[] = [
  {
    id: 'pano_living_acceso',
    title: 'Living & Acceso Principal',
    environment: 'Living Comedor',
    description: 'Vista panorámica amplia del living con piso flotante de madera, vista a la puerta de entrada y vestíbulo.',
    imageUrl: '/panoramas/depto_living_acceso.jpg',
    thumbnailUrl: '/panoramas/depto_living_acceso.jpg',
    category: 'living',
    resolution: '8192 × 4096 px (8K HDR)',
    aspectRatio: '2:1 Equirrectangular',
    uploadedAt: '24 Sep 2026',
    fileSize: '10.3 MB',
    device: 'Cámara 360 / Dron DJI Air',
    initialYaw: 0,
    initialPitch: -10,
    tags: ['Living', 'Acceso', 'Piso Flotante', 'Iluminación Natural']
  },
  {
    id: 'pano_hall_cocina',
    title: 'Hall de Distribución & Cocina',
    environment: 'Hall & Cocina Americana',
    description: 'Punto estratégico que conecta la cocina americana con muebles de madera y el pasillo hacia dormitorios.',
    imageUrl: '/panoramas/depto_hall_cocina.jpg',
    thumbnailUrl: '/panoramas/depto_hall_cocina.jpg',
    category: 'cocina',
    resolution: '8192 × 4096 px (8K HDR)',
    aspectRatio: '2:1 Equirrectangular',
    uploadedAt: '24 Sep 2026',
    fileSize: '14.7 MB',
    device: 'Cámara 360 / Dron DJI Air',
    initialYaw: 45,
    initialPitch: -5,
    tags: ['Cocina Americana', 'Hall Central', 'Mobiliario']
  },
  {
    id: 'pano_pasillo_bano',
    title: 'Pasillo de Circulación & Baño',
    environment: 'Zona de Baños & Clósets',
    description: 'Área íntima que da acceso al baño completo con tina y clóset de ropa blanca empotrado.',
    imageUrl: '/panoramas/depto_pasillo_bano.jpg',
    thumbnailUrl: '/panoramas/depto_pasillo_bano.jpg',
    category: 'bano',
    resolution: '8192 × 4096 px (8K HDR)',
    aspectRatio: '2:1 Equirrectangular',
    uploadedAt: '24 Sep 2026',
    fileSize: '7.6 MB',
    device: 'Cámara 360 / Dron DJI Air',
    initialYaw: 180,
    initialPitch: 0,
    tags: ['Baño Completo', 'Clóset Empotrado', 'Pasillo']
  },
  {
    id: 'pano_dormitorio',
    title: 'Dormitorio Principal',
    environment: 'Dormitorio Suite',
    description: 'Habitación principal luminosa con amplio ventanal exterior y clóset de madera de doble cuerpo.',
    imageUrl: '/panoramas/depto_dormitorio.jpg',
    thumbnailUrl: '/panoramas/depto_dormitorio.jpg',
    category: 'dormitorio',
    resolution: '8192 × 4096 px (8K HDR)',
    aspectRatio: '2:1 Equirrectangular',
    uploadedAt: '24 Sep 2026',
    fileSize: '13.7 MB',
    device: 'Cámara 360 / Dron DJI Air',
    initialYaw: 90,
    initialPitch: -8,
    tags: ['Dormitorio Principal', 'Clóset Madera', 'Ventanal']
  },
  {
    id: 'pano_living_terraza',
    title: 'Living Comedor & Balcón Terraza',
    environment: 'Balcón & Ventanal',
    description: 'Zona de estar principal orientada hacia el ventanal con salida a la terraza y vista exterior.',
    imageUrl: '/panoramas/depto_living_terraza.jpg',
    thumbnailUrl: '/panoramas/depto_living_terraza.jpg',
    category: 'living',
    resolution: '8192 × 4096 px (8K HDR)',
    aspectRatio: '2:1 Equirrectangular',
    uploadedAt: '24 Sep 2026',
    fileSize: '14.4 MB',
    device: 'Cámara 360 / Dron DJI Air',
    initialYaw: -30,
    initialPitch: -12,
    tags: ['Terraza', 'Balcón', 'Living', 'Vista Exterior']
  }
];

export const INITIAL_DEPARTMENT_TOUR: TourScene[] = [
  {
    id: 'pano_living_acceso',
    title: 'Living & Acceso Principal',
    subtitle: 'Entrada al Departamento',
    imageUrl: '/panoramas/depto_living_acceso.jpg',
    defaultYaw: 0,
    defaultPitch: -10,
    hotspots: [
      {
        id: 'hs_to_hall',
        type: 'scene_link',
        yaw: 28,
        pitch: -6,
        tooltip: 'Avanzar hacia Hall y Cocina',
        targetSceneId: 'pano_hall_cocina',
        targetYaw: 0,
        targetPitch: -5
      },
      {
        id: 'hs_to_terraza',
        type: 'scene_link',
        yaw: -45,
        pitch: -8,
        tooltip: 'Ir hacia Living & Balcón Terraza',
        targetSceneId: 'pano_living_terraza',
        targetYaw: 0,
        targetPitch: -10
      },
      {
        id: 'hs_info_acceso',
        type: 'info_popup',
        yaw: 175,
        pitch: 0,
        tooltip: 'Detalles de Seguridad & Puerta',
        title: 'Acceso Principal & Cerradura Inteligente',
        description: 'Puerta de seguridad reforzada con mirilla óptica y chapa de alta resistencia. Tablero eléctrico general sectorizado.',
        driveUrl: 'https://drive.google.com',
        driveLabel: 'Ver Ficha Técnica en Google Drive'
      }
    ]
  },
  {
    id: 'pano_hall_cocina',
    title: 'Hall Central & Cocina',
    subtitle: 'Conexión Living - Cocina - Pasillo',
    imageUrl: '/panoramas/depto_hall_cocina.jpg',
    defaultYaw: 45,
    defaultPitch: -5,
    hotspots: [
      {
        id: 'hs_to_living',
        type: 'scene_link',
        yaw: -135,
        pitch: -10,
        tooltip: 'Volver a Entrada Principal',
        targetSceneId: 'pano_living_acceso',
        targetYaw: 180,
        targetPitch: -5
      },
      {
        id: 'hs_to_pasillo',
        type: 'scene_link',
        yaw: 40,
        pitch: -4,
        tooltip: 'Ingresar a Pasillo de Dormitorios',
        targetSceneId: 'pano_pasillo_bano',
        targetYaw: 0,
        targetPitch: 0
      },
      {
        id: 'hs_info_cocina',
        type: 'info_popup',
        yaw: -80,
        pitch: -12,
        tooltip: 'Especificaciones de Cocina',
        title: 'Cocina Equipada & Instalaciones',
        description: 'Muebles de cocina aéreos y de base enchapados en madera, lavaplatos de acero inoxidable y conexión para gas natural.',
        youtubeVideoId: 'dQw4w9WgXcQ',
        driveUrl: 'https://drive.google.com',
        driveLabel: 'Plano de Instalaciones Sanitarias'
      }
    ]
  },
  {
    id: 'pano_pasillo_bano',
    title: 'Pasillo & Baño Completo',
    subtitle: 'Distribución Zona de Descanso',
    imageUrl: '/panoramas/depto_pasillo_bano.jpg',
    defaultYaw: 180,
    defaultPitch: 0,
    hotspots: [
      {
        id: 'hs_to_dormitorio',
        type: 'scene_link',
        yaw: 35,
        pitch: -6,
        tooltip: 'Entrar al Dormitorio Principal',
        targetSceneId: 'pano_dormitorio',
        targetYaw: 0,
        targetPitch: -5
      },
      {
        id: 'hs_to_hall2',
        type: 'scene_link',
        yaw: 180,
        pitch: -5,
        tooltip: 'Regresar al Hall y Living',
        targetSceneId: 'pano_hall_cocina',
        targetYaw: -140,
        targetPitch: -5
      },
      {
        id: 'hs_info_bano',
        type: 'info_popup',
        yaw: 90,
        pitch: -5,
        tooltip: 'Ver Baño Completo',
        title: 'Baño Principal con Tina',
        description: 'Piso cerámico lavable, vanitorio con espejo de muro a muro, tina esmaltada y ventilación por extractor silencioso.',
        driveUrl: 'https://drive.google.com',
        driveLabel: 'Certificado de Inspección SEC'
      }
    ]
  },
  {
    id: 'pano_dormitorio',
    title: 'Dormitorio Principal',
    subtitle: 'Espacio de Descanso y Clóset',
    imageUrl: '/panoramas/depto_dormitorio.jpg',
    defaultYaw: 90,
    defaultPitch: -8,
    hotspots: [
      {
        id: 'hs_to_pasillo2',
        type: 'scene_link',
        yaw: -170,
        pitch: -5,
        tooltip: 'Salir hacia Pasillo',
        targetSceneId: 'pano_pasillo_bano',
        targetYaw: 180,
        targetPitch: 0
      },
      {
        id: 'hs_info_closet',
        type: 'info_popup',
        yaw: 0,
        pitch: 0,
        tooltip: 'Dimensiones del Clóset',
        title: 'Clóset Empotrado de Gran Capacidad',
        description: 'Mueble organizador con repisas regulables, barra para colgar prendas largas y puertas correderas de suave deslizamiento.',
        driveUrl: 'https://drive.google.com',
        driveLabel: 'Plano de Cotas Interiores'
      }
    ]
  },
  {
    id: 'pano_living_terraza',
    title: 'Living Comedor & Terraza',
    subtitle: 'Área Social con Luz Natural',
    imageUrl: '/panoramas/depto_living_terraza.jpg',
    defaultYaw: -30,
    defaultPitch: -12,
    hotspots: [
      {
        id: 'hs_to_living_acceso',
        type: 'scene_link',
        yaw: 160,
        pitch: -8,
        tooltip: 'Volver a Puerta de Entrada',
        targetSceneId: 'pano_living_acceso',
        targetYaw: 0,
        targetPitch: -10
      },
      {
        id: 'hs_info_terraza',
        type: 'info_popup',
        yaw: -5,
        pitch: -2,
        tooltip: 'Vista & Orientación Solar',
        title: 'Ventanal Termopanel & Salida a Balcón',
        description: 'Orientación privilegiada con luz diurna abundante, aislamiento térmico acústico y baranda perimetral de seguridad.',
        youtubeVideoId: 'dQw4w9WgXcQ',
        driveUrl: 'https://drive.google.com',
        driveLabel: 'Brochure Comercial del Inmueble'
      }
    ]
  }
];
