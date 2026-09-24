import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const AdminContext = createContext(null)

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [ready, setReady] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/me', { credentials: 'include' })
      const data = await res.json()
      setIsAdmin(Boolean(data.isAdmin))
    } catch (err) {
      console.error('No se pudo comprobar la sesión de admin:', err)
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = async (email, password) => {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || 'No se pudo iniciar sesión')
    }
    await refresh()
  }

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' })
    await refresh()
  }

  return (
    <AdminContext.Provider value={{ isAdmin, ready, login, logout }}>{children}</AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin debe usarse dentro de <AdminProvider>')
  return ctx
}
