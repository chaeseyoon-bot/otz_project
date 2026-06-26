import { useLayoutEffect, useRef, useState, type RefObject } from 'react'

const MOBILE_SHELL_SELECTOR = '.app-home-shell'

export interface MobileShellFixedPinState {
  sentinelRef: RefObject<HTMLDivElement | null>
  barRef: RefObject<HTMLDivElement | null>
  pinned: boolean
  shellLeft: number
  shellWidth: number
  barHeight: number
}

/**
 * Pins a bar with `position: fixed` aligned to `.app-home-shell`.
 * Needed because `zoom` on the mobile shell breaks `position: sticky`.
 */
export function useMobileShellFixedPin(): MobileShellFixedPinState {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const shellMetricsRef = useRef({ left: 0, width: 375 })
  const [pinned, setPinned] = useState(false)
  const [shellLeft, setShellLeft] = useState(0)
  const [shellWidth, setShellWidth] = useState(375)
  const [barHeight, setBarHeight] = useState(86)

  useLayoutEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    let pinRaf = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        cancelAnimationFrame(pinRaf)
        pinRaf = requestAnimationFrame(() => {
          const nextPinned = !entry.isIntersecting
          setPinned((prev) => (prev === nextPinned ? prev : nextPinned))
        })
      },
      { threshold: 0 },
    )
    observer.observe(sentinel)
    return () => {
      cancelAnimationFrame(pinRaf)
      observer.disconnect()
    }
  }, [])

  useLayoutEffect(() => {
    const measureShell = () => {
      const shell = document.querySelector(MOBILE_SHELL_SELECTOR)
      if (!shell) return
      const rect = shell.getBoundingClientRect()
      const left = Math.round(rect.left)
      const width = Math.round(rect.width)
      const prev = shellMetricsRef.current
      if (left === prev.left && width === prev.width) return
      shellMetricsRef.current = { left, width }
      setShellLeft(left)
      setShellWidth(width)
    }

    const measureBar = () => {
      const bar = barRef.current
      if (!bar) return
      const next = Math.round(bar.getBoundingClientRect().height)
      if (next <= 0) return
      setBarHeight((prev) => (prev === next ? prev : next))
    }

    measureShell()
    measureBar()

    window.addEventListener('resize', measureShell)

    const shell = document.querySelector(MOBILE_SHELL_SELECTOR)
    const observers: ResizeObserver[] = []

    const ro = new ResizeObserver(() => {
      measureShell()
      measureBar()
    })
    if (shell) ro.observe(shell)
    if (barRef.current) ro.observe(barRef.current)
    observers.push(ro)

    return () => {
      window.removeEventListener('resize', measureShell)
      observers.forEach((o) => o.disconnect())
    }
  }, [pinned])

  return { sentinelRef, barRef, pinned, shellLeft, shellWidth, barHeight }
}
