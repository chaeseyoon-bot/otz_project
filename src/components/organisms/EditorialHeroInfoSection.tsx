import { useState } from 'react'
import type { EditorialCouponItem, EditorialHeroInfo } from '../../data/editorialEventDetails'

export interface EditorialHeroInfoSectionProps {
  heroInfo: EditorialHeroInfo
  /** Figma 143:5626 — catalog/collabo PC detail layout */
  variant?: 'default' | 'catalog-pc'
}

function parsePeriodLines(period: string): { start: string; end: string } | null {
  const trimmed = period.trim()
  if (!trimmed) return null

  const dashIndex = trimmed.indexOf(' - ')
  if (dashIndex === -1) {
    const lines = trimmed.split('\n').map((line) => line.trim()).filter(Boolean)
    if (lines.length >= 2) {
      return { start: lines[0], end: lines.slice(1).join(' ').replace(/^-/, '') }
    }
    return { start: trimmed, end: '' }
  }

  return {
    start: trimmed.slice(0, dashIndex).trim(),
    end: trimmed.slice(dashIndex + 3).trim(),
  }
}

function HeroInfoPeriod({ period, catalogPc }: { period: string; catalogPc?: boolean }) {
  const parsed = parsePeriodLines(period)
  if (!parsed) return null

  if (catalogPc) {
    return (
      <div className="w-[240px] shrink-0 text-[20px] font-normal leading-[1.2] tracking-[-0.02em] text-dark">
        <p className="m-0">{parsed.start}</p>
        {parsed.end ? <p className="m-0">-{parsed.end}</p> : null}
      </div>
    )
  }

  return (
    <div className="text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-dark lg:text-[14px]">
      <p className="m-0 whitespace-nowrap">{parsed.start}</p>
      {parsed.end ? <p className="m-0 whitespace-nowrap">-{parsed.end}</p> : null}
    </div>
  )
}

function HeroInfoSubtitle({ subtitle, catalogPc }: { subtitle: string; catalogPc?: boolean }) {
  const lines = subtitle.split('\n').map((line) => line.trim()).filter(Boolean)
  if (!lines.length) return null

  if (catalogPc) {
    return (
      <p className="m-0 whitespace-pre-wrap text-[16px] font-normal leading-[1.4] tracking-[-0.04em] text-dark">
        {subtitle}
      </p>
    )
  }

  return (
    <div className="text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault lg:text-[14px] lg:leading-[1.65]">
      {lines.map((line, index) => (
        <p
          key={`${line}-${index}`}
          className={`m-0 mb-0 last:mb-0 [word-break:break-word] ${index === 0 ? 'font-bold text-dark' : ''}`}
        >
          {line}
        </p>
      ))}
    </div>
  )
}

