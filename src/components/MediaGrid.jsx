import { useState } from 'react'
import MediaCard from './MediaCard'
import MediaModal from './MediaModal'

export default function MediaGrid({ items }) {
  const [selected, setSelected] = useState(null)

  if (items.length === 0) {
    return <p className="empty-gallery">Todavía no hay fotos ni vídeos. ¡Sé el primero en subir uno!</p>
  }

  return (
    <>
      <div className="media-grid">
        {items.map((item) => (
          <MediaCard key={item.id} item={item} onClick={setSelected} />
        ))}
      </div>
      <MediaModal item={selected} onClose={() => setSelected(null)} />
    </>
  )
}
