export default function MediaModal({ item, onClose, isAdmin, onDelete }) {
  if (!item) return null

  const fileUrl = `/uploads/${item.originalPath}`

  const handleDelete = async () => {
    if (!window.confirm('¿Borrar este archivo para siempre?')) return
    await onDelete(item.id)
    onClose()
  }

  return (
    <div className="media-modal-backdrop" onClick={onClose}>
      <div className="media-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="media-modal-close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>

        {item.type === 'video' ? (
          <video src={fileUrl} className="media-modal-image" controls />
        ) : (
          <img src={fileUrl} alt="" className="media-modal-image" />
        )}

        <div className="media-modal-meta">
          {item.type === 'video' && <span className="media-modal-tag">Vídeo</span>}
          <span>{item.uploaderName || 'Anónimo'}</span>
          <a href={fileUrl} download className="media-modal-download">
            Descargar
          </a>
          {isAdmin && (
            <button type="button" className="media-modal-delete" onClick={handleDelete}>
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
