import type { MouseEvent } from 'react'
import {
  BRAND_STORY_LINEUP,
  BRAND_STORY_PAGE_COPY,
  type BrandStoryLineupItem,
} from '../../data/brandStoryContent'
import { ICONS } from '../../constants/icons'
import { navigateBrandSeriesHref } from '../../lib/categoryRoutes'

function BrandStoryMobileLineupCta({ label, href }: { label: string; href: string }) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    navigateBrandSeriesHref(href)
  }

  return (
    <a
      href={href}
      onClick={onClick}
      className="text-[14px] font-normal leading-[1.4] tracking-[-0.02em] text-white underline decoration-solid underline-offset-2 hover:opacity-80"
    >
      {label}
    </a>
  )
}

function BrandStoryMobileProductGrid({
  thumbs,
  layout = 'standard',
}: {
  thumbs: string[]
  layout?: 'standard' | 'topi'
}) {
  if (layout === 'topi') {
    const [first, second, third, fourth] = thumbs
    return (
      <div className="flex w-full flex-col">
        <div className="flex w-full">
          {[first, second, third].map((src, index) => (
            <div key={`topi-r1-${index}`} className="relative h-[85px] min-w-0 flex-1">
              {src ? (
                <img
                  src={src}
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                  loading="lazy"
                  draggable={false}
                />
              ) : null}
            </div>
          ))}
        </div>
        <div className="flex w-full">
          <div className="relative h-[85px] min-w-0 flex-1">
            {fourth ? (
              <img
                src={fourth}
                alt=""
                className="absolute inset-0 size-full object-cover"
                loading="lazy"
                draggable={false}
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1" aria-hidden />
          <div className="min-w-0 flex-1" aria-hidden />
        </div>
      </div>
    )
  }

  const rows = [
    thumbs.slice(0, 3),
    thumbs.slice(3, 6),
    thumbs.slice(6, 9),
  ]

  return (
    <div className="flex w-full flex-col">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex w-full">
          {row.map((src, index) => (
            <div key={`${src}-${index}`} className="relative h-[85px] min-w-0 flex-1">
              <img
                src={src}
                alt=""
                className="absolute inset-0 size-full object-cover"
                loading="lazy"
                draggable={false}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

/** First line + remaining copy for mobile lineup banner body (Figma 2966:4716). */
function getMobileLineupBodyLines(body: string): string[] {
  const lines = body.split('\n').map((line) => line.trim()).filter(Boolean)
  if (lines.length <= 1) return lines
  return [lines[0], lines.slice(1).join(' ')]
}

function BrandStoryMobileLineupBlock({ item }: { item: BrandStoryLineupItem }) {
  const bannerWidth = item.mobileBannerWidth ?? 345
  const bannerHeight = item.mobileBannerHeight ?? 428
  const showDimOverlay = item.mobileBannerDimOverlay !== false
  const bodyLines = getMobileLineupBodyLines(item.body)
  const productGridLayout = item.productGridLayout ?? 'standard'

  return (
    <article className="flex w-full flex-col items-center gap-2">
      <div
        className="relative shrink-0 overflow-hidden rounded-[20px]"
        style={{ width: bannerWidth, height: bannerHeight }}
      >
        <img
          src={item.bannerImage}
          alt=""
          className={
            item.mobileBannerImageClass ??
            'absolute inset-0 size-full object-cover'
          }
          loading="lazy"
          draggable={false}
        />
        {showDimOverlay ? (
          <div className="pointer-events-none absolute inset-0 bg-black/20" aria-hidden />
        ) : null}
        <div className="absolute inset-0 flex flex-col justify-end gap-4 px-5 pb-[30px] text-white [word-break:break-word]">
          <div className="flex w-full flex-col gap-2">
            <h3 className="m-0 text-[34px] font-extrabold leading-[1.2] tracking-[-0.02em]">
              {item.title}
            </h3>
            <div className="text-[13px] font-normal leading-[1.4] tracking-[-0.02em]">
              {bodyLines.map((line, index) => (
                <p key={index} className="m-0">
                  {line}
                </p>
              ))}
            </div>
          </div>
          <BrandStoryMobileLineupCta
            label={BRAND_STORY_PAGE_COPY.ctaLabel}
            href={item.ctaHref}
          />
        </div>
      </div>

      <div className="w-full">
        <BrandStoryMobileProductGrid
          thumbs={item.productThumbs}
          layout={productGridLayout}
        />
      </div>
    </article>
  )
}

/** Figma 2966:4657 — intro copy as two flowing paragraphs (no mid-paragraph breaks). */
function getMobileIntroParagraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\n/g, ' ').trim())
    .filter(Boolean)
}

/** Mobile body copy as a single flowing paragraph. */
function getMobileFlowingText(body: string): string {
  return body.replace(/\n/g, ' ').trim()
}

/** Figma 2898:6093 / 2966:4657 — mobile brand story (375px). */
export function BrandStoryMobileContent() {
  const copy = BRAND_STORY_PAGE_COPY
  const introParagraphs = getMobileIntroParagraphs(copy.introBody)

  return (
    <div className="lg:hidden">
      <section className="relative w-full overflow-hidden" style={{ aspectRatio: '375 / 340' }}>
        <img
          src={copy.heroImage}
          alt=""
          className="absolute inset-0 block h-full w-full object-cover"
          loading="eager"
          draggable={false}
        />
        <div className="pointer-events-none absolute inset-0 bg-black/20" aria-hidden />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <img
            src={ICONS.brand.otzLogo}
            alt="OTZ"
            className="h-[27px] w-[100px] brightness-0 invert"
            draggable={false}
          />
        </div>
      </section>

      <section className="flex flex-col items-center gap-5 px-[30px] pb-[40px] pt-[56px] text-center [word-break:break-word]">
        <p className="m-0 shrink-0 whitespace-nowrap text-[30px] font-extrabold leading-[1.2] tracking-[-0.02em] text-dark">
          {copy.introEyebrow}
        </p>
        <div className="flex w-full min-w-0 flex-col gap-5">
          {introParagraphs.map((paragraph, index) => (
            <p
              key={index}
              className="m-0 text-[14px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* Figma 2966:4688 — signature + cushion */}
      <section className="flex flex-col items-center bg-light pb-[56px] pt-10">
        <div className="flex w-full flex-col items-center gap-6 px-[30px] pb-10">
          <div className="flex w-full flex-col items-start gap-2 [word-break:break-word]">
            <h2 className="m-0 w-full text-[18px] font-bold leading-[1.4] tracking-[-0.02em] text-dark">
              {copy.signatureTitle}
            </h2>
            <p className="m-0 w-full text-[14px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault">
              {getMobileFlowingText(copy.signatureBody)}
            </p>
          </div>
          <div className="relative h-[225px] w-full max-w-[315px] overflow-hidden">
            <img
              src={copy.signatureImage}
              alt=""
              className="absolute left-0 top-0 h-[225px] w-[315px] max-w-none object-cover"
              loading="lazy"
              draggable={false}
            />
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-6 px-[30px]">
          <div className="flex w-full flex-col items-end gap-2 text-right [word-break:break-word]">
            <h2 className="m-0 w-full text-[18px] font-bold leading-[1.4] tracking-[-0.02em] text-dark">
              {copy.cushionTitle}
            </h2>
            <div className="flex w-full flex-col gap-2 text-right">
              <p className="m-0 w-full text-bodyMedium1 text-dark">
                {copy.cushionHighlight}
              </p>
              <p className="m-0 w-full text-[14px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault">
                {getMobileFlowingText(copy.cushionBody)}
              </p>
            </div>
          </div>
          <div className="flex h-[330px] w-full max-w-[315px] flex-col justify-end p-[10px]">
            <div className="relative aspect-[3001/3155] w-full shrink-0 overflow-hidden">
              <img
                src={copy.cushionImage}
                alt=""
                className="absolute left-0 top-0 size-full max-w-none object-contain"
                loading="lazy"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Figma 2966:4716 — lineup heading + collection */}
      <section className="flex flex-col items-center px-4 pb-[50px]">
        <div className="flex w-full flex-col items-center px-[14px] pb-4 pt-14 [word-break:break-word]">
          <h2 className="m-0 w-full text-[30px] font-extrabold leading-[1.2] tracking-[-0.02em] text-dark">
            {copy.lineupHeading.split('\n').map((line, index) => (
              <span key={index} className="block">
                {line}
              </span>
            ))}
          </h2>
        </div>
        <div className="flex w-full flex-col gap-6">
          {BRAND_STORY_LINEUP.map((item) => (
            <BrandStoryMobileLineupBlock key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  )
}
