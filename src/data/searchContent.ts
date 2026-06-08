import { shoesProductSlides } from '../lib/shoesAssetUrl'

export interface SearchProductThumb {
  id: string
  image: string
  title: string
}

/** Mobile — CMS season keywords; hide section when empty. */
export const SEASON_KEYWORDS = [
  '도트에디션',
  '로마리 스웨이드',
  '3300',
  '메리제인슈즈',
] as const

/** Mobile popular search list. */
export const POPULAR_SEARCHES = [
  '메리제인슈즈',
  '도트 토피',
  '발레리나슈즈',
  '키높이',
  '로미타 플랫폼',
  '글로시 메리제인',
  '오찌x로파서울',
  '헤어 액세서리',
  '레이스업 스니커즈',
  '3300',
] as const

/** PC search overlay — Figma 2685:20208. */
export const PC_POPULAR_SEARCHES = [
  '메리제인',
  '발레리나슈즈',
  '로미타플랫폼',
  '클로그',
  '3300하이',
  '워머',
  '퍼슬리퍼',
  '로마리스웨이드',
  '토피도트에디션',
  '슬라이드',
] as const

export const PC_SEASON_KEYWORDS = ['메리제인', '스니커즈', '샌들', '슬라이드'] as const

export const AUTOCOMPLETE_SUGGESTIONS = [
  '메리제인',
  '메리제인 슈즈',
  '메리제인 스니커즈',
  '메리제인 운동화',
  '로마리 메리제인',
  '로미타 메리제인',
] as const

function buildSearchProductThumb(productNum: number, title: string): SearchProductThumb {
  return {
    id: `search-product-${productNum}`,
    image: shoesProductSlides(productNum).primary,
    title,
  }
}

export const RECOMMENDED_SEARCH_PRODUCTS: readonly SearchProductThumb[] = [
  buildSearchProductThumb(1, '[오찌] 베이직 코워칸 스웨이드 스니커즈'),
  buildSearchProductThumb(2, '[오찌트립] 베이직 벨벳 스니커즈'),
  buildSearchProductThumb(3, '로마리 스웨이드 밴딩플랫 메리제인'),
  buildSearchProductThumb(4, '[토피] 스웨이드 클로그'),
  buildSearchProductThumb(5, '[3300] 캔버스 스니커즈'),
  buildSearchProductThumb(6, '[툴레아] 스웨이드 레이스업'),
]

/** Mobile search results PLP — Figma 2978:14872. */
export const SEARCH_RESULT_RECOMMENDED_KEYWORDS = [
  '로마리',
  '메리제인슈즈',
  '도트에디션',
  '3300',
] as const

/** Demo total when keyword matches broad catalog (e.g. 운동화). */
export const DEMO_SEARCH_RESULT_TOTAL = 3037

/** PC search results — Figma 2978:14413 (e.g. 메리제인). */
export const DEMO_PC_SEARCH_RESULT_TOTAL = 80

export const DEFAULT_SEARCH_RESULTS_QUERY = '메리제인'

export const DEMO_RECENTLY_VIEWED_PRODUCTS: readonly SearchProductThumb[] = [
  buildSearchProductThumb(7, '[필그림] 첼시 부츠'),
  buildSearchProductThumb(8, '[말리부] 스트랩 샌들'),
  buildSearchProductThumb(9, '[피스모] 슬라이드'),
  buildSearchProductThumb(10, '[벌루니] 플랫 로퍼'),
  buildSearchProductThumb(11, '[머피스] 컴포트 슈즈'),
  buildSearchProductThumb(12, '[오찌] 베이직 코워칸 스웨이드 스니커즈'),
  buildSearchProductThumb(13, '[오찌트립] 베이직 벨벳 스니커즈'),
  buildSearchProductThumb(14, '로마리 스웨이드 밴딩플랫 메리제인'),
  buildSearchProductThumb(15, '[토피] 스웨이드 클로그'),
  buildSearchProductThumb(16, '[3300] 캔버스 스니커즈'),
]
