/** Returns whether `url` can be loaded in an `<img>` (storage 404 → false). */
export function probeImageUrl(url: string): Promise<boolean> {
  if (!url) return Promise.resolve(false)

  return new Promise((resolve) => {
    const img = new Image()
    const finish = (ok: boolean) => {
      img.onload = null
      img.onerror = null
      resolve(ok)
    }
    img.onload = () => finish(true)
    img.onerror = () => finish(false)
    img.src = url
  })
}

/** Loads `url` and resolves its natural pixel size, or `null` when it 404s. */
export function probeImageSize(url: string): Promise<{ width: number; height: number } | null> {
  if (!url) return Promise.resolve(null)

  return new Promise((resolve) => {
    const img = new Image()
    const finish = (size: { width: number; height: number } | null) => {
      img.onload = null
      img.onerror = null
      resolve(size)
    }
    img.onload = () => finish({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => finish(null)
    img.src = url
  })
}
