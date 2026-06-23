export interface EditorialCollaboMainBannerProps {
  src: string
  /** Figma 196:5779 — collabo main banner overlay title */
  overlayTitle?: string
  variant?: 'pc' | 'mobile'
  className?: string
}

/** Figma 196:5779 — collabo editorial main banner with 30% dim + centered title. */
export function EditorialCollaboMainBanner({
  src,
  overlayTitle,
  variant = 'pc',
  className = '',
}: EditorialCollaboMainBannerProps) {
  const title = overlayTitle?.trim() ?? ''
  const showOverlay = title.length > 0

  if (variant === 'mobile') {
    return (
      <div className={`relative w-full overflow-hidden ${className}`}>
        <img
          src={src}
          alt=""
          className="block aspect-[345/460] w-full object-cover"
          loading="eager"
          decoding="async"
          draggable={false}
        />
        {showOverlay ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.3)] px-6">
            <p className="m-0 text-center text-[28px] font-extrabold leading-[1.2] tracking-[-0.02em] text-white [word-break:break-word]">
              {title}
            </p>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <section
      className={`mx-auto flex h-[862px] w-full max-w-[1400px] flex-col items-center justify-center pb-16 ${className}`}
    >
      <div className="relative flex min-h-0 w-full flex-1">
        <img
          src={src}
          alt=""
          className="block h-full w-full object-cover object-center"
          loading="eager"
          decoding="async"
          draggable={false}
        />
        {showOverlay ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.3)] px-10">
            <p className="m-0 text-center text-[62px] font-extrabold leading-normal text-white [word-break:break-word]">
              {title}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  )
}
