import { EDITORIAL_EVENTS } from '../data/editorialEvents'
import { editorialAsset } from './editorialAssetUrl'
import { figmaAsset } from './figmaAssetUrl'

export type AdminEditorialCategory = 'collection' | 'curation' | 'collabo'

/** Reorderable content blocks below the hero (Figma 2644:60528). */
export type EditorialSectionType =
  | 'benefit'
  | 'gift'
  | 'coupon'
  | 'lookbook'
  | 'featured_products'
  | 'middle_banner'
  | 'middle_lookbook'
  | 'product_tabs'
  | 'must_item'

export const EDITORIAL_SECTION_TYPES: EditorialSectionType[] = [
  'benefit',
  'gift',
  'coupon',
  'lookbook',
  'featured_products',
  'middle_banner',
  'middle_lookbook',
  'product_tabs',
  'must_item',
]

export const EDITORIAL_SECTION_LABELS: Record<EditorialSectionType, string> = {
  benefit: '혜택',
  gift: '기프트',
  coupon: '쿠폰',
  lookbook: '이미지',
  featured_products: '피처드 상품',
  middle_banner: '중간 배너',
  middle_lookbook: '이미지',
  product_tabs: '상품 탭',
  must_item: 'MUST ITEM',
}

const EDITORIAL_IMAGE_BLOCK_TYPES: EditorialSectionType[] = ['lookbook', 'middle_lookbook']

/** Sequential label for lookbook image blocks: 이미지 01, 이미지 02, … */
export function getEditorialImageBlockLabel(
  sectionOrder: EditorialSectionType[],
  sectionType: EditorialSectionType,
): string {
  if (!EDITORIAL_IMAGE_BLOCK_TYPES.includes(sectionType)) {
    return EDITORIAL_SECTION_LABELS[sectionType]
  }
  let imageIndex = 0
  for (const type of sectionOrder) {
    if (!EDITORIAL_IMAGE_BLOCK_TYPES.includes(type)) continue
    imageIndex += 1
    if (type === sectionType) {
      return `이미지 ${String(imageIndex).padStart(2, '0')}`
    }
  }
  return EDITORIAL_SECTION_LABELS[sectionType]
}

export const DEFAULT_EDITORIAL_SECTION_ORDER: EditorialSectionType[] = [
  'benefit',
  'gift',
  'coupon',
  'lookbook',
  'featured_products',
  'middle_lookbook',
  'product_tabs',
  'must_item',
]

export interface AdminEditorialImageSlot {
  imageUrl: string | null
  imageFileName: string | null
}

export interface AdminEditorialHeroTab {
  id: string
  label: string
  imageUrl: string | null
  imageFileName: string | null
  overlayTitle: string
}

export interface AdminEditorialBenefit {
  id: string
  text: string
}

export interface AdminEditorialCoupon {
  id: string
  kind: 'percent' | 'amount'
  label: string
  value: string
  unit: string
  condition1: string
  condition2: string
  validPeriod: string
  applicableProducts: string
}

export interface AdminEditorialProductSection {
  title: string
  note: string
  columns: 4 | 5
  darkBackground: boolean
  productIds: (number | null)[]
}

export interface AdminEditorialProductTab {
  id: string
  label: string
  sectionTitle: string
  productIds: (number | null)[]
}

export interface AdminEditorialEvent {
  id: string
  enabled: boolean
  thumbnailUrl: string | null
  thumbnailFileName: string | null
  title: string
  period: string
  category: AdminEditorialCategory
  categoryLabel: string
  heroTabs: AdminEditorialHeroTab[]
  mainBannerUrl: string | null
  mainBannerFileName: string | null
  middleBannerUrl: string | null
  middleBannerFileName: string | null
  brandIntroBody: string
  benefits: AdminEditorialBenefit[]
  giftTitle: string
  giftImageUrl: string | null
  giftImageFileName: string | null
  giftNote: string
  coupons: AdminEditorialCoupon[]
  couponNotes: string[]
  lookbookPair: [AdminEditorialImageSlot, AdminEditorialImageSlot]
  middleLookbook: [AdminEditorialImageSlot, AdminEditorialImageSlot]
  featuredProducts: AdminEditorialProductSection
  productTabs: AdminEditorialProductTab[]
  mustItemSection: AdminEditorialProductSection
  sectionOrder: EditorialSectionType[]
  /** ISO timestamp — newest entries sort to the top of the list */
  createdAt: string
}

