import { EDITORIAL_EVENTS } from '../data/editorialEvents'
import { editorialAsset } from './editorialAssetUrl'
import { figmaAsset } from './figmaAssetUrl'

export type AdminEditorialCategory = 'collection' | 'collabo' | 'keyword'

export type EditorialCollectionBlockType = 'image' | 'products' | 'lookbook_gallery' | 'product_showcase'

export type EditorialShowcaseImageVariant = 'cutout' | 'editorial'

export interface AdminEditorialCollectionImageBlock {
  id: string
  type: 'image'
  imageUrl: string | null
  imageFileName: string | null
}

export interface AdminEditorialCollectionProductsBlock {
  id: string
  type: 'products'
  title: string
  productIds: (number | null)[]
  columns: 4 | 5
}

export interface AdminEditorialShowcaseImageSlot {
  imageUrl: string | null
  imageFileName: string | null
  variant: EditorialShowcaseImageVariant
}

export interface AdminEditorialCollectionLookbookGalleryBlock {
  id: string
  type: 'lookbook_gallery'
  images: AdminEditorialImageSlot[]
}

export interface AdminEditorialCollectionProductShowcaseBlock {
  id: string
  type: 'product_showcase'
  title: string
  subtitle: string
  productId: number | null
  gallery: AdminEditorialShowcaseImageSlot[]
}

export type EditorialCatalogProductGridId = 'shoes' | 'bagacc'

/** Figma 151:4481 — SHOES / BAG & ACC 6-column product grids below standalone products. */
export interface AdminEditorialCatalogProductGrid {
  id: EditorialCatalogProductGridId
  title: string
  productIds: (number | null)[]
}

/** Figma 144:4223 — gallery-bottom standalone product (one product per row). */
export interface AdminEditorialStandaloneProduct {
  id: string
  title: string
  subtitle: string
  productId: number | null
}

export type AdminEditorialCollectionBlock =
  | AdminEditorialCollectionImageBlock
  | AdminEditorialCollectionProductsBlock
  | AdminEditorialCollectionLookbookGalleryBlock
  | AdminEditorialCollectionProductShowcaseBlock

/** Legacy alias — migrated to `keyword` on load. */
export type LegacyAdminEditorialCategory = 'collection' | 'curation' | 'collabo'

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

export const DEFAULT_COUPON_SECTION_EYEBROW = 'SPECIAL GIFT'
export const DEFAULT_COUPON_SECTION_TITLE = 'COUPON'
export const DEFAULT_COUPON_NOTES_TITLE = '유의사항'
export const DEFAULT_COUPON_DOWNLOAD_LABEL = '쿠폰 다운로드하기'

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
  downloadLabel: string
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
  brandIntroHeading: string
  brandIntroBody: string
  /** Hero info below main banner — date / title / coupon teaser */
  heroInfoShowPeriod: boolean
  heroInfoShowCoupon: boolean
  heroInfoTitle: string
  heroInfoSubtitle: string
  heroCouponTeaser: string
  /** Figma 143:4669 — 2-column masonry gallery below hero info */
  heroGalleryImages: AdminEditorialImageSlot[]
  benefits: AdminEditorialBenefit[]
  giftTitle: string
  giftImageUrl: string | null
  giftImageFileName: string | null
  giftNote: string
  coupons: AdminEditorialCoupon[]
  couponNotes: string[]
  couponSectionEyebrow: string
  couponSectionTitle: string
  couponNotesTitle: string
  lookbookPair: [AdminEditorialImageSlot, AdminEditorialImageSlot]
  middleLookbook: [AdminEditorialImageSlot, AdminEditorialImageSlot]
  featuredProducts: AdminEditorialProductSection
  productTabs: AdminEditorialProductTab[]
  mustItemSection: AdminEditorialProductSection
  sectionOrder: EditorialSectionType[]
  /** EQL-style blocks for COLLECTION category detail pages */
  collectionBlocks: AdminEditorialCollectionBlock[]
  /** Figma 144:4223 — standalone products directly below hero gallery */
  standaloneProducts: AdminEditorialStandaloneProduct[]
  /** Figma 151:4481 — SHOES / BAG & ACC catalog product grids (max 10 each) */
  catalogProductGrids: AdminEditorialCatalogProductGrid[]
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

let remoteConfigCache: AdminEditorialConfig | null = null

export function setEditorialConfigCache(config: AdminEditorialConfig | null): void {
  remoteConfigCache = config
}

/** In-memory Supabase cache after hydrate. Never reads localStorage for storefront truth. */
export function getEffectiveEditorialConfig(): AdminEditorialConfig {
  return remoteConfigCache ?? createDefaultEditorialConfig()
}

