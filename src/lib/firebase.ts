import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration provided by user
export const firebaseConfig = {
  apiKey: "AIzaSyADN_dWNHXyNDkdN1RmNB9F5hV_sgqsFuM",
  authDomain: "rakib-18024.firebaseapp.com",
  databaseURL: "https://rakib-18024-default-rtdb.firebaseio.com",
  projectId: "rakib-18024",
  storageBucket: "rakib-18024.firebasestorage.app",
  messagingSenderId: "193964280836",
  appId: "1:193964280836:web:e429578d2490129c8f3951",
  measurementId: "G-LR8VZKEPQD"
};

// Initialize Firebase singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Services
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app);

// Analytics initialization (safe for SSR / browser check)
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics not supported in this environment
  });
}

