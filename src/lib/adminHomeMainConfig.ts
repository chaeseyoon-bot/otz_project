export type QuickMenuSlotType = 'image' | 'text' | 'cutout' | 'mixed'

export interface AdminMainBannerSlide {
  id: string
  imageUrl: string | null
  imageFileName: string | null
  title: string
  subtitle: string
  ctaLabel: string
  ctaHref: string
}

export interface AdminQuickMenuSlot {
  id: string
  slotType: QuickMenuSlotType
  /** In-tile label (mixed/text) or bottom caption source for image/cutout. */
  label: string
  /** Bottom caption for mixed slots (Figma quick menu item label below tile). */
  captionLabel: string
  imageUrl: string | null
  imageFileName: string | null
  href: string
  bgColor: string
  textColor: string
}

export interface AdminBrandBanner {
  imageUrl: string | null
  imageFileName: string | null
  body: string
}

export interface AdminSeriesBanner {
  id: string
  title: string
  body: string
  imageUrl: string | null
  imageFileName: string | null
  ctaLabel: string
  ctaHref: string
}

export interface AdminPlanningBanner {
  id: string
  imageUrl: string | null
  imageFileName: string | null
  badge: string
  title: string
  subtitle: string
}

/** Figma 2354:4592 — collection card top tag (exactly 4 labels in admin). */
export interface AdminPlanningCollectionTag {
  id: string
  label: string
}

export interface AdminPlanningCollection {
  id: string
  imageUrl: string | null
  imageFileName: string | null
  /** Main title — max 2 lines (newline-separated). */
  title: string
  /** Selected tag id from {@link AdminPlanningCollectionTag}. */
  tagId: string | null
  linkLabel: string
  linkHref: string
  /** Related product ids — min 1, max 4; home shows registered count at fixed 4-column tile size. */
  productIds: (number | null)[]
}

export type AdminCurationCategoryFilter = 'all' | 'shoes' | 'bagacc'

/** Figma 2424:16202 (MO) / 2601:23305 (PC) — curation copy + 4 product slots. */
export interface AdminCurationProducts {
  /** Default filter when opening the product picker. */
  categoryFilter: AdminCurationCategoryFilter
  productIds: (number | null)[]
  /** Top badge — MO square / PC pill (e.g. CURATION). */
  badge: string
  /** Main title — max 2 lines (newline-separated). */
  title: string
  /** MO bottom-right CTA (Figma 2424:16202). */
  mobileCtaLabel: string
  /** PC left-column link label (Figma 2601:23305). */
  pcLinkLabel: string
  linkHref: string
}

export interface AdminLookbookImageSlot {
  imageUrl: string | null
  imageFileName: string | null
}

export interface AdminStyleBannerCard {
  id: string
  imageUrl: string | null
  imageFileName: string | null
  /** Optional top-left flag on banner (Figma 2601:23377). */
  badge: string | null
  /** Up to 4 related products; home shows all registered (2–4). Thumbnail uses 03 cut. */
  productIds: (number | null)[]
}

/** Figma 2384:7536 / 2601:23377 — styling banner cards with banner image + products. */
export interface AdminStyleBannerSection {
  badge: string
  /** Main title — max 2 lines (newline-separated). */
  title: string
  body: string
  cards: AdminStyleBannerCard[]
}

/** Figma 2786:7841 — home marketing layer popup (MO bottom sheet / PC floating card). */
export interface AdminMarketingPopupSlide {
  id: string
  imageUrl: string | null
  imageFileName: string | null
  /** Main title — newline-supported. */
  title: string
  /** Sub copy — newline-supported. */
  subtitle: string
}

/** Figma 2366:5794 — home lookbook (MO 3 / PC 7 images from archive lookbook). */
export interface AdminLookbookSection {
  /** Archive list item id (e.g. archive-01). null = latest lookbook. */
  archiveLookbookId: string | null
  badge: string
  /** Main title — max 2 lines (newline-separated). */
  title: string
  body: string
  tags: string[]
  mobileCtaLabel: string
  linkHref: string
  /** 7 slots — MO uses 0–2, PC uses 0–6. null imageUrl = archive default. */
  imageSlots: AdminLookbookImageSlot[]
}

