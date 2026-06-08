import { CartCheckbox } from './CartItemCard'

export interface CartMobileBulkHeaderProps {
  selectedCount: number
  totalCount: number
  allSelected: boolean
  onToggleSelectAll: () => void
  onRemoveSelected: () => void
}

/** Figma 51:2244 — mobile cart bulk actions row. */
export function CartMobileBulkHeader({
  selectedCount,
  totalCount,
  allSelected,
  onToggleSelectAll,
  onRemoveSelected,
}: CartMobileBulkHeaderProps) {
  return (
    <div className="flex items-start justify-between border-b border-dark pb-4">
      <div className="flex items-center gap-2">
        <CartCheckbox
          checked={allSelected}
          onChange={onToggleSelectAll}
          ariaLabel="전체 선택"
        />
        <button
          type="button"
          className="border-0 bg-transparent p-0 text-bodySmall text-dark"
          onClick={onToggleSelectAll}
        >
          전체선택({selectedCount}/{totalCount})
        </button>
      </div>

      <div className="flex items-center gap-2 text-bodySmall text-textDefault">
        <button type="button" className="border-0 bg-transparent p-0 text-textDefault" onClick={onRemoveSelected}>
          선택삭제
        </button>
        <span className="text-lightGray" aria-hidden>
          |
        </span>
        <button type="button" className="border-0 bg-transparent p-0 text-textDefault">
          품절삭제
        </button>
      </div>
    </div>
  )
}
