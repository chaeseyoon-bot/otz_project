import type {
  AdminHomeMainConfig,
  AdminMainBannerSlide,
} from './adminHomeMainConfig'
import { deepRewriteHomeBannerUrls, rewriteHomeBannerImageUrl } from './homeBannersAssetUrl'

/** Admin tab id → Supabase `home_banners.section_id` */
export const ADMIN_TAB_TO_SECTION_ID = {
  main: 'main_banner',
  quick: 'quick_menu',
  brand: 'brand_banner',
  series: 'series_banner',
  planning: 'planning_banner',
  collection: 'planning_collection',
  curation: 'curation_products',
  styling: 'style_banner',
  lookbook: 'lookbook',
  marketingPopup: 'marketing_popup',
} as const

export type AdminHomeMainTabId = keyof typeof ADMIN_TAB_TO_SECTION_ID

export type HomeBannerSectionId = (typeof ADMIN_TAB_TO_SECTION_ID)[AdminHomeMainTabId]

export const HOME_BANNER_SECTION_IDS = Object.values(ADMIN_TAB_TO_SECTION_ID)

export interface HomeBannerRow {
  id: number
  section_id: HomeBannerSectionId
  image_url: string | null
  link_url: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

type ConfigSlice = Omit<AdminHomeMainConfig, 'version' | 'updatedAt'>

function firstMainBannerImage(banners: AdminMainBannerSlide[]): string | null {
  return banners.find((b) => b.imageUrl?.trim())?.imageUrl?.trim() ?? null
}

function firstMainBannerLink(banners: AdminMainBannerSlide[]): string | null {
  return banners.find((b) => b.ctaHref?.trim())?.ctaHref?.trim() ?? null
}

/** Builds Supabase row payload for the active admin tab. */
export function buildHomeBannerSectionPayload(
  tabId: AdminHomeMainTabId,
  config: ConfigSlice,
): { section_id: HomeBannerSectionId; image_url: string | null; link_url: string | null; metadata: Record<string, unknown> } {
  const section_id = ADMIN_TAB_TO_SECTION_ID[tabId]

  switch (tabId) {
    case 'main':
      return {
        section_id,
        image_url: firstMainBannerImage(config.mainBanners),
        link_url: firstMainBannerLink(config.mainBanners),
        metadata: { mainBanners: config.mainBanners },
      }
    case 'quick':
      return {
        section_id,
        image_url: config.quickMenuSlots.find((s) => s.imageUrl?.trim())?.imageUrl?.trim() ?? null,
        link_url: config.quickMenuSlots.find((s) => s.href?.trim())?.href?.trim() ?? null,
        metadata: { quickMenuSlots: config.quickMenuSlots },
      }
    case 'brand':
      return {
        section_id,
        image_url: config.brandBanner.imageUrl?.trim() ?? null,
        link_url: null,
        metadata: { brandBanner: config.brandBanner },
      }
    case 'series':
      return {
        section_id,
        image_url: config.seriesBanners.find((s) => s.imageUrl?.trim())?.imageUrl?.trim() ?? null,
        link_url: config.seriesBanners.find((s) => s.ctaHref?.trim())?.ctaHref?.trim() ?? null,
        metadata: { seriesBanners: config.seriesBanners },
      }
    case 'planning':
      return {
        section_id,
        image_url: config.planningBanners.find((s) => s.imageUrl?.trim())?.imageUrl?.trim() ?? null,
        link_url: null,
        metadata: { planningBanners: config.planningBanners },
      }
    case 'collection':
      return {
        section_id,
        image_url: config.planningCollections.find((s) => s.imageUrl?.trim())?.imageUrl?.trim() ?? null,
        link_url: config.planningCollections.find((s) => s.linkHref?.trim())?.linkHref?.trim() ?? null,
        metadata: {
          planningCollections: config.planningCollections,
          planningCollectionTags: config.planningCollectionTags,
        },
      }
    case 'curation':
      return {
        section_id,
        image_url: null,
        link_url: config.curationProducts.linkHref?.trim() || null,
        metadata: { curationProducts: config.curationProducts },
      }
    case 'styling':
      return {
        section_id,
        image_url: config.styleBannerSection.cards.find((c) => c.imageUrl?.trim())?.imageUrl?.trim() ?? null,
        link_url: null,
        metadata: { styleBannerSection: config.styleBannerSection },
      }
    case 'lookbook':
      return {
        section_id,
        image_url: config.lookbookSection.imageSlots.find((s) => s.imageUrl?.trim())?.imageUrl?.trim() ?? null,
        link_url: config.lookbookSection.linkHref?.trim() || null,
        metadata: { lookbookSection: config.lookbookSection },
      }
    case 'marketingPopup':
      return {
        section_id,
        image_url: config.marketingPopupSlides.find((s) => s.imageUrl?.trim())?.imageUrl?.trim() ?? null,
        link_url: null,
        metadata: { marketingPopupSlides: config.marketingPopupSlides },
      }
    default:
      return { section_id, image_url: null, link_url: null, metadata: {} }
  }
}

/** Merges fetched Supabase rows into admin/home config (defaults fill gaps). */
export function mergeHomeBannerRowsIntoConfig(
  base: AdminHomeMainConfig,
  rows: HomeBannerRow[],
): AdminHomeMainConfig {
  const next: AdminHomeMainConfig = {
    ...base,
    mainBanners: base.mainBanners.map((item) => ({ ...item })),
    quickMenuSlots: base.quickMenuSlots.map((item) => ({ ...item })),
    brandBanner: { ...base.brandBanner },
    seriesBanners: base.seriesBanners.map((item) => ({ ...item })),
    planningBanners: base.planningBanners.map((item) => ({ ...item })),
    planningCollectionTags: base.planningCollectionTags.map((item) => ({ ...item })),
    planningCollections: base.planningCollections.map((item) => ({
      ...item,
      productIds: [...item.productIds],
    })),
    curationProducts: {
      ...base.curationProducts,
      productIds: [...base.curationProducts.productIds],
    },
    styleBannerSection: {
      ...base.styleBannerSection,
      cards: base.styleBannerSection.cards.map((card) => ({
        ...card,
        productIds: [...card.productIds],
      })),
    },
    lookbookSection: {
      ...base.lookbookSection,
      tags: [...base.lookbookSection.tags],
      imageSlots: base.lookbookSection.imageSlots.map((slot) => ({ ...slot })),
    },
    marketingPopupSlides: base.marketingPopupSlides.map((item) => ({ ...item })),
  }

  for (const row of rows) {
    const meta = deepRewriteHomeBannerUrls(row.metadata ?? {})
    const imageUrl = rewriteHomeBannerImageUrl(row.image_url)
    const linkUrl = rewriteHomeBannerImageUrl(row.link_url)

    switch (row.section_id) {
      case 'main_banner':
        if (Array.isArray(meta.mainBanners) && meta.mainBanners.length > 0) {
          next.mainBanners = meta.mainBanners as AdminHomeMainConfig['mainBanners']
        }
        break
      case 'quick_menu':
        if (Array.isArray(meta.quickMenuSlots) && meta.quickMenuSlots.length > 0) {
          next.quickMenuSlots = meta.quickMenuSlots as AdminHomeMainConfig['quickMenuSlots']
        }
        break
      case 'brand_banner':
        if (meta.brandBanner && typeof meta.brandBanner === 'object') {
          next.brandBanner = { ...next.brandBanner, ...(meta.brandBanner as AdminHomeMainConfig['brandBanner']) }
        } else if (imageUrl) {
          next.brandBanner = { ...next.brandBanner, imageUrl }
        }
        break
      case 'series_banner':
        if (Array.isArray(meta.seriesBanners) && meta.seriesBanners.length > 0) {
          next.seriesBanners = meta.seriesBanners as AdminHomeMainConfig['seriesBanners']
        }
        break
      case 'planning_banner':
        if (Array.isArray(meta.planningBanners) && meta.planningBanners.length > 0) {
          next.planningBanners = meta.planningBanners as AdminHomeMainConfig['planningBanners']
        }
        break
      case 'planning_collection':
        if (Array.isArray(meta.planningCollections) && meta.planningCollections.length > 0) {
          next.planningCollections = meta.planningCollections as AdminHomeMainConfig['planningCollections']
        }
        if (Array.isArray(meta.planningCollectionTags) && meta.planningCollectionTags.length > 0) {
          next.planningCollectionTags =
            meta.planningCollectionTags as AdminHomeMainConfig['planningCollectionTags']
        }
        break
      case 'curation_products':
        if (meta.curationProducts && typeof meta.curationProducts === 'object') {
          next.curationProducts = {
            ...next.curationProducts,
            ...(meta.curationProducts as AdminHomeMainConfig['curationProducts']),
          }
        }
        break
      case 'style_banner':
        if (meta.styleBannerSection && typeof meta.styleBannerSection === 'object') {
          next.styleBannerSection = meta.styleBannerSection as AdminHomeMainConfig['styleBannerSection']
        }
        break
      case 'lookbook':
        if (meta.lookbookSection && typeof meta.lookbookSection === 'object') {
          next.lookbookSection = meta.lookbookSection as AdminHomeMainConfig['lookbookSection']
        }
        break
      case 'marketing_popup':
        if (Array.isArray(meta.marketingPopupSlides) && meta.marketingPopupSlides.length > 0) {
          next.marketingPopupSlides =
            meta.marketingPopupSlides as AdminHomeMainConfig['marketingPopupSlides']
        }
        break
      default:
        break
    }
  }

  const latestCreatedAt = rows
    .map((row) => row.created_at)
    .filter(Boolean)
    .sort()
    .at(-1)

  next.updatedAt = latestCreatedAt ?? next.updatedAt
  return deepRewriteHomeBannerUrls(next)
}
