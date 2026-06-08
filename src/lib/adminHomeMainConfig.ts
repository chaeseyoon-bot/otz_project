export type QuickMenuSlotType = 'image' | 'text' | 'cutout' | 'mixed'

export interface AdminMainBannerSlide {
  id: string
  imageUrl: string | null
  imageFileName: string | null
  title: string
  subtitle: string
  ctaLabel: string
  ctaHref: string
}

export interface AdminQuickMenuSlot {
  id: string
  slotType: QuickMenuSlotType
  /** In-tile label (mixed/text) or bottom caption source for image/cutout. */
  label: string
  /** Bottom caption for mixed slots (Figma quick menu item label below tile). */
  captionLabel: string
  imageUrl: string | null
  imageFileName: string | null
  href: string
  bgColor: string
  textColor: string
}

export interface AdminBrandBanner {
  imageUrl: string | null
  imageFileName: string | null
  body: string
}

export interface AdminSeriesBanner {
  id: string
  title: string
  body: string
  imageUrl: string | null
  imageFileName: string | null
  ctaLabel: string
  ctaHref: string
}

export interface AdminHomeMainConfig {
  version: 2
  mainBanners: AdminMainBannerSlide[]
  quickMenuSlots: AdminQuickMenuSlot[]
  brandBanner: AdminBrandBanner
  seriesBanners: AdminSeriesBanner[]
  updatedAt: string | null
}

function normalizeQuickMenuSlot(slot: Partial<AdminQuickMenuSlot>, fallback: AdminQuickMenuSlot): AdminQuickMenuSlot {
  return {
    ...fallback,
    ...slot,
    captionLabel: typeof slot.captionLabel === 'string' ? slot.captionLabel : '',
  }
}

export function getQuickMenuCaptionBelow(slot: AdminQuickMenuSlot): string | null {
  if (slot.slotType === 'mixed') {
    const caption = slot.captionLabel.trim()
    return caption || null
  }
  if (slot.slotType === 'image' || slot.slotType === 'cutout') {
    const caption = slot.label.trim()
    return caption || null
  }
  return null
}

export const HOME_MAIN_CONFIG_UPDATED_EVENT = 'otz-home-main-config-updated'

const STORAGE_KEY = 'otz-admin-home-main'

/** Figma 2601:22673 — 6 tiles × 160px + 5 gaps × 10px = 1010px row. */
const DEFAULT_QUICK_MENU: AdminQuickMenuSlot[] = [
  { id: 'qm-1', slotType: 'image', label: '봄 Edition', captionLabel: '', imageUrl: null, imageFileName: null, href: '', bgColor: '#F6F6F6', textColor: '#1A1A1A' },
  {
    id: 'qm-2',
    slotType: 'mixed',
    label: 'Best\nSellers',
    captionLabel: 'BEST',
    imageUrl: null,
    imageFileName: null,
    href: '/best',
    bgColor: '#000000',
    textColor: '#DEDEDE',
  },
  {
    id: 'qm-3',
    slotType: 'mixed',
    label: 'New\nArrivals',
    captionLabel: 'NEW',
    imageUrl: null,
    imageFileName: null,
    href: '/new',
    bgColor: '#444444',
    textColor: '#FFFFFF',
  },
  { id: 'qm-4', slotType: 'image', label: 'SHOES', captionLabel: '', imageUrl: null, imageFileName: null, href: '/category/shoes', bgColor: '#F1F1F1', textColor: '#1A1A1A' },
  { id: 'qm-5', slotType: 'image', label: 'BAGS', captionLabel: '', imageUrl: null, imageFileName: null, href: '/category/shoes?main=bag-acc&sub=가방', bgColor: '#F1F1F1', textColor: '#1A1A1A' },
  { id: 'qm-6', slotType: 'image', label: 'ACC', captionLabel: '', imageUrl: null, imageFileName: null, href: '/category/shoes?main=bag-acc', bgColor: '#F1F1F1', textColor: '#1A1A1A' },
]

export function createEmptyQuickMenuSlot(suffix = ''): AdminQuickMenuSlot {
  return {
    id: `qm-${Date.now()}${suffix}`,
    slotType: 'image',
    label: '',
    captionLabel: '',
    imageUrl: null,
    imageFileName: null,
    href: '',
    bgColor: '#F6F6F6',
    textColor: '#1A1A1A',
  }
}