export interface AdminHomeMainConfig {
  version: 8
  mainBanners: AdminMainBannerSlide[]
  quickMenuSlots: AdminQuickMenuSlot[]
  brandBanner: AdminBrandBanner
  seriesBanners: AdminSeriesBanner[]
  planningBanners: AdminPlanningBanner[]
  planningCollectionTags: AdminPlanningCollectionTag[]
  planningCollections: AdminPlanningCollection[]
  curationProducts: AdminCurationProducts
  styleBannerSection: AdminStyleBannerSection
  lookbookSection: AdminLookbookSection
  marketingPopupSlides: AdminMarketingPopupSlide[]
  updatedAt: string | null
}

function normalizeQuickMenuSlot(slot: Partial<AdminQuickMenuSlot>, fallback: AdminQuickMenuSlot): AdminQuickMenuSlot {
  return {
    ...fallback,
    ...slot,
    captionLabel: typeof slot.captionLabel === 'string' ? slot.captionLabel : '',
  }
}

export function getQuickMenuCaptionBelow(slot: AdminQuickMenuSlot): string | null {
  if (slot.slotType === 'mixed') {
    const caption = slot.captionLabel.trim()
    return caption || null
  }
  if (slot.slotType === 'image' || slot.slotType === 'cutout') {
    const caption = slot.label.trim()
    return caption || null
  }
  return null
}

export const HOME_MAIN_CONFIG_UPDATED_EVENT = 'otz-home-main-config-updated'

const STORAGE_KEY = 'otz-admin-home-main'

/** Figma 2601:22673 — 6 tiles × 160px + 5 gaps × 10px = 1010px row. */
const DEFAULT_QUICK_MENU: AdminQuickMenuSlot[] = [
  { id: 'qm-1', slotType: 'image', label: '봄 Edition', captionLabel: '', imageUrl: null, imageFileName: null, href: '', bgColor: '#F6F6F6', textColor: '#1A1A1A' },
  {
    id: 'qm-2',
    slotType: 'mixed',
    label: 'Best\nSellers',
    captionLabel: 'BEST',
    imageUrl: null,
    imageFileName: null,
    href: '/best',
    bgColor: '#000000',
    textColor: '#DEDEDE',
  },
  {
    id: 'qm-3',
    slotType: 'mixed',
    label: 'New\nArrivals',
    captionLabel: 'NEW',
    imageUrl: null,
    imageFileName: null,
    href: '/new',
    bgColor: '#444444',
    textColor: '#FFFFFF',
  },
  { id: 'qm-4', slotType: 'image', label: 'SHOES', captionLabel: '', imageUrl: null, imageFileName: null, href: '/category/shoes', bgColor: '#F1F1F1', textColor: '#1A1A1A' },
  { id: 'qm-5', slotType: 'image', label: 'BAGS', captionLabel: '', imageUrl: null, imageFileName: null, href: '/category/shoes?main=bag-acc&sub=가방', bgColor: '#F1F1F1', textColor: '#1A1A1A' },
  { id: 'qm-6', slotType: 'image', label: 'ACC', captionLabel: '', imageUrl: null, imageFileName: null, href: '/category/shoes?main=bag-acc', bgColor: '#F1F1F1', textColor: '#1A1A1A' },
]

export function createEmptyQuickMenuSlot(suffix = ''): AdminQuickMenuSlot {
  return {
    id: `qm-${Date.now()}${suffix}`,
    slotType: 'image',
    label: '',
    captionLabel: '',
    imageUrl: null,
    imageFileName: null,
    href: '',
    bgColor: '#F6F6F6',
    textColor: '#1A1A1A',
  }
}

const DEFAULT_PLANNING: AdminPlanningBanner[] = [
  {
    id: 'planning-1',
    imageUrl: null,
    imageFileName: null,
    badge: '26SS',
    title: '코지 발레코어 슈즈',
    subtitle: '오찌x 론론 핑크와 그레이의 세련된 조합',
  },
]

export const MIN_MARKETING_POPUP_SLIDES = 1
export const MAX_MARKETING_POPUP_SLIDES = 10

const DEFAULT_MARKETING_POPUP_COPY = {
  title: '코코아모브 에디션',
  subtitle: '로마리 스웨이드 시즌 한정\n코코아모브 컬러 특별 에디션 소장하세요',
} as const

