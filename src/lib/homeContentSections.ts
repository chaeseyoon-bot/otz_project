/** Reorderable home sections (admin tabs 3–9). */
export type HomeContentSectionId =
  | 'brand'
  | 'series'
  | 'planning'
  | 'collection'
  | 'curation'
  | 'styling'
  | 'lookbook'

export interface HomeContentSectionEntry {
  id: HomeContentSectionId
  enabled: boolean
}

export const HOME_CONTENT_SECTION_IDS: readonly HomeContentSectionId[] = [
  'brand',
  'series',
  'planning',
  'collection',
  'curation',
  'styling',
  'lookbook',
] as const

export const HOME_CONTENT_SECTION_LABELS: Record<HomeContentSectionId, string> = {
  brand: '3. 브랜드 배너',
  series: '4. 시리즈 배너',
  planning: '5. 기획전 배너',
  collection: '6. 기획전 컬렉션',
  curation: '7. 큐레이션 상품',
  styling: '8. 스타일 배너',
  lookbook: '9. 룩북',
}

/** Compact admin chip label (no index prefix). */
export const HOME_CONTENT_SECTION_SHORT_LABELS: Record<HomeContentSectionId, string> = {
  brand: '브랜드',
  series: '시리즈',
  planning: '기획전',
  collection: '컬렉션',
  curation: '큐레이션',
  styling: '스타일',
  lookbook: '룩북',
}

export function createDefaultHomeContentSections(): HomeContentSectionEntry[] {
  return HOME_CONTENT_SECTION_IDS.map((id) => ({ id, enabled: true }))
}

export function normalizeHomeContentSections(
  raw: unknown,
  fallback = createDefaultHomeContentSections(),
): HomeContentSectionEntry[] {
  if (!Array.isArray(raw)) return fallback.map((entry) => ({ ...entry }))

  const byId = new Map<HomeContentSectionId, boolean>()
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const id = (item as HomeContentSectionEntry).id
    if (!HOME_CONTENT_SECTION_IDS.includes(id)) continue
    byId.set(id, (item as HomeContentSectionEntry).enabled !== false)
  }

  const ordered: HomeContentSectionEntry[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const id = (item as HomeContentSectionEntry).id
    if (!HOME_CONTENT_SECTION_IDS.includes(id) || ordered.some((entry) => entry.id === id)) continue
    ordered.push({ id, enabled: byId.get(id) ?? true })
  }

  for (const id of HOME_CONTENT_SECTION_IDS) {
    if (!ordered.some((entry) => entry.id === id)) {
      ordered.push({ id, enabled: byId.get(id) ?? true })
    }
  }

  return ordered
}

export function moveHomeContentSection(
  sections: HomeContentSectionEntry[],
  index: number,
  direction: -1 | 1,
): HomeContentSectionEntry[] {
  const target = index + direction
  if (target < 0 || target >= sections.length) return sections
  const next = sections.map((entry) => ({ ...entry }))
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}

export function setHomeContentSectionEnabled(
  sections: HomeContentSectionEntry[],
  id: HomeContentSectionId,
  enabled: boolean,
): HomeContentSectionEntry[] {
  return sections.map((entry) => (entry.id === id ? { ...entry, enabled } : entry))
}

/** PC storefront order — always default sequence; enabled flags come from admin config. */
export function getPcHomeContentSections(
  config: HomeContentSectionEntry[],
): HomeContentSectionEntry[] {
  return createDefaultHomeContentSections().map((entry) => ({
    ...entry,
    enabled: config.find((item) => item.id === entry.id)?.enabled ?? true,
  }))
}

/** True when brand + series are consecutive and both enabled (preserve combined BrandSection layout). */
export function shouldRenderCombinedBrandSection(
  sections: HomeContentSectionEntry[],
  index: number,
): boolean {
  const current = sections[index]
  const next = sections[index + 1]
  return (
    current?.id === 'brand' &&
    current.enabled &&
    next?.id === 'series' &&
    next.enabled
  )
}
