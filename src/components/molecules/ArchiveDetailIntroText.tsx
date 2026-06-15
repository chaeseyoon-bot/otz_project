import type { ArchiveDetailIntro } from '../../data/archiveLookbookDetails'

export interface ArchiveDetailIntroTextProps {
  intro: ArchiveDetailIntro
  className?: string
}

/** Figma 131:3486 — intro below the first archive detail image row. */
export function ArchiveDetailIntroText({ intro, className = '' }: ArchiveDetailIntroTextProps) {
  const heading = intro.heading.trim()
  const body = intro.body.trim()
  if (!heading && !body) return null

  return (
    <div
      className={`flex w-full flex-col items-center gap-2.5 text-center text-dark ${className}`}
    >
      {heading ? (
        <p className="m-0 text-[18px] font-bold leading-normal tracking-[-0.02em] lg:text-[24px]">
          {heading}
        </p>
      ) : null}
      {body ? (
        <p className="m-0 max-w-[870px] whitespace-pre-line text-[13px] font-normal leading-normal tracking-[-0.02em] lg:text-[14px]">
          {body}
        </p>
      ) : null}
    </div>
  )
}
