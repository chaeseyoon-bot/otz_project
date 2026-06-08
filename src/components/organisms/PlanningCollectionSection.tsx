import { useRef } from 'react'
import { useHorizontalMouseDragScroll } from '../../hooks/useHorizontalMouseDragScroll'
import { mainImageAsset } from '../../lib/mainImagesAssetUrl'

const COLLECTION_CARDS = [
  {
    id: 'collection-1',
    label: 'COLLECTION',
    title: 'OTZ×UMU\nLove Winter Day',
    bannerImage: mainImageAsset('coll_banner_01.png'),
    products: [
      mainImageAsset('coll_thumb_01.png'),
      mainImageAsset('coll_thumb_02.png'),
      mainImageAsset('coll_thumb_03.png'),
      mainImageAsset('coll_thumb_04.png'),
    ],
  },
  {
    id: 'collection-2',
    label: 'LIMITED EDITION',
    title: 'OTZ×LOFA Seoul',
    bannerImage: mainImageAsset('coll_banner_02.png'),
    products: [
      mainImageAsset('coll_thumb_05.png'),
      mainImageAsset('coll_thumb_06.png'),
      mainImageAsset('coll_thumb_07.png'),
      mainImageAsset('coll_thumb_08.png'),
    ],
  },
]

export function PlanningCollectionSection() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  useHorizontalMouseDragScroll(scrollerRef)

  return (
    <section className="bg-white pt-10 lg:hidden">
      <div
        ref={scrollerRef}
        className="cursor-grab overflow-x-auto overscroll-x-contain scroll-smooth scroll-pl-[15px] scroll-pr-[15px] touch-pan-x snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden active:cursor-grabbing"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex w-max snap-x snap-mandatory gap-1">
          <div className="block w-[11px] shrink-0" aria-hidden />
          {COLLECTION_CARDS.map((card) => (
            <article key={card.id} className="w-[335px] shrink-0 snap-start">
              <div className="relative h-[419px] overflow-hidden">
                <img src={card.bannerImage} alt={card.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[47.5%] to-black/25 to-[83%]" />
                <div className="absolute h-fit bg-black px-[10px] py-[6px]">
                  <span className="text-[10px] font-semibold leading-[1.1] text-white">{card.label}</span>
                </div>
                <h3 className="absolute bottom-[30px] left-[30px] right-[30px] whitespace-pre-line text-center text-[24px] font-extrabold leading-[1.2] tracking-[-0.02em] text-white">
                  {card.title}
                </h3>
              </div>
              <div className="mt-[2px] grid grid-cols-4 gap-[2px]">
                {card.products.map((image) => (
                  <div key={image} className="aspect-[4/5] overflow-hidden bg-[var(--otz-color-surface-subtle)]">
                    <div className="flex h-full w-full items-center justify-center bg-[var(--otz-color-surface-subtle)]">
                      <div className="aspect-square w-full">
                        <img src={image} alt="" className="h-full w-full object-contain object-center mix-blend-multiply" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
          <div className="block w-[11px] shrink-0" aria-hidden />
        </div>
      </div>
    </section>
  )
}
