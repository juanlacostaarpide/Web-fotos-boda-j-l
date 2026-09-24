import { Link } from 'react-router-dom'
import { WEDDING_CONFIG } from '../weddingConfig'
import GuestNameModal from '../components/GuestNameModal'

const formattedDate = new Date(WEDDING_CONFIG.weddingDate).toLocaleDateString('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const [nameBefore, nameAfter] = WEDDING_CONFIG.coupleNames.split('&').map((part) => part.trim())

export default function WelcomePage() {
  return (
    <main className="welcome-screen">
      <div className="welcome-card">
        <p className="welcome-eyebrow">Bienvenido/a a nuestra boda</p>
        <h1 className="welcome-names">
          {nameBefore} <span className="welcome-amp">&amp;</span> {nameAfter}
        </h1>
        <p className="welcome-date">{formattedDate}</p>
        <p className="welcome-message">{WEDDING_CONFIG.welcomeMessage}</p>

        <div className="welcome-actions">
          <Link to="/subir/foto" className="btn btn-primary">
            Subir foto
          </Link>
          <Link to="/subir/video" className="btn btn-secondary">
            Subir vídeo
          </Link>
        </div>

        <Link to="/galeria" className="welcome-gallery-link">
          Ver la galería →
        </Link>

        <Link to="/admin/login" className="welcome-admin-link">
          Acceso admin
        </Link>
      </div>
      <GuestNameModal />
    </main>
  )
}
