import { type RefObject } from 'react'
import { MobileHeaderBackButton } from '../atoms/MobileHeaderBackButton'
import { figmaAsset } from '../../lib/figmaAssetUrl'

const iconSearch = figmaAsset('icons/gnb_search.svg')

export const MOBILE_SEARCH_PLACEHOLDER = '검색어를 입력해 주세요'

export interface MobileSearchHeaderProps {
  query: string
  onQueryChange: (value: string) => void
  onCommitSearch: () => void
  onBack: () => void
  backAriaLabel: string
  placeholder?: string
  inputRef?: RefObject<HTMLInputElement | null>
  autoFocus?: boolean
  className?: string
}

/** Figma 3021:21798 — mobile search action bar (52px, px-12, gap-5, light2 divider). */
export function MobileSearchHeader({
  query,
  onQueryChange,
  onCommitSearch,
  onBack,
  backAriaLabel,
  placeholder = MOBILE_SEARCH_PLACEHOLDER,
  inputRef,
  autoFocus,
  className = 'sticky top-0 z-30 shrink-0 bg-white',
}: MobileSearchHeaderProps) {
  return (
    <header className={className}>
      <div className="relative flex h-[52px] items-center gap-[5px] px-3">
        <MobileHeaderBackButton ariaLabel={backAriaLabel} onClick={onBack} />
        <div className="relative flex min-w-0 flex-1 items-center pl-1.5">
          <input
            ref={inputRef}
            type="search"
            enterKeyHint="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onCommitSearch()
              }
            }}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="w-full border-0 bg-transparent p-0 text-bodySmall text-dark outline-none placeholder:text-textDefault"
            aria-label="검색어 입력"
            autoComplete="off"
          />
        </div>
        <button
          type="button"
          className="flex size-6 shrink-0 items-center justify-center border-0 bg-transparent p-0"
          aria-label="검색 실행"
          onClick={onCommitSearch}
        >
          <img src={iconSearch} alt="" aria-hidden className="size-6 object-contain" draggable={false} />
        </button>
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 h-px w-[calc(100%-30px)] -translate-x-1/2 bg-light2"
          aria-hidden
        />
      </div>
    </header>
  )
}