export interface AdminEditorialConfig {
  version: 1
  events: AdminEditorialEvent[]
  updatedAt: string | null
}

export const EDITORIAL_CONFIG_UPDATED_EVENT = 'otz-editorial-config-updated'
const STORAGE_KEY = 'otz-admin-editorial'

export const FEATURED_PRODUCT_SLOTS = 4
export const PRODUCT_TAB_SLOTS = 10
export const MUST_ITEM_SLOTS = 10
export const MAX_PRODUCT_TABS = 4
export const MAX_BENEFITS = 5
export const MAX_COUPONS = 4
export const MAX_HERO_TABS = 2
export const MAX_EDITORIAL_EVENTS = 20

export const EDITORIAL_CATEGORY_OPTIONS: { value: AdminEditorialCategory; label: string }[] = [
  { value: 'collection', label: 'COLLECTION' },
  { value: 'curation', label: 'CURATION' },
  { value: 'collabo', label: 'COLLABO' },
]

function emptyImageSlot(): AdminEditorialImageSlot {
  return { imageUrl: null, imageFileName: null }
}

function emptyProductIds(count: number): (number | null)[] {
  return Array.from({ length: count }, () => null)
}

function defaultProductSection(
  title: string,
  slots: number,
  columns: 4 | 5,
  darkBackground = false,
): AdminEditorialProductSection {
  return {
    title,
    note: '',
    columns,
    darkBackground,
    productIds: emptyProductIds(slots),
  }
}

export function createEmptyEditorialHeroTab(suffix = ''): AdminEditorialHeroTab {
  return {
    id: `hero-${Date.now()}${suffix}`,
    label: '',
    imageUrl: null,
    imageFileName: null,
    overlayTitle: '',
  }
}

export function createEmptyEditorialBenefit(): AdminEditorialBenefit {
  return { id: `benefit-${Date.now()}`, text: '' }
}

export function createEmptyEditorialCoupon(): AdminEditorialCoupon {
  return {
    id: `coupon-${Date.now()}`,
    kind: 'percent',
    label: '',
    value: '',
    unit: '%',
    condition1: '',
    condition2: '',
    validPeriod: '',
    applicableProducts: '',
  }
}

export function createEmptyEditorialProductTab(): AdminEditorialProductTab {
  return {
    id: `tab-${Date.now()}`,
    label: '',
    sectionTitle: '',
    productIds: emptyProductIds(PRODUCT_TAB_SLOTS),
  }
}

export function createEmptyEditorialEvent(index = 1): AdminEditorialEvent {
  const id = `editorial-${String(index).padStart(2, '0')}`
  return {
    id,
    enabled: true,
    thumbnailUrl: null,
    thumbnailFileName: null,
    title: '',
    period: '',
    category: 'collection',
    categoryLabel: 'COLLECTION',
    heroTabs: [createEmptyEditorialHeroTab()],
    mainBannerUrl: null,
    mainBannerFileName: null,
    middleBannerUrl: null,
    middleBannerFileName: null,
    brandIntroBody: '',
    benefits: [createEmptyEditorialBenefit()],
    giftTitle: '',
    giftImageUrl: null,
    giftImageFileName: null,
    giftNote: '',
    coupons: [],
    couponNotes: [],
    lookbookPair: [emptyImageSlot(), emptyImageSlot()],
    middleLookbook: [emptyImageSlot(), emptyImageSlot()],
    featuredProducts: defaultProductSection('FEATURED', FEATURED_PRODUCT_SLOTS, 4, true),
    productTabs: [createEmptyEditorialProductTab()],
    mustItemSection: defaultProductSection('MUST ITEM', MUST_ITEM_SLOTS, 5),
    sectionOrder: [...DEFAULT_EDITORIAL_SECTION_ORDER],
    createdAt: new Date().toISOString(),
  }
}

function parseEditorialIdNumber(id: string): number {
  const match = /^editorial-(\d+)$/.exec(id)
  return match ? Number(match[1]) : 0
}

