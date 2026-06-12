import { editorialAsset } from '../lib/editorialAssetUrl'
import { resolveEditorialListItems } from '../lib/editorialContentResolver'

export type EditorialCategoryId = 'all' | 'collection' | 'curation' | 'collabo'

export interface EditorialEventItem {
  id: string
  thumbnail: string
  title: string
  /** Display under title, e.g. `2026.02.02 - 2026.02.15` */
  period: string
  category: Exclude<EditorialCategoryId, 'all'>
  categoryLabel: string
}

export const EDITORIAL_CATEGORY_FILTERS: { id: EditorialCategoryId; label: string }[] = [
  { id: 'collection', label: 'COLLECTION' },
  { id: 'curation', label: 'CURATION' },
  { id: 'collabo', label: 'COLLABO' },
]

/**
 * Admin-registered editorial / event list (mock).
 * `EDITORIAL/` 01–06.png — COLLECTION 탭 기본 6건 노출 (Figma PC 3×2).
 */
export const EDITORIAL_EVENTS: EditorialEventItem[] = [
  {
    id: 'editorial-01',
    thumbnail: editorialAsset('01.png'),
    title: '스페셜 이슈 | 26SS 오찌 데이도트 에디션 발매 단독 15%',
    period: '2026.02.02 - 2026.02.15',
    category: 'collection',
    categoryLabel: 'COLLECTION',
  },
  {
    id: 'editorial-02',
    thumbnail: editorialAsset('02.png'),
    title: 'Romari Collection 신규 컬러 런칭',
    period: '2026.01.20 - 2026.02.10',
    category: 'collection',
    categoryLabel: 'COLLECTION',
  },
  {
    id: 'editorial-03',
    thumbnail: editorialAsset('03.png'),
    title: 'Winter Mood 큐레이션 — 따뜻한 실루엣',
    period: '2025.12.01 - 2026.01.31',
    category: 'collection',
    categoryLabel: 'COLLECTION',
  },
  {
    id: 'editorial-04',
    thumbnail: editorialAsset('04.png'),
    title: 'Holiday Gift Edit — 연말 선물 가이드',
    period: '2025.11.15 - 2025.12.31',
    category: 'collection',
    categoryLabel: 'COLLECTION',
  },
  {
    id: 'editorial-05',
    thumbnail: editorialAsset('05.png'),
    title: 'OTZ × Artist Collaboration Drop',
    period: '2025.10.01 - 2025.11.30',
    category: 'collection',
    categoryLabel: 'COLLECTION',
  },
  {
    id: 'editorial-06',
    thumbnail: editorialAsset('06.png'),
    title: 'Friends of OTZ — 브랜드 콜라보 리미티드',
    period: '2025.09.01 - 2025.10.15',
    category: 'collection',
    categoryLabel: 'COLLECTION',
  },
  {
    id: 'editorial-07',
    thumbnail: editorialAsset('03.png'),
    title: 'Winter Mood 큐레이션 — 따뜻한 실루엣',
    period: '2025.12.01 - 2026.01.31',
    category: 'curation',
    categoryLabel: 'CURATION',
  },
  {
    id: 'editorial-08',
    thumbnail: editorialAsset('04.png'),
    title: 'Holiday Gift Edit — 연말 선물 가이드',
    period: '2025.11.15 - 2025.12.31',
    category: 'curation',
    categoryLabel: 'CURATION',
  },
  {
    id: 'editorial-09',
    thumbnail: editorialAsset('05.png'),
    title: 'OTZ × Artist Collaboration Drop',
    period: '2025.10.01 - 2025.11.30',
    category: 'collabo',
    categoryLabel: 'COLLABO',
  },
  {
    id: 'editorial-10',
    thumbnail: editorialAsset('06.png'),
    title: 'Friends of OTZ — 브랜드 콜라보 리미티드',
    period: '2025.09.01 - 2025.10.15',
    category: 'collabo',
    categoryLabel: 'COLLABO',
  },
]

/** Returns admin-saved events when available, else static mock list. */
export function getEditorialEvents(): EditorialEventItem[] {
  const resolved = resolveEditorialListItems()
  return resolved.length ? resolved : EDITORIAL_EVENTS
}

export function filterEditorialEvents(category: EditorialCategoryId): EditorialEventItem[] {
  const events = getEditorialEvents()
  if (category === 'all') return events
  return events.filter((item) => item.category === category)
}
