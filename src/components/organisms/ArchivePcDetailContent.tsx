import type { ArchiveLookbookDetail, ArchivePcDetailBlock } from '../../data/archiveLookbookDetails'
import { ICONS } from '../../constants/icons'
import { navigateSpa } from '../../lib/spaNavigation'
import { ArchiveDetailIntroText } from '../molecules/ArchiveDetailIntroText'

const iconPlus = ICONS.common.plus

export interface ArchivePcDetailContentProps {
  detail: ArchiveLookbookDetail
}

function DetailImage({ image, className = '' }: { image: { src: string; alt?: string }; className?: string }) {
  return (
    <img
      src={image.src}
      alt={image.alt ?? ''}
      className={`block h-auto w-full object-cover ${className}`}
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  )
}

function renderPcBlock(block: ArchivePcDetailBlock, index: number, intro: ArchiveLookbookDetail['intro']) {
  if (block.type === 'full') {
    return (
      <div className="flex w-full justify-center py-16">
        <div className="w-full max-w-[830px] overflow-hidden">
          <DetailImage image={block.image} className={index === 0 ? '' : ''} />
        </div>
      </div>
    )
  }

  if (block.type === 'intro-split') {
    return (
      <div className="flex w-full items-center gap-2.5 py-16">
        <div className="w-[700px] shrink-0 overflow-hidden">
          <DetailImage image={block.image} />
        </div>
        {intro ? (
          <ArchiveDetailIntroText intro={intro} variant="split-right" className="min-w-0 flex-1 px-[30px]" />
        ) : null}
      </div>
    )
  }

  if (block.type === 'asymmetric-small-left') {
    return (
      <div className="flex w-full items-center gap-10 py-16">
        <div className="flex h-[660px] w-[658px] shrink-0 items-center justify-center p-[50px]">
          <div className="h-full w-[440px] overflow-hidden">
            <DetailImage image={block.small} />
          </div>
        </div>
        <div className="min-w-0 flex-1 overflow-hidden">
          <DetailImage image={block.large} />
        </div>
      </div>
    )
  }

  if (block.type === 'asymmetric-small-right') {
    return (
      <div className="flex w-full items-center justify-between gap-10 py-16">
        <div className="min-w-0 flex-1 overflow-hidden">
          <DetailImage image={block.large} />
        </div>
        <div className="flex h-[660px] w-[658px] shrink-0 items-center justify-center p-[50px]">
          <div className="h-full w-[440px] overflow-hidden">
            <DetailImage image={block.small} />
          </div>
        </div>
      </div>
    )
  }

  if (block.type === 'triple') {
    return (
      <div className="flex w-full gap-2 py-16">
        {[block.left, block.center, block.right].map((image, sideIndex) => (
          <div key={`${image.src}-${sideIndex}`} className="min-w-0 flex-1 overflow-hidden">
            <DetailImage image={image} />
          </div>
        ))}
      </div>
    )
  }

  if (block.type === 'split') {
    return (
      <div className="flex w-full gap-2 py-16">
        {[block.left, block.right].map((image, sideIndex) => (
          <div key={`${image.src}-${sideIndex}`} className="min-w-0 flex-1 overflow-hidden">
            <DetailImage image={image} />
          </div>
        ))}
      </div>
    )
  }

  return null
}

/** Figma 141-3059 / 2679:10518 — PC ARCHIVE editorial detail within 1400px content. */
export function ArchivePcDetailContent({ detail }: ArchivePcDetailContentProps) {
  const intro = detail.intro
  const showIntro = Boolean(intro && (intro.heading.trim() || intro.body.trim()))
  const hasIntroSplitRow = detail.pcBlocks.some((block) => block.type === 'intro-split')

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

      <div className="flex w-full flex-col pt-5">
        {detail.pcBlocks.map((block, index) => (
          <div key={`pc-block-${index}`} className="flex w-full flex-col">
            {renderPcBlock(block, index, intro)}
            {index === 0 && showIntro && !hasIntroSplitRow && intro ? (
              <ArchiveDetailIntroText intro={intro} className="py-16" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
