export function isHeic(file) {
  const type = (file.type || '').toLowerCase()
  const name = (file.name || '').toLowerCase()
  return type.includes('heic') || type.includes('heif') || name.endsWith('.heic') || name.endsWith('.heif')
}

function jpegName(originalName) {
  return (originalName || 'foto').replace(/\.(heic|heif)$/i, '') + '.jpg'
}

// Safari (macOS/iOS) sabe decodificar HEIC de forma NATIVA en <img>/<canvas>
// (usa el mismo motor que Fotos.app), así que probamos esto primero: es más
// fiable que cualquier librería JS para las variantes "raras" de HEIC que
// puede generar un iPhone (HDR, datos de profundidad, ráfagas...).
function convertViaCanvas(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url)
            if (blob) resolve(new File([blob], jpegName(file.name), { type: 'image/jpeg' }))
            else reject(new Error('El navegador no pudo generar la imagen convertida'))
          },
          'image/jpeg',
          0.85
        )
      } catch (err) {
        URL.revokeObjectURL(url)
        reject(err)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Este navegador no puede decodificar HEIC de forma nativa'))
    }

    img.src = url
  })
}

// Respaldo para navegadores que no saben renderizar HEIC de forma nativa
// (Chrome/Firefox de escritorio, la mayoría de Android).
async function convertViaHeic2any(file) {
  const heic2any = (await import('heic2any')).default
  const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 })
  const blob = Array.isArray(result) ? result[0] : result
  return new File([blob], jpegName(file.name), { type: 'image/jpeg' })
}

export async function convertHeicToJpeg(file) {
  try {
    return await convertViaCanvas(file)
  } catch (canvasErr) {
    console.warn('Conversión nativa de HEIC falló, probando con heic2any:', canvasErr)
    try {
      return await convertViaHeic2any(file)
    } catch (libErr) {
      console.error('heic2any también falló:', libErr)
      throw new Error(libErr.message || canvasErr.message || 'No se pudo convertir esta foto')
    }
  }
}
