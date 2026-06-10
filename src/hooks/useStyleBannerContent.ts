import { useEffect, useMemo, useState } from 'react'
import { useAdminHomeMainConfig } from './useAdminHomeMainConfig'
import { fetchProductDetailById, fetchProductRowById, getProductSquareCutCandidates } from '../lib/productsApi'
import {
  resolveStyleBannerSection,
  type ResolvedStyleBannerSection,
} from '../lib/homeMainContentResolver'

interface StyleBannerContentState {
  section: ResolvedStyleBannerSection
  isLoading: boolean
}

export function useStyleBannerContent(): StyleBannerContentState {
  const { styleBannerSection, updatedAt } = useAdminHomeMainConfig()
  const [productById, setProductById] = useState(
    () =>
      new Map<
        number,
        {
          thumb: string
          thumbCandidates: string[]
          title: string
          discountRate: string
          price: string
          catalogId: string
        }
      >(),
  )
  const [isLoading, setIsLoading] = useState(true)

  const productIdKey = useMemo(() => {
    const ids = new Set<number>()
    for (const card of styleBannerSection.cards) {
      for (const id of card.productIds) {
        if (id != null) ids.add(id)
      }
    }
    return Array.from(ids).sort((a, b) => a - b).join(',')
  }, [styleBannerSection.cards, updatedAt])

  useEffect(() => {
    let cancelled = false
    const ids = productIdKey ? productIdKey.split(',').map((value) => Number(value)) : []

    if (!ids.length) {
      setProductById(new Map())
      setIsLoading(false)
      return undefined
    }

    setIsLoading(true)
    Promise.all(
      ids.map(async (id) => {
        const [detail, row] = await Promise.all([fetchProductDetailById(id), fetchProductRowById(id)])
        if (!detail || !row) return null
        const thumb = getProductSquareCutCandidates(row)[0] ?? detail.product.image
        return [
          id,
          {
            thumb,
            thumbCandidates: getProductSquareCutCandidates(row),
            title: detail.product.title,
            discountRate: detail.product.discountRate,
            price: detail.product.price,
            catalogId: detail.product.id,
          },
        ] as const
      }),
    ).then((entries) => {
      if (cancelled) return
      const next = new Map<
        number,
        {
          thumb: string
          thumbCandidates: string[]
          title: string
          discountRate: string
          price: string
          catalogId: string
        }
      >()
      for (const entry of entries) {
        if (entry) next.set(entry[0], entry[1])
      }
      setProductById(next)
      setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [productIdKey])

  const section = useMemo(
    () => resolveStyleBannerSection(styleBannerSection, productById),
    [styleBannerSection, productById, updatedAt],
  )

  return { section, isLoading }
}
