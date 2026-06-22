import { useEffect, useRef, useState } from 'react'
import { ProductEditorialThumbnail } from '../../components/molecules/ProductEditorialThumbnail'
import {
  adminProductTitle,
  fetchAdminProductById,
  fetchProductById,
  fetchProductRowById,
  formatAdminDiscountRate,
  formatAdminPrice,
  getProductThumbnailCandidates,
  mapProductRow,
  searchAdminProductsForPicker,
} from '../../lib/productsApi'

const PICKER_LIMIT = 50
const SEARCH_DEBOUNCE_MS = 300

function FieldLabel({ children, hint }) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium text-subtleText">{children}</span>
      {hint ? <span className="text-[10px] text-subtleText">{hint}</span> : null}
    </label>
  )
}

export function FormRow({ label, hint, children, alignTop = false, stacked = false }) {
  return (
    <div
      className={
        stacked
          ? 'flex flex-col gap-1 sm:gap-3'
          : `grid gap-1 sm:grid-cols-[108px_minmax(0,1fr)] sm:gap-3 ${
              alignTop ? 'sm:items-start' : 'sm:items-center'
            }`
      }
    >
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export function TextInput({ value, onChange, placeholder, multiline = false, rows = 3, className = '' }) {
  const cls =
    'w-full rounded-sm border border-lightGray bg-white px-2 py-1.5 text-[13px] text-dark outline-none focus:border-dark'
  if (multiline) {
    return (
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${cls} resize-y ${className}`}
      />
    )
  }
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`h-8 ${cls}`}
    />
  )
}

function useImageAspectRatio(url) {
  const [aspectRatio, setAspectRatio] = useState(1)

  useEffect(() => {
    if (!url) {
      setAspectRatio(1)
      return undefined
    }
    let cancelled = false
    const img = new Image()
    img.onload = () => {
      if (!cancelled && img.naturalWidth > 0 && img.naturalHeight > 0) {
        setAspectRatio(img.naturalWidth / img.naturalHeight)
      }
    }
    img.onerror = () => {
      if (!cancelled) setAspectRatio(1)
    }
    img.src = url
    return () => {
      cancelled = true
    }
  }, [url])

  return aspectRatio
}

export function ImageUploader({ label, spec, aspectClass, previewUrl, fileName, isUploading, onSelect, onClear }) {
  const inputRef = useRef(null)
  const naturalAspectRatio = useImageAspectRatio(previewUrl)
  const useDynamicAspect = !aspectClass
  const previewClassName = [
    'shrink-0 overflow-hidden rounded-sm border border-lightGray bg-light',
    aspectClass ?? (previewUrl ? '' : 'aspect-square w-[88px]'),
  ]
    .filter(Boolean)
    .join(' ')
  const previewStyle =
    useDynamicAspect && previewUrl ? { width: 88, aspectRatio: naturalAspectRatio } : undefined

  return (
    <div className="flex items-start gap-2.5">
      <div className={previewClassName} style={previewStyle}>
        {previewUrl ? (
          <img src={previewUrl} alt="" className="size-full object-cover" draggable={false} />
        ) : (
          <div className="flex size-full items-center justify-center text-[10px] text-subtleText">없음</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <FieldLabel hint={spec}>{label}</FieldLabel>
        <div className="mt-1 flex flex-wrap gap-1.5">
          <button
            type="button"
            disabled={isUploading}
            className="cursor-pointer rounded-sm border border-dashed border-lightGray bg-light3 px-2 py-1 text-[11px] text-dark hover:border-dark disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? '업로드…' : '선택'}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            tabIndex={-1}
            className="hidden"
            disabled={isUploading}
            onChange={onSelect}
            onFocus={(e) => e.target.blur()}
          />
          {previewUrl ? (
            <button
              type="button"
              className="rounded-sm border border-lightGray bg-white px-2 py-1 text-[11px] text-subtleText"
              onClick={onClear}
            >
              제거
            </button>
          ) : null}
        </div>
        {fileName ? <p className="m-0 mt-1 truncate text-[10px] text-textDefault">{fileName}</p> : null}
      </div>
    </div>
  )
}

async function resolveProductRowForThumbnail(productId) {
  const row = await fetchProductRowById(productId)
  if (row) return row
  try {
    return await fetchAdminProductById(productId)
  } catch {
    return null
  }
}

export function ProductIdField({ productId, slotLabel, onAssign, onClear }) {
  const [draft, setDraft] = useState(productId != null ? String(productId) : '')
  const [product, setProduct] = useState(null)
  const [thumbCandidates, setThumbCandidates] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setDraft(productId != null ? String(productId) : '')
  }, [productId])

  useEffect(() => {
    if (productId == null) {
      setProduct(null)
      setThumbCandidates([])
      return undefined
    }
    let cancelled = false
    setIsLoading(true)
    Promise.all([fetchProductById(productId), resolveProductRowForThumbnail(productId)])
      .then(([mapped, row]) => {
        if (cancelled) return
        setProduct(mapped ?? null)
        setThumbCandidates(row ? getProductThumbnailCandidates(row, 'square') : [])
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [productId])

  const commitDraft = () => {
    const trimmed = draft.trim()
    if (!trimmed) {
      onClear()
      return
    }
    const id = Number(trimmed)
    if (Number.isFinite(id)) onAssign(id)
  }

  return (
    <div className="rounded-sm border border-lightGray bg-white p-2">
      <p className="m-0 text-[11px] font-medium text-subtleText">{slotLabel}</p>
      <div className="mt-1.5 flex items-start gap-2">
        <div className="size-12 shrink-0 overflow-hidden rounded-sm border border-lightGray bg-light">
          {isLoading ? (
            <div className="flex size-full items-center justify-center text-[9px] text-subtleText">…</div>
          ) : thumbCandidates.length > 0 ? (
            <ProductEditorialThumbnail
              candidates={thumbCandidates}
              className="size-full"
              emptyLabel="없음"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-[9px] text-subtleText">없음</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <input
            type="text"
            inputMode="numeric"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitDraft}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitDraft()
            }}
            placeholder="상품 ID"
            className="h-8 w-full rounded-sm border border-lightGray bg-white px-2 text-[13px] outline-none focus:border-dark"
          />
          {product ? (
            <p className="m-0 mt-1 truncate text-[10px] text-dark">{adminProductTitle(product)}</p>
          ) : productId != null && !isLoading ? (
            <p className="m-0 mt-1 text-[10px] text-red-500">등록된 상품 없음</p>
          ) : null}
        </div>
        {productId != null ? (
          <button
            type="button"
            className="shrink-0 rounded-sm border border-lightGray bg-light3 px-1.5 py-0.5 text-[10px] text-subtleText"
            onClick={onClear}
          >
            해제
          </button>
        ) : null}
      </div>
    </div>
  )
}

export function ProductSlotPicker({ productId, slotLabel, onAssign, onClear }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [thumbCandidates, setThumbCandidates] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(productId == null)

  useEffect(() => {
    if (productId == null) {
      setSelected(null)
      setThumbCandidates([])
      setIsOpen(true)
      return undefined
    }
    let cancelled = false
    Promise.all([fetchProductById(productId), resolveProductRowForThumbnail(productId)]).then(
      ([product, row]) => {
        if (cancelled) return
        if (product) setSelected(product)
        setThumbCandidates(row ? getProductThumbnailCandidates(row, 'square') : [])
      },
    )
    setIsOpen(false)
    return () => {
      cancelled = true
    }
  }, [productId])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsSearching(true)
      searchAdminProductsForPicker({ query, limit: PICKER_LIMIT })
        .then(setResults)
        .finally(() => setIsSearching(false))
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [query])

  return (
    <div className="rounded-sm border border-lightGray bg-light3 p-2">
      <div className="flex items-center justify-between gap-2">
        <p className="m-0 text-[11px] font-medium text-subtleText">{slotLabel}</p>
        {selected ? (
          <button
            type="button"
            className="border-0 bg-transparent p-0 text-[10px] text-subtleText underline"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {isOpen ? '접기' : '변경'}
          </button>
        ) : null}
      </div>
      {selected ? (
        <div className="mt-1.5 flex items-center gap-2">
          <ProductEditorialThumbnail
            candidates={thumbCandidates}
            className="size-9 shrink-0 overflow-hidden rounded-sm bg-white"
            emptyLabel="없음"
          />
          <div className="min-w-0 flex-1">
            <p className="m-0 truncate text-[11px] text-dark">{adminProductTitle(selected)}</p>
            <p className="m-0 text-[10px] text-subtleText">
              {formatAdminDiscountRate(selected)} · {formatAdminPrice(selected)}
            </p>
          </div>
          <button
            type="button"
            className="rounded-sm border border-lightGray bg-white px-1.5 py-0.5 text-[10px] text-subtleText"
            onClick={onClear}
          >
            해제
          </button>
        </div>
      ) : (
        <p className="m-0 mt-1 text-[10px] text-subtleText">미등록</p>
      )}
      {isOpen ? (
        <>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="상품명·ID 검색"
            className="mt-1.5 h-7 w-full rounded-sm border border-lightGray bg-white px-2 text-[11px] outline-none focus:border-dark"
          />
          {query.trim() || results.length ? (
            <div className="mt-1 max-h-28 overflow-y-auto rounded-sm border border-lightGray bg-white">
              {isSearching ? (
                <p className="m-0 px-2 py-1.5 text-[10px] text-subtleText">검색 중…</p>
              ) : results.length ? (
                results.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    className="flex w-full items-center gap-1.5 border-0 border-b border-lightGray bg-transparent px-2 py-1.5 text-left last:border-b-0 hover:bg-light"
                    onClick={() => {
                      onAssign(row.id)
                      setSelected(mapProductRow(row))
                      setThumbCandidates(getProductThumbnailCandidates(row, 'square'))
                      setIsOpen(false)
                      setQuery('')
                    }}
                  >
                    <span className="shrink-0 text-[10px] text-subtleText">#{row.id}</span>
                    <span className="truncate text-[11px] text-dark">{row.name}</span>
                  </button>
                ))
              ) : (
                <p className="m-0 px-2 py-1.5 text-[10px] text-subtleText">결과 없음</p>
              )}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