const DEFAULT_MARKETING_POPUP_SLIDES: AdminMarketingPopupSlide[] = [
  {
    id: 'promo-1',
    imageUrl: null,
    imageFileName: null,
    title: DEFAULT_MARKETING_POPUP_COPY.title,
    subtitle: DEFAULT_MARKETING_POPUP_COPY.subtitle,
  },
]

function normalizeMarketingPopupSlide(
  raw: Partial<AdminMarketingPopupSlide>,
  fallback: AdminMarketingPopupSlide,
): AdminMarketingPopupSlide {
  return {
    id: typeof raw.id === 'string' && raw.id.trim() ? raw.id : fallback.id,
    imageUrl: typeof raw.imageUrl === 'string' ? raw.imageUrl : raw.imageUrl === null ? null : fallback.imageUrl,
    imageFileName:
      typeof raw.imageFileName === 'string'
        ? raw.imageFileName
        : raw.imageFileName === null
          ? null
          : fallback.imageFileName,
    title: typeof raw.title === 'string' ? raw.title : fallback.title,
    subtitle: typeof raw.subtitle === 'string' ? raw.subtitle : fallback.subtitle,
  }
}

export function normalizeMarketingPopupSlides(
  raw: unknown,
  fallback = DEFAULT_MARKETING_POPUP_SLIDES,
): AdminMarketingPopupSlide[] {
  const source = Array.isArray(raw) && raw.length >= MIN_MARKETING_POPUP_SLIDES ? raw : fallback
  const normalized = source
    .slice(0, MAX_MARKETING_POPUP_SLIDES)
    .map((item, index) =>
      normalizeMarketingPopupSlide(
        item as Partial<AdminMarketingPopupSlide>,
        fallback[index] ?? createEmptyMarketingPopupSlide(`-${index}`),
      ),
    )

  if (normalized.length >= MIN_MARKETING_POPUP_SLIDES) return normalized
  return fallback.map((item) => ({ ...item }))
}

export function createEmptyMarketingPopupSlide(suffix = ''): AdminMarketingPopupSlide {
  return {
    id: `promo-${Date.now()}${suffix}`,
    imageUrl: null,
    imageFileName: null,
    title: '',
    subtitle: '',
  }
}

export function createEmptyPlanningBanner(suffix = ''): AdminPlanningBanner {
  return {
    id: `planning-${Date.now()}${suffix}`,
    imageUrl: null,
    imageFileName: null,
    badge: '',
    title: '',
    subtitle: '',
  }
}

export const PLANNING_COLLECTION_PRODUCT_SLOTS = 4
export const MIN_PLANNING_COLLECTION_PRODUCTS = 1
export const MAX_PLANNING_COLLECTION_PRODUCTS = PLANNING_COLLECTION_PRODUCT_SLOTS
export const MAX_PLANNING_COLLECTIONS = 5

/** Counts non-empty product slots for a planning collection card. */
export function countFilledPlanningCollectionProducts(productIds: (number | null)[]): number {
  return productIds.filter((id) => id != null).length
}

const DEFAULT_COLLECTION_TAGS: AdminPlanningCollectionTag[] = [
  { id: 'pct-1', label: 'COLLECTION' },
  { id: 'pct-2', label: 'LIMITED EDITION' },
  { id: 'pct-3', label: 'NEW' },
  { id: 'pct-4', label: 'COLLABO' },
]

const EMPTY_PRODUCT_IDS: (number | null)[] = [null, null, null, null]

function normalizeProductIds(raw: unknown): (number | null)[] {
  const result: (number | null)[] = [...EMPTY_PRODUCT_IDS]
  if (!Array.isArray(raw)) return result
  for (let i = 0; i < PLANNING_COLLECTION_PRODUCT_SLOTS; i++) {
    const value = raw[i]
    if (value === null || value === undefined || value === '') {
      result[i] = null
      continue
    }
    const numeric = Number(value)
    result[i] = Number.isNaN(numeric) ? null : numeric
  }
  return result
}

