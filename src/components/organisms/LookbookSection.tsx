import { useLookbookSectionContent } from '../../hooks/useLookbookSectionContent'
import { navigateSpa } from '../../lib/spaNavigation'

/** Figma 2601:23531 — link chevron 6×12 */
function ArchiveLinkChevron({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={6}
      height={12}
      viewBox="0 0 6 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M1.25 2.75L4.25 6L1.25 9.25"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

interface LookbookCopyBlockProps {
  titleLines: string[]
  bodyLines: string[]
  tags: string[]
  ctaLabel: string
  linkHref: string
  gapClassName?: string
}

function LookbookCopyBlock({
  titleLines,
  bodyLines,
  tags,
  ctaLabel,
  linkHref,
  gapClassName = 'gap-6',
}: LookbookCopyBlockProps) {
  const href = linkHref || '/archive'

  return (
    <div className={`flex flex-col ${gapClassName}`}>
      <div className="flex flex-col gap-3">
        <h2 className="m-0 text-[34px] font-extrabold leading-[1.2] tracking-[-0.02em] text-dark">
          {titleLines.map((line, index) => (
            <span key={index} className="block">
              {line}
            </span>
          ))}
        </h2>
        <div className="text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault">
          {bodyLines.map((line, index) => (
            <p key={index} className="m-0">
              {line}
            </p>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center justify-center rounded-full border border-[#999] px-[15px] pb-[7px] pt-[6px] text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <a
        href={href}
        className="inline-flex items-center gap-1.5 text-link2 text-textDefault underline decoration-solid underline-offset-2 hover:text-dark"
        onClick={(event) => {
          event.preventDefault()
          navigateSpa(href)
        }}
      >
        <span>{ctaLabel}</span>
        <span className="flex h-3 w-1.5 shrink-0 items-center justify-center" aria-hidden>
          <ArchiveLinkChevron className="block h-3 w-1.5 shrink-0" />
        </span>
      </a>
    </div>
  )
}

export function LookbookSection() {
  const content = useLookbookSectionContent()
  const mobileTitle = content.titleLines.join(' ') || content.title.replace(/\n/g, ' ')
  const mobileImages = content.mobileImageUrls

  return (
    <section className="w-full">
      {/* Mobile — 203 + 140×2 mosaic */}
      <div className="bg-white px-[15px] pb-10 pt-10 lg:hidden">
        <div className="grid h-[352px] grid-cols-[203px_140px] gap-[2px]">
          <div className="relative h-[352px] w-[203px] overflow-hidden bg-light">
            <img
              src={mobileImages[0]}
              alt=""
              className="absolute inset-0 size-full object-cover"
              draggable={false}
            />
          </div>
          <div className="grid grid-rows-2 gap-[2px]">
            <div className="relative h-[175px] w-[140px] overflow-hidden bg-light">
              <img
                src={mobileImages[1]}
                alt=""
                className="absolute inset-0 size-full object-cover"
                draggable={false}
              />
            </div>
            <div className="relative h-[175px] w-[140px] overflow-hidden bg-light">
              <img
                src={mobileImages[2]}
                alt=""
                className="absolute inset-0 size-full object-cover"
                draggable={false}
              />
            </div>
          </div>
        </div>
        <div className="pt-[10px]">
          <h3 className="text-h4 text-black">{mobileTitle}</h3>
          <p className="pt-1 text-bodySmall text-subtleText">{content.body}</p>
        </div>
        <div className="flex gap-[6px] pt-[10px]">
          {content.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-[100px] border border-[#e1e1e1] px-3 pb-[6px] pt-[5px] text-[12px] leading-none text-[#777]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* PC — Figma 2601:23511 ARCHIVE */}
      <div className="hidden w-full bg-light py-[64px] lg:block">
        <div className="mx-auto min-w-0 max-w-[1400px]">
          <div className="flex w-full min-w-0 items-start gap-[75px]">
            <div className="flex w-[300px] shrink-0 flex-col gap-5 pt-5">
              <div className="shrink-0">
                <span className="inline-flex rounded-full bg-black px-3 py-1.5 text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-white">
                  {content.badge}
                </span>
              </div>
              <LookbookCopyBlock
                titleLines={content.titleLines}
                bodyLines={content.bodyLines}
                tags={content.tags}
                ctaLabel={content.mobileCtaLabel}
                linkHref={content.linkHref}
                gapClassName="gap-[30px]"
              />
            </div>

            <div className="flex min-h-0 min-w-0 flex-1 items-stretch justify-end">
              <div className="relative h-[512px] w-[410px] shrink-0 overflow-hidden bg-light">
                <img
                  src={content.pcHeroImage}
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                  draggable={false}
                />
              </div>
              <div className="grid w-[615px] shrink-0 grid-cols-3 grid-rows-2 gap-0">
                {content.pcGridImages.map((src, index) => (
                  <div key={`archive-${index}`} className="relative h-[256px] w-[205px] overflow-hidden bg-light">
                    <img
                      src={src}
                      alt=""
                      className="absolute inset-0 size-full object-cover"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
