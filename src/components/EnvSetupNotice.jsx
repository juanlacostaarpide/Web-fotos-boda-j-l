// Se muestra cuando falta configurar las credenciales de Firebase en `.env`.
// A propósito no importa nada de `firebase/*` para poder renderizarse siempre,
// incluso antes de que el proyecto esté conectado a Firebase.
export default function EnvSetupNotice({ missingKeys }) {
  return (
    <main className="welcome-screen">
      <div className="welcome-card" style={{ textAlign: 'left' }}>
        <p className="welcome-eyebrow">Falta configuración</p>
        <h1 className="upload-title" style={{ fontSize: 30 }}>
          Configura tu .env
        </h1>
        <p className="welcome-message">
          Copia <code>.env.example</code> como <code>.env</code> y rellena las credenciales de tus
          dos proyectos Firebase (ver el README, sección 3).
        </p>
        <p className="form-hint" style={{ marginTop: 16 }}>
          Variables sin rellenar:
        </p>
        <ul style={{ fontSize: 13, color: 'var(--color-ink-soft)' }}>
          {missingKeys.map((key) => (
            <li key={key}>{key}</li>
          ))}
        </ul>
      </div>
    </main>
  )
}
