import type { CurationItem, HeroSlide, PromotionalBanner } from '../design-system/types'
import {
  curationItems as defaultCurationItems,
  heroSlides as defaultHeroSlides,
  planningBanner as defaultPlanningBanner,
} from '../data/homeSections'
import type {
  AdminBrandBanner,
  AdminCurationProducts,
  AdminLookbookSection,
  AdminMainBannerSlide,
  AdminMarketingPopupSlide,
  AdminPlanningBanner,
  AdminPlanningCollection,
  AdminPlanningCollectionTag,
  AdminSeriesBanner,
  AdminStyleBannerCard,
  AdminStyleBannerSection,
} from './adminHomeMainConfig'
import { STYLE_BANNER_PRODUCT_SLOTS } from './adminHomeMainConfig'
import { resolveBrandSeriesCategoryPath } from './categoryRoutes'
import { getProductDetailPath } from './productRoutes'
import {
  getDefaultLookbookSlotUrls,
  LOOKBOOK_HOME_IMAGE_SLOTS,
  LOOKBOOK_HOME_MOBILE_VISIBLE,
  resolveArchiveLookbookId,
} from './archiveLookbookImages'
import {
  CURATION_PRODUCT_SLOTS,
  PLANNING_COLLECTION_PRODUCT_SLOTS,
} from './adminHomeMainConfig'
import { homeBannerAsset, rewriteHomeBannerImageUrl } from './homeBannersAssetUrl'
import { PRODUCT_CARD_CUTS, productCutUrl } from './productImage'

const HERO_FALLBACK_IMAGES = [
  homeBannerAsset('banner_01.png'),
  homeBannerAsset('banner_02.png'),
  homeBannerAsset('banner_03.png'),
] as const

const BRAND_INTRO_FALLBACK = homeBannerAsset('brand_01.png')

const SERIES_FALLBACK_IMAGES = [
  homeBannerAsset('brand_03.png'),
  homeBannerAsset('brand_02.png'),
  homeBannerAsset('brand_05.png'),
  homeBannerAsset('brand_04.png'),
] as const

const PLANNING_FALLBACK_IMAGES = [
  homeBannerAsset('promo_03.png'),
  homeBannerAsset('promo_01.png'),
  homeBannerAsset('promo_02.png'),
] as const

const MARKETING_POPUP_FALLBACK_IMAGE = homeBannerAsset('homemain_pop_banner01.jpg')

const DEFAULT_MARKETING_POPUP_RESOLVED = {
  title: '코코아모브 에디션',
  subtitle: '로마리 스웨이드 시즌 한정\n코코아모브 컬러 특별 에디션 소장하세요',
} as const

const COLLECTION_FALLBACK_IMAGES = [
  homeBannerAsset('coll_banner_01.png'),
  homeBannerAsset('coll_banner_02.png'),
] as const

const COLLECTION_FALLBACK_TITLES = ['OTZ×UMU\nLove Winter Day', 'OTZ×LOFA Seoul'] as const

const COLLECTION_FALLBACK_THUMBS = [
  [
    homeBannerAsset('coll_thumb_01.png'),
    homeBannerAsset('coll_thumb_02.png'),
    homeBannerAsset('coll_thumb_03.png'),
    homeBannerAsset('coll_thumb_04.png'),
  ],
  [
    homeBannerAsset('coll_thumb_05.png'),
    homeBannerAsset('coll_thumb_06.png'),
    homeBannerAsset('coll_thumb_07.png'),
    homeBannerAsset('coll_thumb_08.png'),
  ],
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

export interface ResolvedMarketingPopupSlide {
  id: string
  imageUrl: string
  title: string
  subtitle: string
}

export function resolveHeroSlides(mainBanners: AdminMainBannerSlide[]): ResolvedHeroSlide[] {
  if (!mainBanners.length) {
    return defaultHeroSlides.map((slide) => ({ ...slide }))
  }

  const fallback = defaultHeroSlides[0]

  return mainBanners.map((banner, index) => {
    const imageUrl = rewriteHomeBannerImageUrl(banner.imageUrl?.trim() || null)
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
    ctaHref:
      series.ctaHref.trim() || resolveBrandSeriesCategoryPath(series.title) || '',
  }))
}

export interface ResolvedPlanningCollectionProduct {
  productId: number | null
  image: string
  name: string
  discount: string
  price: string
}

export interface ResolvedPlanningCollection {
  id: string
  tagLabel: string
  title: string
  linkLabel: string
  linkHref: string
  bannerImage: string
  productIds: (number | null)[]
  /** Registered products only (1–4) — fixed tile size on a 4-column grid. */
  products: ResolvedPlanningCollectionProduct[]
  mobileProductImages: string[]
}

