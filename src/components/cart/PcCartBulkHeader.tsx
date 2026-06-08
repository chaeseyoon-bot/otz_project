import { CartCheckbox } from './CartItemCard'

export interface PcCartBulkHeaderProps {
  selectedCount: number
  totalCount: number
  allSelected: boolean
  onToggleSelectAll: () => void
  onRemoveSelected: () => void
}

/** Figma 51:2455 — PC cart bulk actions row. */
export function PcCartBulkHeader({
  selectedCount,
  totalCount,
  allSelected,
  onToggleSelectAll,
  onRemoveSelected,
}: PcCartBulkHeaderProps) {
  return (
    <div className="flex items-start justify-between border-b border-dark pb-6">
      <div className="flex items-start gap-2">
        <CartCheckbox
          size="lg"
          checked={allSelected}
          onChange={onToggleSelectAll}
          ariaLabel="전체 선택"
        />
        <button
          type="button"
          className="border-0 bg-transparent p-0 text-bodyRegular1 text-dark"
          onClick={onToggleSelectAll}
        >
          전체선택({selectedCount}/{totalCount})
        </button>
      </div>

      <div className="flex items-center gap-2 text-bodyRegular1 text-textDefault">
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
