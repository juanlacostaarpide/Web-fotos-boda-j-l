export async function uploadMedia(file, uploaderName) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('uploaderName', uploaderName || '')

  const res = await fetch('/api/media', { method: 'POST', body: formData })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'No se pudo subir el archivo')
  }
  return res.json()
}

export async function deleteMedia(id) {
  const res = await fetch(`/api/media/${id}`, { method: 'DELETE', credentials: 'include' })
  if (!res.ok && res.status !== 204) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'No se pudo borrar el archivo')
  }
}
