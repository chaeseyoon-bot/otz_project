import { useLayoutEffect } from 'react'

/** Mark scrollable regions inside a locked overlay (e.g. bottom sheet body). */
export const SCROLL_LOCK_ALLOW_ATTR = 'data-scroll-lock-allow'

type SavedStyles = {
  scrollY: number
  htmlOverflow: string
  htmlOverscroll: string
  bodyOverflow: string
  bodyPosition: string
  bodyTop: string
  bodyLeft: string
  bodyRight: string
  bodyWidth: string
}

let lockCount = 0
let saved: SavedStyles | null = null

function isAllowedTouchTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(`[${SCROLL_LOCK_ALLOW_ATTR}]`) !== null
}

function preventBackgroundTouchMove(event: TouchEvent) {
  if (isAllowedTouchTarget(event.target)) return
  event.preventDefault()
}

function preventBackgroundWheel(event: WheelEvent) {
  if (isAllowedTouchTarget(event.target)) return
  event.preventDefault()
}

function applyLock() {
  const html = document.documentElement
  const body = document.body
  const scrollY = window.scrollY

  saved = {
    scrollY,
    htmlOverflow: html.style.overflow,
    htmlOverscroll: html.style.overscrollBehavior,
    bodyOverflow: body.style.overflow,
    bodyPosition: body.style.position,
    bodyTop: body.style.top,
    bodyLeft: body.style.left,
    bodyRight: body.style.right,
    bodyWidth: body.style.width,
  }

  html.style.overflow = 'hidden'
  html.style.overscrollBehavior = 'none'
  body.style.overflow = 'hidden'
  body.style.position = 'fixed'
  body.style.top = `-${scrollY}px`
  body.style.left = '0'
  body.style.right = '0'
  body.style.width = '100%'

  document.addEventListener('touchmove', preventBackgroundTouchMove, { passive: false })
  document.addEventListener('wheel', preventBackgroundWheel, { passive: false })
}

function releaseLock() {
  if (!saved) return

  const html = document.documentElement
  const body = document.body
  const { scrollY } = saved

  document.removeEventListener('touchmove', preventBackgroundTouchMove)
  document.removeEventListener('wheel', preventBackgroundWheel)

  html.style.overflow = saved.htmlOverflow
  html.style.overscrollBehavior = saved.htmlOverscroll
  body.style.overflow = saved.bodyOverflow
  body.style.position = saved.bodyPosition
  body.style.top = saved.bodyTop
  body.style.left = saved.bodyLeft
  body.style.right = saved.bodyRight
  body.style.width = saved.bodyWidth

  window.scrollTo(0, scrollY)
  saved = null
}

/**
 * Locks document scroll while a dimmed overlay is open.
 * Required for all modal / bottom-sheet / dropdown-backdrop UI — never rely on overflow:hidden alone.
 */
export function useLockBodyScroll(locked: boolean) {
  useLayoutEffect(() => {
    if (!locked) return

    lockCount += 1
    if (lockCount === 1) applyLock()

    return () => {
      lockCount = Math.max(0, lockCount - 1)
      if (lockCount === 0) releaseLock()
    }
  }, [locked])
}
