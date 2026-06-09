import type { HeroSlide, PromotionalBanner } from '../design-system/types'
import { heroSlides as defaultHeroSlides, planningBanner as defaultPlanningBanner } from '../data/homeSections'
import type {
  AdminBrandBanner,
  AdminMainBannerSlide,
  AdminPlanningBanner,
  AdminSeriesBanner,
} from './adminHomeMainConfig'
import { mainImageAsset } from './mainImagesAssetUrl'

const HERO_FALLBACK_IMAGES = [
  mainImageAsset('banner_01.png'),
  mainImageAsset('banner_02.png'),
  mainImageAsset('banner_03.png'),
] as const

const BRAND_INTRO_FALLBACK = mainImageAsset('brand_01.png')

const SERIES_FALLBACK_IMAGES = [
  mainImageAsset('brand_03.png'),
  mainImageAsset('brand_02.png'),
  mainImageAsset('brand_05.png'),
  mainImageAsset('brand_04.png'),
] as const

const PLANNING_FALLBACK_IMAGES = [
  mainImageAsset('promo_03.png'),
  mainImageAsset('promo_01.png'),
  mainImageAsset('promo_02.png'),
] as const

export interface ResolvedHeroSlide extends HeroSlide {
  ctaHref?: string
}

export interface ResolvedBrandIntro {
  body: string
  imageUrl: string
}

export interface ResolvedBrandSeriesSlide {
  id: string
  title: string
  body: string
  imageUrl: string
  ctaLabel: string
  ctaHref: string
}

export function resolveHeroSlides(mainBanners: AdminMainBannerSlide[]): ResolvedHeroSlide[] {
  if (!mainBanners.length) {
    return defaultHeroSlides.map((slide) => ({ ...slide }))
  }

  const fallback = defaultHeroSlides[0]

  return mainBanners.map((banner, index) => {
    const imageUrl = banner.imageUrl?.trim()
    return {
      id: banner.id,
      title: (banner.title ?? '').trim() || fallback?.title || '',
      subtitle: (banner.subtitle ?? '').trim() || fallback?.subtitle || '',
      ctaLabel: (banner.ctaLabel ?? '').trim() || fallback?.ctaLabel || '쇼핑 바로가기',
      imageUrl: imageUrl || HERO_FALLBACK_IMAGES[index % HERO_FALLBACK_IMAGES.length],
      ctaHref: (banner.ctaHref ?? '').trim() || undefined,
    }
  })
}

export function resolveBrandIntro(brandBanner: AdminBrandBanner): ResolvedBrandIntro {
  return {
    body: brandBanner.body,
    imageUrl: brandBanner.imageUrl ?? BRAND_INTRO_FALLBACK,
  }
}

export function resolveBrandSeriesSlides(seriesBanners: AdminSeriesBanner[]): ResolvedBrandSeriesSlide[] {
  return seriesBanners.map((series, index) => ({
    id: series.id,
    title: series.title,
    body: series.body,
    imageUrl: series.imageUrl ?? SERIES_FALLBACK_IMAGES[index % SERIES_FALLBACK_IMAGES.length],
    ctaLabel: series.ctaLabel.trim() || '상품 보러 가기',
    ctaHref: series.ctaHref.trim(),
  }))
}

export function resolvePlanningBanners(planningBanners: AdminPlanningBanner[] = []): PromotionalBanner[] {
  if (!planningBanners.length) {
    return [{ ...defaultPlanningBanner }]
  }

  return planningBanners.map((banner, index) => {
    const imageUrl = banner.imageUrl?.trim()
    return {
      id: banner.id,
      badge: (banner.badge ?? '').trim() || defaultPlanningBanner.badge,
      title: (banner.title ?? '').trim() || defaultPlanningBanner.title,
      subtitle: (banner.subtitle ?? '').trim() || defaultPlanningBanner.subtitle,
      imageUrl: imageUrl || PLANNING_FALLBACK_IMAGES[index % PLANNING_FALLBACK_IMAGES.length],
    }
  })
}
