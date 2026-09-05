import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Базовая директория для загрузок (относительно backend/src/)
const UPLOAD_BASE = path.join(__dirname, '../../uploads')

// Создаём директории если их нет
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

// === Конфигурация хранилища ===
const createStorage = (subfolder) => {
  const destPath = path.join(UPLOAD_BASE, subfolder)
  ensureDir(destPath)

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destPath)
    },
    filename: (req, file, cb) => {
      // Уникальное имя: timestamp + случайное число + оригинальное расширение
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
      const ext = path.extname(file.originalname).toLowerCase()
      cb(null, `${subfolder}-${uniqueSuffix}${ext}`)
    }
  })
}

// === Валидация типов файлов ===
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
]

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
]

const imageFileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`Недопустимый тип файла: ${file.mimetype}. Разрешены: JPEG, PNG, WebP, GIF`), false)
  }
}

const documentFileFilter = (req, file, cb) => {
  if ([...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES].includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`Недопустимый тип файла: ${file.mimetype}`), false)
  }
}

// === Лимиты ===
const imageLimits = {
  fileSize: 5 * 1024 * 1024, // 5 MB
  files: 5
}

const documentLimits = {
  fileSize: 10 * 1024 * 1024, // 10 MB
  files: 3
}

// === Экспортируемые middleware ===

// Загрузка одного изображения товара
export const uploadProductImage = multer({
  storage: createStorage('products'),
  fileFilter: imageFileFilter,
  limits: imageLimits
}).single('image')

// Загрузка нескольких изображений товара
export const uploadProductImages = multer({
  storage: createStorage('products'),
  fileFilter: imageFileFilter,
  limits: imageLimits
}).array('images', 5)

// Загрузка изображения оборудования для аренды
export const uploadRentImage = multer({
  storage: createStorage('rent'),
  fileFilter: imageFileFilter,
  limits: imageLimits
}).single('image')

// Загрузка документов (договоры, спецификации)
export const uploadDocument = multer({
  storage: createStorage('documents'),
  fileFilter: documentFileFilter,
  limits: documentLimits
}).single('document')

// === Обработчик ошибок multer ===
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    let message = 'Ошибка загрузки файла'
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'Файл слишком большой. Максимальный размер: 5 МБ для изображений, 10 МБ для документов'
        break
      case 'LIMIT_FILE_COUNT':
        message = 'Превышено максимальное количество файлов'
        break
      case 'LIMIT_UNEXPECTED_FILE':
        message = `Неожиданное поле файла: ${err.field}`
        break
    }
    return res.status(400).json({ message })
  }

  if (err) {
    return res.status(400).json({ message: err.message })
  }

  next()
}

// === Утилита удаления файла ===
export const deleteFile = (filePath) => {
  return new Promise((resolve) => {
    const fullPath = path.join(UPLOAD_BASE, filePath.replace('/uploads/', ''))
    fs.unlink(fullPath, (err) => {
      if (err) {
        console.error(`Ошибка удаления файла ${fullPath}:`, err.message)
        resolve(false)
      } else {
        resolve(true)
      }
    })
  })
}

// === Утилита получения URL файла ===
export const getFileUrl = (filename, subfolder) => {
  return `/uploads/${subfolder}/${filename}`
}

export default uploadProductImage