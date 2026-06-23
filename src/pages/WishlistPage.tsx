import { ProductCardUnit } from '../components/molecules/ProductCardUnit'
import { WishlistMobileHeader } from '../components/organisms/WishlistMobileHeader'
import { useWishlist } from '../contexts/WishlistContext'
import { useWishlistProducts } from '../hooks/useWishlistProducts'
import { getProductDetailPath } from '../lib/productRoutes'
import { navigateSpa } from '../lib/spaNavigation'

/** Mobile wishlist — products liked via heart across the storefront. */
export function WishlistPage() {
  const { likedIds, isLiked, toggleLike } = useWishlist()
  const { products, isLoading, error } = useWishlistProducts(likedIds)

  return (
    <main className="bg-white lg:hidden">
      <WishlistMobileHeader />

      <section className="px-[15px] pb-10 pt-4">
        {likedIds.length === 0 ? (
          <p className="py-20 text-center text-bodySmall text-subtleText">찜한 상품이 없습니다.</p>
        ) : isLoading ? (
          <p className="py-20 text-center text-bodySmall text-subtleText">상품을 불러오는 중입니다…</p>
        ) : error ? (
          <p className="py-20 text-center text-bodySmall text-subtleText">
            상품을 불러오지 못했습니다. ({error})
          </p>
        ) : products.length === 0 ? (
          <p className="py-20 text-center text-bodySmall text-subtleText">찜한 상품이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-[6px] gap-y-[50px]">
            {products.map((product) => (
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
                  liked={isLiked(product.id)}
                  onToggleLike={() => toggleLike(product.id)}
                  articleClassName="flex w-full flex-col"
                  titleClassName="min-w-0 truncate pt-[7px] text-[13px] font-normal leading-[1.35] tracking-[-0.02em] text-textDefault"
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
