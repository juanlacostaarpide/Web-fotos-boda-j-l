import { Router } from 'express'

const router = Router()

// Datos públicos de configuración que necesita el frontend en tiempo de
// ejecución (no en build-time), para no tener que reconstruir la imagen
// Docker solo por cambiar el SSID/contraseña de la wifi de la Raspberry Pi.
router.get('/', (req, res) => {
  res.json({
    wifiSsid: process.env.WIFI_SSID || null,
    wifiPassword: process.env.WIFI_PASSWORD || null,
  })
})

export default router
