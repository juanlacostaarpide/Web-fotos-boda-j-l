import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'

export default function AdminLoginPage() {
  const { isAdmin, login } = useAdmin()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [errorMessage, setErrorMessage] = useState('')

  if (isAdmin) return <Navigate to="/admin" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')
    try {
      await login(email, password)
      navigate('/admin', { replace: true })
    } catch (err) {
      console.error(err)
      setErrorMessage(err.message || 'Email o contraseña incorrectos.')
      setStatus('error')
    }
  }

  return (
    <main className="upload-screen">
      <div className="upload-card">
        <Link to="/" className="back-link">
          ← Volver
        </Link>
        <h1 className="upload-title">Acceso admin</h1>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {errorMessage && <p className="form-error">{errorMessage}</p>}
          <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
            {status === 'loading' ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  )
}
