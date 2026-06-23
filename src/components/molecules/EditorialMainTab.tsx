import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export type EditorialMainTabId = 'content' | 'product'

export interface EditorialMainTabProps {
  activeTab: EditorialMainTabId
  onTabChange: (tab: EditorialMainTabId) => void
}

const TABS: { id: EditorialMainTabId; label: string }[] = [
  { id: 'content', label: 'CONTENT' },
  { id: 'product', label: 'PRODUCT' },
]

const PC_GNB_HEIGHT_PX = 70
const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)'

function useIsDesktopViewport() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(DESKTOP_MEDIA_QUERY).matches,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY)
    const sync = () => setIsDesktop(mediaQuery.matches)
    sync()
    mediaQuery.addEventListener('change', sync)
    return () => mediaQuery.removeEventListener('change', sync)
  }, [])

  return isDesktop
}

/** Figma g60Jix8lxQjYRzn3l7MNWf 174:4784 — CONTENT / PRODUCT tabs; pins below PC GNB on scroll. */
export function EditorialMainTab({ activeTab, onTabChange }: EditorialMainTabProps) {
  const isDesktop = useIsDesktopViewport()
  const anchorRef = useRef<HTMLDivElement>(null)
  const pinThresholdRef = useRef(0)
  const barHeightRef = useRef(66)
  const [isPinned, setIsPinned] = useState(false)

  const measureAnchor = useCallback(() => {
    const anchor = anchorRef.current
    if (!anchor || !anchor.querySelector('nav')) return

    const height = anchor.offsetHeight
    if (height > 0) {
      barHeightRef.current = height
    }

    const rect = anchor.getBoundingClientRect()
    pinThresholdRef.current = Math.max(0, rect.top + window.scrollY - PC_GNB_HEIGHT_PX)
  }, [])

  const syncPin = useCallback(() => {
    setIsPinned(window.scrollY >= pinThresholdRef.current)
  }, [])

  useLayoutEffect(() => {
    if (!isPinned) {
      measureAnchor()
    }
    syncPin()
  }, [isPinned, measureAnchor, syncPin])

  useEffect(() => {
    if (!isDesktop) {
      setIsPinned(false)
      return
    }

    const onScroll = () => syncPin()
    const onResize = () => {
      if (window.scrollY < pinThresholdRef.current) {
        measureAnchor()
      }
      syncPin()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [isDesktop, measureAnchor, syncPin])

  if (!isDesktop) return null

  const tabBar = (
    <nav className="w-full bg-white" aria-label="에디토리얼 섹션">
      <div className="mx-auto flex max-w-[1400px] items-start justify-center gap-6 px-10 pt-6 pb-0">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              className={`flex flex-col items-center border-0 bg-transparent p-0 ${
                isActive ? 'h-[42px] justify-between gap-[10px]' : 'gap-[10px]'
              }`}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onTabChange(tab.id)}
            >
              <span
                className={`px-1.5 text-[18px] leading-[1.4] tracking-[-0.02em] ${
                  isActive ? 'font-bold text-dark' : 'font-normal text-textDefault'
                }`}
              >
                {tab.label}
              </span>
              <span
                className={`h-[2px] w-full ${isActive ? 'bg-dark' : 'bg-transparent'}`}
                aria-hidden
              />
            </button>
          )
        })}
      </div>
    </nav>
  )

  const pinnedBar = (
    <div
      className="fixed inset-x-0 z-[35] border-b border-[#E6E6E6] bg-white"
      style={{ top: PC_GNB_HEIGHT_PX }}
    >
      {tabBar}
    </div>
  )

  return (
    <>
      <div ref={anchorRef} className="w-full">
        {isPinned ? <div aria-hidden style={{ height: barHeightRef.current }} /> : tabBar}
      </div>
      {isPinned ? createPortal(pinnedBar, document.body) : null}
    </>
  )
}

/** Scroll margin for in-page tab jumps (PC GNB + pinned tab bar). */
export const EDITORIAL_PC_TAB_SCROLL_MARGIN_PX = PC_GNB_HEIGHT_PX + 66
