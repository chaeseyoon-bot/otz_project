import { useCenterHorizontalTabScroll } from '../../hooks/useCenterHorizontalTabScroll'
import type { CategoryMobileMainId } from '../../data/categoryMobileMain'
import { getLnbSubItems, getMobileSubChipLabels } from '../../data/categoryMobileMain'
import { navigateSpa } from '../../lib/spaNavigation'

export const CATEGORY_LNB_MAIN_ITEMS = [
  { id: 'all', label: 'ALL', href: null },
  { id: 'shoes', label: 'SHOES', href: '/category/shoes' as const },
  { id: 'bag-acc', label: 'BAG＆ACC', href: null },
  { id: 'collection', label: 'COLLECTION', href: null },
] as const

interface CategoryLnbProps {
  activeMainId: (typeof CATEGORY_LNB_MAIN_ITEMS)[number]['id']
  activeSubIndex: number
  onSubChange?: (index: number) => void
  onMainSelect?: (id: CategoryMobileMainId) => void
}

function MainRow({
  label,
  href,
  isActive,
  onNavigate,
  onSelect,
}: {
  label: string
  href: (typeof CATEGORY_LNB_MAIN_ITEMS)[number]['href']
  isActive: boolean
  onNavigate?: () => void
  onSelect?: () => void
}) {
  const className = `flex h-14 w-full items-center border-0 bg-transparent p-0 text-left text-[18px] font-bold leading-[1.4] tracking-[-0.02em] ${
    isActive ? 'text-dark' : 'text-dark hover:opacity-70'
  }`

  if (href) {
    return (
      <a
        href={href}
        className={className}
        aria-current={isActive ? 'page' : undefined}
        onClick={(event) => {
          event.preventDefault()
          onNavigate?.()
        }}
      >
        {label}
      </a>
    )
  }

  return (
    <button
      type="button"
      className={className}
      aria-current={isActive ? 'page' : undefined}
      onClick={onSelect}
    >
      {label}
    </button>
  )
}

/** Figma 2459:4189 — category PLP left navigation (SHOES expanded with sub-menu). */
export function CategoryLnb({ activeMainId, activeSubIndex, onSubChange, onMainSelect }: CategoryLnbProps) {
  return (
    <aside className="hidden w-[200px] shrink-0 lg:block" aria-label="카테고리">
      <div className="flex h-[60px] w-full items-start justify-start">
        <p className="m-0 flex h-10 w-full flex-col items-start justify-center text-[24px] font-extrabold leading-[1.2] tracking-[-0.02em] text-black">CATEGORY</p>
      </div>
      <div className="h-0.5 w-full bg-dark" aria-hidden />

      <nav className="flex flex-col py-[30px]">
        {CATEGORY_LNB_MAIN_ITEMS.map((item, mainIndex) => {
          const isActive = item.id === activeMainId
          const showSubMenu = isActive && item.id !== 'all'
          const lnbSubItems =
            item.id === 'shoes' || item.id === 'bag-acc' || item.id === 'collection'
              ? getLnbSubItems(item.id)
              : []

          return (
            <div key={item.id} className="flex w-full flex-col">
              <div className="flex h-14 items-center">
                <MainRow
                  label={item.label}
                  href={item.href}
                  isActive={isActive}
                  onNavigate={
                    item.href
                      ? () => {
                          navigateSpa(item.href!)
                        }
                      : undefined
                  }
                  onSelect={
                    !item.href && (item.id === 'bag-acc' || item.id === 'collection')
                      ? () => onMainSelect?.(item.id)
                      : undefined
                  }
                />
              </div>

              {showSubMenu ? (
                <>
                  <div className="h-px w-full bg-lightGray" aria-hidden />
                  <div className="flex w-full flex-col bg-whiteGray px-[25px] py-3">
                    <button
                      type="button"
                      className={`flex h-[34px] w-full items-center border-0 bg-transparent p-0 text-left text-[14px] leading-[1.4] tracking-[-0.02em] ${
                        activeSubIndex === 0
                          ? 'font-bold text-dark'
                          : 'font-normal text-subtleText hover:text-dark'
                      }`}
                      aria-current={activeSubIndex === 0 ? 'true' : undefined}
                      onClick={() => onSubChange?.(0)}
                    >
                      ALL
                    </button>
                    {lnbSubItems.map((label, subIndex) => {
                      const index = subIndex + 1
                      return (
                        <button
                          key={label}
                          type="button"
                          className={`flex h-[34px] w-full items-center border-0 bg-transparent p-0 text-left text-[14px] leading-[1.4] tracking-[-0.02em] ${
                            activeSubIndex === index
                              ? 'font-bold text-dark'
                              : 'font-normal text-subtleText hover:text-dark'
                          }`}
                          aria-current={activeSubIndex === index ? 'true' : undefined}
                          onClick={() => onSubChange?.(index)}
                        >
                          {label}
                        </button>
                      )
                    })}
                    <div className="mt-3 h-px w-full bg-light" aria-hidden />
                  </div>
                </>
              ) : null}

              <div
                className={`h-px w-full ${showSubMenu ? 'bg-light2' : mainIndex < CATEGORY_LNB_MAIN_ITEMS.length - 1 ? 'bg-light2' : ''}`}
                aria-hidden
              />
            </div>
          )
        })}
      </nav>
    </aside>
  )
}

/** Mobile horizontal subcategory strip — Figma 2497:11815 중카Tab. */
export function CategoryLnbMobileSubChips({
  activeMainId,
  activeSubIndex,
  onSubChange,
}: {
  activeMainId: CategoryMobileMainId
  activeSubIndex: number
  onSubChange: (index: number) => void
}) {
  const labels = getMobileSubChipLabels(activeMainId)
  const { scrollerRef, registerTabRef, scrollTabToCenter } = useCenterHorizontalTabScroll(activeSubIndex)

  return (
    <section className="border-b border-light2 bg-white lg:hidden">
      <div
        ref={scrollerRef}
        className="flex h-[42px] items-center gap-[22px] overflow-x-auto scroll-smooth px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {labels.map((label, index) => {
          const isActive = index === activeSubIndex
          return (
            <button
              key={`${activeMainId}-${label}`}
              ref={registerTabRef(index)}
              type="button"
              className="flex h-full shrink-0 flex-col items-center justify-between border-0 bg-transparent px-0"
              aria-current={isActive ? 'true' : undefined}
              onClick={() => {
                onSubChange(index)
                requestAnimationFrame(() => scrollTabToCenter(index, 'smooth'))
              }}
            >
              <span className="h-0.5 w-full shrink-0 bg-transparent" aria-hidden />
              <span
                className={`whitespace-nowrap text-[14px] leading-[1.4] tracking-[-0.02em] ${
                  isActive ? 'font-bold text-black' : 'font-normal text-textDefault'
                }`}
              >
                {label}
              </span>
              <span className={`h-0.5 w-full shrink-0 ${isActive ? 'bg-black' : 'bg-transparent'}`} aria-hidden />
            </button>
          )
        })}
      </div>
    </section>
  )
}