function HeroInfoCouponTicket({ coupon, catalogPc }: { coupon: EditorialCouponItem; catalogPc?: boolean }) {
  if (catalogPc) {
    return (
      <div
        className="relative h-[200px] w-full max-w-[420px] shrink-0 bg-black text-white"
        style={{
          clipPath:
            'polygon(0 0, 100% 0, 100% calc(50% - 12px), calc(100% - 14px) 50%, 100% calc(50% + 12px), 100% 100%, 0 100%)',
        }}
      >
        <div className="flex h-full items-center justify-between p-[30px]">
          <div className="flex h-full flex-col items-start justify-between">
            {coupon.label ? (
              <p className="m-0 text-[20px] font-medium leading-[1.4] tracking-[-0.04em]">{coupon.label}</p>
            ) : (
              <span />
            )}
            <div className="flex items-end leading-none">
              <span className="text-[80px] font-extrabold leading-[80px] tracking-[-0.02em]">{coupon.value}</span>
              <span className="flex h-[80px] w-[70px] flex-col justify-end text-[52px] font-extrabold leading-none tracking-[-0.02em]">
                {coupon.unit}
              </span>
            </div>
          </div>
          {coupon.conditions[0] ? (
            <p className="m-0 self-end text-[18px] font-medium leading-[1.4] tracking-[-0.04em] text-subtleText">
              {coupon.conditions[0]}
            </p>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-[300px] overflow-hidden bg-black text-white lg:max-w-[340px]">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-[repeating-linear-gradient(90deg,transparent,transparent_3px,#fff_3px,#fff_5px)] opacity-20"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-3 bg-[repeating-linear-gradient(90deg,transparent,transparent_3px,#fff_3px,#fff_5px)] opacity-20"
        aria-hidden
      />
      <div className="flex min-h-[88px] flex-col justify-center px-5 py-4 lg:min-h-[96px] lg:px-6">
        {coupon.label ? (
          <p className="m-0 text-[11px] font-normal leading-[1.4] text-white/80 lg:text-[12px]">{coupon.label}</p>
        ) : null}
        <div className="mt-1 flex items-end leading-none">
          <span className="text-[36px] font-extrabold tracking-[-0.02em] lg:text-[42px]">{coupon.value}</span>
          <span className="mb-1 text-[22px] font-extrabold lg:text-[26px]">{coupon.unit}</span>
        </div>
        {coupon.conditions[0] ? (
          <p className="m-0 mt-2 text-[10px] font-normal leading-[1.4] text-white/50 lg:text-[11px]">
            {coupon.conditions[0]}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function HeroInfoCouponNotesList({ notes, catalogPc }: { notes: string[]; catalogPc?: boolean }) {
  return (
    <ul className={`m-0 flex list-none flex-col p-0 ${catalogPc ? 'gap-2' : 'gap-1.5'}`}>
      {notes.map((note, index) => (
        <li key={index} className={`flex items-start ${catalogPc ? 'gap-2' : 'gap-1'}`}>
          <span
            className={`block shrink-0 bg-subtleText ${catalogPc ? 'mt-[9px] size-[2px]' : 'mt-[7px] size-[2px]'}`}
            aria-hidden
          />
          <p
            className={`m-0 flex-1 text-textDefault ${
              catalogPc
                ? 'text-[14px] font-normal leading-[1.4] tracking-[-0.04em]'
                : 'text-[12px] leading-[1.4] tracking-[-0.04em]'
            }`}
          >
            {note}
          </p>
        </li>
      ))}
    </ul>
  )
}

function HeroInfoCouponBlock({
  coupon,
  couponSectionEyebrow,
  couponSectionTitle,
  couponNotes,
  catalogPc,
}: {
  coupon: EditorialCouponItem
  couponSectionEyebrow: string
  couponSectionTitle: string
  couponNotes: string[]
  catalogPc?: boolean
}) {
  const [notesOpen, setNotesOpen] = useState(false)
  const eyebrow = couponSectionEyebrow.trim()
  const sectionTitle = couponSectionTitle.trim()

  return (
    <div className={`flex w-full flex-col ${catalogPc ? 'gap-4' : 'gap-3 lg:gap-4'}`}>
      {eyebrow || sectionTitle ? (
        <div className={catalogPc ? 'flex flex-col gap-2' : undefined}>
          {eyebrow ? (
            <p
              className={`m-0 font-semibold leading-[1.4] tracking-[-0.04em] text-dark ${
                catalogPc ? 'text-[24px]' : 'text-[15px] font-extrabold leading-[1.2] tracking-[-0.02em] lg:text-[18px]'
              }`}
            >
              {eyebrow}
            </p>
          ) : null}
          {sectionTitle ? (
            <p
              className={`m-0 font-normal leading-[1.4] tracking-[-0.04em] text-textDefault ${
                catalogPc ? 'text-[16px] text-dark' : 'mt-1 text-[13px] tracking-[-0.02em] lg:text-[14px]'
              }`}
            >
              {sectionTitle}
            </p>
          ) : null}
        </div>
      ) : null}
      <HeroInfoCouponTicket coupon={coupon} catalogPc={catalogPc} />
      {couponNotes.length > 0 ? (
        <>
          <button
            type="button"
            aria-expanded={notesOpen}
            onClick={() => setNotesOpen((open) => !open)}
            className={
              catalogPc
                ? 'w-fit border-0 bg-transparent p-0 text-[16px] font-normal leading-[1.4] tracking-[-0.04em] text-dark underline underline-offset-2'
                : 'w-fit border-0 bg-transparent p-0 text-[12px] font-normal leading-[1.4] tracking-[-0.02em] text-subtleText underline underline-offset-2'
            }
          >
            {notesOpen ? '유의사항 닫기' : '유의사항 보기'}
          </button>
          {notesOpen ? <HeroInfoCouponNotesList notes={couponNotes} catalogPc={catalogPc} /> : null}
        </>
      ) : null}
    </div>
  )
}

function CatalogPcHeroInfo({ heroInfo }: { heroInfo: EditorialHeroInfo }) {
  const showPeriod = heroInfo.showPeriod && heroInfo.period.trim().length > 0
  const coupon = heroInfo.coupon
  const showCoupon = coupon != null && heroInfo.showCoupon !== false
  const title = heroInfo.title.trim()
  const subtitle = heroInfo.subtitle.trim()

  if (!title && !subtitle && !showPeriod && !showCoupon) return null

  return (
    <section className="mx-auto w-full max-w-[1400px] bg-white">
      <div className="mx-auto flex w-full max-w-[1400px] items-start border-b border-dark px-10 pb-16 pt-0">
        {showPeriod ? <HeroInfoPeriod period={heroInfo.period} catalogPc /> : <div className="w-[240px] shrink-0" />}

        <div className="flex min-w-0 flex-1 items-start">
          {title ? (
            <div className="min-w-0 flex-1 pr-6">
              <h1 className="m-0 whitespace-pre-line text-[34px] font-bold leading-[1.4] tracking-[-0.04em] text-dark">
                {title}
              </h1>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {subtitle || showCoupon ? (
            <div className="flex min-w-0 flex-1 flex-col gap-10">
              {subtitle ? <HeroInfoSubtitle subtitle={subtitle} catalogPc /> : null}
              {showCoupon ? (
                <HeroInfoCouponBlock
                  coupon={coupon}
                  couponSectionEyebrow={heroInfo.couponSectionEyebrow}
                  couponSectionTitle={heroInfo.couponSectionTitle}
                  couponNotes={heroInfo.couponNotes}
                  catalogPc
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/** Figma hero info — date / title / subtitle + coupon below main banner. */
export function EditorialHeroInfoSection({ heroInfo, variant = 'default' }: EditorialHeroInfoSectionProps) {
  if (variant === 'catalog-pc') {
    return <CatalogPcHeroInfo heroInfo={heroInfo} />
  }

  const showPeriod = heroInfo.showPeriod && heroInfo.period.trim().length > 0
  const showCoupon = heroInfo.showCoupon && heroInfo.coupon != null
  const title = heroInfo.title.trim()
  const subtitle = heroInfo.subtitle.trim()

  if (!title && !subtitle && !showPeriod && !showCoupon) return null

  return (
    <section className="w-full bg-white">
      <div className="mx-auto w-full max-w-[1400px] px-[15px] py-10 lg:px-10 lg:py-[60px]">
        <div
          className={`flex flex-col gap-8 lg:items-start lg:gap-x-10 xl:gap-x-16 ${
            showPeriod
              ? 'lg:grid lg:grid-cols-[minmax(0,120px)_minmax(0,1fr)_minmax(0,1.15fr)]'
              : 'lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]'
          }`}
        >
          {showPeriod ? (
            <div className="order-1 lg:order-none lg:pt-1">
              <HeroInfoPeriod period={heroInfo.period} />
            </div>
          ) : null}

          {title ? (
            <div className="order-2">
              <h1 className="m-0 whitespace-pre-line text-[28px] font-extrabold leading-[1.15] tracking-[-0.02em] text-dark lg:text-[40px] lg:leading-[1.2] xl:text-[48px]">
                {title}
              </h1>
            </div>
          ) : null}

          {subtitle || showCoupon ? (
            <div className={`order-3 flex flex-col gap-8 lg:gap-10 ${!title && showPeriod ? 'lg:col-start-2 lg:col-span-2' : ''}`}>
              {subtitle ? <HeroInfoSubtitle subtitle={subtitle} /> : null}
              {showCoupon && heroInfo.coupon ? (
                <HeroInfoCouponBlock
                  coupon={heroInfo.coupon}
                  couponSectionEyebrow={heroInfo.couponSectionEyebrow}
                  couponSectionTitle={heroInfo.couponSectionTitle}
                  couponNotes={heroInfo.couponNotes}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
