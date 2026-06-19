import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { ShoppingBagIconButton } from '../atoms/ShoppingBagIconButton'
import { useCart } from '../../contexts/CartContext'
import { useAdminHomeMainConfig } from '../../hooks/useAdminHomeMainConfig'
import { figmaAsset } from '../../lib/figmaAssetUrl'
import { resolveTopAnnouncementBar } from '../../lib/homeMainContentResolver'
import { CART_PATH } from '../../lib/cartRoutes'
import { PC_HOME_MAX_WIDTH_PX } from '../../design-system/layout'
import { GNB_MEGA_MENU_GROUPS } from '../../data/gnbMegaMenu'
import { PcSearchPanelContent } from './PcSearchPanelContent'
import { useSpaPathname } from '../../hooks/useSpaPathname'
import {
  buildCategoryPlpPath,
  mainIdFromGnbGroupTitle,
  navigateCategoryPlp,
} from '../../lib/categoryRoutes'
import { navigateExternalOrSpa, navigateSpa, type SpaPath } from '../../lib/spaNavigation'

const logoOtz = figmaAsset('icons/OTZ_LOGO.svg')
const iconPcGnbArrow = figmaAsset('icons/pc_gnb_arrow.svg')
const iconSearch = figmaAsset('icons/gnb_search.svg')
const iconHeart = figmaAsset('icons/tab_heart.svg')
const iconUser = figmaAsset('icons/tab_user.svg')

/** Figma 3726:67484 — single row, gap 32px between items */
const PC_NAV_ITEMS = [
  { id: 'category', label: '전체카테고리', variant: 'category' as const },
  { id: 'home', label: 'HOME', variant: 'link' as const },
  { id: 'best', label: 'BEST', variant: 'link' as const },
  { id: 'new', label: 'NEW', variant: 'link' as const },
  { id: 'archive', label: 'ARCHIVE', variant: 'link' as const },
  { id: 'editorial', label: 'EDITORIAL', variant: 'link' as const },
  { id: 'event', label: 'BRAND STORY', variant: 'link' as const },
] as const

/** Figma 2601:23626 — PC utility user menu (horizontal strip under icons) */
const PC_USER_MENU_ITEMS: { id: string; label: string; href: string }[] = [
  { id: 'login', label: '로그인', href: '#' },
  { id: 'orders', label: '주문조회', href: '#' },
  { id: 'mypage', label: '마이페이지', href: '/mypage' },
]

const MEGA_CATEGORY_TITLE_CLASS =
  'm-0 w-fit border-b border-[var(--otz-color-text-primary)] text-[15px] font-normal leading-[1.4] tracking-[-0.02em] text-dark'

const MEGA_SUBCATEGORY_LINK_CLASS =
  'whitespace-nowrap text-[14px] font-normal leading-[1.4] tracking-[-0.02em] text-[var(--otz-color-text-secondary)]'

function getSpaPathForPcNavItem(id: string): SpaPath | null {
  if (id === 'home') return '/'
  if (id === 'best') return '/best'
  if (id === 'archive') return '/archive'
  if (id === 'new') return '/new'
  if (id === 'editorial') return '/editorial'
  if (id === 'event') return '/brand-story'
  return null
}

function PcNavTextLink({ id, label, pathname }: { id: string; label: string; pathname: string }) {
  const spaPath = getSpaPathForPcNavItem(id)
  if (spaPath != null) {
    const isActive =
      spaPath === '/'
        ? pathname === '/' || pathname === ''
        : pathname.startsWith(spaPath)
    return (
      <a
        href={spaPath}
        className={`whitespace-nowrap hover:opacity-70 ${isActive ? 'font-semibold text-black' : ''}`}
        aria-current={isActive ? 'page' : undefined}
        onClick={(event) => {
          event.preventDefault()
          navigateSpa(spaPath)
        }}
      >
        {label}
      </a>
    )
  }
  return (
    <a
      href="#"
      className="whitespace-nowrap hover:opacity-70"
      onClick={(event) => {
        event.preventDefault()
      }}
    >
      {label}
    </a>
  )
}

