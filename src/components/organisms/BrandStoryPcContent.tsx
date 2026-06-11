import type { MouseEvent } from 'react'
import {
  BRAND_STORY_LINEUP,
  BRAND_STORY_PAGE_COPY,
  DEFAULT_BANNER_IMAGE_CLASS,
  type BrandStoryLineupItem,
} from '../../data/brandStoryContent'
import { ICONS } from '../../constants/icons'
import { navigateBrandSeriesHref } from '../../lib/categoryRoutes'

function BrandStoryProductGrid({
  thumbs,
  layout = 'standard',
}: {
  thumbs: string[]
  layout?: 'standard' | 'topi'
}) {
  if (layout === 'topi') {
    const [first, ...rest] = thumbs
    return (
      <div className="flex w-full flex-col">
        <div className="flex h-[170px] w-full">
          <div className="relative min-w-0 flex-1">
            {first ? (
              <img
                src={first}
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
        <div className="flex h-[170px] w-full">
          {rest.slice(0, 3).map((src, index) => (
            <div key={`${src}-${index}`} className="relative min-w-0 flex-1">
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
      </div>
    )
  }

  const rows = [
    thumbs.slice(0, 3),
    thumbs.slice(3, 6),
    thumbs.slice(6, 9),
  ].filter((row) => row.length > 0)

  return (
    <div className="flex w-full flex-col">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex h-[170px] w-full">
          {row.map((src, index) => (
            <div key={`${src}-${index}`} className="relative min-w-0 flex-1">
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

function BrandStoryBannerCta({
  label,
  href,
}: {
  label: string
  href: string
}) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    navigateBrandSeriesHref(href)
  }

  return (
    <a
      href={href}
      onClick={onClick}
      className="border-b border-white text-[14px] font-normal leading-[1.4] tracking-[-0.02em] text-white hover:opacity-80"
    >
      {label}
    </a>
  )
}

function BrandStoryLineupBlock({ item }: { item: BrandStoryLineupItem }) {
  const isImageLeft = item.imagePosition === 'left'
  const headerAlignClass =
    item.headerAlign === 'right' ? 'items-end text-right' : 'items-start text-left'
  const bannerTextAlignClass =
    item.bannerTextAlign === 'left' ? 'items-start' : 'items-center'
  const productHeaderClass =
    item.productHeaderClass ?? `flex min-h-0 flex-1 flex-col ${headerAlignClass}`
  const productGridLayout = item.productGridLayout ?? 'standard'
  const showBannerDimOverlay = item.bannerDimOverlay !== false

  const bannerPanel = (
    <div className="relative h-[856px] w-[690px] shrink-0 overflow-hidden rounded-[40px]">
      {item.bannerImageSecondary ? (
        <img
          src={item.bannerImageSecondary}
          alt=""
          className={
            item.bannerImageSecondaryClass ??
            'absolute inset-0 size-full max-w-none rounded-[40px] object-cover'
          }
          loading="lazy"
          draggable={false}
        />
      ) : null}
      <img
        src={item.bannerImage}
        alt=""
        className={item.bannerImageClass ?? DEFAULT_BANNER_IMAGE_CLASS}
        loading="lazy"
        draggable={false}
      />
      {showBannerDimOverlay ? (
        <div className="pointer-events-none absolute inset-0 bg-black/20" aria-hidden />
      ) : null}
      <div
        className={`absolute bottom-0 left-0 right-0 flex flex-col justify-end gap-5 px-10 pb-[60px] pl-[50px] pr-[40px] text-white ${bannerTextAlignClass}`}
      >
        <h3 className="m-0 w-full text-[52px] font-extrabold leading-[1.2] tracking-[-0.02em]">
          {item.title}
        </h3>
        <p className="m-0 w-full whitespace-pre-line text-[18px] font-medium leading-[1.4] tracking-[-0.02em]">
          {item.body}
        </p>
        <div className="w-full">
          <BrandStoryBannerCta
            label={BRAND_STORY_PAGE_COPY.ctaLabel}
            href={item.ctaHref}
          />
        </div>
      </div>
    </div>
  )

  const productPanel = (
    <div className="flex h-[856px] w-[690px] shrink-0 flex-col">
      <div className={productHeaderClass}>
        <p className="m-0 whitespace-pre-line text-[72px] font-extrabold leading-[1.2] tracking-[-0.02em] text-light2">
          {item.headerText}
        </p>
      </div>
      <BrandStoryProductGrid
        thumbs={item.productThumbs}
        layout={productGridLayout}
      />
    </div>
  )

  return (
    <article className="flex flex-col items-center bg-white py-16">
      <div className="flex w-full items-center gap-5">
        {isImageLeft ? (
          <>
            {bannerPanel}
            {productPanel}
          </>
        ) : (
          <>
            {productPanel}
            {bannerPanel}
          </>
        )}
      </div>
    </article>
  )
}

/** Figma 2898:5238 — PC brand story content (1400px). */
export function BrandStoryPcContent() {
  const copy = BRAND_STORY_PAGE_COPY

  return (
    <div className="hidden lg:block">
      <div className="mx-auto w-full max-w-[1400px] px-0 pb-20 pt-10">
        <h1 className="m-0 text-center text-[34px] font-extrabold leading-[1.2] tracking-[-0.02em] text-dark">
          {copy.pageTitle}
        </h1>

        <section className="relative mt-5 w-full overflow-hidden rounded-[70px]">
          <img
            src={copy.heroImage}
            alt=""
            className="block w-full object-cover"
            style={{ aspectRatio: '1400 / 856' }}
            loading="eager"
            draggable={false}
          />
          <div
            className="pointer-events-none absolute inset-0 bg-black/20"
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <img
              src={ICONS.brand.otzLogo}
              alt="OTZ"
              className="h-auto w-[min(280px,20vw)] brightness-0 invert"
              draggable={false}
            />
          </div>
        </section>

        <section className="flex flex-col items-center gap-5 px-0 py-[128px] text-center">
          <p className="m-0 w-full text-[100px] font-extrabold leading-[1.2] tracking-[-0.02em] text-dark">
            {copy.introEyebrow}
          </p>
          <p className="m-0 max-w-[1400px] whitespace-pre-line text-[24px] font-medium leading-[1.4] tracking-[-0.04em] text-textDefault">
            {copy.introBody}
          </p>
        </section>

        <section className="flex items-start justify-between pl-[64px] pr-[56px]">
          <div className="flex w-[565px] shrink-0 flex-col gap-8">
            <div className="flex w-full flex-col gap-4">
              <h2 className="m-0 text-[34px] font-extrabold leading-[1.2] tracking-[-0.02em] text-dark">
                {copy.signatureTitle}
              </h2>
              <p className="m-0 w-[565px] text-[15px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault">
                {copy.signatureBody}
              </p>
            </div>
            <div className="relative h-[355px] w-[496px] shrink-0 overflow-hidden">
              <img
                src={copy.signatureImage}
                alt=""
                className="block h-full w-full object-cover border border-lightGray"
                loading="lazy"
                draggable={false}
              />
            </div>
          </div>

          <div className="relative h-[831px] w-[662px] shrink-0">
            <div className="absolute left-0 top-0 h-[692px] w-full p-5">
              <img
                src={copy.cushionImage}
                alt=""
                className="block h-full w-full object-contain"
                loading="lazy"
                draggable={false}
              />
            </div>
            <div className="absolute left-[-90px] top-[682px] flex flex-col items-end gap-4">
              <h2 className="m-0 whitespace-nowrap text-[34px] font-extrabold leading-[1.2] tracking-[-0.02em] text-dark">
                {copy.cushionTitle}
              </h2>
              <div className="flex flex-col items-end gap-2 text-right">
                <p className="m-0 text-[20px] font-semibold leading-[1.2] tracking-[-0.02em] text-dark">
                  {copy.cushionHighlight}
                </p>
                <p className="m-0 whitespace-pre-line text-[15px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault">
                  {copy.cushionBody}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center pt-32 pb-0">
          <h2 className="m-0 whitespace-pre-line text-[clamp(48px,6.3vw,88px)] font-extrabold leading-[1] tracking-[-0.02em] text-dark">
            {copy.lineupHeading}
          </h2>
        </section>

        <section className="flex flex-col gap-[128px]">
          {BRAND_STORY_LINEUP.map((item) => (
            <BrandStoryLineupBlock key={item.id} item={item} />
          ))}
        </section>
      </div>
    </div>
  )
}
