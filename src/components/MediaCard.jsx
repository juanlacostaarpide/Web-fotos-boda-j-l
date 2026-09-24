export default function MediaCard({ item, onClick }) {
  return (
    <button type="button" className="media-card" onClick={() => onClick(item)}>
      <img src={`/uploads/${item.thumbPath}`} alt={item.uploaderName ? `Subido por ${item.uploaderName}` : 'Foto de la boda'} loading="lazy" />
      {item.type === 'video' && (
        <span className="media-card-badge" aria-hidden="true">
          ▶
        </span>
      )}
    </button>
  )
}
