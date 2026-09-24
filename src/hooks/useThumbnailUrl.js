import { useEffect, useState } from 'react'
import { ref, getDownloadURL } from 'firebase/storage'
import { photosStorage } from '../firebase/photosApp'
import { videosStorage } from '../firebase/videosApp'

// Resuelve la URL de descarga pública del THUMBNAIL (nunca del original) de un
// item de la galería, en el Storage del proyecto que corresponda.
export function useThumbnailUrl(item) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    let cancelled = false
    setUrl(null)

    if (!item?.thumbPath) return undefined

    const storage = item.project === 'videos' ? videosStorage : photosStorage
    getDownloadURL(ref(storage, item.thumbPath))
      .then((downloadUrl) => {
        if (!cancelled) setUrl(downloadUrl)
      })
      .catch((err) => {
        console.error('No se pudo cargar la miniatura:', err)
      })

    return () => {
      cancelled = true
    }
  }, [item?.thumbPath, item?.project])

  return url
}
