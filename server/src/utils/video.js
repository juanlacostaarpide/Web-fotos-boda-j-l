import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

// Requiere ffmpeg/ffprobe instalados en el sistema (ver Dockerfile).
export async function getVideoDuration(filePath) {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    filePath,
  ])
  const duration = parseFloat(stdout.trim())
  if (Number.isNaN(duration)) throw new Error('No se pudo leer la duración del vídeo')
  return duration
}

export async function extractVideoThumbnail(inputPath, outputPath, atSeconds = 1) {
  await execFileAsync('ffmpeg', [
    '-y',
    '-ss', String(Math.max(atSeconds, 0)),
    '-i', inputPath,
    '-frames:v', '1',
    '-q:v', '3',
    outputPath,
  ])
}
