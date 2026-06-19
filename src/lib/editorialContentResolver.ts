import type { ProductCardItem } from '../components/molecules/ProductCardUnit'
import type {
  EditorialBenefitItem,
  EditorialCatalogProductGrid,
  EditorialCollectionBlock,
  EditorialCouponItem,
  EditorialEventDetail,
  EditorialHeroInfo,
  EditorialHeroTab,
  EditorialProductSection,
  EditorialProductTab,
  EditorialStandaloneShowcase,
} from '../data/editorialEventDetails'
import type { EditorialEventItem } from '../data/editorialEvents'
import { pickShowcaseGallery, buildProductShowcaseGalleryFromCuts } from './editorialProductShowcaseGallery'
import {
  type AdminEditorialCollectionBlock,
  type AdminEditorialConfig,
  type AdminEditorialEvent,
  type AdminEditorialCatalogProductGrid,
  type AdminEditorialProductSection,
  type AdminEditorialStandaloneProduct,
  DEFAULT_COUPON_SECTION_EYEBROW,
  DEFAULT_COUPON_SECTION_TITLE,
  DEFAULT_COUPON_DOWNLOAD_LABEL,
  DEFAULT_COUPON_NOTES_TITLE,
  createEditorial01Preset,
  getEventFallback,
  getEffectiveEditorialConfig,
  MAX_COUPON_NOTES,
  normalizeSectionOrder,
  sortEditorialEventsNewestFirst,
} from './adminEditorialConfig'
import { fetchProductById } from './productsApi'

function resolveImageUrl(url: string | null | undefined, fallback: string): string {
  return url?.trim() || fallback
}

async function resolveProductIds(ids: (number | null)[]): Promise<ProductCardItem[]> {
  const resolved: ProductCardItem[] = []

  for (const productId of ids) {
    if (productId == null) continue
    const product = await fetchProductById(productId)
    if (product) resolved.push(product)
  }

  return resolved
}

async function resolveProductSection(
  section: AdminEditorialProductSection,
): Promise<EditorialProductSection> {
  const products = await resolveProductIds(section.productIds)
  return {
    title: section.title,
    note: section.note.trim() || undefined,
    products,
    columns: section.columns,
    darkBackground: section.darkBackground || undefined,
  }
}

function resolveCoupons(event: AdminEditorialEvent): EditorialCouponItem[] {
  return event.coupons
    .map((coupon) => ({
      kind: coupon.kind,
      label: coupon.label,
      value: coupon.value,
      unit: coupon.unit,
      conditions: [coupon.condition1, coupon.condition2] as [string, string],
      validPeriod: coupon.validPeriod,
      applicableProducts: coupon.applicableProducts,
      downloadLabel: coupon.downloadLabel.trim() || DEFAULT_COUPON_DOWNLOAD_LABEL,
    }))
    .filter((coupon) => coupon.value.trim().length > 0)
}

function resolveCouponSection(event: AdminEditorialEvent) {
  return {
    eyebrow: event.couponSectionEyebrow.trim() || DEFAULT_COUPON_SECTION_EYEBROW,
    title: event.couponSectionTitle.trim() || DEFAULT_COUPON_SECTION_TITLE,
    notesTitle: event.couponNotesTitle.trim() || DEFAULT_COUPON_NOTES_TITLE,
  }
}

function resolveHeroInfo(event: AdminEditorialEvent, coupons: EditorialCouponItem[]): EditorialHeroInfo {
  const couponNotes = event.couponNotes
    .map((note) => note.trim())
    .filter((note) => note.length > 0)
    .slice(0, MAX_COUPON_NOTES)
  const presetCoupons = event.id === 'editorial-01' ? resolveCoupons(createEditorial01Preset()) : []
  const coupon = coupons[0] ?? presetCoupons[0] ?? null

  return {
    showPeriod: event.heroInfoShowPeriod !== false,
    showCoupon: event.heroInfoShowCoupon !== false && (event.heroInfoShowCoupon === true || coupon != null),
    title: event.heroInfoTitle.trim() || event.brandIntroHeading.trim() || event.title.trim(),
    subtitle: event.heroInfoSubtitle.trim() || event.brandIntroBody.trim(),
    period: event.period.trim(),
    couponSectionEyebrow:
      event.couponSectionEyebrow.trim() ||
      (event.id === 'editorial-01' ? createEditorial01Preset().couponSectionEyebrow : DEFAULT_COUPON_SECTION_EYEBROW),
    couponSectionTitle:
      event.couponSectionTitle.trim() ||
      (event.id === 'editorial-01' ? createEditorial01Preset().couponSectionTitle : DEFAULT_COUPON_SECTION_TITLE),
    couponTeaser:
      event.heroCouponTeaser.trim() ||
      (event.id === 'editorial-01' ? createEditorial01Preset().heroCouponTeaser : ''),
    coupon,
    couponNotes,
  }
}

