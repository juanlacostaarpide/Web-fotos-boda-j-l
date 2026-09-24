import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Proyecto Firebase nº1: FOTOS + Firestore (metadata centralizada de fotos y vídeos)
const photosConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_PHOTOS_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_PHOTOS_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PHOTOS_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_PHOTOS_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_PHOTOS_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_PHOTOS_APP_ID,
}

export const photosApp = initializeApp(photosConfig, 'photos')

export const photosAuth = getAuth(photosApp)
export const db = getFirestore(photosApp)
export const photosStorage = getStorage(photosApp)
