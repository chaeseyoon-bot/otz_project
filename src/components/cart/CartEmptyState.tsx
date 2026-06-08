import { figmaAsset } from '../../lib/figmaAssetUrl'

const iconAlertSquare = figmaAsset('icons/alert-nothing.svg')

/** Figma 5049:9820 — mobile cart empty state. */
export function CartEmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 border-b border-light2 py-12">
      <img src={iconAlertSquare} alt="" aria-hidden className="size-14 shrink-0" draggable={false} />
      <p className="m-0 text-bodyMedium1 text-dark">장바구니가 비어 있습니다.</p>
    </div>
  )
}
