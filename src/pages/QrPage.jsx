import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Link } from 'react-router-dom'
import { WEDDING_CONFIG } from '../weddingConfig'

// Formato estándar que reconocen las cámaras de móvil para conectarse
// automáticamente a una wifi al escanear el QR (sin teclear nada).
function buildWifiQrValue(ssid, password) {
  const escape = (s) => s.replace(/([\\;,:"])/g, '\\$1')
  return `WIFI:T:WPA;S:${escape(ssid)};P:${escape(password)};;`
}

export default function QrPage() {
  const url = window.location.origin
  const [wifi, setWifi] = useState(null)

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.wifiSsid && data.wifiPassword) setWifi(data)
      })
      .catch((err) => console.error('No se pudo cargar la configuración de wifi:', err))
  }, [])

  return (
    <main className="qr-screen">
      <div className="qr-card">
        <Link to="/" className="back-link">
          ← Volver
        </Link>
        <p className="welcome-eyebrow">{WEDDING_CONFIG.coupleNames}</p>
        <h1 className="upload-title">Comparte tus fotos y vídeos</h1>

        {wifi && (
          <div className="qr-step">
            <p className="qr-step-label">1. Conéctate a la wifi</p>
            <div className="qr-code-wrap">
              <QRCodeSVG value={buildWifiQrValue(wifi.wifiSsid, wifi.wifiPassword)} size={180} bgColor="#fffdfa" fgColor="#3d3229" />
            </div>
            <p className="qr-url">
              {wifi.wifiSsid} · {wifi.wifiPassword}
            </p>
          </div>
        )}

        <div className="qr-step">
          {wifi && <p className="qr-step-label">2. Abre la web</p>}
          <div className="qr-code-wrap">
            <QRCodeSVG value={url} size={wifi ? 180 : 220} bgColor="#fffdfa" fgColor="#3d3229" />
          </div>
          <p className="qr-url">{url}</p>
        </div>

        <p className="upload-hint">Imprime esta página y colócala en las mesas de la boda.</p>
      </div>
    </main>
  )
}
