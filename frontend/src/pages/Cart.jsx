import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../api/axios'
import { formatPhone, isValidPhone, PHONE_FORMAT_HINT } from '../utils/phone'

function Cart() {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [qtyDrafts, setQtyDrafts] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.phone) {
      setPhone(formatPhone(user.phone))
    }
  }, [user?.phone])

  useEffect(() => {
    setQtyDrafts(Object.fromEntries(cart.map(item => [item.id, String(item.quantity)])))
  }, [cart])

  const commitQuantity = (itemId, rawValue) => {
    const parsed = parseInt(String(rawValue).replace(/\D/g, ''), 10)
    if (!Number.isFinite(parsed) || parsed < 1) {
      const item = cart.find(i => i.id === itemId)
      setQtyDrafts(prev => ({ ...prev, [itemId]: String(item?.quantity || 1) }))
      return
    }
    updateQuantity(itemId, parsed)
  }

  const handleOrder = async () => {
    if (!address.trim()) {
      setError('Укажите адрес доставки')
      return
    }
    if (!isValidPhone(phone)) {
      setError(`Телефон в формате: ${PHONE_FORMAT_HINT}`)
      return
    }

    const overStock = cart.find(item =>
      item.stock !== undefined && item.stock !== null && item.quantity > item.stock
    )
    if (overStock) {
      setError(`Недостаточно «${overStock.name}». В наличии: ${overStock.stock}`)
      return
    }

    try {
      setSubmitting(true)
      setError('')
      await api.post('/orders', {
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        delivery_address: address,
        phone: phone.trim()
      })
      clearCart()
      alert('Заказ оформлен!')
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка оформления заказа')
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
        {cart.map(item => {
          const atMax = item.stock !== undefined && item.stock !== null && item.quantity >= item.stock
          return (
            <div key={item.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
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
              <div style={{ flex: 1, minWidth: '140px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 500, marginBottom: '4px' }}>{item.name}</h4>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  {item.price.toLocaleString('ru-RU')} ₽/{item.unit}
                  {item.stock !== undefined && item.stock !== null && (
                    <span style={{ marginLeft: 8 }}>· в наличии {item.stock}</span>
                  )}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '16px' }}
                >−</button>
                <input
                  type="number"
                  min="1"
                  max={item.stock ?? undefined}
                  className="input"
                  value={qtyDrafts[item.id] ?? item.quantity}
                  onChange={e => setQtyDrafts(prev => ({ ...prev, [item.id]: e.target.value }))}
                  onBlur={e => commitQuantity(item.id, e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.target.blur()
                    }
                  }}
                  style={{
                    width: '64px',
                    padding: '6px 8px',
                    textAlign: 'center',
                    fontSize: '15px',
                    fontWeight: 500
                  }}
                  aria-label={`Количество ${item.name}`}
                />
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '16px' }}
                  disabled={atMax}
                  title={atMax ? 'Больше нет в наличии' : undefined}
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
          )
        })}
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
            placeholder={PHONE_FORMAT_HINT}
            value={phone}
            onChange={e => setPhone(formatPhone(e.target.value))}
            inputMode="numeric"
            autoComplete="tel"
          />
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            Подставлен телефон из профиля. Можно изменить. Формат: {PHONE_FORMAT_HINT}
          </span>
        </div>
      </div>

      {error && (
        <div style={{
          marginBottom: '16px',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          color: 'var(--color-danger)',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

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
