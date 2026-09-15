import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import api from '../api/axios'

function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="container" style={{ paddingTop: '60px', textAlign: 'center' }}>Загрузка...</div>
  if (!product) return <div className="container" style={{ paddingTop: '60px' }}>Товар не найден</div>

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px', maxWidth: '900px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
        <div style={{
          aspectRatio: '4/3',
          backgroundColor: 'var(--color-surface-raised)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ color: 'var(--color-text-muted)' }}>Нет фото</span>
          )}
        </div>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--color-accent)', textTransform: 'uppercase', fontWeight: 500, marginBottom: '8px' }}>
            {product.category}
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '16px' }}>{product.name}</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
            {product.description}
          </p>
          <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '24px' }}>
            {product.price.toLocaleString('ru-RU')} ₽
            <span style={{ fontSize: '16px', color: 'var(--color-text-muted)', fontWeight: 400 }}>/{product.unit}</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={() => { addToCart(product); navigate('/cart') }} className="btn btn-primary" style={{ padding: '14px 32px' }}>
              В корзину
            </button>
            <button onClick={() => addToCart(product)} className="btn btn-secondary" style={{ padding: '14px 32px' }}>
              Добавить и продолжить
            </button>
          </div>
          <div style={{ marginTop: '24px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            В наличии: {product.stock} {product.unit}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail