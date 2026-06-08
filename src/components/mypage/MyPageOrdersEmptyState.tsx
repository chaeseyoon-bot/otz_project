import { figmaAsset } from '../../lib/figmaAssetUrl'

const iconAlertNothing = figmaAsset('icons/alert-nothing.svg')

/** Figma 4891:3691 — PC my page orders empty state. */
export function MyPageOrdersEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center border-b border-light2 bg-white py-[120px]">
      <div className="flex flex-col items-center gap-4 pb-7 text-center">
        <img src={iconAlertNothing} alt="" aria-hidden className="size-14 shrink-0" draggable={false} />
        <p className="m-0 text-bodyMedium1 text-dark">주문 내역이 없습니다.</p>
      </div>
    </div>
  )
}
