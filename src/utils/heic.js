export function isHeic(file) {
  const type = (file.type || '').toLowerCase()
  const name = (file.name || '').toLowerCase()
  return type.includes('heic') || type.includes('heif') || name.endsWith('.heic') || name.endsWith('.heif')
}

// Convierte HEIC/HEIF (formato típico de fotos de iPhone) a JPEG en el propio
// navegador. El servidor (sharp) no sabe leer HEIC, así que esto evita que la
// subida falle según de qué móvil venga la foto.
export async function convertHeicToJpeg(file) {
  const heic2any = (await import('heic2any')).default
  const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 })
  const blob = Array.isArray(result) ? result[0] : result
  const newName = file.name.replace(/\.(heic|heif)$/i, '') + '.jpg'
  return new File([blob], newName, { type: 'image/jpeg' })
}
