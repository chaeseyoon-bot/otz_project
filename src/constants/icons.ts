/** Supabase Storage bucket for site-wide SVG icons. */
export const ICONS_BUCKET = 'icons' as const

const LOCAL_ICONS_BASE = '/assets/figma/icons'

function iconsStorageBase(): string {
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '')
  if (supabaseUrl) {
    return `${supabaseUrl}/storage/v1/object/public/${ICONS_BUCKET}`
  }
  if (import.meta.env.DEV) {
    console.warn(
      '[icons] VITE_SUPABASE_URL is unset — falling back to local icons under public/assets/figma/icons.',
    )
  }
  return LOCAL_ICONS_BASE
}

/**
 * Resolves a public SVG icon URL from the Supabase `icons` bucket.
 * Falls back to `public/assets/figma/icons/` when Supabase is not configured.
 */
export function iconAsset(filename: string): string {
  const name = filename.replace(/^\//, '').replace(/^icons\//, '')
  const base = iconsStorageBase()
  if (base.startsWith('http')) {
    return `${base}/${encodeURIComponent(name)}`
  }
  return `${base}/${name}`
}

/**
 * Site-wide SVG icon registry.
 * Add new icons here instead of scattering `figmaAsset('icons/...')` across components.
 */
export const ICONS = {
  brand: {
    otzLogo: iconAsset('OTZ_LOGO.svg'),
  },
  gnb: {
    category: iconAsset('gnb_category.svg'),
    search: iconAsset('gnb_search.svg'),
    shoppingBag: iconAsset('gnb_shopping-bag.svg'),
    pcArrow: iconAsset('pc_gnb_arrow.svg'),
  },
  tab: {
    home: iconAsset('tab_home.svg'),
    category: iconAsset('tab_category.svg'),
    heart: iconAsset('tab_heart.svg'),
    user: iconAsset('tab_user.svg'),
    recent: iconAsset('tab_recent.svg'),
  },
  list: {
    chevron: iconAsset('list_chevron.svg'),
    filter: iconAsset('list_filter.svg'),
    plus: iconAsset('list_plus.svg'),
    minus: iconAsset('list_minus.svg'),
    refresh: iconAsset('list_refresh.svg'),
    sortCheck: iconAsset('sort_check_outline.svg'),
  },
  navigation: {
    chevronLeft: iconAsset('chevron-left.svg'),
    buttonArrow: iconAsset('button_arrow.svg'),
  },
  search: {
    close: iconAsset('search_close.svg'),
  },
  cart: {
    coupon: iconAsset('cart_coupon.svg'),
    optionModify: iconAsset('ico_option_modify.svg'),
  },
  product: {
    detailShare: iconAsset('detail_share.svg'),
    couponDownload: iconAsset('coupon_download.svg'),
  },
  mypage: {
    grade01: iconAsset('mypage_grade_01.svg'),
  },
  hero: {
    play: iconAsset('play.svg'),
    pause: iconAsset('pause.svg'),
  },
  alert: {
    nothing: iconAsset('alert-nothing.svg'),
  },
} as const

export type IconCategory = keyof typeof ICONS
