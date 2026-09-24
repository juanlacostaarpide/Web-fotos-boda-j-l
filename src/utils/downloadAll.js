import JSZip from 'jszip'
import { ref, getBlob } from 'firebase/storage'
import { photosStorage } from '../firebase/photosApp'
import { videosStorage } from '../firebase/videosApp'

// Descarga TODOS los originales (fotos + vídeos) directamente desde el navegador del
// admin usando el SDK de Firebase (las reglas de Storage le dan permiso de lectura),
// los empaqueta en un ZIP con JSZip y no pasan por ningún servidor intermedio.
export async function downloadAllAsZip(items, { onProgress } = {}) {
  const zip = new JSZip()
  let done = 0

  for (const item of items) {
    const storage = item.project === 'videos' ? videosStorage : photosStorage
    const folder = item.type === 'video' ? 'videos' : 'fotos'
    const fileName = item.originalPath.split('/').pop()

    try {
      const blob = await getBlob(ref(storage, item.originalPath))
      zip.file(`${folder}/${fileName}`, blob)
    } catch (err) {
      console.error(`No se pudo descargar ${item.originalPath}:`, err)
    }

    done += 1
    onProgress?.(done, items.length)
  }

  return zip.generateAsync({ type: 'blob' })
}

export function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
