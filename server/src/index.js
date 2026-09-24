import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mediaRouter from './routes/media.js'
import adminRouter from './routes/admin.js'
import configRouter from './routes/config.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(express.json())
app.use(cookieParser())

app.use('/uploads', express.static(path.join(process.cwd(), 'data', 'uploads')))
app.use('/api/media', mediaRouter)
app.use('/api/admin', adminRouter)
app.use('/api/config', configRouter)

// En producción (dentro de Docker) servimos aquí el build de React.
// En desarrollo, el frontend corre aparte con `npm run dev` (Vite) y hace
// proxy de /api y /uploads a este servidor (ver vite.config.js).
const publicDir = path.join(__dirname, '..', 'public')
app.use(express.static(publicDir))
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next()
  res.sendFile(path.join(publicDir, 'index.html'), (err) => {
    if (err) next()
  })
})

app.use((err, req, res, next) => {
  if (!err) return next()
  console.error(err)
  const message = err.code === 'LIMIT_FILE_SIZE' ? 'El archivo es demasiado grande.' : err.message || 'Error al procesar la petición.'
  res.status(400).json({ error: message })
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`Servidor de la galería escuchando en http://localhost:${port}`)
})