function resolveHeroGallery(event: AdminEditorialEvent): string[] {
  const toUrls = (slots: { imageUrl: string | null }[]) =>
    slots
      .map((slot) => resolveImageUrl(slot.imageUrl, ''))
      .filter((url) => url.length > 0)

  const fromHero = toUrls(event.heroGalleryImages)
  if (fromHero.length) return fromHero

  const lookbookBlock = event.collectionBlocks.find((block) => block.type === 'lookbook_gallery')
  if (lookbookBlock?.type === 'lookbook_gallery') {
    const fromBlock = toUrls(lookbookBlock.images)
    if (fromBlock.length) return fromBlock
  }

  const fromFallback = toUrls(getEventFallback(event.id).heroGalleryImages)
  if (fromFallback.length) return fromFallback

  if (event.category === 'collection' || event.category === 'collabo') {
    return toUrls(createEditorial01Preset().heroGalleryImages)
  }

  return []
}

/** Resolved hero gallery URLs for collection/collabo detail pages. */
export function resolveCatalogHeroGalleryUrls(detail: EditorialEventDetail): string[] {
  if (detail.heroGallery.length > 0) return detail.heroGallery

  const lookbookBlock = detail.collectionBlocks.find((block) => block.type === 'lookbook_gallery')
  if (lookbookBlock?.type === 'lookbook_gallery') {
    const fromBlock = lookbookBlock.images.filter((url) => url.trim().length > 0)
    if (fromBlock.length) return fromBlock
  }

  if (detail.layout === 'collection') {
    return createEditorial01Preset()
      .heroGalleryImages.map((slot) => slot.imageUrl?.trim() ?? '')
      .filter((url) => url.length > 0)
  }

  return []
}

function resolveHeroTabs(event: AdminEditorialEvent, mainBanner: string): EditorialHeroTab[] {
  return [
    {
      id: 'hero-main',
      label: '',
      image: mainBanner,
      overlayTitle: '',
    },
  ]
}

function resolveBenefits(event: AdminEditorialEvent): EditorialBenefitItem[] {
  return event.benefits
    .map((item) => ({ text: item.text.trim() }))
    .filter((item) => item.text.length > 0)
}

async function resolveCollectionBlocks(
  blocks: AdminEditorialCollectionBlock[],
  fallbackTitle: string,
): Promise<EditorialCollectionBlock[]> {
  const resolved: EditorialCollectionBlock[] = []

  for (const block of blocks) {
    if (block.type === 'image') {
      const image = resolveImageUrl(block.imageUrl, '')
      if (!image) continue
      resolved.push({ id: block.id, type: 'image', image })
      continue
    }

    if (block.type === 'lookbook_gallery') {
      const images = block.images
        .map((slot) => resolveImageUrl(slot.imageUrl, ''))
        .filter((image) => image.length > 0)
      if (!images.length) continue
      resolved.push({ id: block.id, type: 'lookbook_gallery', images })
      continue
    }

    if (block.type === 'product_showcase') {
      if (block.productId == null) continue
      const product = (await fetchProductById(block.productId)) ?? null
      if (!product) continue

      const adminGallery = block.gallery
        .map((slot) => {
          const src = resolveImageUrl(slot.imageUrl, '')
          if (!src) return null
          return { src, variant: slot.variant }
        })
        .filter((item): item is { src: string; variant: 'cutout' | 'editorial' } => item != null)

      const autoGallery = buildProductShowcaseGalleryFromCuts(product)
      const gallery = pickShowcaseGallery(adminGallery, autoGallery)

      resolved.push({
        id: block.id,
        type: 'product_showcase',
        title: block.title.trim() || product.title,
        subtitle: block.subtitle.trim() || product.title,
        product,
        gallery,
      })
      continue
    }

    if (block.type === 'products') {
      const assignedIds = block.productIds.filter((id): id is number => id != null)
      if (!assignedIds.length) continue

      const fetched = await Promise.all(assignedIds.map((id) => fetchProductById(id)))
      const products = fetched.filter((item): item is NonNullable<(typeof fetched)[number]> => item != null)
      if (!products.length) continue

      resolved.push({
        id: block.id,
        type: 'products',
        title: block.title.trim() || fallbackTitle,
        products,
        columns: block.columns,
      })
    }
  }

  return resolved
}

