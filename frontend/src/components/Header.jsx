import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import logoPng from '../assets/logo.png'
import './Header.css'

function Header() {
  const { totalItems } = useCart()
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  const handleLogout = () => {
    closeMenu()
    logout()
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="site-header__brand" onClick={closeMenu}>
          <img src={logoPng} alt="Юг Белора Металл" className="site-header__logo" />
        </Link>

        {menuOpen && (
          <button type="button" className="site-header__overlay" aria-label="Закрыть меню" onClick={closeMenu} />
        )}

        <nav className={`site-header__nav ${menuOpen ? 'is-open' : ''}`}>
          <Link to="/catalog" className="nav-link" onClick={closeMenu}>Каталог</Link>
          <Link to="/rent" className="nav-link" onClick={closeMenu}>Аренда</Link>
          <Link to="/contacts" className="nav-link" onClick={closeMenu}>Контакты</Link>

          {isAdmin && (
            <Link to="/admin" className="nav-link" style={{ color: 'var(--color-accent)' }} onClick={closeMenu}>
              Админ
            </Link>
          )}

          {user ? (
            <div className="site-header__nav-user">
              <Link to="/profile" className="nav-link" onClick={closeMenu}>
                {user.name}
              </Link>
              <button type="button" onClick={handleLogout} className="btn btn-secondary site-header__logout">
                Выйти
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary site-header__login" onClick={closeMenu}>
              Войти
            </Link>
          )}
        </nav>

        <div className="site-header__actions">
          {user && (
            <Link to="/cart" className="site-header__cart" aria-label="Корзина">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6h15l-1.5 9h-12z" />
                <circle cx="9" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
                <path d="M6 6L5 3H2" />
              </svg>
              {totalItems > 0 && (
                <span className="site-header__badge">{totalItems}</span>
              )}
            </Link>
          )}

          <button
            type="button"
            className="site-header__menu-btn"
            aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(open => !open)}
          >
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
