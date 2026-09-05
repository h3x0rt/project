import { Router } from 'express'
import { body } from 'express-validator'

const router = Router()

// Контактные данные организации (статичные, можно позже вынести в БД)
router.get('/', (req, res) => {
  res.json({
    company: 'ИП Ханикян Артур Андроникович',
    brand: 'Юг Белора Металл',
    phone: '+7 (XXX) XXX-XX-XX',      // Замените на реальный номер
    email: 'info@yugbelora.ru',       // Замените на реальный email
    address: 'г. Белореченск, ...',   // Замените на реальный адрес
    working_hours: {
      weekdays: '08:00 - 18:00',
      saturday: '09:00 - 15:00',
      sunday: 'Выходной'
    },
    social: {
      // telegram: '@yugbelora',
      // whatsapp: '+7XXXXXXXXXX'
    }
  })
})

// Отправка сообщения через форму обратной связи
router.post('/message', [
  body('name').trim().notEmpty().withMessage('Имя обязательно'),
  body('phone').trim().notEmpty().withMessage('Телефон обязателен'),
  body('email').optional().isEmail().normalizeEmail(),
  body('message').trim().notEmpty().withMessage('Сообщение обязательно')
], async (req, res, next) => {
  try {
    const { name, phone, email, message } = req.body
    
    // Здесь можно добавить:
    // 1. Сохранение в БД (таблица contact_messages)
    // 2. Отправку уведомления на email администратору
    // 3. Интеграцию с Telegram-ботом
    
    // Пример сохранения в БД (раскомментируйте при необходимости):
    /*
    const { query } = await import('../config/database.js')
    await query(
      `INSERT INTO contact_messages (name, phone, email, message)
       VALUES ($1, $2, $3, $4)`,
      [name, phone, email || null, message]
    )
    */

    res.status(201).json({ 
      message: 'Сообщение отправлено. Мы свяжемся с вами в ближайшее время.' 
    })
  } catch (err) {
    next(err)
  }
})

export default router