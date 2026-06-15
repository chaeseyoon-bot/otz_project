import type { CurationItem, HeroSlide, PromotionalBanner } from '../design-system/types'
import { homeBannerAsset } from '../lib/homeBannersAssetUrl'

export const figmaGuide = {
  fileUrl:
    'https://www.figma.com/design/3bBi5a4TlJxUjdrFmkgp0e/-260210-%EC%98%A4%EC%B0%8C%EA%B3%B5%ED%99%88%EC%8B%A0%EA%B7%9C%EA%B5%AC%EC%B6%95?node-id=2355-318&m=dev',
  nodes: {
    root: '2355:318',
    mainBanner: '2355:374',
    category: '2354:5239',
    forYou: '2354:4842',
    brand: '2371:6643',
    planningA: '2354:4359',
    curation: '2424:16149',
    styling: '2384:7536',
    lookbook: '2366:5794',
  },
} as const

/** Main banner frames (2355:374) — indicator row uses 7 segments per Figma; slides cycle the 4 unique frames. */
const HERO_UNIQUE: HeroSlide[] = [
  {
    id: 'hero-a',
    title: 'OTZ x LOFA Seoul',
    subtitle: '감각적인 라이프스타일 브랜드 로파서울과의 만남',
    ctaLabel: '쇼핑 바로가기',
    imageUrl: homeBannerAsset('banner_01.png'),
  },
  {
    id: 'hero-b',
    title: ':DOT EDITION',
    subtitle: '하루를 함께 하는 작은 포인트',
    ctaLabel: '쇼핑 바로가기',
    imageUrl: homeBannerAsset('banner_02.png'),
  },
  {
    id: 'hero-c',
    title: 'Winter Collection',
    subtitle: '포근한 스타일링을 완성해줄 다양한 아이템',
    ctaLabel: '쇼핑 바로가기',
    imageUrl: homeBannerAsset('banner_03.png'),
  },
  {
    id: 'hero-d',
    title: 'OTZ x LOFA Seoul',
    subtitle: '감각적인 라이프스타일 브랜드 로파서울과의 만남',
    ctaLabel: '쇼핑 바로가기',
    imageUrl: homeBannerAsset('banner_01.png'),
  },
]

export const HERO_INDICATOR_SEGMENTS = 7

const HERO_ROTATION_PATTERN: readonly number[] = [0, 1, 2, 3, 0, 1, 2]

export const heroSlides: HeroSlide[] = HERO_ROTATION_PATTERN.map((uniqueIdx, i) => {
  const base = HERO_UNIQUE[uniqueIdx]!
  return {
    ...base,
    id: `hero-${i + 1}`,
  }
})

export const planningBanner: PromotionalBanner = {
  id: 'planning-a',
  badge: '26SS',
  title: '코지 발레코어 슈즈',
  subtitle: '오찌x 론론 핑크와 그레이의 세련된 조합',
  imageUrl: homeBannerAsset('promo_03.png'),
}

export const curationItems: CurationItem[] = [
  {
    id: 'curation-1',
    imageUrl: homeBannerAsset('curation_01.png'),
    productName: '투웨이 이어머프캡 FLOTFF4H02',
    discount: '15%',
    price: '67,990',
  },
  {
    id: 'curation-2',
    imageUrl: homeBannerAsset('curation_02.png'),
    productName: '벌루니 시어링 마이크로 미니백 FLOTFA3B14',
    discount: '15%',
    price: '35,900',
  },
  {
    id: 'curation-3',
    imageUrl: homeBannerAsset('curation_03.png'),
    productName: '벌루니 퍼 메리제인 FLOTGA4W36',
    discount: '16%',
    price: '25,900',
  },
  {
    id: 'curation-4',
    imageUrl: homeBannerAsset('curation_04.png'),
    productName: '투웨이 이어머프캡 FLOTFF4H03',
    discount: '20%',
    price: '55,900',
  },
]