function normalizePlanningCollectionTags(
  raw: unknown,
  fallback = DEFAULT_COLLECTION_TAGS,
): AdminPlanningCollectionTag[] {
  const source = Array.isArray(raw) && raw.length > 0 ? raw : fallback
  return DEFAULT_COLLECTION_TAGS.map((defaultTag, index) => {
    const item = source[index] as Partial<AdminPlanningCollectionTag> | undefined
    return {
      id: typeof item?.id === 'string' && item.id.trim() ? item.id : defaultTag.id,
      label: typeof item?.label === 'string' ? item.label : defaultTag.label,
    }
  })
}

function normalizePlanningCollection(
  raw: Partial<AdminPlanningCollection>,
  fallback: AdminPlanningCollection,
): AdminPlanningCollection {
  return {
    ...fallback,
    ...raw,
    title: typeof raw.title === 'string' ? raw.title : fallback.title,
    tagId: typeof raw.tagId === 'string' ? raw.tagId : raw.tagId === null ? null : fallback.tagId,
    linkLabel: typeof raw.linkLabel === 'string' ? raw.linkLabel : fallback.linkLabel,
    linkHref: typeof raw.linkHref === 'string' ? raw.linkHref : fallback.linkHref,
    productIds: normalizeProductIds(raw.productIds ?? fallback.productIds),
  }
}

const DEFAULT_COLLECTIONS: AdminPlanningCollection[] = [
  {
    id: 'collection-1',
    imageUrl: null,
    imageFileName: null,
    title: 'OTZ×UMU\nLove Winter Day',
    tagId: 'pct-1',
    linkLabel: '오찌x우무 바로가기',
    linkHref: '',
    productIds: [...EMPTY_PRODUCT_IDS],
  },
  {
    id: 'collection-2',
    imageUrl: null,
    imageFileName: null,
    title: 'OTZ×LOFA Seoul',
    tagId: 'pct-2',
    linkLabel: '오찌x로파서울 바로가기',
    linkHref: '',
    productIds: [...EMPTY_PRODUCT_IDS],
  },
]

export function createEmptyPlanningCollection(suffix = ''): AdminPlanningCollection {
  return {
    id: `collection-${Date.now()}${suffix}`,
    imageUrl: null,
    imageFileName: null,
    title: '',
    tagId: DEFAULT_COLLECTION_TAGS[0]?.id ?? null,
    linkLabel: '',
    linkHref: '',
    productIds: [...EMPTY_PRODUCT_IDS],
  }
}

/** Clamp collection title to at most 2 lines. */
export function clampPlanningCollectionTitle(value: string): string {
  const lines = value.replace(/\r\n/g, '\n').split('\n')
  if (lines.length <= 2) return value
  return lines.slice(0, 2).join('\n')
}

export const CURATION_PRODUCT_SLOTS = 4

const EMPTY_CURATION_PRODUCT_IDS: (number | null)[] = [null, null, null, null]

function normalizeCurationProductIds(raw: unknown): (number | null)[] {
  const result: (number | null)[] = [...EMPTY_CURATION_PRODUCT_IDS]
  if (!Array.isArray(raw)) return result
  for (let i = 0; i < CURATION_PRODUCT_SLOTS; i++) {
    const value = raw[i]
    if (value === null || value === undefined || value === '') {
      result[i] = null
      continue
    }
    const numeric = Number(value)
    result[i] = Number.isNaN(numeric) ? null : numeric
  }
  return result
}

function normalizeCurationCategoryFilter(raw: unknown): AdminCurationCategoryFilter {
  if (raw === 'shoes' || raw === 'bagacc') return raw
  return 'all'
}

const DEFAULT_CURATION_COPY = {
  badge: 'CURATION',
  title: 'WINTER ACC\nSTYLING',
  mobileCtaLabel: '상품 보러 가기',
  pcLinkLabel: '상품 바로가기',
  linkHref: '',
} as const

/** Clamp curation title to at most 2 lines. */
export function clampCurationTitle(value: string): string {
  const lines = value.replace(/\r\n/g, '\n').split('\n')
  if (lines.length <= 2) return value
  return lines.slice(0, 2).join('\n')
}

export const MAX_STYLE_BANNER_CARDS = 4
export const STYLE_BANNER_PRODUCT_SLOTS = 4

const EMPTY_STYLE_BANNER_PRODUCT_IDS: (number | null)[] = [null, null, null, null]

