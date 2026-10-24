import pool, { query } from '../config/database.js'

const PHONE_REGEX = /^8 \(\d{3}\) \d{3}-\d{2}-\d{2}$/

export const createOrder = async (req, res, next) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { items, delivery_address, phone } = req.body
    const userId = req.user.id

    if (!Array.isArray(items) || items.length === 0) {
      await client.query('ROLLBACK')
      return res.status(400).json({ message: 'Корзина пуста' })
    }

    if (!delivery_address?.trim()) {
      await client.query('ROLLBACK')
      return res.status(400).json({ message: 'Укажите адрес доставки' })
    }

    if (!phone || !PHONE_REGEX.test(String(phone).trim())) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        message: 'Некорректный номер телефона. Формат: 8 (918) 999-99-99'
      })
    }

    let orderTotal = 0
    const resolvedItems = []

    for (const item of items) {
      const productId = Number(item.product_id)
      const quantity = Number(item.quantity)

      if (!Number.isInteger(productId) || productId < 1) {
        await client.query('ROLLBACK')
        return res.status(400).json({ message: 'Некорректный товар в заказе' })
      }

      if (!Number.isInteger(quantity) || quantity < 1) {
        await client.query('ROLLBACK')
        return res.status(400).json({ message: 'Количество должно быть не меньше 1' })
      }

      const productResult = await client.query(
        `SELECT id, name, price, stock, is_active
         FROM products WHERE id = $1 FOR UPDATE`,
        [productId]
      )

      if (productResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return res.status(404).json({ message: `Товар #${productId} не найден` })
      }

      const product = productResult.rows[0]

      if (product.is_active === false) {
        await client.query('ROLLBACK')
        return res.status(400).json({
          message: `Товар «${product.name}» недоступен для заказа`
        })
      }

      if (product.stock < quantity) {
        await client.query('ROLLBACK')
        return res.status(400).json({
          message: `Недостаточно товара «${product.name}». В наличии: ${product.stock}`
        })
      }

      const price = Number(product.price)
      orderTotal += price * quantity
      resolvedItems.push({
        product_id: product.id,
        quantity,
        price,
        name: product.name
      })
    }

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total, delivery_address, phone, status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING id`,
      [userId, orderTotal, delivery_address.trim(), phone.trim()]
    )
    const orderId = orderResult.rows[0].id

    for (const item of resolvedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.quantity, item.price]
      )

      const stockUpdate = await client.query(
        `UPDATE products SET stock = stock - $1
         WHERE id = $2 AND stock >= $1
         RETURNING id`,
        [item.quantity, item.product_id]
      )

      if (stockUpdate.rows.length === 0) {
        await client.query('ROLLBACK')
        return res.status(400).json({
          message: `Недостаточно товара «${item.name}»`
        })
      }
    }

    await client.query('COMMIT')
    res.status(201).json({ id: orderId, total: orderTotal, message: 'Заказ создан' })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
}

const ordersWithItemsSql = (whereClause) => `
  SELECT o.*,
    COALESCE(
      json_agg(
        json_build_object(
          'product_id', oi.product_id,
          'quantity', oi.quantity,
          'price', oi.price,
          'product_name', p.name
        )
      ) FILTER (WHERE oi.id IS NOT NULL),
      '[]'::json
    ) as items
  FROM orders o
  LEFT JOIN order_items oi ON o.id = oi.order_id
  LEFT JOIN products p ON oi.product_id = p.id
  ${whereClause}
  GROUP BY o.id
  ORDER BY o.created_at DESC
`

/** Заказы текущего пользователя (для профиля) */
export const getMyOrders = async (req, res, next) => {
  try {
    const result = await query(
      ordersWithItemsSql('WHERE o.user_id = $1'),
      [req.user.id]
    )
    res.json(result.rows)
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
          COALESCE(
            json_agg(
              json_build_object(
                'product_id', oi.product_id,
                'quantity', oi.quantity,
                'price', oi.price,
                'product_name', p.name
              )
            ) FILTER (WHERE oi.id IS NOT NULL),
            '[]'::json
          ) as items
        FROM orders o
        JOIN users u ON o.user_id = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        GROUP BY o.id, u.name, u.phone
        ORDER BY o.created_at DESC
      `
      params = []
    } else {
      sql = ordersWithItemsSql('WHERE o.user_id = $1')
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
