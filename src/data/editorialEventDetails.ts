import type { ProductCardItem } from '../components/molecules/ProductCardUnit'
import { DEFAULT_EDITORIAL_SECTION_ORDER, type EditorialSectionType } from '../lib/adminEditorialConfig'
import { resolveEditorialEventDetail } from '../lib/editorialContentResolver'
import { buildBestProducts } from './bestProducts'
import { getEditorialEvents, type EditorialEventItem, type EditorialCategoryId } from './editorialEvents'
import { editorialAsset } from '../lib/editorialAssetUrl'
import { figmaAsset } from '../lib/figmaAssetUrl'

export type EditorialDetailLayout = 'promotion' | 'collection'

export interface EditorialCollectionImageBlock {
  id: string
  type: 'image'
  image: string
}

export interface EditorialCollectionProductsBlock {
  id: string
  type: 'products'
  title: string
  products: ProductCardItem[]
  columns: 4 | 5
}

export interface EditorialCollectionLookbookGalleryBlock {
  id: string
  type: 'lookbook_gallery'
  images: string[]
}

export interface EditorialShowcaseGalleryImage {
  src: string
  fallbackSrc?: string
  variant: 'cutout' | 'editorial'
}

export interface EditorialCollectionProductShowcaseBlock {
  id: string
  type: 'product_showcase'
  title: string
  subtitle: string
  product: ProductCardItem
  gallery: EditorialShowcaseGalleryImage[]
}

/** Figma 144:4223 — resolved standalone product below hero gallery. */
export interface EditorialStandaloneShowcase {
  id: string
  title: string
  subtitle: string
  product: ProductCardItem
  gallery: EditorialShowcaseGalleryImage[]
}

/** Figma 151:4481 — SHOES / BAG & ACC 5-column catalog product grid. */
export interface EditorialCatalogProductGrid {
  id: 'shoes' | 'bagacc'
  title: string
  products: ProductCardItem[]
}

export type EditorialCollectionBlock =
  | EditorialCollectionImageBlock
  | EditorialCollectionProductsBlock
  | EditorialCollectionLookbookGalleryBlock
  | EditorialCollectionProductShowcaseBlock

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
  downloadLabel: string
}

