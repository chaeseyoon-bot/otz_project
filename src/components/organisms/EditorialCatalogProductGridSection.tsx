import type { EditorialCatalogProductGrid } from '../../data/editorialEventDetails'
import type { ProductCardItem } from '../molecules/ProductCardUnit'
import { ProductCardUnit } from '../molecules/ProductCardUnit'
import { getProductDetailPath } from '../../lib/productRoutes'
import { navigateSpa } from '../../lib/spaNavigation'

export interface EditorialCatalogProductGridSectionProps {
  section: EditorialCatalogProductGrid
  likedIds: Set<string>
  onToggleLike: (id: string) => void
  variant?: 'pc' | 'mobile'
}

function CatalogProductCard({
  product,
  liked,
  onToggleLike,
  variant,
}: {
  product: ProductCardItem
  liked: boolean
  onToggleLike: () => void
  variant: 'pc' | 'mobile'
}) {
  const isPc = variant === 'pc'

  return (
    <div
      className="flex h-full min-w-0 w-full cursor-pointer flex-col"
      role="link"
      tabIndex={0}
      onClick={() => navigateSpa(getProductDetailPath(product.id))}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          navigateSpa(getProductDetailPath(product.id))
        }
      }}
    >
      <ProductCardUnit
        product={product}
        liked={liked}
        onToggleLike={onToggleLike}
        articleClassName="flex h-full w-full min-h-0 flex-col"
        titleClassName={
          isPc
            ? 'min-h-[42px] min-w-0 line-clamp-2 pt-3 text-[15px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault'
            : 'min-h-[30px] min-w-0 line-clamp-2 pt-3 text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault'
        }
        priceRowClassName={
          isPc
            ? 'flex min-h-[25px] flex-wrap items-center gap-x-[6px] gap-y-0 pt-1'
            : 'flex min-h-[21px] flex-wrap items-center gap-x-1.5 gap-y-0 pt-1'
        }
        priceDiscountClassName={
          isPc
            ? 'text-[18px] font-bold leading-[1.4] tracking-[-0.02em] text-primary'
            : 'text-[15px] font-bold leading-[1.4] tracking-[-0.02em] text-primary'
        }
        priceSaleClassName={
          isPc
            ? 'text-[18px] font-bold leading-[1.4] tracking-[-0.02em] text-dark'
            : 'text-[15px] font-bold leading-[1.4] tracking-[-0.02em] text-dark'
        }
        priceOriginalClassName={
          isPc
            ? 'text-[14px] font-normal leading-[1.4] tracking-[-0.02em] text-subtleText line-through'
            : 'text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-subtleText line-through'
        }
        mediaInnerClassName={isPc ? 'aspect-[272/340]' : 'aspect-[272/340]'}
        hideMultiCutDots
      />
    </div>
  )
}

/** Figma 151:4481 — SHOES / BAG & ACC 6-column catalog product grid. */
export function EditorialCatalogProductGridSection({
  section,
  likedIds,
  onToggleLike,
  variant = 'pc',
}: EditorialCatalogProductGridSectionProps) {
  if (!section.products.length) return null

  const isPc = variant === 'pc'

  return (
    <section
      className={
        isPc
          ? 'mx-auto flex w-full max-w-[1280px] flex-col bg-white'
          : 'flex w-full flex-col bg-white px-[15px] pt-10'
      }
    >
      {section.title ? (
        <div className={isPc ? 'w-full pb-[30px] pt-20' : 'w-full'}>
          <h2
            className={
              isPc
                ? 'm-0 flex w-full flex-col items-start justify-start bg-black px-6 py-4 text-[30px] font-bold leading-[1.2] tracking-[-0.4px] text-white'
                : 'm-0 flex h-[50px] w-full items-center justify-center bg-dark text-[18px] font-bold leading-[1.2] tracking-[-0.02em] text-white'
            }
          >
            {section.title}
          </h2>
        </div>
      ) : null}
      <div
        className={
          isPc
            ? 'grid w-full grid-cols-6 gap-x-[10px] gap-y-12 pb-[50px]'
            : `grid w-full grid-cols-2 gap-x-[10px] gap-y-6 pb-10${section.title ? ' pt-6' : ''}`
        }
      >
        {section.products.map((product, index) => (
          <CatalogProductCard
            key={`${product.id}-${index}`}
            product={product}
            liked={likedIds.has(product.id)}
            onToggleLike={() => onToggleLike(product.id)}
            variant={variant}
          />
        ))}
      </div>
    </section>
  )
}
