// Genera, en el propio navegador, una miniatura comprimida de una foto antes de subirla.
export async function createImageThumbnail(file, { maxWidth = 800, quality = 0.75 } = {}) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxWidth / bitmap.width)
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close?.()

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('No se pudo comprimir la imagen'))),
      'image/jpeg',
      quality
    )
  })

  return blob
}
