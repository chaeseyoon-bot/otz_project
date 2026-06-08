const ARCHIVE_DETAIL_ID_PATTERN = /^archive-\d{2}$/

export function isArchiveDetailPath(pathname: string): boolean {
  const id = parseArchiveDetailId(pathname)
  return id !== null && ARCHIVE_DETAIL_ID_PATTERN.test(id)
}

export function parseArchiveDetailId(pathname: string): string | null {
  const match = pathname.match(/^\/archive\/([^/]+)\/?$/)
  if (!match) return null
  const id = match[1]
  return ARCHIVE_DETAIL_ID_PATTERN.test(id) ? id : null
}

export function getArchiveDetailPath(lookbookId: string): `/archive/${string}` {
  return `/archive/${lookbookId}`
}
