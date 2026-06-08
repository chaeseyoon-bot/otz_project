import type { ReactNode } from 'react'
import { figmaAsset } from '../../lib/figmaAssetUrl'

const iconChevron = figmaAsset('icons/list_chevron.svg')

export interface CheckoutCollapsibleSectionProps {
  title: string
  expanded: boolean
  onToggle: () => void
  trailing?: ReactNode
  children?: ReactNode
  className?: string
}

/** Section header with dark underline + optional trailing + collapsible body. */
export function CheckoutCollapsibleSection({
  title,
  expanded,
  onToggle,
  trailing,
  children,
  className = '',
}: CheckoutCollapsibleSectionProps) {
  const gapClass = /\bgap-/.test(className) ? '' : 'gap-6'

  return (
    <section className={`flex w-full flex-col ${gapClass} ${className}`.trim()}>
      <div className="flex w-full items-center justify-between border-b border-dark pb-4">
        <h2 className="m-0 text-bodyMedium1 font-bold text-dark">{title}</h2>
        <div className="flex items-center gap-2">
          {trailing}
          <button
            type="button"
            className="flex size-5 items-center justify-center border-0 bg-transparent p-0"
            aria-expanded={expanded}
            aria-label={expanded ? `${title} 접기` : `${title} 펼치기`}
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
      </div>
      {expanded ? children : null}
    </section>
  )
}

export interface CheckoutExpandableRowProps {
  label: string
  amount: string
  expanded: boolean
  onToggle: () => void
  children?: ReactNode
}

/** Nested payment summary row with chevron toggle. */
export function CheckoutExpandableRow({
  label,
  amount,
  expanded,
  onToggle,
  children,
}: CheckoutExpandableRowProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-1 border-0 bg-transparent p-0 text-bodyRegular1 text-dark"
          aria-expanded={expanded}
          onClick={onToggle}
        >
          <span>{label}</span>
          <img
            src={iconChevron}
            alt=""
            aria-hidden
            className={`size-4 object-contain transition-transform duration-200 ${expanded ? '' : '-rotate-90'}`}
            draggable={false}
          />
        </button>
        <span className="text-bodyRegular1 text-dark">{amount}</span>
      </div>
      {expanded ? <div className="flex flex-col gap-2">{children}</div> : null}
    </div>
  )
}

export function CheckoutSubRow({ label, amount }: { label: string; amount: string }) {
  return (
    <div className="flex items-center justify-between text-bodySmall text-textDefault">
      <span>{label}</span>
      <span>{amount}</span>
    </div>
  )
}