/** Mirrors server payload to localStorage — offline cache only, not source of truth. */
export function mirrorAdminEditorialConfigLocally(config: AdminEditorialConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {
    /* ignore quota errors */
  }
}

export const COLLECTION_PRODUCT_SLOTS = 12
export const MAX_COLLECTION_BLOCKS = 20
export const LOOKBOOK_GALLERY_MAX_IMAGES = 16
export const HERO_GALLERY_MAX_IMAGES = 16
export const PRODUCT_SHOWCASE_GALLERY_SLOTS = 5
export const MAX_STANDALONE_PRODUCTS = 8
/** PC storefront grid columns (Figma 151:4481). */
export const CATALOG_PRODUCT_GRID_COLUMNS = 6
export const CATALOG_PRODUCT_GRID_MIN_ROWS = 1
export const CATALOG_PRODUCT_GRID_MAX_ROWS = 6
export const CATALOG_PRODUCT_GRID_DEFAULT_ROWS = 1
/** @deprecated Prefer CATALOG_PRODUCT_GRID_COLUMNS × row count. */
export const CATALOG_PRODUCT_GRID_SLOTS =
  CATALOG_PRODUCT_GRID_COLUMNS * CATALOG_PRODUCT_GRID_DEFAULT_ROWS
export const FEATURED_PRODUCT_SLOTS = 4
export const PRODUCT_TAB_SLOTS = 10
export const MUST_ITEM_SLOTS = 10
export const MAX_PRODUCT_TABS = 4
export const MAX_BENEFITS = 5
export const MAX_COUPONS = 4
export const MAX_COUPON_NOTES = 10
export const MAX_HERO_TABS = 2
export const MAX_EDITORIAL_EVENTS = 20

export const EDITORIAL_CATEGORY_OPTIONS: { value: AdminEditorialCategory; label: string }[] = [
  { value: 'collection', label: 'COLLECTION' },
  { value: 'collabo', label: 'COLLABO' },
  { value: 'keyword', label: 'KEYWORD' },
]

export function normalizeEditorialCategory(raw: unknown): AdminEditorialCategory {
  if (raw === 'curation') return 'keyword'
  if (raw === 'collection' || raw === 'collabo' || raw === 'keyword') return raw
  return 'collection'
}

export function editorialCategoryLabel(category: AdminEditorialCategory): string {
  return EDITORIAL_CATEGORY_OPTIONS.find((item) => item.value === category)?.label ?? 'COLLECTION'
}

function emptyImageSlot(): AdminEditorialImageSlot {
  return { imageUrl: null, imageFileName: null }
}

function emptyProductIds(count: number): (number | null)[] {
  return Array.from({ length: count }, () => null)
}

function catalogGridDefaultSlotCount(): number {
  return CATALOG_PRODUCT_GRID_COLUMNS * CATALOG_PRODUCT_GRID_DEFAULT_ROWS
}

