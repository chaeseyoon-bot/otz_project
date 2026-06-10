import { useEffect, useMemo, useState } from 'react'
import { useAdminHomeMainConfig } from './useAdminHomeMainConfig'
import { fetchProductById } from '../lib/productsApi'
import { resolvePlanningCollections, type ResolvedPlanningCollection } from '../lib/homeMainContentResolver'

interface PlanningCollectionsContentState {
  collections: ResolvedPlanningCollection[]
  isLoading: boolean
}

export function usePlanningCollectionsContent(): PlanningCollectionsContentState {
  const { planningCollections, planningCollectionTags, updatedAt } = useAdminHomeMainConfig()
  const [productById, setProductById] = useState(
    () => new Map<number, { image: string; title: string; discountRate: string; price: string }>(),
  )
  const [isLoading, setIsLoading] = useState(true)

  const productIdKey = useMemo(() => {
    const ids = new Set<number>()
    for (const collection of planningCollections) {
      for (const id of collection.productIds) {
        if (id != null) ids.add(id)
      }
    }
    return Array.from(ids).sort((a, b) => a - b).join(',')
  }, [planningCollections, updatedAt])

  useEffect(() => {
    let cancelled = false
    const ids = productIdKey
      ? productIdKey.split(',').map((value) => Number(value))
      : []

    if (!ids.length) {
      setProductById(new Map())
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    Promise.all(
      ids.map(async (id) => {
        const product = await fetchProductById(id)
        if (!product) return null
        return [
          id,
          {
            image: product.image,
            title: product.title,
            discountRate: product.discountRate,
            price: product.price,
          },
        ] as const
      }),
    ).then((entries) => {
      if (cancelled) return
      const next = new Map<number, { image: string; title: string; discountRate: string; price: string }>()
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

  const collections = useMemo(
    () => resolvePlanningCollections(planningCollections, planningCollectionTags, productById),
    [planningCollections, planningCollectionTags, productById, updatedAt],
  )

  return { collections, isLoading }
}
