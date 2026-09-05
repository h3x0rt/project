import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import api from '../api/axios'

function Cart() {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleOrder = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (!address.trim() || !phone.trim()) {
      alert('Заполните адрес и телефон')
      return
    }
    try {
      setSubmitting(true)
      await api.post('/orders', {
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        total: totalPrice,
        delivery_address: address,
        phone
      })
      clearCart()
      alert('Заказ оформлен!')
    } catch (err) {
      alert('Ошибка оформления заказа')
    } finally {
      setSubmitting(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="container" style={{ paddingTop: '60px', textAlign: 'center' }}>
        <h1 className="section-title">Корзина пуста</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
          Добавьте товары из каталога
        </p>
        <button onClick={() => navigate('/catalog')} className="btn btn-primary">
          Перейти в каталог
        </button>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px', maxWidth: '800px' }}>
      <h1 className="section-title">Корзина</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {cart.map(item => (
          <div key={item.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-md)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
              ) : (
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Нет фото</span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '15px', fontWeight: 500, marginBottom: '4px' }}>{item.name}</h4>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                {item.price.toLocaleString('ru-RU')} ₽/{item.unit}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '16px' }}
              >−</button>
              <span style={{ fontSize: '15px', fontWeight: 500, minWidth: '24px', textAlign: 'center' }}>
                {item.quantity}
              </span>
              <button 
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '16px' }}
              >+</button>
            </div>
            <div style={{ minWidth: '100px', textAlign: 'right', fontWeight: 600 }}>
              {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
            </div>
            <button 
              onClick={() => removeFromCart(item.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '4px'
              }}
            >×</button>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '16px' }}>Доставка</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input 
            type="text" 
            className="input" 
            placeholder="Адрес доставки" 
            value={address}
            onChange={e => setAddress(e.target.value)}
          />
          <input 
            type="tel" 
            className="input" 
            placeholder="Телефон" 
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '20px',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)'
      }}>
        <div>
          <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Итого:</div>
          <div style={{ fontSize: '24px', fontWeight: 600 }}>{totalPrice.toLocaleString('ru-RU')} ₽</div>
        </div>
        <button 
          onClick={handleOrder}
          disabled={submitting}
          className="btn btn-primary"
          style={{ padding: '14px 32px', fontSize: '15px' }}
        >
          {submitting ? 'Оформление...' : 'Оформить заказ'}
        </button>
      </div>
    </div>
  )
}

export default Cart