function inferLegacyEditorialCreatedAt(id: string): string {
  const index = parseEditorialIdNumber(id)
  if (!index) return new Date().toISOString()
  return new Date(Date.UTC(2020, 0, index)).toISOString()
}

/** Newest first — later createdAt / higher id at the top. */
export function compareEditorialEventsNewestFirst(
  a: AdminEditorialEvent,
  b: AdminEditorialEvent,
): number {
  const aMs = Date.parse(a.createdAt)
  const bMs = Date.parse(b.createdAt)
  if (Number.isFinite(aMs) && Number.isFinite(bMs) && aMs !== bMs) return bMs - aMs
  return parseEditorialIdNumber(b.id) - parseEditorialIdNumber(a.id)
}

export function sortEditorialEventsNewestFirst(events: AdminEditorialEvent[]): AdminEditorialEvent[] {
  return [...events].sort(compareEditorialEventsNewestFirst)
}

export function normalizeSectionOrder(order: unknown): EditorialSectionType[] {
  if (!Array.isArray(order)) return [...DEFAULT_EDITORIAL_SECTION_ORDER]
  const seen = new Set<EditorialSectionType>()
  const normalized: EditorialSectionType[] = []
  for (const item of order) {
    if (typeof item !== 'string' || !EDITORIAL_SECTION_TYPES.includes(item as EditorialSectionType)) continue
    const type = item as EditorialSectionType
    if (seen.has(type)) continue
    seen.add(type)
    normalized.push(type)
  }
  return normalized.length ? normalized : [...DEFAULT_EDITORIAL_SECTION_ORDER]
}

/** Seeds editorial-01 from Figma mock; other list items get list-only defaults. */
function createEditorial01Preset(): AdminEditorialEvent {
  return {
    id: 'editorial-01',
    enabled: true,
    thumbnailUrl: editorialAsset('01.png'),
    thumbnailFileName: null,
    title: '스페셜 이슈 | 26SS 오찌 데이도트 에디션 발매 단독 15%',
    period: '2026.02.02 - 2026.02.15',
    category: 'collection',
    categoryLabel: 'COLLECTION',
    heroTabs: [
      {
        id: 'hero-main',
        label: '',
        imageUrl: editorialAsset('01.png'),
        imageFileName: null,
        overlayTitle: '',
      },
    ],
    mainBannerUrl: editorialAsset('01.png'),
    mainBannerFileName: null,
    middleBannerUrl: editorialAsset('02.png'),
    middleBannerFileName: null,
    brandIntroBody: '',
    benefits: [
      { id: 'benefit-1', text: '최대 글자(띄워쓰기 공백 포함) 16자' },
      { id: 'benefit-2', text: '일이삼사오육칠팔구십일이삼사오육' },
      { id: 'benefit-3', text: '무료배송 (일부 상품 제외)' },
    ],
    giftTitle: 'OTZ :DOT EDITION GIFT',
    giftImageUrl: figmaAsset('style_05.png'),
    giftImageFileName: null,
    giftNote: '도트 에디션 상품 구매 시 도트 선물박스 증정',
    coupons: [
      {
        id: 'coupon-1',
        kind: 'percent',
        label: '장바구니 쿠폰',
        value: '15',
        unit: '%',
        condition1: '5만원 이상 구매 시',
        condition2: '최대 3,000원 할인',
        validPeriod: '2026.03.01 - 2026.03.31',
        applicableProducts: '오찌 로마리 도트팩',
      },
      {
        id: 'coupon-2',
        kind: 'amount',
        label: 'WEB 쿠폰',
        value: '10,000',
        unit: '원',
        condition1: '5만원 이상 구매 시',
        condition2: '최대 3,000원 할인',
        validPeriod: '2026.03.01 - 2026.03.31',
        applicableProducts: '오찌 로마리 도트팩',
      },
    ],
    couponNotes: [
      '기획전 내 아우터 상품에 적용 가능한 선착순 쿠폰 입니다. (일부상품 제외)',
      '12월 31일까지 사용 가능합니다.',
      '선착순 수량 소진 시 사전고지 없이 중단됩니다.',
      '업체사정 및 예산소진에 따라 사전고지없이 중단될 수 있습니다.',
    ],
    lookbookPair: [{ imageUrl: figmaAsset('lookbook_01.png'), imageFileName: null }, emptyImageSlot()],
    middleLookbook: [{ imageUrl: figmaAsset('lookbook_03.png'), imageFileName: null }, emptyImageSlot()],
    featuredProducts: {
      title: 'OTZ :DOT EDITION',
      note: '',
      columns: 4,
      darkBackground: true,
      productIds: [1, 2, 3, 4],
    },
    productTabs: [
      {
        id: 'day-dot',
        label: 'DAY DOT',
        sectionTitle: 'OTZ ROMARY DAY DOT EDITION',
        productIds: [1, 2, 3, 4, 5, 6, 7, 8, null, null],
      },
      {
        id: 'romary',
        label: 'ROMARY',
        sectionTitle: 'OTZ ROMARY COLLECTION',
        productIds: [3, 4, 5, 6, 7, 8, 1, 2, null, null],
      },
      {
        id: 'new',
        label: 'NEW ARRIVAL',
        sectionTitle: 'OTZ NEW ARRIVAL',
        productIds: [5, 6, 7, 8, 1, 2, 3, 4, null, null],
      },
      {
        id: 'best',
        label: 'BEST ITEM',
        sectionTitle: 'OTZ BEST ITEM',
        productIds: [1, 2, 3, 4, 5, 6, 7, 8, null, null],
      },
    ],
    mustItemSection: {
      title: 'MUST ITEM',
      note: 'OTZ ROMARY DAY DOT EDITION',
      columns: 5,
      darkBackground: false,
      productIds: [1, 2, 3, 4, 5, 6, 7, 8, null, null],
    },
    sectionOrder: [...DEFAULT_EDITORIAL_SECTION_ORDER],
    createdAt: inferLegacyEditorialCreatedAt('editorial-01'),
  }
}