/** Keeps catalog grid slots as multiples of 6 (min 1 row, max 6 rows). */
export function normalizeCatalogProductGridIds(ids: unknown): (number | null)[] {
  const source = Array.isArray(ids) ? ids : []
  const parsed: (number | null)[] = source.map((value) => {
    if (value == null) return null
    const numeric = Number(value)
    if (!Number.isFinite(numeric)) return null
    return numeric
  })

  const minSlots = CATALOG_PRODUCT_GRID_COLUMNS * CATALOG_PRODUCT_GRID_MIN_ROWS
  const maxSlots = CATALOG_PRODUCT_GRID_COLUMNS * CATALOG_PRODUCT_GRID_MAX_ROWS
  let length = Math.max(minSlots, parsed.length)
  length = Math.ceil(length / CATALOG_PRODUCT_GRID_COLUMNS) * CATALOG_PRODUCT_GRID_COLUMNS
  length = Math.min(length, maxSlots)

  return Array.from({ length }, (_, index) => parsed[index] ?? null)
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
    downloadLabel: DEFAULT_COUPON_DOWNLOAD_LABEL,
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

export function createEmptyCollectionImageBlock(): AdminEditorialCollectionImageBlock {
  return {
    id: `collection-img-${Date.now()}`,
    type: 'image',
    imageUrl: null,
    imageFileName: null,
  }
}

export function createEmptyCollectionProductsBlock(): AdminEditorialCollectionProductsBlock {
  return {
    id: `collection-products-${Date.now()}`,
    type: 'products',
    title: '',
    productIds: emptyProductIds(COLLECTION_PRODUCT_SLOTS),
    columns: 5,
  }
}

export function emptyShowcaseImageSlot(
  variant: EditorialShowcaseImageVariant = 'cutout',
): AdminEditorialShowcaseImageSlot {
  return { imageUrl: null, imageFileName: null, variant }
}

export function createEmptyCollectionLookbookGalleryBlock(): AdminEditorialCollectionLookbookGalleryBlock {
  return {
    id: `collection-gallery-${Date.now()}`,
    type: 'lookbook_gallery',
    images: [],
  }
}

export function createEmptyStandaloneProduct(): AdminEditorialStandaloneProduct {
  return {
    id: `standalone-product-${Date.now()}`,
    title: '',
    subtitle: '',
    productId: null,
  }
}

export function createDefaultCatalogProductGrids(): AdminEditorialCatalogProductGrid[] {
  return [
    {
      id: 'shoes',
      title: 'SHOES',
      productIds: emptyProductIds(catalogGridDefaultSlotCount()),
    },
    {
      id: 'bagacc',
      title: 'BAG & ACC',
      productIds: emptyProductIds(catalogGridDefaultSlotCount()),
    },
  ]
}

export function createEmptyCollectionProductShowcaseBlock(): AdminEditorialCollectionProductShowcaseBlock {
  return {
    id: `collection-showcase-${Date.now()}`,
    type: 'product_showcase',
    title: '',
    subtitle: '',
    productId: null,
    gallery: Array.from({ length: PRODUCT_SHOWCASE_GALLERY_SLOTS }, (_, index) =>
      emptyShowcaseImageSlot(index >= 3 ? 'editorial' : 'cutout'),
    ),
  }
}

export function createDefaultCollectionBlocks(): AdminEditorialCollectionBlock[] {
  return [createEmptyCollectionLookbookGalleryBlock(), createEmptyCollectionProductsBlock()]
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
    brandIntroHeading: '',
    brandIntroBody: '',
    heroInfoShowPeriod: true,
    heroInfoShowCoupon: false,
    heroInfoTitle: '',
    heroInfoSubtitle: '',
    heroCouponTeaser: '',
    heroGalleryImages: [],
    benefits: [createEmptyEditorialBenefit()],
    giftTitle: '',
    giftImageUrl: null,
    giftImageFileName: null,
    giftNote: '',
    coupons: [],
    couponNotes: [],
    couponSectionEyebrow: DEFAULT_COUPON_SECTION_EYEBROW,
    couponSectionTitle: DEFAULT_COUPON_SECTION_TITLE,
    couponNotesTitle: DEFAULT_COUPON_NOTES_TITLE,
    lookbookPair: [emptyImageSlot(), emptyImageSlot()],
    middleLookbook: [emptyImageSlot(), emptyImageSlot()],
    featuredProducts: defaultProductSection('FEATURED', FEATURED_PRODUCT_SLOTS, 4, true),
    productTabs: [createEmptyEditorialProductTab()],
    mustItemSection: defaultProductSection('MUST ITEM', MUST_ITEM_SLOTS, 5),
    sectionOrder: [...DEFAULT_EDITORIAL_SECTION_ORDER],
    collectionBlocks: createDefaultCollectionBlocks(),
    standaloneProducts: [],
    catalogProductGrids: createDefaultCatalogProductGrids(),
    createdAt: new Date().toISOString(),
  }
}

function parseEditorialIdNumber(id: string): number {
  const match = /^editorial-(\d+)$/.exec(id)
  return match ? Number(match[1]) : 0
}

function hasValidAdminCoupon(coupon: Partial<AdminEditorialCoupon> | undefined): boolean {
  return typeof coupon?.value === 'string' && coupon.value.trim().length > 0
}

