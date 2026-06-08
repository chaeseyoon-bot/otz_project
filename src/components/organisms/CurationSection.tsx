import type { CSSProperties } from 'react'
import { useState } from 'react'
import { curationItems } from '../../data/homeSections'
import { tokens } from '../../design-system/tokens'
import { getProductHeartIconDataUri } from '../../lib/productHeartIcon'

const BUTTON_ARROW = '/assets/figma/icons/button_arrow.svg'

/** Figma 2601:23363 — link chevron 6×12 */
function CurationLinkChevron({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={6}
      height={12}
      viewBox="0 0 6 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M1.25 2.75L4.25 6L1.25 9.25"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

export function CurationSection() {
  const [likedItems, setLikedItems] = useState<boolean[]>(() => curationItems.map(() => false))

  const toggleLike = (index: number) => {
    setLikedItems((prev) => prev.map((v, i) => (i === index ? !v : v)))
  }

  return (
    <section className="w-full">
      {/* Mobile — unchanged (no gray band / no 64px vertical padding) */}
      <div className="px-[15px] pb-0 pt-10 lg:hidden">
        <article className="relative h-[480px] overflow-hidden">
          <div style={styles.grid}>
            {curationItems.map((item) => (
              <img key={item.id} src={item.imageUrl} alt="" style={styles.image} />
            ))}
          </div>
          <div style={styles.overlay} />
          <div style={styles.badge}>CURATION</div>
          <div style={styles.titleWrapper}>
            <h2 style={styles.title}>WINTER ACC{'\n'}STYLING</h2>
          </div>
          <a href="#" style={styles.cta}>
            <span style={styles.ctaLabel}>상품 보러 가기</span>
            <img
              src={BUTTON_ARROW}
              alt=""
              aria-hidden
              width={90}
              height={9}
              style={styles.ctaArrow}
            />
          </a>
        </article>
      </div>

      {/* PC — Figma 2601:23305 band + 2601:23354 contents */}
      <div className="hidden w-full bg-light py-[64px] lg:block">
        <div className="mx-auto min-w-0 max-w-[1400px]">
          <div className="flex min-w-0 items-start gap-[75px]">
            <div className="flex w-[300px] shrink-0 flex-col gap-5 pt-5">
              <div className="shrink-0">
                <span className="inline-flex rounded-full bg-black px-[13px] py-[5px] text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-white">
                  CURATION
                </span>
              </div>
              <div className="flex flex-col gap-[30px]">
                <h2 className="m-0 whitespace-pre-line text-[34px] font-extrabold leading-[1.2] tracking-[-0.02em] text-dark">
                  WINTER ACC{'\n'}STYLING
                </h2>
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 text-link2 leading-none text-textDefault underline decoration-solid underline-offset-2 hover:text-dark"
                >
                  <span className="shrink-0">상품 바로가기</span>
                  <span className="flex h-3 w-1.5 shrink-0 items-center justify-center" aria-hidden>
                    <CurationLinkChevron className="block h-3 w-1.5 shrink-0" />
                  </span>
                </a>
              </div>
            </div>

            <div className="flex min-h-0 min-w-0 flex-1 items-center gap-[10px]">
              {curationItems.map((item, index) => (
                <article key={item.id} className="flex min-w-0 flex-1 flex-col self-stretch">
                  <div className="relative w-full shrink-0 overflow-hidden">
                    <div className="relative flex w-full shrink-0 items-center gap-[10px] bg-light aspect-[4/5]">
                      <div className="relative aspect-[1200/1500] min-h-0 min-w-0 flex-1">
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="pointer-events-none absolute inset-0 size-full max-w-none object-cover"
                          draggable={false}
                        />
                      </div>
                    </div>
                    <div className="absolute right-0 top-0 z-10 flex flex-col items-end p-[6px]">
                      <button
                        type="button"
                        aria-label={likedItems[index] ? '찜 해제' : '찜하기'}
                        onClick={() => toggleLike(index)}
                      >
                        <span
                          className="block h-4 w-[17px] bg-contain bg-center bg-no-repeat"
                          style={{ backgroundImage: getProductHeartIconDataUri(likedItems[index]) }}
                        />
                      </button>
                    </div>
                  </div>
                  <div className="w-full shrink-0 pr-1.5">
                    <p className="m-0 truncate pt-3 text-[14px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault">
                      {item.productName}
                    </p>
                    <div className="flex items-center pt-1">
                      <span className="text-[15px] font-bold leading-[1.4] tracking-[-0.02em] text-primary">
                        {item.discount}
                      </span>
                      <span className="pl-1.5 text-[15px] font-bold leading-[1.4] tracking-[-0.02em] text-black">
                        {item.price}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const styles: Record<string, CSSProperties> = {
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)',
  },
  badge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: tokens.color.black,
    color: tokens.color.white,
    padding: '8px 10px',
    fontSize: 10,
    fontWeight: 600,
    lineHeight: 1.1,
  },
  titleWrapper: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    textAlign: 'center',
    whiteSpace: 'pre-line',
  },
  title: {
    margin: 0,
    color: tokens.color.white,
    fontSize: 24,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    fontWeight: 800,
    whiteSpace: 'pre-line',
  },
  cta: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 0,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    letterSpacing: '-0.02em',
    textDecoration: 'none',
  },
  ctaLabel: {
    display: 'flex',
    lineHeight: 1,
    paddingRight: '10px',
    fontSize: 13,
    width: 90,
    fontFamily: 'var(--otz-font-family-base)',
  },
  ctaArrow: {
    display: 'block',
    width: 90,
    height: 9,
    flexShrink: 0,
  },
}
