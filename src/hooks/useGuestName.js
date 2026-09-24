import { useState } from 'react'

const GUEST_NAME_KEY = 'boda-jl-guest-name'

export function useGuestName() {
  const [guestName, setGuestNameState] = useState(() => localStorage.getItem(GUEST_NAME_KEY) || '')

  const setGuestName = (name) => {
    const trimmed = name.trim()
    localStorage.setItem(GUEST_NAME_KEY, trimmed)
    setGuestNameState(trimmed)
  }

  return { guestName, setGuestName }
}
