const STORAGE_KEY = 'otz-recent-searches'
const MAX_RECENT = 10

export function readRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
  } catch {
    return []
  }
}

export function writeRecentSearches(items: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_RECENT)))
}

export function addRecentSearch(term: string) {
  const trimmed = term.trim()
  if (!trimmed) return
  const next = [trimmed, ...readRecentSearches().filter((item) => item !== trimmed)].slice(0, MAX_RECENT)
  writeRecentSearches(next)
  return next
}

export function removeRecentSearch(term: string) {
  const next = readRecentSearches().filter((item) => item !== term)
  writeRecentSearches(next)
  return next
}

export function clearRecentSearches() {
  writeRecentSearches([])
  return [] as string[]
}
