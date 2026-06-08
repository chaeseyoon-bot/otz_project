import type { PdpColorVariant } from '../../data/productColorVariants'

export interface PdpColorVariantPickerProps {
  variants: PdpColorVariant[]
  currentProductId: string
  onSelect: (productId: string) => void
  variant?: 'mobile' | 'pc'
}

/** Figma g60Jix8lxQjYRzn3l7MNWf node 38:1632 — PDP color thumbnail chips. */
export function PdpColorVariantPicker({
  variants,
  currentProductId,
  onSelect,
  variant = 'mobile',
}: PdpColorVariantPickerProps) {
  const currentVariant =
    variants.find((variant) => variant.productId === currentProductId) ?? variants[0]

  const isPc = variant === 'pc'

  return (
    <div className="flex flex-col gap-2">
      <div className="flex w-fit flex-nowrap gap-1.5">
        {variants.map((variantItem) => {
          const selected = variantItem.productId === currentProductId
          return (
            <button
              key={variantItem.productId}
              type="button"
              className={`flex shrink-0 items-center overflow-hidden rounded-sm bg-light ${
                isPc ? 'py-[7px]' : 'h-[74px] w-[60px] py-[6px]'
              } ${selected ? 'border border-dark' : 'border border-transparent'}`}
              aria-label={`${variantItem.colorLabel} 색상`}
              aria-pressed={selected}
              onClick={() => onSelect(variantItem.productId)}
            >
              <img
                src={variantItem.thumbnailUrl}
                alt=""
                className="size-[60px] object-cover mix-blend-multiply"
                draggable={false}
              />
            </button>
          )
        })}
      </div>
      <p className="m-0 text-bodySmall text-dark">색상 : {currentVariant.colorLabel}</p>
    </div>
  )
}
