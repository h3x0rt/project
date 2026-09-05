import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import logoPng from '../assets/logo.png'

function Header() {
  const { totalItems } = useCart()
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  return (
    <header style={{
      backgroundColor: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px'
      }}>
        <Link to="/" style={{
          fontSize: '20px',
          fontWeight: 600,
          color: 'var(--color-text)',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <img src={logoPng} style={{
            width: '100px',
            height: '64px'
          }}/>
        </Link>

        <nav style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          <Link to="/catalog" className="nav-link">Каталог</Link>
          <Link to="/rent" className="nav-link">Аренда</Link>
          <Link to="/contacts" className="nav-link">Контакты</Link>
          
          {isAdmin && (
            <Link to="/admin" className="nav-link" style={{ color: 'var(--color-accent)' }}>
              Админ
            </Link>
          )}

          <Link to="/cart" style={{
            position: 'relative',
            textDecoration: 'none',
            color: 'var(--color-text)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6h15l-1.5 9h-12z"/>
              <circle cx="9" cy="20" r="1"/>
              <circle cx="18" cy="20" r="1"/>
              <path d="M6 6L5 3H2"/>
            </svg>
            {totalItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: 'var(--color-accent)',
                color: 'white',
                fontSize: '11px',
                fontWeight: 600,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>{totalItems}</span>
            )}
          </Link>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                {user.name}
              </span>
              <button onClick={() => { logout(); navigate('/') }} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                Выйти
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }}>
              Войти
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header


// import Button from './Button/Button'
// import { useState } from 'react'

// function Header(){
//   const [content, setContent] = useState('Нажатия на кнопку не было!')
//   const [time, setTime] = useState(new Date())

//   setInterval(() => setTime(new Date()), 1000)
//   function handleClick(type){
//     setContent(type)
//   }
//   return(
//     <header>
//       <span> Время: {time.toLocaleTimeString()}</span>
//       <div>
//         <Button onClick={() => handleClick('first')}>1 колонка</Button>
//       </div>
//       <div>
//         <Button onClick={() => handleClick('second')} >2 колон</Button>
//       </div>
//       <div>
//         <Button onClick={() => handleClick('third')} >zxczxc</Button>
//       </div>
//       <div>
//         <Button onClick={() => handleClick('fourth')} >абчихба</Button>
//       </div>
//       <h3>{content}</h3>
//     </header>
    
//   )
// }

// export default Header