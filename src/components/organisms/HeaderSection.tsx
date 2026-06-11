import { useCallback, useEffect, useRef, useState } from 'react'
import { useCenterHorizontalTabScroll } from '../../hooks/useCenterHorizontalTabScroll'
import { useHorizontalMouseDragScroll } from '../../hooks/useHorizontalMouseDragScroll'

import { figmaAsset } from '../../lib/figmaAssetUrl'
import { isArchiveDetailPath } from '../../lib/archiveRoutes'
import { isCartPath } from '../../lib/cartRoutes'
import { isCheckoutPath } from '../../lib/checkoutRoutes'
import { isOrderCompletePath, isOrderDetailPath } from '../../lib/orderRoutes'
import { isMyPagePath } from '../../lib/myPageRoutes'
import { isProductDetailPath } from '../../lib/productRoutes'
import { navigateSpa } from '../../lib/spaNavigation'
import { useSpaPathname } from '../../hooks/useSpaPathname'
import { MobileHeaderUtilityIcons } from '../molecules/MobileHeaderUtilityIcons'
import { PcHeaderSection } from './PcHeaderSection'

const MAIN_TABS = ['홈', 'NEW', 'BEST', '26SS', 'ARCHIVE', 'EDITORIAL']
const logoOtz = figmaAsset('icons/OTZ_LOGO.svg')
const MOBILE_TOP_BANNER_HEIGHT = 40
const MOBILE_MAIN_HEADER_HEIGHT = 52
const MOBILE_HEADER_COLLAPSE_OFFSET = MOBILE_TOP_BANNER_HEIGHT + MOBILE_MAIN_HEADER_HEIGHT
const MOBILE_HIDE_START_Y = 72
const MOBILE_HIDE_TRIGGER_DELTA = 20
const MOBILE_SHOW_TRIGGER_DELTA = 14

const HOME_TAB_INDEX = 0
const NEW_TAB_INDEX = 1
const BEST_TAB_INDEX = 2
const ARCHIVE_TAB_INDEX = 4
const EDITORIAL_TAB_INDEX = 5

function getMobileTabIndexByPath(pathname: string) {
  if (pathname.startsWith('/new')) return NEW_TAB_INDEX
  if (pathname.startsWith('/best')) return BEST_TAB_INDEX
  if (pathname.startsWith('/archive')) return ARCHIVE_TAB_INDEX
  if (pathname.startsWith('/editorial')) return EDITORIAL_TAB_INDEX
  return HOME_TAB_INDEX
}

/** Reserve bold glyph width so active/inactive font-weight swaps do not shift the GNB. */
function MobileGnbTabLabel({ label, active }: { label: string; active: boolean }) {
  return (
    <span className="inline-grid px-[6px] whitespace-nowrap">
      <span className="invisible col-start-1 row-start-1 text-bodyBold3" aria-hidden>
        {label}
      </span>
      <span
        className={`col-start-1 row-start-1 ${
          active
            ? 'text-bodyBold3 text-black'
            : 'text-bodyRegular2 text-[var(--otz-color-text-secondary)]'
        }`}
      >
        {label}
      </span>
    </span>
  )
}

