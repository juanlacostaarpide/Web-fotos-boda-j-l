import fs from 'node:fs'
import path from 'node:path'

// Base de datos minimalista: un único fichero JSON con la metadata de cada
// foto/vídeo. Para el volumen de una boda (unos cientos de archivos) es más
// que suficiente y evita depender de módulos nativos (SQLite) dentro de Docker.
const DATA_DIR = path.join(process.cwd(), 'data')
const DB_PATH = path.join(DATA_DIR, 'media.json')

function ensureDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
    fs.writeFileSync(DB_PATH, '[]')
  }
}

export function readAll() {
  ensureDb()
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
}

function writeAll(items) {
  fs.writeFileSync(DB_PATH, JSON.stringify(items, null, 2))
}

export function insert(record) {
  const items = readAll()
  items.push(record)
  writeAll(items)
  return record
}

export function findById(id) {
  return readAll().find((item) => item.id === id)
}

export function remove(id) {
  writeAll(readAll().filter((item) => item.id !== id))
}
