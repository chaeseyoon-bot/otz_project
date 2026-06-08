import { useEffect, useRef, useState } from 'react'
import { CHECKOUT_DELIVERY_REQUESTS } from '../../data/checkoutContent'
import { figmaAsset } from '../../lib/figmaAssetUrl'

const iconChevron = figmaAsset('icons/list_chevron.svg')

const PLACEHOLDER = CHECKOUT_DELIVERY_REQUESTS[0]

export type CheckoutDeliveryRequestValue = (typeof CHECKOUT_DELIVERY_REQUESTS)[number]

export interface CheckoutDeliveryRequestSelectProps {
  value: CheckoutDeliveryRequestValue
  onChange: (value: CheckoutDeliveryRequestValue) => void
}

/** Figma 53:6121 (default) / 64:3283 (open) — mobile checkout delivery request inline dropdown. */
export function CheckoutDeliveryRequestSelect({ value, onChange }: CheckoutDeliveryRequestSelectProps) {
  const [open, setOpen] = useState(false)
  const [hoveredOption, setHoveredOption] = useState<CheckoutDeliveryRequestValue | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const isPlaceholder = value === PLACEHOLDER
  const hasSelection = !isPlaceholder

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  const handleSelect = (option: CheckoutDeliveryRequestValue) => {
    onChange(option)
    setOpen(false)
    setHoveredOption(null)
  }

  const borderColor = hasSelection || open ? 'border-textDefault' : 'border-gray'

  return (
    <div ref={rootRef} className="relative">
      <div className={`border bg-white ${borderColor} ${open ? 'rounded-t border-b-0' : 'rounded'}`}>
        <button
          type="button"
          className={`flex h-[42px] w-full items-center justify-between border-0 bg-white px-3 py-[11px] ${
            open ? 'rounded-t shadow-[inset_0_-1px_0_#666666]' : 'rounded'
          }`}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label="배송 요청사항 선택"
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className={`text-bodyRegular2 ${isPlaceholder ? 'text-subtleText' : 'text-dark'}`}>
            {isPlaceholder ? PLACEHOLDER : value}
          </span>
          <img
            src={iconChevron}
            alt=""
            aria-hidden
            className={`size-4 shrink-0 object-contain transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            draggable={false}
          />
        </button>
      </div>

      {open ? (
        <ul
          role="listbox"
          aria-label="배송 요청사항"
          className={`absolute left-0 right-0 top-full z-20 m-0 list-none overflow-hidden rounded-b border border-t-0 bg-white p-0 ${borderColor}`}
        >
          {CHECKOUT_DELIVERY_REQUESTS.map((option, index) => {
            const isSelected = value === option
            const isHighlighted = hoveredOption === option || isSelected
            const isCompactRow = index % 2 === 0

            return (
              <li key={option} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`flex w-full items-center border-0 px-4 py-[11px] text-left text-bodyRegular2 ${
                    isCompactRow ? 'h-10' : 'h-[42px]'
                  } ${isHighlighted ? 'bg-textDefault text-white' : 'bg-white text-subtleText'}`}
                  onMouseEnter={() => setHoveredOption(option)}
                  onMouseLeave={() => setHoveredOption(null)}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
