import type { ProductCardItem } from '../components/molecules/ProductCardUnit'
import { DEFAULT_EDITORIAL_SECTION_ORDER, type EditorialSectionType } from '../lib/adminEditorialConfig'
import { resolveEditorialEventDetail } from '../lib/editorialContentResolver'
import { buildBestProducts } from './bestProducts'
import { getEditorialEvents, type EditorialEventItem } from './editorialEvents'
import { editorialAsset } from '../lib/editorialAssetUrl'
import { figmaAsset } from '../lib/figmaAssetUrl'

export interface EditorialHeroTab {
  id: string
  label: string
  image: string
  overlayTitle: string
}

export interface EditorialBenefitItem {
  text: string
}

export interface EditorialCouponItem {
  kind: 'percent' | 'amount'
  label: string
  value: string
  unit: string
  conditions: [string, string]
  validPeriod: string
  applicableProducts: string
}

export interface EditorialProductSection {
  title: string
  note?: string
  products: ProductCardItem[]
  columns: 4 | 5
  darkBackground?: boolean
}

export interface EditorialProductTab {
  id: string
  label: string
  sectionTitle: string
  products: ProductCardItem[]
}

export interface EditorialEventDetail {
  id: string
  title: string
  period: string
  heroTabs: EditorialHeroTab[]
  mainBanner: string
  middleBanner: string
  brandIntro: {
    body: string
  }
  benefits: EditorialBenefitItem[]
  giftSection: {
    title: string
    image: string
    note: string
  }
  coupons: EditorialCouponItem[]
  couponNotes: string[]
  lookbookPair: [string, string]
  featuredProducts: EditorialProductSection
  middleLookbook: [string, string]
  productTabs: EditorialProductTab[]
  mustItemSection: EditorialProductSection
  sectionOrder: EditorialSectionType[]
}

const BEST_PRODUCTS = buildBestProducts()

function productsSlice(start: number, count: number): ProductCardItem[] {
  return BEST_PRODUCTS.slice(start, start + count)
}

/** Figma 2644:60528 — OTZ ROMARY : DAY DOT EDITION (editorial-01). */
const EDITORIAL_01_DETAIL: Omit<EditorialEventDetail, 'id'> = {
  title: '스페셜 이슈 | 26SS 오찌 데이도트 에디션 발매 단독 15%',
  period: '2026.02.02 - 2026.02.15',
  heroTabs: [
    {
      id: 'hero-main',
      label: '',
      image: editorialAsset('01.png'),
      overlayTitle: '',
    },
  ],
  mainBanner: editorialAsset('01.png'),
  middleBanner: editorialAsset('02.png'),
  brandIntro: { body: '' },
  sectionOrder: [...DEFAULT_EDITORIAL_SECTION_ORDER],
  benefits: [
    { text: '최대 글자(띄워쓰기 공백 포함) 16자' },
    { text: '일이삼사오육칠팔구십일이삼사오육' },
    { text: '무료배송 (일부 상품 제외)' },
  ],
  giftSection: {
    title: 'OTZ :DOT EDITION GIFT',
    image: figmaAsset('style_05.png'),
    note: '도트 에디션 상품 구매 시 도트 선물박스 증정',
  },
  coupons: [
    {
      kind: 'percent',
      label: '장바구니 쿠폰',
      value: '15',
      unit: '%',
      conditions: ['5만원 이상 구매 시', '최대 3,000원 할인'],
      validPeriod: '2026.03.01 - 2026.03.31',
      applicableProducts: '오찌 로마리 도트팩',
    },
    {
      kind: 'amount',
      label: 'WEB 쿠폰',
      value: '10,000',
      unit: '원',
      conditions: ['5만원 이상 구매 시', '최대 3,000원 할인'],
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
  lookbookPair: [figmaAsset('lookbook_01.png'), ''],
  featuredProducts: {
    title: 'OTZ :DOT EDITION',
    products: productsSlice(0, 4),
    columns: 4,
    darkBackground: true,
  },
  middleLookbook: [figmaAsset('lookbook_03.png'), ''],
  productTabs: [
    {
      id: 'day-dot',
      label: 'DAY DOT',
      sectionTitle: 'OTZ ROMARY DAY DOT EDITION',
      products: productsSlice(0, 10),
    },
    {
      id: 'romary',
      label: 'ROMARY',
      sectionTitle: 'OTZ ROMARY COLLECTION',
      products: productsSlice(2, 10),
    },
    {
      id: 'new',
      label: 'NEW ARRIVAL',
      sectionTitle: 'OTZ NEW ARRIVAL',
      products: productsSlice(4, 10),
    },
    {
      id: 'best',
      label: 'BEST ITEM',
      sectionTitle: 'OTZ BEST ITEM',
      products: productsSlice(0, 10),
    },
  ],
  mustItemSection: {
    title: 'MUST ITEM',
    note: 'OTZ ROMARY DAY DOT EDITION',
    products: productsSlice(0, 10),
    columns: 5,
  },
}

const DETAIL_PRESETS: Record<string, Omit<EditorialEventDetail, 'id'>> = {
  'editorial-01': EDITORIAL_01_DETAIL,
}

function fallbackDetailFromListItem(item: EditorialEventItem): EditorialEventDetail {
  return {
    id: item.id,
    title: item.title,
    period: item.period,
    heroTabs: [
      {
        id: 'hero-main',
        label: '',
        image: item.thumbnail,
        overlayTitle: '',
      },
    ],
    mainBanner: item.thumbnail,
    middleBanner: '',
    brandIntro: { body: '' },
    sectionOrder: [...DEFAULT_EDITORIAL_SECTION_ORDER],
    benefits: [{ text: '에디토리얼 혜택 정보가 준비 중입니다.' }],
    giftSection: {
      title: item.categoryLabel,
      image: item.thumbnail,
      note: item.period,
    },
    coupons: [],
    couponNotes: [],
    lookbookPair: [item.thumbnail, ''],
    featuredProducts: {
      title: item.categoryLabel,
      products: productsSlice(0, 4),
      columns: 4,
    },
    middleLookbook: [item.thumbnail, ''],
    productTabs: [
      {
        id: 'all',
        label: 'ALL',
        sectionTitle: item.title,
        products: productsSlice(0, 10),
      },
    ],
    mustItemSection: {
      title: 'MUST ITEM',
      products: productsSlice(0, 10),
      columns: 5,
    },
  }
}

/** @deprecated Prefer fetchEditorialEventDetail for async product resolution. */
export function getEditorialEventDetail(editorialId: string): EditorialEventDetail | undefined {
  const listItem = getEditorialEvents().find((item) => item.id === editorialId)
  if (!listItem) return undefined

  const preset = DETAIL_PRESETS[editorialId]
  if (preset) {
    return { id: editorialId, ...preset }
  }

  return fallbackDetailFromListItem(listItem)
}

export async function fetchEditorialEventDetail(
  editorialId: string,
): Promise<EditorialEventDetail | undefined> {
  const resolved = await resolveEditorialEventDetail(editorialId)
  if (resolved) return resolved
  return getEditorialEventDetail(editorialId)
}

export function getEditorialEventById(editorialId: string): EditorialEventItem | undefined {
  return getEditorialEvents().find((item) => item.id === editorialId)
}
