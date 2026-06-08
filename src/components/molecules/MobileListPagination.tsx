import { figmaAsset } from '../../lib/figmaAssetUrl'

const iconChevronLeft = figmaAsset('icons/chevron-left.svg')

export interface MobileListPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  ariaLabel?: string
  className?: string
}

/** Figma 2978:20399 — MO list pagination (prev / numbered pages / next). */
export function MobileListPagination({
  currentPage,
  totalPages,
  onPageChange,
  ariaLabel = '목록 페이지',
  className = '',
}: MobileListPaginationProps) {
  if (totalPages <= 0) return null

  return (
    <nav
      className={`flex items-center justify-center gap-4 ${className}`.trim()}
      aria-label={ariaLabel}
    >
      <button
        type="button"
        className="flex size-8 items-center justify-center border-0 bg-transparent p-0 disabled:opacity-30"
        aria-label="이전 페이지"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <img src={iconChevronLeft} alt="" aria-hidden className="size-8 object-contain" draggable={false} />
      </button>

      <div className="flex items-center gap-3">
        {Array.from({ length: totalPages }, (_, index) => {
          const page = index + 1
          const isActive = page === currentPage
          return (
            <button
              key={page}
              type="button"
              aria-label={`${page}페이지`}
              aria-current={isActive ? 'page' : undefined}
              className={`flex size-8 items-center justify-center rounded-full text-bodyBold3 ${
                isActive
                  ? 'border-0 bg-dark text-white'
                  : 'border border-lightGray bg-white text-subtleText'
              }`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        className="flex size-8 items-center justify-center border-0 bg-transparent p-0 disabled:opacity-30"
        aria-label="다음 페이지"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <img
          src={iconChevronLeft}
          alt=""
          aria-hidden
          className="size-8 rotate-180 object-contain"
          draggable={false}
        />
      </button>
    </nav>
  )
}
