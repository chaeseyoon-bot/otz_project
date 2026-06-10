import { FILTER_COLOR_OPTIONS } from '../data/categoryFilterOptions'
import type { CategoryFilterableProduct } from './categoryProductFilter'

export interface ColorPaletteEntry {
  hex: string
  alias: readonly string[]
}

/** Admin product registration — Korean color name → HEX auto mapping. */
export const COLOR_PALETTE: Record<string, ColorPaletteEntry> = {
  블랙: { hex: '#000000', alias: ['검정', '블랙', 'black'] },
  화이트: { hex: '#FFFFFF', alias: ['하양', '화이트', '흰색', 'white'] },
  그레이: { hex: '#808080', alias: ['회색', '그레이', 'grey', 'gray'] },
  라이트그레이: { hex: '#D9D9D9', alias: ['밝은회색', '연회색', 'lightgrey', 'lightgray'] },
  베이지: { hex: '#CAB8A5', alias: ['베이지', 'beige'] },
  브라운: { hex: '#763F21', alias: ['갈색', '브라운', '초코', 'brown'] },
  네이비: { hex: '#302D62', alias: ['남색', '네이비', 'navy'] },
  블루: { hex: '#285EC1', alias: ['파랑', '블루', '하늘', 'blue'] },
  레드: { hex: '#DC2E2E', alias: ['빨강', '레드', 'red'] },
  그린: { hex: '#107417', alias: ['초록', '그린', '녹색', 'green'] },
  옐로우: { hex: '#FFCA2D', alias: ['노랑', '옐로우', 'yellow'] },
  핑크: { hex: '#ECC2CA', alias: ['분홍', '핑크', 'pink'] },
  오렌지: { hex: '#FF7A2F', alias: ['오렌지', '주황', 'orange'] },
  퍼플: { hex: '#9120E2', alias: ['퍼플', '보라', '바이올렛', 'purple', 'violet'] },
  크림: { hex: '#FFFDF5', alias: ['크림', 'cream'] },
  아이보리: { hex: '#FFF5EA', alias: ['아이보리', 'ivory'] },
}

function normalizePaletteKey(value: string): string {
  return value.trim().replace(/\s+/g, '').toLowerCase()
}

/** Normalizes user/DB hex to lowercase `#rrggbb`. */
export function normalizeColorHex(value: unknown): string | null {
  if (value == null) return null
  let raw = String(value).trim().toLowerCase()
  if (!raw) return null
  if (!raw.startsWith('#')) raw = `#${raw}`
  if (/^#[0-9a-f]{3}$/.test(raw)) {
    const [, r, g, b] = raw
    return `#${r}${r}${g}${g}${b}${b}`
  }
  if (/^#[0-9a-f]{6}$/.test(raw)) return raw
  return null
}

const COLOR_PALETTE_LOOKUP = (() => {
  const map = new Map<string, string>()
  for (const [canonical, entry] of Object.entries(COLOR_PALETTE)) {
    const hex = normalizeColorHex(entry.hex)
    if (!hex) continue
    map.set(normalizePaletteKey(canonical), hex)
    for (const alias of entry.alias) {
      map.set(normalizePaletteKey(alias), hex)
    }
  }
  return map
})()

/** Resolves a Korean color label (canonical or alias) to palette HEX. */
export function resolveColorHexFromPalette(colorName: string): string | null {
  const trimmed = colorName.trim()
  if (!trimmed) return null
  return COLOR_PALETTE_LOOKUP.get(normalizePaletteKey(trimmed)) ?? null
}

export interface DynamicColorFilterOption {
  id: string
  hex: string
  label: string
  swatchUrl?: string | null
}

const LEGACY_COLOR_ID_TO_HEX = Object.fromEntries(
  FILTER_COLOR_OPTIONS.map((option) => [option.id, option.fill.toLowerCase()]),
) as Record<string, string>

/** Maps legacy preset ids (beige, pink, …) to COLOR_PALETTE canonical names. */
const LEGACY_COLOR_ID_TO_CANONICAL: Record<string, string> = {
  beige: '베이지',
  brown: '브라운',
  white: '화이트',
  grey: '그레이',
  gray: '그레이',
  yellow: '옐로우',
  orange: '오렌지',
  pink: '핑크',
  purple: '퍼플',
  green: '그린',
  blue: '블루',
  navy: '네이비',
  black: '블랙',
}

const PALETTE_HEX_SET = new Set(
  Object.values(COLOR_PALETTE)
    .map((entry) => normalizeColorHex(entry.hex))
    .filter((hex): hex is string => Boolean(hex)),
)

/** OTZ-style trailing SKU at end of product name (e.g. FLOTGS2W21). */
const TRAILING_PRODUCT_CODE = /\s([A-Z][A-Z0-9]{7,11})\s*$/

function isProductCodeToken(token: string): boolean {
  return /^[A-Z][A-Z0-9]{7,11}$/.test(token)
}

/** Returns the token immediately before a trailing product code, if present. */
function extractColorBeforeProductCode(name: string): string {
  const match = name.match(TRAILING_PRODUCT_CODE)
  if (!match || match.index == null) return ''

  const beforeCode = name.slice(0, match.index).trim()
  if (!beforeCode) return ''

  const tokens = beforeCode.split(/\s+/).filter(Boolean)
  const lastToken = tokens[tokens.length - 1]
  if (!lastToken || isProductCodeToken(lastToken)) return ''

  return lastToken
}

/** Guesses HEX from a color name via COLOR_PALETTE (canonical name or alias). */
export function guessColorHexFromName(name: string): string | null {
  return resolveColorHexFromPalette(name)
}

/**
 * Extracts a color label from product names.
 * Default: the word right before the trailing product code (e.g. …크림 FLOTGS2W21 → 크림).
 * Fallback: parentheses `(Black)` or dash suffix.
 */
export function extractColorNameFromProductName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return ''

  const beforeCode = extractColorBeforeProductCode(trimmed)
  if (beforeCode) return beforeCode

  const bracketMatch = trimmed.match(/[\(\（\[\{「『]([^)\）\]\}」』]+)[\)\）\]\}」』]\s*$/)
  if (bracketMatch?.[1]) {
    return bracketMatch[1].trim()
  }

  const dashMatch = trimmed.match(/[-–—]\s*([A-Za-z가-힣][A-Za-z가-힣0-9\s]{0,24})\s*$/)
  if (dashMatch?.[1]) {
    return dashMatch[1].trim()
  }

  return ''
}

