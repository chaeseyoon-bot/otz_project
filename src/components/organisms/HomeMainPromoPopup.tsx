import type { CSSProperties } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useMobileGnb } from '../../contexts/MobileGnbContext'
import { useAdminHomeMainConfig } from '../../hooks/useAdminHomeMainConfig'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { tokens } from '../../design-system/tokens'
import { resolveMarketingPopupSlides } from '../../lib/homeMainContentResolver'

const STORAGE_HIDE_TODAY = 'otz_home_promo_hide_day'
const STORAGE_SESSION_CLOSED = 'otz_home_promo_session_closed'
const MOBILE_SHELL_SELECTOR = '.app-home-shell'
/** Layout width before `zoom` on `.app-home-shell` (see App.tsx). */
const MOBILE_SHELL_LAYOUT_WIDTH = 375

const BANNER_HEIGHT = 340
const FOOTER_HEIGHT = 52

/** Desktop floating card (Figma 2994:32908) — no dim; elevation on full card. */
const PC_PROMO_INSET = 24
const PC_PROMO_CARD_SHADOW = '0 8px 40px rgba(0, 0, 0, 0.14)'

function localYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function readShouldShow(): boolean {
  if (typeof window === 'undefined') return false
  if (sessionStorage.getItem(STORAGE_SESSION_CLOSED) === '1') return false
  const hideDay = localStorage.getItem(STORAGE_HIDE_TODAY)
  if (hideDay && hideDay === localYmd(new Date())) return false
  return true
}

