import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import api from '../api/axios'

const CATEGORIES = [
  { id: 'all', name: 'Все товары' },
  { id: 'armatura', name: 'Арматура' },
  { id: 'profile-tubes', name: 'Профильные трубы' },
  { id: 'tubes', name: 'Трубы' },
  { id: 'profnastil', name: 'Профнастил' },
  { id: 'setka', name: 'Сетка' },
  { id: 'paint', name: 'Краска и растворители' },
  { id: 'fasteners', name: 'Крепёж' },
]

function Catalog() {
  const { category } = useParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(category || 'all')

  useEffect(() => {
    fetchProducts()
  }, [activeCategory])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = activeCategory !== 'all' ? { category: activeCategory } : {}
      const res = await api.get('/products', { params })
      setProducts(res.data)
    } catch (err) {
      console.error('Ошибка загрузки:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <h1 className="section-title">Каталог</h1>
      
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '32px',
        flexWrap: 'wrap'
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={activeCategory === cat.id ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ fontSize: '13px', padding: '8px 16px' }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
          Загрузка...
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
          Товары не найдены
        </div>
      ) : (
        <div className="grid-products">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Catalog