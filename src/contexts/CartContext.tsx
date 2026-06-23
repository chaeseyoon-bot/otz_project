import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEMO_CART_ITEMS_EMPTY, type CartItem } from '../data/cartContent'
import { pruneExpiredCartItems, readCartItems, writeCartItems } from '../lib/cartStorage'

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

function withPersistedItems(items: CartItem[]) {
  const next = pruneExpiredCartItems(items)
  writeCartItems(next)
  return next
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItemsState] = useState<CartItem[]>(() => readCartItems())

  const setItems = useCallback((nextItems: CartItem[]) => {
    setItemsState(withPersistedItems(nextItems))
  }, [])

  useEffect(() => {
    setItemsState((current) => withPersistedItems(current))
  }, [])

  const addItem = useCallback((item: CartItem) => {
    setItemsState((current) => {
      const existing = current.find((entry) => entry.id === item.id)
      const next = existing
        ? current.map((entry) =>
            entry.id === item.id
              ? { ...entry, quantity: entry.quantity + item.quantity, selected: item.selected ?? entry.selected }
              : entry,
          )
        : [...current, { ...item, addedAt: item.addedAt ?? Date.now() }]
      return withPersistedItems(next)
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItemsState((current) => withPersistedItems(current.filter((entry) => entry.id !== id)))
  }, [])

  const updateItem = useCallback((id: string, patch: Partial<CartItem>) => {
    setItemsState((current) =>
      withPersistedItems(current.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry))),
    )
  }, [])

  const toggleItemSelected = useCallback((id: string) => {
    setItemsState((current) =>
      withPersistedItems(
        current.map((entry) => (entry.id === id ? { ...entry, selected: !entry.selected } : entry)),
      ),
    )
  }, [])

  const selectAll = useCallback((selected: boolean) => {
    setItemsState((current) => withPersistedItems(current.map((entry) => ({ ...entry, selected }))))
  }, [])

  const removeSelected = useCallback(() => {
    setItemsState((current) => withPersistedItems(current.filter((entry) => !entry.selected)))
  }, [])

  const clearCart = useCallback(() => {
    setItemsState(withPersistedItems([]))
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
    [items, setItems, addItem, removeItem, updateItem, toggleItemSelected, selectAll, removeSelected, clearCart],
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
