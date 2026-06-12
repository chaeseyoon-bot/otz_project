import type { EditorialEventItem } from '../../data/editorialEvents'
import { getEditorialDetailPath } from '../../lib/editorialRoutes'
import { navigateSpa } from '../../lib/spaNavigation'

export interface EditorialEventCardProps {
  event: EditorialEventItem
  className?: string
  onClick?: () => void
}

/** Figma 2629:54151 (MO) / 2629:52689 (PC) — thumbnail + title + period below image. */
export function EditorialEventCard({ event, className = '', onClick }: EditorialEventCardProps) {
  const handleClick = onClick ?? (() => navigateSpa(getEditorialDetailPath(event.id)))

  return (
    <button
      type="button"
      className={`block w-full cursor-pointer border-0 bg-transparent p-0 text-left ${className}`}
      onClick={handleClick}
    >
      <div className="relative aspect-[272/340] w-full overflow-hidden bg-light">
        <img
          src={event.thumbnail}
          alt=""
          className="absolute inset-0 size-full object-cover"
          loading="lazy"
          decoding="async"
          draggable={false}
        />
        <div className="absolute left-0 top-0 bg-[rgba(0,0,0,0.8)] px-[10px] py-[7px]">
          <span className="text-[10px] font-semibold leading-[1.1] text-white">{event.categoryLabel}</span>
        </div>
      </div>

      <div className="pr-1.5">
        <p className="m-0 pt-3 text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-dark lg:text-[15px]">
          {event.title}
        </p>
        <p className="m-0 pt-1.5 text-[11px] font-normal leading-[1.2] tracking-[-0.04em] text-[#999999] lg:pt-1 lg:text-[14px] lg:leading-[1.4] lg:tracking-[-0.02em]">
          {event.period}
        </p>
      </div>
    </button>
  )
}
