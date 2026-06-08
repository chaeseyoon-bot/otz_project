import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'

/** Drawer slide duration (ms), Figma 2685:3458 */
const MOBILE_GNB_DRAWER_MS = 300

export interface MobileGnbContextValue {
  isOpen: boolean
  isEntered: boolean
  activeTab: number
  setActiveTab: (tab: number) => void
  open: () => void
  close: () => void
  toggle: () => void
  isMobileViewport: boolean
  mobileScale: number
}

const MobileGnbContext = createContext<MobileGnbContextValue | null>(null)

export function MobileGnbProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isEntered, setIsEntered] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const [mobileScale, setMobileScale] = useState(1)
  const drawerCloseTimerRef = useRef<number | null>(null)

  useLockBodyScroll(isOpen)

  const close = useCallback(() => {
    setIsEntered(false)
    if (drawerCloseTimerRef.current != null) {
      window.clearTimeout(drawerCloseTimerRef.current)
    }
    drawerCloseTimerRef.current = window.setTimeout(() => {
      setIsOpen(false)
      drawerCloseTimerRef.current = null
    }, MOBILE_GNB_DRAWER_MS)
  }, [])

  const open = useCallback(() => {
    if (drawerCloseTimerRef.current != null) {
      window.clearTimeout(drawerCloseTimerRef.current)
      drawerCloseTimerRef.current = null
      setIsEntered(true)
    }
    setActiveTab(0)
    setIsOpen(true)
  }, [])

  const toggle = useCallback(() => {
    if (isOpen) close()
    else open()
  }, [close, isOpen, open])

  useEffect(() => {
    const updateViewportScale = () => {
      const viewportWidth = window.innerWidth
      const mobile = viewportWidth < 1024
      setIsMobileViewport(mobile)
      if (!mobile) {
        setMobileScale(1)
        return
      }
      setMobileScale(viewportWidth / 375)
    }

    updateViewportScale()
    window.addEventListener('resize', updateViewportScale)
    return () => window.removeEventListener('resize', updateViewportScale)
  }, [])

  useLayoutEffect(() => {
    if (!isOpen) return
    let cancelled = false
    const outer = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) setIsEntered(true)
      })
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(outer)
    }
  }, [isOpen])

  useLayoutEffect(() => {
    if (isOpen) return
    setIsEntered(false)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [close, isOpen])

  useEffect(() => {
    return () => {
      if (drawerCloseTimerRef.current != null) {
        window.clearTimeout(drawerCloseTimerRef.current)
      }
    }
  }, [])

  const value = useMemo<MobileGnbContextValue>(
    () => ({
      isOpen,
      isEntered,
      activeTab,
      setActiveTab,
      open,
      close,
      toggle,
      isMobileViewport,
      mobileScale,
    }),
    [activeTab, close, isEntered, isMobileViewport, isOpen, mobileScale, open, toggle],
  )

  return <MobileGnbContext.Provider value={value}>{children}</MobileGnbContext.Provider>
}

export function useMobileGnb() {
  const context = useContext(MobileGnbContext)
  if (!context) {
    throw new Error('useMobileGnb must be used within MobileGnbProvider')
  }
  return context
}
