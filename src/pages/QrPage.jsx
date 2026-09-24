import { QRCodeSVG } from 'qrcode.react'
import { Link } from 'react-router-dom'
import { WEDDING_CONFIG } from '../weddingConfig'

export default function QrPage() {
  const url = window.location.origin

  return (
    <main className="qr-screen">
      <div className="qr-card">
        <Link to="/" className="back-link">
          ← Volver
        </Link>
        <p className="welcome-eyebrow">{WEDDING_CONFIG.coupleNames}</p>
        <h1 className="upload-title">Comparte tus fotos y vídeos</h1>
        <div className="qr-code-wrap">
          <QRCodeSVG value={url} size={220} bgColor="#fffdfa" fgColor="#3d3229" />
        </div>
        <p className="qr-url">{url}</p>
        <p className="upload-hint">Imprime esta página y colócala en las mesas de la boda.</p>
      </div>
    </main>
  )
}
