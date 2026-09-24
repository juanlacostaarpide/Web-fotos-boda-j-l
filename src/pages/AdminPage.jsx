import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMediaList } from '../hooks/useMediaList'
import MediaGrid from '../components/MediaGrid'
import { downloadAllAsZip, triggerBlobDownload } from '../utils/downloadAll'
import { WEDDING_CONFIG } from '../weddingConfig'

export default function AdminPage() {
  const { adminSignOut } = useAuth()
  const navigate = useNavigate()
  const { items, loading } = useMediaList()

  const [typeFilter, setTypeFilter] = useState('all') // all | foto | video
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [downloadState, setDownloadState] = useState({ status: 'idle', done: 0, total: 0 })

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false

      const createdAt = item.createdAt?.toDate?.()
      if (dateFrom && createdAt && createdAt < new Date(`${dateFrom}T00:00:00`)) return false
      if (dateTo && createdAt && createdAt > new Date(`${dateTo}T23:59:59`)) return false

      return true
    })
  }, [items, typeFilter, dateFrom, dateTo])

  const handleLogout = async () => {
    await adminSignOut()
    navigate('/', { replace: true })
  }

  const handleDownloadAll = async () => {
    setDownloadState({ status: 'zipping', done: 0, total: filteredItems.length })
    try {
      const blob = await downloadAllAsZip(filteredItems, {
        onProgress: (done, total) => setDownloadState({ status: 'zipping', done, total }),
      })
      const slug = WEDDING_CONFIG.coupleNames.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()
      triggerBlobDownload(blob, `boda-${slug}-fotos-videos.zip`)
      setDownloadState({ status: 'done', done: filteredItems.length, total: filteredItems.length })
    } catch (err) {
      console.error(err)
      setDownloadState({ status: 'error', done: 0, total: 0 })
    }
  }

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

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleDownloadAll}
          disabled={downloadState.status === 'zipping' || filteredItems.length === 0}
        >
          {downloadState.status === 'zipping'
            ? `Preparando ZIP… (${downloadState.done}/${downloadState.total})`
            : `Descargar todo (${filteredItems.length})`}
        </button>
        {downloadState.status === 'error' && (
          <p className="form-error">Ha ocurrido un error generando el ZIP.</p>
        )}
      </div>

      {loading && <p className="loading-message">Cargando galería…</p>}
      {!loading && <MediaGrid items={filteredItems} />}
    </main>
  )
}
