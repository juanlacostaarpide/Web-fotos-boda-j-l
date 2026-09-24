// Genera el hash bcrypt de tu contraseña de admin para pegarlo en .env
// (ADMIN_PASSWORD_HASH). Uso:
//   node server/src/hashPassword.js "tu-contraseña"
import bcrypt from 'bcryptjs'

const password = process.argv[2]
if (!password) {
  console.error('Uso: node server/src/hashPassword.js "tu-contraseña"')
  process.exit(1)
}

console.log(bcrypt.hashSync(password, 10))
