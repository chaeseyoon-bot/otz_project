import { figmaAsset } from '../../lib/figmaAssetUrl'
import { CartCheckbox } from '../cart/CartItemCard'
import { CHECKOUT_TERMS_ITEMS } from '../../data/checkoutContent'

const iconChevron = figmaAsset('icons/list_chevron.svg')

export interface CheckoutTermsSectionProps {
  expanded: boolean
  onToggle: () => void
  allAgreed: boolean
  onToggleAll: () => void
  agreedIds: Set<string>
  onToggleItem: (id: string) => void
  className?: string
}

/** Figma 56:6580 — terms agreement section. */
export function CheckoutTermsSection({
  expanded,
  onToggle,
  allAgreed,
  onToggleAll,
  agreedIds,
  onToggleItem,
  className = '',
}: CheckoutTermsSectionProps) {
  return (
    <section className={`flex w-full flex-col gap-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-lightGray pb-4">
        <div className="flex min-w-0 items-center gap-2">
          <CartCheckbox checked={allAgreed} onChange={onToggleAll} ariaLabel="약관 전체 동의" size="lg" />
          <span className="text-bodyRegular2 text-dark">위 주문내용을 확인했으며, 약관에 동의합니다.</span>
        </div>
        <button
          type="button"
          className="flex size-5 shrink-0 items-center justify-center border-0 bg-transparent p-0"
          aria-expanded={expanded}
          aria-label={expanded ? '약관 상세 접기' : '약관 상세 펼치기'}
          onClick={onToggle}
        >
          <img
            src={iconChevron}
            alt=""
            aria-hidden
            className={`size-4 object-contain transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            draggable={false}
          />
        </button>
      </div>

      {expanded ? (
        <div className="flex flex-col gap-4">
          {CHECKOUT_TERMS_ITEMS.map((item) => (
            <div key={item.id} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <CartCheckbox
                  checked={agreedIds.has(item.id)}
                  onChange={() => onToggleItem(item.id)}
                  ariaLabel={item.label}
                  size="lg"
                />
                <span className="text-bodyRegular2 text-textDefault">{item.label}</span>
              </div>
              <div className="rounded border border-gray bg-white px-4 py-2">
                <p className="m-0 text-bodySmall1 text-subtleText">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
