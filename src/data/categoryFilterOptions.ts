export const FILTER_SHOE_SIZES = [
  '215',
  '220',
  '225',
  '230',
  '235',
  '240',
  '245',
  '250',
  '255',
  '260',
  '265',
] as const

export type FilterShoeSize = (typeof FILTER_SHOE_SIZES)[number]

/** PC PLP filter bar — Figma 2895:23931 (10-column size row: 220–260 + FREE). */
export const FILTER_PC_SHOE_SIZES = [
  '220',
  '225',
  '230',
  '235',
  '240',
  '245',
  '250',
  '255',
  '260',
  'FREE',
] as const

export type FilterPcShoeSize = (typeof FILTER_PC_SHOE_SIZES)[number]

export interface FilterColorOption {
  id: string
  label: string
  fill: string
  variant?: 'solid' | 'stripe' | 'etc'
}

/** Mobile 상세필터 — color swatches (Figma PLP filter sheet). */
export const FILTER_COLOR_OPTIONS: readonly FilterColorOption[] = [
  { id: 'beige', label: 'BEIGE', fill: '#e8dcc8', variant: 'solid' },
  { id: 'brown', label: 'BROWN', fill: '#8b5a3c', variant: 'solid' },
  { id: 'white', label: 'WHITE', fill: '#ffffff', variant: 'solid' },
  { id: 'grey', label: 'GREY', fill: '#b5b5b5', variant: 'solid' },
  { id: 'yellow', label: 'YELLOW', fill: '#f5d565', variant: 'solid' },
  { id: 'orange', label: 'ORANGE', fill: '#f28b4a', variant: 'solid' },
  { id: 'pink', label: 'PINK', fill: '#f2a8b8', variant: 'solid' },
  { id: 'purple', label: 'PURPLE', fill: '#9b7ec8', variant: 'solid' },
  { id: 'green', label: 'GREEN', fill: '#6aab6a', variant: 'solid' },
  { id: 'blue', label: 'BLUE', fill: '#6ba3d6', variant: 'solid' },
  { id: 'navy', label: 'NAVY', fill: '#2f3f5f', variant: 'solid' },
  { id: 'black', label: 'BLACK', fill: '#1a1a1a', variant: 'solid' },
  { id: 'stripe', label: 'STRIPE', fill: '#ffffff', variant: 'stripe' },
  { id: 'etc', label: 'ETC', fill: '#f0f0f0', variant: 'etc' },
] as const

export const FILTER_PRODUCT_INFO_OPTIONS = [
  { id: 'freeShipping', label: '무료배송' },
  { id: 'excludeSoldOut', label: '품절 상품 제외' },
] as const

export type FilterProductInfoId = (typeof FILTER_PRODUCT_INFO_OPTIONS)[number]['id']
