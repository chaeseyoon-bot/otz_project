import type { ProductCardItem } from '../molecules/ProductCardUnit'
import { ProductCardUnit } from '../molecules/ProductCardUnit'
import { SEARCH_RESULTS_CATALOG } from '../../lib/searchResultsCatalog'

interface SearchResultsFallbackSectionsProps {
  recentlyViewed: readonly ProductCardItem[]
  recommended: readonly ProductCardItem[]
  likedItems: boolean[]
  onToggleLike: (catalogIndex: number) => void
  variant: 'pc' | 'mobile'
}

/** Horizontal row scroll only — no per-card multi-cut swipe (avoids nested gesture conflict). */
function productWithStaticThumbnail(product: ProductCardItem): ProductCardItem {
  const { multiCutSlides, ...rest } = product
  const image = multiCutSlides?.[0]?.image ?? product.image
  return { ...rest, image }
}

function SearchResultsProductRow({
  products,
  likedItems,
  onToggleLike,
  variant,
}: {
  products: readonly ProductCardItem[]
  likedItems: boolean[]
  onToggleLike: (catalogIndex: number) => void
  variant: 'pc' | 'mobile'
}) {
  if (variant === 'pc') {
    return (
      <div className="grid grid-cols-5 gap-[10px]">
        {products.map((product) => {
          const index = SEARCH_RESULTS_CATALOG.findIndex((item) => item.id === product.id)
          return (
            <div key={product.id} className="min-w-0">
              <ProductCardUnit
                product={productWithStaticThumbnail(product)}
                liked={likedItems[index]}
                onToggleLike={() => onToggleLike(index)}
                articleClassName="group flex w-full flex-col"
                titleClassName="min-w-0 truncate pt-3 text-bodyRegular2 text-textDefault"
                showSizeQuickSelect
              />
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto overscroll-x-contain pr-[15px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max gap-2">
        {products.map((product) => {
          const index = SEARCH_RESULTS_CATALOG.findIndex((item) => item.id === product.id)
          return (
            <div key={product.id} className="w-[152px] shrink-0">
              <ProductCardUnit
                product={productWithStaticThumbnail(product)}
                liked={likedItems[index]}
                onToggleLike={() => onToggleLike(index)}
                articleClassName="flex w-full flex-col"
                titleClassName="line-clamp-2 pt-3 pr-2 text-bodySmall text-textDefault"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Figma 3794:44165 — 최근 본 상품 / 추천 상품 fallback rows. */
export function SearchResultsFallbackSections({
  recentlyViewed,
  recommended,
  likedItems,
  onToggleLike,
  variant,
}: SearchResultsFallbackSectionsProps) {
  if (variant === 'pc') {
    return (
      <div className="mt-20 flex flex-col gap-20">
        <section className="flex flex-col gap-6">
          <h2 className="m-0 text-titleMedium text-dark">최근 본 상품</h2>
          <SearchResultsProductRow
            products={recentlyViewed}
            likedItems={likedItems}
            onToggleLike={onToggleLike}
            variant={variant}
          />
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="m-0 text-titleMedium text-dark">추천 상품</h2>
          <SearchResultsProductRow
            products={recommended}
            likedItems={likedItems}
            onToggleLike={onToggleLike}
            variant={variant}
          />
        </section>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-12 pb-14 pt-12">
      <section className="ml-[15px] flex flex-col gap-4">
        <h2 className="m-0 text-bodyBold2 text-dark">최근 본 상품</h2>
        <SearchResultsProductRow
          products={recentlyViewed}
          likedItems={likedItems}
          onToggleLike={onToggleLike}
          variant={variant}
        />
      </section>

      <section className="ml-[15px] flex flex-col gap-4">
        <h2 className="m-0 text-bodyBold2 text-dark">추천 상품</h2>
        <SearchResultsProductRow
          products={recommended}
          likedItems={likedItems}
          onToggleLike={onToggleLike}
          variant={variant}
        />
      </section>
    </div>
  )
}
