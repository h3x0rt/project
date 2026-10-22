import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import './AdminDashboard.css'

const CATEGORIES = [
  { id: 'armatura', name: 'Арматура' },
  { id: 'profile-tubes', name: 'Профильные трубы' },
  { id: 'tubes', name: 'Трубы' },
  { id: 'profnastil', name: 'Профнастил' },
  { id: 'setka', name: 'Сетка' },
  { id: 'paint', name: 'Краска и растворители' },
  { id: 'fasteners', name: 'Крепёж' },
]

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
const RENTAL_STATUSES = ['pending', 'approved', 'active', 'completed', 'cancelled']

const STATUS_LABELS = {
  pending: 'Ожидает',
  confirmed: 'Подтверждён',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
  approved: 'Одобрен',
  active: 'Активен',
  completed: 'Завершён',
}

const emptyProduct = {
  name: '',
  category: 'armatura',
  price: '',
  stock: '0',
  description: '',
  unit: 'шт',
  is_active: true,
}

const emptyEquipment = {
  name: '',
  description: '',
  price_per_day: '',
  deposit: '0',
  is_available: true,
}

function imageSrc(url) {
  if (!url) return null
  if (url.startsWith('http')) return url
  return url
}

function toFormData(fields, file) {
  const fd = new FormData()
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    fd.append(key, typeof value === 'boolean' ? String(value) : value)
  })
  if (file) fd.append('image', file)
  return fd
}