export function getEventFallback(id: string | undefined): AdminEditorialEvent {
  if (id === 'editorial-01') return createEditorial01Preset()
  return createEmptyEditorialEvent(parseEditorialIdNumber(id ?? '') || 1)
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
export function createEditorial01Preset(): AdminEditorialEvent {
  return {
    id: 'editorial-01',
    enabled: true,
    thumbnailUrl: editorialAsset('01.png'),
    thumbnailFileName: null,
    title: '스페셜 이슈 | 26SS 오찌 데이도트 에디션 발매 단독 15%',
    period: '2026.06.13 - 2026.06.24',
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
    brandIntroHeading: 'OTZ ROMARY : DAY DOT EDITION',
    brandIntroBody:
      '도트 패턴이 돋보이는 26SS 시즌 컬렉션. 데일리와 스페셜 데이를 아우르는 로마리 라인업을 만나보세요.',
    heroInfoShowPeriod: true,
    heroInfoShowCoupon: true,
    heroInfoTitle: 'limited edition\nCOCOA MAUVE',
    heroInfoSubtitle:
      '모델 서지수와 함께한 코코아 모브 에디션이 무신사 단독 선발매되었습니다.\n\n오찌에서 사랑받은 로미타와 로마리, 그리고 플랩 스니커즈까지\n부드럽고 감각적인 스웨이드 소재로 찾아왔어요.\n미니멀한 감성이 고급스러운 오찌 스웨이드 숄더백도 함께 만나보세요.',
    heroCouponTeaser: '15% 장바구니 쿠폰을 드립니다.',
    heroGalleryImages: [
      { imageUrl: editorialAsset('file_1779094089632_735498899_zk705v.jpg'), imageFileName: null },
      { imageUrl: editorialAsset('file_1779094091918_737785099_t3nj62.webp'), imageFileName: null },
      { imageUrl: editorialAsset('file_1779094091919_737785599_6pideo.webp'), imageFileName: null },
      { imageUrl: editorialAsset('file_1779094091921_737787199_6mien5.webp'), imageFileName: null },
      { imageUrl: editorialAsset('file_1779094091922_737789000_82ohql.webp'), imageFileName: null },
      { imageUrl: editorialAsset('file_1779094091923_737789300_7pg1o6.webp'), imageFileName: null },
      { imageUrl: editorialAsset('641238338_18076457318452144_4351508791800917445_n.jpg'), imageFileName: null },
      { imageUrl: editorialAsset('642144030_18076372550452144_5408059011483960542_n.jpg'), imageFileName: null },
    ],
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
        condition1: 'ID당 3회 발급/사용 가능',
        condition2: '',
        validPeriod: '2026.03.01 - 2026.03.31',
        applicableProducts: '오찌 로마리 도트팩',
        downloadLabel: DEFAULT_COUPON_DOWNLOAD_LABEL,
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
        downloadLabel: DEFAULT_COUPON_DOWNLOAD_LABEL,
      },
    ],
    couponNotes: [
      '기획전 내 아우터 상품에 적용 가능한 선착순 쿠폰 입니다. (일부상품 제외)',
      '12월 31일까지 사용 가능합니다.',
      '선착순 수량 소진 시 사전고지 없이 중단됩니다.',
      '업체사정 및 예산소진에 따라 사전고지없이 중단될 수 있습니다.',
    ],
    couponSectionEyebrow: DEFAULT_COUPON_SECTION_EYEBROW,
    couponSectionTitle: DEFAULT_COUPON_SECTION_TITLE,
    couponNotesTitle: DEFAULT_COUPON_NOTES_TITLE,
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
    standaloneProducts: [
      {
        id: 'standalone-1',
        title: 'ROMARY SNEAKERS',
        subtitle: '로마리 밴딩 SE 스니커즈 다크 브라운 FLOTGA1W59',
        productId: 1,
      },
      {
        id: 'standalone-2',
        title: 'SUEDE SHOULDER BAG',
        subtitle: '스웨이드 숄더백 핑크 OZBGFA308P',
        productId: 2,
      },
    ],
    catalogProductGrids: [
      {
        id: 'shoes',
        title: 'SHOES',
        productIds: [1, 2, 3, 4, 5, 6, 7, 8, null, null],
      },
      {
        id: 'bagacc',
        title: 'BAG & ACC',
        productIds: [3, 4, 5, 6, 7, 8, 1, 2, null, null],
      },
    ],
    collectionBlocks: [],
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
    brandIntroHeading: '',
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
    collectionBlocks:
      item.category === 'collection'
        ? [
            {
              id: `collection-img-${item.id}`,
              type: 'image',
              imageUrl: item.thumbnail,
              imageFileName: null,
            },
            {
              id: `collection-products-${item.id}`,
              type: 'products',
              title: item.categoryLabel,
              productIds: [1, 2, 3, 4, 5, 6, 7, 8, null, null, null, null],
              columns: 4,
            },
          ]
        : createDefaultCollectionBlocks(),
  }
}

export function createDefaultEditorialConfig(): AdminEditorialConfig {
  return { version: 1, events: [createEditorial01Preset()], updatedAt: null }
}

function parseAdminProductId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function normalizeImageSlot(slot: Partial<AdminEditorialImageSlot> | undefined): AdminEditorialImageSlot {
  return {
    imageUrl: typeof slot?.imageUrl === 'string' ? slot.imageUrl : null,
    imageFileName: typeof slot?.imageFileName === 'string' ? slot.imageFileName : null,
  }
}