export function PcHeaderSection() {
  const pathname = useSpaPathname()
  const { itemCount } = useCart()
  const { topAnnouncementBar, updatedAt } = useAdminHomeMainConfig()
  const announcement = useMemo(
    () => resolveTopAnnouncementBar(topAnnouncementBar),
    [topAnnouncementBar, updatedAt],
  )
  const [topBannerDismissed, setTopBannerDismissed] = useState(false)
  const topBannerVisible = announcement.enabled && !topBannerDismissed
  const topAnnouncementLink = announcement.linkHref
  const hasTopAnnouncementLink = Boolean(topAnnouncementLink && topAnnouncementLink !== '#')

  useEffect(() => {
    setTopBannerDismissed(false)
  }, [updatedAt, announcement.mobileText, announcement.pcText])
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false)
  /** Enables enter transition on next frame (slide + dim fade). */
  const [megaEntered, setMegaEntered] = useState(false)
  /** Bottom 1px rule on GNB only after sticky engages (sentinel scrolls away). */
  const [gnbStuck, setGnbStuck] = useState(false)
  const stickySentinelRef = useRef<HTMLDivElement>(null)
  /** Sticky GNB shell — measure bottom for portaled mega (avoids sticky/overflow clipping). */
  const headerShellRef = useRef<HTMLElement>(null)
  const megaPanelRef = useRef<HTMLDivElement>(null)
  const utilityClusterRef = useRef<HTMLDivElement>(null)
  const userMenuTriggerRef = useRef<HTMLButtonElement>(null)
  const userMenuPanelRef = useRef<HTMLDivElement>(null)
  const searchTriggerRef = useRef<HTMLButtonElement>(null)
  const searchPanelRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [megaPanelTopPx, setMegaPanelTopPx] = useState(0)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchEntered, setSearchEntered] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userMenuBox, setUserMenuBox] = useState({ top: 0, right: 0 })
  const maxNav = `${PC_HOME_MAX_WIDTH_PX}px`

  const syncUserMenuLayout = () => {
    const el = utilityClusterRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const vw = document.documentElement.clientWidth
    setUserMenuBox({
      top: Math.round(r.bottom) + 8,
      right: Math.round(vw - r.right),
    })
  }

  useEffect(() => {
    const sentinel = stickySentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setGnbStuck(!entry.isIntersecting)
      },
      { root: null, threshold: 0 },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [topBannerVisible])

  useLayoutEffect(() => {
    if (!categoryMenuOpen) {
      setMegaEntered(false)
    }
  }, [categoryMenuOpen])

  useEffect(() => {
    if (!categoryMenuOpen && !userMenuOpen && !searchOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setCategoryMenuOpen(false)
      setUserMenuOpen(false)
      setSearchOpen(false)
      setMegaEntered(false)
      setSearchEntered(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [categoryMenuOpen, userMenuOpen, searchOpen])

  useLayoutEffect(() => {
    if (!searchOpen) {
      setSearchEntered(false)
      setSearchQuery('')
    }
  }, [searchOpen])

  useLayoutEffect(() => {
    if (!searchOpen) return
    const id = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus()
    })
    return () => window.cancelAnimationFrame(id)
  }, [searchOpen])

  useLayoutEffect(() => {
    if (!categoryMenuOpen && !searchOpen) return
    const updateTop = () => {
      const el = headerShellRef.current
      if (!el) return
      setMegaPanelTopPx(Math.round(el.getBoundingClientRect().bottom))
    }
    updateTop()
    window.addEventListener('scroll', updateTop, true)
    window.addEventListener('resize', updateTop)
    const ro = new ResizeObserver(updateTop)
    const node = headerShellRef.current
    if (node) ro.observe(node)
    return () => {
      window.removeEventListener('scroll', updateTop, true)
      window.removeEventListener('resize', updateTop)
      ro.disconnect()
    }
  }, [categoryMenuOpen, searchOpen])

  useEffect(() => {
    if (!categoryMenuOpen) return
    const onPointerDown = (event: MouseEvent) => {
      const t = event.target as Node
      const inHeader = headerShellRef.current?.contains(t)
      const inMega = megaPanelRef.current?.contains(t)
      if (!inHeader && !inMega) setCategoryMenuOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [categoryMenuOpen])

  useLayoutEffect(() => {
    if (!userMenuOpen) return
    syncUserMenuLayout()
    window.addEventListener('scroll', syncUserMenuLayout, true)
    window.addEventListener('resize', syncUserMenuLayout)
    const ro = new ResizeObserver(syncUserMenuLayout)
    const node = utilityClusterRef.current
    if (node) ro.observe(node)
    return () => {
      window.removeEventListener('scroll', syncUserMenuLayout, true)
      window.removeEventListener('resize', syncUserMenuLayout)
      ro.disconnect()
    }
  }, [userMenuOpen])

  useEffect(() => {
    if (!userMenuOpen) return
    const onPointerDown = (event: MouseEvent) => {
      const t = event.target as Node
      if (userMenuTriggerRef.current?.contains(t)) return
      if (userMenuPanelRef.current?.contains(t)) return
      setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [userMenuOpen])

  useEffect(() => {
    if (!searchOpen) return
    const onPointerDown = (event: MouseEvent) => {
      const t = event.target as Node
      if (searchTriggerRef.current?.contains(t)) return
      if (searchPanelRef.current?.contains(t)) return
      setSearchOpen(false)
      setSearchEntered(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [searchOpen])

  const overlayOpen = categoryMenuOpen || searchOpen
  const overlayOpaque = (categoryMenuOpen && megaEntered) || (searchOpen && searchEntered)

  const dimBackdrop =
    overlayOpen &&
    createPortal(
      <div
        role="presentation"
        className={`fixed inset-0 z-[38] bg-[rgba(0,0,0,0.3)] transition-opacity duration-200 ease-out motion-reduce:transition-none ${
          overlayOpaque ? 'opacity-100' : 'opacity-0'
        } ${overlayOpaque ? '' : 'pointer-events-none'}`}
        onMouseDown={(event) => {
          event.preventDefault()
          setCategoryMenuOpen(false)
          setMegaEntered(false)
          setSearchOpen(false)
          setSearchEntered(false)
        }}
      />,
      document.body,
    )

  const megaPanelPortal =
    categoryMenuOpen &&
    createPortal(
      <div
        ref={megaPanelRef}
        id="pc-gnb-category-panel"
        role="region"
        aria-labelledby="pc-gnb-category-trigger"
        style={{
          top: gnbStuck ? megaPanelTopPx - 1 : megaPanelTopPx,
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
          ...(gnbStuck ? { borderTop: '1px solid #E6E6E6' } : {}),
        }}
        className={`fixed left-0 right-0 z-[9999] border-b border-black/[0.06] bg-white/95 backdrop-blur-[5px] transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none ${
          megaEntered ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0 pointer-events-none'
        }`}
      >
        <div className="mx-auto w-full px-5 pb-10 pt-[30px]" style={{ maxWidth: maxNav }}>
          <div className="flex flex-col gap-[30px]">
            {GNB_MEGA_MENU_GROUPS.map((group) => (
              <div key={group.title} className="flex w-full flex-wrap items-start gap-[30px]">
                <div className="w-[100px] shrink-0">
                  {group.title === 'SHOES' ? (
                    <a
                      href="/category/shoes"
                      className={`block ${MEGA_CATEGORY_TITLE_CLASS}`}
                      onClick={(event) => {
                        event.preventDefault()
                        setCategoryMenuOpen(false)
                        setMegaEntered(false)
                        navigateSpa('/category/shoes')
                      }}
                    >
                      {group.title}
                    </a>
                  ) : (
                    <p className={MEGA_CATEGORY_TITLE_CLASS}>{group.title}</p>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-wrap gap-x-5 gap-y-2 text-[var(--otz-color-text-secondary)]">
                  {group.items.map((label) => {
                    const mainId = mainIdFromGnbGroupTitle(group.title)
                    const href = buildCategoryPlpPath(mainId, label)
                    return (
                      <a
                        key={label}
                        href={href}
                        className={MEGA_SUBCATEGORY_LINK_CLASS}
                        onClick={(event) => {
                          event.preventDefault()
                          setCategoryMenuOpen(false)
                          setMegaEntered(false)
                          navigateCategoryPlp(mainId, label)
                        }}
                      >
                        {label}
                      </a>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>,
      document.body,
    )

  const searchPanelPortal =
    searchOpen &&
    createPortal(
      <div
        ref={searchPanelRef}
        id="pc-gnb-search-panel"
        role="search"
        aria-labelledby="pc-gnb-search-trigger"
        style={{
          top: gnbStuck ? megaPanelTopPx - 1 : megaPanelTopPx,
          ...(gnbStuck ? { borderTop: '1px solid #E6E6E6' } : {}),
        }}
        className={`fixed left-0 right-0 z-[9999] max-h-[calc(100vh-70px)] overflow-y-auto border-b border-[#E6E6E6] bg-white transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none ${
          searchEntered ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0 pointer-events-none'
        }`}
      >
        <div className="relative mx-auto w-full" style={{ maxWidth: maxNav }}>
          <button
            type="button"
            className="absolute right-0 top-[10px] z-10 flex size-7 items-center justify-center border-0 bg-transparent p-0"
            aria-label="검색 닫기"
            onClick={() => {
              setSearchEntered(false)
              setSearchOpen(false)
            }}
          >
            <span className="relative block size-4 rotate-45" aria-hidden>
              <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-dark" />
              <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-dark" />
            </span>
          </button>
          <PcSearchPanelContent
            query={searchQuery}
            onQueryChange={setSearchQuery}
            inputRef={searchInputRef}
            onSearchCommit={() => {
              setSearchOpen(false)
              setSearchEntered(false)
            }}
          />
        </div>
      </div>,
      document.body,
    )

  const userMenuPortal =
    userMenuOpen &&
    createPortal(
      <div
        ref={userMenuPanelRef}
        id="pc-gnb-user-menu"
        role="region"
        aria-labelledby="pc-gnb-user-trigger"
        style={{
          position: 'fixed',
          top: userMenuBox.top,
          right: userMenuBox.right,
          left: 'auto',
          width: 'max-content',
          maxWidth: `calc(100vw - ${userMenuBox.right + 16}px)`,
          zIndex: 9999,
        }}
        className="box-border rounded-[5px] border border-[#E6E6E6] bg-white py-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
      >
        <div className="flex items-center gap-x-6 whitespace-nowrap px-5">
          {PC_USER_MENU_ITEMS.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="shrink-0 text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-[#666666]"
              onClick={(event) => {
                if (item.href.startsWith('/')) {
                  event.preventDefault()
                  navigateSpa(item.href as SpaPath)
                  setUserMenuOpen(false)
                }
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>,
      document.body,
    )

  return (
    <>
      {topBannerVisible ? (
        <div
          className="flex h-10 items-stretch text-bodySmall"
          style={{ backgroundColor: announcement.bgColor, color: announcement.textColor }}
        >
          <div className="min-w-0 flex-1" aria-hidden />
          <div
            className={`mx-auto flex w-full max-w-[1080px] shrink-0 items-center justify-center px-4 text-center ${hasTopAnnouncementLink ? 'cursor-pointer' : ''}`}
            role={hasTopAnnouncementLink ? 'link' : undefined}
            tabIndex={hasTopAnnouncementLink ? 0 : undefined}
            onClick={
              hasTopAnnouncementLink ? () => navigateExternalOrSpa(topAnnouncementLink) : undefined
            }
            onKeyDown={
              hasTopAnnouncementLink
                ? (event: KeyboardEvent<HTMLDivElement>) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      navigateExternalOrSpa(topAnnouncementLink)
                    }
                  }
                : undefined
            }
          >
            {announcement.pcText}
          </div>
          <div className="flex min-w-0 flex-1 items-start justify-end">
            <button
              type="button"
              className="flex size-10 shrink-0 items-center justify-center border-0 bg-transparent opacity-80 hover:opacity-100"
              style={{ color: announcement.textColor }}
              aria-label="상단 배너 닫기"
              onClick={() => setTopBannerDismissed(true)}
            >
              <span className="relative block size-3.5 rotate-45">
                <span
                  className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2"
                  style={{ backgroundColor: announcement.textColor }}
                />
                <span
                  className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2"
                  style={{ backgroundColor: announcement.textColor }}
                />
              </span>
            </button>
          </div>
        </div>
      ) : null}

      {/*
        Sentinel sits in normal flow directly above the sticky GNB. While it intersects the
        viewport, the bar is not “stuck”; once it leaves (user scrolled), show the bottom hairline.
      */}
      <div ref={stickySentinelRef} className="h-px w-full shrink-0" aria-hidden />

      {dimBackdrop}
      {megaPanelPortal}
      {searchPanelPortal}
      {userMenuPortal}

      {/* Figma 2994:33872 — banner scrolls away; GNB stays sticky (sticky needs a tall ancestor; see HeaderSection lg:contents) */}
      <header ref={headerShellRef} data-pc-gnb-mega className="sticky top-0 z-40 w-full bg-white">
        <div
          className={
            gnbStuck ? 'border-b border-[#E6E6E6]' : 'border-b border-transparent'
          }
        >
          <div
            className="mx-auto flex h-[70px] w-full items-center"
            style={{ maxWidth: maxNav }}
          >
            <a
              href="/"
              className="shrink-0"
              aria-label="OTZ 홈"
              onClick={(event) => {
                event.preventDefault()
                navigateSpa('/')
              }}
            >
              <img src={logoOtz} alt="OTZ" className="block h-[26px] w-[98px] object-contain" />
            </a>

            <nav
              className="ml-[30px] flex min-w-0 flex-1 items-center justify-start text-bodyRegular2 text-dark"
              aria-label="PC 주 메뉴"
            >
              <ul className="flex flex-wrap items-center gap-x-8 gap-y-2">
                {PC_NAV_ITEMS.map((item) => (
                  <li key={item.id}>
                    {item.variant === 'category' ? (
                      <button
                        type="button"
                        id="pc-gnb-category-trigger"
                        aria-expanded={categoryMenuOpen}
                        aria-controls="pc-gnb-category-panel"
                        onClick={() => {
                          setCategoryMenuOpen((wasOpen) => {
                            if (wasOpen) {
                              setMegaEntered(false)
                              return false
                            }
                            setUserMenuOpen(false)
                            setSearchOpen(false)
                            setSearchEntered(false)
                            const shell = headerShellRef.current
                            if (shell) {
                              setMegaPanelTopPx(Math.round(shell.getBoundingClientRect().bottom))
                            }
                            setMegaEntered(true)
                            return true
                          })
                        }}
                        className="inline-flex cursor-pointer items-center gap-[3px] border-0 bg-transparent p-0 font-inherit text-inherit hover:opacity-70"
                      >
                        <span className="whitespace-nowrap">{item.label}</span>
                        <img
                          src={iconPcGnbArrow}
                          alt=""
                          aria-hidden
                          className={`size-[18px] shrink-0 object-contain transition-transform duration-200 ${
                            categoryMenuOpen ? 'rotate-180' : ''
                          }`}
                          draggable={false}
                        />
                      </button>
                    ) : (
                      <PcNavTextLink id={item.id} label={item.label} pathname={pathname} />
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            <div ref={utilityClusterRef} className="flex shrink-0 items-center gap-4">
              <button
                type="button"
                id="pc-gnb-search-trigger"
                ref={searchTriggerRef}
                className="border-0 bg-transparent p-0"
                aria-label="검색"
                aria-expanded={searchOpen}
                aria-controls="pc-gnb-search-panel"
                onClick={() => {
                  if (searchOpen) {
                    setSearchEntered(false)
                    setSearchOpen(false)
                    return
                  }
                  setCategoryMenuOpen(false)
                  setMegaEntered(false)
                  setUserMenuOpen(false)
                  const shell = headerShellRef.current
                  if (shell) {
                    setMegaPanelTopPx(Math.round(shell.getBoundingClientRect().bottom))
                  }
                  setSearchEntered(true)
                  setSearchOpen(true)
                }}
              >
                <img src={iconSearch} alt="" className="size-7 object-contain" draggable={false} />
              </button>
              <button type="button" className="border-0 bg-transparent p-0" aria-label="찜 목록">
                <img src={iconHeart} alt="" className="size-7 object-contain opacity-90" draggable={false} />
              </button>
              <button
                type="button"
                id="pc-gnb-user-trigger"
                ref={userMenuTriggerRef}
                className="border-0 bg-transparent p-0"
                aria-label="마이페이지"
                aria-expanded={userMenuOpen}
                aria-controls="pc-gnb-user-menu"
                onClick={() => {
                  setUserMenuOpen((open) => {
                    if (open) return false
                    setCategoryMenuOpen(false)
                    setMegaEntered(false)
                    setSearchOpen(false)
                    setSearchEntered(false)
                    return true
                  })
                }}
              >
                <img src={iconUser} alt="" className="size-7 object-contain opacity-90" draggable={false} />
              </button>
              <ShoppingBagIconButton
                count={itemCount}
                iconClassName="size-7 object-contain"
                onClick={() => navigateSpa(CART_PATH)}
              />
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