function resolveCollectionTagLabel(
  tagId: string | null,
  tags: AdminPlanningCollectionTag[],
): string {
  if (!tagId) return tags[0]?.label ?? 'COLLECTION'
  return tags.find((tag) => tag.id === tagId)?.label ?? tags[0]?.label ?? 'COLLECTION'
}

function buildFallbackProducts(index: number): ResolvedPlanningCollectionProduct[] {
  const thumbs = COLLECTION_FALLBACK_THUMBS[index % COLLECTION_FALLBACK_THUMBS.length]!
  return thumbs.map((image, thumbIndex) => ({
    productId: null,
    image,
    name: `기획전 상품 ${thumbIndex + 1}`,
    discount: '12%',
    price: '42,900',
  }))
}

export function resolvePlanningCollections(
  collections: AdminPlanningCollection[] = [],
  tags: AdminPlanningCollectionTag[] = [],
  productById: Map<number, { image: string; title: string; discountRate: string; price: string }> = new Map(),
): ResolvedPlanningCollection[] {
  if (!collections.length) {
    return [
      {
        id: 'collection-fallback-1',
        tagLabel: 'COLLECTION',
        title: 'OTZ×UMU\nLove Winter Day',
        linkLabel: '오찌x우무 바로가기',
        linkHref: '',
        bannerImage: COLLECTION_FALLBACK_IMAGES[0],
        productIds: [null, null, null, null],
        products: buildFallbackProducts(0),
        mobileProductImages: buildFallbackProducts(0)
          .slice(0, PLANNING_COLLECTION_PRODUCT_SLOTS)
          .map((item) => item.image),
      },
      {
        id: 'collection-fallback-2',
        tagLabel: 'LIMITED EDITION',
        title: 'OTZ×LOFA Seoul',
        linkLabel: '오찌x로파서울 바로가기',
        linkHref: '',
        bannerImage: COLLECTION_FALLBACK_IMAGES[1],
        productIds: [null, null, null, null],
        products: buildFallbackProducts(1),
        mobileProductImages: buildFallbackProducts(1)
          .slice(0, PLANNING_COLLECTION_PRODUCT_SLOTS)
          .map((item) => item.image),
      },
    ]
  }

  return collections.map((collection, index) => {
    const bannerImage =
      collection.imageUrl?.trim() ||
      COLLECTION_FALLBACK_IMAGES[index % COLLECTION_FALLBACK_IMAGES.length]
    const fallbackProducts = buildFallbackProducts(index)
    const productIds = collection.productIds ?? [null, null, null, null]
    const hasConfiguredProducts = productIds.some((id) => id != null)

    const resolvedProducts: ResolvedPlanningCollectionProduct[] = []
    for (let slotIndex = 0; slotIndex < PLANNING_COLLECTION_PRODUCT_SLOTS; slotIndex++) {
      const productId = productIds[slotIndex]
      if (productId == null) continue

      const mapped = productById.get(productId)
      const fallbackProduct = fallbackProducts[slotIndex] ?? fallbackProducts[0]!
      resolvedProducts.push({
        productId,
        image: mapped?.image ?? fallbackProduct.image,
        name: mapped?.title ?? fallbackProduct.name,
        discount: mapped?.discountRate ?? fallbackProduct.discount,
        price: mapped?.price ?? fallbackProduct.price,
      })
    }

    const products = hasConfiguredProducts ? resolvedProducts : fallbackProducts
    const mobileProductImages = products.map((product) => product.image)

    return {
      id: collection.id,
      tagLabel: resolveCollectionTagLabel(collection.tagId, tags),
      title:
        (collection.title ?? '').trim() ||
        COLLECTION_FALLBACK_TITLES[index % COLLECTION_FALLBACK_TITLES.length],
      linkLabel: (collection.linkLabel ?? '').trim() || '기획전 바로가기',
      linkHref: (collection.linkHref ?? '').trim(),
      bannerImage,
      productIds,
      products,
      mobileProductImages,
    }
  })
}

export interface ResolvedCurationProduct extends CurationItem {
  productId: number | null
  imageCandidates: string[]
}

export interface ResolvedCurationCopy {
  badge: string
  title: string
  mobileCtaLabel: string
  pcLinkLabel: string
  linkHref: string
}

const DEFAULT_CURATION_COPY: ResolvedCurationCopy = {
  badge: 'CURATION',
  title: 'WINTER ACC\nSTYLING',
  mobileCtaLabel: '상품 보러 가기',
  pcLinkLabel: '상품 바로가기',
  linkHref: '',
}

