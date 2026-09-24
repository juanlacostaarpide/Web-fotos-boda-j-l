import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { uploadVideo } from '../utils/mediaUpload'
import { captureVideoFrame, loadVideoMetadata, validateVideoDuration, validateVideoFile } from '../utils/videoValidation'

export default function UploadVideoPage() {
  const { photosUid, videosUid, guestName, authReady } = useAuth()
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [status, setStatus] = useState('idle') // idle | checking | uploading | done | error
  const [errorMessage, setErrorMessage] = useState('')

  const handleFileChange = async (e) => {
    const selected = e.target.files?.[0]
    setStatus('idle')
    setErrorMessage('')
    setFile(null)
    setPreviewUrl(null)
    if (!selected) return

    const sizeError = validateVideoFile(selected)
    if (sizeError) {
      setErrorMessage(sizeError)
      setStatus('error')
      return
    }

    setStatus('checking')
    try {
      const { duration, url } = await loadVideoMetadata(selected)
      const durationError = validateVideoDuration(duration)
      if (durationError) {
        URL.revokeObjectURL(url)
        setErrorMessage(durationError)
        setStatus('error')
        return
      }
      setFile(selected)
      setPreviewUrl(url)
      setStatus('idle')
    } catch (err) {
      console.error(err)
      setErrorMessage('No se pudo leer el vídeo. Prueba con otro archivo.')
      setStatus('error')
    }
  }

  const handleUpload = async () => {
    if (!file || !previewUrl || !photosUid || !videosUid) return
    setStatus('uploading')
    setErrorMessage('')
    try {
      const video = document.createElement('video')
      video.src = previewUrl
      video.muted = true
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve
        video.onerror = () => reject(new Error('No se pudo preparar el vídeo'))
      })
      const thumbnailBlob = await captureVideoFrame(video, 1)

      await uploadVideo({ file, thumbnailBlob, photosUid, videosUid, uploaderName: guestName })
      setStatus('done')
      setFile(null)
      setPreviewUrl(null)
    } catch (err) {
      console.error(err)
      setErrorMessage('No se pudo subir el vídeo. Inténtalo de nuevo.')
      setStatus('error')
    }
  }

  return (
    <main className="upload-screen">
      <div className="upload-card">
        <Link to="/" className="back-link">
          ← Volver
        </Link>
        <h1 className="upload-title">Subir vídeo</h1>
        <p className="upload-hint">Máximo 60 segundos y 100MB.</p>

        {status === 'done' ? (
          <div className="upload-success">
            <p>¡Gracias por compartir tu vídeo! 🎬</p>
            <div className="welcome-actions">
              <Link to="/galeria" className="btn btn-primary">
                Ver galería
              </Link>
              <button type="button" className="btn btn-secondary" onClick={() => setStatus('idle')}>
                Subir otro
              </button>
            </div>
          </div>
        ) : (
          <>
            <label className="file-drop">
              <input type="file" accept="video/*" capture="environment" onChange={handleFileChange} hidden />
              {previewUrl ? (
                <video src={previewUrl} className="file-drop-preview" controls muted />
              ) : (
                <span>Toca para elegir o grabar un vídeo</span>
              )}
            </label>

            {status === 'checking' && <p className="form-hint">Comprobando el vídeo…</p>}
            {errorMessage && <p className="form-error">{errorMessage}</p>}

            <button
              type="button"
              className="btn btn-primary upload-submit"
              onClick={handleUpload}
              disabled={!file || !authReady || status === 'uploading' || status === 'checking'}
            >
              {status === 'uploading' ? 'Subiendo…' : 'Subir vídeo'}
            </button>
          </>
        )}
      </div>
    </main>
  )
}
