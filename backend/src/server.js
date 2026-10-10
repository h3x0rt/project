import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import path from 'path'
import { fileURLToPath } from 'url'

import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'
import rentRoutes from './routes/rent.js'
import contactRoutes from './routes/contacts.js'
import { query } from './config/database.js'
import errorHandler from './middleware/errorHandler.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/rent', rentRoutes)
app.use('/api/contacts', contactRoutes)

app.get('/api/health', async (req, res, next) => {
  try {
    await query('SELECT 1')
    res.json({
      status: 'ok',
      database: 'ok',
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    err.status = 503
    next(err)
  }
})

app.use((req, res) => {
  res.status(404).json({ message: 'Маршрут не найден' })
})

app.use(errorHandler)

const server = app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`)
})

const shutdown = signal => {
  console.log(`Получен ${signal}. Завершение работы...`)

  server.close(() => {
    console.log('HTTP-сервер остановлен')
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
