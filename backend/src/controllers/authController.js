import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '../config/database.js'

export const register = async (req, res, next) => {
  try {
    const { email, password, name, phone } = req.body
    const existing = await query('SELECT id FROM users WHERE email = $1', [email])
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Пользователь уже существует' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const result = await query(
      `INSERT INTO users (email, password_hash, name, phone, role) 
       VALUES ($1, $2, $3, $4, 'client') RETURNING id, email, name, role`,
      [email, hashedPassword, name, phone]
    )

    const user = result.rows[0]
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    res.status(201).json({ token, user })
  } catch (err) {
    next(err)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const result = await query(
      'SELECT id, email, name, password_hash, role FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Неверные данные' })
    }

    const user = result.rows[0]
    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      return res.status(401).json({ message: 'Неверные данные' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    })
  } catch (err) {
    next(err)
  }
}

export const getProfile = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, email, name, phone, role FROM users WHERE id = $1',
      [req.user.id]
    )
    res.json(result.rows[0])
  } catch (err) {
    next(err)
  }
}