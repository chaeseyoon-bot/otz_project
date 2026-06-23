import { ProductCardUnit, type ProductCardItem } from './ProductCardUnit'
import { getProductDetailPath } from '../../lib/productRoutes'
import { navigateSpa } from '../../lib/spaNavigation'

export interface WishlistProductCardProps {
  product: ProductCardItem
  liked: boolean
  onToggleLike: () => void
  variant: 'pc' | 'mobile'
}

/** Figma 203:5858 — wishlist product tile (PC 6-col catalog card). */
export function WishlistProductCard({ product, liked, onToggleLike, variant }: WishlistProductCardProps) {
  const isPc = variant === 'pc'

  return (
    <div
      className="flex h-full min-w-0 w-full cursor-pointer flex-col"
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
        liked={liked}
        onToggleLike={onToggleLike}
        articleClassName="flex h-full w-full min-h-0 flex-col"
        titleClassName={
          isPc
            ? 'min-h-[42px] min-w-0 line-clamp-2 pt-3 text-bodyRegular1 text-textDefault'
            : 'min-w-0 truncate pt-[7px] text-[13px] font-normal leading-[1.35] tracking-[-0.02em] text-textDefault'
        }
        priceRowClassName={
          isPc
            ? 'flex min-h-[25px] flex-wrap items-center gap-x-[6px] gap-y-0 pt-1'
            : 'flex flex-wrap items-center gap-x-[6px] gap-y-0 pt-1'
        }
        priceDiscountClassName={
          isPc
            ? 'text-bodyBold1 leading-[1.4] tracking-[-0.02em] text-primary'
            : 'text-[15px] font-bold leading-[1.4] tracking-[-0.02em] text-primary'
        }
        priceSaleClassName={
          isPc
            ? 'text-bodyBold1 leading-[1.4] tracking-[-0.02em] text-dark'
            : 'text-[15px] font-bold leading-[1.4] tracking-[-0.02em] text-dark'
        }
        priceOriginalClassName={
          isPc
            ? 'text-bodyRegular2 leading-[1.4] tracking-[-0.02em] text-subtleText line-through'
            : 'text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-subtleText line-through'
        }
        mediaInnerClassName="aspect-[272/340]"
        showSizeQuickSelect={isPc}
        hideMultiCutDots
      />
    </div>
  )
}
