import { GNB_MEGA_MENU_GROUPS } from './gnbMegaMenu'

function itemsForTitle(title: string): readonly string[] {
  return GNB_MEGA_MENU_GROUPS.find((group) => group.title === title)?.items ?? []
}

/** SHOES subcategories — Figma GNB mega menu. */
export const SHOES_SUBCATEGORIES = itemsForTitle('SHOES')

/** BAG＆ACC subcategories — Figma GNB mega menu (ACC group). */
export const ACC_SUBCATEGORIES = itemsForTitle('ACC')

/** COLLECTION product lines — matched against product names. */
export const COLLECTION_LINES = itemsForTitle('COLLECTION')

/** Admin product form — default subcategory mode (resolved from product name on save). */
export const ADMIN_SUBCATEGORY_AUTO = '자동'

type SubcategoryRule = { label: string; keywords: readonly string[] }

/** Longer / more specific keywords first within each rule list order. */
const SHOES_SUBCATEGORY_RULES: readonly SubcategoryRule[] = [
  { label: '부츠/레인부츠', keywords: ['레인부츠', '부츠'] },
  { label: '쪼리/플립플랍', keywords: ['플립플랍', '플립플롭', '쪼리'] },
  { label: '메리제인', keywords: ['메리제인'] },
  { label: '스니커즈', keywords: ['스니커즈', '운동화'] },
  { label: '샌들', keywords: ['샌들'] },
  { label: '슬라이드', keywords: ['슬라이드'] },
  { label: '클로그', keywords: ['클로그'] },
  { label: '젤리슈즈', keywords: ['젤리슈즈', '젤리'] },
]

const ACC_SUBCATEGORY_RULES: readonly SubcategoryRule[] = [
  { label: '장갑/머플러', keywords: ['머플러', '장갑', '스카프'] },
  { label: '워머/양말', keywords: ['양말', '워머', '삭스'] },
  { label: '가방', keywords: ['가방', '토트', '숄더', '크로스백', '백팩'] },
  { label: '모자', keywords: ['모자', '비니', '캡', '버킷햇', '햇'] },
  { label: '헤어', keywords: ['헤어', '헤어밴드', '집게', '핀'] },
  { label: '기타', keywords: ['기타'] },
]

export function isShoesAdminCategory(category: string): boolean {
  return category.trim().toLowerCase().startsWith('shoes')
}

function isBagAccCategory(category: string): boolean {
  const normalized = category.trim().toLowerCase()
  return normalized === 'bag' || normalized === 'acc' || normalized === 'bagacc'
}

function subcategoryRulesForCategory(category?: string | null): readonly SubcategoryRule[] | null {
  if (!category) return null
  if (isShoesAdminCategory(category) || category === 'shoes') return SHOES_SUBCATEGORY_RULES
  if (isBagAccCategory(category)) return ACC_SUBCATEGORY_RULES
  return null
}

function detectFromRules(name: string, rules: readonly SubcategoryRule[]): string | null {
  for (const rule of rules) {
    const sortedKeywords = [...rule.keywords].sort((a, b) => b.length - a.length)
    for (const keyword of sortedKeywords) {
      if (name.includes(keyword)) return rule.label
    }
  }
  return null
}

/** Maps legacy admin / DB labels to the current GNB subcategory names. */
export function normalizeSubcategoryLabel(label: string | null | undefined): string | null {
  const trimmed = label?.trim()
  if (!trimmed) return null
  if (trimmed === '운동화') return '스니커즈'
  if (trimmed === '부츠' || trimmed === '레인부츠') return '부츠/레인부츠'
  return trimmed
}

/** Admin subcategory options for the selected DB category label. */
export function getAdminSubcategoryOptions(category: string): readonly string[] {
  if (isShoesAdminCategory(category)) return SHOES_SUBCATEGORIES
  if (category === 'bag' || category === 'acc') return ACC_SUBCATEGORIES
  return []
}

/** Sensible default when switching admin category buckets. */
export function getDefaultSubcategoryForCategory(category: string): string {
  if (category === 'bag') return '가방'
  return getAdminSubcategoryOptions(category)[0] ?? ''
}

/**
 * Detects a subcategory from the product name.
 * Uses category bucket (shoes / bag / acc) to pick the keyword rule set.
 */
export function isAutoSubcategorySelection(subcategory: string): boolean {
  return subcategory.trim() === ADMIN_SUBCATEGORY_AUTO
}

/** Resolves the DB subcategory from admin form state (자동 → product-name detection). */
export function resolveAdminSubcategoryForSave(
  subcategory: string,
  name: string,
  category: string,
): string | null {
  if (isAutoSubcategorySelection(subcategory)) {
    return detectSubcategoryFromProductName(name, category)
  }
  const normalized = normalizeSubcategoryLabel(subcategory)
  return normalized || subcategory.trim() || null
}

export function detectSubcategoryFromProductName(
  name: string,
  category?: string | null,
): string | null {
  const trimmed = name.trim()
  if (!trimmed) return null

  const rules = subcategoryRulesForCategory(category)
  if (rules) return detectFromRules(trimmed, rules)

  return detectFromRules(trimmed, SHOES_SUBCATEGORY_RULES) ?? detectFromRules(trimmed, ACC_SUBCATEGORY_RULES)
}

/**
 * Resolves the effective subcategory — stored value first, then product-name detection.
 */
export function resolveProductSubcategory(product: {
  title: string
  subcategory?: string | null
  category?: string | null
}): string | null {
  const stored = normalizeSubcategoryLabel(product.subcategory)
  if (stored) return stored
  return detectSubcategoryFromProductName(product.title, product.category)
}

/**
 * Detects a collection line from the product name.
 * Longer keywords are checked first (e.g. 피스모어 before 피스모).
 */
export function detectCollectionFromProductName(name: string): string | null {
  const trimmed = name.trim()
  if (!trimmed) return null

  const sorted = [...COLLECTION_LINES].sort((a, b) => b.length - a.length)
  for (const line of sorted) {
    if (trimmed.includes(line)) return line
  }
  return null
}

export function matchesCollectionProduct(
  product: { title: string; collection?: string | null },
  line: string,
): boolean {
  if (product.collection === line) return true
  return product.title.includes(line)
}

export function matchesSubcategoryProduct(
  product: { title: string; subcategory?: string | null; category?: string | null },
  subcategory: string,
): boolean {
  const resolved = resolveProductSubcategory(product)
  const normalizedTarget = normalizeSubcategoryLabel(subcategory) ?? subcategory
  return resolved === normalizedTarget
}