const DEFAULT_SERIES: AdminSeriesBanner[] = [
  {
    id: 'series-lomita',
    title: 'LOMITA',
    body: '오찌 아이코닉 LOMITA\n안정적인 플랫폼이 자연스럽게 높이를 더하고\n편안한 균형을 완성합니다.',
    imageUrl: null,
    imageFileName: null,
    ctaLabel: '상품 보러 가기',
    ctaHref: '',
  },
  {
    id: 'series-romari',
    title: 'ROMARI',
    body: '오찌의 대표 라인으로 자리 매김한 ROMARI\n낮은 굽에 스니커즈 아웃솔을 더해 날렵하지만,\n편안한 착화감을 선사합니다.',
    imageUrl: null,
    imageFileName: null,
    ctaLabel: '상품 보러 가기',
    ctaHref: '',
  },
  {
    id: 'series-3300',
    title: '3300',
    body: '오찌의 헤리티지를 담은 3300.\n넓고 둥근 쉐입으로 편안한 착화감과\n여유로운 실루엣을 완성합니다.',
    imageUrl: null,
    imageFileName: null,
    ctaLabel: '상품 보러 가기',
    ctaHref: '',
  },
  {
    id: 'series-topi',
    title: 'TOPI',
    body: '플랫폼 클로그 타입의 감각적인 실루엣, TOPI\n간결한 디자인과 안정적인 착화감으로\n편안한 데일리 스타일을 완성합니다.',
    imageUrl: null,
    imageFileName: null,
    ctaLabel: '상품 보러 가기',
    ctaHref: '',
  },
]

export function createDefaultHomeMainConfig(): AdminHomeMainConfig {
  return {
    version: 2,
    mainBanners: [
      {
        id: 'main-1',
        imageUrl: null,
        imageFileName: null,
        title: 'OTZ x LOFA Seoul',
        subtitle: '감각적인 라이프스타일 브랜드 로파서울과의 만남',
        ctaLabel: '쇼핑 바로가기',
        ctaHref: '/new',
      },
    ],
    quickMenuSlots: DEFAULT_QUICK_MENU.map((slot) => ({ ...slot })),
    brandBanner: {
      imageUrl: null,
      imageFileName: null,
      body:
        '미국 캘리포니아주의 말리부에서 탄생한 오찌는\n캘리포니아의 온화한 기후에서 영감 받아\n일상을 여행처럼 향유하는 라이프스타일을 제안합니다',
    },
    seriesBanners: DEFAULT_SERIES.map((item) => ({ ...item })),
    updatedAt: null,
  }
}

function migrateLegacyConfig(raw: Record<string, unknown>): AdminHomeMainConfig {
  const defaults = createDefaultHomeMainConfig()
  const legacyUrl = typeof raw.bannerImageUrl === 'string' ? raw.bannerImageUrl : null
  const legacyName = typeof raw.bannerFileName === 'string' ? raw.bannerFileName : null

  if (legacyUrl) {
    defaults.mainBanners[0] = {
      ...defaults.mainBanners[0],
      imageUrl: legacyUrl,
      imageFileName: legacyName,
    }
  }

  return defaults
}

export function loadAdminHomeMainConfig(): AdminHomeMainConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultHomeMainConfig()

    const parsed = JSON.parse(raw) as Partial<AdminHomeMainConfig> & Record<string, unknown>
    if (parsed.version !== 2) return migrateLegacyConfig(parsed)

    const defaults = createDefaultHomeMainConfig()
    return {
      version: 2,
      mainBanners:
        Array.isArray(parsed.mainBanners) && parsed.mainBanners.length > 0
          ? parsed.mainBanners
          : defaults.mainBanners,
      quickMenuSlots:
        Array.isArray(parsed.quickMenuSlots) && parsed.quickMenuSlots.length > 0
          ? parsed.quickMenuSlots.map((slot, index) =>
              normalizeQuickMenuSlot(
                slot as Partial<AdminQuickMenuSlot>,
                defaults.quickMenuSlots[index] ?? createEmptyQuickMenuSlot(`-${index}`),
              ),
            )
          : defaults.quickMenuSlots,
      brandBanner: { ...defaults.brandBanner, ...parsed.brandBanner },
      seriesBanners:
        Array.isArray(parsed.seriesBanners) && parsed.seriesBanners.length === 4
          ? parsed.seriesBanners
          : defaults.seriesBanners,
      updatedAt: parsed.updatedAt ?? null,
    }
  } catch {
    return createDefaultHomeMainConfig()
  }
}

export function saveAdminHomeMainConfig(
  config: Omit<AdminHomeMainConfig, 'version' | 'updatedAt'>,
): AdminHomeMainConfig {
  const next: AdminHomeMainConfig = {
    version: 2,
    ...config,
    updatedAt: new Date().toISOString(),
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    throw new Error('HOME_MAIN_CONFIG_STORAGE_FAILED')
  }

  window.dispatchEvent(new CustomEvent(HOME_MAIN_CONFIG_UPDATED_EVENT))
  return next
}

/** @deprecated Use loadAdminHomeMainConfig */
export function loadAdminHomeMainConfigLegacy() {
  return loadAdminHomeMainConfig()
}