function createListOnlyEvent(item: (typeof EDITORIAL_EVENTS)[number]): AdminEditorialEvent {
  const base = createEmptyEditorialEvent(Number(item.id.replace('editorial-', '')))
  return {
    ...base,
    id: item.id,
    enabled: true,
    thumbnailUrl: item.thumbnail,
    title: item.title,
    period: item.period,
    category: item.category,
    categoryLabel: item.categoryLabel,
    heroTabs: [
      {
        id: 'hero-main',
        label: '',
        imageUrl: item.thumbnail,
        imageFileName: null,
        overlayTitle: '',
      },
    ],
    mainBannerUrl: item.thumbnail,
    middleBannerUrl: null,
    brandIntroBody: '',
    benefits: [{ id: 'benefit-default', text: '에디토리얼 혜택 정보가 준비 중입니다.' }],
    giftTitle: item.categoryLabel,
    giftImageUrl: item.thumbnail,
    giftNote: item.period,
    lookbookPair: [{ imageUrl: item.thumbnail, imageFileName: null }, emptyImageSlot()],
    middleLookbook: [{ imageUrl: item.thumbnail, imageFileName: null }, emptyImageSlot()],
    featuredProducts: {
      ...base.featuredProducts,
      title: item.categoryLabel,
      productIds: [1, 2, 3, 4],
    },
    productTabs: [
      {
        id: 'all',
        label: 'ALL',
        sectionTitle: item.title,
        productIds: [1, 2, 3, 4, 5, 6, 7, 8, null, null],
      },
    ],
    mustItemSection: {
      ...base.mustItemSection,
      productIds: [1, 2, 3, 4, 5, 6, 7, 8, null, null],
    },
  }
}

export function createDefaultEditorialConfig(): AdminEditorialConfig {
  return { version: 1, events: [], updatedAt: null }
}

function normalizeImageSlot(slot: Partial<AdminEditorialImageSlot> | undefined): AdminEditorialImageSlot {
  return {
    imageUrl: typeof slot?.imageUrl === 'string' ? slot.imageUrl : null,
    imageFileName: typeof slot?.imageFileName === 'string' ? slot.imageFileName : null,
  }
}

function normalizeHeroTab(tab: Partial<AdminEditorialHeroTab>, fallback: AdminEditorialHeroTab): AdminEditorialHeroTab {
  return {
    ...fallback,
    ...tab,
    label: typeof tab.label === 'string' ? tab.label : '',
    overlayTitle: typeof tab.overlayTitle === 'string' ? tab.overlayTitle : '',
    imageUrl: typeof tab.imageUrl === 'string' ? tab.imageUrl : null,
    imageFileName: typeof tab.imageFileName === 'string' ? tab.imageFileName : null,
  }
}