export function resolveCurationCopy(curation?: AdminCurationProducts): ResolvedCurationCopy {
  if (!curation) return { ...DEFAULT_CURATION_COPY }

  return {
    badge: (curation.badge ?? '').trim() || DEFAULT_CURATION_COPY.badge,
    title: (curation.title ?? '').trim() || DEFAULT_CURATION_COPY.title,
    mobileCtaLabel: (curation.mobileCtaLabel ?? '').trim() || DEFAULT_CURATION_COPY.mobileCtaLabel,
    pcLinkLabel: (curation.pcLinkLabel ?? '').trim() || DEFAULT_CURATION_COPY.pcLinkLabel,
    linkHref: (curation.linkHref ?? '').trim(),
  }
}

function buildFallbackCurationProducts(): ResolvedCurationProduct[] {
  return defaultCurationItems.map((item) => ({
    ...item,
    productId: null,
    imageCandidates: [item.imageUrl],
  }))
}

export function resolveCurationProducts(
  curation: AdminCurationProducts | undefined,
  productById: Map<
    number,
    {
      title: string
      discountRate: string
      price: string
      folder: string
      editorialImage: string
      imageCandidates: string[]
    }
  > = new Map(),
): ResolvedCurationProduct[] {
  const productIds = curation?.productIds ?? []
  const hasAny = productIds.some((id) => id != null)
  if (!hasAny) return buildFallbackCurationProducts()

  const fallback = buildFallbackCurationProducts()

  const slots = productIds.length >= CURATION_PRODUCT_SLOTS
    ? productIds.slice(0, CURATION_PRODUCT_SLOTS)
    : [...productIds, ...Array(CURATION_PRODUCT_SLOTS - productIds.length).fill(null)]

  return slots.map((productId, index) => {
    const fallbackItem = fallback[index] ?? fallback[0]!
    if (productId == null) {
      return {
        ...fallbackItem,
        id: `curation-slot-${index + 1}`,
        productId: null,
        imageCandidates: [fallbackItem.imageUrl],
      }
    }

    const mapped = productById.get(productId)
    if (!mapped) {
      return {
        ...fallbackItem,
        id: `curation-${productId}`,
        productId,
        imageCandidates: [fallbackItem.imageUrl],
      }
    }

    return {
      id: `curation-${productId}`,
      productId,
      imageUrl: mapped.editorialImage,
      imageCandidates: mapped.imageCandidates,
      productName: mapped.title,
      discount: mapped.discountRate,
      price: mapped.price,
    }
  })
}

/** Builds editorial (07) image URL for resolver maps. */
export function buildCurationEditorialImage(folder: string, productId: number): string {
  return productCutUrl(folder, productId, PRODUCT_CARD_CUTS.editorial, 'png')
}

const STYLE_BANNER_FALLBACK_BANNERS = [
  homeBannerAsset('style_01.png'),
  homeBannerAsset('style_04.png'),
  homeBannerAsset('style_07.jpg'),
] as const

const STYLE_BANNER_FALLBACK_PRODUCTS = [
  [
    {
      thumb: homeBannerAsset('style_02.png'),
      name: '스웨이드 숄더백 코코아모브 브라운 FLOTFA3B07',
      discountRate: '10%',
      price: '53,910',
    },
    {
      thumb: homeBannerAsset('style_03.png'),
      name: '[오찌x우무] 벌루니 플랫폼 밴딩 슬라이드 FLOTFF4W21',
      discountRate: '20%',
      price: '53,910',
    },
  ],
  [
    {
      thumb: homeBannerAsset('style_05.png'),
      name: '시스루 테일러드 자켓 MIWJKF1029B',
      discountRate: '10%',
      price: '53,910',
    },
    {
      thumb: homeBannerAsset('style_06.png'),
      name: '시스루 테일러드 자켓 MIWJKF1029B',
      discountRate: '10%',
      price: '53,910',
    },
  ],
  [
    {
      thumb: homeBannerAsset('style_08.jpg'),
      name: '스웨이드 숄더백 코코아모브 브라운 FLOTFA3B07',
      discountRate: '10%',
      price: '53,910',
    },
    {
      thumb: homeBannerAsset('style_09.jpg'),
      name: '스웨이드 숄더백 코코아모브 브라운 FLOTFA3B07',
      discountRate: '10%',
      price: '53,910',
    },
  ],
] as const

const STYLE_BANNER_FALLBACK_BADGES: (string | null)[] = ['LIMITED EDITION', null, '26SS COLLECTION']

