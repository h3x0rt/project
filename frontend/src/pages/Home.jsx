import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'

function Home() {
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    api.get('/products').then(res => setFeatured(res.data.slice(0, 4)))
  }, [])

  return (
    <div>
      <section style={{
        background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-raised) 100%)',
        padding: '80px 0',
        textAlign: 'center',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '42px', fontWeight: 700, marginBottom: '16px' }}>
            Юг Белора Металл
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto 32px' }}>
            Металлопрокат, строительные материалы и аренда оборудования в Белореченске
          </p>
          <Link to="/catalog" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }}>
            Перейти в каталог
          </Link>
        </div>
      </section>

      <section className="container" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Популярные товары</h2>
          <Link to="/catalog" style={{ color: 'var(--color-accent)', fontSize: '14px', textDecoration: 'none' }}>
            Смотреть все →
          </Link>
        </div>
        <div className="grid-products">
          {featured.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  )
}

export default Home