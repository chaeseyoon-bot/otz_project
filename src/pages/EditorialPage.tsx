import { useMemo, useState } from 'react'
import { EditorialEventCard } from '../components/molecules/EditorialEventCard'
import { useEditorialConfigContext } from '../contexts/EditorialConfigContext'
import {
  EDITORIAL_CATEGORY_FILTERS,
  filterEditorialEvents,
  type EditorialCategoryId,
} from '../data/editorialEvents'

/** Figma 2629:53973 (MO) / 2629:52636 (PC) */
export function EditorialPage() {
  const { config } = useEditorialConfigContext()
  const [activeCategory, setActiveCategory] = useState<EditorialCategoryId>('collection')

  const events = useMemo(
    () => filterEditorialEvents(activeCategory),
    [activeCategory, config.updatedAt],
  )

  return (
    <main className="bg-white lg:w-full">
      {/* MO — sub-category chips (NEW / BEST / ARCHIVE 패턴) */}
      <section className="h-[45px] bg-[#f8f8f8] px-[15px] py-[14px] lg:hidden">
        <div className="flex gap-[12px] overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {EDITORIAL_CATEGORY_FILTERS.map((filter) => {
            const isActive = filter.id === activeCategory
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveCategory(filter.id)}
                className={`shrink-0 border-0 bg-transparent px-0 py-0 text-[13px] leading-[1.3] ${
                  isActive ? 'font-semibold text-[#1A1A1A]' : 'font-normal text-[#8E8E8E]'
                }`}
              >
                {filter.label}
              </button>
            )
          })}
        </div>
      </section>

      {/* PC — Figma 2634:57397 Title + category pills */}
      <section className="hidden lg:mx-auto lg:block lg:w-full lg:max-w-[1400px] lg:px-0 lg:pt-10">
        <h1 className="m-0 text-center text-[34px] font-extrabold leading-[1.2] tracking-[-0.02em] text-dark">
          OTZ EDITORIAL
        </h1>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 pt-5">
          {EDITORIAL_CATEGORY_FILTERS.map((filter) => {
            const isActive = filter.id === activeCategory
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveCategory(filter.id)}
                className={`shrink-0 rounded-[100px] border border-solid px-[60px] py-[15px] text-[15px] leading-[1.4] tracking-[-0.02em] transition-opacity ${
                  isActive
                    ? 'border-dark bg-white font-normal text-dark hover:opacity-80'
                    : 'border-[#e8e8e8] bg-transparent font-normal text-dark hover:opacity-100'
                }`}
              >
                {filter.label}
              </button>
            )
          })}
        </div>
      </section>

      {/* Event list — MO 1열 / PC 3열 (Figma 2629:52688) */}
      <section className="px-[15px] pb-[50px] pt-[15px] lg:mx-auto lg:max-w-[1400px] lg:px-0 lg:pb-20 lg:pt-5">
        <ul className="m-0 flex list-none flex-col gap-[50px] p-0 lg:grid lg:grid-cols-3 lg:gap-x-[10px] lg:gap-y-5">
          {events.map((event) => (
            <li key={event.id} className="p-0">
              <EditorialEventCard event={event} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
