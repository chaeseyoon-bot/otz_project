import type { CSSProperties } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useMobileGnb } from '../../contexts/MobileGnbContext'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { tokens } from '../../design-system/tokens'
import { mainImageAsset } from '../../lib/mainImagesAssetUrl'

const BANNER_IMAGE = mainImageAsset('homemain_pop_banner01.jpg')

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

/** Single banner for now; bump total when adding slides. */
const PROMO_BANNER_INDEX = 1
const PROMO_BANNER_TOTAL = 1

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
  const [show, setShow] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [shellWidth, setShellWidth] = useState(MOBILE_SHELL_LAYOUT_WIDTH)
  const [shellLeft, setShellLeft] = useState(0)

  useLockBodyScroll(show && !isDesktop)

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

  const closeForSession = useCallback(() => {
    sessionStorage.setItem(STORAGE_SESSION_CLOSED, '1')
    setShow(false)
  }, [])

  const hideUntilTomorrow = useCallback(() => {
    localStorage.setItem(STORAGE_HIDE_TODAY, localYmd(new Date()))
    setShow(false)
  }, [])

  if (!show) return null

  const bannerStyle: CSSProperties = isDesktop
    ? { ...styles.banner, ...styles.bannerAsDesktopCardSlice }
    : styles.banner

  const footerStyle: CSSProperties = isDesktop ? styles.footerDesktop : styles.footer

  const inner = (
    <>
      <div style={bannerStyle}>
        <img
          src={BANNER_IMAGE}
          alt=""
          aria-hidden
          style={styles.bannerImg}
          decoding="async"
        />
        <div style={styles.bannerText} data-node-id="2786:7841">
          <h2 id="home-promo-popup-title" style={styles.bannerTitle}>
            코코아모브 에디션
          </h2>
          <div style={styles.bannerBody}>
            <p style={styles.bannerBodyLine}>로마리 스웨이드 시즌 한정 </p>
            <p style={styles.bannerBodyLine}>코코아모브 컬러 특별 에디션 소장하세요</p>
          </div>
        </div>
        <div style={styles.counterRow} aria-hidden>
          <div style={styles.counterPill}>
            <span style={styles.counterCurrent}>{PROMO_BANNER_INDEX} </span>
            <span style={styles.counterTotal}>/ {PROMO_BANNER_TOTAL}</span>
          </div>
        </div>
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
          aria-labelledby="home-promo-popup-title"
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
      aria-labelledby="home-promo-popup-title"
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
  },
  bannerBody: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    maxWidth: 200,
  },
  bannerBodyLine: {
    margin: 0,
    fontSize: tokens.typography.bodySmall.fontSize,
    fontWeight: 400,
    lineHeight: tokens.typography.bodySmall.lineHeight,
    letterSpacing: tokens.typography.bodySmall.letterSpacing,
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