function normalizeProductIds(ids: unknown, slotCount: number): (number | null)[] {
  const source = Array.isArray(ids) ? ids : []
  const seen = new Set<number>()
  return Array.from({ length: slotCount }, (_, index) => {
    const value = source[index]
    if (value == null) return null
    const numeric = Number(value)
    if (!Number.isFinite(numeric)) return null
    if (seen.has(numeric)) return null
    seen.add(numeric)
    return numeric
  })
}

function normalizeProductSection(
  section: Partial<AdminEditorialProductSection> | undefined,
  fallback: AdminEditorialProductSection,
  slotCount: number,
): AdminEditorialProductSection {
  return {
    title: typeof section?.title === 'string' ? section.title : fallback.title,
    note: typeof section?.note === 'string' ? section.note : '',
    columns: section?.columns === 5 ? 5 : 4,
    darkBackground: section?.darkBackground === true,
    productIds: normalizeProductIds(section?.productIds, slotCount),
  }
}

function normalizeCoupon(coupon: Partial<AdminEditorialCoupon>, fallback: AdminEditorialCoupon): AdminEditorialCoupon {
  return {
    ...fallback,
    ...coupon,
    kind: coupon.kind === 'amount' ? 'amount' : 'percent',
    unit: typeof coupon.unit === 'string' ? coupon.unit : fallback.unit,
  }
}

function normalizeEvent(event: Partial<AdminEditorialEvent>, fallback: AdminEditorialEvent): AdminEditorialEvent {
  const legacyHeroTabs = (Array.isArray(event.heroTabs) ? event.heroTabs : fallback.heroTabs).slice(0, MAX_HERO_TABS)
  const mainBannerUrl =
    typeof event.mainBannerUrl === 'string' && event.mainBannerUrl.trim()
      ? event.mainBannerUrl
      : typeof legacyHeroTabs[0]?.imageUrl === 'string' && legacyHeroTabs[0].imageUrl.trim()
        ? legacyHeroTabs[0].imageUrl
        : fallback.mainBannerUrl
  const mainBannerFileName =
    typeof event.mainBannerFileName === 'string'
      ? event.mainBannerFileName
      : legacyHeroTabs[0]?.imageFileName ?? fallback.mainBannerFileName
  const heroTabs = [
    {
      id: 'hero-main',
      label: '',
      imageUrl: mainBannerUrl,
      imageFileName: mainBannerFileName,
      overlayTitle: '',
    },
  ]

  const benefits = (Array.isArray(event.benefits) ? event.benefits : fallback.benefits)
    .slice(0, MAX_BENEFITS)
    .map((item, index) => ({
      id: typeof item.id === 'string' ? item.id : `benefit-${index}`,
      text: typeof item.text === 'string' ? item.text : '',
    }))

  const coupons = (Array.isArray(event.coupons) ? event.coupons : fallback.coupons)
    .slice(0, MAX_COUPONS)
    .map((item, index) =>
      normalizeCoupon(item, fallback.coupons[index] ?? createEmptyEditorialCoupon()),
    )

  const productTabs = (Array.isArray(event.productTabs) ? event.productTabs : fallback.productTabs)
    .slice(0, MAX_PRODUCT_TABS)
    .map((tab, index) => {
      const fb = fallback.productTabs[index] ?? createEmptyEditorialProductTab()
      return {
        id: typeof tab.id === 'string' ? tab.id : fb.id,
        label: typeof tab.label === 'string' ? tab.label : '',
        sectionTitle: typeof tab.sectionTitle === 'string' ? tab.sectionTitle : '',
        productIds: normalizeProductIds(tab.productIds, PRODUCT_TAB_SLOTS),
      }
    })

  const lookbookPair = event.lookbookPair ?? fallback.lookbookPair
  const middleLookbook = event.middleLookbook ?? fallback.middleLookbook

  return {
    ...fallback,
    ...event,
    id: typeof event.id === 'string' ? event.id : fallback.id,
    enabled: event.enabled !== false,
    title: typeof event.title === 'string' ? event.title : '',
    period: typeof event.period === 'string' ? event.period : '',
    category:
      event.category === 'curation' || event.category === 'collabo' ? event.category : 'collection',
    categoryLabel: typeof event.categoryLabel === 'string' ? event.categoryLabel : 'COLLECTION',
    thumbnailUrl: typeof event.thumbnailUrl === 'string' ? event.thumbnailUrl : null,
    thumbnailFileName: typeof event.thumbnailFileName === 'string' ? event.thumbnailFileName : null,
    heroTabs,
    mainBannerUrl,
    mainBannerFileName,
    middleBannerUrl: typeof event.middleBannerUrl === 'string' ? event.middleBannerUrl : null,
    middleBannerFileName: typeof event.middleBannerFileName === 'string' ? event.middleBannerFileName : null,
    brandIntroBody: typeof event.brandIntroBody === 'string' ? event.brandIntroBody : '',
    benefits: benefits.length ? benefits : [createEmptyEditorialBenefit()],
    giftTitle: typeof event.giftTitle === 'string' ? event.giftTitle : '',
    giftImageUrl: typeof event.giftImageUrl === 'string' ? event.giftImageUrl : null,
    giftImageFileName: typeof event.giftImageFileName === 'string' ? event.giftImageFileName : null,
    giftNote: typeof event.giftNote === 'string' ? event.giftNote : '',
    coupons,
    couponNotes: Array.isArray(event.couponNotes)
      ? event.couponNotes.filter((note): note is string => typeof note === 'string')
      : [],
    lookbookPair: [normalizeImageSlot(lookbookPair[0]), emptyImageSlot()],
    middleLookbook: [normalizeImageSlot(middleLookbook[0]), emptyImageSlot()],
    featuredProducts: normalizeProductSection(
      event.featuredProducts,
      fallback.featuredProducts,
      FEATURED_PRODUCT_SLOTS,
    ),
    productTabs: productTabs.length ? productTabs : [createEmptyEditorialProductTab()],
    mustItemSection: normalizeProductSection(
      event.mustItemSection,
      fallback.mustItemSection,
      MUST_ITEM_SLOTS,
    ),
    sectionOrder: normalizeSectionOrder(event.sectionOrder ?? fallback.sectionOrder),
    createdAt:
      typeof event.createdAt === 'string' && event.createdAt.trim()
        ? event.createdAt
        : inferLegacyEditorialCreatedAt(
            typeof event.id === 'string' ? event.id : fallback.id,
          ),
  }
}

