import { useState } from 'react'
import api from '../api/axios'

function Contacts() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await api.post('/contacts/message', form)
      setSent(true)
      setForm({ name: '', phone: '', email: '', message: '' })
      setTimeout(() => setSent(false), 5000)
    } catch {
      alert('Ошибка отправки сообщения')
    }
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px', maxWidth: '700px' }}>
      <h1 className="section-title">Контакты</h1>
      
      <div className="card" style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>ИП Ханикян Артур Андроникович</h3>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '8px', fontSize: '14px' }}>Бренд: Юг Белора Металл</p>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '8px', fontSize: '14px' }}>Email: info@yugbelora.ru</p>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Режим работы: Пн–Пт 08:00–18:00, Сб 09:00–15:00</p>
      </div>

      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Напишите нам</h2>
      {sent && (
        <div style={{ color: 'var(--color-success)', marginBottom: '16px', padding: '12px', background: 'rgba(34,197,94,0.1)', borderRadius: 'var(--radius-md)' }}>
          Сообщение отправлено! Мы свяжемся с вами в ближайшее время.
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <input className="input" placeholder="Имя" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        <input className="input" placeholder="Телефон" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
        <input className="input" placeholder="Email (необязательно)" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        <textarea className="input" placeholder="Сообщение" rows={4} value={form.message} onChange={e => setForm({...form, message: e.target.value})} required />
        <button type="submit" className="btn btn-primary">Отправить</button>
      </form>
    </div>
  )
}

export default Contacts