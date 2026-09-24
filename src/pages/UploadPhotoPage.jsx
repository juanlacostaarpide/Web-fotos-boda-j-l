import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGuestName } from '../hooks/useGuestName'
import { uploadMedia } from '../utils/api'
import { convertHeicToJpeg, isHeic } from '../utils/heic'

let nextId = 0

export default function UploadPhotoPage() {
  const { guestName } = useGuestName()
  const [items, setItems] = useState([]) // { id, file, previewUrl, status, error }
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const newItems = files.map((file) => ({
      id: nextId++,
      file,
      previewUrl: isHeic(file) ? null : URL.createObjectURL(file),
      status: isHeic(file) ? 'converting' : 'pending', // converting | pending | uploading | done | error
      error: '',
    }))
    setItems((prev) => [...prev, ...newItems])
    setDone(false)
    e.target.value = '' // permite volver a elegir, incluso los mismos archivos

    newItems
      .filter((item) => item.status === 'converting')
      .forEach((item) => {
        convertHeicToJpeg(item.file)
          .then((converted) => {
            const previewUrl = URL.createObjectURL(converted)
            setItems((prev) =>
              prev.map((i) => (i.id === item.id ? { ...i, file: converted, previewUrl, status: 'pending' } : i))
            )
          })
          .catch((err) => {
            console.error(err)
            setItems((prev) =>
              prev.map((i) =>
                i.id === item.id
                  ? { ...i, status: 'error', error: `No se pudo convertir esta foto: ${err.message || 'formato no compatible'}` }
                  : i
              )
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
      if (item.status === 'done' || item.status === 'converting') continue
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'uploading', progress: 0, error: '' } : i))
      )
      try {
        await uploadMedia(item.file, guestName, (progress) => {
          setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, progress } : i)))
        })
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: 'done' } : i)))
      } catch (err) {
        console.error(err)
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, status: 'error', error: err.message || 'No se pudo subir' } : i
          )
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

  const successCount = items.filter((item) => item.status === 'done').length
  const errorCount = items.filter((item) => item.status === 'error').length
  const anyConverting = items.some((item) => item.status === 'converting')
  const allDone = items.length > 0 && items.every((item) => item.status === 'done')

  return (
    <main className="upload-screen">
      <div className="upload-card">
        <Link to="/" className="back-link">
          ← Volver
        </Link>
        <h1 className="upload-title">Subir fotos</h1>

        {done && allDone ? (
          <div className="upload-success">
            <p>¡Gracias por compartir {successCount === 1 ? 'tu foto' : `tus ${successCount} fotos`}! 🎉</p>
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
              <input type="file" accept="image/*,.heic,.heif" multiple onChange={handleFileChange} hidden />
              <span>Toca para elegir una o varias fotos</span>
            </label>

            {items.length > 0 && (
              <div className="media-picker-grid">
                {items.map((item) => (
                  <div key={item.id} className="media-picker-item">
                    {item.previewUrl ? (
                      <img src={item.previewUrl} alt="" />
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
                    {item.status === 'converting' && <span className="media-picker-badge">Procesando…</span>}
                    {item.status === 'uploading' && (
                      <span className="media-picker-badge">
                        Subiendo… {item.progress ?? 0}%
                        <span className="media-picker-progress" style={{ width: `${item.progress ?? 0}%` }} />
                      </span>
                    )}
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
                {successCount} subida{successCount === 1 ? '' : 's'} bien, {errorCount} fallaron. Puedes reintentar
                solo con "Subir fotos".
              </p>
            )}

            <button
              type="button"
              className="btn btn-primary upload-submit"
              onClick={handleUploadAll}
              disabled={items.length === 0 || uploading || allDone || anyConverting}
            >
              {uploading
                ? 'Subiendo…'
                : anyConverting
                  ? 'Procesando fotos…'
                  : `Subir ${items.length > 1 ? `${items.length} fotos` : 'foto'}`}
            </button>
          </>
        )}
      </div>
    </main>
  )
}
