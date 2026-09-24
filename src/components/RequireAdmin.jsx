import { Navigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'

export default function RequireAdmin({ children }) {
  const { isAdmin, ready } = useAdmin()

  if (!ready) return <p className="loading-message">Cargando…</p>
  if (!isAdmin) return <Navigate to="/admin/login" replace />

  return children
}
