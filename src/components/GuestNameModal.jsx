import { useState } from 'react'
import { useGuestName } from '../hooks/useGuestName'

const SEEN_KEY = 'boda-jl-name-prompt-seen'

export default function GuestNameModal() {
  const { guestName, setGuestName } = useGuestName()
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(SEEN_KEY) === '1')
  const [value, setValue] = useState('')

  if (dismissed || guestName) return null

  const close = () => {
    sessionStorage.setItem(SEEN_KEY, '1')
    setDismissed(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (value.trim()) setGuestName(value)
    close()
  }

  return (
    <div className="media-modal-backdrop">
      <form className="name-modal" onSubmit={handleSubmit}>
        <h2>¿Cómo te llamas?</h2>
        <p>Así sabremos quién compartió cada foto. Es opcional.</p>
        <input
          type="text"
          placeholder="Tu nombre"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
        <div className="name-modal-actions">
          <button type="button" className="btn btn-secondary" onClick={close}>
            Prefiero no decirlo
          </button>
          <button type="submit" className="btn btn-primary">
            Continuar
          </button>
        </div>
      </form>
    </div>
  )
}
