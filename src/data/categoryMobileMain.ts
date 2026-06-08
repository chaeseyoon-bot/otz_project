import { GNB_MEGA_MENU_GROUPS } from './gnbMegaMenu'

/** Figma 2497:14138 — mobile PLP main category switcher (SHOES / BAG＆ACC / COLLECTION). */
export const CATEGORY_MOBILE_MAIN_ITEMS = [
  { id: 'shoes', label: 'SHOES', gnbTitle: 'SHOES' },
  { id: 'bag-acc', label: 'BAG＆ACC', gnbTitle: 'ACC' },
  { id: 'collection', label: 'COLLECTION', gnbTitle: 'COLLECTION' },
] as const

export type CategoryMobileMainId = (typeof CATEGORY_MOBILE_MAIN_ITEMS)[number]['id']

export function getCategoryMobileMainLabel(mainId: CategoryMobileMainId): string {
  return CATEGORY_MOBILE_MAIN_ITEMS.find((item) => item.id === mainId)?.label ?? 'SHOES'
}

function getGnbItemsForMain(mainId: CategoryMobileMainId): readonly string[] {
  const gnbTitle = CATEGORY_MOBILE_MAIN_ITEMS.find((item) => item.id === mainId)?.gnbTitle
  return GNB_MEGA_MENU_GROUPS.find((group) => group.title === gnbTitle)?.items ?? []
}

export function getMobileSubChipLabels(mainId: CategoryMobileMainId): string[] {
  return ['전체', ...getGnbItemsForMain(mainId)]
}

/** Mobile hamburger drawer — SHOES tab prepends "전체" before subcategory list. */
export function getMobileGnbDrawerItems(tabIndex: number): string[] {
  const group = GNB_MEGA_MENU_GROUPS[tabIndex]
  if (!group) return []
  if (group.title === 'SHOES') {
    return ['전체', ...group.items]
  }
  return [...group.items]
}

export function getLnbSubItems(mainId: CategoryMobileMainId): readonly string[] {
  return getGnbItemsForMain(mainId)
}
