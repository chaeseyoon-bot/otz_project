import { deepRewriteHomeBannerUrls } from './homeBannersAssetUrl'

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

/** Figma 2601:22673 — 6 tiles; copy/link는 어드민에서 입력 (빈 기본값 + placeholder). */
const DEFAULT_QUICK_MENU: AdminQuickMenuSlot[] = [
  { id: 'qm-1', slotType: 'image', label: '', captionLabel: '', imageUrl: null, imageFileName: null, href: '', bgColor: '#F6F6F6', textColor: '#1A1A1A' },
  { id: 'qm-2', slotType: 'mixed', label: '', captionLabel: '', imageUrl: null, imageFileName: null, href: '', bgColor: '#000000', textColor: '#DEDEDE' },
  { id: 'qm-3', slotType: 'mixed', label: '', captionLabel: '', imageUrl: null, imageFileName: null, href: '', bgColor: '#444444', textColor: '#FFFFFF' },
  { id: 'qm-4', slotType: 'image', label: '', captionLabel: '', imageUrl: null, imageFileName: null, href: '', bgColor: '#F1F1F1', textColor: '#1A1A1A' },
  { id: 'qm-5', slotType: 'image', label: '', captionLabel: '', imageUrl: null, imageFileName: null, href: '', bgColor: '#F1F1F1', textColor: '#1A1A1A' },
  { id: 'qm-6', slotType: 'image', label: '', captionLabel: '', imageUrl: null, imageFileName: null, href: '', bgColor: '#F1F1F1', textColor: '#1A1A1A' },
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
    badge: '',
    title: '',
    subtitle: '',
  },
]

export const MIN_MARKETING_POPUP_SLIDES = 1
export const MAX_MARKETING_POPUP_SLIDES = 10

const DEFAULT_MARKETING_POPUP_SLIDES: AdminMarketingPopupSlide[] = [
  {
    id: 'promo-1',
    imageUrl: null,
    imageFileName: null,
    title: '',
    subtitle: '',
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
  { id: 'pct-1', label: '' },
  { id: 'pct-2', label: '' },
  { id: 'pct-3', label: '' },
  { id: 'pct-4', label: '' },
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
    title: '',
    tagId: 'pct-1',
    linkLabel: '',
    linkHref: '',
    productIds: [...EMPTY_PRODUCT_IDS],
  },
  {
    id: 'collection-2',
    imageUrl: null,
    imageFileName: null,
    title: '',
    tagId: 'pct-2',
    linkLabel: '',
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
  badge: '',
  title: '',
  mobileCtaLabel: '',
  pcLinkLabel: '',
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

const DEFAULT_LOOKBOOK_TAGS = ['', '', ''] as const

const DEFAULT_LOOKBOOK_COPY = {
  badge: '',
  title: '',
  body: '',
  tags: [...DEFAULT_LOOKBOOK_TAGS],
  mobileCtaLabel: '',
  linkHref: '',
} as const

function createEmptyLookbookImageSlots(): AdminLookbookImageSlot[] {
  return Array.from({ length: LOOKBOOK_IMAGE_SLOTS }, () => ({
    imageUrl: null,
    imageFileName: null,
  }))
}

const DEFAULT_STYLE_BANNER_COPY = {
  badge: '',
  title: '',
  body: '',
} as const

const DEFAULT_STYLE_BANNER_CARDS: AdminStyleBannerCard[] = [
  {
    id: 'style-1',
    imageUrl: null,
    imageFileName: null,
    badge: null,
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
    badge: null,
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
  const archiveLookbookId =
    typeof raw?.archiveLookbookId === 'string'
      ? raw.archiveLookbookId
      : raw?.archiveLookbookId === null
        ? null
        : base.archiveLookbookId

  const section: AdminLookbookSection = {
    archiveLookbookId,
    badge: typeof raw?.badge === 'string' ? raw.badge : base.badge,
    title: typeof raw?.title === 'string' ? raw.title : base.title,
    body: typeof raw?.body === 'string' ? raw.body : base.body,
    tags: normalizeLookbookTags(raw?.tags ?? base.tags),
    mobileCtaLabel: typeof raw?.mobileCtaLabel === 'string' ? raw.mobileCtaLabel : base.mobileCtaLabel,
    linkHref: typeof raw?.linkHref === 'string' ? raw.linkHref : base.linkHref,
    imageSlots: normalizeLookbookImageSlots(raw?.imageSlots ?? base.imageSlots),
  }

  // Latest archive mode always pulls MO 3 / PC 7 from archive detail — ignore stale slot uploads.
  if (section.archiveLookbookId == null) {
    section.imageSlots = createEmptyLookbookImageSlots()
  }

  return section
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
    title: '',
    body: '',
    imageUrl: null,
    imageFileName: null,
    ctaLabel: '',
    ctaHref: '',
  },
  {
    id: 'series-romari',
    title: '',
    body: '',
    imageUrl: null,
    imageFileName: null,
    ctaLabel: '',
    ctaHref: '',
  },
  {
    id: 'series-3300',
    title: '',
    body: '',
    imageUrl: null,
    imageFileName: null,
    ctaLabel: '',
    ctaHref: '',
  },
  {
    id: 'series-topi',
    title: '',
    body: '',
    imageUrl: null,
    imageFileName: null,
    ctaLabel: '',
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
        title: '',
        subtitle: '',
        ctaLabel: '',
        ctaHref: '',
      },
    ],
    quickMenuSlots: DEFAULT_QUICK_MENU.map((slot) => ({ ...slot })),
    brandBanner: {
      imageUrl: null,
      imageFileName: null,
      body: '',
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
      return deepRewriteHomeBannerUrls(migrateLegacyConfig(parsed))
    }

    return deepRewriteHomeBannerUrls(migrateHomeMainConfig(parsed))
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