export const LOOKBOOK_IMAGE_SLOTS = 7
export const LOOKBOOK_MOBILE_VISIBLE_SLOTS = 3

const DEFAULT_LOOKBOOK_TAGS = ['#OTZ', '#SPRING', '#ROMARI'] as const

const DEFAULT_LOOKBOOK_COPY = {
  badge: 'ARCHIVE',
  title: 'SPRING IN\nOTZ',
  body:
    '오찌의 26 스프링 컬렉션은 여유로운 캘리포니아의 휴일을 담았습니다. 캐주얼한 쉐입에 러블리한 포인트를 더한 오찌만의 봄 스타일링 컬렉션을 만나보세요.',
  tags: [...DEFAULT_LOOKBOOK_TAGS],
  mobileCtaLabel: '아카이브 바로가기',
  linkHref: '/archive',
} as const

function createEmptyLookbookImageSlots(): AdminLookbookImageSlot[] {
  return Array.from({ length: LOOKBOOK_IMAGE_SLOTS }, () => ({
    imageUrl: null,
    imageFileName: null,
  }))
}

const DEFAULT_STYLE_BANNER_COPY = {
  badge: 'CORDINATION',
  title: "OTZ'S\nSTYLE LOG",
  body:
    '오찌가 전하는 편안함 위에 당신만의 색깔을 더해보세요.\n매일의 걸음이 즐거워지는 감각적인 스타일링 가이드를\n제안합니다.',
} as const

const DEFAULT_STYLE_BANNER_CARDS: AdminStyleBannerCard[] = [
  {
    id: 'style-1',
    imageUrl: null,
    imageFileName: null,
    badge: 'LIMITED EDITION',
    productIds: [...EMPTY_STYLE_BANNER_PRODUCT_IDS],
  },
  {
    id: 'style-2',
    imageUrl: null,
    imageFileName: null,
    badge: null,
    productIds: [...EMPTY_STYLE_BANNER_PRODUCT_IDS],
  },
  {
    id: 'style-3',
    imageUrl: null,
    imageFileName: null,
    badge: '26SS COLLECTION',
    productIds: [...EMPTY_STYLE_BANNER_PRODUCT_IDS],
  },
]

function normalizeStyleBannerProductIds(raw: unknown): (number | null)[] {
  const result: (number | null)[] = [...EMPTY_STYLE_BANNER_PRODUCT_IDS]
  if (!Array.isArray(raw)) return result
  for (let i = 0; i < STYLE_BANNER_PRODUCT_SLOTS; i++) {
    const value = raw[i]
    if (value === null || value === undefined || value === '') {
      result[i] = null
      continue
    }
    const numeric = Number(value)
    result[i] = Number.isNaN(numeric) ? null : numeric
  }
  return result
}

function normalizeStyleBannerCard(
  raw: Partial<AdminStyleBannerCard>,
  fallback: AdminStyleBannerCard,
): AdminStyleBannerCard {
  return {
    ...fallback,
    ...raw,
    badge:
      typeof raw.badge === 'string'
        ? raw.badge.trim() || null
        : raw.badge === null
          ? null
          : fallback.badge,
    productIds: normalizeStyleBannerProductIds(raw.productIds ?? fallback.productIds),
  }
}

export function createEmptyStyleBannerCard(suffix = ''): AdminStyleBannerCard {
  return {
    id: `style-${Date.now()}${suffix}`,
    imageUrl: null,
    imageFileName: null,
    badge: null,
    productIds: [...EMPTY_STYLE_BANNER_PRODUCT_IDS],
  }
}

export function clampStyleBannerTitle(value: string): string {
  const lines = value.replace(/\r\n/g, '\n').split('\n')
  if (lines.length <= 2) return value
  return lines.slice(0, 2).join('\n')
}

