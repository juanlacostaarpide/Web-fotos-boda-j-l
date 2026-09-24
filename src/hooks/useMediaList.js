import { useCallback, useEffect, useState } from 'react'

// La galería se refresca cada pocos segundos consultando la API. Para el
// tamaño de tráfico de una boda es más sencillo y suficiente que websockets.
const POLL_INTERVAL_MS = 5000

export function useMediaList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    try {
      const res = await fetch('/api/media')
      if (!res.ok) throw new Error('No se pudo cargar la galería')
      setItems(await res.json())
      setError(null)
    } catch (err) {
      console.error(err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
    const interval = setInterval(reload, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [reload])

  return { items, loading, error, reload }
}
