import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { photosAuth } from '../firebase/photosApp'
import { videosAuth } from '../firebase/videosApp'
import { ADMIN_UID_PHOTOS } from '../firebase/adminConfig'

const GUEST_NAME_KEY = 'boda-jl-guest-name'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [photosUser, setPhotosUser] = useState(null)
  const [videosUser, setVideosUser] = useState(null)
  const [photosReady, setPhotosReady] = useState(false)
  const [videosReady, setVideosReady] = useState(false)
  const [guestName, setGuestNameState] = useState(
    () => localStorage.getItem(GUEST_NAME_KEY) || ''
  )

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(photosAuth, async (user) => {
      if (!user) {
        await signInAnonymously(photosAuth).catch((err) =>
          console.error('Error al iniciar sesión anónima (fotos):', err)
        )
        return
      }
      setPhotosUser(user)
      setPhotosReady(true)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(videosAuth, async (user) => {
      if (!user) {
        await signInAnonymously(videosAuth).catch((err) =>
          console.error('Error al iniciar sesión anónima (vídeos):', err)
        )
        return
      }
      setVideosUser(user)
      setVideosReady(true)
    })
    return unsubscribe
  }, [])

  const setGuestName = (name) => {
    const trimmed = name.trim()
    localStorage.setItem(GUEST_NAME_KEY, trimmed)
    setGuestNameState(trimmed)
  }

  const adminSignIn = async (email, password) => {
    await Promise.all([
      signInWithEmailAndPassword(photosAuth, email, password),
      signInWithEmailAndPassword(videosAuth, email, password),
    ])
  }

  const adminSignOut = async () => {
    await Promise.all([signOut(photosAuth), signOut(videosAuth)])
  }

  const isAdmin = Boolean(
    photosUser && !photosUser.isAnonymous && photosUser.uid === ADMIN_UID_PHOTOS
  )

  const value = useMemo(
    () => ({
      photosUser,
      videosUser,
      photosUid: photosUser?.uid ?? null,
      videosUid: videosUser?.uid ?? null,
      authReady: photosReady && videosReady,
      guestName,
      setGuestName,
      isAdmin,
      adminSignIn,
      adminSignOut,
    }),
    [photosUser, videosUser, photosReady, videosReady, guestName, isAdmin]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
