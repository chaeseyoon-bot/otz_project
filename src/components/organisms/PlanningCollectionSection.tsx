import { useRef } from 'react'
import { PlanningCollectionMobileSlide } from '../molecules/PlanningCollectionMobileSlide'
import { useHorizontalMouseDragScroll } from '../../hooks/useHorizontalMouseDragScroll'
import { usePlanningCollectionsContent } from '../../hooks/usePlanningCollectionsContent'

export function PlanningCollectionSection() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  useHorizontalMouseDragScroll(scrollerRef)
  const { collections } = usePlanningCollectionsContent()

  return (
    <section className="bg-white pt-10 lg:hidden">
      <div
        ref={scrollerRef}
        className="cursor-grab overflow-x-auto overscroll-x-contain scroll-smooth scroll-pl-[15px] scroll-pr-[15px] snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden active:cursor-grabbing"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex w-max snap-x snap-mandatory gap-1">
          <div className="block w-[11px] shrink-0" aria-hidden />
          {collections.map((card) => (
            <article key={card.id} className="w-[335px] shrink-0 snap-start">
              <PlanningCollectionMobileSlide
                bannerImage={card.bannerImage}
                tagLabel={card.tagLabel}
                title={card.title}
                linkHref={card.linkHref}
                products={card.products}
              />
            </article>
          ))}
          <div className="block w-[11px] shrink-0" aria-hidden />
        </div>
      </div>
    </section>
  )
}
