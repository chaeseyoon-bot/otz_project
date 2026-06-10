import { useEffect, useMemo, useState } from 'react'
import { useAdminHomeMainConfig } from './useAdminHomeMainConfig'
import {
  fetchProductDetailById,
  getProductEditorialCutCandidates,
} from '../lib/productsApi'
import {
  resolveCurationProducts,
  type ResolvedCurationProduct,
} from '../lib/homeMainContentResolver'

interface CurationProductsContentState {
  products: ResolvedCurationProduct[]
  isLoading: boolean
}

async function loadCurationProductMeta(id: number) {
  const detail = await fetchProductDetailById(id)
  if (!detail) return null

  const row = { id: detail.numericId, category: detail.folder }
  const imageCandidates = getProductEditorialCutCandidates(row)
  return {
    title: detail.product.title,
    discountRate: detail.product.discountRate,
    price: detail.product.price,
    folder: detail.folder,
    editorialImage: imageCandidates[0] ?? detail.product.image,
    imageCandidates,
  } as const
}

export function useCurationProductsContent(): CurationProductsContentState {
  const { curationProducts, updatedAt } = useAdminHomeMainConfig()
  const [productById, setProductById] = useState(
    () =>
      new Map<
        number,
        {
          title: string
          discountRate: string
          price: string
          folder: string
          editorialImage: string
          imageCandidates: string[]
        }
      >(),
  )
  const [isLoading, setIsLoading] = useState(true)

  const productIdKey = useMemo(() => {
    const ids = curationProducts.productIds.filter((id): id is number => id != null)
    return ids.sort((a, b) => a - b).join(',')
  }, [curationProducts.productIds, updatedAt])

  useEffect(() => {
    let cancelled = false
    const ids = productIdKey ? productIdKey.split(',').map((value) => Number(value)) : []

    if (!ids.length) {
      setProductById(new Map())
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    Promise.all(
      ids.map(async (id) => {
        const meta = await loadCurationProductMeta(id)
        return meta ? ([id, meta] as const) : null
      }),
    ).then((entries) => {
      if (cancelled) return
      const next = new Map<
        number,
        {
          title: string
          discountRate: string
          price: string
          folder: string
          editorialImage: string
          imageCandidates: string[]
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

  const products = useMemo(
    () => resolveCurationProducts(curationProducts, productById),
    [curationProducts, productById, updatedAt],
  )

  return { products, isLoading }
}
