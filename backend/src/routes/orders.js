import { Router } from 'express'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { createOrder, getOrders, updateOrderStatus } from '../controllers/orderController.js'

const router = Router()

router.post('/', authenticate, createOrder)
router.get('/', authenticate, getOrders)
router.patch('/:id/status', authenticate, requireAdmin, updateOrderStatus)

export default router