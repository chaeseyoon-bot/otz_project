import { GNB_MEGA_MENU_GROUPS } from '../data/gnbMegaMenu'
import {
  getLnbSubItems,
  type CategoryMobileMainId,
} from '../data/categoryMobileMain'
import { notifySpaNavigation } from './spaNavigation'

export const CATEGORY_PLP_PATH = '/category/shoes'

const VALID_MAIN_IDS = new Set<CategoryMobileMainId>(['shoes', 'bag-acc', 'collection'])

function isCategoryMainId(value: string): value is CategoryMobileMainId {
  return VALID_MAIN_IDS.has(value as CategoryMobileMainId)
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
  mainId: CategoryMobileMainId = 'shoes',
  subLabel?: string | null,
): string {
  const params = new URLSearchParams()
  if (mainId !== 'shoes') params.set('main', mainId)
  if (subLabel) params.set('sub', subLabel)
  const query = params.toString()
  return query ? `${CATEGORY_PLP_PATH}?${query}` : CATEGORY_PLP_PATH
}

export function parseCategoryPlpSearch(search: string): {
  mainId: CategoryMobileMainId
  subIndex: number
} {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const mainRaw = params.get('main') ?? 'shoes'
  const mainId: CategoryMobileMainId = isCategoryMainId(mainRaw) ? mainRaw : 'shoes'
  const subLabel = params.get('sub')?.trim()

  if (!subLabel) return { mainId, subIndex: 0 }

  const subIndex = getLnbSubItems(mainId).indexOf(subLabel)
  return { mainId, subIndex: subIndex >= 0 ? subIndex + 1 : 0 }
}

export function subLabelFromPlpState(
  mainId: CategoryMobileMainId,
  subIndex: number,
): string | null {
  if (subIndex <= 0) return null
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

export function navigateCategoryPlp(
  mainId: CategoryMobileMainId,
  subLabel?: string | null,
  options?: { replace?: boolean },
): void {
  const nextPath = buildCategoryPlpPath(mainId, subLabel)
  const currentPath = `${window.location.pathname}${window.location.search}`

  if (currentPath === nextPath) {
    notifySpaNavigation()
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
