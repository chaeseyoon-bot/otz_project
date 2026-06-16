import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { DEMO_CART_ITEMS_EMPTY, type CartItem } from '../data/cartContent'

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  setItems: (items: CartItem[]) => void
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateItem: (id: string, patch: Partial<CartItem>) => void
  toggleItemSelected: (id: string) => void
  selectAll: (selected: boolean) => void
  removeSelected: () => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function sumQuantities(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0)
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(DEMO_CART_ITEMS_EMPTY)

  const addItem = useCallback((item: CartItem) => {
    setItems((current) => {
      const existing = current.find((entry) => entry.id === item.id)
      if (existing) {
        return current.map((entry) =>
          entry.id === item.id ? { ...entry, quantity: entry.quantity + item.quantity } : entry,
        )
      }
      return [...current, item]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((entry) => entry.id !== id))
  }, [])

  const updateItem = useCallback((id: string, patch: Partial<CartItem>) => {
    setItems((current) => current.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)))
  }, [])

  const toggleItemSelected = useCallback((id: string) => {
    setItems((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, selected: !entry.selected } : entry)),
    )
  }, [])

  const selectAll = useCallback((selected: boolean) => {
    setItems((current) => current.map((entry) => ({ ...entry, selected })))
  }, [])

  const removeSelected = useCallback(() => {
    setItems((current) => current.filter((entry) => !entry.selected))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const value = useMemo(
    () => ({
      items,
      itemCount: sumQuantities(items),
      setItems,
      addItem,
      removeItem,
      updateItem,
      toggleItemSelected,
      selectAll,
      removeSelected,
      clearCart,
    }),
    [items, addItem, removeItem, updateItem, toggleItemSelected, selectAll, removeSelected, clearCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
