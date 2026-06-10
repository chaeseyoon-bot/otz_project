import type { ProductCardItem } from '../molecules/ProductCardUnit'
import { ProductCardUnit } from '../molecules/ProductCardUnit'
import { getProductDetailPath } from '../../lib/productRoutes'
import { navigateSpa } from '../../lib/spaNavigation'

interface SearchResultsFallbackSectionsProps {
  recentlyViewed: readonly ProductCardItem[]
  recommended: readonly ProductCardItem[]
  likedIds: ReadonlySet<string>
  onToggleLike: (productId: string) => void
  variant: 'pc' | 'mobile'
}

/** Horizontal row scroll only — no per-card multi-cut swipe (avoids nested gesture conflict). */
function productWithStaticThumbnail(product: ProductCardItem): ProductCardItem {
  const { multiCutSlides, ...rest } = product
  const image = multiCutSlides?.[0]?.image ?? product.image
  return { ...rest, image }
}

function SearchResultProductCard({
  product,
  liked,
  onToggleLike,
  variant,
}: {
  product: ProductCardItem
  liked: boolean
  onToggleLike: () => void
  variant: 'pc' | 'mobile'
}) {
  return (
    <div
      className="min-w-0 cursor-pointer"
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
        product={productWithStaticThumbnail(product)}
        liked={liked}
        onToggleLike={onToggleLike}
        articleClassName={variant === 'pc' ? 'group flex w-full flex-col' : 'flex w-full flex-col'}
        titleClassName={
          variant === 'pc'
            ? 'min-w-0 truncate pt-3 text-bodyRegular2 text-textDefault'
            : 'line-clamp-2 pt-3 pr-2 text-bodySmall text-textDefault'
        }
        showSizeQuickSelect={variant === 'pc'}
      />
    </div>
  )
}

function SearchResultsProductRow({
  products,
  likedIds,
  onToggleLike,
  variant,
}: {
  products: readonly ProductCardItem[]
  likedIds: ReadonlySet<string>
  onToggleLike: (productId: string) => void
  variant: 'pc' | 'mobile'
}) {
  if (variant === 'pc') {
    return (
      <div className="grid grid-cols-5 gap-[10px]">
        {products.map((product) => (
          <SearchResultProductCard
            key={product.id}
            product={product}
            liked={likedIds.has(product.id)}
            onToggleLike={() => onToggleLike(product.id)}
            variant={variant}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto overscroll-x-contain pr-[15px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max gap-2">
        {products.map((product) => (
          <div key={product.id} className="w-[152px] shrink-0">
            <SearchResultProductCard
              product={product}
              liked={likedIds.has(product.id)}
              onToggleLike={() => onToggleLike(product.id)}
              variant={variant}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

/** Figma 3794:44165 — 최근 본 상품 / 추천 상품 fallback rows. */
export function SearchResultsFallbackSections({
  recentlyViewed,
  recommended,
  likedIds,
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
            likedIds={likedIds}
            onToggleLike={onToggleLike}
            variant={variant}
          />
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="m-0 text-titleMedium text-dark">추천 상품</h2>
          <SearchResultsProductRow
            products={recommended}
            likedIds={likedIds}
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
          likedIds={likedIds}
          onToggleLike={onToggleLike}
          variant={variant}
        />
      </section>

      <section className="ml-[15px] flex flex-col gap-4">
        <h2 className="m-0 text-bodyBold2 text-dark">추천 상품</h2>
        <SearchResultsProductRow
          products={recommended}
          likedIds={likedIds}
          onToggleLike={onToggleLike}
          variant={variant}
        />
      </section>
    </div>
  )
}