export function resolveLegacyFilterColorHex(colorId: string): string | null {
  return normalizeColorHex(LEGACY_COLOR_ID_TO_HEX[colorId] ?? null)
}

function resolvePaletteHexFromLegacyColorId(colorId: string): string | null {
  const canonical = LEGACY_COLOR_ID_TO_CANONICAL[colorId]
  if (canonical) {
    return resolveColorHexFromPalette(canonical)
  }
  return resolveLegacyFilterColorHex(colorId)
}

function collectProductColorLabels(product: CategoryFilterableProduct): string[] {
  const labels: string[] = []
  const seen = new Set<string>()

  const push = (value: string | null | undefined) => {
    const trimmed = value?.trim()
    if (!trimmed) return
    const key = normalizePaletteKey(trimmed)
    if (seen.has(key)) return
    seen.add(key)
    labels.push(trimmed)
  }

  push(product.productColorName)
  if (product.productName?.trim()) {
    push(extractColorNameFromProductName(product.productName))
  }

  return labels
}

const DEFAULT_ADMIN_COLOR_HEX = '#000000'

/** Returns the hex key used for PLP color facet matching. */
export function resolveProductColorFilterKey(product: CategoryFilterableProduct): string | null {
  const labels = collectProductColorLabels(product)

  for (const label of labels) {
    const fromPalette = resolveColorHexFromPalette(label)
    if (fromPalette) return fromPalette
  }

  const direct = normalizeColorHex(product.productColorHex)
  const isDefaultBlackPlaceholder =
    direct === DEFAULT_ADMIN_COLOR_HEX && labels.length > 0

  if (direct && !isDefaultBlackPlaceholder) {
    return direct
  }

  for (const legacyId of product.filterColors) {
    const legacyHex = resolvePaletteHexFromLegacyColorId(legacyId)
    if (legacyHex) return legacyHex
  }

  return isDefaultBlackPlaceholder ? null : direct
}

/** PLP color chips — full COLOR_PALETTE plus any extra catalog-only colors. */
export function buildDynamicColorFilterOptions(
  products: readonly CategoryFilterableProduct[],
): DynamicColorFilterOption[] {
  const map = new Map<string, DynamicColorFilterOption>()

  for (const [canonical, entry] of Object.entries(COLOR_PALETTE)) {
    const hex = normalizeColorHex(entry.hex)
    if (!hex) continue
    map.set(hex, {
      id: hex,
      hex,
      label: canonical,
      swatchUrl: null,
    })
  }

  for (const product of products) {
    const hex = resolveProductColorFilterKey(product)
    if (!hex) continue

    const swatchUrl = product.productColorSwatchUrl ?? null
    const existing = map.get(hex)
    const label =
      existing?.label ??
      product.productColorName?.trim() ??
      hex.toUpperCase()

    if (existing) {
      if (!existing.swatchUrl && swatchUrl) {
        map.set(hex, { ...existing, swatchUrl })
      }
      continue
    }

    map.set(hex, {
      id: hex,
      hex,
      label,
      swatchUrl,
    })
  }

  const paletteOptions = Object.values(COLOR_PALETTE)
    .map((entry) => normalizeColorHex(entry.hex))
    .filter((hex): hex is string => Boolean(hex))
    .map((hex) => map.get(hex)!)
    .filter(Boolean)

  const extraOptions = [...map.values()]
    .filter((option) => !PALETTE_HEX_SET.has(option.hex))
    .sort((a, b) => a.label.localeCompare(b.label, 'ko'))

  return [...paletteOptions, ...extraOptions]
}

export function normalizeAdminColorHexInput(value: unknown, fallback = '#000000'): string {
  return normalizeColorHex(value) ?? normalizeColorHex(fallback) ?? '#000000'
}
