import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDKI26dNBPY5aPPtX1ltqGzC-6MqAp05RA",
  authDomain: "andina-vision-sistemas-saas.firebaseapp.com",
  projectId: "andina-vision-sistemas-saas",
  storageBucket: "andina-vision-sistemas-saas.firebasestorage.app",
  messagingSenderId: "106335345720",
  appId: "1:106335345720:web:459b03ddeddebebcd85acd",
  measurementId: "G-NW2Z8K5ZR1"
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
// export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
