import { useRef } from 'react'
import { QuickMenuSlotTile } from '../molecules/QuickMenuSlotTile'
import { useAdminHomeMainConfig } from '../../hooks/useAdminHomeMainConfig'
import { getQuickMenuCaptionBelow } from '../../lib/adminHomeMainConfig'
import { useHorizontalMouseDragScroll } from '../../hooks/useHorizontalMouseDragScroll'
import { mainImageAsset } from '../../lib/mainImagesAssetUrl'
import { isSpaPath, navigateSpa, type SpaPath } from '../../lib/spaNavigation'

const FALLBACK_SLOT_IMAGES = [
  mainImageAsset('category_01.png'),
  mainImageAsset('category_02.png'),
  mainImageAsset('category_03.png'),
  mainImageAsset('category_04.png'),
  mainImageAsset('category_05.png'),
  mainImageAsset('category_06.png'),
] as const

function navigateQuickMenuHref(href: string) {
  const trimmed = href.trim()
  if (!trimmed) return
  if (isSpaPath(trimmed)) {
    navigateSpa(trimmed as SpaPath)
    return
  }
  window.location.assign(trimmed)
}

/** Figma 2601:22673 — home quick menu (6 × 160px + 5 × 10px = 1010px on PC). */
export function CategorySection() {
  const { quickMenuSlots } = useAdminHomeMainConfig()
  const scrollerRef = useRef<HTMLDivElement>(null)
  useHorizontalMouseDragScroll(scrollerRef)

  const slots = quickMenuSlots.slice(0, FALLBACK_SLOT_IMAGES.length)

  return (
    <section className="ml-0 pb-[30px] pt-[20px] lg:mx-auto lg:max-w-[1400px]">
      <div
        ref={scrollerRef}
        className="flex flex-col items-center justify-start cursor-grab overflow-x-auto overscroll-x-contain scroll-smooth scroll-pl-4 scroll-pr-4 touch-pan-x snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden active:cursor-grabbing lg:cursor-default lg:overflow-visible lg:scroll-pl-0 lg:scroll-pr-0"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex h-[128px] w-max gap-[5px] lg:mx-auto lg:w-[1010px] lg:max-w-full lg:justify-center lg:gap-[10px]">
          <div className="block w-[11px] shrink-0 lg:hidden" aria-hidden />
          {slots.map((slot, index) => {
            const captionBelow = getQuickMenuCaptionBelow(slot)
            const content = (
              <>
                <QuickMenuSlotTile
                  slot={slot}
                  fallbackImageUrl={
                    slot.slotType === 'image' || slot.slotType === 'cutout' || slot.slotType === 'mixed'
                      ? (FALLBACK_SLOT_IMAGES[index] ?? null)
                      : null
                  }
                />
                {captionBelow ? (
                  <p className="m-0 text-center font-normal leading-[1.4] tracking-[-0.02em] whitespace-pre-line text-[13px] text-dark">
                    {captionBelow}
                  </p>
                ) : null}
              </>
            )

            const itemClassName =
              'flex shrink-0 snap-start flex-col items-center gap-[10px] lg:w-40'

            if (slot.href?.trim()) {
              return (
                <a
                  key={slot.id}
                  href={slot.href}
                  className={itemClassName}
                  onClick={(event) => {
                    event.preventDefault()
                    navigateQuickMenuHref(slot.href)
                  }}
                >
                  {content}
                </a>
              )
            }

            return (
              <button key={slot.id} className={itemClassName} type="button">
                {content}
              </button>
            )
          })}
          <div className="block w-[11px] shrink-0 lg:hidden" aria-hidden />
        </div>
      </div>
    </section>
  )
}
