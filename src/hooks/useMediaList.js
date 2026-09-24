import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase/photosApp'

// Escucha en tiempo real la colección "media": según van subiendo fotos/vídeos
// otros invitados, la galería se actualiza sola.
export function useMediaList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const q = query(collection(db, 'media'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
        setLoading(false)
      },
      (err) => {
        console.error('Error al leer la galería:', err)
        setError(err)
        setLoading(false)
      }
    )
    return unsubscribe
  }, [])

  return { items, loading, error }
}
