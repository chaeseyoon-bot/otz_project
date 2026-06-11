import { brandStoryAsset, brandStoryProductAsset } from '../lib/brandStoryAssetUrl'
import { resolveBrandSeriesCategoryPath } from '../lib/categoryRoutes'

export interface BrandStoryLineupItem {
  id: string
  bannerImage: string
  /** Optional background layer behind the main banner image (Figma 2952:1275 Topi). */
  bannerImageSecondary?: string
  /** Tailwind classes for the secondary banner image layer. */
  bannerImageSecondaryClass?: string
  /** Tailwind classes for banner image positioning inside the 690×856 panel. */
  bannerImageClass?: string
  /** Banner overlay text horizontal alignment (Figma 2952:1271). */
  bannerTextAlign?: 'left' | 'center'
  /** When false, skips the shared black/20 dim layer (e.g. baked into exported banner). */
  bannerDimOverlay?: boolean
  headerText: string
  headerAlign: 'left' | 'right'
  /** Tailwind classes for the product header area above the thumb grid. */
  productHeaderClass?: string
  /** Product thumb grid layout variant (Figma 2952:1275 Topi uses `topi`). */
  productGridLayout?: 'standard' | 'topi'
  /** Mobile banner image crop inside the 345×428 card (Figma 2966:4716). */
  mobileBannerImageClass?: string
  mobileBannerWidth?: number
  mobileBannerHeight?: number
  /** When false, skips the mobile black/20 overlay (e.g. Topi). */
  mobileBannerDimOverlay?: boolean
  title: string
  body: string
  ctaHref: string
  imagePosition: 'left' | 'right'
  productThumbs: string[]
}

const H3300_THUMBS = Array.from({ length: 9 }, (_, index) =>
  brandStoryProductAsset(
    `brandstory_3300_${String(index + 1).padStart(2, '0')}.png`,
  ),
)

const TOPI_THUMBS = Array.from({ length: 4 }, (_, index) =>
  brandStoryProductAsset(
    `brandstory_topi_${String(index + 1).padStart(2, '0')}.png`,
  ),
)

const ROMARY_THUMBS = Array.from({ length: 9 }, (_, index) =>
  brandStoryProductAsset(
    `brandstory_romary_${String(index + 1).padStart(2, '0')}.png`,
  ),
)

const LOMITA_THUMBS = Array.from({ length: 9 }, (_, index) =>
  brandStoryProductAsset(
    `brandstory_lomita_${String(index + 1).padStart(2, '0')}.png`,
  ),
)

export const DEFAULT_BANNER_IMAGE_CLASS =
  'absolute left-0 top-[-40.7%] h-[146.47%] w-[145.36%] max-w-none rounded-[40px] object-cover'

export const BRAND_STORY_PAGE_COPY = {
  pageTitle: 'BRAND STORY',
  heroImage: brandStoryAsset('hero_banner.png'),
  introEyebrow: 'EVRYDAY SPECIAL',
  introBody:
    '오찌는 2009년 따스한 태양 아래 바닷바람이 살랑이는 캘리포니아 말리부의 자연에서 탄생한 브랜드입니다.\n우리는 일상 속에서도 여행과 같은 설렘이 느껴지도록 일상의 특별함을 선물합니다.\n\n미니멀한 디자인과 맨발의 편안함을 담은 신발을 통해 캘리포니아의 여유롭고 편안한 라이프스타일을 재해석했습니다.\n말리부의 포근한 햇살과 부드러운 모래 위를 걷는 느낌 그대로.\n오찌의 특별한 여정을 함께하세요.',
  signatureTitle: 'OTZ만의 시그니처 감성',
  signatureBody:
    'OTZ 브랜드의 시그니처인 둥급 쉐입의 앞코 실루엣은 5,000년 전 북부 알프스 산맥에서 발견된 OTZI 아이스맨으로 부터 영감을 받아 캘리포니아의 크리에이티브 디렉터 LUDO에 의해 미니멀하고 편안함을 담은 현대적 감각으로 재해석되면서 시작되었습니다.',
  signatureImage: brandStoryProductAsset('brandstory_01.png'),
  cushionTitle: '편안함과 자연스러운 핏의 쿠션',
  cushionHighlight: '통기성이 좋아서 맨발로 신어도 편해요!',
  cushionBody:
    '반발력을 지닌 메모리 쿠션인 코르크로 오랜시간 충격흡수를 해주며, \n발의 자연스러운 윤곽에 맞게 설계 되어 편안한 착화감을 제공합니다.',
  cushionImage: brandStoryProductAsset('brandstory_02.png'),
  lineupHeading: 'THE SIGNATURE\nLINE-UP',
  ctaLabel: '상품 보러 가기',
} as const

