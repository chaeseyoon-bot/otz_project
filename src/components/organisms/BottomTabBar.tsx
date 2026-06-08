import { useMemo } from 'react'
import { useMobileGnb } from '../../contexts/MobileGnbContext'
import { useSpaPathname } from '../../hooks/useSpaPathname'
import { isProductDetailPath } from '../../lib/productRoutes'
import { MY_PAGE_PATH } from '../../lib/myPageRoutes'
import { navigateSpa } from '../../lib/spaNavigation'

/** Tab bar icons: `public/assets/figma/icons/tab_*.svg` */
const TAB_ICON_BASE = '/assets/figma/icons'

function tabIconSrc(filename: 'home' | 'category' | 'heart' | 'user' | 'recent') {
  return `${TAB_ICON_BASE}/tab_${filename}.svg`
}

/** Figma 네비게이션 — 아이콘만, 50px row */
const TAB_CONFIG = [
  { id: 'home', ariaLabel: '홈', iconFile: 'home' as const },
  { id: 'category', ariaLabel: '카테고리', iconFile: 'category' as const },
  { id: 'wish', ariaLabel: '찜', iconFile: 'heart' as const },
  { id: 'mypage', ariaLabel: '마이페이지', iconFile: 'user' as const },
  { id: 'recent', ariaLabel: '최근본', iconFile: 'recent' as const },
] as const

function getActiveTabIndex(pathname: string, menuOpen: boolean) {
  if (menuOpen || pathname.startsWith('/category')) return 1
  if (pathname.startsWith(MY_PAGE_PATH)) return 3
  if (pathname === '/' || pathname === '') return 0
  return -1
}

export function BottomTabBar() {
  const { isOpen: menuOpen, open: openMenu, close: closeMenu } = useMobileGnb()
  const pathname = useSpaPathname()

  const activeIndex = useMemo(() => getActiveTabIndex(pathname, menuOpen), [menuOpen, pathname])

  if (isProductDetailPath(pathname)) {
    return null
  }

  const handleTabClick = (tabId: (typeof TAB_CONFIG)[number]['id']) => {
    if (tabId === 'home') {
      closeMenu()
      navigateSpa('/')
      return
    }
    if (tabId === 'category') {
      openMenu()
      return
    }
    if (tabId === 'mypage') {
      closeMenu()
      navigateSpa(MY_PAGE_PATH)
    }
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex w-full flex-col border-t border-lightGray bg-white pb-[env(safe-area-inset-bottom,0px)] lg:hidden"
      role="navigation"
      aria-label="하단 메인 메뉴"
    >
      <div className="flex h-[50px] w-full items-center px-2">
        {TAB_CONFIG.map((tab, index) => {
          const active = index === activeIndex

          return (
            <button
              key={tab.id}
              type="button"
              aria-label={tab.ariaLabel}
              aria-current={active ? 'page' : undefined}
              onClick={() => handleTabClick(tab.id)}
              className="flex h-full min-w-0 flex-1 items-center justify-center rounded-none border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-dark focus-visible:ring-offset-2"
            >
              <img
                src={tabIconSrc(tab.iconFile)}
                alt=""
                className={`size-6 shrink-0 object-contain ${active ? 'opacity-100' : 'opacity-40'}`}
                draggable={false}
              />
            </button>
          )
        })}
      </div>
    </nav>
  )
}
