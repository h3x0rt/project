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
  body('phone').optional().trim()
], register)

// Вход
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], login)

// Профиль (только для авторизованных)
router.get('/profile', authenticate, getProfile)

export default router