export interface EditorialCouponSectionConfig {
  eyebrow: string
  title: string
  notesTitle: string
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

export interface EditorialHeroInfo {
  showPeriod: boolean
  showCoupon: boolean
  title: string
  subtitle: string
  period: string
  /** Admin 쿠폰 타이틀 · 메인 타이틀 (COUPON 섹션 eyebrow 공용) */
  couponSectionEyebrow: string
  /** Admin 쿠폰 타이틀 · 서브문구 (COUPON 섹션 title 공용) */
  couponSectionTitle: string
  couponTeaser: string
  coupon: EditorialCouponItem | null
  couponNotes: string[]
}

export interface EditorialEventDetail {
  id: string
  title: string
  period: string
  category: Exclude<EditorialCategoryId, 'all'>
  categoryLabel: string
  layout: EditorialDetailLayout
  heroTabs: EditorialHeroTab[]
  mainBanner: string
  /** Figma 196:5779 — collabo main banner overlay title */
  collaboBannerTitle: string
  middleBanner: string
  heroInfo: EditorialHeroInfo
  brandIntro: {
    heading: string
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
  couponSection: EditorialCouponSectionConfig
  lookbookPair: [string, string]
  featuredProducts: EditorialProductSection
  middleLookbook: [string, string]
  productTabs: EditorialProductTab[]
  mustItemSection: EditorialProductSection
  sectionOrder: EditorialSectionType[]
  collectionBlocks: EditorialCollectionBlock[]
  /** Figma 144:4223 — standalone products directly below hero gallery */
  standaloneShowcases: EditorialStandaloneShowcase[]
  /** Figma 151:4481 — SHOES / BAG & ACC product grids below standalone products */
  catalogProductGrids: EditorialCatalogProductGrid[]
  /** Figma 143:4669 — 2-column masonry below hero info (collection/collabo) */
  heroGallery: string[]
}

const BEST_PRODUCTS = buildBestProducts()

function productsSlice(start: number, count: number): ProductCardItem[] {
  return BEST_PRODUCTS.slice(start, start + count)
}

/** Figma 2644:60528 — OTZ ROMARY : DAY DOT EDITION (editorial-01). */
const EDITORIAL_01_DETAIL: Omit<EditorialEventDetail, 'id'> = {
  title: '스페셜 이슈 | 26SS 오찌 데이도트 에디션 발매 단독 15%',
  period: '2026.02.02 - 2026.02.15',
  category: 'collection',
  categoryLabel: 'COLLECTION',
  layout: 'collection',
  heroTabs: [
    {
      id: 'hero-main',
      label: '',
      image: editorialAsset('01.png'),
      overlayTitle: '',
    },
  ],
  mainBanner: editorialAsset('01.png'),
  collaboBannerTitle: '',
  middleBanner: editorialAsset('02.png'),
  heroInfo: {
    showPeriod: true,
    showCoupon: true,
    title: 'limited edition\nCOCOA MAUVE',
    subtitle:
      '모델 서지수와 함께한 코코아 모브 에디션이 무신사 단독 선발매되었습니다.\n\n오찌에서 사랑받은 로미타와 로마리, 그리고 플랩 스니커즈까지\n부드럽고 감각적인 스웨이드 소재로 찾아왔어요.\n미니멀한 감성이 고급스러운 오찌 스웨이드 숄더백도 함께 만나보세요.',
    period: '2026.06.13 - 2026.06.24',
    couponSectionEyebrow: 'SPECIAL GIFT',
    couponSectionTitle: 'COUPON',
    couponTeaser: '15% 장바구니 쿠폰을 드립니다.',
    coupon: {
      kind: 'percent',
      label: '장바구니 쿠폰',
      value: '15',
      unit: '%',
      conditions: ['ID당 3회 발급/사용 가능', ''],
      validPeriod: '2026.03.01 - 2026.03.31',
      applicableProducts: '오찌 로마리 도트팩',
      downloadLabel: '쿠폰 다운로드하기',
    },
    couponNotes: [],
  },
  brandIntro: {
    heading: 'OTZ ROMARY : DAY DOT EDITION',
    body: '도트 패턴이 돋보이는 26SS 시즌 컬렉션. 데일리와 스페셜 데이를 아우르는 로마리 라인업을 만나보세요.',
  },
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
      downloadLabel: '쿠폰 다운로드하기',
    },
    {
      kind: 'amount',
      label: 'WEB 쿠폰',
      value: '10,000',
      unit: '원',
      conditions: ['5만원 이상 구매 시', '최대 3,000원 할인'],
      validPeriod: '2026.03.01 - 2026.03.31',
      applicableProducts: '오찌 로마리 도트팩',
      downloadLabel: '쿠폰 다운로드하기',
    },
  ],
  couponNotes: [
    '기획전 내 아우터 상품에 적용 가능한 선착순 쿠폰 입니다. (일부상품 제외)',
    '12월 31일까지 사용 가능합니다.',
    '선착순 수량 소진 시 사전고지 없이 중단됩니다.',
    '업체사정 및 예산소진에 따라 사전고지없이 중단될 수 있습니다.',
  ],
  couponSection: {
    eyebrow: 'SPECIAL GIFT',
    title: 'COUPON',
    notesTitle: '유의사항',
  },
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
  collectionBlocks: [
    { id: 'collection-img-1', type: 'image', image: figmaAsset('lookbook_01.png') },
    {
      id: 'collection-products-1',
      type: 'products',
      title: 'OTZ :DOT EDITION',
      products: productsSlice(0, 8),
      columns: 4,
    },
    { id: 'collection-img-2', type: 'image', image: figmaAsset('lookbook_03.png') },
    {
      id: 'collection-products-2',
      type: 'products',
      title: 'MUST ITEM',
      products: productsSlice(0, 8),
      columns: 4,
    },
  ],
  standaloneShowcases: [],
  catalogProductGrids: [],
  heroGallery: [
    editorialAsset('file_1779094089632_735498899_zk705v.jpg'),
    editorialAsset('file_1779094091918_737785099_t3nj62.webp'),
    editorialAsset('file_1779094091919_737785599_6pideo.webp'),
    editorialAsset('file_1779094091921_737787199_6mien5.webp'),
    editorialAsset('file_1779094091922_737789000_82ohql.webp'),
    editorialAsset('file_1779094091923_737789300_7pg1o6.webp'),
    editorialAsset('641238338_18076457318452144_4351508791800917445_n.jpg'),
    editorialAsset('642144030_18076372550452144_5408059011483960542_n.jpg'),
  ],
}

const DETAIL_PRESETS: Record<string, Omit<EditorialEventDetail, 'id'>> = {
  'editorial-01': EDITORIAL_01_DETAIL,
}

function fallbackDetailFromListItem(item: EditorialEventItem): EditorialEventDetail {
  const isCollection = item.category === 'collection'
  return {
    id: item.id,
    title: item.title,
    period: item.period,
    category: item.category,
    categoryLabel: item.categoryLabel,
    layout: isCollection ? 'collection' : 'promotion',
    heroTabs: [
      {
        id: 'hero-main',
        label: '',
        image: item.thumbnail,
        overlayTitle: '',
      },
    ],
    mainBanner: item.thumbnail,
    collaboBannerTitle: item.category === 'collabo' ? item.title : '',
    middleBanner: '',
    heroInfo: {
      showPeriod: Boolean(item.period?.trim()),
      showCoupon: false,
      title: item.title,
      subtitle: '',
      period: item.period,
      couponSectionEyebrow: 'SPECIAL GIFT',
      couponSectionTitle: 'COUPON',
      couponTeaser: '',
      coupon: null,
      couponNotes: [],
    },
    brandIntro: { heading: '', body: '' },
    sectionOrder: [...DEFAULT_EDITORIAL_SECTION_ORDER],
    benefits: [{ text: '에디토리얼 혜택 정보가 준비 중입니다.' }],
    giftSection: {
      title: item.categoryLabel,
      image: item.thumbnail,
      note: item.period,
    },
    coupons: [],
    couponNotes: [],
    couponSection: {
      eyebrow: 'SPECIAL GIFT',
      title: 'COUPON',
      notesTitle: '유의사항',
    },
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
    collectionBlocks: isCollection
      ? [
          { id: 'fallback-img', type: 'image', image: item.thumbnail },
          {
            id: 'fallback-products',
            type: 'products',
            title: item.categoryLabel,
            products: productsSlice(0, 8),
            columns: 4,
          },
        ]
      : [],
    standaloneShowcases: [],
  catalogProductGrids: [],
    heroGallery: [],
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
