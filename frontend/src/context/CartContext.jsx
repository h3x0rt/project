import { createContext, useState, useContext, useEffect } from 'react'
import { useAuth } from './AuthContext'

const CartContext = createContext()

function cartStorageKey(userId) {
  return `cart_user_${userId}`
}

export default function CartProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const [cart, setCart] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Убираем старую общую корзину без привязки к аккаунту
    localStorage.removeItem('cart')

    if (!userId) {
      setCart([])
      setReady(false)
      return
    }

    setReady(false)
    try {
      const saved = localStorage.getItem(cartStorageKey(userId))
      setCart(saved ? JSON.parse(saved) : [])
    } catch {
      setCart([])
    }
    setReady(true)
  }, [userId])

  useEffect(() => {
    if (!userId || !ready) return
    localStorage.setItem(cartStorageKey(userId), JSON.stringify(cart))
  }, [cart, userId, ready])

  const clampToStock = (desired, stock) => {
    if (stock === undefined || stock === null) return desired
    const max = Math.max(0, Number(stock))
    return Math.min(desired, max)
  }

  const addToCart = (product, quantity = 1) => {
    if (!userId) return false

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      const stock = product.stock ?? existing?.stock
      if (existing) {
        const nextQty = clampToStock(existing.quantity + quantity, stock)
        if (nextQty < 1) return prev.filter(item => item.id !== product.id)
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: nextQty, stock }
            : item
        )
      }
      const nextQty = clampToStock(quantity, stock)
      if (nextQty < 1) return prev
      return [...prev, { ...product, quantity: nextQty }]
    })
    return true
  }

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    const qty = Number(quantity)
    if (!Number.isFinite(qty) || qty < 1) {
      removeFromCart(productId)
      return
    }
    setCart(prev =>
      prev.map(item => {
        if (item.id !== productId) return item
        return { ...item, quantity: clampToStock(Math.floor(qty), item.stock) }
      })
    )
  }

  const clearCart = () => setCart([])

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      isCartReady: ready
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
