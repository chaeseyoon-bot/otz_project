import { useCallback, useLayoutEffect, useRef } from 'react'

/**
 * Horizontally scrolls a tab strip so the active tab sits at the visual center.
 * Used for mobile menu / subcategory chip rows (reference PLP interaction).
 */
export function useCenterHorizontalTabScroll(activeIndex: number, enabled = true) {
  const scrollerRef = useRef<HTMLElement | null>(null)
  const tabRefs = useRef<(HTMLElement | null)[]>([])

  const scrollTabToCenter = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const scroller = scrollerRef.current
    const tab = tabRefs.current[index]
    if (!scroller || !tab) return

    const scrollerWidth = scroller.clientWidth
    if (scrollerWidth <= 0) return

    const tabCenter = tab.offsetLeft + tab.offsetWidth / 2
    const targetLeft = tabCenter - scrollerWidth / 2
    const maxScroll = Math.max(0, scroller.scrollWidth - scrollerWidth)

    scroller.scrollTo({
      left: Math.max(0, Math.min(targetLeft, maxScroll)),
      behavior,
    })
  }, [])

  useLayoutEffect(() => {
    if (!enabled) return
    scrollTabToCenter(activeIndex, 'smooth')
  }, [activeIndex, enabled, scrollTabToCenter])

  const registerTabRef = useCallback((index: number) => {
    return (el: HTMLElement | null) => {
      tabRefs.current[index] = el
    }
  }, [])

  return { scrollerRef, registerTabRef, scrollTabToCenter }
}
