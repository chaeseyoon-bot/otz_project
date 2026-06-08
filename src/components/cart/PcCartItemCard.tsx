import { useState } from 'react'
import { ProductThumbFrame } from '../atoms/ProductThumbFrame'
import { figmaAsset, resolveAssetUrl } from '../../lib/figmaAssetUrl'
import { getProductHeartIconDataUri } from '../../lib/productHeartIcon'
import type { CartItem } from '../../data/cartContent'

const iconClose = figmaAsset('icons/search_close.svg')

function formatPrice(value: number) {
  return `${value.toLocaleString('ko-KR')}원`
}

function parseOptionSize(optionLabel: string) {
  const match = optionLabel.match(/:\s*(\d+)\]/)
  return match?.[1] ?? optionLabel.replace(/^\[옵션\s*:\s*/i, '').replace(/\]$/, '')
}

export interface PcCartItemCardProps {
  item: CartItem
  onRemove: () => void
  onOptionChange: () => void
}

/** Figma 51:2455 — PC cart line item row. */
export function PcCartItemCard({ item, onRemove, onOptionChange }: PcCartItemCardProps) {
  const [liked, setLiked] = useState(false)

  return (
    <div className="flex min-w-0 flex-1 gap-6 py-6">
      <div className="relative w-[120px] shrink-0">
        <ProductThumbFrame
          src={resolveAssetUrl(item.image)}
          alt=""
          className="w-full [&>div]:bg-[var(--otz-color-surface-subtle)]"
        />
        <button
          type="button"
          className="absolute right-0 top-0 flex size-9 items-center justify-center border-0 bg-transparent p-1.5"
          aria-label={liked ? '찜 해제' : '찜하기'}
          onClick={() => setLiked((value) => !value)}
        >
          <span
            className="block size-5 bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: getProductHeartIconDataUri(liked) }}
          />
        </button>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="m-0 text-bodyRegular1 text-textDefault">{item.productName}</p>
          <div className="flex items-center gap-1.5 text-bodyRegular1 text-subtleText">
            <span>{parseOptionSize(item.optionLabel)}</span>
            <span className="text-lightGray" aria-hidden>
              |
            </span>
            <span>{item.quantity}개</span>
          </div>
          <p className="m-0 text-bodyBold1 text-dark">{formatPrice(item.price)}</p>
        </div>
        {item.deliveryEstimate ? (
          <p className="m-0 text-bodyRegular2 text-subtleText">{item.deliveryEstimate}</p>
        ) : null}
      </div>

      <div className="flex w-40 shrink-0 flex-col justify-center gap-2 self-stretch">
        <button
          type="button"
          className="flex h-[42px] w-full items-center justify-center rounded border border-gray bg-white text-bodyRegular2 text-dark"
          onClick={onOptionChange}
        >
          옵션변경
        </button>
        <button
          type="button"
          className="flex h-[42px] w-full items-center justify-center rounded border border-lightGray bg-white text-bodyRegular2 text-dark"
        >
          바로구매
        </button>
      </div>

      <button
        type="button"
        className="flex shrink-0 self-center border-0 bg-transparent p-0"
        aria-label="상품 삭제"
        onClick={onRemove}
      >
        <img src={iconClose} alt="" aria-hidden className="size-6 object-contain" draggable={false} />
      </button>
    </div>
  )
}
