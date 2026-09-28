import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from '../firebase';

export interface TourHotspot {
  id: string;
  pitch: number;
  yaw: number;
  type: 'scene' | 'info';
  text: string;
  targetSceneId?: string;
  description?: string;
}

export interface TourScene {
  id: string;
  title: string;
  subtitle?: string;
  panoramaUrl: string;
  thumbnailUrl?: string;
  initialYaw?: number;
  initialPitch?: number;
  floorplanX?: number;
  floorplanY?: number;
  hotspots: TourHotspot[];
}

export interface VirtualTour360 {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  status: 'published' | 'draft';
  ownerUid?: string;
  scenes: TourScene[];
}

export interface PanoramaAsset {
  id: string;
  name: string;
  url: string;
  dimensions: string;
  uploadedAt: string;
  ownerUid?: string;
}

export interface SaaSUser {
  uid?: string;
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
  photoURL?: string;
}

interface TourSaaSContextType {
  user: SaaSUser | null;
  isAuthReady: boolean;
  login: (email: string, password?: string, name?: string) => Promise<void>;
  register: (name: string, email: string, password?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  upgradePlan: (plan: 'free' | 'pro' | 'enterprise') => Promise<void>;
  tours: VirtualTour360[];
  library: PanoramaAsset[];
  activeTourId: string;
  setActiveTourId: (id: string) => void;
  activeTour: VirtualTour360 | undefined;
  activeSceneId: string;
  setActiveSceneId: (id: string) => void;
  createTour: (title: string, description: string) => VirtualTour360;
  deleteTour: (id: string) => void;
  updateTourMeta: (id: string, title: string, description: string, status?: 'published' | 'draft') => void;
  addScene: (tourId: string, title: string, panoramaUrl: string) => TourScene;
  removeScene: (tourId: string, sceneId: string) => void;
  addHotspot: (tourId: string, sceneId: string, hotspot: Omit<TourHotspot, 'id'>) => void;
  removeHotspot: (tourId: string, sceneId: string, hotspotId: string) => void;
  addImageToLibrary: (name: string, url: string, dimensions?: string) => PanoramaAsset;
  removeImageFromLibrary: (id: string) => void;
}

const DEFAULT_LIBRARY: PanoramaAsset[] = [
  {
    id: 'lib-living-terraza',
    name: 'Salón Principal & Terraza Vista Mar (360°)',
    url: '/panoramas/depto_living_terraza.jpg',
    dimensions: 'Equirrectangular 2:1 (8K HDR)',
    uploadedAt: '2026-09-25'
  },
  {
    id: 'lib-living-acceso',
    name: 'Living & Acceso Departamento Piloto (360°)',
    url: '/panoramas/depto_living_acceso.jpg',
    dimensions: 'Equirrectangular 2:1 (8K HDR)',
    uploadedAt: '2026-09-25'
  },
  {
    id: 'lib-hall-cocina',
    name: 'Hall & Cocina Equipada Cuarzo (360°)',
    url: '/panoramas/depto_hall_cocina.jpg',
    dimensions: 'Equirrectangular 2:1 (8K HDR)',
    uploadedAt: '2026-09-25'
  },
  {
    id: 'lib-dormitorio',
    name: 'Dormitorio Principal en Suite (360°)',
    url: '/panoramas/depto_dormitorio.jpg',
    dimensions: 'Equirrectangular 2:1 (8K HDR)',
    uploadedAt: '2026-09-25'
  },
  {
    id: 'lib-pasillo-bano',
    name: 'Distribuidor & Baño Principal (360°)',
    url: '/panoramas/depto_pasillo_bano.jpg',
    dimensions: 'Equirrectangular 2:1 (8K HDR)',
    uploadedAt: '2026-09-25'
  }
];

const DEFAULT_TOURS: VirtualTour360[] = [
  {
    id: 'tour-demo-ejecutivo',
    title: 'Piloto Inmobiliario Vista Pacífico — 14.800 UF',
    description: 'Recorrido virtual comercial completo con 5 recintos conectados, fichas técnicas en UF y radar de planta 2D.',
    createdAt: '2026-09-25',
    status: 'published',
    scenes: [
      {
        id: 'sc-living',
        title: 'Salón & Terraza',
        subtitle: 'Vista panorámica poniente y ventanales termopanel',
        panoramaUrl: '/panoramas/depto_living_terraza.jpg',
        initialYaw: 0,
        initialPitch: 0,
        floorplanX: 25,
        floorplanY: 30,
        hotspots: [
          {
            id: 'hs-1',
            pitch: -0.08,
            yaw: 1.15,
            type: 'scene',
            text: 'Ir a Cocina & Hall',
            targetSceneId: 'sc-cocina'
          },
          {
            id: 'hs-2',
            pitch: -0.05,
            yaw: -1.35,
            type: 'scene',
            text: 'Ir a Suite Principal',
            targetSceneId: 'sc-bedroom'
          },
          {
            id: 'hs-3',
            pitch: -0.15,
            yaw: 0.25,
            type: 'info',
            text: 'Valor Comercial: 14.800 UF',
            description: 'Superficie total 142 m² • Ventanales termopanel acústicos con folio PVC y piso fotolaminado europeo.'
          }
        ]
      },
      {
        id: 'sc-cocina',
        title: 'Hall & Cocina',
        subtitle: 'Cocina integrada con cubierta de cuarzo y equipamiento europeo',
        panoramaUrl: '/panoramas/depto_hall_cocina.jpg',
        initialYaw: 0,
        initialPitch: 0,
        floorplanX: 50,
        floorplanY: 35,
        hotspots: [
          {
            id: 'hs-4',
            pitch: -0.06,
            yaw: -1.1,
            type: 'scene',
            text: 'Volver a Salón & Terraza',
            targetSceneId: 'sc-living'
          },
          {
            id: 'hs-5',
            pitch: -0.08,
            yaw: 1.2,
            type: 'scene',
            text: 'Ir a Distribuidor & Baño',
            targetSceneId: 'sc-bano'
          },
          {
            id: 'hs-6',
            pitch: -0.1,
            yaw: 0.1,
            type: 'info',
            text: 'Equipamiento Full Electric',
            description: 'Encimera vitrocerámica de 4 platos, horno empotrado y cubiertas de cuarzo blanco antibacteriano.'
          }
        ]
      },
      {
        id: 'sc-bedroom',
        title: 'Suite Principal',
        subtitle: 'Dormitorio en suite con walk-in closet y climatización',
        panoramaUrl: '/panoramas/depto_dormitorio.jpg',
        initialYaw: 0,
        initialPitch: 0,
        floorplanX: 75,
        floorplanY: 30,
        hotspots: [
          {
            id: 'hs-7',
            pitch: -0.05,
            yaw: 1.45,
            type: 'scene',
            text: 'Volver a Salón Principal',
            targetSceneId: 'sc-living'
          },
          {
            id: 'hs-8',
            pitch: -0.12,
            yaw: -0.45,
            type: 'scene',
            text: 'Ir a Baño & Pasillo',
            targetSceneId: 'sc-bano'
          }
        ]
      },
      {
        id: 'sc-bano',
        title: 'Pasillo & Baño',
        subtitle: 'Porcelanato rectificado y grifería monomando de alta eficiencia',
        panoramaUrl: '/panoramas/depto_pasillo_bano.jpg',
        initialYaw: 0,
        initialPitch: 0,
        floorplanX: 65,
        floorplanY: 72,
        hotspots: [
          {
            id: 'hs-9',
            pitch: -0.05,
            yaw: -0.8,
            type: 'scene',
            text: 'Ir a Acceso Principal',
            targetSceneId: 'sc-acceso'
          },
          {
            id: 'hs-10',
            pitch: -0.05,
            yaw: 1.1,
            type: 'scene',
            text: 'Ir a Suite Principal',
            targetSceneId: 'sc-bedroom'
          }
        ]
      },
      {
        id: 'sc-acceso',
        title: 'Acceso Principal',
        subtitle: 'Vista general desde el acceso con cerradura digital inteligente',
        panoramaUrl: '/panoramas/depto_living_acceso.jpg',
        initialYaw: 0,
        initialPitch: 0,
        floorplanX: 30,
        floorplanY: 72,
        hotspots: [
          {
            id: 'hs-11',
            pitch: -0.05,
            yaw: 0.1,
            type: 'scene',
            text: 'Avanzar a Salón & Terraza',
            targetSceneId: 'sc-living'
          }
        ]
      }
    ]
  }
];

const STORAGE_KEY_TOURS = 'andina_saas_360_tours_v3';
const STORAGE_KEY_LIB = 'andina_saas_360_lib_v3';
const STORAGE_KEY_USER = 'andina_saas_360_user_v3';

const TourSaaSContext = createContext<TourSaaSContextType | undefined>(undefined);

export const TourSaaSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SaaSUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [tours, setTours] = useState<VirtualTour360[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TOURS);
      return saved ? JSON.parse(saved) : DEFAULT_TOURS;
    } catch {
      return DEFAULT_TOURS;
    }
  });

  const [library, setLibrary] = useState<PanoramaAsset[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LIB);
      return saved ? JSON.parse(saved) : DEFAULT_LIBRARY;
    } catch {
      return DEFAULT_LIBRARY;
    }
  });

  const [activeTourId, setActiveTourId] = useState<string>(() => tours[0]?.id || 'tour-demo-ejecutivo');
  const activeTour = tours.find((t) => t.id === activeTourId) || tours[0];
  const [activeSceneId, setActiveSceneId] = useState<string>(() => activeTour?.scenes[0]?.id || 'sc-living');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const mappedUser: SaaSUser = {
          uid: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Ejecutivo Comercial',
          email: fbUser.email || '',
          plan: 'pro',
          photoURL: fbUser.photoURL || undefined
        };
        setUser(mappedUser);
        try {
          await setDoc(
            doc(db, 'users', fbUser.uid),
            {
              uid: fbUser.uid,
              name: mappedUser.name,
              email: mappedUser.email,
              plan: mappedUser.plan,
              updatedAt: new Date().toISOString()
            },
            { merge: true }
          );
        } catch {}
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;
    const qTours = query(collection(db, 'tours360'), orderBy('createdAt', 'desc'));
    const unsubTours = onSnapshot(
      qTours,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteTours: VirtualTour360[] = [];
          snapshot.forEach((docSnap) => {
            remoteTours.push(docSnap.data() as VirtualTour360);
          });
          setTours(remoteTours);
        }
      },
      () => {}
    );

    const qLib = query(collection(db, 'library360'), orderBy('uploadedAt', 'desc'));
    const unsubLib = onSnapshot(
      qLib,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteAssets: PanoramaAsset[] = [];
          snapshot.forEach((docSnap) => {
            remoteAssets.push(docSnap.data() as PanoramaAsset);
          });
          const merged = [
            ...remoteAssets,
            ...DEFAULT_LIBRARY.filter((d) => !remoteAssets.some((r) => r.id === d.id))
          ];
          setLibrary(merged);
        }
      },
      () => {}
    );

    return () => {
      unsubTours();
      unsubLib();
    };
  }, [isAuthReady]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TOURS, JSON.stringify(tours));
    } catch {}
  }, [tours]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LIB, JSON.stringify(library));
    } catch {}
  }, [library]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    } catch {}
  }, [user]);

  useEffect(() => {
    if (activeTour && !activeTour.scenes.some((s) => s.id === activeSceneId)) {
      setActiveSceneId(activeTour.scenes[0]?.id || '');
    }
  }, [activeTourId, activeTour, activeSceneId]);

  const syncTourToFirestore = async (tour: VirtualTour360) => {
    try {
      await setDoc(doc(db, 'tours360', tour.id), tour);
    } catch {}
  };

  const login = async (email: string, password?: string, name?: string) => {
    if (password) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        return;
      } catch {}
    }
    setUser({
      name: name || email.split('@')[0] || 'Ejecutivo Inmobiliario',
      email,
      plan: 'pro'
    });
  };

  const register = async (name: string, email: string, password?: string) => {
    if (password) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        return;
      } catch {}
    }
    setUser({
      name,
      email,
      plan: 'pro'
    });
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch {
      setUser({
        name: 'Ejecutivo Corporativo Google',
        email: 'ejecutivo@andinavision360.cl',
        plan: 'pro'
      });
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {}
    setUser(null);
  };

  const upgradePlan = async (plan: 'free' | 'pro' | 'enterprise') => {
    if (user) {
      const updated = { ...user, plan };
      setUser(updated);
      if (user.uid) {
        try {
          await setDoc(doc(db, 'users', user.uid), { plan }, { merge: true });
        } catch {}
      }
    } else {
      setUser({
        name: 'Cuenta Comercial Andina 360°',
        email: 'comercial@empresa.cl',
        plan
      });
    }
  };

  const createTour = (title: string, description: string): VirtualTour360 => {
    const newTour: VirtualTour360 = {
      id: `tour-${Date.now()}`,
      title,
      description,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'published',
      ownerUid: user?.uid || 'anonymous',
      scenes: [
        {
          id: `sc-${Date.now()}`,
          title: 'Salón Principal 360°',
          subtitle: 'Haz clic en la esfera para agregar puntos interactivos',
          panoramaUrl: library[0]?.url || '/panoramas/depto_living_terraza.jpg',
          initialYaw: 0,
          initialPitch: 0,
          floorplanX: 45,
          floorplanY: 50,
          hotspots: []
        }
      ]
    };
    setTours((prev) => [newTour, ...prev]);
    setActiveTourId(newTour.id);
    setActiveSceneId(newTour.scenes[0].id);
    syncTourToFirestore(newTour);
    return newTour;
  };

  const deleteTour = (id: string) => {
    setTours((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      return filtered.length > 0 ? filtered : DEFAULT_TOURS;
    });
    deleteDoc(doc(db, 'tours360', id)).catch(() => {});
  };

  const updateTourMeta = (
    id: string,
    title: string,
    description: string,
    status: 'published' | 'draft' = 'published'
  ) => {
    setTours((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, title, description, status };
          syncTourToFirestore(updated);
          return updated;
        }
        return t;
      })
    );
  };

  const addScene = (tourId: string, title: string, panoramaUrl: string): TourScene => {
    const newScene: TourScene = {
      id: `sc-${Date.now()}`,
      title,
      subtitle: 'Escena interactiva 360°',
      panoramaUrl,
      initialYaw: 0,
      initialPitch: 0,
      floorplanX: Math.floor(25 + Math.random() * 55),
      floorplanY: Math.floor(25 + Math.random() * 55),
      hotspots: []
    };
    setTours((prev) =>
      prev.map((t) => {
        if (t.id === tourId) {
          const updated = { ...t, scenes: [...t.scenes, newScene] };
          syncTourToFirestore(updated);
          return updated;
        }
        return t;
      })
    );
    setActiveSceneId(newScene.id);
    return newScene;
  };

  const removeScene = (tourId: string, sceneId: string) => {
    setTours((prev) =>
      prev.map((t) => {
        if (t.id !== tourId) return t;
        const nextScenes = t.scenes.filter((s) => s.id !== sceneId);
        const updated = { ...t, scenes: nextScenes.length > 0 ? nextScenes : t.scenes };
        syncTourToFirestore(updated);
        return updated;
      })
    );
  };

  const addHotspot = (tourId: string, sceneId: string, hotspot: Omit<TourHotspot, 'id'>) => {
    const newHotspot: TourHotspot = {
      ...hotspot,
      id: `hs-${Date.now()}`
    };
    setTours((prev) =>
      prev.map((t) => {
        if (t.id !== tourId) return t;
        const updated = {
          ...t,
          scenes: t.scenes.map((sc) =>
            sc.id === sceneId ? { ...sc, hotspots: [...sc.hotspots, newHotspot] } : sc
          )
        };
        syncTourToFirestore(updated);
        return updated;
      })
    );
  };

  const removeHotspot = (tourId: string, sceneId: string, hotspotId: string) => {
    setTours((prev) =>
      prev.map((t) => {
        if (t.id !== tourId) return t;
        const updated = {
          ...t,
          scenes: t.scenes.map((sc) =>
            sc.id === sceneId
              ? { ...sc, hotspots: sc.hotspots.filter((h) => h.id !== hotspotId) }
              : sc
          )
        };
        syncTourToFirestore(updated);
        return updated;
      })
    );
  };

  const addImageToLibrary = (
    name: string,
    url: string,
    dimensions = 'Equirrectangular 2:1 (8K)'
  ): PanoramaAsset => {
    const newAsset: PanoramaAsset = {
      id: `lib-${Date.now()}`,
      name,
      url,
      dimensions,
      uploadedAt: new Date().toISOString().split('T')[0],
      ownerUid: user?.uid || 'anonymous'
    };
    setLibrary((prev) => [newAsset, ...prev]);
    if (!url.startsWith('data:') || url.length < 750000) {
      setDoc(doc(db, 'library360', newAsset.id), newAsset).catch(() => {});
    }
    return newAsset;
  };

  const removeImageFromLibrary = (id: string) => {
    setLibrary((prev) => prev.filter((item) => item.id !== id));
    deleteDoc(doc(db, 'library360', id)).catch(() => {});
  };

  return (
    <TourSaaSContext.Provider
      value={{
        user,
        isAuthReady,
        login,
        register,
        loginWithGoogle,
        logout,
        upgradePlan,
        tours,
        library,
        activeTourId,
        setActiveTourId,
        activeTour,
        activeSceneId,
        setActiveSceneId,
        createTour,
        deleteTour,
        updateTourMeta,
        addScene,
        removeScene,
        addHotspot,
        removeHotspot,
        addImageToLibrary,
        removeImageFromLibrary
      }}
    >
      {children}
    </TourSaaSContext.Provider>
  );
};

export const useTourSaaS = () => {
  const ctx = useContext(TourSaaSContext);
  if (!ctx) throw new Error('useTourSaaS must be used inside TourSaaSProvider');
  return ctx;
};
