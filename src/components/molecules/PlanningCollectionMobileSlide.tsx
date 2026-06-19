import { type KeyboardEvent } from 'react'
import { PLANNING_COLLECTION_PRODUCT_SLOTS } from '../../lib/adminHomeMainConfig'
import type { ResolvedPlanningCollectionProduct } from '../../lib/homeMainContentResolver'
import { navigateExternalOrSpa } from '../../lib/spaNavigation'
import { HomeProductDetailLink } from './HomeProductDetailLink'

/** Figma 2354:4592 — mobile planning collection card (335px wide). */
export const PLANNING_COLLECTION_CARD_WIDTH = 335
export const PLANNING_COLLECTION_BANNER_HEIGHT = 419

export interface PlanningCollectionMobileSlideProps {
  bannerImage: string | null
  tagLabel: string
  title: string
  linkHref?: string
  /** Registered products — 1–4 tiles at fixed 4-column size. */
  products?: ResolvedPlanningCollectionProduct[]
  /** @deprecated Use `products`. */
  productImages?: string[]
  emptyLabel?: string
}

export function PlanningCollectionMobileSlide({
  bannerImage,
  tagLabel,
  title,
  linkHref = '',
  products = [],
  productImages = [],
  emptyLabel = '이미지 없음',
}: PlanningCollectionMobileSlideProps) {
  const displayTag = tagLabel.trim() || 'COLLECTION'
  const displayTitle = title.trim() || '기획전 타이틀'
  const href = linkHref.trim()
  const hasLink = Boolean(href && href !== '#')
  const thumbs =
    products.length > 0
      ? products.slice(0, PLANNING_COLLECTION_PRODUCT_SLOTS)
      : productImages.slice(0, PLANNING_COLLECTION_PRODUCT_SLOTS).map((image) => ({
          productId: null,
          image,
          name: '',
          discount: '',
          price: '',
        }))

  return (
    <div className="w-full" data-figma-node="2354:4592">
      <div
        className={`relative h-[419px] overflow-hidden ${hasLink ? 'cursor-pointer' : ''}`}
        role={hasLink ? 'link' : undefined}
        tabIndex={hasLink ? 0 : undefined}
        aria-label={hasLink ? `${displayTitle} 기획전으로 이동` : undefined}
        onClick={hasLink ? () => navigateExternalOrSpa(href) : undefined}
        onKeyDown={
          hasLink
            ? (event: KeyboardEvent<HTMLDivElement>) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  navigateExternalOrSpa(href)
                }
              }
            : undefined
        }
      >
        {bannerImage ? (
          <img src={bannerImage} alt="" className="h-full w-full object-cover" draggable={false} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-light text-[13px] text-subtleText">
            {emptyLabel}
          </div>
        )}
        {bannerImage ? (
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent from-[47.5%] to-black/25 to-[83%]"
            aria-hidden
          />
        ) : null}
        <div className="absolute left-0 top-0 h-fit bg-black px-[10px] py-[6px]">
          <span className="text-[10px] font-semibold leading-[1.1] text-white">{displayTag}</span>
        </div>
        <h3 className="absolute bottom-[30px] left-[30px] right-[30px] m-0 whitespace-pre-line text-center text-[24px] font-extrabold leading-[1.2] tracking-[-0.02em] text-white">
          {displayTitle}
        </h3>
      </div>

      {thumbs.length > 0 ? (
        <div className="mt-[2px] grid grid-cols-4 gap-[2px]">
          {thumbs.map((product, index) => (
            <HomeProductDetailLink
              key={`${product.productId ?? 'slot'}-${index}`}
              productId={product.productId}
              className="aspect-[4/5] overflow-hidden bg-[var(--otz-color-surface-subtle)]"
            >
              <div className="flex h-full w-full items-center justify-center bg-[var(--otz-color-surface-subtle)]">
                <div className="aspect-square w-full">
                  <img
                    src={product.image}
                    alt=""
                    className="h-full w-full object-contain object-center mix-blend-multiply"
                    draggable={false}
                  />
                </div>
              </div>
            </HomeProductDetailLink>
          ))}
        </div>
      ) : null}
    </div>
  )
}
