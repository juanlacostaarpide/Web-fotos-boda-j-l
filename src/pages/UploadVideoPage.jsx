import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGuestName } from '../hooks/useGuestName'
import { uploadMedia } from '../utils/api'
import { loadVideoMetadata, validateVideoDuration, validateVideoFile } from '../utils/videoValidation'

let nextId = 0

export default function UploadVideoPage() {
  const { guestName } = useGuestName()
  const [items, setItems] = useState([]) // { id, file, previewUrl, status, error }
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const newItems = files.map((file) => {
      const id = nextId++
      const sizeError = validateVideoFile(file)
      if (sizeError) return { id, file, previewUrl: null, status: 'error', error: sizeError }
      return { id, file, previewUrl: null, status: 'checking', error: '' }
    })

    setItems((prev) => [...prev, ...newItems])
    setDone(false)
    e.target.value = ''

    newItems
      .filter((item) => item.status === 'checking')
      .forEach((item) => {
        loadVideoMetadata(item.file)
          .then(({ duration, url }) => {
            const durationError = validateVideoDuration(duration)
            if (durationError) {
              URL.revokeObjectURL(url)
              setItems((prev) =>
                prev.map((i) => (i.id === item.id ? { ...i, status: 'error', error: durationError } : i))
              )
              return
            }
            setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, previewUrl: url, status: 'pending' } : i)))
          })
          .catch((err) => {
            console.error(err)
            setItems((prev) =>
              prev.map((i) => (i.id === item.id ? { ...i, status: 'error', error: 'No se pudo leer este vídeo.' } : i))
            )
          })
      })
  }

  const removeItem = (id) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((item) => item.id !== id)
    })
  }

  const handleUploadAll = async () => {
    setUploading(true)
    setDone(false)

    for (const item of items) {
      if (item.status !== 'pending') continue
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: 'uploading', error: '' } : i)))
      try {
        await uploadMedia(item.file, guestName)
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: 'done' } : i)))
      } catch (err) {
        console.error(err)
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: 'error', error: err.message || 'No se pudo subir' } : i))
        )
      }
    }

    setUploading(false)
    setDone(true)
  }

  const startOver = () => {
    items.forEach((item) => item.previewUrl && URL.revokeObjectURL(item.previewUrl))
    setItems([])
    setDone(false)
  }

  const uploadableItems = items.filter((item) => item.status === 'pending')
  const successCount = items.filter((item) => item.status === 'done').length
  const errorCount = items.filter((item) => item.status === 'error').length
  const anyChecking = items.some((item) => item.status === 'checking')
  const allDone = items.length > 0 && items.every((item) => item.status === 'done')

  return (
    <main className="upload-screen">
      <div className="upload-card">
        <Link to="/" className="back-link">
          ← Volver
        </Link>
        <h1 className="upload-title">Subir vídeos</h1>
        <p className="upload-hint">Máximo 60 segundos y 100MB cada uno.</p>

        {done && allDone ? (
          <div className="upload-success">
            <p>¡Gracias por compartir {successCount === 1 ? 'tu vídeo' : `tus ${successCount} vídeos`}! 🎬</p>
            <div className="welcome-actions">
              <Link to="/galeria" className="btn btn-primary">
                Ver galería
              </Link>
              <button type="button" className="btn btn-secondary" onClick={startOver}>
                Subir más
              </button>
            </div>
          </div>
        ) : (
          <>
            <label className="file-drop file-drop-compact">
              <input type="file" accept="video/*" multiple onChange={handleFileChange} hidden />
              <span>Toca para elegir uno o varios vídeos</span>
            </label>

            {items.length > 0 && (
              <div className="media-picker-grid">
                {items.map((item) => (
                  <div key={item.id} className="media-picker-item">
                    {item.previewUrl ? (
                      <video src={item.previewUrl} muted />
                    ) : (
                      <div className="media-picker-placeholder" />
                    )}
                    {item.status === 'pending' && !uploading && (
                      <button
                        type="button"
                        className="media-picker-remove"
                        onClick={() => removeItem(item.id)}
                        aria-label="Quitar"
                      >
                        ×
                      </button>
                    )}
                    {item.status === 'checking' && <span className="media-picker-badge">Comprobando…</span>}
                    {item.status === 'uploading' && <span className="media-picker-badge">Subiendo…</span>}
                    {item.status === 'done' && <span className="media-picker-badge media-picker-badge-ok">✓</span>}
                    {item.status === 'error' && (
                      <span className="media-picker-badge media-picker-badge-error" title={item.error}>
                        !
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {done && errorCount > 0 && (
              <p className="form-error">
                {successCount} subida{successCount === 1 ? '' : 's'} bien, {errorCount} fallaron (pasa el ratón por
                encima del "!" para ver el motivo).
              </p>
            )}

            <button
              type="button"
              className="btn btn-primary upload-submit"
              onClick={handleUploadAll}
              disabled={uploadableItems.length === 0 || uploading || anyChecking}
            >
              {uploading
                ? 'Subiendo…'
                : anyChecking
                  ? 'Comprobando vídeos…'
                  : `Subir ${uploadableItems.length > 1 ? `${uploadableItems.length} vídeos` : 'vídeo'}`}
            </button>
          </>
        )}
      </div>
    </main>
  )
}
