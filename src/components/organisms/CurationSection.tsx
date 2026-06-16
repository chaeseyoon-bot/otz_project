import { useMemo, useState } from 'react'
import {
  CURATION_MOBILE_TILE_COUNT,
  CurationMobileSlide,
} from '../molecules/CurationMobileSlide'
import { ProductEditorialThumbnail } from '../molecules/ProductEditorialThumbnail'
import { HomeProductDetailLink } from '../molecules/HomeProductDetailLink'
import { useAdminHomeMainConfig } from '../../hooks/useAdminHomeMainConfig'
import { useCurationProductsContent } from '../../hooks/useCurationProductsContent'
import { resolveCurationCopy } from '../../lib/homeMainContentResolver'
import { getProductHeartIconDataUri } from '../../lib/productHeartIcon'

/** Figma 2601:23363 — link chevron 6×12 */
function CurationLinkChevron({ className }: { className?: string }) {
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

export function CurationSection() {
  const { curationProducts, updatedAt } = useAdminHomeMainConfig()
  const { products } = useCurationProductsContent()
  const copy = useMemo(
    () => resolveCurationCopy(curationProducts),
    [curationProducts, updatedAt],
  )
  const linkHref = copy.linkHref || '#'

  const mobileTiles = useMemo(
    () =>
      Array.from({ length: CURATION_MOBILE_TILE_COUNT }, (_, index) => {
        const item = products[index]
        if (!item) return []
        if (item.imageCandidates.length > 0) return item.imageCandidates
        return item.imageUrl ? [item.imageUrl] : []
      }),
    [products],
  )

  const [likedItems, setLikedItems] = useState<boolean[]>(() => products.map(() => false))

  const toggleLike = (index: number) => {
    setLikedItems((prev) => {
      const next = products.map((_, i) => prev[i] ?? false)
      next[index] = !next[index]
      return next
    })
  }

  return (
    <section className="w-full">
      {/* Mobile — Figma 2424:16202 */}
      <div className="px-[15px] pb-0 pt-10 lg:hidden">
        <CurationMobileSlide
          tiles={mobileTiles}
          productIds={products.map((item) => item.productId)}
          badge={copy.badge}
          title={copy.title}
          ctaLabel={copy.mobileCtaLabel}
          ctaHref={linkHref}
        />
      </div>

      {/* PC — Figma 2601:23305 band + 2601:23354 contents */}
      <div className="hidden w-full bg-light py-[64px] lg:block">
        <div className="mx-auto min-w-0 max-w-[1400px]">
          <div className="flex min-w-0 items-start gap-[75px]">
            <div className="flex w-[300px] shrink-0 flex-col gap-5 pt-5">
              <div className="shrink-0">
                <span className="inline-flex rounded-full bg-black px-[13px] py-[5px] text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-white">
                  {copy.badge}
                </span>
              </div>
              <div className="flex flex-col gap-[30px]">
                <h2 className="m-0 whitespace-pre-line text-[30px] font-extrabold leading-[1.2] tracking-[-0.02em] text-dark">
                  {copy.title}
                </h2>
                <a
                  href={linkHref}
                  className="inline-flex items-center gap-1.5 text-link2 leading-none text-textDefault underline decoration-solid underline-offset-2 hover:text-dark"
                >
                  <span className="shrink-0">{copy.pcLinkLabel}</span>
                  <span className="flex h-3 w-1.5 shrink-0 items-center justify-center" aria-hidden>
                    <CurationLinkChevron className="block h-3 w-1.5 shrink-0" />
                  </span>
                </a>
              </div>
            </div>

            <div className="flex min-h-0 min-w-0 flex-1 items-center gap-[10px]">
              {products.map((item, index) => (
                <HomeProductDetailLink
                  key={item.id}
                  productId={item.productId}
                  className="flex min-w-0 flex-1 flex-col self-stretch"
                >
                  <article className="flex min-w-0 flex-1 flex-col self-stretch">
                    <div className="relative w-full shrink-0 overflow-hidden">
                      <div className="relative flex w-full shrink-0 items-center gap-[10px] bg-light aspect-[4/5]">
                        <div className="relative aspect-[1200/1500] min-h-0 min-w-0 flex-1">
                          <ProductEditorialThumbnail
                            candidates={item.imageCandidates}
                            className="pointer-events-none absolute inset-0 size-full"
                            imageClassName="pointer-events-none absolute inset-0 size-full max-w-none object-cover"
                          />
                        </div>
                      </div>
                      <div className="absolute right-0 top-0 z-10 flex flex-col items-end p-[6px]">
                        <button
                          type="button"
                          aria-label={likedItems[index] ? '찜 해제' : '찜하기'}
                          onClick={(event) => {
                            event.stopPropagation()
                            toggleLike(index)
                          }}
                        >
                          <span
                            className="block h-4 w-[17px] bg-contain bg-center bg-no-repeat"
                            style={{ backgroundImage: getProductHeartIconDataUri(likedItems[index]) }}
                          />
                        </button>
                      </div>
                    </div>
                    <div className="w-full shrink-0 pr-1.5">
                      <p className="m-0 truncate pt-3 text-[14px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault">
                        {item.productName}
                      </p>
                      <div className="flex items-center pt-1">
                        <span className="text-[15px] font-bold leading-[1.4] tracking-[-0.02em] text-primary">
                          {item.discount}
                        </span>
                        <span className="pl-1.5 text-[15px] font-bold leading-[1.4] tracking-[-0.02em] text-black">
                          {item.price}
                        </span>
                      </div>
                    </div>
                  </article>
                </HomeProductDetailLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