function hasImageSlotUrl(slot: Partial<AdminEditorialImageSlot> | undefined): boolean {
  return typeof slot?.imageUrl === 'string' && slot.imageUrl.trim().length > 0
}

function normalizeHeroGalleryImages(
  event: Partial<AdminEditorialEvent>,
  fallback: AdminEditorialEvent,
): AdminEditorialImageSlot[] {
  const raw = Array.isArray(event.heroGalleryImages) ? event.heroGalleryImages : []
  const useFallback = raw.length === 0 || !raw.some(hasImageSlotUrl)

  let source = useFallback ? fallback.heroGalleryImages : raw

  if (!source.some(hasImageSlotUrl)) {
    const blocks = Array.isArray(event.collectionBlocks) ? event.collectionBlocks : []
    const lookbookBlock = blocks.find((block) => block?.type === 'lookbook_gallery')
    if (lookbookBlock?.type === 'lookbook_gallery' && Array.isArray(lookbookBlock.images)) {
      source = lookbookBlock.images
    }
  }

  let normalized = source
    .slice(0, HERO_GALLERY_MAX_IMAGES)
    .map((slot) => normalizeImageSlot(slot))
    .filter(hasImageSlotUrl)

  if (!normalized.length) {
    const category = normalizeEditorialCategory(event.category ?? fallback.category)
    if (category === 'collection' || category === 'collabo') {
      normalized = createEditorial01Preset()
        .heroGalleryImages.slice(0, HERO_GALLERY_MAX_IMAGES)
        .filter(hasImageSlotUrl)
    }
  }

  return normalized
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
    downloadLabel:
      typeof coupon.downloadLabel === 'string' && coupon.downloadLabel.trim()
        ? coupon.downloadLabel
        : fallback.downloadLabel || DEFAULT_COUPON_DOWNLOAD_LABEL,
  }
}

function normalizeShowcaseImageSlot(
  slot: Partial<AdminEditorialShowcaseImageSlot> | undefined,
  index: number,
): AdminEditorialShowcaseImageSlot {
  const defaultVariant: EditorialShowcaseImageVariant = index >= 3 ? 'editorial' : 'cutout'
  return {
    imageUrl: typeof slot?.imageUrl === 'string' ? slot.imageUrl : null,
    imageFileName: typeof slot?.imageFileName === 'string' ? slot.imageFileName : null,
    variant: slot?.variant === 'editorial' || slot?.variant === 'cutout' ? slot.variant : defaultVariant,
  }
}

function normalizeStandaloneProduct(
  item: Partial<AdminEditorialStandaloneProduct>,
  index: number,
): AdminEditorialStandaloneProduct {
  return {
    id: typeof item.id === 'string' ? item.id : `standalone-product-${index}`,
    title: typeof item.title === 'string' ? item.title : '',
    subtitle: typeof item.subtitle === 'string' ? item.subtitle : '',
    productId: parseAdminProductId(item.productId),
  }
}

function standaloneProductsFromCollectionBlocks(
  blocks: unknown,
): AdminEditorialStandaloneProduct[] {
  if (!Array.isArray(blocks)) return []
  return blocks
    .filter((block): block is AdminEditorialCollectionProductShowcaseBlock => block?.type === 'product_showcase')
    .map((block, index) => normalizeStandaloneProduct(block, index))
}

function normalizeStandaloneProducts(
  event: Partial<AdminEditorialEvent>,
  fallback: AdminEditorialEvent,
): AdminEditorialStandaloneProduct[] {
  const raw = Array.isArray(event.standaloneProducts) ? event.standaloneProducts : []
  const hasConfigured = raw.some(
    (item) =>
      parseAdminProductId(item?.productId) != null ||
      (typeof item?.title === 'string' && item.title.trim().length > 0),
  )

  const source = hasConfigured
    ? raw
    : standaloneProductsFromCollectionBlocks(event.collectionBlocks).length
      ? standaloneProductsFromCollectionBlocks(event.collectionBlocks)
      : fallback.standaloneProducts

  return source
    .slice(0, MAX_STANDALONE_PRODUCTS)
    .map((item, index) => normalizeStandaloneProduct(item as Partial<AdminEditorialStandaloneProduct>, index))
    .filter((item) => item.productId != null || item.title.trim().length > 0)
}

function isCatalogProductGridBlockTitle(title: string): boolean {
  const normalized = title.trim().toUpperCase().replace(/\s+/g, ' ')
  return normalized === 'SHOES' || normalized === 'BAG & ACC'
}

