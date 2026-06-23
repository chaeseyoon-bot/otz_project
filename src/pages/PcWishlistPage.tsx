import { WishlistProductCard } from '../components/molecules/WishlistProductCard'
import { useWishlist } from '../contexts/WishlistContext'
import { useWishlistProducts } from '../hooks/useWishlistProducts'

/** PC wishlist — Figma 203:5858; cart-style title + 6-column product grid. */
export function PcWishlistPage() {
  const { likedIds, isLiked, toggleLike } = useWishlist()
  const { products, isLoading, error } = useWishlistProducts(likedIds)

  return (
    <main className="hidden bg-white lg:block">
      <div className="mx-auto max-w-[1400px] px-0 pb-20 pt-16">
        <div className="flex w-full flex-col items-center gap-16">
          <h1 className="m-0 w-full text-center text-h1 text-black">찜한 상품</h1>

          <section className="w-full pb-[50px]">
            {likedIds.length === 0 ? (
              <p className="py-20 text-center text-bodyRegular2 text-subtleText">찜한 상품이 없습니다.</p>
            ) : isLoading ? (
              <p className="py-20 text-center text-bodyRegular2 text-subtleText">상품을 불러오는 중입니다…</p>
            ) : error ? (
              <p className="py-20 text-center text-bodyRegular2 text-subtleText">
                상품을 불러오지 못했습니다. ({error})
              </p>
            ) : products.length === 0 ? (
              <p className="py-20 text-center text-bodyRegular2 text-subtleText">찜한 상품이 없습니다.</p>
            ) : (
              <div className="grid grid-cols-6 gap-x-[10px] gap-y-12">
                {products.map((product) => (
                  <WishlistProductCard
                    key={product.id}
                    product={product}
                    liked={isLiked(product.id)}
                    onToggleLike={() => toggleLike(product.id)}
                    variant="pc"
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
