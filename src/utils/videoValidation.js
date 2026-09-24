export const MAX_VIDEO_DURATION_SECONDS = 60
export const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024

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

// Carga el vídeo en un <video> oculto para leer su duración y dimensiones
// sin necesidad de subirlo. Devuelve también el propio elemento <video> y la
// URL de objeto, para poder capturar después un frame como miniatura.
export function loadVideoMetadata(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.src = url

    video.onloadedmetadata = () => {
      resolve({ duration: video.duration, width: video.videoWidth, height: video.videoHeight, video, url })
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

// Captura un frame del vídeo (por defecto al segundo 1, o antes si el vídeo es más corto)
// y lo convierte en un JPEG comprimido para usarlo como miniatura en la galería.
export function captureVideoFrame(video, atSeconds = 1) {
  return new Promise((resolve, reject) => {
    const target = Math.min(atSeconds, Math.max(video.duration - 0.1, 0))

    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked)
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo generar la miniatura del vídeo'))),
        'image/jpeg',
        0.75
      )
    }

    video.addEventListener('seeked', onSeeked)
    video.currentTime = target
  })
}
