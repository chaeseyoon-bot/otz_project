import { useState, type KeyboardEvent, type MouseEvent } from 'react'
import { swapImageExtension } from '../../lib/productImage'
import { navigateExternalOrSpa } from '../../lib/spaNavigation'

/** Figma 2424:16202 — mobile curation banner (345×480). */
export const CURATION_MOBILE_WIDTH = 345
export const CURATION_MOBILE_HEIGHT = 480
export const CURATION_MOBILE_TILE_COUNT = 4

const BUTTON_ARROW = '/assets/figma/icons/button_arrow.svg'

export interface CurationMobileSlideProps {
  /** Per-tile image URL candidates (07 editorial first). */
  tiles: string[][]
  badge: string
  title: string
  ctaLabel: string
  ctaHref: string
}

function CurationMobileTile({ candidates }: { candidates: string[] }) {
  const chain = candidates.filter(Boolean)
  const [index, setIndex] = useState(0)
  const src = chain[index]

  if (!src) {
    return <div className="h-full w-full bg-[var(--otz-color-surface-subtle,#f6f6f6)]" />
  }

  return (
    <img
      src={src}
      alt=""
      className="h-full w-full object-cover"
      draggable={false}
      onError={() => {
        const swapped = swapImageExtension(src)
        if (swapped && !chain.includes(swapped)) {
          setIndex((prev) => prev + 1)
          return
        }
        setIndex((prev) => Math.min(prev + 1, chain.length))
      }}
    />
  )
}

function handleCurationLinkKeyDown(href: string, event: KeyboardEvent<HTMLElement>) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    navigateExternalOrSpa(href)
  }
}

function handleCurationLinkClick(href: string, event: MouseEvent<HTMLAnchorElement>) {
  if (!href || href === '#') return
  event.preventDefault()
  navigateExternalOrSpa(href)
}

export function CurationMobileSlide({
  tiles,
  badge,
  title,
  ctaLabel,
  ctaHref,
}: CurationMobileSlideProps) {
  const displayBadge = badge.trim() || 'CURATION'
  const displayTitle = title.trim() || 'WINTER ACC\nSTYLING'
  const displayCta = ctaLabel.trim() || '상품 보러 가기'
  const linkHref = ctaHref.trim()
  const hasLink = Boolean(linkHref && linkHref !== '#')
  const tileSlots = Array.from(
    { length: CURATION_MOBILE_TILE_COUNT },
    (_, index) => tiles[index] ?? [],
  )

  return (
    <article
      className="relative h-[480px] w-full overflow-hidden"
      data-figma-node="2424:16202"
    >
      <div
        className={`absolute inset-0 z-0 grid h-full w-full grid-cols-2 grid-rows-2 ${hasLink ? 'cursor-pointer' : ''}`}
        role={hasLink ? 'link' : undefined}
        tabIndex={hasLink ? 0 : undefined}
        aria-label={hasLink ? displayCta : undefined}
        onClick={hasLink ? () => navigateExternalOrSpa(linkHref) : undefined}
        onKeyDown={hasLink ? (event) => handleCurationLinkKeyDown(linkHref, event) : undefined}
      >
        {tileSlots.map((candidates, index) => (
          <div key={index} className="relative h-full w-full">
            <CurationMobileTile candidates={candidates} />
          </div>
        ))}
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/10 via-black/20 to-black/35"
        aria-hidden
      />

      <div className="absolute left-0 top-0 z-20 h-fit w-fit bg-black px-[10px] py-2">
        <span className="text-[10px] font-semibold leading-[1.1] text-white">{displayBadge}</span>
      </div>

      <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center px-8 text-center">
        <h2 className="m-0 whitespace-pre-line text-[24px] font-extrabold leading-[1.2] tracking-[-0.02em] text-white">
          {displayTitle}
        </h2>
      </div>

      <a
        href={linkHref || '#'}
        className="absolute bottom-7 right-5 z-20 inline-flex flex-col items-end text-[rgba(255,255,255,0.8)] no-underline"
        onClick={hasLink ? (event) => handleCurationLinkClick(linkHref, event) : undefined}
      >
        <span className="pr-2.5 text-[13px] leading-none tracking-[-0.02em]">{displayCta}</span>
        <img
          src={BUTTON_ARROW}
          alt=""
          aria-hidden
          width={90}
          height={9}
          className="mt-0 block w-[90px]"
          draggable={false}
        />
      </a>
    </article>
  )
}
