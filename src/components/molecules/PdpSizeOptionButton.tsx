/** Figma g60Jix8lxQjYRzn3l7MNWf — sold-out size chip (node 20:6155). */
export interface PdpSizeOptionButtonProps {
  size: string
  selected: boolean
  soldOut: boolean
  onSelect: (size: string) => void
  className?: string
}

export function PdpSizeOptionButton({
  size,
  selected,
  soldOut,
  onSelect,
  className = '',
}: PdpSizeOptionButtonProps) {
  return (
    <button
      type="button"
      disabled={soldOut}
      aria-disabled={soldOut}
      aria-pressed={selected}
      onClick={() => onSelect(size)}
      className={`relative flex h-8 items-center justify-center overflow-hidden rounded-sm border text-bodySmall ${className} ${
        soldOut
          ? 'cursor-default border-lightGray bg-light font-normal text-subtleText'
          : selected
            ? 'border-dark bg-white font-medium text-dark'
            : 'border-lightGray bg-white font-normal text-dark'
      }`}
    >
      {soldOut ? (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
          <span className="h-16 w-px rotate-60 bg-lightGray" />
        </span>
      ) : null}
      {size}
    </button>
  )
}
