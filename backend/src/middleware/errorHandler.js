export default (err, req, res, next) => {
  console.error(err.stack)
  
  if (err.code === '23505') {
    return res.status(409).json({ message: 'Запись уже существует' })
  }
  if (err.code === '23503') {
    return res.status(400).json({ message: 'Нарушение внешнего ключа' })
  }
  
  res.status(err.status || 500).json({
    message: err.message || 'Внутренняя ошибка сервера',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}