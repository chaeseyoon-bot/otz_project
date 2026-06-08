import { figmaAsset } from '../../lib/figmaAssetUrl'

const iconAlertNothing = figmaAsset('icons/alert-nothing.svg')

/** Figma 2978:14815 — no search results message. */
export function SearchResultsEmptyState() {
  return (
    <div className="mx-[15px] flex flex-col items-center justify-center border-b border-light2 bg-white py-12 lg:mx-0 lg:py-[120px]">
      <div className="flex flex-col items-center gap-4 pb-7 text-center">
        <img src={iconAlertNothing} alt="" aria-hidden className="size-14 shrink-0" draggable={false} />
        <div className="flex flex-col gap-1">
          <p className="m-0 text-bodyMedium1 text-dark">검색된 상품이 없습니다.</p>
          <p className="m-0 text-bodyRegular2 text-subtleText">다른 키워드로 검색해 보세요.</p>
        </div>
      </div>
    </div>
  )
}

