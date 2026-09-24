import { useThumbnailUrl } from '../hooks/useThumbnailUrl'

export default function MediaCard({ item, onClick }) {
  const url = useThumbnailUrl(item)

  return (
    <button type="button" className="media-card" onClick={() => onClick(item)} disabled={!url}>
      {url ? (
        <img src={url} alt={item.uploaderName ? `Subido por ${item.uploaderName}` : 'Foto de la boda'} loading="lazy" />
      ) : (
        <div className="media-card-placeholder" />
      )}
      {item.type === 'video' && (
        <span className="media-card-badge" aria-hidden="true">
          ▶
        </span>
      )}
    </button>
  )
}
