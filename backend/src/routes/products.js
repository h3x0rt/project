import { Router } from 'express'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { uploadProductImage, handleUploadError } from '../middleware/upload.js'
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js'

const router = Router()

// Публичные эндпоинты
router.get('/', getProducts)
router.get('/:id', getProductById)

// Админские эндпоинты (с загрузкой изображения)
router.post('/', authenticate, requireAdmin, uploadProductImage, handleUploadError, createProduct)
router.put('/:id', authenticate, requireAdmin, updateProduct)
router.delete('/:id', authenticate, requireAdmin, deleteProduct)

export default router