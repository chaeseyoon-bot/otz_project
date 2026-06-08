import type { OrderCompleteInfoRow } from './OrderCompleteInfoTable'

/** Figma 71:5511 — PC label/value table for shipping & payment sections. */
export function PcOrderCompleteInfoTable({ rows }: { rows: OrderCompleteInfoRow[] }) {
  return (
    <div className="flex w-full flex-col">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center border-b border-lightGray">
          <div className="flex w-[120px] shrink-0 items-center p-6">
            <span className="text-bodyRegular2 text-textDefault">{row.label}</span>
          </div>
          <div className="min-w-0 flex-1 p-4 text-bodyRegular2 text-dark">{row.value}</div>
        </div>
      ))}
    </div>
  )
}