function AdminDashboard() {
  const [tab, setTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [rentals, setRentals] = useState([])
  const [products, setProducts] = useState([])
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [productModal, setProductModal] = useState(null)
  const [productForm, setProductForm] = useState(emptyProduct)
  const [productFile, setProductFile] = useState(null)
  const [productPreview, setProductPreview] = useState(null)

  const [equipModal, setEquipModal] = useState(null)
  const [equipForm, setEquipForm] = useState(emptyEquipment)
  const [equipFile, setEquipFile] = useState(null)
  const [equipPreview, setEquipPreview] = useState(null)

  const loadTab = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      if (tab === 'orders') {
        const res = await api.get('/orders')
        setOrders(res.data)
      } else if (tab === 'rentals') {
        const res = await api.get('/rent/admin/requests')
        setRentals(res.data)
      } else if (tab === 'products') {
        const res = await api.get('/products')
        setProducts(res.data)
      } else if (tab === 'equipment') {
        const res = await api.get('/rent/admin/equipment')
        setEquipment(res.data)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось загрузить данные')
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => {
    loadTab()
  }, [loadTab])

  useEffect(() => {
    return () => {
      if (productPreview?.startsWith('blob:')) URL.revokeObjectURL(productPreview)
      if (equipPreview?.startsWith('blob:')) URL.revokeObjectURL(equipPreview)
    }
  }, [productPreview, equipPreview])

  const updateOrderStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status })
      setOrders(prev => prev.map(o => (o.id === id ? { ...o, status } : o)))
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось обновить статус заказа')
    }
  }

  const updateRentalStatus = async (id, status) => {
    try {
      await api.patch(`/rent/admin/requests/${id}/status`, { status })
      setRentals(prev => prev.map(r => (r.id === id ? { ...r, status } : r)))
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось обновить статус аренды')
    }
  }

  const openCreateProduct = () => {
    setProductForm(emptyProduct)
    setProductFile(null)
    setProductPreview(null)
    setProductModal('create')
  }

  const openEditProduct = (p) => {
    setProductForm({
      name: p.name || '',
      category: p.category || 'armatura',
      price: String(p.price ?? ''),
      stock: String(p.stock ?? 0),
      description: p.description || '',
      unit: p.unit || 'шт',
      is_active: p.is_active !== false,
    })
    setProductFile(null)
    setProductPreview(imageSrc(p.image_url))
    setProductModal(p)
  }

  const onProductFileChange = (e) => {
    const file = e.target.files?.[0]
    setProductFile(file || null)
    if (file) {
      setProductPreview(URL.createObjectURL(file))
    }
  }

  const saveProduct = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const fd = toFormData(productForm, productFile)
      if (productModal === 'create') {
        await api.post('/products', fd)
      } else {
        await api.put(`/products/${productModal.id}`, fd)
      }
      setProductModal(null)
      await loadTab()
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось сохранить товар')
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async (id) => {
    if (!confirm('Удалить этот товар?')) return
    try {
      await api.delete(`/products/${id}`)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось удалить товар')
    }
  }

  const openCreateEquip = () => {
    setEquipForm(emptyEquipment)
    setEquipFile(null)
    setEquipPreview(null)
    setEquipModal('create')
  }

  const openEditEquip = (item) => {
    setEquipForm({
      name: item.name || '',
      description: item.description || '',
      price_per_day: String(item.price_per_day ?? ''),
      deposit: String(item.deposit ?? 0),
      is_available: item.is_available !== false,
    })
    setEquipFile(null)
    setEquipPreview(imageSrc(item.image_url))
    setEquipModal(item)
  }

  const onEquipFileChange = (e) => {
    const file = e.target.files?.[0]
    setEquipFile(file || null)
    if (file) {
      setEquipPreview(URL.createObjectURL(file))
    }
  }

  const saveEquipment = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const fd = toFormData(equipForm, equipFile)
      if (equipModal === 'create') {
        await api.post('/rent/equipment', fd)
      } else {
        await api.put(`/rent/equipment/${equipModal.id}`, fd)
      }
      setEquipModal(null)
      await loadTab()
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось сохранить оборудование')
    } finally {
      setSaving(false)
    }
  }

  const deleteEquipment = async (id) => {
    if (!confirm('Удалить это оборудование?')) return
    try {
      await api.delete(`/rent/equipment/${id}`)
      setEquipment(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось удалить оборудование')
    }
  }

  const tabs = [
    { id: 'orders', label: 'Заказы' },
    { id: 'rentals', label: 'Заявки на аренду' },
    { id: 'products', label: 'Товары' },
    { id: 'equipment', label: 'Оборудование' },
  ]

  const categoryName = (id) => CATEGORIES.find(c => c.id === id)?.name || id

  return (
    <div className="container admin-page">
      <h1 className="section-title">Админ-панель</h1>

      <div className="admin-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={tab === t.id ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <div className="admin-error">{error}</div>}
      {loading && <p style={{ color: 'var(--color-text-secondary)' }}>Загрузка…</p>}

      {!loading && tab === 'orders' && (
        <div className="admin-list">
          {orders.length === 0 && <div className="admin-empty">Заказов пока нет</div>}
          {orders.map(o => (
            <div key={o.id} className="card">
              <div className="admin-card-header">
                <span style={{ fontWeight: 600 }}>Заказ #{o.id}</span>
                <span className="admin-card-meta" style={{ margin: 0 }}>
                  {o.created_at ? new Date(o.created_at).toLocaleString('ru-RU') : ''}
                </span>
              </div>
              <div className="admin-card-meta">
                {o.user_name || 'Клиент'} — {o.user_phone || o.phone}
              </div>
              {o.delivery_address && (
                <div className="admin-card-meta">Адрес: {o.delivery_address}</div>
              )}
              <div className="admin-card-meta">
                {o.items?.filter(i => i.product_name).map(i => `${i.product_name} ×${i.quantity}`).join(', ') || '—'}
              </div>
              <div className="admin-card-footer">
                <span style={{ fontWeight: 600 }}>{Number(o.total).toLocaleString('ru-RU')} ₽</span>
                <select
                  value={o.status}
                  onChange={e => updateOrderStatus(o.id, e.target.value)}
                  className="input admin-select"
                >
                  {ORDER_STATUSES.map(s => (
                    <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'rentals' && (
        <div className="admin-list">
          {rentals.length === 0 && <div className="admin-empty">Заявок на аренду пока нет</div>}
          {rentals.map(r => (
            <div key={r.id} className="card">
              <div className="admin-card-header">
                <span style={{ fontWeight: 600 }}>{r.equipment_name}</span>
                <span className="admin-card-meta" style={{ margin: 0 }}>Заявка #{r.id}</span>
              </div>
              <div className="admin-card-meta">
                {r.user_name} — {r.phone}
              </div>
              <div className="admin-card-meta">
                {new Date(r.start_date).toLocaleDateString('ru-RU')} — {new Date(r.end_date).toLocaleDateString('ru-RU')}
              </div>
              <div className="admin-card-footer">
                <span style={{ fontWeight: 600 }}>{Number(r.total_price).toLocaleString('ru-RU')} ₽</span>
                <select
                  value={r.status}
                  onChange={e => updateRentalStatus(r.id, e.target.value)}
                  className="input admin-select"
                >
                  {RENTAL_STATUSES.map(s => (
                    <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'products' && (
        <>
          <div className="admin-toolbar">
            <h2>Каталог товаров ({products.length})</h2>
            <button type="button" className="btn btn-primary btn-sm" onClick={openCreateProduct}>
              + Добавить товар
            </button>
          </div>
          {products.length === 0 && <div className="admin-empty">Товаров пока нет</div>}
          <div className="admin-grid">
            {products.map(p => (
              <div key={p.id} className="card admin-item-card">
                {p.image_url ? (
                  <img src={imageSrc(p.image_url)} alt={p.name} className="admin-item-thumb" />
                ) : (
                  <div className="admin-item-thumb placeholder">Нет фото</div>
                )}
                <div>
                  <h4 style={{ marginBottom: 6, fontSize: 16 }}>{p.name}</h4>
                  <div className="admin-card-meta" style={{ marginBottom: 4 }}>
                    {categoryName(p.category)} · {p.stock} {p.unit}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600 }}>{Number(p.price).toLocaleString('ru-RU')} ₽</span>
                    <span className={`admin-badge ${p.is_active === false ? 'muted' : 'success'}`}>
                      {p.is_active === false ? 'Скрыт' : 'Активен'}
                    </span>
                  </div>
                </div>
                <div className="admin-item-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => openEditProduct(p)}>
                    Изменить
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => deleteProduct(p.id)}>
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && tab === 'equipment' && (
        <>
          <div className="admin-toolbar">
            <h2>Оборудование для аренды ({equipment.length})</h2>
            <button type="button" className="btn btn-primary btn-sm" onClick={openCreateEquip}>
              + Добавить
            </button>
          </div>
          {equipment.length === 0 && <div className="admin-empty">Оборудование ещё не добавлено</div>}
          <div className="admin-grid">
            {equipment.map(item => (
              <div key={item.id} className="card admin-item-card">
                {item.image_url ? (
                  <img src={imageSrc(item.image_url)} alt={item.name} className="admin-item-thumb" />
                ) : (
                  <div className="admin-item-thumb placeholder">Нет фото</div>
                )}
                <div>
                  <h4 style={{ marginBottom: 6, fontSize: 16 }}>{item.name}</h4>
                  {item.description && (
                    <div className="admin-card-meta" style={{ marginBottom: 6 }}>
                      {item.description.length > 100
                        ? `${item.description.slice(0, 100)}…`
                        : item.description}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600 }}>
                      {Number(item.price_per_day).toLocaleString('ru-RU')} ₽/день
                    </span>
                    <span className="admin-card-meta" style={{ margin: 0 }}>
                      залог {Number(item.deposit || 0).toLocaleString('ru-RU')} ₽
                    </span>
                    <span className={`admin-badge ${item.is_available ? 'success' : 'muted'}`}>
                      {item.is_available ? 'Доступно' : 'Недоступно'}
                    </span>
                  </div>
                </div>
                <div className="admin-item-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => openEditEquip(item)}>
                    Изменить
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => deleteEquipment(item.id)}>
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {productModal && (
        <div className="admin-modal-backdrop" onClick={() => !saving && setProductModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>{productModal === 'create' ? 'Новый товар' : 'Редактирование товара'}</h3>
            <form className="admin-form" onSubmit={saveProduct}>
              <label>
                Название *
                <input
                  className="input"
                  required
                  value={productForm.name}
                  onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))}
                />
              </label>
              <div className="admin-form-row">
                <label>
                  Категория *
                  <select
                    className="input"
                    value={productForm.category}
                    onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Ед. измерения
                  <input
                    className="input"
                    value={productForm.unit}
                    onChange={e => setProductForm(f => ({ ...f, unit: e.target.value }))}
                  />
                </label>
              </div>
              <div className="admin-form-row">
                <label>
                  Цена, ₽ *
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))}
                  />
                </label>
                <label>
                  Остаток
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={e => setProductForm(f => ({ ...f, stock: e.target.value }))}
                  />
                </label>
              </div>
              <label>
                Описание
                <textarea
                  className="input"
                  value={productForm.description}
                  onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))}
                />
              </label>
              <label>
                Фото
                <input className="input" type="file" accept="image/*" onChange={onProductFileChange} />
              </label>
              {productPreview && (
                <img src={productPreview} alt="Превью" className="admin-preview" />
              )}
              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={productForm.is_active}
                  onChange={e => setProductForm(f => ({ ...f, is_active: e.target.checked }))}
                />
                Показывать в каталоге
              </label>
              <div className="admin-form-actions">
                <button type="button" className="btn btn-secondary" disabled={saving} onClick={() => setProductModal(null)}>
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Сохранение…' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {equipModal && (
        <div className="admin-modal-backdrop" onClick={() => !saving && setEquipModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>{equipModal === 'create' ? 'Новое оборудование' : 'Редактирование оборудования'}</h3>
            <form className="admin-form" onSubmit={saveEquipment}>
              <label>
                Название *
                <input
                  className="input"
                  required
                  value={equipForm.name}
                  onChange={e => setEquipForm(f => ({ ...f, name: e.target.value }))}
                />
              </label>
              <label>
                Описание
                <textarea
                  className="input"
                  value={equipForm.description}
                  onChange={e => setEquipForm(f => ({ ...f, description: e.target.value }))}
                />
              </label>
              <div className="admin-form-row">
                <label>
                  Цена за день, ₽ *
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={equipForm.price_per_day}
                    onChange={e => setEquipForm(f => ({ ...f, price_per_day: e.target.value }))}
                  />
                </label>
                <label>
                  Залог, ₽
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={equipForm.deposit}
                    onChange={e => setEquipForm(f => ({ ...f, deposit: e.target.value }))}
                  />
                </label>
              </div>
              <label>
                Фото
                <input className="input" type="file" accept="image/*" onChange={onEquipFileChange} />
              </label>
              {equipPreview && (
                <img src={equipPreview} alt="Превью" className="admin-preview" />
              )}
              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={equipForm.is_available}
                  onChange={e => setEquipForm(f => ({ ...f, is_available: e.target.checked }))}
                />
                Доступно для аренды
              </label>
              <div className="admin-form-actions">
                <button type="button" className="btn btn-secondary" disabled={saving} onClick={() => setEquipModal(null)}>
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Сохранение…' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
