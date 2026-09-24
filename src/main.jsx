import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/global.css'

const REQUIRED_ENV_KEYS = [
  'VITE_FIREBASE_PHOTOS_API_KEY',
  'VITE_FIREBASE_PHOTOS_AUTH_DOMAIN',
  'VITE_FIREBASE_PHOTOS_PROJECT_ID',
  'VITE_FIREBASE_PHOTOS_STORAGE_BUCKET',
  'VITE_FIREBASE_PHOTOS_APP_ID',
  'VITE_FIREBASE_VIDEOS_API_KEY',
  'VITE_FIREBASE_VIDEOS_AUTH_DOMAIN',
  'VITE_FIREBASE_VIDEOS_PROJECT_ID',
  'VITE_FIREBASE_VIDEOS_STORAGE_BUCKET',
  'VITE_FIREBASE_VIDEOS_APP_ID',
]

const missingKeys = REQUIRED_ENV_KEYS.filter((key) => !import.meta.env[key])

const root = ReactDOM.createRoot(document.getElementById('root'))

if (missingKeys.length > 0) {
  // Los módulos de firebase/* lanzan un error en cuanto se inicializan con
  // credenciales vacías, así que evitamos importarlos hasta tener un .env real.
  import('./components/EnvSetupNotice.jsx').then(({ default: EnvSetupNotice }) => {
    root.render(
      <React.StrictMode>
        <EnvSetupNotice missingKeys={missingKeys} />
      </React.StrictMode>
    )
  })
} else {
  Promise.all([import('react-router-dom'), import('./App.jsx'), import('./context/AuthContext.jsx')]).then(
    ([{ BrowserRouter }, { default: App }, { AuthProvider }]) => {
      root.render(
        <React.StrictMode>
          <BrowserRouter>
            <AuthProvider>
              <App />
            </AuthProvider>
          </BrowserRouter>
        </React.StrictMode>
      )
    }
  )
}
