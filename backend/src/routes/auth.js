import { Router } from 'express'
import { body } from 'express-validator'
import { register, login, getProfile } from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// Регистрация с валидацией
router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Введите корректный email'),
  body('password').isLength({ min: 6 }).withMessage('Пароль минимум 6 символов'),
  body('name').trim().notEmpty().withMessage('Имя обязательно'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Телефон обязателен')
    .matches(/^8 \(\d{3}\) \d{3}-\d{2}-\d{2}$/)
    .withMessage('Телефон в формате: 8 (918) 999-99-99')
], register)

// Вход
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], login)

// Профиль (только для авторизованных)
router.get('/profile', authenticate, getProfile)

export default router