export function HeaderSection() {
  const pathname = useSpaPathname()
  const [activeIndex, setActiveIndex] = useState(() => getMobileTabIndexByPath(pathname))
  const isCategoryShoes = pathname.startsWith('/category/shoes')
  const isBrandStory = pathname.startsWith('/brand-story')
  const isSearch = pathname.startsWith('/search')
  const isArchiveDetail = isArchiveDetailPath(pathname)
  const isProductDetail = isProductDetailPath(pathname)
  const isMyPage = isMyPagePath(pathname)
  const isCart = isCartPath(pathname)
  const isCheckout = isCheckoutPath(pathname)
  const isOrderComplete = isOrderCompletePath(pathname)
  const isOrderDetail = isOrderDetailPath(pathname)
  const hideMobileHomeHeader =
    isCategoryShoes ||
    isBrandStory ||
    isArchiveDetail ||
    isSearch ||
    isProductDetail ||
    isMyPage ||
    isCart ||
    isCheckout ||
    isOrderComplete ||
    isOrderDetail
  const [mobileNavOnlySticky, setMobileNavOnlySticky] = useState(false)
  const { scrollerRef: navRef, registerTabRef, scrollTabToCenter } = useCenterHorizontalTabScroll(activeIndex)
  const lastScrollYRef = useRef(0)
  const tickingRef = useRef(false)
  const hiddenRef = useRef(false)
  const downAccumulatedRef = useRef(0)
  const upAccumulatedRef = useRef(0)
  useHorizontalMouseDragScroll(navRef)

  const navigateToPath = useCallback(
    (path: '/' | '/new' | '/best' | '/archive' | '/editorial', index: number) => {
    setActiveIndex(index)
    navigateSpa(path)
  }, [])

  useEffect(() => {
    setActiveIndex(getMobileTabIndexByPath(pathname))
  }, [pathname])

  useEffect(() => {
    const onScroll = () => {
      if (tickingRef.current) return
      tickingRef.current = true

      requestAnimationFrame(() => {
        const currentY = Math.max(window.scrollY, 0)
        const previousY = lastScrollYRef.current
        const delta = currentY - previousY

        /** Document height / route swap can clamp scrollY in one step — do not treat as user swipe-up reveal. */
        const teleportThreshold = Math.max(120, window.innerHeight * 0.35)
        if (Math.abs(delta) > teleportThreshold) {
          lastScrollYRef.current = currentY
          downAccumulatedRef.current = 0
          upAccumulatedRef.current = 0
          tickingRef.current = false
          return
        }

        if (currentY <= 4) {
          hiddenRef.current = false
          setMobileNavOnlySticky(false)
          downAccumulatedRef.current = 0
          upAccumulatedRef.current = 0
          lastScrollYRef.current = currentY
          tickingRef.current = false
          return
        }

        if (delta > 0) {
          downAccumulatedRef.current += delta
          upAccumulatedRef.current = 0

          if (
            !hiddenRef.current &&
            currentY > MOBILE_HIDE_START_Y &&
            downAccumulatedRef.current >= MOBILE_HIDE_TRIGGER_DELTA
          ) {
            hiddenRef.current = true
            setMobileNavOnlySticky(true)
            downAccumulatedRef.current = 0
          }
        } else if (delta < 0) {
          upAccumulatedRef.current += -delta
          downAccumulatedRef.current = 0

          if (hiddenRef.current && upAccumulatedRef.current >= MOBILE_SHOW_TRIGGER_DELTA) {
            hiddenRef.current = false
            setMobileNavOnlySticky(false)
            upAccumulatedRef.current = 0
          }
        }

        lastScrollYRef.current = currentY
        tickingRef.current = false
      })
    }

    lastScrollYRef.current = window.scrollY
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {!hideMobileHomeHeader ? (
        <header className="sticky top-0 z-20 overflow-visible bg-white lg:hidden">
          <div
            className="overflow-hidden transition-[height] duration-300 ease-out"
            style={{ height: mobileNavOnlySticky ? 0 : MOBILE_HEADER_COLLAPSE_OFFSET }}
          >
            <div
              className="transition-transform duration-300 ease-out"
              style={{
                transform: mobileNavOnlySticky ? `translateY(-${MOBILE_HEADER_COLLAPSE_OFFSET}px)` : 'translateY(0)',
              }}
            >
              <div className="flex h-10 items-center justify-center bg-black text-bodySmall text-white">
                26SS Collection 툴레아 스웨이드
              </div>

              <div className="flex h-[52px] items-center justify-between pl-[15px] pr-3">
                <a
                  href="/"
                  className="shrink-0"
                  aria-label="OTZ 홈"
                  onClick={(event) => {
                    event.preventDefault()
                    navigateToPath('/', HOME_TAB_INDEX)
                    requestAnimationFrame(() => scrollTabToCenter(HOME_TAB_INDEX, 'smooth'))
                  }}
                >
                  <img alt="OTZ" src={logoOtz} className="block h-[19px] w-[70px] shrink-0 object-contain" />
                </a>
                <MobileHeaderUtilityIcons iconClassName="block h-icon w-icon shrink-0 object-contain" />
              </div>
            </div>
          </div>

          <nav
            ref={navRef}
            className="flex h-[42px] cursor-grab items-start justify-start gap-[18px] overflow-x-auto scroll-smooth border-b border-light2 px-[10px] text-[14px] text-[rgba(26,26,26,1)] touch-pan-x snap-x snap-mandatory scroll-pl-[10px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden active:cursor-grabbing"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {MAIN_TABS.map((tab, index) => (
              <button
                key={tab}
                ref={registerTabRef(index)}
                onClick={() => {
                  if (tab === '홈') {
                    navigateToPath('/', HOME_TAB_INDEX)
                  } else if (tab === 'NEW') {
                    navigateToPath('/new', NEW_TAB_INDEX)
                  } else if (tab === 'BEST') {
                    navigateToPath('/best', BEST_TAB_INDEX)
                  } else if (tab === 'ARCHIVE') {
                    navigateToPath('/archive', ARCHIVE_TAB_INDEX)
                  } else if (tab === 'EDITORIAL') {
                    navigateToPath('/editorial', EDITORIAL_TAB_INDEX)
                  } else {
                    setActiveIndex(index)
                  }
                  requestAnimationFrame(() => scrollTabToCenter(index, 'smooth'))
                }}
                type="button"
                className="flex h-full shrink-0 snap-start flex-col items-start justify-end gap-1 pb-0"
              >
                <MobileGnbTabLabel label={tab} active={index === activeIndex} />
                <span className={`mt-2 block h-[2px] w-full ${index === activeIndex ? 'bg-black' : 'bg-transparent'}`} />
              </button>
            ))}
          </nav>
        </header>
      ) : null}
      <div className="hidden lg:contents">
        <PcHeaderSection />
      </div>
    </>
  )
}
