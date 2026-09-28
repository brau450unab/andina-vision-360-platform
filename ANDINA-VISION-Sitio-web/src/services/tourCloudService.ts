import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { TourProject, PanoramaItem } from '../components/tours360/panoramasData';

const TOURS_COLLECTION = 'tours';
const PANORAMAS_COLLECTION = 'panoramas';

// ==========================================
// TOURS (PROJECTS) API
// ==========================================

export const createCloudTour = async (userId: string, tour: TourProject): Promise<void> => {
  const docRef = doc(db, 'users', userId, TOURS_COLLECTION, tour.id);
  await setDoc(docRef, {
    ...tour,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const updateCloudTour = async (userId: string, tour: TourProject): Promise<void> => {
  const docRef = doc(db, 'users', userId, TOURS_COLLECTION, tour.id);
  await setDoc(docRef, {
    ...tour,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

export const deleteCloudTour = async (userId: string, tourId: string): Promise<void> => {
  const docRef = doc(db, 'users', userId, TOURS_COLLECTION, tourId);
  await deleteDoc(docRef);
};

export const getCloudTours = async (userId: string): Promise<TourProject[]> => {
  const q = query(
    collection(db, 'users', userId, TOURS_COLLECTION),
    orderBy('updatedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as TourProject);
};

// ==========================================
// PANORAMAS (IMAGE LIBRARY) API
// ==========================================

export const uploadCloudPanoramaImage = async (
  userId: string, 
  file: File, 
  onProgress?: (progress: number) => void
): Promise<string> => {
  const storageRef = ref(storage, `users/${userId}/panoramas/${Date.now()}_${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};

export const createCloudPanorama = async (userId: string, pano: PanoramaItem): Promise<void> => {
  const docRef = doc(db, 'users', userId, PANORAMAS_COLLECTION, pano.id);
  await setDoc(docRef, {
    ...pano,
    createdAt: serverTimestamp()
  });
};

export const deleteCloudPanorama = async (userId: string, panoId: string, imageUrl?: string): Promise<void> => {
  // 1. Delete document
  const docRef = doc(db, 'users', userId, PANORAMAS_COLLECTION, panoId);
  await deleteDoc(docRef);

  // 2. Delete from storage if it's a firebase storage URL
  if (imageUrl && imageUrl.includes('firebasestorage')) {
    try {
      const storageRef = ref(storage, imageUrl);
      await deleteObject(storageRef);
    } catch (e) {
      console.warn("Could not delete image from storage: ", e);
    }
  }
};

export const getCloudPanoramas = async (userId: string): Promise<PanoramaItem[]> => {
  const q = query(
    collection(db, 'users', userId, PANORAMAS_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as PanoramaItem);
};
