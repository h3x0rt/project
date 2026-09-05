import { Router } from 'express'
import { body } from 'express-validator'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { uploadRentImage, handleUploadError } from '../middleware/upload.js'

const router = Router()

// Получить всё оборудование для аренды
router.get('/equipment', async (req, res, next) => {
  try {
    const { query } = await import('../config/database.js')
    const result = await query(
      'SELECT * FROM rent_equipment WHERE is_available = true ORDER BY name'
    )
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
})

// Получить одно оборудование
router.get('/equipment/:id', async (req, res, next) => {
  try {
    const { query } = await import('../config/database.js')
    const result = await query('SELECT * FROM rent_equipment WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Оборудование не найдено' })
    }
    res.json(result.rows[0])
  } catch (err) {
    next(err)
  }
})

// Создать заявку на аренду (авторизованный пользователь)
router.post('/requests', authenticate, [
  body('equipment_id').isInt({ min: 1 }).withMessage('Укажите оборудование'),
  body('start_date').isISO8601().withMessage('Укажите дату начала'),
  body('end_date').isISO8601().withMessage('Укажите дату окончания')
], async (req, res, next) => {
  try {
    const { query } = await import('../config/database.js')
    const { equipment_id, start_date, end_date } = req.body
    const userId = req.user.id

    // Проверяем существование оборудования
    const equipResult = await query(
      'SELECT price_per_day, deposit, is_available FROM rent_equipment WHERE id = $1',
      [equipment_id]
    )
    if (equipResult.rows.length === 0) {
      return res.status(404).json({ message: 'Оборудование не найдено' })
    }
    const equip = equipResult.rows[0]
    if (!equip.is_available) {
      return res.status(400).json({ message: 'Оборудование недоступно для аренды' })
    }

    // Рассчитываем стоимость
    const start = new Date(start_date)
    const end = new Date(end_date)
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    if (days < 1) {
      return res.status(400).json({ message: 'Минимальный срок аренды — 1 день' })
    }
    const totalPrice = (equip.price_per_day * days) + Number(equip.deposit)

    const result = await query(
      `INSERT INTO rentals (user_id, equipment_id, start_date, end_date, total_price, status)
       VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
      [userId, equipment_id, start_date, end_date, totalPrice]
    )

    res.status(201).json({
      message: 'Заявка на аренду создана',
      rental: result.rows[0]
    })
  } catch (err) {
    next(err)
  }
})

// Получить заявки текущего пользователя
router.get('/my-rentals', authenticate, async (req, res, next) => {
  try {
    const { query } = await import('../config/database.js')
    const result = await query(
      `SELECT r.*, e.name as equipment_name, e.image_url 
       FROM rentals r
       JOIN rent_equipment e ON r.equipment_id = e.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.id]
    )
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
})

// Админ: получить все заявки на аренду
router.get('/admin/requests', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { query } = await import('../config/database.js')
    const result = await query(
      `SELECT r.*, u.name as user_name, u.phone, e.name as equipment_name
       FROM rentals r
       JOIN users u ON r.user_id = u.id
       JOIN rent_equipment e ON r.equipment_id = e.id
       ORDER BY r.created_at DESC`
    )
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
})

// Админ: обновить статус заявки на аренду
router.patch('/admin/requests/:id/status', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { query } = await import('../config/database.js')
    const { status } = req.body
    const validStatuses = ['pending', 'approved', 'active', 'completed', 'cancelled']
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Недопустимый статус' })
    }

    const result = await query(
      'UPDATE rentals SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    )
    res.json(result.rows[0])
  } catch (err) {
    next(err)
  }
})

// Админ: добавить оборудование
router.post('/equipment', authenticate, requireAdmin, uploadRentImage, handleUploadError, async (req, res, next) => {
  try {
    const { query } = await import('../config/database.js')
    const { name, description, price_per_day, deposit } = req.body
    const image_url = req.file ? `/uploads/rent/${req.file.filename}` : null

    const result = await query(
      `INSERT INTO rent_equipment (name, description, price_per_day, deposit, image_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description, price_per_day, deposit || 0, image_url]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    next(err)
  }
})

// Админ: удалить оборудование
router.delete('/equipment/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { query } = await import('../config/database.js')
    await query('DELETE FROM rent_equipment WHERE id = $1', [req.params.id])
    res.json({ message: 'Оборудование удалено' })
  } catch (err) {
    next(err)
  }
})

export default router