function catalogGridsFromCollectionBlocks(
  blocks: unknown,
): AdminEditorialCatalogProductGrid[] | null {
  if (!Array.isArray(blocks)) return null

  const shoesBlock = blocks.find(
    (block) =>
      block?.type === 'products' && block.title?.trim().toUpperCase() === 'SHOES',
  )
  const bagBlock = blocks.find(
    (block) =>
      block?.type === 'products' &&
      block.title?.trim().toUpperCase().replace(/\s+/g, ' ') === 'BAG & ACC',
  )

  if (!shoesBlock && !bagBlock) return null

  return createDefaultCatalogProductGrids().map((grid) => {
    if (grid.id === 'shoes' && shoesBlock) {
      return {
        ...grid,
        productIds: normalizeCatalogProductGridIds(shoesBlock.productIds),
      }
    }
    if (grid.id === 'bagacc' && bagBlock) {
      return {
        ...grid,
        productIds: normalizeCatalogProductGridIds(bagBlock.productIds),
      }
    }
    return grid
  })
}

function normalizeCatalogProductGrid(
  grid: Partial<AdminEditorialCatalogProductGrid>,
  defaultGrid: AdminEditorialCatalogProductGrid,
): AdminEditorialCatalogProductGrid {
  const id =
    grid.id === 'shoes' || grid.id === 'bagacc' ? grid.id : defaultGrid.id

  return {
    id,
    title:
      typeof grid.title === 'string' && grid.title.trim()
        ? grid.title
        : defaultGrid.title,
    productIds: normalizeCatalogProductGridIds(grid.productIds),
  }
}

function normalizeCatalogProductGrids(
  event: Partial<AdminEditorialEvent>,
  fallback: AdminEditorialEvent,
): AdminEditorialCatalogProductGrid[] {
  const defaults = fallback.catalogProductGrids?.length
    ? fallback.catalogProductGrids
    : createDefaultCatalogProductGrids()
  const raw = Array.isArray(event.catalogProductGrids) ? event.catalogProductGrids : []

  if (raw.length) {
    const byId = new Map(
      raw
        .filter((grid) => grid?.id === 'shoes' || grid?.id === 'bagacc')
        .map((grid) => [grid.id, grid]),
    )
    return defaults.map((defaultGrid) =>
      normalizeCatalogProductGrid(byId.get(defaultGrid.id) ?? {}, defaultGrid),
    )
  }

  const migrated = catalogGridsFromCollectionBlocks(event.collectionBlocks)
  if (migrated) return migrated

  return defaults.map((defaultGrid) => normalizeCatalogProductGrid({}, defaultGrid))
}

function stripCatalogProductGridBlocks(
  blocks: AdminEditorialCollectionBlock[],
): AdminEditorialCollectionBlock[] {
  return blocks.filter(
    (block) => !(block.type === 'products' && isCatalogProductGridBlockTitle(block.title)),
  )
}

function normalizeCollectionBlock(
  block: Partial<AdminEditorialCollectionBlock>,
  index: number,
): AdminEditorialCollectionBlock | null {
  if (block.type === 'products') {
    return {
      id: typeof block.id === 'string' ? block.id : `collection-products-${index}`,
      type: 'products',
      title: typeof block.title === 'string' ? block.title : '',
      columns: block.columns === 4 ? 4 : 5,
      productIds: normalizeProductIds(block.productIds, COLLECTION_PRODUCT_SLOTS),
    }
  }
  if (block.type === 'lookbook_gallery') {
    const images = Array.isArray(block.images)
      ? block.images
          .slice(0, LOOKBOOK_GALLERY_MAX_IMAGES)
          .map((slot) => normalizeImageSlot(slot as Partial<AdminEditorialImageSlot>))
      : []
    return {
      id: typeof block.id === 'string' ? block.id : `collection-gallery-${index}`,
      type: 'lookbook_gallery',
      images,
    }
  }
  if (block.type === 'product_showcase') {
    const gallery = Array.isArray(block.gallery)
      ? block.gallery
          .slice(0, PRODUCT_SHOWCASE_GALLERY_SLOTS)
          .map((slot, slotIndex) => normalizeShowcaseImageSlot(slot as Partial<AdminEditorialShowcaseImageSlot>, slotIndex))
      : Array.from({ length: PRODUCT_SHOWCASE_GALLERY_SLOTS }, (_, slotIndex) =>
          emptyShowcaseImageSlot(slotIndex >= 3 ? 'editorial' : 'cutout'),
        )
    while (gallery.length < PRODUCT_SHOWCASE_GALLERY_SLOTS) {
      gallery.push(emptyShowcaseImageSlot(gallery.length >= 3 ? 'editorial' : 'cutout'))
    }
    return {
      id: typeof block.id === 'string' ? block.id : `collection-showcase-${index}`,
      type: 'product_showcase',
      title: typeof block.title === 'string' ? block.title : '',
      subtitle: typeof block.subtitle === 'string' ? block.subtitle : '',
      productId: parseAdminProductId(block.productId),
      gallery,
    }
  }
  if (block.type === 'image') {
    return {
      id: typeof block.id === 'string' ? block.id : `collection-img-${index}`,
      type: 'image',
      imageUrl: typeof block.imageUrl === 'string' ? block.imageUrl : null,
      imageFileName: typeof block.imageFileName === 'string' ? block.imageFileName : null,
    }
  }
  return null
}

