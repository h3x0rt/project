import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function ProductCard({ product }) {
  const { addToCart } = useCart()

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{
          aspectRatio: '4/3',
          backgroundColor: 'var(--color-surface-raised)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Нет фото</span>
          )}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--color-accent)', fontWeight: 500, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {product.category}
        </div>
        <h3 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px', lineHeight: 1.3 }}>
          {product.name}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px', lineHeight: 1.4 }}>
          {product.description?.substring(0, 80)}...
        </p>
      </Link>
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <span style={{ fontSize: '18px', fontWeight: 600 }}>
          {product.price.toLocaleString('ru-RU')} ₽
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 400, marginLeft: '4px' }}>
            /{product.unit}
          </span>
        </span>
        <button 
          onClick={() => addToCart(product)}
          className="btn btn-primary"
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          В корзину
        </button>
      </div>
    </div>
  )
}

export default ProductCard