export function normalizeStyleBannerSection(
  raw: Partial<AdminStyleBannerSection> | undefined,
  fallback?: AdminStyleBannerSection,
): AdminStyleBannerSection {
  const base = fallback ?? {
    ...DEFAULT_STYLE_BANNER_COPY,
    cards: DEFAULT_STYLE_BANNER_CARDS.map((card) => ({
      ...card,
      productIds: [...card.productIds],
    })),
  }
  const cardsSource =
    Array.isArray(raw?.cards) && raw.cards.length > 0 ? raw.cards : base.cards

  return {
    badge: typeof raw?.badge === 'string' ? raw.badge : base.badge,
    title: typeof raw?.title === 'string' ? raw.title : base.title,
    body: typeof raw?.body === 'string' ? raw.body : base.body,
    cards: cardsSource
      .slice(0, MAX_STYLE_BANNER_CARDS)
      .map((card, index) =>
        normalizeStyleBannerCard(
          card as Partial<AdminStyleBannerCard>,
          base.cards[index] ?? createEmptyStyleBannerCard(`-${index}`),
        ),
      ),
  }
}

export function clampLookbookTitle(value: string): string {
  const lines = value.replace(/\r\n/g, '\n').split('\n')
  if (lines.length <= 2) return value
  return lines.slice(0, 2).join('\n')
}

function normalizeLookbookTags(raw: unknown): string[] {
  const source = Array.isArray(raw) ? raw : DEFAULT_LOOKBOOK_COPY.tags
  return Array.from({ length: 3 }, (_, index) => {
    const value = source[index]
    return typeof value === 'string' ? value : DEFAULT_LOOKBOOK_TAGS[index] ?? ''
  })
}

function normalizeLookbookImageSlots(raw: unknown): AdminLookbookImageSlot[] {
  const fallback = createEmptyLookbookImageSlots()
  if (!Array.isArray(raw)) return fallback
  return fallback.map((slot, index) => {
    const item = raw[index] as Partial<AdminLookbookImageSlot> | undefined
    return {
      imageUrl: typeof item?.imageUrl === 'string' ? item.imageUrl : null,
      imageFileName: typeof item?.imageFileName === 'string' ? item.imageFileName : null,
    }
  })
}

export function normalizeLookbookSection(
  raw: Partial<AdminLookbookSection> | undefined,
  fallback?: AdminLookbookSection,
): AdminLookbookSection {
  const base = fallback ?? {
    archiveLookbookId: null,
    ...DEFAULT_LOOKBOOK_COPY,
    imageSlots: createEmptyLookbookImageSlots(),
  }
  return {
    archiveLookbookId:
      typeof raw?.archiveLookbookId === 'string'
        ? raw.archiveLookbookId
        : raw?.archiveLookbookId === null
          ? null
          : base.archiveLookbookId,
    badge: typeof raw?.badge === 'string' ? raw.badge : base.badge,
    title: typeof raw?.title === 'string' ? raw.title : base.title,
    body: typeof raw?.body === 'string' ? raw.body : base.body,
    tags: normalizeLookbookTags(raw?.tags ?? base.tags),
    mobileCtaLabel: typeof raw?.mobileCtaLabel === 'string' ? raw.mobileCtaLabel : base.mobileCtaLabel,
    linkHref: typeof raw?.linkHref === 'string' ? raw.linkHref : base.linkHref,
    imageSlots: normalizeLookbookImageSlots(raw?.imageSlots ?? base.imageSlots),
  }
}

export function normalizeCurationProducts(
  raw: Partial<AdminCurationProducts> | undefined,
  fallback?: AdminCurationProducts,
): AdminCurationProducts {
  const base = fallback ?? {
    categoryFilter: 'all' as const,
    productIds: [...EMPTY_CURATION_PRODUCT_IDS],
    ...DEFAULT_CURATION_COPY,
  }
  return {
    categoryFilter: normalizeCurationCategoryFilter(raw?.categoryFilter ?? base.categoryFilter),
    productIds: normalizeCurationProductIds(raw?.productIds ?? base.productIds),
    badge: typeof raw?.badge === 'string' ? raw.badge : base.badge,
    title: typeof raw?.title === 'string' ? raw.title : base.title,
    mobileCtaLabel: typeof raw?.mobileCtaLabel === 'string' ? raw.mobileCtaLabel : base.mobileCtaLabel,
    pcLinkLabel: typeof raw?.pcLinkLabel === 'string' ? raw.pcLinkLabel : base.pcLinkLabel,
    linkHref: typeof raw?.linkHref === 'string' ? raw.linkHref : base.linkHref,
  }
}

