import type { KeyboardEvent, ReactNode } from 'react'
import { getProductDetailPath } from '../../lib/productRoutes'
import { navigateSpa, type SpaPath } from '../../lib/spaNavigation'

interface HomeProductDetailLinkProps {
  productId?: number | string | null
  href?: string | null
  children: ReactNode
  className?: string
}

function resolveProductDetailPath(
  productId?: number | string | null,
  href?: string | null,
): SpaPath | null {
  const trimmedHref = (href ?? '').trim()
  if (trimmedHref.startsWith('/')) return trimmedHref as SpaPath
  if (productId == null) return null
  const id = String(productId).trim()
  if (!id) return null
  return getProductDetailPath(id)
}

/** Home main product tile — navigates to PDP when a product id or href is set. */
export function HomeProductDetailLink({
  productId,
  href,
  children,
  className = '',
}: HomeProductDetailLinkProps) {
  const target = resolveProductDetailPath(productId, href)

  if (!target) {
    return <div className={className}>{children}</div>
  }

  const go = () => navigateSpa(target)

  return (
    <div
      className={`cursor-pointer ${className}`.trim()}
      role="link"
      tabIndex={0}
      onClick={go}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          go()
        }
      }}
    >
      {children}
    </div>
  )
}
