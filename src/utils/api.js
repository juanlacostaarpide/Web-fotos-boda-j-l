// fetch() no permite conocer el progreso de subida, así que para poder
// mostrar un porcentaje real usamos XMLHttpRequest (que sí lo soporta).
export function uploadMedia(file, uploaderName, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('uploaderName', uploaderName || '')

    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/media')

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      let data = {}
      try {
        data = JSON.parse(xhr.responseText)
      } catch {
        // respuesta no era JSON, se ignora y se usa el mensaje genérico de abajo
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data)
      } else {
        reject(new Error(data.error || 'No se pudo subir el archivo'))
      }
    }

    xhr.onerror = () => reject(new Error('Error de red al subir el archivo'))

    xhr.send(formData)
  })
}

export async function deleteMedia(id) {
  const res = await fetch(`/api/media/${id}`, { method: 'DELETE', credentials: 'include' })
  if (!res.ok && res.status !== 204) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'No se pudo borrar el archivo')
  }
}