const DEFAULT_SERIES: AdminSeriesBanner[] = [
  {
    id: 'series-lomita',
    title: 'LOMITA',
    body: '오찌 아이코닉 LOMITA\n안정적인 플랫폼이 자연스럽게 높이를 더하고\n편안한 균형을 완성합니다.',
    imageUrl: null,
    imageFileName: null,
    ctaLabel: '상품 보러 가기',
    ctaHref: '',
  },
  {
    id: 'series-romari',
    title: 'ROMARI',
    body: '오찌의 대표 라인으로 자리 매김한 ROMARI\n낮은 굽에 스니커즈 아웃솔을 더해 날렵하지만,\n편안한 착화감을 선사합니다.',
    imageUrl: null,
    imageFileName: null,
    ctaLabel: '상품 보러 가기',
    ctaHref: '',
  },
  {
    id: 'series-3300',
    title: '3300',
    body: '오찌의 헤리티지를 담은 3300.\n넓고 둥근 쉐입으로 편안한 착화감과\n여유로운 실루엣을 완성합니다.',
    imageUrl: null,
    imageFileName: null,
    ctaLabel: '상품 보러 가기',
    ctaHref: '',
  },
  {
    id: 'series-topi',
    title: 'TOPI',
    body: '플랫폼 클로그 타입의 감각적인 실루엣, TOPI\n간결한 디자인과 안정적인 착화감으로\n편안한 데일리 스타일을 완성합니다.',
    imageUrl: null,
    imageFileName: null,
    ctaLabel: '상품 보러 가기',
    ctaHref: '',
  },
]

export function createDefaultHomeMainConfig(): AdminHomeMainConfig {
  return {
    version: 8,
    mainBanners: [
      {
        id: 'main-1',
        imageUrl: null,
        imageFileName: null,
        title: 'OTZ x LOFA Seoul',
        subtitle: '감각적인 라이프스타일 브랜드 로파서울과의 만남',
        ctaLabel: '쇼핑 바로가기',
        ctaHref: '/new',
      },
    ],
    quickMenuSlots: DEFAULT_QUICK_MENU.map((slot) => ({ ...slot })),
    brandBanner: {
      imageUrl: null,
      imageFileName: null,
      body:
        '미국 캘리포니아주의 말리부에서 탄생한 오찌는\n캘리포니아의 온화한 기후에서 영감 받아\n일상을 여행처럼 향유하는 라이프스타일을 제안합니다',
    },
    seriesBanners: DEFAULT_SERIES.map((item) => ({ ...item })),
    planningBanners: DEFAULT_PLANNING.map((item) => ({ ...item })),
    planningCollectionTags: DEFAULT_COLLECTION_TAGS.map((item) => ({ ...item })),
    planningCollections: DEFAULT_COLLECTIONS.map((item) => ({ ...item, productIds: [...item.productIds] })),
    curationProducts: {
      categoryFilter: 'all',
      productIds: [...EMPTY_CURATION_PRODUCT_IDS],
      ...DEFAULT_CURATION_COPY,
    },
    styleBannerSection: {
      ...DEFAULT_STYLE_BANNER_COPY,
      cards: DEFAULT_STYLE_BANNER_CARDS.map((card) => ({
        ...card,
        productIds: [...card.productIds],
      })),
    },
    lookbookSection: {
      archiveLookbookId: null,
      ...DEFAULT_LOOKBOOK_COPY,
      imageSlots: createEmptyLookbookImageSlots(),
    },
    marketingPopupSlides: DEFAULT_MARKETING_POPUP_SLIDES.map((slide) => ({ ...slide })),
    updatedAt: null,
  }
}

function migrateLegacyConfig(raw: Record<string, unknown>): AdminHomeMainConfig {
  const defaults = createDefaultHomeMainConfig()
  const legacyUrl = typeof raw.bannerImageUrl === 'string' ? raw.bannerImageUrl : null
  const legacyName = typeof raw.bannerFileName === 'string' ? raw.bannerFileName : null

  if (legacyUrl) {
    defaults.mainBanners[0] = {
      ...defaults.mainBanners[0],
      imageUrl: legacyUrl,
      imageFileName: legacyName,
    }
  }

  return defaults
}

