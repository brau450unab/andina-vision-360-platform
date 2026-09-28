import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  projectId: "andina-vision-sistemas-saas",
  appId: "1:106335345720:web:andina-vision-saas-web",
  apiKey: "AIzaSyD0eHGj7HpYAJeOfPub2Bq04eSO4kL6Pmg",
  authDomain: "andina-vision-sistemas-saas.firebaseapp.com",
  storageBucket: "andina-vision-sistemas-saas.firebasestorage.app",
  messagingSenderId: "106335345720",
  measurementId: ""
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
