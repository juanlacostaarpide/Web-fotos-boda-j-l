import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RequireAdmin({ children }) {
  const { isAdmin, authReady } = useAuth()

  if (!authReady) return <p className="loading-message">Cargando…</p>
  if (!isAdmin) return <Navigate to="/admin/login" replace />

  return children
}
