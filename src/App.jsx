import { WEDDING_CONFIG } from './weddingConfig'

const formattedDate = new Date(WEDDING_CONFIG.weddingDate).toLocaleDateString('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export default function App() {
  return (
    <main className="welcome-screen">
      <div className="welcome-card">
        <p className="welcome-eyebrow">Bienvenido/a a nuestra boda</p>
        <h1 className="welcome-names">{WEDDING_CONFIG.coupleNames}</h1>
        <p className="welcome-date">{formattedDate}</p>
        <p className="welcome-message">{WEDDING_CONFIG.welcomeMessage}</p>

        <div className="welcome-actions">
          <button type="button" className="btn btn-primary">
            Subir foto
          </button>
          <button type="button" className="btn btn-secondary">
            Subir vídeo
          </button>
        </div>

        <p className="welcome-footnote">
          Estructura inicial del proyecto — el login, la subida y la galería se conectarán en los
          siguientes pasos.
        </p>
      </div>
    </main>
  )
}
