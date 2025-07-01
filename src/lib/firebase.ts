import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCJK9rQOQBJEqvbD4bdIEqSb7IJItm-lzE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "timeline-ace.firebaseapp.com", // Updated
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "timeline-ace", // Updated
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "timeline-ace.appspot.com", // Updated
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "40659245477",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:40659245477:web:5e75e71c7597bc14def04c",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-899NFEECVH"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
