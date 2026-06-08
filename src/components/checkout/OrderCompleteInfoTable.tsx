import type { ReactNode } from 'react'

export interface OrderCompleteInfoRow {
  label: string
  value: ReactNode
}

/** Figma 70:4289 — label/value table rows for shipping & payment sections. */
export function OrderCompleteInfoTable({ rows }: { rows: OrderCompleteInfoRow[] }) {
  return (
    <div className="flex w-full flex-col">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center border-b border-lightGray">
          <div className="flex w-[88px] shrink-0 items-center py-4">
            <span className="text-bodyRegular2 text-textDefault">{row.label}</span>
          </div>
          <div className="min-w-0 flex-1 p-4 text-bodyRegular2 text-dark">{row.value}</div>
        </div>
      ))}
    </div>
  )
}
