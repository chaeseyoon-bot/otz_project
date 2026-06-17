import type { ArchiveDetailIntro } from '../../data/archiveLookbookDetails'

export interface ArchiveDetailIntroTextProps {
  intro: ArchiveDetailIntro
  className?: string
  /** Figma 141-3079 — intro beside image on PC. */
  variant?: 'center' | 'split-right'
}

/** Figma 131:3486 / 141-3079 — archive detail intro copy. */
export function ArchiveDetailIntroText({
  intro,
  className = '',
  variant = 'center',
}: ArchiveDetailIntroTextProps) {
  const heading = intro.heading.trim()
  const body = intro.body.trim()
  if (!heading && !body) return null

  const isSplit = variant === 'split-right'

  return (
    <div
      className={`flex w-full flex-col gap-6 text-dark ${
        isSplit ? 'items-end text-right' : 'items-center gap-2.5 text-center'
      } ${className}`}
    >
      {heading ? (
        <p
          className={`m-0 font-bold leading-normal tracking-[-0.02em] ${
            isSplit ? 'text-[28px]' : 'text-[18px] lg:text-[24px]'
          }`}
        >
          {heading}
        </p>
      ) : null}
      {body ? (
        <p
          className={`m-0 whitespace-pre-line font-normal leading-normal tracking-[-0.02em] ${
            isSplit ? 'max-w-[690px] text-[14px]' : 'max-w-[870px] text-[13px] lg:text-[14px]'
          }`}
        >
          {body}
        </p>
      ) : null}
    </div>
  )
}
