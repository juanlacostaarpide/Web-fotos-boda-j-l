import { Router } from 'express'
import path from 'node:path'
import fs from 'node:fs'
import archiver from 'archiver'
import bcrypt from 'bcryptjs'
import { readAll } from '../db.js'
import { requireAdmin, signAdminToken, verifyAdminToken, ADMIN_COOKIE } from '../auth.js'

const router = Router()
const UPLOADS_DIR = path.join(process.cwd(), 'data', 'uploads')

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 12 * 60 * 60 * 1000,
}

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {}
  const adminEmail = process.env.ADMIN_EMAIL
  const adminHash = process.env.ADMIN_PASSWORD_HASH

  if (!adminEmail || !adminHash) {
    return res.status(500).json({ error: 'El servidor no tiene configurado el admin (ver .env)' })
  }

  const emailOk = email === adminEmail
  const passwordOk = emailOk && (await bcrypt.compare(password || '', adminHash))
  if (!emailOk || !passwordOk) {
    return res.status(401).json({ error: 'Email o contraseña incorrectos' })
  }

  res.cookie(ADMIN_COOKIE, signAdminToken(email), COOKIE_OPTIONS)
  res.json({ ok: true })
})

router.post('/logout', (req, res) => {
  res.clearCookie(ADMIN_COOKIE)
  res.json({ ok: true })
})

router.get('/me', (req, res) => {
  const token = req.cookies?.[ADMIN_COOKIE]
  res.json({ isAdmin: Boolean(token && verifyAdminToken(token)) })
})

router.get('/download-all', requireAdmin, (req, res) => {
  const { type, from, to } = req.query
  let items = readAll()
  if (type && type !== 'all') items = items.filter((item) => item.type === type)
  if (from) items = items.filter((item) => item.createdAt >= new Date(`${from}T00:00:00`).getTime())
  if (to) items = items.filter((item) => item.createdAt <= new Date(`${to}T23:59:59`).getTime())

  res.attachment('boda-fotos-videos.zip')
  const archive = archiver('zip', { zlib: { level: 9 } })
  archive.on('error', (err) => res.status(500).end(err.message))
  archive.pipe(res)

  for (const item of items) {
    const filePath = path.join(UPLOADS_DIR, item.originalPath)
    if (fs.existsSync(filePath)) {
      const folder = item.type === 'video' ? 'videos' : 'fotos'
      archive.file(filePath, { name: `${folder}/${path.basename(filePath)}` })
    }
  }

  archive.finalize()
})

export default router
