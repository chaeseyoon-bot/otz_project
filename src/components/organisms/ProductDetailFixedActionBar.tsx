import { getProductHeartIconDataUri } from '../../lib/productHeartIcon'

interface ProductDetailFixedActionBarProps {
  liked: boolean
  onToggleLike: () => void
  onAddToCart: () => void
  onBuyNow: () => void
}

/** Figma 2978:16158 — fixed wishlist / cart / buy CTA (replaces bottom tab bar on PDP). */
export function ProductDetailFixedActionBar({
  liked,
  onToggleLike,
  onAddToCart,
  onBuyNow,
}: ProductDetailFixedActionBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-lightGray bg-white px-[15px] py-[15px] pb-[calc(15px+env(safe-area-inset-bottom,0px))] lg:hidden">
      <div className="flex gap-2">
        <button
          type="button"
          className="flex size-12 shrink-0 items-center justify-center rounded border border-gray bg-white"
          aria-label={liked ? '찜 해제' : '찜하기'}
          onClick={onToggleLike}
        >
          <span
            className="block h-5 w-[19px] bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: getProductHeartIconDataUri(liked) }}
          />
        </button>
        <button
          type="button"
          className="flex h-12 min-w-0 flex-1 items-center justify-center rounded border border-gray bg-white text-bodyMedium1 text-dark"
          onClick={onAddToCart}
        >
          장바구니
        </button>
        <button
          type="button"
          className="flex h-12 min-w-0 flex-1 items-center justify-center rounded border border-dark bg-dark text-bodyMedium1 text-white"
          onClick={onBuyNow}
        >
          바로구매
        </button>
      </div>
    </div>
  )
}
