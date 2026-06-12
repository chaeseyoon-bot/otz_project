import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import {
  ADMIN_PRODUCT_NEW_PATH,
  getAdminProductEditPath,
} from '../../lib/adminRoutes'
import { consumeAdminProductFlash } from './ProductRegistration'
import {
  adminProductTitle,
  coerceProductFlag,
  canRegisterMoreForYouProducts,
  compareProductsByForuSortAsc,
  deleteAdminProduct,
  fetchAllProductsFromSupabase,
  formatAdminDiscountRate,
  formatAdminPrice,
  FOR_YOU_MAX_PRODUCTS,
  forYouRegistrationBlockedMessage,
  getAdminProductThumbnailCandidates,
  resolveProductCategory,
  suggestNextForuSortOrder,
  updateAdminForuSortOrders,
  updateAdminProductExposure,
} from '../../lib/productsApi'
import {
  ADMIN_FREE_SIZE,
  ADMIN_STOCK_SIZES,
  DEFAULT_PRODUCT_STOCK_QTY,
  adminStockStatusClass,
  adminStockStatusLabel,
  deriveAdminStockStatus,
  getTotalProductStock,
  isShoesProductCategory,
  normalizeProductStockForCategory,
  updateAdminProductStock,
} from '../../lib/adminProductStock'
import { navigateSpa } from '../../lib/spaNavigation'

const CATEGORY_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'bagacc', label: 'Bag&Acc' },
]

function stopRowToggle(event) {
  event.stopPropagation()
}

function isAdminFreeShipping(product) {
  return product.free_shipping == null ? true : coerceProductFlag(product.free_shipping)
}

function AdminProductThumbnail({ product }) {
  const candidates = useMemo(
    () => getAdminProductThumbnailCandidates(product),
    [product.id, product.category],
  )
  const [candidateIndex, setCandidateIndex] = useState(0)

  useEffect(() => {
    setCandidateIndex(0)
  }, [product.id, candidates])

  const src = candidates[candidateIndex]
  const hasImage = candidateIndex < candidates.length && Boolean(src)

  return (
    <div className="flex size-[50px] shrink-0 items-center justify-center overflow-hidden rounded-sm border border-lightGray bg-light">
      {hasImage ? (
        <img
          key={`${product.id}-${candidateIndex}`}
          src={src}
          alt=""
          width={50}
          height={50}
          className="size-full object-cover mix-blend-multiply"
          draggable={false}
          loading="lazy"
          onError={() => {
            setCandidateIndex((index) => Math.min(index + 1, candidates.length))
          }}
        />
      ) : (
        <span className="text-[10px] text-subtleText">No img</span>
      )}
    </div>
  )
}

function buildContiguousForuSortOrders(products) {
  return products.map((product, index) => ({
    id: product.id,
    foru_sort_order: index + 1,
  }))
}