export const BRAND_STORY_LINEUP: BrandStoryLineupItem[] = [
  {
    id: 'romari',
    bannerImage: brandStoryProductAsset('brandstory_romary.png'),
    bannerImageClass:
      'absolute top-0 h-[856px] w-[690px] max-w-none rounded-[40px] object-cover',
    bannerTextAlign: 'center',
    headerText: 'OTZ ESSENTIAL\nROMARY',
    headerAlign: 'right',
    title: 'ROMARY',
    body: 'OTZ의 대표 라인으로 자리 매김한 로마리\n낮은 굽에 스니커즈 아웃솔을 더해 날렵하지만, 편안한 착화감을 선사합니다. 일상은 물론 격식 있는 자리까지 자연스럽게 스타일링할 수 있습니다.',
    ctaHref: resolveBrandSeriesCategoryPath('ROMARI') ?? '/category/shoes?main=collection&sub=로마리',
    imagePosition: 'left',
    productThumbs: [...ROMARY_THUMBS],
    mobileBannerImageClass:
      'absolute left-0 top-0 h-[428px] w-[345px] max-w-none object-cover',
  },
  {
    id: 'lomita',
    bannerImage: brandStoryProductAsset('brandstory_lomita.png'),
    bannerImageClass:
      'absolute left-0 top-0 h-[856px] w-[690px] max-w-none rounded-[40px] object-cover',
    bannerTextAlign: 'left',
    headerText: 'OTZ ICONIC\nLOMITA',
    headerAlign: 'left',
    productHeaderClass: 'flex h-[326px] shrink-0 flex-col items-start',
    title: 'LOMITA',
    body: 'OTZ의 아이코닉 로미타\n안정적인 플랫폼이 자연스럽게 높이를 더하고 편안한 균형을 완성합니다.\n메리제인부터 스니커즈까지 오찌만의 감성을 담은 시그니처 라인입니다.',
    ctaHref: resolveBrandSeriesCategoryPath('LOMITA') ?? '/category/shoes?main=collection&sub=로미타',
    imagePosition: 'right',
    productThumbs: [...LOMITA_THUMBS],
    mobileBannerImageClass:
      'absolute left-0 top-[-10.73%] size-[110.76%] max-w-none object-cover',
  },
  {
    id: 'topi',
    bannerImage: brandStoryProductAsset('brandstory_topi.png'),
    bannerImageClass:
      'absolute left-0 top-0 h-[100.47%] w-full max-w-none rounded-[40px] object-cover',
    bannerTextAlign: 'left',
    headerText: 'SLEEK PROFILE\nTOPI',
    headerAlign: 'right',
    productHeaderClass: 'flex h-[506px] shrink-0 flex-col items-end',
    productGridLayout: 'topi',
    title: 'TOPI',
    body: '플랫폼 클로그 타입의 감각적인 실루엣, 토피\n간결한 디자인과 안정적인 착화감으로 편안한 데일리 스타일을 완성합니다. 최근 로파서울과의 협업으로 더욱 주목받은 OTZ의 대표 라인입니다.',
    ctaHref: resolveBrandSeriesCategoryPath('TOPI') ?? '/category/shoes?main=collection&sub=토피',
    imagePosition: 'left',
    productThumbs: [...TOPI_THUMBS],
    mobileBannerImageClass:
      'absolute left-0 top-0 h-[428px] w-[345px] max-w-none object-cover',
    mobileBannerDimOverlay: false,
  },
  {
    id: '3300',
    bannerImage: brandStoryProductAsset('brandstory_3300.png'),
    bannerImageClass:
      'absolute left-0 top-0 h-[100.47%] w-full max-w-none rounded-[40px] object-cover',
    bannerTextAlign: 'left',
    headerText: 'OTZ HERITAGE\n3300',
    headerAlign: 'left',
    productHeaderClass: 'flex h-[346px] shrink-0 flex-col items-start',
    title: '3300',
    body: 'OTZ의 헤리티지를 담은 3300.\n넓고 둥근 쉐입으로 편안한 착화감과 여유로운 실루엣을 완성합니다. 하이와 로우 두 가지 높이로 브랜드의 아이코닉한 스타일을 제안합니다.',
    ctaHref: resolveBrandSeriesCategoryPath('3300') ?? '/category/shoes?main=collection&sub=3300',
    imagePosition: 'right',
    productThumbs: [...H3300_THUMBS],
    mobileBannerImageClass:
      'absolute h-[107.85%] left-0 max-w-none top-[-7.82%] w-[107.54%] object-cover',
    mobileBannerWidth: 343,
    mobileBannerHeight: 429,
  },
]
