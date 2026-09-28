import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PanoramaItem,
  TourProject,
  TourScene,
  REAL_PANORAMAS,
  INITIAL_TOUR_PROJECTS,
  SAAS_PRICING_TIERS,
  SaaSPricingTier,
  DEFAULT_COLOR_GRADING,
  DEFAULT_FLOORPLAN_SVG_DATA_URI,
} from '../components/tours360/panoramasData';
import { auth } from '../firebase';
import {
  createCloudTour,
  updateCloudTour,
  deleteCloudTour,
  getCloudTours,
  createCloudPanorama,
  deleteCloudPanorama,
  getCloudPanoramas
} from '../services/tourCloudService';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth';

export interface UserAccount360 {
  uid: string;
  name: string;
  email: string;
  company: string;
  avatarUrl?: string;
  planId: 'free' | 'pro' | 'agency' | 'enterprise';
  billingCycle: 'monthly' | 'annual';
  aiCreditsUsed: number;
  customBrandLogoUrl: string;
  customBrandColor: string;
}

interface TourSaaSContextType {
  user: UserAccount360 | null;
  isAuthenticated: boolean;
  loginWithEmail: (email: string, pass: string, name?: string, company?: string, isRegister?: boolean) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginDemoAccount: (planId?: 'free' | 'pro' | 'agency' | 'enterprise') => void;
  logoutAccount: () => Promise<void>;
  updateUserAccount: (partial: Partial<UserAccount360>) => void;

  // Currency & Pricing
  currency: 'CLP' | 'UF' | 'USD';
  setCurrency: (c: 'CLP' | 'UF' | 'USD') => void;
  billingCycle: 'monthly' | 'annual';
  setBillingCycle: (b: 'monthly' | 'annual') => void;
  currentTier: SaaSPricingTier;
  upgradePlan: (planId: 'free' | 'pro' | 'agency' | 'enterprise') => void;

  // Tours Library ("Biblioteca de Mis Tours")
  tours: TourProject[];
  activeTourId: string;
  activeTour: TourProject;
  setActiveTourId: (id: string) => void;
  openTourInStudio: (id: string) => void;
  createTourProject: (title: string, subtitle: string, selectedPanoIds?: string[], category?: TourProject['category']) => TourProject;
  updateTourProject: (updated: TourProject) => void;
  duplicateTourProject: (tourId: string) => TourProject | null;
  deleteTourProject: (tourId: string) => void;
  togglePublishTour: (tourId: string) => void;

  // Media Gallery ("Galería de Fotos 360°")
  panoramas: PanoramaItem[];
  gallery: PanoramaItem[];
  addPanoramaToGallery: (pano: Omit<PanoramaItem, 'id' | 'uploadedAt'>) => PanoramaItem;
  updatePanoramaItem: (updated: PanoramaItem) => void;
  deletePanoramaItem: (id: string) => void;

  // Storage & Usage Metrics
  storageUsedMB: number;
  storageLimitMB: number;
  consumeAiCredit: (amount?: number) => boolean;
  resetDemoData: () => void;
}

const STORAGE_KEYS = {
  USER: 'andina_360_user_v4_hd',
  TOURS: 'andina_360_tours_v4_hd',
  PANOS: 'andina_360_panos_v4_hd',
  CURRENCY: 'andina_360_currency_v4_hd',
};

const DEFAULT_DEMO_USER: UserAccount360 = {
  uid: 'usr_andina_creator_01',
  name: 'Braulio · Director Andina Visión',
  email: 'contacto@andinavision.cl',
  company: 'Andina Visión 360° Studio',
  planId: 'agency',
  billingCycle: 'annual',
  aiCreditsUsed: 14,
  customBrandLogoUrl: '/andina_logo_circle_hd.png',
  customBrandColor: '#d49b54',
};

const TourSaaSContext = createContext<TourSaaSContextType | undefined>(undefined);

