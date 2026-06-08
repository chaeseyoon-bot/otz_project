interface MobileSearchSectionHeaderProps {
  title: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

/** Figma 2689:5739 — mobile search section title row (14px title / 13px action). */
export function MobileSearchSectionHeader({
  title,
  actionLabel,
  onAction,
  className,
}: MobileSearchSectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between${className ? ` ${className}` : ''}`}>
      <h2 className="m-0 text-bodyRegular2 text-dark">{title}</h2>
      {actionLabel ? (
        <button
          type="button"
          className="border-0 bg-transparent p-0 text-bodySmall text-subtleText"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