function AdminForYouOrderPanel({ products, isSaving, onMove }) {
  if (products.length === 0) return null

  return (
    <section className="mb-5 rounded-sm border border-lightGray bg-light3 px-4 py-4">
      <div className="mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="m-0 text-bodyBold2 text-dark">For You 메인 노출 순서</h3>
          <span className="rounded-sm border border-lightGray bg-white px-2 py-0.5 text-[11px] text-subtleText">
            {products.length}/{FOR_YOU_MAX_PRODUCTS}
          </span>
        </div>
        <p className="m-0 mt-1 text-bodySmall text-subtleText">
          왼쪽부터 메인 For You 섹션에 먼저 노출됩니다. 화살표로 순서를 변경하세요.
          {products.length >= FOR_YOU_MAX_PRODUCTS ? (
            <span className="mt-1 block text-primaryText">
              {forYouRegistrationBlockedMessage()}
            </span>
          ) : null}
        </p>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {products.map((product, index) => (
          <article
            key={product.id}
            className="flex w-[168px] shrink-0 flex-col gap-2 rounded-sm border border-lightGray bg-white p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-dark text-[11px] font-medium text-white">
                {index + 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={isSaving || index === 0}
                  onClick={() => onMove(product.id, -1)}
                  className="rounded-sm border border-lightGray bg-white px-1.5 py-0.5 text-[10px] text-subtleText disabled:opacity-30"
                  aria-label={`${index + 1}번째 상품을 앞으로`}
                >
                  ←
                </button>
                <button
                  type="button"
                  disabled={isSaving || index === products.length - 1}
                  onClick={() => onMove(product.id, 1)}
                  className="rounded-sm border border-lightGray bg-white px-1.5 py-0.5 text-[10px] text-subtleText disabled:opacity-30"
                  aria-label={`${index + 1}번째 상품을 뒤로`}
                >
                  →
                </button>
              </div>
            </div>
            <AdminProductThumbnail product={product} />
            <p className="m-0 line-clamp-2 text-[11px] leading-snug text-dark">
              {adminProductTitle(product)}
            </p>
            <p className="m-0 text-[10px] text-subtleText">ID {product.id}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function AdminFlagCheckbox({ checked, disabled, label, onChange }) {
  return (
    <label
      className={`group flex flex-col items-center gap-1.5 ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      }`}
      onClick={stopRowToggle}
    >
      <span className="whitespace-nowrap text-[11px] leading-none text-subtleText">{label}</span>
      <span
        className={`flex size-5 items-center justify-center rounded-sm border transition-all ${
          checked
            ? 'border-dark bg-dark text-white shadow-sm'
            : 'border-lightGray bg-white text-transparent group-hover:border-dark'
        }`}
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        {checked ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path
              d="M2.5 6L5 8.5L9.5 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>
    </label>
  )
}

function AdminStockAccordionPanel({ stock, category, isSaving, onSave }) {
  const [draft, setDraft] = useState(() => normalizeProductStockForCategory(stock, category))

  useEffect(() => {
    setDraft(normalizeProductStockForCategory(stock, category))
  }, [stock, category])

  const updateQty = (size, rawValue) => {
    const numeric = Math.max(0, Math.round(Number(rawValue) || 0))
    setDraft((prev) => ({ ...prev, [size]: numeric }))
  }

  const draftTotal = getTotalProductStock(draft)
  const isShoes = isShoesProductCategory(category)

  return (
    <div className="px-5 py-5" onClick={stopRowToggle}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="m-0 text-bodyBold2 text-dark">
              {isShoes ? '사이즈별 재고' : 'FREE 재고'}
            </p>
            <p className="m-0 text-bodySmall text-subtleText">
              {isShoes ? '220 ~ 260 (5단위)' : 'FREE 사이즈'} · 편집 합계{' '}
              <span className="font-semibold text-dark">
                {draftTotal.toLocaleString('ko-KR')}개
              </span>
            </p>
          </div>
          {isShoes ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 xl:grid-cols-9">
              {ADMIN_STOCK_SIZES.map((size) => (
                <label
                  key={size}
                  className="flex flex-col gap-1.5 rounded-sm border border-lightGray bg-white p-3 transition-colors hover:border-dark/30"
                >
                  <span className="text-[11px] font-medium leading-none text-subtleText">{size}</span>
                  <input
                    type="number"
                    min={0}
                    value={draft[size] ?? 0}
                    onChange={(e) => updateQty(size, e.target.value)}
                    className="h-9 w-full rounded-sm border border-lightGray px-2 text-center text-bodyRegular2 text-dark outline-none transition-colors focus:border-dark"
                  />
                </label>
              ))}
            </div>
          ) : (
            <label className="flex max-w-[200px] flex-col gap-1.5 rounded-sm border border-lightGray bg-white p-3 transition-colors hover:border-dark/30">
              <span className="text-[11px] font-medium leading-none text-subtleText">{ADMIN_FREE_SIZE}</span>
              <input
                type="number"
                min={0}
                value={draft[ADMIN_FREE_SIZE] ?? DEFAULT_PRODUCT_STOCK_QTY}
                onChange={(e) => updateQty(ADMIN_FREE_SIZE, e.target.value)}
                className="h-9 w-full rounded-sm border border-lightGray px-2 text-center text-bodyRegular2 text-dark outline-none transition-colors focus:border-dark"
              />
            </label>
          )}
        </div>
        <button
          type="button"
          disabled={isSaving}
          className="shrink-0 rounded-sm border border-dark bg-dark px-6 py-3 text-bodySmall text-white transition-opacity hover:opacity-90 disabled:opacity-50 lg:self-end"
          onClick={() => onSave(draft)}
        >
          {isSaving ? '저장 중…' : '수정 완료'}
        </button>
      </div>
    </div>
  )
}

/** Admin product list — Supabase sync + filters + status controls. */
export function ProductManagement() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [savingKey, setSavingKey] = useState(null)
  const [expandedStockId, setExpandedStockId] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2400)
  }, [])

  useEffect(() => {
    const flash = consumeAdminProductFlash()
    if (flash) showToast(flash)
  }, [showToast])

  useEffect(() => {
    let cancelled = false

    async function loadProducts() {
      setIsLoading(true)
      setError(null)
      try {
        const rows = await fetchAllProductsFromSupabase()
        if (!cancelled) setProducts(rows)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err))
          setProducts([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadProducts()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return products.filter((product) => {
      const categoryOk =
        categoryFilter === 'all' || resolveProductCategory(product) === categoryFilter
      const title = adminProductTitle(product).toLowerCase()
      const searchOk = !q || title.includes(q) || String(product.id).includes(q)
      return categoryOk && searchOk
    })
  }, [products, categoryFilter, searchQuery])

  const forYouProducts = useMemo(
    () =>
      products
        .filter((product) => coerceProductFlag(product.is_foru))
        .sort(compareProductsByForuSortAsc),
    [products],
  )

  const toggleStockRow = useCallback((id) => {
    setExpandedStockId((prev) => (prev === id ? null : id))
  }, [])

  const applyForuSortOrders = useCallback(
    async (orderedProducts) => {
      const entries = buildContiguousForuSortOrders(orderedProducts)
      await updateAdminForuSortOrders(entries)
      setProducts((prev) => {
        const orderById = new Map(entries.map((entry) => [entry.id, entry.foru_sort_order]))
        return prev.map((row) =>
          orderById.has(row.id)
            ? { ...row, foru_sort_order: orderById.get(row.id) ?? null }
            : row,
        )
      })
    },
    [],
  )

  const patchExposure = useCallback(
    async (id, field, nextChecked) => {
      const saveKey = `${field}-${id}`
      setSavingKey(saveKey)
      try {
        if (field === 'is_foru') {
          if (nextChecked) {
            if (!canRegisterMoreForYouProducts(products, id)) {
              showToast(forYouRegistrationBlockedMessage())
              return
            }
            const nextOrder = suggestNextForuSortOrder(products.filter((row) => row.id !== id))
            await updateAdminProductExposure(id, {
              is_foru: true,
              foru_sort_order: nextOrder,
            })
            setProducts((prev) =>
              prev.map((row) =>
                row.id === id ? { ...row, is_foru: true, foru_sort_order: nextOrder } : row,
              ),
            )
            showToast('For You 메인 노출이 등록되었습니다.')
          } else {
            await updateAdminProductExposure(id, { is_foru: false, foru_sort_order: null })
            const remaining = products
              .filter((row) => row.id !== id && coerceProductFlag(row.is_foru))
              .sort(compareProductsByForuSortAsc)
            if (remaining.length > 0) {
              await applyForuSortOrders(remaining)
            }
            setProducts((prev) =>
              prev
                .map((row) =>
                  row.id === id ? { ...row, is_foru: false, foru_sort_order: null } : row,
                )
                .map((row) => {
                  if (!coerceProductFlag(row.is_foru)) return row
                  const index = remaining.findIndex((item) => item.id === row.id)
                  return index >= 0 ? { ...row, foru_sort_order: index + 1 } : row
                }),
            )
            showToast('For You 메인 노출이 해제되었습니다.')
          }
          return
        }

        await updateAdminProductExposure(id, { [field]: nextChecked })
        setProducts((prev) =>
          prev.map((row) => (row.id === id ? { ...row, [field]: nextChecked } : row)),
        )
        showToast(
          nextChecked ? 'New 상품으로 등록되었습니다.' : 'New 노출이 해제되었습니다.',
        )
      } catch (err) {
        showToast(err instanceof Error ? err.message : '노출 설정 저장에 실패했습니다.')
      } finally {
        setSavingKey(null)
      }
    },
    [applyForuSortOrders, products, showToast],
  )

  const moveForYouProduct = useCallback(
    async (id, direction) => {
      const list = [...forYouProducts]
      const index = list.findIndex((product) => product.id === id)
      if (index < 0) return

      const targetIndex = index + direction
      if (targetIndex < 0 || targetIndex >= list.length) return

      const next = [...list]
      ;[next[index], next[targetIndex]] = [next[targetIndex], next[index]]

      const saveKey = `foru-order-${id}`
      setSavingKey(saveKey)
      try {
        await applyForuSortOrders(next)
        showToast('For You 노출 순서가 변경되었습니다.')
      } catch (err) {
        showToast(err instanceof Error ? err.message : '순서 저장에 실패했습니다.')
      } finally {
        setSavingKey(null)
      }
    },
    [applyForuSortOrders, forYouProducts, showToast],
  )

  const removeProduct = useCallback(
    async (product) => {
      const title = adminProductTitle(product)
      const confirmed = window.confirm(
        `상품 "${title}" (ID ${product.id})을(를) 삭제할까요?\n삭제 후에는 복구할 수 없습니다.`,
      )
      if (!confirmed) return

      const saveKey = `delete-${product.id}`
      setSavingKey(saveKey)
      try {
        await deleteAdminProduct(product.id)
        setProducts((prev) => prev.filter((row) => row.id !== product.id))
        setExpandedStockId((prev) => (prev === product.id ? null : prev))
        showToast('상품이 삭제되었습니다.')
      } catch (err) {
        showToast(err instanceof Error ? err.message : '상품 삭제에 실패했습니다.')
      } finally {
        setSavingKey(null)
      }
    },
    [showToast],
  )

  const patchStock = useCallback(
    async (id, stockMap, category) => {
      const saveKey = `stock-${id}`
      setSavingKey(saveKey)
      try {
        await updateAdminProductStock(id, stockMap, category)
        const normalized = normalizeProductStockForCategory(stockMap, category)
        setProducts((prev) =>
          prev.map((row) => (row.id === id ? { ...row, stock: normalized } : row)),
        )
        showToast('재고가 저장되었습니다.')
      } catch (err) {
        showToast(err instanceof Error ? err.message : '재고 저장에 실패했습니다.')
      } finally {
        setSavingKey(null)
      }
    },
    [showToast],
  )

  return (
    <div className="relative min-h-0 flex-1 overflow-y-auto px-8 py-8">
      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-sm border border-dark bg-dark px-4 py-3 text-bodySmall text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <header className="mb-6 flex items-end justify-between gap-4 border-b border-lightGray pb-6">
        <div>
          <h2 className="m-0 text-h3 text-dark">상품 관리</h2>
          <p className="m-0 mt-2 text-bodyRegular2 text-textDefault">
            등록 상품을 검색·필터링하고 사이즈별 재고(JSONB), New / For You 메인 노출을 관리합니다.
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-sm border border-dark bg-dark px-5 py-3 text-bodyRegular2 text-white transition-opacity hover:opacity-90"
          onClick={() => navigateSpa(ADMIN_PRODUCT_NEW_PATH)}
        >
          상품 등록
        </button>
      </header>

      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-sm border border-lightGray bg-light3 px-4 py-4">
        <label className="flex min-w-[160px] flex-col gap-1.5">
          <span className="text-bodySmall text-subtleText">카테고리</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 rounded-sm border border-lightGray bg-white px-3 text-bodyRegular2 text-dark outline-none focus:border-dark"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-[280px] flex-1 flex-col gap-1.5">
          <span className="text-bodySmall text-subtleText">상품명 검색</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="상품명 또는 ID로 검색"
            className="h-10 rounded-sm border border-lightGray bg-white px-3 text-bodyRegular2 text-dark outline-none placeholder:text-subtleText focus:border-dark"
          />
        </label>

        <p className="m-0 ml-auto self-end text-bodySmall text-subtleText">
          {filteredProducts.length.toLocaleString('ko-KR')} / {products.length.toLocaleString('ko-KR')}개
        </p>
      </div>

      {isLoading ? (
        <p className="m-0 text-bodyRegular2 text-textDefault">상품 목록을 불러오는 중…</p>
      ) : error ? (
        <div className="rounded-sm border border-lightGray bg-light px-4 py-5">
          <p className="m-0 text-bodyRegular2 text-primaryText">
            상품 목록을 불러오지 못했습니다: {error}
          </p>
          <p className="m-0 mt-2 text-bodySmall text-subtleText">
            Supabase `products` 테이블 스키마(id, category, name, price, discount_rate, is_new,
            is_foru, stock JSONB)와 RLS SELECT/UPDATE 정책을 확인해 주세요.
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-sm border border-lightGray bg-light3 px-6 py-12 text-center">
          <p className="m-0 text-bodyBold1 text-dark">등록된 상품이 없습니다</p>
          <p className="m-0 mt-2 text-bodyRegular2 text-textDefault">
            Supabase 샘플 외 실제 판매 상품을 등록하려면 상품 등록 페이지에서 정보와 이미지를
            입력해 주세요.
          </p>
          <button
            type="button"
            className="mt-6 rounded-sm border border-dark bg-dark px-6 py-3 text-bodyRegular2 text-white transition-opacity hover:opacity-90"
            onClick={() => navigateSpa(ADMIN_PRODUCT_NEW_PATH)}
          >
            상품 등록하기
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <p className="m-0 text-bodyRegular2 text-textDefault">검색 조건에 맞는 상품이 없습니다.</p>
      ) : (
        <>
          <AdminForYouOrderPanel
            products={forYouProducts}
            isSaving={savingKey?.startsWith('foru-order-') || savingKey?.startsWith('is_foru-')}
            onMove={moveForYouProduct}
          />
        <div className="overflow-hidden rounded-sm border border-lightGray">
          <table className="w-full border-collapse text-left">
            <thead className="bg-light">
              <tr>
                <th className="w-8 px-2 py-3" aria-hidden />
                <th className="px-4 py-3 text-bodySmall text-subtleText">상품 ID</th>
                <th className="px-4 py-3 text-bodySmall text-subtleText">썸네일</th>
                <th className="px-4 py-3 text-bodySmall text-subtleText">상품명</th>
                <th className="px-4 py-3 text-bodySmall text-subtleText">판매가</th>
                <th className="px-4 py-3 text-bodySmall text-subtleText">할인율</th>
                <th className="px-4 py-3 text-center text-bodySmall text-subtleText">New</th>
                <th className="px-4 py-3 text-center text-bodySmall text-subtleText">
                  메인 노출
                  <br />
                  <span className="text-[10px] font-normal">(For You)</span>
                </th>
                <th className="px-4 py-3 text-bodySmall text-subtleText">재고</th>
                <th className="px-4 py-3 text-bodySmall text-subtleText">판매 상태</th>
                <th className="px-4 py-3 text-bodySmall text-subtleText">관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const productCategory = String(product.category ?? 'shoes01')
                const sizeStock = normalizeProductStockForCategory(product.stock, productCategory)
                const totalStock = getTotalProductStock(sizeStock)
                const stockStatus = deriveAdminStockStatus(sizeStock)
                const isNew = coerceProductFlag(product.is_new)
                const isForYou = coerceProductFlag(product.is_foru)
                const isMainExposed = isNew || isForYou
                const isExpanded = expandedStockId === product.id
                const isDeleting = savingKey === `delete-${product.id}`
                const isSavingNew = savingKey === `is_new-${product.id}`
                const isSavingForYou = savingKey === `is_foru-${product.id}`
                const isSavingStock = savingKey === `stock-${product.id}`
                const forYouLimitReached = forYouProducts.length >= FOR_YOU_MAX_PRODUCTS
                const forYouCheckboxDisabled =
                  isSavingForYou || (!isForYou && forYouLimitReached)

                return (
                  <Fragment key={product.id}>
                    <tr
                      role="button"
                      tabIndex={0}
                      aria-expanded={isExpanded}
                      onClick={() => toggleStockRow(product.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          toggleStockRow(product.id)
                        }
                      }}
                      className={`border-t border-lightGray transition-colors duration-200 ${
                        isExpanded
                          ? 'bg-light3'
                          : isMainExposed
                            ? 'bg-light3/50 hover:bg-light3/80'
                            : 'bg-white hover:bg-light2/40'
                      } cursor-pointer`}
                    >
                      <td className="px-2 py-4 text-center">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          aria-hidden
                          className={`inline-block text-subtleText transition-transform duration-300 ease-out ${
                            isExpanded ? 'rotate-180' : 'rotate-0'
                          }`}
                        >
                          <path
                            d="M3.5 5.25L7 8.75L10.5 5.25"
                            stroke="currentColor"
                            strokeWidth="1.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </td>
                      <td className="px-4 py-4 text-bodyRegular2 text-dark">{product.id}</td>
                      <td className="px-4 py-4">
                        <AdminProductThumbnail product={product} />
                      </td>
                      <td className="max-w-[300px] px-4 py-4">
                        <p className="m-0 flex flex-wrap items-center gap-1.5 text-bodyRegular2 text-dark">
                          <span>{adminProductTitle(product)}</span>
                          {isAdminFreeShipping(product) ? (
                            <span className="inline-flex shrink-0 rounded-sm border border-lightGray bg-light3 px-1.5 py-0.5 text-[10px] font-normal leading-none text-subtleText">
                              무료배송
                            </span>
                          ) : null}
                        </p>
                        <p className="m-0 mt-1 text-bodySmall text-subtleText">
                          {resolveProductCategory(product) === 'shoes' ? 'Shoes' : 'Bag&Acc'}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-bodyRegular2 text-dark">
                        {formatAdminPrice(product.price)}
                      </td>
                      <td className="px-4 py-4 text-bodyRegular2 text-primaryText">
                        {formatAdminDiscountRate(product.discount_rate)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <AdminFlagCheckbox
                          label="NEW"
                          checked={isNew}
                          disabled={isSavingNew}
                          onChange={(next) => patchExposure(product.id, 'is_new', next)}
                        />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <AdminFlagCheckbox
                          label="FOR YOU"
                          checked={isForYou}
                          disabled={forYouCheckboxDisabled}
                          onChange={(next) => patchExposure(product.id, 'is_foru', next)}
                        />
                        {!isForYou && forYouLimitReached ? (
                          <p className="m-0 mt-1 max-w-[72px] text-[9px] leading-tight text-subtleText">
                            최대 {FOR_YOU_MAX_PRODUCTS}개
                          </p>
                        ) : null}
                        {isForYou ? (
                          <p className="m-0 mt-1 text-[10px] text-subtleText">
                            순서{' '}
                            {forYouProducts.findIndex((item) => item.id === product.id) + 1 || '-'}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-4">
                        <p className="m-0 text-bodyBold2 text-dark">
                          총 {totalStock.toLocaleString('ko-KR')}개
                        </p>
                        <p className="m-0 mt-0.5 text-[11px] text-subtleText">
                          {isExpanded ? '재고 패널 열림' : '행 클릭 · 재고 편집'}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-sm border px-2.5 py-1 text-bodySmall ${adminStockStatusClass(stockStatus)}`}
                        >
                          {adminStockStatusLabel(stockStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-4" onClick={stopRowToggle}>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="rounded-sm border border-lightGray bg-white px-3 py-2 text-bodySmall text-dark hover:border-dark"
                            onClick={() => navigateSpa(getAdminProductEditPath(product.id))}
                          >
                            수정
                          </button>
                          <button
                            type="button"
                            disabled={isDeleting}
                            className="rounded-sm border border-lightGray bg-white px-3 py-2 text-bodySmall text-subtleText hover:text-dark disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={() => removeProduct(product)}
                          >
                            {isDeleting ? '삭제 중…' : '삭제'}
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-t border-lightGray bg-light">
                      <td colSpan={11} className="p-0">
                        <div
                          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                            isExpanded
                              ? 'grid-rows-[1fr] opacity-100'
                              : 'grid-rows-[0fr] opacity-0'
                          }`}
                        >
                          <div className="overflow-hidden">
                            <AdminStockAccordionPanel
                              stock={product.stock}
                              category={productCategory}
                              isSaving={isSavingStock}
                              onSave={(nextStock) => patchStock(product.id, nextStock, productCategory)}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  )
}
