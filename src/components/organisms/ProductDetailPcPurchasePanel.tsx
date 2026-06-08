import type { RefObject } from 'react'
import { PdpColorVariantPicker } from '../molecules/PdpColorVariantPicker'
import { PdpSizeOptionButton } from '../molecules/PdpSizeOptionButton'
import type { PdpColorVariant } from '../../data/productColorVariants'
import { getProductHeartIconDataUri } from '../../lib/productHeartIcon'

export interface ProductDetailPcPurchasePanelProps {
  colorVariants: PdpColorVariant[] | null
  productId: string
  onColorSelect: (productId: string) => void
  sizes: readonly string[]
  selectedSize: string | null
  soldOutSizes: Set<string>
  onSizeSelect: (size: string) => void
  liked: boolean
  onToggleLike: () => void
  onAddToCart: () => void
  onBuyNow: () => void
  sizeSectionRef?: RefObject<HTMLElement | null>
  showOptionRequiredHint?: boolean
  /** Shoes show multi-size grid; bag/acc show FREE only. */
  isShoesProduct?: boolean
}

/** Figma g60Jix8lxQjYRzn3l7MNWf node 39:1828 — sticky color/size/total/CTA block. */
export function ProductDetailPcPurchasePanel({
  colorVariants,
  productId,
  onColorSelect,
  sizes,
  selectedSize,
  soldOutSizes,
  onSizeSelect,
  liked,
  onToggleLike,
  onAddToCart,
  onBuyNow,
  sizeSectionRef,
  showOptionRequiredHint = false,
  isShoesProduct = true,
}: ProductDetailPcPurchasePanelProps) {
  return (
    <div className="sticky top-[70px] z-10 bg-white">
      {colorVariants ? (
        <section className="border-b border-lightGray py-6">
          <div className="w-fit">
            <PdpColorVariantPicker
              variants={colorVariants}
              currentProductId={productId}
              onSelect={onColorSelect}
              variant="pc"
            />
          </div>
        </section>
      ) : null}

      <section
        ref={sizeSectionRef}
        tabIndex={-1}
        aria-label={isShoesProduct ? '사이즈 옵션' : '옵션'}
        className="border-b border-lightGray py-6 outline-none"
      >
        <div className={`grid w-fit gap-2 ${isShoesProduct ? 'grid-cols-4' : 'grid-cols-1'}`}>
          {sizes.map((size) => (
            <PdpSizeOptionButton
              key={size}
              size={size}
              selected={selectedSize === size}
              soldOut={soldOutSizes.has(size)}
              onSelect={onSizeSelect}
              className="w-[122px]"
            />
          ))}
        </div>
        {selectedSize ? (
          <p className="mt-2 m-0 text-bodySmall text-dark">
            {isShoesProduct ? '사이즈' : '옵션'} : {selectedSize}
          </p>
        ) : (
          <p
            className={`mt-2 m-0 text-bodySmall ${showOptionRequiredHint ? 'text-primaryText' : 'text-subtleText'}`}
          >
            [필수] 옵션을 선택해 주세요
          </p>
        )}
      </section>

      <div className="flex items-center justify-between py-6">
        <p className="m-0 text-bodyRegular2 text-dark">총 상품금액 (수량)</p>
        <div className="flex items-center gap-1">
          <span className="text-titleBold text-dark">0</span>
          <span className="text-bodyRegular2 text-textDefault">(0개)</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="flex size-14 shrink-0 items-center justify-center rounded border border-gray bg-white"
          aria-label={liked ? '찜 해제' : '찜하기'}
          onClick={onToggleLike}
        >
          <span
            className="block h-[18px] w-[19px] bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: getProductHeartIconDataUri(liked) }}
          />
        </button>
        <button
          type="button"
          className="flex h-14 min-w-0 flex-1 items-center justify-center rounded border border-gray bg-white text-bodyMedium1 text-dark"
          onClick={onAddToCart}
        >
          장바구니
        </button>
        <button
          type="button"
          className="flex h-14 min-w-0 flex-1 items-center justify-center rounded border border-dark bg-dark text-bodyMedium1 text-white"
          onClick={onBuyNow}
        >
          바로구매
        </button>
      </div>
    </div>
  )
}