function normalizeCollectionBlocks(
  blocks: unknown,
  fallback: AdminEditorialCollectionBlock[],
  legacyEvent?: Partial<AdminEditorialEvent>,
): AdminEditorialCollectionBlock[] {
  if (Array.isArray(blocks) && blocks.length) {
    const normalized = blocks
      .slice(0, MAX_COLLECTION_BLOCKS)
      .map((block, index) => normalizeCollectionBlock(block as Partial<AdminEditorialCollectionBlock>, index))
      .filter((block): block is AdminEditorialCollectionBlock => block != null)
    if (normalized.length) return normalized
  }

  if (!legacyEvent) return fallback

  const migrated: AdminEditorialCollectionBlock[] = []
  const lookbookSrc = legacyEvent.lookbookPair?.[0]?.imageUrl
  if (typeof lookbookSrc === 'string' && lookbookSrc.trim()) {
    migrated.push({
      id: 'legacy-lookbook',
      type: 'image',
      imageUrl: lookbookSrc,
      imageFileName: legacyEvent.lookbookPair?.[0]?.imageFileName ?? null,
    })
  }
  const featuredIds = legacyEvent.featuredProducts?.productIds
  if (Array.isArray(featuredIds) && featuredIds.some((id) => id != null)) {
    migrated.push({
      id: 'legacy-featured',
      type: 'products',
      title: legacyEvent.featuredProducts?.title ?? '',
      productIds: normalizeProductIds(featuredIds, COLLECTION_PRODUCT_SLOTS),
      columns: legacyEvent.featuredProducts?.columns === 5 ? 5 : 4,
    })
  }
  const middleSrc = legacyEvent.middleLookbook?.[0]?.imageUrl
  if (typeof middleSrc === 'string' && middleSrc.trim()) {
    migrated.push({
      id: 'legacy-middle-lookbook',
      type: 'image',
      imageUrl: middleSrc,
      imageFileName: legacyEvent.middleLookbook?.[0]?.imageFileName ?? null,
    })
  }
  const mustIds = legacyEvent.mustItemSection?.productIds
  if (Array.isArray(mustIds) && mustIds.some((id) => id != null)) {
    migrated.push({
      id: 'legacy-must-item',
      type: 'products',
      title: legacyEvent.mustItemSection?.title ?? 'MUST ITEM',
      productIds: normalizeProductIds(mustIds, COLLECTION_PRODUCT_SLOTS),
      columns: legacyEvent.mustItemSection?.columns === 5 ? 5 : 4,
    })
  }

  return migrated.length ? migrated : fallback
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

  const rawCoupons = Array.isArray(event.coupons) ? event.coupons : []
  const useFallbackCoupons = rawCoupons.length === 0 || !rawCoupons.some(hasValidAdminCoupon)
  const sourceCoupons = useFallbackCoupons ? fallback.coupons : rawCoupons
  const coupons = sourceCoupons
    .slice(0, MAX_COUPONS)
    .map((item, index) =>
      normalizeCoupon(item, fallback.coupons[index] ?? createEmptyEditorialCoupon()),
    )
    .filter(hasValidAdminCoupon)

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
  const category = normalizeEditorialCategory(event.category ?? fallback.category)
  const categoryLabel =
    typeof event.categoryLabel === 'string' && event.categoryLabel.trim()
      ? event.categoryLabel
      : editorialCategoryLabel(category)

  return {
    ...fallback,
    ...event,
    id: typeof event.id === 'string' ? event.id : fallback.id,
    enabled: event.enabled !== false,
    title: typeof event.title === 'string' ? event.title : '',
    period: typeof event.period === 'string' ? event.period : '',
    category,
    categoryLabel,
    thumbnailUrl: typeof event.thumbnailUrl === 'string' ? event.thumbnailUrl : null,
    thumbnailFileName: typeof event.thumbnailFileName === 'string' ? event.thumbnailFileName : null,
    heroTabs,
    mainBannerUrl,
    mainBannerFileName,
    middleBannerUrl: typeof event.middleBannerUrl === 'string' ? event.middleBannerUrl : null,
    middleBannerFileName: typeof event.middleBannerFileName === 'string' ? event.middleBannerFileName : null,
    brandIntroHeading: typeof event.brandIntroHeading === 'string' ? event.brandIntroHeading : '',
    brandIntroBody: typeof event.brandIntroBody === 'string' ? event.brandIntroBody : '',
    heroInfoShowPeriod: event.heroInfoShowPeriod !== false,
    heroInfoShowCoupon:
      event.heroInfoShowCoupon === false
        ? false
        : event.heroInfoShowCoupon === true || coupons.length > 0 || fallback.heroInfoShowCoupon,
    heroInfoTitle: typeof event.heroInfoTitle === 'string' ? event.heroInfoTitle : '',
    heroInfoSubtitle: typeof event.heroInfoSubtitle === 'string' ? event.heroInfoSubtitle : '',
    heroCouponTeaser:
      typeof event.heroCouponTeaser === 'string' && event.heroCouponTeaser.trim()
        ? event.heroCouponTeaser
        : fallback.heroCouponTeaser,
    heroGalleryImages: normalizeHeroGalleryImages(event, fallback),
    benefits: benefits.length ? benefits : [createEmptyEditorialBenefit()],
    giftTitle: typeof event.giftTitle === 'string' ? event.giftTitle : '',
    giftImageUrl: typeof event.giftImageUrl === 'string' ? event.giftImageUrl : null,
    giftImageFileName: typeof event.giftImageFileName === 'string' ? event.giftImageFileName : null,
    giftNote: typeof event.giftNote === 'string' ? event.giftNote : '',
    coupons,
    couponNotes: Array.isArray(event.couponNotes)
      ? event.couponNotes
          .filter((note): note is string => typeof note === 'string')
          .map((note) => note.trim())
          .filter((note) => note.length > 0)
          .slice(0, MAX_COUPON_NOTES)
      : [],
    couponSectionEyebrow:
      typeof event.couponSectionEyebrow === 'string' && event.couponSectionEyebrow.trim()
        ? event.couponSectionEyebrow
        : fallback.couponSectionEyebrow || DEFAULT_COUPON_SECTION_EYEBROW,
    couponSectionTitle:
      typeof event.couponSectionTitle === 'string' && event.couponSectionTitle.trim()
        ? event.couponSectionTitle
        : fallback.couponSectionTitle || DEFAULT_COUPON_SECTION_TITLE,
    couponNotesTitle:
      typeof event.couponNotesTitle === 'string' && event.couponNotesTitle.trim()
        ? event.couponNotesTitle
        : fallback.couponNotesTitle || DEFAULT_COUPON_NOTES_TITLE,
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
    collectionBlocks: stripCatalogProductGridBlocks(
      category === 'collection' || category === 'collabo'
        ? normalizeCollectionBlocks(event.collectionBlocks, fallback.collectionBlocks, event)
        : normalizeCollectionBlocks(event.collectionBlocks, fallback.collectionBlocks),
    ),
    standaloneProducts: normalizeStandaloneProducts(event, fallback),
    catalogProductGrids: normalizeCatalogProductGrids(event, fallback),
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
        normalizeEvent(event, getEventFallback(typeof event.id === 'string' ? event.id : undefined)),
      ),
  )

  return {
    version: 1,
    events,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : null,
  }
}

export function loadAdminEditorialConfig(): AdminEditorialConfig {
  if (remoteConfigCache) return remoteConfigCache

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultEditorialConfig()
    const parsed = normalizeEditorialConfig(JSON.parse(raw) as Partial<AdminEditorialConfig>)
    remoteConfigCache = parsed
    return parsed
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
      normalizeEvent(event, getEventFallback(event.id)),
    ),
    updatedAt: new Date().toISOString(),
  }

  mirrorAdminEditorialConfigLocally(next)
  setEditorialConfigCache(next)
  window.dispatchEvent(new CustomEvent(EDITORIAL_CONFIG_UPDATED_EVENT))
  return next
}

export function getNextEditorialId(events: AdminEditorialEvent[]): string | null {
  if (events.length >= MAX_EDITORIAL_EVENTS) return null
  const maxNum = events.reduce((max, event) => Math.max(max, parseEditorialIdNumber(event.id)), 0)
  return `editorial-${String(maxNum + 1).padStart(2, '0')}`
}
