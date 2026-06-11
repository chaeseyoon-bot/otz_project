import { GNB_MEGA_MENU_GROUPS } from '../data/gnbMegaMenu'
import {
  getCategoryMobileMainLabel,
  getLnbSubItems,
  type CategoryMobileMainId,
} from '../data/categoryMobileMain'
import { notifySpaNavigation } from './spaNavigation'

export const CATEGORY_PLP_PATH = '/category/shoes'

/** PC LNB `ALL` plus mobile main tabs (shoes / bag-acc / collection). */
export type CategoryPlpMainId = CategoryMobileMainId | 'all'

const VALID_MOBILE_MAIN_IDS = new Set<CategoryMobileMainId>(['shoes', 'bag-acc', 'collection'])

function isCategoryMobileMainId(value: string): value is CategoryMobileMainId {
  return VALID_MOBILE_MAIN_IDS.has(value as CategoryMobileMainId)
}

export function getCategoryPlpMainLabel(mainId: CategoryPlpMainId): string {
  if (mainId === 'all') return 'ALL'
  return getCategoryMobileMainLabel(mainId)
}

export function mainIdFromGnbGroupTitle(title: string): CategoryMobileMainId {
  if (title === 'ACC') return 'bag-acc'
  if (title === 'COLLECTION') return 'collection'
  return 'shoes'
}

export function mainIdFromGnbTabIndex(tabIndex: number): CategoryMobileMainId {
  const group = GNB_MEGA_MENU_GROUPS[tabIndex]
  return group ? mainIdFromGnbGroupTitle(group.title) : 'shoes'
}

/** Builds `/category/shoes?main=…&sub=…` for PLP deep links from GNB / LNB. */
export function buildCategoryPlpPath(
  mainId: CategoryPlpMainId = 'shoes',
  subLabel?: string | null,
): string {
  const params = new URLSearchParams()
  if (mainId === 'all') params.set('main', 'all')
  else if (mainId !== 'shoes') params.set('main', mainId)
  if (subLabel && mainId !== 'all') params.set('sub', subLabel)
  const query = params.toString()
  return query ? `${CATEGORY_PLP_PATH}?${query}` : CATEGORY_PLP_PATH
}

export function parseCategoryPlpSearch(search: string): {
  mainId: CategoryPlpMainId
  subIndex: number
} {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const mainRaw = params.get('main') ?? 'shoes'
  let mainId: CategoryPlpMainId = 'shoes'
  if (mainRaw === 'all') mainId = 'all'
  else if (isCategoryMobileMainId(mainRaw)) mainId = mainRaw

  if (mainId === 'all') return { mainId, subIndex: 0 }

  const subLabel = params.get('sub')?.trim()
  if (!subLabel) return { mainId, subIndex: 0 }

  const subIndex = getLnbSubItems(mainId).indexOf(subLabel)
  return { mainId, subIndex: subIndex >= 0 ? subIndex + 1 : 0 }
}

export function subLabelFromPlpState(
  mainId: CategoryPlpMainId,
  subIndex: number,
): string | null {
  if (mainId === 'all' || subIndex <= 0) return null
  return getLnbSubItems(mainId)[subIndex - 1] ?? null
}

export function resolveGnbDrawerNavigation(
  tabIndex: number,
  label: string,
): { mainId: CategoryMobileMainId; subLabel: string | null } {
  const mainId = mainIdFromGnbTabIndex(tabIndex)
  if (label === '전체') return { mainId, subLabel: null }
  return { mainId, subLabel: label }
}

const BRAND_SERIES_COLLECTION_ALIASES: Record<string, string> = {
  LOMITA: '로미타',
  ROMARI: '로마리',
  '3300': '3300',
  TOPI: '토피',
}

/** Maps home brand series title (e.g. LOMITA) to COLLECTION PLP deep link. */
export function resolveBrandSeriesCategoryPath(seriesTitle: string): string | null {
  const trimmed = seriesTitle.trim()
  if (!trimmed) return null

  const collectionItems = getLnbSubItems('collection')
  const fromAlias = BRAND_SERIES_COLLECTION_ALIASES[trimmed.toUpperCase()]
  if (fromAlias && collectionItems.includes(fromAlias)) {
    return buildCategoryPlpPath('collection', fromAlias)
  }

  const directMatch = collectionItems.find(
    (item) => item.toUpperCase() === trimmed.toUpperCase() || item === trimmed,
  )
  if (directMatch) return buildCategoryPlpPath('collection', directMatch)

  return null
}

export function navigateCategoryPlp(
  mainId: CategoryPlpMainId,
  subLabel?: string | null,
  options?: { replace?: boolean },
): void {
  const nextPath = buildCategoryPlpPath(mainId, subLabel)
  const currentPath = `${window.location.pathname}${window.location.search}`

  if (currentPath === nextPath) {
    notifySpaNavigation()
    window.scrollTo(0, 0)
    return
  }

  if (options?.replace) {
    window.history.replaceState({}, '', nextPath)
  } else {
    window.history.pushState({}, '', nextPath)
  }

  notifySpaNavigation()
  if (!options?.replace) {
    window.scrollTo(0, 0)
  }
}

/** Navigates brand series CTA / card links — category PLP deep links scroll to top. */
export function navigateBrandSeriesHref(href: string): void {
  const trimmed = href.trim()
  if (!trimmed || trimmed === '#') return

  if (trimmed.startsWith('/category/shoes')) {
    const query = trimmed.includes('?') ? trimmed.slice(trimmed.indexOf('?')) : ''
    const { mainId, subIndex } = parseCategoryPlpSearch(query)
    navigateCategoryPlp(mainId, subLabelFromPlpState(mainId, subIndex))
    return
  }

  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    window.history.pushState({}, '', trimmed)
    notifySpaNavigation()
    window.scrollTo(0, 0)
    return
  }

  window.location.assign(trimmed)
}
