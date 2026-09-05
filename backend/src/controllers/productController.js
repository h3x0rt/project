import { query } from '../config/database.js'

export const getProducts = async (req, res, next) => {
  try {
    const { category, search, min_price, max_price, in_stock } = req.query
    let sql = 'SELECT * FROM products WHERE 1=1'
    const params = []
    let paramIndex = 1

    if (category && category !== 'all') {
      sql += ` AND category = $${paramIndex++}`
      params.push(category)
    }
    if (search) {
      sql += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }
    if (min_price) {
      sql += ` AND price >= $${paramIndex++}`
      params.push(min_price)
    }
    if (max_price) {
      sql += ` AND price <= $${paramIndex++}`
      params.push(max_price)
    }
    if (in_stock === 'true') {
      sql += ' AND stock > 0'
    }

    sql += ' ORDER BY created_at DESC'
    const result = await query(sql, params)
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

export const getProductById = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM products WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Товар не найден' })
    }
    res.json(result.rows[0])
  } catch (err) {
    next(err)
  }
}

export const createProduct = async (req, res, next) => {
  try {
    const { name, category, price, stock, description, unit } = req.body
    const image_url = req.file ? `/uploads/products/${req.file.filename}` : null
    
    const result = await query(
      `INSERT INTO products (name, category, price, stock, description, unit, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, category, price, stock, description, unit, image_url]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    next(err)
  }
}

export const updateProduct = async (req, res, next) => {
  try {
    const { name, category, price, stock, description, unit } = req.body
    const result = await query(
      `UPDATE products SET name=$1, category=$2, price=$3, stock=$4, 
       description=$5, unit=$6, updated_at=NOW() WHERE id=$7 RETURNING *`,
      [name, category, price, stock, description, unit, req.params.id]
    )
    res.json(result.rows[0])
  } catch (err) {
    next(err)
  }
}

export const deleteProduct = async (req, res, next) => {
  try {
    await query('DELETE FROM products WHERE id = $1', [req.params.id])
    res.json({ message: 'Товар удалён' })
  } catch (err) {
    next(err)
  }
}