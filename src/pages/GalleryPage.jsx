import { Link } from 'react-router-dom'
import { useMediaList } from '../hooks/useMediaList'
import MediaGrid from '../components/MediaGrid'

export default function GalleryPage() {
  const { items, loading, error } = useMediaList()

  return (
    <main className="gallery-screen">
      <header className="gallery-header">
        <Link to="/" className="back-link">
          ← Volver
        </Link>
        <h1>Galería</h1>
      </header>

      {loading && <p className="loading-message">Cargando galería…</p>}
      {error && <p className="form-error">No se pudo cargar la galería. Inténtalo más tarde.</p>}
      {!loading && !error && <MediaGrid items={items} />}
    </main>
  )
}
