import { useEffect, useState } from 'react'

/** Preload images and use natural width/height for masonry placement (shortest-column accuracy). */
export function useMeasuredAspectRatios(
  items: { id: string; image: string; aspectRatio: number }[],
): Record<string, number> {
  const [ratios, setRatios] = useState<Record<string, number>>(() =>
    Object.fromEntries(items.map((item) => [item.id, item.aspectRatio])),
  )

  useEffect(() => {
    setRatios(Object.fromEntries(items.map((item) => [item.id, item.aspectRatio])))

    let cancelled = false
    items.forEach((item) => {
      const img = new Image()
      img.onload = () => {
        if (cancelled || img.naturalWidth <= 0 || img.naturalHeight <= 0) return
        const measured = img.naturalWidth / img.naturalHeight
        setRatios((prev) => {
          if (Math.abs((prev[item.id] ?? 0) - measured) < 0.001) return prev
          return { ...prev, [item.id]: measured }
        })
      }
      img.src = item.image
    })

    return () => {
      cancelled = true
    }
  }, [items])

  return ratios
}
