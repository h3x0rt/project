import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

// === Проверка обязательных переменных ===
const required = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD']
const missing = required.filter(key => !process.env[key])

if (missing.length > 0) {
  console.error('❌ Отсутствуют переменные окружения:', missing.join(', '))
  console.error('   Проверьте файл backend/.env')
  process.exit(1)
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD), // явно приводим к строке
})

pool.on('connect', () => {
  console.log('✅ Подключение к PostgreSQL установлено')
})

pool.on('error', (err) => {
  console.error('❌ Ошибка пула PostgreSQL:', err.message)
  process.exit(-1)
})

export const query = (text, params) => pool.query(text, params)
export default pool