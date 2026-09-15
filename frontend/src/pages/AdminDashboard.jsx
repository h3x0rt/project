import { useState, useEffect } from 'react'
import api from '../api/axios'

function AdminDashboard() {
  const [tab, setTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [rentals, setRentals] = useState([])
  const [products, setProducts] = useState([])

  useEffect(() => {
    if (tab === 'orders') api.get('/orders').then(res => setOrders(res.data))
    if (tab === 'rentals') api.get('/rent/admin/requests').then(res => setRentals(res.data))
    if (tab === 'products') api.get('/products').then(res => setProducts(res.data))
  }, [tab])

  const updateOrderStatus = async (id, status) => {
    await api.patch(`/orders/${id}/status`, { status })
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o))
  }

  const updateRentalStatus = async (id, status) => {
    await api.patch(`/rent/admin/requests/${id}/status`, { status })
    setRentals(rentals.map(r => r.id === id ? { ...r, status } : r))
  }

  const tabs = [
    { id: 'orders', label: 'Заказы' },
    { id: 'rentals', label: 'Аренда' },
    { id: 'products', label: 'Товары' },
  ]

  const statusLabels = {
    pending: 'Ожидает', confirmed: 'Подтверждён', processing: 'В обработке',
    shipped: 'Отправлен', delivered: 'Доставлен', cancelled: 'Отменён',
    approved: 'Одобрен', active: 'Активен', completed: 'Завершён'
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <h1 className="section-title">Админ-панель</h1>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={tab === t.id ? 'btn btn-primary' : 'btn btn-secondary'}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {orders.map(o => (
            <div key={o.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontWeight: 600 }}>Заказ #{o.id}</span>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>{o.user_name || 'Гость'} — {o.user_phone}</span>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                {o.items?.filter(i => i.product_name).map(i => `${i.product_name} ×${i.quantity}`).join(', ') || '—'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <span style={{ fontWeight: 600 }}>{Number(o.total).toLocaleString('ru-RU')} ₽</span>
                <select 
                  value={o.status} 
                  onChange={e => updateOrderStatus(o.id, e.target.value)} 
                  className="input" 
                  style={{ width: 'auto', padding: '8px 12px', fontSize: '13px' }}
                >
                  {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                    <option key={s} value={s}>{statusLabels[s] || s}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'rentals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {rentals.map(r => (
            <div key={r.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontWeight: 600 }}>{r.equipment_name}</span>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>{r.user_name} — {r.phone}</span>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                {new Date(r.start_date).toLocaleDateString('ru-RU')} — {new Date(r.end_date).toLocaleDateString('ru-RU')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <span style={{ fontWeight: 600 }}>{Number(r.total_price).toLocaleString('ru-RU')} ₽</span>
                <select 
                  value={r.status} 
                  onChange={e => updateRentalStatus(r.id, e.target.value)} 
                  className="input" 
                  style={{ width: 'auto', padding: '8px 12px', fontSize: '13px' }}
                >
                  {['pending', 'approved', 'active', 'completed', 'cancelled'].map(s => (
                    <option key={s} value={s}>{statusLabels[s] || s}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'products' && (
        <div className="grid-products">
          {products.map(p => (
            <div key={p.id} className="card">
              <h4 style={{ marginBottom: '8px', fontSize: '16px' }}>{p.name}</h4>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                {p.stock} {p.unit} в наличии
              </p>
              <span style={{ fontWeight: 600, fontSize: '18px' }}>{p.price.toLocaleString('ru-RU')} ₽</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminDashboard