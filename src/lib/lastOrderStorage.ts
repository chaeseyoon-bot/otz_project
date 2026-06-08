import type { CompletedOrder } from '../data/orderCompleteContent'

const STORAGE_KEY = 'otz:last-completed-order'

export function saveLastCompletedOrder(order: CompletedOrder) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(order))
  } catch {
    // Ignore quota / private mode errors in demo flow.
  }
}

export function loadLastCompletedOrder(): CompletedOrder | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CompletedOrder
  } catch {
    return null
  }
}