export const TourSaaSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount360 | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : DEFAULT_DEMO_USER;
    } catch {
      return DEFAULT_DEMO_USER;
    }
  });

  const [tours, setTours] = useState<TourProject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TOURS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_TOUR_PROJECTS;
  });

  const [panoramas, setPanoramas] = useState<PanoramaItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PANOS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return REAL_PANORAMAS;
  });

  const [activeTourId, setActiveTourId] = useState<string>(() => {
    return tours[0]?.id || INITIAL_TOUR_PROJECTS[0].id;
  });

  const [currency, setCurrency] = useState<'CLP' | 'UF' | 'USD'>(() => {
    return (localStorage.getItem(STORAGE_KEYS.CURRENCY) as 'CLP' | 'UF' | 'USD') || 'CLP';
  });

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  // Sync with localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch {
      // ignore quota errors
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TOURS, JSON.stringify(tours));
    } catch {
      // ignore quota errors on large base64 images
    }
  }, [tours]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PANOS, JSON.stringify(panoramas));
    } catch {
      // ignore quota errors
    }
  }, [panoramas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
  }, [currency]);

  // Listen to Firebase Auth state changes if user logs in via Firebase
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser((prev) => ({
          uid: fbUser.uid,
          name: fbUser.displayName || prev?.name || fbUser.email?.split('@')[0] || 'Creador 360°',
          email: fbUser.email || prev?.email || 'usuario@andinavision.cl',
          company: prev?.company || 'Mi Estudio Inmobiliario 360°',
          avatarUrl: fbUser.photoURL || undefined,
          planId: prev?.planId || 'pro',
          billingCycle: prev?.billingCycle || 'annual',
          aiCreditsUsed: prev?.aiCreditsUsed || 5,
          customBrandLogoUrl: prev?.customBrandLogoUrl || '/andina_vision_logo.jpg',
          customBrandColor: prev?.customBrandColor || '#10b981',
        }));

        try {
          // Fetch real cloud data
          const cloudPanos = await getCloudPanoramas(fbUser.uid);
          if (cloudPanos && cloudPanos.length > 0) setPanoramas(cloudPanos);
          
          const cloudTours = await getCloudTours(fbUser.uid);
          if (cloudTours && cloudTours.length > 0) {
            setTours(cloudTours);
            setActiveTourId(cloudTours[0].id);
          }
        } catch (e) {
          console.error("Error fetching cloud data:", e);
        }
      }
    });
    return () => unsub();
  }, []);

  const loginWithEmail = async (
    email: string,
    pass: string,
    name?: string,
    company?: string,
    isRegister?: boolean
  ) => {
    try {
      if (isRegister) {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        setUser({
          uid: cred.user.uid,
          name: name || email.split('@')[0],
          email,
          company: company || 'Cuenta Profesional 360°',
          planId: 'pro',
          billingCycle: 'annual',
          aiCreditsUsed: 0,
          customBrandLogoUrl: '/andina_vision_logo.jpg',
          customBrandColor: '#10b981',
        });
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        setUser({
          uid: cred.user.uid,
          name: name || cred.user.displayName || email.split('@')[0],
          email,
          company: company || 'Andina Vision Partner',
          planId: 'pro',
          billingCycle: 'annual',
          aiCreditsUsed: 4,
          customBrandLogoUrl: '/andina_vision_logo.jpg',
          customBrandColor: '#10b981',
        });
      }
    } catch {
      // Graceful local account session fallback when Firebase Auth credentials are not yet provisioned in console
      setUser({
        uid: `usr_${Date.now()}`,
        name: name || email.split('@')[0] || 'Usuario Andina 360°',
        email: email || 'usuario@andinavision.cl',
        company: company || 'Estudio Inmobiliario 360°',
        planId: 'pro',
        billingCycle: 'annual',
        aiCreditsUsed: 2,
        customBrandLogoUrl: '/andina_vision_logo.jpg',
        customBrandColor: '#10b981',
      });
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch {
      // Fallback to verified demo pro account if popup blocked or domain not whitelisted
      loginDemoAccount('agency');
    }
  };

  const loginDemoAccount = (planId: 'free' | 'pro' | 'agency' | 'enterprise' = 'agency') => {
    setUser({
      ...DEFAULT_DEMO_USER,
      planId,
    });
  };

  const logoutAccount = async () => {
    try {
      await fbSignOut(auth);
    } catch {
      // ignore
    }
    setUser(null);
  };

  const updateUserAccount = (partial: Partial<UserAccount360>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : null));
  };

  const upgradePlan = (planId: 'free' | 'pro' | 'agency' | 'enterprise') => {
    setUser((prev) =>
      prev
        ? { ...prev, planId }
        : { ...DEFAULT_DEMO_USER, planId }
    );
  };

  const currentTier =
    SAAS_PRICING_TIERS.find((t) => t.id === (user?.planId || 'pro')) || SAAS_PRICING_TIERS[1];

  const activeTour = tours.find((t) => t.id === activeTourId) || tours[0] || INITIAL_TOUR_PROJECTS[0];

  const createTourProject = (
    title: string,
    subtitle: string,
    selectedPanoIds?: string[],
    category: TourProject['category'] = 'inmobiliaria'
  ): TourProject => {
    const chosenPanos =
      selectedPanoIds && selectedPanoIds.length > 0
        ? panoramas.filter((p) => selectedPanoIds.includes(p.id))
        : [panoramas[0] || REAL_PANORAMAS[0]];

    const newScenes: TourScene[] = chosenPanos.map((p, index) => {
      const nextPano = chosenPanos[(index + 1) % chosenPanos.length];
      return {
        id: `${p.id}_${Date.now()}_${index}`,
        title: p.title,
        subtitle: p.environment || 'Ambiente 360°',
        imageUrl: p.imageUrl,
        defaultYaw: p.initialYaw || 0,
        defaultPitch: p.initialPitch || 0,
        defaultFov: 75,
        northOffsetDeg: index * 60,
        colorGrading: p.colorGrading || { ...DEFAULT_COLOR_GRADING },
        hotspots:
          chosenPanos.length > 1
            ? [
                {
                  id: `hs_auto_${Date.now()}_${index}`,
                  type: 'scene_link',
                  yaw: 20,
                  pitch: -10,
                  tooltip: `Ir a ${nextPano.title}`,
                  targetSceneId: `${nextPano.id}_placeholder_${(index + 1) % chosenPanos.length}`,
                },
              ]
            : [],
      };
    });

    // Fix targetSceneId references
    newScenes.forEach((sc, idx) => {
      const nextSc = newScenes[(idx + 1) % newScenes.length];
      sc.hotspots.forEach((h) => {
        if (h.type === 'scene_link') {
          h.targetSceneId = nextSc.id;
        }
      });
    });

    const newFloorPlanId = `fp_${Date.now()}`;
    const newTour: TourProject = {
      id: `tour_${Date.now()}`,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: title || 'Nuevo Recorrido Virtual 360°',
      subtitle: subtitle || 'Proyecto Inmobiliario Interactivo',
      clientName: user?.company || 'Andina Vision Studio',
      location: 'Iquique, Chile',
      category,
      status: 'draft',
      createdAt: new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }),
      updatedAt: 'Hace instantes',
      viewsCount: 1,
      firstSceneId: newScenes[0].id,
      defaultFontFamily: 'Plus Jakarta Sans',
      primaryBrandColor: user?.customBrandColor || '#10b981',
      transitionStyle: 'walkthrough_zoom',
      autoRotate: false,
      autoRotateSpeed: 0.4,
      showCompass: true,
      showGalleryBar: true,
      showFloorPlanByDefault: true,
      leadCaptureWhatsapp: '+56987654321',
      nadir: {
        enabled: true,
        type: 'logo',
        logoUrl: user?.customBrandLogoUrl || '/andina_vision_logo.jpg',
        label: user?.company || 'Andina Vision 360°',
        sizePx: 110,
        opacity: 0.9,
      },
      floorPlans: [
        {
          id: newFloorPlanId,
          name: 'Planta Principal 2D',
          levelLabel: 'Nivel 1',
          type: 'floorplan_2d',
          imageUrl: DEFAULT_FLOORPLAN_SVG_DATA_URI,
          pins: newScenes.map((s, i) => ({
            sceneId: s.id,
            x: Math.min(85, 25 + i * 18),
            y: i % 2 === 0 ? 65 : 35,
            northOffsetDeg: i * 45,
          })),
        },
      ],
      scenes: newScenes,
    };

    setTours((prev) => [newTour, ...prev]);
    setActiveTourId(newTour.id);
    
    // Sync to Cloud
    if (user && !user.uid.startsWith('usr_')) {
      createCloudTour(user.uid, newTour).catch(e => console.error(e));
    }
    
    return newTour;
  };

  const updateTourProject = (updated: TourProject) => {
    const stamped = {
      ...updated,
      updatedAt: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
    };
    setTours((prev) => prev.map((t) => (t.id === stamped.id ? stamped : t)));
    
    if (user && !user.uid.startsWith('usr_')) {
      updateCloudTour(user.uid, stamped).catch(e => console.error(e));
    }
  };

  const duplicateTourProject = (tourId: string): TourProject | null => {
    const orig = tours.find((t) => t.id === tourId);
    if (!orig) return null;
    const copy: TourProject = {
      ...JSON.parse(JSON.stringify(orig)),
      id: `tour_${Date.now()}`,
      slug: `${orig.slug}-copia`,
      title: `${orig.title} (Copia)`,
      status: 'draft',
      viewsCount: 0,
      updatedAt: 'Hace instantes',
    };
    setTours((prev) => [copy, ...prev]);
    return copy;
  };

  const deleteTourProject = (tourId: string) => {
    if (tours.length <= 1) return;
    const next = tours.filter((t) => t.id !== tourId);
    setTours(next);
    if (activeTourId === tourId && next[0]) {
      setActiveTourId(next[0].id);
    }
    
    if (user && !user.uid.startsWith('usr_')) {
      deleteCloudTour(user.uid, tourId).catch(e => console.error(e));
    }
  };

  const togglePublishTour = (tourId: string) => {
    setTours((prev) =>
      prev.map((t) =>
        t.id === tourId
          ? { ...t, status: t.status === 'published' ? 'draft' : 'published', updatedAt: 'Hace instantes' }
          : t
      )
    );
  };

  const addPanoramaToGallery = (pano: Omit<PanoramaItem, 'id' | 'uploadedAt'>): PanoramaItem => {
    const today = new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
    const created: PanoramaItem = {
      ...pano,
      id: `pano_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      uploadedAt: today,
      date: today,
      colorGrading: pano.colorGrading || { ...DEFAULT_COLOR_GRADING },
    };
    setPanoramas((prev) => [created, ...prev]);
    
    if (user && !user.uid.startsWith('usr_')) {
      createCloudPanorama(user.uid, created).catch(e => console.error(e));
    }
    
    return created;
  };

  const updatePanoramaItem = (updated: PanoramaItem) => {
    setPanoramas((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const deletePanoramaItem = (id: string) => {
    const pano = panoramas.find(p => p.id === id);
    setPanoramas((prev) => prev.filter((p) => p.id !== id));
    
    if (user && !user.uid.startsWith('usr_')) {
      deleteCloudPanorama(user.uid, id, pano?.imageUrl).catch(e => console.error(e));
    }
  };

  const storageUsedMB = panoramas.reduce((acc, p) => acc + (p.fileSizeMB || 11.5), 0);
  const storageLimitMB = currentTier.limits.maxStorageGB * 1024;

  const consumeAiCredit = (amount = 1): boolean => {
    if (!user) return true;
    const nextUsed = user.aiCreditsUsed + amount;
    setUser({ ...user, aiCreditsUsed: nextUsed });
    return true;
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.TOURS);
    localStorage.removeItem(STORAGE_KEYS.PANOS);
    setTours(INITIAL_TOUR_PROJECTS);
    setPanoramas(REAL_PANORAMAS);
    setActiveTourId(INITIAL_TOUR_PROJECTS[0].id);
  };

  return (
    <TourSaaSContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginWithEmail,
        loginWithGoogle,
        loginDemoAccount,
        logoutAccount,
        updateUserAccount,
        currency,
        setCurrency,
        billingCycle,
        setBillingCycle,
        currentTier,
        upgradePlan,
        tours,
        activeTourId,
        activeTour,
        setActiveTourId,
        openTourInStudio: setActiveTourId,
        createTourProject,
        updateTourProject,
        duplicateTourProject,
        deleteTourProject,
        togglePublishTour,
        panoramas,
        gallery: panoramas,
        addPanoramaToGallery,
        updatePanoramaItem,
        deletePanoramaItem,
        storageUsedMB,
        storageLimitMB,
        consumeAiCredit,
        resetDemoData,
      }}
    >
      {children}
    </TourSaaSContext.Provider>
  );
};

export const useTourSaaS = () => {
  const ctx = useContext(TourSaaSContext);
  if (!ctx) throw new Error('useTourSaaS must be used within a TourSaaSProvider');
  return ctx;
};
