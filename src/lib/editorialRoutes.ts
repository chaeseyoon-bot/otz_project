const EDITORIAL_DETAIL_ID_PATTERN = /^editorial-\d{2,}$/

export function isEditorialDetailPath(pathname: string): boolean {
  return parseEditorialDetailId(pathname) !== null
}

export function parseEditorialDetailId(pathname: string): string | null {
  const match = pathname.match(/^\/editorial\/([^/]+)\/?$/)
  if (!match) return null
  const id = match[1]
  return EDITORIAL_DETAIL_ID_PATTERN.test(id) ? id : null
}

export function getEditorialDetailPath(editorialId: string): `/editorial/${string}` {
  return `/editorial/${editorialId}`
}
