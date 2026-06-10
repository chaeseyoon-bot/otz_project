import type { ArchiveLookbookDetail } from '../../data/archiveLookbookDetails'
import { ICONS } from '../../constants/icons'
import { navigateSpa } from '../../lib/spaNavigation'

const iconPlus = ICONS.common.plus

export interface ArchivePcDetailContentProps {
  detail: ArchiveLookbookDetail
}

/** Figma 2679:10518 — PC ARCHIVE editorial detail within 1400px content. */
export function ArchivePcDetailContent({ detail }: ArchivePcDetailContentProps) {
  return (
    <div className="mx-auto w-full max-w-[1400px] py-[60px]">
      <div className="flex w-full flex-col items-center gap-2">
        <h1 className="m-0 text-center text-[34px] font-extrabold leading-[1.2] tracking-[-0.02em] text-dark">
          ARCHIVE
        </h1>

        <div className="flex w-full items-center gap-5">
          <p className="m-0 flex-1 text-[22px] font-bold leading-[1.2] tracking-[-0.02em] text-dark">
            {detail.title}
          </p>
          <button
            type="button"
            className="flex shrink-0 items-center gap-1.5 border-0 bg-transparent p-0 pl-[15px] text-[16px] font-medium leading-[1.4] tracking-[-0.04em] text-dark hover:opacity-80"
            onClick={() => navigateSpa('/archive')}
          >
            리스트가기
            <img src={iconPlus} alt="" className="size-[22px] shrink-0" draggable={false} aria-hidden />
          </button>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 pt-5">
        {detail.pcBlocks.map((block, index) => {
          if (block.type === 'full') {
            return (
              <div key={`full-${index}`} className="w-full overflow-hidden">
                <img
                  src={block.image.src}
                  alt={block.image.alt ?? ''}
                  className="block h-auto w-full"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  draggable={false}
                />
              </div>
            )
          }

          return (
            <div key={`split-${index}`} className="flex w-full gap-2">
              {[block.left, block.right].map((image, sideIndex) => (
                <div key={`${image.src}-${sideIndex}`} className="min-w-0 flex-1 overflow-hidden">
                  <img
                    src={image.src}
                    alt={image.alt ?? ''}
                    className="block h-auto w-full"
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
