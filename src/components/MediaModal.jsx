import { useThumbnailUrl } from '../hooks/useThumbnailUrl'

export default function MediaModal({ item, onClose }) {
  const url = useThumbnailUrl(item)

  if (!item) return null

  return (
    <div className="media-modal-backdrop" onClick={onClose}>
      <div className="media-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="media-modal-close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
        {url ? (
          <img src={url} alt="" className="media-modal-image" />
        ) : (
          <div className="media-modal-loading">Cargando…</div>
        )}
        <div className="media-modal-meta">
          {item.type === 'video' && <span className="media-modal-tag">Vídeo</span>}
          <span>{item.uploaderName || 'Anónimo'}</span>
        </div>
      </div>
    </div>
  )
}
