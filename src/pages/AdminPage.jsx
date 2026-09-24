import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'
import { useMediaList } from '../hooks/useMediaList'
import MediaGrid from '../components/MediaGrid'
import { deleteMedia } from '../utils/api'

export default function AdminPage() {
  const { logout } = useAdmin()
  const navigate = useNavigate()
  const { items, loading, reload } = useMediaList()

  const [typeFilter, setTypeFilter] = useState('all') // all | foto | video
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false
      if (dateFrom && item.createdAt < new Date(`${dateFrom}T00:00:00`).getTime()) return false
      if (dateTo && item.createdAt > new Date(`${dateTo}T23:59:59`).getTime()) return false
      return true
    })
  }, [items, typeFilter, dateFrom, dateTo])

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  const handleDelete = async (id) => {
    await deleteMedia(id)
    await reload()
  }

  const downloadAllUrl = useMemo(() => {
    const params = new URLSearchParams()
    if (typeFilter !== 'all') params.set('type', typeFilter)
    if (dateFrom) params.set('from', dateFrom)
    if (dateTo) params.set('to', dateTo)
    const qs = params.toString()
    return `/api/admin/download-all${qs ? `?${qs}` : ''}`
  }, [typeFilter, dateFrom, dateTo])

  return (
    <main className="gallery-screen">
      <header className="gallery-header">
        <Link to="/" className="back-link">
          ← Volver
        </Link>
        <h1>Panel de admin</h1>
        <button type="button" className="btn btn-secondary admin-logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </header>

      <div className="admin-controls">
        <div className="admin-filters">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">Fotos y vídeos</option>
            <option value="foto">Solo fotos</option>
            <option value="video">Solo vídeos</option>
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} aria-label="Desde" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} aria-label="Hasta" />
        </div>

        <a className="btn btn-primary" href={downloadAllUrl} download>
          Descargar todo ({filteredItems.length})
        </a>
      </div>

      {loading && <p className="loading-message">Cargando galería…</p>}
      {!loading && <MediaGrid items={filteredItems} isAdmin onDelete={handleDelete} />}
    </main>
  )
}
