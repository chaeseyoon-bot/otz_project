import { navigateSpa } from '../../lib/spaNavigation'
import { CART_RETENTION_NOTICE } from '../../lib/cartStorage'
import { WISHLIST_PATH } from '../../lib/wishlistRoutes'

interface CartRetentionNoticeProps {
  className?: string
}

/** Cart 30-day retention copy with link to wishlist for longer storage. */
export function CartRetentionNotice({ className = '' }: CartRetentionNoticeProps) {
  const [beforeWishlist, afterWishlist = ''] = CART_RETENTION_NOTICE.split('관심 상품')

  return (
    <p className={`m-0 text-bodySmall text-subtleText${className ? ` ${className}` : ''}`}>
      * {beforeWishlist}
      <button
        type="button"
        className="border-0 bg-transparent p-0 text-bodySmall text-subtleText underline"
        onClick={() => navigateSpa(WISHLIST_PATH)}
      >
        관심 상품
      </button>
      {afterWishlist}
    </p>
  )
}
