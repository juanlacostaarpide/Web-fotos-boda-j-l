import { Router } from 'express'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'
import rateLimit from 'express-rate-limit'
import sharp from 'sharp'
import { insert, readAll, findById, remove } from '../db.js'
import { getVideoDuration, extractVideoThumbnail } from '../utils/video.js'
import { requireAdmin } from '../auth.js'

const router = Router()

const UPLOADS_DIR = path.join(process.cwd(), 'data', 'uploads')
const ORIGINALS_DIR = path.join(UPLOADS_DIR, 'originals')
const THUMBS_DIR = path.join(UPLOADS_DIR, 'thumbnails')
fs.mkdirSync(ORIGINALS_DIR, { recursive: true })
fs.mkdirSync(THUMBS_DIR, { recursive: true })

// Sin límite de duración/tamaño para los invitados: es nuestro propio disco,
// no una cuota de un servicio en la nube. Este único tope es solo una red de
// seguridad técnica (evitar una subida rota o descontrolada), no una
// restricción pensada para el uso normal.
const MAX_FILE_BYTES = 5 * 1024 * 1024 * 1024 // 5GB

const storage = multer.diskStorage({
  destination: ORIGINALS_DIR,
  filename: (req, file, cb) => {
    const id = crypto.randomUUID()
    const ext = path.extname(file.originalname) || (file.mimetype.startsWith('video/') ? '.mp4' : '.jpg')
    req.generatedId = id
    cb(null, `${id}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_BYTES },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/')) {
      return cb(new Error('Tipo de archivo no permitido'))
    }
    cb(null, true)
  },
})

// Límite de subidas por IP para evitar abusos, ya que no hay login de invitados.
const uploadLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 60 })

router.get('/', (req, res) => {
  const items = readAll().sort((a, b) => b.createdAt - a.createdAt)
  res.json(items)
})

router.post('/', uploadLimiter, upload.single('file'), async (req, res) => {
  const file = req.file
  if (!file) return res.status(400).json({ error: 'Falta el archivo' })

  const isVideo = file.mimetype.startsWith('video/')
  const id = req.generatedId
  const originalPath = `originals/${file.filename}`
  const thumbFilename = `${id}.jpg`
  const thumbPath = `thumbnails/${thumbFilename}`

  try {
    if (isVideo) {
      const duration = await getVideoDuration(file.path)
      await extractVideoThumbnail(file.path, path.join(THUMBS_DIR, thumbFilename), Math.min(1, duration / 2))
    } else {
      await sharp(file.path)
        .rotate()
        .resize({ width: 800, withoutEnlargement: true })
        .jpeg({ quality: 75 })
        .toFile(path.join(THUMBS_DIR, thumbFilename))
    }
  } catch (err) {
    fs.unlink(file.path, () => {})
    return res.status(400).json({ error: err.message || 'No se pudo procesar el archivo' })
  }

  const record = {
    id,
    type: isVideo ? 'video' : 'foto',
    uploaderName: (req.body.uploaderName || '').slice(0, 60) || 'Anónimo',
    createdAt: Date.now(),
    originalPath,
    thumbPath,
    mimeType: file.mimetype,
  }
  insert(record)
  res.status(201).json(record)
})

router.delete('/:id', requireAdmin, (req, res) => {
  const item = findById(req.params.id)
  if (!item) return res.status(404).json({ error: 'No encontrado' })
  fs.unlink(path.join(UPLOADS_DIR, item.originalPath), () => {})
  fs.unlink(path.join(UPLOADS_DIR, item.thumbPath), () => {})
  remove(item.id)
  res.status(204).end()
})

export default router
