import { useState } from 'react'
import { ProductThumbFrame } from '../atoms/ProductThumbFrame'
import { figmaAsset, resolveAssetUrl } from '../../lib/figmaAssetUrl'
import { getProductHeartIconDataUri } from '../../lib/productHeartIcon'
import type { CartItem } from '../../data/cartContent'
import { CartCheckbox } from './CartItemCard'

const iconClose = figmaAsset('icons/search_close.svg')

function formatPrice(value: number) {
  return `${value.toLocaleString('ko-KR')}원`
}

function parseOptionSize(optionLabel: string) {
  const match = optionLabel.match(/:\s*(\d+)\]/)
  return match?.[1] ?? optionLabel.replace(/^\[옵션\s*:\s*/i, '').replace(/\]$/, '')
}

export interface MobileCartItemCardProps {
  item: CartItem
  onToggleSelected: () => void
  onRemove: () => void
  onOptionChange: () => void
}

/** Figma 51:2244 — mobile cart line item. */
export function MobileCartItemCard({ item, onToggleSelected, onRemove, onOptionChange }: MobileCartItemCardProps) {
  const [liked, setLiked] = useState(false)

  return (
    <article className="flex flex-col gap-4 border-b border-lightGray pb-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <CartCheckbox
            checked={item.selected}
            onChange={onToggleSelected}
            ariaLabel={`${item.productName} 선택`}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex size-5 shrink-0 items-center justify-center border-0 bg-transparent p-0"
              aria-label={liked ? '찜 해제' : '찜하기'}
              onClick={() => setLiked((value) => !value)}
            >
              <span
                className="block h-[15px] w-[16px] bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: getProductHeartIconDataUri(liked) }}
              />
            </button>
            <button
              type="button"
              className="flex size-5 items-center justify-center border-0 bg-transparent p-0"
              aria-label="상품 삭제"
              onClick={onRemove}
            >
              <img src={iconClose} alt="" aria-hidden className="size-5 object-contain" draggable={false} />
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <ProductThumbFrame src={resolveAssetUrl(item.image)} alt="" className="w-[88px] shrink-0" />

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="m-0 line-clamp-2 text-bodySmall text-textDefault">{item.productName}</p>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-bodySmall text-subtleText">
                <span>{parseOptionSize(item.optionLabel)}</span>
                <span className="text-lightGray" aria-hidden>
                  |
                </span>
                <span>{item.quantity}개</span>
              </div>
              <p className="m-0 text-bodyBold3 text-dark">{formatPrice(item.price)}</p>
            </div>
            {item.deliveryEstimate ? (
              <p className="m-0 text-bodySmall1 text-subtleText">{item.deliveryEstimate}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="flex h-[42px] min-w-0 flex-1 items-center justify-center rounded border border-gray bg-white text-bodyRegular2 text-dark"
          onClick={onOptionChange}
        >
          옵션변경
        </button>
        <button
          type="button"
          className="flex h-[42px] min-w-0 flex-1 items-center justify-center rounded border border-lightGray bg-white text-bodyRegular2 text-dark"
        >
          바로구매
        </button>
      </div>
    </article>
  )
}
