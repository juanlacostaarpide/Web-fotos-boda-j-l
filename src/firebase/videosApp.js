import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

// Proyecto Firebase nº2: VÍDEOS (solo Auth + Storage, sin Firestore propio)
const videosConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_VIDEOS_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_VIDEOS_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_VIDEOS_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_VIDEOS_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_VIDEOS_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_VIDEOS_APP_ID,
}

export const videosApp = initializeApp(videosConfig, 'videos')

export const videosAuth = getAuth(videosApp)
export const videosStorage = getStorage(videosApp)
