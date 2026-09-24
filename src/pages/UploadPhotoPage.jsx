import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createImageThumbnail } from '../utils/imageThumbnail'
import { uploadPhoto } from '../utils/mediaUpload'

export default function UploadPhotoPage() {
  const { photosUid, guestName, authReady } = useAuth()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [status, setStatus] = useState('idle') // idle | uploading | done | error
  const [errorMessage, setErrorMessage] = useState('')

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    setStatus('idle')
    setErrorMessage('')
    if (!selected) {
      setFile(null)
      setPreview(null)
      return
    }
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  const handleUpload = async () => {
    if (!file || !photosUid) return
    setStatus('uploading')
    setErrorMessage('')
    try {
      const thumbnailBlob = await createImageThumbnail(file)
      await uploadPhoto({ file, thumbnailBlob, photosUid, uploaderName: guestName })
      setStatus('done')
      setFile(null)
      setPreview(null)
    } catch (err) {
      console.error(err)
      setErrorMessage('No se pudo subir la foto. Inténtalo de nuevo.')
      setStatus('error')
    }
  }

  return (
    <main className="upload-screen">
      <div className="upload-card">
        <Link to="/" className="back-link">
          ← Volver
        </Link>
        <h1 className="upload-title">Subir foto</h1>

        {status === 'done' ? (
          <div className="upload-success">
            <p>¡Gracias por compartir tu foto! 🎉</p>
            <div className="welcome-actions">
              <Link to="/galeria" className="btn btn-primary">
                Ver galería
              </Link>
              <button type="button" className="btn btn-secondary" onClick={() => setStatus('idle')}>
                Subir otra
              </button>
            </div>
          </div>
        ) : (
          <>
            <label className="file-drop">
              <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} hidden />
              {preview ? (
                <img src={preview} alt="Previsualización" className="file-drop-preview" />
              ) : (
                <span>Toca para elegir o hacer una foto</span>
              )}
            </label>

            {errorMessage && <p className="form-error">{errorMessage}</p>}

            <button
              type="button"
              className="btn btn-primary upload-submit"
              onClick={handleUpload}
              disabled={!file || !authReady || status === 'uploading'}
            >
              {status === 'uploading' ? 'Subiendo…' : 'Subir foto'}
            </button>
          </>
        )}
      </div>
    </main>
  )
}
