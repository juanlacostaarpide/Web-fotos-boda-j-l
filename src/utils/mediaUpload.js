import { ref, uploadBytes } from 'firebase/storage'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db, photosStorage } from '../firebase/photosApp'
import { videosStorage } from '../firebase/videosApp'

function buildFileName(originalName, fallbackExt) {
  const ext = originalName?.includes('.') ? originalName.split('.').pop() : fallbackExt
  const id = crypto.randomUUID()
  return `${id}.${ext}`
}

// Sube una foto: el original va al Storage del proyecto FOTOS (carpeta /originals,
// solo legible por el admin) y el thumbnail comprimido a /thumbnails (público).
export async function uploadPhoto({ file, thumbnailBlob, photosUid, uploaderName }) {
  const fileName = buildFileName(file.name, 'jpg')
  const originalPath = `originals/${photosUid}/${fileName}`
  const thumbPath = `thumbnails/${photosUid}/${fileName}`

  await uploadBytes(ref(photosStorage, originalPath), file, { contentType: file.type })
  await uploadBytes(ref(photosStorage, thumbPath), thumbnailBlob, { contentType: 'image/jpeg' })

  await addDoc(collection(db, 'media'), {
    type: 'foto',
    project: 'fotos',
    uploaderUid: photosUid,
    uploaderName: uploaderName || 'Anónimo',
    createdAt: serverTimestamp(),
    originalPath,
    thumbPath,
  })
}

// Sube un vídeo: el original y su thumbnail van al Storage del proyecto VÍDEOS,
// bajo la carpeta del UID del invitado EN ESE proyecto (distinto del UID de Firestore).
// La metadata en Firestore vive igualmente en el proyecto de fotos.
export async function uploadVideo({ file, thumbnailBlob, photosUid, videosUid, uploaderName }) {
  const fileName = buildFileName(file.name, 'mp4')
  const originalPath = `originals/${videosUid}/${fileName}`
  const thumbPath = `thumbnails/${videosUid}/${fileName}`

  await uploadBytes(ref(videosStorage, originalPath), file, { contentType: file.type })
  await uploadBytes(ref(videosStorage, thumbPath), thumbnailBlob, { contentType: 'image/jpeg' })

  await addDoc(collection(db, 'media'), {
    type: 'video',
    project: 'videos',
    uploaderUid: photosUid,
    uploaderName: uploaderName || 'Anónimo',
    createdAt: serverTimestamp(),
    originalPath,
    thumbPath,
  })
}
