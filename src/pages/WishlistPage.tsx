import { WishlistProductCard } from '../components/molecules/WishlistProductCard'
import { WishlistMobileHeader } from '../components/organisms/WishlistMobileHeader'
import { useWishlist } from '../contexts/WishlistContext'
import { useWishlistProducts } from '../hooks/useWishlistProducts'

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
              <WishlistProductCard
                key={product.id}
                product={product}
                liked={isLiked(product.id)}
                onToggleLike={() => toggleLike(product.id)}
                variant="mobile"
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