const DEFAULT_STYLE_BANNER_COPY = {
  badge: 'CORDINATION',
  title: "OTZ'S\nSTYLE LOG",
  body:
    '오찌가 전하는 편안함 위에 당신만의 색깔을 더해보세요.\n매일의 걸음이 즐거워지는 감각적인 스타일링 가이드를\n제안합니다.',
} as const

export interface ResolvedStyleBannerProduct {
  productId: number | null
  thumb: string
  thumbCandidates: string[]
  name: string
  discountRate: string
  price: string
  detailHref: string
}

export interface ResolvedStyleBannerCard {
  id: string
  imageUrl: string
  badge: string | null
  bannerHref: string
  products: ResolvedStyleBannerProduct[]
}

export interface ResolvedStyleBannerSection {
  badge: string
  title: string
  titleLines: string[]
  body: string
  bodyLines: string[]
  cards: ResolvedStyleBannerCard[]
}

function buildFallbackStyleBannerCard(index: number): ResolvedStyleBannerCard {
  const products = (STYLE_BANNER_FALLBACK_PRODUCTS[index] ?? STYLE_BANNER_FALLBACK_PRODUCTS[0]!).map(
    (product) => ({
      productId: null,
      thumb: product.thumb,
      thumbCandidates: [product.thumb],
      name: product.name,
      discountRate: product.discountRate,
      price: product.price,
      detailHref: '',
    }),
  )

  return {
    id: `style-fallback-${index + 1}`,
    imageUrl: STYLE_BANNER_FALLBACK_BANNERS[index % STYLE_BANNER_FALLBACK_BANNERS.length],
    badge: STYLE_BANNER_FALLBACK_BADGES[index] ?? null,
    bannerHref: '',
    products,
  }
}

function resolveStyleBannerCard(
  card: AdminStyleBannerCard,
  index: number,
  productById: Map<
    number,
    {
      thumb: string
      thumbCandidates: string[]
      title: string
      discountRate: string
      price: string
      catalogId: string
    }
  >,
): ResolvedStyleBannerCard | null {
  const fallback = buildFallbackStyleBannerCard(index)
  const imageUrl = card.imageUrl?.trim() || fallback.imageUrl
  const productIds = card.productIds ?? []

  const resolvedProducts: ResolvedStyleBannerProduct[] = []
  for (let slotIndex = 0; slotIndex < STYLE_BANNER_PRODUCT_SLOTS; slotIndex++) {
    const productId = productIds[slotIndex]
    if (productId == null) continue

    const mapped = productById.get(productId)
    const fallbackProduct = fallback.products[slotIndex] ?? fallback.products[0]
    resolvedProducts.push({
      productId,
      thumb: mapped?.thumb ?? fallbackProduct?.thumb ?? '',
      thumbCandidates: mapped?.thumbCandidates?.length
        ? mapped.thumbCandidates
        : fallbackProduct?.thumbCandidates?.length
          ? fallbackProduct.thumbCandidates
          : mapped?.thumb
            ? [mapped.thumb]
            : fallbackProduct?.thumb
              ? [fallbackProduct.thumb]
              : [],
      name: mapped?.title ?? fallbackProduct?.name ?? '',
      discountRate: mapped?.discountRate ?? fallbackProduct?.discountRate ?? '',
      price: mapped?.price ?? fallbackProduct?.price ?? '',
      detailHref: mapped ? getProductDetailPath(mapped.catalogId) : '',
    })
  }

  const hasConfiguredProducts = card.productIds?.some((id) => id != null)
  const products = hasConfiguredProducts ? resolvedProducts : fallback.products

  const firstProduct = products.find((product) => product.detailHref)
  const bannerHref = firstProduct?.detailHref ?? fallback.bannerHref

  return {
    id: card.id,
    imageUrl,
    badge: card.badge,
    bannerHref,
    products: products.length ? products : fallback.products,
  }
}

export function resolveStyleBannerSection(
  section: AdminStyleBannerSection | undefined,
  productById: Map<
    number,
    {
      thumb: string
      thumbCandidates: string[]
      title: string
      discountRate: string
      price: string
      catalogId: string
    }
  > = new Map(),
): ResolvedStyleBannerSection {
  const title = (section?.title ?? '').trim() || DEFAULT_STYLE_BANNER_COPY.title
  const body = (section?.body ?? '').trim() || DEFAULT_STYLE_BANNER_COPY.body
  const cardsSource = section?.cards?.length ? section.cards : []

  const cards =
    cardsSource.length > 0
      ? cardsSource
          .map((card, index) => resolveStyleBannerCard(card, index, productById))
          .filter((card): card is ResolvedStyleBannerCard => card != null)
      : [0, 1, 2].map((index) => buildFallbackStyleBannerCard(index))

  return {
    badge: (section?.badge ?? '').trim() || DEFAULT_STYLE_BANNER_COPY.badge,
    title,
    titleLines: title.split('\n').filter(Boolean),
    body,
    bodyLines: body.split('\n').filter((line) => line.length > 0),
    cards: cards.length ? cards : [buildFallbackStyleBannerCard(0)],
  }
}

