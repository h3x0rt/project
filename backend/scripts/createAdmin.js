import bcrypt from 'bcryptjs'
import { query } from '../src/config/database.js'

const email = process.env.ADMIN_EMAIL || 'admin@yugbelora.ru'
const password = process.env.ADMIN_PASSWORD

if (!password) {
  console.error('❌ Укажите ADMIN_PASSWORD в переменных окружения')
  process.exit(1)
}

const hash = await bcrypt.hash(password, 12)

try {
  await query(
    `INSERT INTO users (email, password_hash, name, phone, role)
     VALUES ($1, $2, $3, $4, 'admin')
     ON CONFLICT (email) DO UPDATE SET password_hash = $2`,
    [email, hash, 'Администратор', '+7 (999) 999-99-99']
  )
  console.log(`✅ Админ ${email} создан / пароль обновлён`)
  process.exit(0)
} catch (err) {
  console.error('❌ Ошибка:', err.message)
  process.exit(1)
}