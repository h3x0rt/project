import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { formatPhone, isValidPhone, PHONE_FORMAT_HINT } from '../utils/phone'

function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '' })
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'phone' ? formatPhone(value) : value
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    if (isRegister && !isValidPhone(form.phone)) {
      setError(`Телефон в формате: ${PHONE_FORMAT_HINT}`)
      return
    }

    try {
      if (isRegister) {
        await api.post('/auth/register', form)
        await login(form.email, form.password)
      } else {
        await login(form.email, form.password)
      }
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Произошла ошибка')
    }
  }

  return (
    <div className="container" style={{ maxWidth: '420px', paddingTop: '80px' }}>
      <h1 className="section-title" style={{ textAlign: 'center' }}>
        {isRegister ? 'Регистрация' : 'Вход'}
      </h1>
      {error && (
        <div style={{ color: 'var(--color-danger)', marginBottom: '16px', textAlign: 'center', fontSize: '14px' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {isRegister && (
          <>
            <input name="name" className="input" placeholder="Имя" value={form.name} onChange={handleChange} required />
            <input
              name="phone"
              type="tel"
              className="input"
              placeholder={PHONE_FORMAT_HINT}
              value={form.phone}
              onChange={handleChange}
              required
              inputMode="numeric"
              autoComplete="tel"
            />
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '-8px' }}>
              Формат телефона: {PHONE_FORMAT_HINT}
            </span>
          </>
        )}
        <input name="email" type="email" className="input" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" className="input" placeholder="Пароль" value={form.password} onChange={handleChange} required minLength={6} />
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          {isRegister ? 'Зарегистрироваться' : 'Войти'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
        {isRegister ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister)
            setError('')
          }}
          style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontSize: '14px' }}
        >
          {isRegister ? 'Войти' : 'Зарегистрироваться'}
        </button>
      </p>
    </div>
  )
}

export default Login
