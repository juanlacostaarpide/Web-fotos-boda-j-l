export const MAX_VIDEO_DURATION_SECONDS = 60
export const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024

// Validación rápida en el cliente para dar feedback inmediato antes de subir.
// El servidor vuelve a comprobar tamaño y duración de forma autoritativa.
export function validateVideoFile(file) {
  if (!file.type.startsWith('video/')) {
    return 'El archivo seleccionado no es un vídeo.'
  }
  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1)
    return `El vídeo pesa ${mb}MB y el máximo permitido es 100MB.`
  }
  return null
}

export function loadVideoMetadata(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.src = url

    video.onloadedmetadata = () => {
      resolve({ duration: video.duration, url })
    }
    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('No se pudo leer el vídeo. Prueba con otro archivo.'))
    }
  })
}

export function validateVideoDuration(duration) {
  if (duration > MAX_VIDEO_DURATION_SECONDS) {
    return `El vídeo dura ${Math.round(duration)}s y el máximo permitido es 60s.`
  }
  return null
}
