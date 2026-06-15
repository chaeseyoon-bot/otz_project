import type { ProductCardItem } from '../components/molecules/ProductCardUnit'
import { buildBestProducts } from '../data/bestProducts'
import type { EditorialEventItem } from '../data/editorialEvents'
import type {
  EditorialBenefitItem,
  EditorialCouponItem,
  EditorialEventDetail,
  EditorialHeroTab,
  EditorialProductSection,
  EditorialProductTab,
} from '../data/editorialEventDetails'
import {
  type AdminEditorialConfig,
  type AdminEditorialEvent,
  type AdminEditorialProductSection,
  type EditorialSectionType,
  FEATURED_PRODUCT_SLOTS,
  loadAdminEditorialConfig,
  MUST_ITEM_SLOTS,
  normalizeSectionOrder,
  PRODUCT_TAB_SLOTS,
  sortEditorialEventsNewestFirst,
} from './adminEditorialConfig'
import { fetchProductById } from './productsApi'

const MOCK_PRODUCTS = buildBestProducts()

function resolveImageUrl(url: string | null | undefined, fallback: string): string {
  return url?.trim() || fallback
}

function mockProductsSlice(start: number, count: number): ProductCardItem[] {
  return MOCK_PRODUCTS.slice(start, start + count)
}

async function resolveProductIds(ids: (number | null)[], slotCount: number): Promise<ProductCardItem[]> {
  const resolved: ProductCardItem[] = []
  let mockIndex = 0

  for (let index = 0; index < slotCount; index += 1) {
    const productId = ids[index]
    if (productId != null) {
      const product = await fetchProductById(productId)
      if (product) {
        resolved.push(product)
        continue
      }
    }
    const fallback = MOCK_PRODUCTS[mockIndex % MOCK_PRODUCTS.length]
    if (fallback) resolved.push(fallback)
    mockIndex += 1
  }

  return resolved
}

async function resolveProductSection(
  section: AdminEditorialProductSection,
  slotCount: number,
): Promise<EditorialProductSection> {
  const products = await resolveProductIds(section.productIds, slotCount)
  return {
    title: section.title,
    note: section.note.trim() || undefined,
    products,
    columns: section.columns,
    darkBackground: section.darkBackground || undefined,
  }
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

function resolveCoupons(event: AdminEditorialEvent): EditorialCouponItem[] {
  return event.coupons.map((coupon) => ({
    kind: coupon.kind,
    label: coupon.label,
    value: coupon.value,
    unit: coupon.unit,
    conditions: [coupon.condition1, coupon.condition2],
    validPeriod: coupon.validPeriod,
    applicableProducts: coupon.applicableProducts,
  }))
}

function resolveBenefits(event: AdminEditorialEvent): EditorialBenefitItem[] {
  return event.benefits
    .map((item) => ({ text: item.text.trim() }))
    .filter((item) => item.text.length > 0)
}

export function resolveEditorialListItems(config: AdminEditorialConfig = loadAdminEditorialConfig()): EditorialEventItem[] {
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
  config: AdminEditorialConfig = loadAdminEditorialConfig(),
): Promise<EditorialEventDetail | undefined> {
  const event = config.events.find((item) => item.id === editorialId && item.enabled)
  if (!event) return undefined

  const thumbnail = resolveImageUrl(event.thumbnailUrl, '')
  const mainBanner = resolveImageUrl(event.mainBannerUrl, thumbnail)
  const middleBanner = resolveImageUrl(event.middleBannerUrl, '')

  const featuredProducts = await resolveProductSection(event.featuredProducts, FEATURED_PRODUCT_SLOTS)
  const mustItemSection = await resolveProductSection(event.mustItemSection, MUST_ITEM_SLOTS)

  const productTabs: EditorialProductTab[] = await Promise.all(
    event.productTabs.map(async (tab) => ({
      id: tab.id,
      label: tab.label,
      sectionTitle: tab.sectionTitle,
      products: await resolveProductIds(tab.productIds, PRODUCT_TAB_SLOTS),
    })),
  )

  return {
    id: event.id,
    title: event.title,
    period: event.period,
    heroTabs: resolveHeroTabs(event, mainBanner),
    mainBanner,
    middleBanner,
    brandIntro: { body: '' },
    sectionOrder: normalizeSectionOrder(event.sectionOrder),
    benefits: resolveBenefits(event).length
      ? resolveBenefits(event)
      : [{ text: '에디토리얼 혜택 정보가 준비 중입니다.' }],
    giftSection: {
      title: event.giftTitle,
      image: resolveImageUrl(event.giftImageUrl, thumbnail),
      note: event.giftNote,
    },
    coupons: resolveCoupons(event),
    couponNotes: event.couponNotes,
    lookbookPair: [
      resolveImageUrl(event.lookbookPair[0]?.imageUrl, ''),
      '',
    ],
    featuredProducts: featuredProducts.products.length
      ? featuredProducts
      : {
          title: event.featuredProducts.title || event.categoryLabel,
          products: mockProductsSlice(0, FEATURED_PRODUCT_SLOTS),
          columns: event.featuredProducts.columns,
          darkBackground: event.featuredProducts.darkBackground,
        },
    middleLookbook: [
      resolveImageUrl(event.middleLookbook[0]?.imageUrl, ''),
      '',
    ],
    productTabs: productTabs.length
      ? productTabs
      : [
          {
            id: 'all',
            label: 'ALL',
            sectionTitle: event.title,
            products: mockProductsSlice(0, PRODUCT_TAB_SLOTS),
          },
        ],
    mustItemSection: mustItemSection.products.length
      ? mustItemSection
      : {
          title: event.mustItemSection.title || 'MUST ITEM',
          note: event.mustItemSection.note.trim() || undefined,
          products: mockProductsSlice(0, MUST_ITEM_SLOTS),
          columns: event.mustItemSection.columns,
        },
  }
}