export function normalizeEditorialConfig(raw: Partial<AdminEditorialConfig> | null | undefined): AdminEditorialConfig {
  if (!raw || !Array.isArray(raw.events)) return createDefaultEditorialConfig()

  const events = sortEditorialEventsNewestFirst(
    raw.events
      .slice(0, MAX_EDITORIAL_EVENTS)
      .map((event) =>
        normalizeEvent(event, createEmptyEditorialEvent(parseEditorialIdNumber(event.id ?? '') || 1)),
      ),
  )

  return {
    version: 1,
    events,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : null,
  }
}

export function loadAdminEditorialConfig(): AdminEditorialConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultEditorialConfig()
    return normalizeEditorialConfig(JSON.parse(raw) as Partial<AdminEditorialConfig>)
  } catch {
    return createDefaultEditorialConfig()
  }
}

export function saveAdminEditorialConfig(
  config: Omit<AdminEditorialConfig, 'version' | 'updatedAt'>,
): AdminEditorialConfig {
  const next: AdminEditorialConfig = {
    version: 1,
    events: config.events.map((event) =>
      normalizeEvent(event, createEmptyEditorialEvent(Number(event.id.replace('editorial-', '')) || 1)),
    ),
    updatedAt: new Date().toISOString(),
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    throw new Error('EDITORIAL_CONFIG_STORAGE_FAILED')
  }

  window.dispatchEvent(new CustomEvent(EDITORIAL_CONFIG_UPDATED_EVENT))
  return next
}

export function getNextEditorialId(events: AdminEditorialEvent[]): string | null {
  if (events.length >= MAX_EDITORIAL_EVENTS) return null
  const maxNum = events.reduce((max, event) => Math.max(max, parseEditorialIdNumber(event.id)), 0)
  return `editorial-${String(maxNum + 1).padStart(2, '0')}`
}