async function resolveCatalogProductGrids(
  grids: AdminEditorialCatalogProductGrid[],
): Promise<EditorialCatalogProductGrid[]> {
  const resolved: EditorialCatalogProductGrid[] = []

  for (const grid of grids) {
    const products = await resolveProductIds(grid.productIds)
    if (!products.length) continue

    resolved.push({
      id: grid.id,
      title: grid.title.trim() || (grid.id === 'shoes' ? 'SHOES' : 'BAG & ACC'),
      products,
    })
  }

  return resolved
}

async function resolveStandaloneShowcases(
  items: AdminEditorialStandaloneProduct[],
): Promise<EditorialStandaloneShowcase[]> {
  const resolved: EditorialStandaloneShowcase[] = []

  for (const item of items) {
    if (item.productId == null) continue

    const product = (await fetchProductById(item.productId)) ?? null
    if (!product) continue

    const gallery = buildProductShowcaseGalleryFromCuts(product)

    resolved.push({
      id: item.id,
      title: item.title.trim() || product.title,
      subtitle: item.subtitle.trim() || product.title,
      product,
      gallery,
    })
  }

  return resolved
}

export function resolveEditorialListItems(config: AdminEditorialConfig = getEffectiveEditorialConfig()): EditorialEventItem[] {
  return sortEditorialEventsNewestFirst(config.events)
    .filter((event) => event.enabled)
    .map((event) => ({
      id: event.id,
      thumbnail: resolveImageUrl(event.thumbnailUrl, ''),
      title: event.title,
      period: event.period,
      category: event.category,
      categoryLabel: event.categoryLabel,
    }))
    .filter((item) => item.thumbnail && item.title)
}

export async function resolveEditorialEventDetail(
  editorialId: string,
  config: AdminEditorialConfig = getEffectiveEditorialConfig(),
): Promise<EditorialEventDetail | undefined> {
  const event = config.events.find((item) => item.id === editorialId && item.enabled)
  if (!event) return undefined

  const thumbnail = resolveImageUrl(event.thumbnailUrl, '')
  const mainBanner = resolveImageUrl(event.mainBannerUrl, thumbnail)
  const middleBanner = resolveImageUrl(event.middleBannerUrl, '')
  const layout = event.category === 'collection' || event.category === 'collabo' ? 'collection' : 'promotion'

  const featuredProducts = await resolveProductSection(event.featuredProducts)
  const mustItemSection = await resolveProductSection(event.mustItemSection)

  const productTabs: EditorialProductTab[] = (
    await Promise.all(
      event.productTabs.map(async (tab) => ({
        id: tab.id,
        label: tab.label,
        sectionTitle: tab.sectionTitle,
        products: await resolveProductIds(tab.productIds),
      })),
    )
  ).filter((tab) => tab.products.length > 0)

  const collectionBlocks =
    layout === 'collection'
      ? await resolveCollectionBlocks(event.collectionBlocks, event.title || event.categoryLabel)
      : []

  const standaloneShowcases =
    event.category === 'collection' || event.category === 'collabo'
      ? await resolveStandaloneShowcases(event.standaloneProducts)
      : []

  const catalogProductGrids =
    event.category === 'collection' || event.category === 'collabo'
      ? await resolveCatalogProductGrids(event.catalogProductGrids ?? [])
      : []

  const coupons = resolveCoupons(event)

  return {
    id: event.id,
    title: event.title,
    period: event.period,
    category: event.category,
    categoryLabel: event.categoryLabel,
    layout,
    heroTabs: resolveHeroTabs(event, mainBanner),
    mainBanner,
    middleBanner,
    heroInfo: resolveHeroInfo(event, coupons),
    heroGallery: resolveHeroGallery(event),
    brandIntro: {
      heading: event.brandIntroHeading.trim(),
      body: event.brandIntroBody.trim(),
    },
    sectionOrder: normalizeSectionOrder(event.sectionOrder),
    benefits: resolveBenefits(event).length
      ? resolveBenefits(event)
      : [{ text: '에디토리얼 혜택 정보가 준비 중입니다.' }],
    giftSection: {
      title: event.giftTitle,
      image: resolveImageUrl(event.giftImageUrl, thumbnail),
      note: event.giftNote,
    },
    coupons,
    couponNotes: event.couponNotes
      .map((note) => note.trim())
      .filter((note) => note.length > 0)
      .slice(0, MAX_COUPON_NOTES),
    couponSection: resolveCouponSection(event),
    lookbookPair: [
      resolveImageUrl(event.lookbookPair[0]?.imageUrl, ''),
      '',
    ],
    featuredProducts,
    middleLookbook: [
      resolveImageUrl(event.middleLookbook[0]?.imageUrl, ''),
      '',
    ],
    productTabs,
    mustItemSection,
    collectionBlocks,
    standaloneShowcases,
    catalogProductGrids,
  }
}