const LOOKBOOK_FALLBACK_IMAGES = [1, 2, 3, 4, 5, 6, 7].map((n) => homeBannerAsset(`lookbook_0${n}.png`))

const DEFAULT_LOOKBOOK_COPY = {
  badge: 'ARCHIVE',
  title: 'SPRING IN\nOTZ',
  body:
    '오찌의 26 스프링 컬렉션은 여유로운 캘리포니아의 휴일을 담았습니다. 캐주얼한 쉐입에 러블리한 포인트를 더한 오찌만의 봄 스타일링 컬렉션을 만나보세요.',
  tags: ['#OTZ', '#SPRING', '#ROMARI'],
  mobileCtaLabel: '아카이브 바로가기',
  linkHref: '/archive',
} as const

export interface ResolvedLookbookSection {
  archiveLookbookId: string
  badge: string
  title: string
  titleLines: string[]
  body: string
  bodyLines: string[]
  tags: string[]
  mobileCtaLabel: string
  linkHref: string
  imageUrls: string[]
  mobileImageUrls: string[]
  pcHeroImage: string
  pcGridImages: string[]
}

export function resolveLookbookSection(lookbook?: AdminLookbookSection): ResolvedLookbookSection {
  const usesLatestArchive = lookbook?.archiveLookbookId == null
  const archiveLookbookId = resolveArchiveLookbookId(lookbook?.archiveLookbookId)
  const archiveDefaults = getDefaultLookbookSlotUrls(archiveLookbookId)

  const imageUrls = Array.from({ length: LOOKBOOK_HOME_IMAGE_SLOTS }, (_, index) => {
    if (!usesLatestArchive) {
      const override = lookbook?.imageSlots?.[index]?.imageUrl?.trim()
      if (override) return override
    }
    return archiveDefaults[index] ?? LOOKBOOK_FALLBACK_IMAGES[index % LOOKBOOK_FALLBACK_IMAGES.length]
  })

  const title = (lookbook?.title ?? '').trim() || DEFAULT_LOOKBOOK_COPY.title
  const body = (lookbook?.body ?? '').trim() || DEFAULT_LOOKBOOK_COPY.body
  const tags = (lookbook?.tags ?? [])
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 3)
  const resolvedTags = tags.length ? tags : [...DEFAULT_LOOKBOOK_COPY.tags]

  return {
    archiveLookbookId,
    badge: (lookbook?.badge ?? '').trim() || DEFAULT_LOOKBOOK_COPY.badge,
    title,
    titleLines: title.split('\n').filter(Boolean),
    body,
    bodyLines: body.split('\n').filter((line) => line.length > 0),
    tags: resolvedTags,
    mobileCtaLabel: (lookbook?.mobileCtaLabel ?? '').trim() || DEFAULT_LOOKBOOK_COPY.mobileCtaLabel,
    linkHref: (lookbook?.linkHref ?? '').trim() || DEFAULT_LOOKBOOK_COPY.linkHref,
    imageUrls,
    mobileImageUrls: imageUrls.slice(0, LOOKBOOK_HOME_MOBILE_VISIBLE),
    pcHeroImage: imageUrls[0] ?? LOOKBOOK_FALLBACK_IMAGES[0],
    pcGridImages: imageUrls.slice(1, LOOKBOOK_HOME_IMAGE_SLOTS),
  }
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

export function resolveMarketingPopupSlides(
  slides: AdminMarketingPopupSlide[] = [],
): ResolvedMarketingPopupSlide[] {
  if (!slides.length) {
    return [
      {
        id: 'promo-default',
        imageUrl: MARKETING_POPUP_FALLBACK_IMAGE,
        title: DEFAULT_MARKETING_POPUP_RESOLVED.title,
        subtitle: DEFAULT_MARKETING_POPUP_RESOLVED.subtitle,
      },
    ]
  }

  return slides.map((slide) => {
    const imageUrl = slide.imageUrl?.trim()
    return {
      id: slide.id,
      imageUrl: imageUrl || MARKETING_POPUP_FALLBACK_IMAGE,
      title: (slide.title ?? '').trim() || DEFAULT_MARKETING_POPUP_RESOLVED.title,
      subtitle: (slide.subtitle ?? '').trim(),
    }
  })
}