function migrateHomeMainConfig(parsed: Partial<AdminHomeMainConfig>): AdminHomeMainConfig {
  const defaults = createDefaultHomeMainConfig()
  const planningBanners =
    Array.isArray(parsed.planningBanners) && parsed.planningBanners.length >= 1
      ? parsed.planningBanners.slice(0, 5)
      : defaults.planningBanners

  return {
    version: 8,
    mainBanners:
      Array.isArray(parsed.mainBanners) && parsed.mainBanners.length > 0
        ? parsed.mainBanners
        : defaults.mainBanners,
    quickMenuSlots:
      Array.isArray(parsed.quickMenuSlots) && parsed.quickMenuSlots.length > 0
        ? parsed.quickMenuSlots.map((slot, index) =>
            normalizeQuickMenuSlot(
              slot as Partial<AdminQuickMenuSlot>,
              defaults.quickMenuSlots[index] ?? createEmptyQuickMenuSlot(`-${index}`),
            ),
          )
        : defaults.quickMenuSlots,
    brandBanner: { ...defaults.brandBanner, ...parsed.brandBanner },
    seriesBanners:
      Array.isArray(parsed.seriesBanners) && parsed.seriesBanners.length === 4
        ? parsed.seriesBanners
        : defaults.seriesBanners,
    planningBanners,
    planningCollectionTags: normalizePlanningCollectionTags(parsed.planningCollectionTags),
    planningCollections:
      Array.isArray(parsed.planningCollections) && parsed.planningCollections.length >= 1
        ? parsed.planningCollections
            .slice(0, MAX_PLANNING_COLLECTIONS)
            .map((item, index) =>
              normalizePlanningCollection(
                item as Partial<AdminPlanningCollection>,
                defaults.planningCollections[index] ?? createEmptyPlanningCollection(`-${index}`),
              ),
            )
        : defaults.planningCollections,
    curationProducts: normalizeCurationProducts(
      parsed.curationProducts as Partial<AdminCurationProducts> | undefined,
      defaults.curationProducts,
    ),
    styleBannerSection: normalizeStyleBannerSection(
      parsed.styleBannerSection as Partial<AdminStyleBannerSection> | undefined,
      defaults.styleBannerSection,
    ),
    lookbookSection: normalizeLookbookSection(
      parsed.lookbookSection as Partial<AdminLookbookSection> | undefined,
      defaults.lookbookSection,
    ),
    marketingPopupSlides: normalizeMarketingPopupSlides(parsed.marketingPopupSlides),
    updatedAt: parsed.updatedAt ?? null,
  }
}

function migrateV2Config(parsed: Partial<AdminHomeMainConfig>): AdminHomeMainConfig {
  return migrateHomeMainConfig(parsed)
}

export function loadAdminHomeMainConfig(): AdminHomeMainConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultHomeMainConfig()

    const parsed = JSON.parse(raw) as Partial<AdminHomeMainConfig> & Record<string, unknown>
    if (
      parsed.version !== 2 &&
      parsed.version !== 3 &&
      parsed.version !== 4 &&
      parsed.version !== 5 &&
      parsed.version !== 6 &&
      parsed.version !== 7 &&
      parsed.version !== 8
    ) {
      return migrateLegacyConfig(parsed)
    }

    return migrateHomeMainConfig(parsed)
  } catch {
    return createDefaultHomeMainConfig()
  }
}

export function saveAdminHomeMainConfig(
  config: Omit<AdminHomeMainConfig, 'version' | 'updatedAt'>,
): AdminHomeMainConfig {
  const next: AdminHomeMainConfig = {
    version: 8,
    ...config,
    styleBannerSection: normalizeStyleBannerSection(config.styleBannerSection),
    lookbookSection: normalizeLookbookSection(config.lookbookSection),
    marketingPopupSlides: normalizeMarketingPopupSlides(config.marketingPopupSlides),
    updatedAt: new Date().toISOString(),
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    throw new Error('HOME_MAIN_CONFIG_STORAGE_FAILED')
  }

  window.dispatchEvent(new CustomEvent(HOME_MAIN_CONFIG_UPDATED_EVENT))
  return next
}

/** @deprecated Use loadAdminHomeMainConfig */
export function loadAdminHomeMainConfigLegacy() {
  return loadAdminHomeMainConfig()
}