export function HomeMainPromoPopup() {
  const { mobileScale } = useMobileGnb()
  const { marketingPopupSlides, updatedAt } = useAdminHomeMainConfig()
  const slides = useMemo(
    () => resolveMarketingPopupSlides(marketingPopupSlides),
    [marketingPopupSlides, updatedAt],
  )
  const slideCount = slides.length
  const [show, setShow] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [shellWidth, setShellWidth] = useState(MOBILE_SHELL_LAYOUT_WIDTH)
  const [shellLeft, setShellLeft] = useState(0)
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const bannerScrollerRef = useRef<HTMLDivElement>(null)

  useLockBodyScroll(show && !isDesktop)

  useEffect(() => {
    setActiveSlideIndex(0)
    const el = bannerScrollerRef.current
    if (el) el.scrollLeft = 0
  }, [updatedAt, slideCount])

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1024px)')
    const sync = () => {
      setIsDesktop(desktopQuery.matches)
      setShow(readShouldShow())
    }
    sync()
    desktopQuery.addEventListener('change', sync)
    return () => desktopQuery.removeEventListener('change', sync)
  }, [])

  const measureMobileShell = useCallback(() => {
    const scaledWidth = Math.round(MOBILE_SHELL_LAYOUT_WIDTH * mobileScale)
    const shell = document.querySelector(MOBILE_SHELL_SELECTOR)

    if (!shell) {
      setShellWidth(scaledWidth)
      setShellLeft(Math.max(0, Math.round((window.innerWidth - scaledWidth) / 2)))
      return
    }

    const rect = shell.getBoundingClientRect()
    const width = Math.max(Math.round(rect.width), scaledWidth)
    const needsCenteredLeft = width > Math.round(rect.width) + 1
    setShellWidth(width)
    setShellLeft(
      needsCenteredLeft
        ? Math.max(0, Math.round((window.innerWidth - width) / 2))
        : Math.round(rect.left),
    )
  }, [mobileScale])

  useEffect(() => {
    if (!show || isDesktop) return

    measureMobileShell()
    window.addEventListener('resize', measureMobileShell)
    window.addEventListener('scroll', measureMobileShell, { passive: true })

    const shell = document.querySelector(MOBILE_SHELL_SELECTOR)
    const observer = shell ? new ResizeObserver(measureMobileShell) : null
    observer?.observe(shell)

    return () => {
      window.removeEventListener('resize', measureMobileShell)
      window.removeEventListener('scroll', measureMobileShell)
      observer?.disconnect()
    }
  }, [show, isDesktop, measureMobileShell])

  const syncSlideFromScroll = useCallback(() => {
    const el = bannerScrollerRef.current
    if (!el || slideCount <= 1) return
    const width = el.clientWidth
    if (width <= 0) return
    const next = Math.min(Math.max(Math.round(el.scrollLeft / width), 0), slideCount - 1)
    setActiveSlideIndex(next)
  }, [slideCount])

  const closeForSession = useCallback(() => {
    sessionStorage.setItem(STORAGE_SESSION_CLOSED, '1')
    setShow(false)
  }, [])

  const hideUntilTomorrow = useCallback(() => {
    localStorage.setItem(STORAGE_HIDE_TODAY, localYmd(new Date()))
    setShow(false)
  }, [])

  if (!show) return null

  const popupTitleId = 'home-promo-popup-title'

  const bannerStyle: CSSProperties = isDesktop
    ? { ...styles.banner, ...styles.bannerAsDesktopCardSlice }
    : styles.banner

  const footerStyle: CSSProperties = isDesktop ? styles.footerDesktop : styles.footer

  const bannerTrackStyle: CSSProperties =
    slideCount > 1
      ? {
          ...styles.bannerTrack,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }
      : styles.bannerTrack

  const inner = (
    <>
      <div style={bannerStyle}>
        <div ref={bannerScrollerRef} style={bannerTrackStyle} onScroll={syncSlideFromScroll}>
          {slides.map((slide) => (
            <div key={slide.id} style={styles.bannerSlide}>
              <img
                src={slide.imageUrl}
                alt=""
                aria-hidden
                style={styles.bannerImg}
                decoding="async"
              />
              <div style={styles.bannerText}>
                <h2 id={popupTitleId} style={styles.bannerTitle}>
                  {slide.title}
                </h2>
                {slide.subtitle ? (
                  <p style={styles.bannerBodyLine}>{slide.subtitle}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        {slideCount >= 2 ? (
          <div style={styles.counterRow} aria-hidden>
            <div style={styles.counterPill}>
              <span style={styles.counterCurrent}>{activeSlideIndex + 1} </span>
              <span style={styles.counterTotal}>/ {slideCount}</span>
            </div>
          </div>
        ) : null}
      </div>
      <footer style={footerStyle}>
        <button type="button" style={styles.btnMuted} onClick={hideUntilTomorrow}>
          오늘 그만보기
        </button>
        <button type="button" style={styles.btnStrong} onClick={closeForSession}>
          닫기
        </button>
      </footer>
    </>
  )

  if (isDesktop) {
    return createPortal(
      <div style={styles.pcLayer}>
        <div
          role="dialog"
          aria-modal={false}
          aria-labelledby={popupTitleId}
          style={styles.pcCard}
        >
          <div style={styles.sheetDesktopInner}>{inner}</div>
        </div>
      </div>,
      document.body,
    )
  }

  const mobileSheetWrapStyle: CSSProperties = {
    ...styles.sheetWrap,
    width: shellWidth,
    marginLeft: shellLeft,
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={popupTitleId}
      style={styles.backdrop}
    >
      <div style={mobileSheetWrapStyle}>
        <div style={styles.sheet}>{inner}</div>
      </div>
    </div>,
    document.body,
  )
}

const styles: Record<string, CSSProperties> = {
  pcLayer: {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    pointerEvents: 'none',
  },
  pcCard: {
    pointerEvents: 'auto',
    position: 'absolute',
    right: PC_PROMO_INSET,
    bottom: PC_PROMO_INSET,
    width: '100%',
    maxWidth: 375,
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
    boxShadow: PC_PROMO_CARD_SHADOW,
    backgroundColor: tokens.color.white,
  },
  sheetDesktopInner: {
    width: '100%',
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    backgroundColor: tokens.color.overlayStrong,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    touchAction: 'none',
  },
  sheetWrap: {
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'center',
  },
  sheet: {
    width: '100%',
    boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.12)',
  },
  banner: {
    position: 'relative',
    height: BANNER_HEIGHT,
    width: '100%',
    borderTopLeftRadius: tokens.radius.lg,
    borderTopRightRadius: tokens.radius.lg,
    overflow: 'hidden',
    backgroundColor: tokens.color.black,
  },
  bannerTrack: {
    display: 'flex',
    height: '100%',
    width: '100%',
  },
  bannerSlide: {
    position: 'relative',
    flex: '0 0 100%',
    height: '100%',
    scrollSnapAlign: 'start',
    backgroundColor: tokens.color.black,
  },
  /** Banner sits inside rounded PC card; radii come from outer shell. */
  bannerAsDesktopCardSlice: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  counterRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: 16,
    paddingLeft: 16,
    paddingRight: 16,
    pointerEvents: 'none',
    zIndex: 2,
  },
  counterPill: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 10px',
    borderRadius: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: tokens.color.white,
    fontSize: 11,
    lineHeight: 1.2,
    letterSpacing: '-0.04em',
    whiteSpace: 'nowrap',
  },
  counterCurrent: {
    color: tokens.color.white,
  },
  counterTotal: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  bannerText: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
    padding: '40px 30px',
    color: tokens.color.white,
    pointerEvents: 'none',
  },
  bannerTitle: {
    margin: 0,
    maxWidth: 200,
    fontSize: 24,
    fontWeight: 800,
    lineHeight: 1.2,
    letterSpacing: tokens.typography.headingH3.letterSpacing,
    whiteSpace: 'pre-line',
  },
  bannerBodyLine: {
    margin: 0,
    maxWidth: 200,
    fontSize: tokens.typography.bodySmall.fontSize,
    fontWeight: 400,
    lineHeight: tokens.typography.bodySmall.lineHeight,
    letterSpacing: tokens.typography.bodySmall.letterSpacing,
    whiteSpace: 'pre-line',
  },
  bannerImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center top',
    display: 'block',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: FOOTER_HEIGHT,
    backgroundColor: tokens.color.white,
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  },
  footerDesktop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: FOOTER_HEIGHT,
    backgroundColor: tokens.color.white,
    paddingBottom: 0,
  },
  btnMuted: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: '100%',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 14,
    lineHeight: 1.4,
    letterSpacing: '-0.02em',
    color: tokens.color.textSecondary,
    padding: '10px 20px',
  },
  btnStrong: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: '100%',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 14,
    lineHeight: 1.4,
    letterSpacing: '-0.02em',
    color: tokens.color.textPrimary,
    padding: '10px 20px',
  },
}
