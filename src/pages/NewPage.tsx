import { useMemo, useState } from 'react'
import { ProductCardUnit } from '../components/molecules/ProductCardUnit'
import { useProducts } from '../hooks/useProducts'
import type { ProductCategory } from '../lib/productsApi'
import { getProductDetailPath } from '../lib/productRoutes'
import { navigateSpa } from '../lib/spaNavigation'

/** NEW PLP category tabs — index 0 = ALL (no filter), 1 = shoes, 2 = bag&acc. */
const NEW_FILTERS: ReadonlyArray<{ label: string; category: 'all' | ProductCategory }> = [
  { label: 'ALL', category: 'all' },
  { label: 'SHOES', category: 'shoes' },
  { label: 'BAG&ACC', category: 'bagacc' },
]

/** Route body only — shell, header, footer, tab bar live in `App`. */
export function NewPage() {
  const { products, isLoading, error } = useProducts({ flag: 'is_new' })
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set())
  const [activeFilterIndex, setActiveFilterIndex] = useState(0)

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const activeCategory = NEW_FILTERS[activeFilterIndex].category
  const visibleProducts = useMemo(
    () =>
      activeCategory === 'all'
        ? products
        : products.filter((product) => product.category === activeCategory),
    [products, activeCategory],
  )

  return (
    <main className="bg-white lg:w-full">
      {/* Mobile only — category chips; hidden on PC (lg+). */}
      <section className="bg-[#f8f8f8] px-[15px] py-[14px] lg:hidden">
        <div className="flex gap-[12px] overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {NEW_FILTERS.map((filter, index) => (
            <button
              key={filter.label}
              type="button"
              onClick={() => setActiveFilterIndex(index)}
              aria-pressed={index === activeFilterIndex}
              className={`shrink-0 border-0 bg-transparent px-[1px] py-0 text-[13px] leading-[1.3] ${
                index === activeFilterIndex
                  ? 'font-semibold text-[#1A1A1A]'
                  : 'font-normal text-[#8E8E8E]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      {/* PC — Figma 2627:47706: page title + filter row under header, 1400 rail flush (no horizontal inset) */}
      <section className="hidden lg:mx-auto lg:block lg:w-full lg:max-w-[1400px] lg:px-0 lg:pt-10">
        <h1 className="m-0 flex flex-col items-center justify-start text-[34px] font-extrabold leading-[1.2] tracking-[-0.02em] text-dark">
          NEW
        </h1>
        <div className="mt-6 flex flex-nowrap items-center justify-center gap-3">
          {NEW_FILTERS.map((filter, index) => (
            <button
              key={filter.label}
              type="button"
              onClick={() => setActiveFilterIndex(index)}
              aria-pressed={index === activeFilterIndex}
              className={`shrink-0 gap-0 rounded-[100px] border border-solid px-[60px] py-[15px] text-[15px] leading-[1.3] tracking-[-0.02em] text-[var(--otz-color-text-primary)] transition-opacity ${
                index === activeFilterIndex
                  ? 'border-[var(--otz-color-text-primary)] bg-white font-normal hover:opacity-80'
                  : 'border-lightGray bg-transparent font-normal opacity-100 hover:opacity-100'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      <section className="px-[15px] pb-[50px] pt-[15px] lg:mx-auto lg:max-w-[1400px] lg:px-0 lg:pb-20 lg:pt-8">
        {isLoading ? (
          <p className="py-20 text-center text-[14px] text-subtleText">상품을 불러오는 중입니다…</p>
        ) : error ? (
          <p className="py-20 text-center text-[14px] text-subtleText">
            상품을 불러오지 못했습니다. ({error})
          </p>
        ) : visibleProducts.length === 0 ? (
          <p className="py-20 text-center text-[14px] text-subtleText">표시할 상품이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-[6px] gap-y-[50px] lg:grid-cols-4 lg:gap-x-4 lg:gap-y-14">
            {visibleProducts.map((product) => (
              <div
                key={product.id}
                className="cursor-pointer p-0"
                role="link"
                tabIndex={0}
                onClick={() => navigateSpa(getProductDetailPath(product.id))}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    navigateSpa(getProductDetailPath(product.id))
                  }
                }}
              >
                <ProductCardUnit
                  product={product}
                  liked={likedIds.has(product.id)}
                  onToggleLike={() => toggleLike(product.id)}
                  articleClassName="flex w-full flex-col"
                  titleClassName="min-w-0 truncate pt-[7px] text-[13px] font-normal leading-[1.35] tracking-[-0.02em] text-textDefault lg:pt-3 lg:text-[14px] lg:leading-[1.4]"
                  showSizeQuickSelect
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
