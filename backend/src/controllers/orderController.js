import { query } from '../config/database.js'

export const createOrder = async (req, res, next) => {
  try {
    const { items, total, delivery_address, phone } = req.body
    const userId = req.user.id

    const client = await query('BEGIN')
    
    try {
      const orderResult = await query(
        `INSERT INTO orders (user_id, total, delivery_address, phone, status)
         VALUES ($1, $2, $3, $4, 'pending') RETURNING id`,
        [userId, total, delivery_address, phone]
      )
      const orderId = orderResult.rows[0].id

      for (const item of items) {
        await query(
          `INSERT INTO order_items (order_id, product_id, quantity, price)
           VALUES ($1, $2, $3, $4)`,
          [orderId, item.product_id, item.quantity, item.price]
        )
        
        await query(
          'UPDATE products SET stock = stock - $1 WHERE id = $2',
          [item.quantity, item.product_id]
        )
      }

      await query('COMMIT')
      res.status(201).json({ id: orderId, message: 'Заказ создан' })
    } catch (err) {
      await query('ROLLBACK')
      throw err
    }
  } catch (err) {
    next(err)
  }
}

export const getOrders = async (req, res, next) => {
  try {
    let sql, params
    
    if (req.user.role === 'admin') {
      sql = `
        SELECT o.*, u.name as user_name, u.phone as user_phone,
          json_agg(json_build_object(
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'price', oi.price,
            'product_name', p.name
          )) as items
        FROM orders o
        JOIN users u ON o.user_id = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        GROUP BY o.id, u.name, u.phone
        ORDER BY o.created_at DESC
      `
      params = []
    } else {
      sql = `
        SELECT o.*,
          json_agg(json_build_object(
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'price', oi.price,
            'product_name', p.name
          )) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.user_id = $1
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `
      params = [req.user.id]
    }

    const result = await query(sql, params)
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    const result = await query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    )
    res.json(result.rows[0])
  } catch (err) {
    next(err)
  }
}