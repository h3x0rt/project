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
      <section className="home-hero">
        <div className="container">
          <h1 className="home-hero__title">Юг Белора Металл</h1>
          <p className="home-hero__text">
            Металлопрокат, строительные материалы и аренда оборудования в Белореченске
          </p>
          <Link to="/catalog" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }}>
            Перейти в каталог
          </Link>
        </div>
      </section>

      <section className="container home-section">
        <div className="home-section__head">
          <h2 className="section-title" style={{ margin: 0 }}>Популярные товары</h2>
          <Link to="/catalog" style={{ color: 'var(--color-accent)', fontSize: '14px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
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
