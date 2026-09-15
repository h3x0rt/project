import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function Rent() {
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/rent/equipment').then(res => {
      setEquipment(res.data)
      setLoading(false)
    })
  }, [])

  const handleRent = async (item) => {
    if (!user) {
      navigate('/login')
      return
    }
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    const start = prompt('Дата начала (YYYY-MM-DD):', today)
    const end = prompt('Дата окончания (YYYY-MM-DD):', tomorrow)
    if (!start || !end) return
    try {
      await api.post('/rent/requests', { equipment_id: item.id, start_date: start, end_date: end })
      alert('Заявка на аренду создана! Ожидайте подтверждения.')
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка при создании заявки')
    }
  }

  if (loading) return <div className="container" style={{ paddingTop: '60px', textAlign: 'center' }}>Загрузка...</div>

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <h1 className="section-title">Аренда оборудования</h1>
      <div className="grid-products">
        {equipment.map(item => (
          <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ aspectRatio: '4/3', backgroundColor: 'var(--color-surface-raised)', borderRadius: 'var(--radius-md)', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Нет фото</span>
              )}
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>{item.name}</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px', flex: 1 }}>{item.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: 600 }}>{item.price_per_day.toLocaleString('ru-RU')} ₽/день</span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Залог: {Number(item.deposit).toLocaleString('ru-RU')} ₽</span>
            </div>
            <button onClick={() => handleRent(item)} className="btn btn-primary" style={{ width: '100%' }}>
              Арендовать
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Rent