import { useEffect, useRef, type RefObject } from 'react'

const DRAG_THRESHOLD_PX = 3

export interface UseHorizontalMouseDragScrollOptions {
  enabled?: boolean
  onDragEnd?: () => void
}

export function useHorizontalMouseDragScroll<T extends HTMLElement>(
  targetRef: RefObject<T | null>,
  { enabled = true, onDragEnd }: UseHorizontalMouseDragScrollOptions = {},
) {
  const isDraggingRef = useRef(false)
  const onDragEndRef = useRef(onDragEnd)
  onDragEndRef.current = onDragEnd

  useEffect(() => {
    if (!enabled) return
    const element = targetRef.current
    if (!element) return

    let pointerDown = false
    let startX = 0
    let startScrollLeft = 0
    let moved = false
    let previousCursor = ''
    let previousUserSelect = ''

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return
      if (element.scrollWidth <= element.clientWidth) return

      pointerDown = true
      moved = false
      startX = event.clientX
      startScrollLeft = element.scrollLeft
      isDraggingRef.current = true

      previousCursor = element.style.cursor
      previousUserSelect = document.body.style.userSelect
      element.style.cursor = 'grabbing'
      document.body.style.userSelect = 'none'
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!pointerDown) return

      const deltaX = event.clientX - startX
      if (Math.abs(deltaX) > DRAG_THRESHOLD_PX) {
        moved = true
      }

      element.scrollLeft = startScrollLeft - deltaX
      if (moved) {
        event.preventDefault()
      }
    }

    const handleMouseUp = () => {
      if (!pointerDown) return

      const didMove = moved
      pointerDown = false
      isDraggingRef.current = false
      element.style.cursor = previousCursor
      document.body.style.userSelect = previousUserSelect
      if (didMove) onDragEndRef.current?.()
    }

    element.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mouseleave', handleMouseUp)

    return () => {
      element.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mouseleave', handleMouseUp)
      isDraggingRef.current = false
      element.style.cursor = previousCursor
      document.body.style.userSelect = previousUserSelect
    }
  }, [enabled, targetRef])

  return { isDraggingRef }
}
