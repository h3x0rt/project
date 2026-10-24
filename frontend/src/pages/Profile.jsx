import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import './Profile.css'

const STATUS_LABELS = {
  pending: 'Ожидает',
  confirmed: 'Подтверждён',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
}

const ACTIVE_STATUSES = new Set(['pending', 'confirmed', 'processing', 'shipped'])

function Profile() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await api.get('/orders/my')
        if (!cancelled) setOrders(res.data)
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Не удалось загрузить заказы')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const activeOrders = orders.filter(o => ACTIVE_STATUSES.has(o.status))
  const historyOrders = orders.filter(o => !ACTIVE_STATUSES.has(o.status))

  const renderOrder = (order) => {
    const items = Array.isArray(order.items) ? order.items.filter(i => i.product_name) : []

    return (
      <div key={order.id} className="card profile-order-card">
        <div className="profile-order-top">
          <div>
            <div className="profile-order-id">Заказ #{order.id}</div>
            <div className="profile-order-date">
              {order.created_at
                ? new Date(order.created_at).toLocaleString('ru-RU')
                : ''}
            </div>
          </div>
          <span className={`profile-status ${order.status}`}>
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </div>

        {order.delivery_address && (
          <div className="profile-order-meta">Адрес: {order.delivery_address}</div>
        )}
        {order.phone && (
          <div className="profile-order-meta">Телефон: {order.phone}</div>
        )}

        {items.length > 0 && (
          <ul className="profile-order-items">
            {items.map((item, idx) => (
              <li key={`${order.id}-${item.product_id}-${idx}`}>
                {item.product_name} × {item.quantity}
                {item.price != null && (
                  <> — {Number(item.price).toLocaleString('ru-RU')} ₽</>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="profile-order-footer">
          <span className="profile-order-total">
            {Number(order.total).toLocaleString('ru-RU')} ₽
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="container profile-page">
      <h1 className="section-title">Личный кабинет</h1>

      <div className="profile-grid">
        <div className="card">
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Профиль</h2>
          <div className="profile-info-list">
            <div className="profile-info-row">
              <span>Имя</span>
              <span>{user?.name || '—'}</span>
            </div>
            <div className="profile-info-row">
              <span>Email</span>
              <span>{user?.email || '—'}</span>
            </div>
            <div className="profile-info-row">
              <span>Телефон</span>
              <span>{user?.phone || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="profile-error">{error}</div>}

      {loading ? (
        <p style={{ color: 'var(--color-text-secondary)' }}>Загрузка заказов…</p>
      ) : (
        <>
          <div style={{ marginBottom: 32 }}>
            <div className="profile-section-head">
              <h2>Текущие заказы</h2>
              <span>{activeOrders.length}</span>
            </div>
            {activeOrders.length === 0 ? (
              <div className="profile-empty">
                <p>Активных заказов нет</p>
                <Link to="/catalog" className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 13 }}>
                  Перейти в каталог
                </Link>
              </div>
            ) : (
              <div className="profile-orders">
                {activeOrders.map(renderOrder)}
              </div>
            )}
          </div>

          <div>
            <div className="profile-section-head">
              <h2>История заказов</h2>
              <span>{historyOrders.length}</span>
            </div>
            {historyOrders.length === 0 ? (
              <div className="profile-empty">
                <p>Здесь появятся доставленные и отменённые заказы</p>
              </div>
            ) : (
              <div className="profile-orders">
                {historyOrders.map(renderOrder)}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Profile
