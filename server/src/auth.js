import jwt from 'jsonwebtoken'

export const ADMIN_COOKIE = 'boda_admin_session'

function getSecret() {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error('Falta SESSION_SECRET en el .env del servidor')
  }
  return secret
}

export function signAdminToken(email) {
  return jwt.sign({ email }, getSecret(), { expiresIn: '12h' })
}

export function verifyAdminToken(token) {
  try {
    jwt.verify(token, getSecret())
    return true
  } catch {
    return false
  }
}

export function requireAdmin(req, res, next) {
  const token = req.cookies?.[ADMIN_COOKIE]
  if (!token || !verifyAdminToken(token)) {
    return res.status(401).json({ error: 'No autenticado como admin' })
  }
  next()
}
