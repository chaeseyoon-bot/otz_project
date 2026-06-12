import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ADMIN_PRODUCT_NEW_PATH,
  ADMIN_PRODUCTS_PATH,
  parseAdminProductEditId,
} from '../../lib/adminRoutes'
import {
  adminProductCutPublicUrl,
  resolvePrimaryProductImageUrl,
  uploadAdminProductColorSwatchStrict,
  uploadAdminProductCutImagesStrict,
} from '../../lib/adminProductImageUpload'
import { mapFilesToProductCuts } from '../../lib/adminProductCutFileName'
import {
  ADMIN_FREE_SIZE,
  ADMIN_STOCK_SIZES,
  buildDefaultProductStockForCategory,
  DEFAULT_PRODUCT_STOCK_QTY,
  isShoesProductCategory,
  normalizeProductStockForCategory,
} from '../../lib/adminProductStock'
import { PRODUCT_PDP_CUTS } from '../../lib/productImage'
import {
  ADMIN_PRODUCT_CATEGORY_OPTIONS as CATEGORY_OPTIONS,
  coerceProductFlag,
  fetchAdminProductById,
  fetchAllProductsFromSupabase,
  formatAdminPrice,
  insertAdminProduct,
  isProductIdInCategoryRange,
  canRegisterMoreForYouProducts,
  FOR_YOU_MAX_PRODUCTS,
  forYouRegistrationBlockedMessage,
  parseForuSortOrder,
  storageFolderForProduct,
  suggestNextForuSortOrder,
  suggestNextProductId,
  suggestRegistrationCategoryAndId,
  updateAdminProduct,
  withFreshImageCacheBust,
} from '../../lib/productsApi'
import { imageUrlCacheVersion } from '../../lib/productImage'
import { navigateSpa } from '../../lib/spaNavigation'
import {
  extractColorNameFromProductName,
  guessColorHexFromName,
  normalizeAdminColorHexInput,
  normalizeColorHex,
  resolveColorHexFromPalette,
} from '../../lib/productColor'
import { DynamicColorSwatch } from '../../components/atoms/DynamicColorSwatch'
import { AdaptiveProductImage } from '../../components/molecules/AdaptiveProductImage'
import {
  ADMIN_SUBCATEGORY_AUTO,
  detectCollectionFromProductName,
  detectSubcategoryFromProductName,
  getAdminSubcategoryOptions,
  isAutoSubcategorySelection,
  normalizeSubcategoryLabel,
  resolveAdminSubcategoryForSave,
} from '../../data/productTaxonomy'

const FLASH_STORAGE_KEY = 'otz-admin-product-flash'

export function setAdminProductFlash(message) {
  sessionStorage.setItem(FLASH_STORAGE_KEY, message)
}

export function consumeAdminProductFlash() {
  const message = sessionStorage.getItem(FLASH_STORAGE_KEY)
  if (message) sessionStorage.removeItem(FLASH_STORAGE_KEY)
  return message
}

function SectionCard({ title, description, children }) {
  return (
    <section className="rounded-sm border border-lightGray bg-white">
      <div className="border-b border-lightGray px-6 py-5">
        <h3 className="m-0 text-bodyBold1 text-dark">{title}</h3>
        {description ? (
          <p className="m-0 mt-2 text-bodySmall text-subtleText">{description}</p>
        ) : null}
      </div>
      <div className="px-6 py-6">{children}</div>
    </section>
  )
}

function FieldLabel({ children, hint, required = false }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-bodySmall text-subtleText">
        {children}
        {required ? <span className="ml-0.5 text-primaryText">*</span> : null}
      </span>
      {hint ? <span className="text-[11px] text-subtleText">{hint}</span> : null}
    </label>
  )
}

function TextField({
  value,
  onChange,
  onBlur,
  placeholder,
  type = 'text',
  disabled = false,
  min,
  max,
}) {
  return (
    <input
      type={type}
      value={value}
      min={min}
      max={max}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      className="h-11 w-full rounded-sm border border-lightGray bg-white px-3 text-bodyRegular2 text-dark outline-none transition-colors placeholder:text-subtleText focus:border-dark disabled:cursor-not-allowed disabled:bg-light3 disabled:text-subtleText"
    />
  )
}

function sampleHexFromImageAtPoint(img, clientX, clientY, clickRect) {
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas unavailable')

  ctx.drawImage(img, 0, 0)
  const x = Math.min(
    canvas.width - 1,
    Math.max(0, Math.floor(((clientX - clickRect.left) / clickRect.width) * canvas.width)),
  )
  const y = Math.min(
    canvas.height - 1,
    Math.max(0, Math.floor(((clientY - clickRect.top) / clickRect.height) * canvas.height)),
  )
  const [r, g, b] = ctx.getImageData(x, y, 1, 1).data
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

function AdminColorPickerRow({ colorHex, cut03PreviewUrl, onChangeHex }) {
  const normalizedHex = normalizeAdminColorHexInput(colorHex)
  const imageHostRef = useRef(null)
  const colorInputRef = useRef(null)
  const [eyeDropperError, setEyeDropperError] = useState(null)
  const [imageUnavailable, setImageUnavailable] = useState(false)

  useEffect(() => {
    setImageUnavailable(false)
  }, [cut03PreviewUrl])

  const canPickFromImage = Boolean(cut03PreviewUrl) && !imageUnavailable

  const handlePickFromImage = async (event) => {
    const displayImg = imageHostRef.current?.querySelector('img')
    if (!displayImg || !cut03PreviewUrl || imageUnavailable) return
    if (!displayImg.complete || !displayImg.naturalWidth) return

    const clickRect = displayImg.getBoundingClientRect()

    try {
      const hex = sampleHexFromImageAtPoint(
        displayImg,
        event.clientX,
        event.clientY,
        clickRect,
      )
      onChangeHex(hex)
      setEyeDropperError(null)
      return
    } catch {
      // fall through to blob fetch for cross-origin storage URLs
    }

    if (cut03PreviewUrl.startsWith('blob:') || cut03PreviewUrl.startsWith('data:')) {
      setEyeDropperError('이미지에서 색상을 읽지 못했습니다. 파일을 다시 업로드해 주세요.')
      return
    }

    try {
      const response = await fetch(cut03PreviewUrl)
      if (!response.ok) throw new Error('fetch failed')
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const tempImg = new Image()
      await new Promise((resolve, reject) => {
        tempImg.onload = resolve
        tempImg.onerror = reject
        tempImg.src = blobUrl
      })
      const hex = sampleHexFromImageAtPoint(
        tempImg,
        event.clientX,
        event.clientY,
        clickRect,
      )
      URL.revokeObjectURL(blobUrl)
      onChangeHex(hex)
      setEyeDropperError(null)
    } catch {
      setEyeDropperError('이미지에서 색상을 읽지 못했습니다. 파일을 다시 업로드해 주세요.')
    }
  }

  const handleEyeDropper = async () => {
    setEyeDropperError(null)
    if (typeof window.EyeDropper !== 'function') {
      setEyeDropperError('스포이트를 사용할 수 없습니다. 썸네일을 클릭해 주세요.')
      return
    }
    try {
      const dropper = new window.EyeDropper()
      const result = await dropper.open()
      onChangeHex(result.sRGBHex)
    } catch {
      // user cancelled
    }
  }

  return (
    <div className="grid w-full gap-4 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-6">
      <div
        ref={imageHostRef}
        role="button"
        tabIndex={canPickFromImage ? 0 : -1}
        onClick={canPickFromImage ? handlePickFromImage : undefined}
        className={`flex aspect-square w-full max-w-[180px] items-center justify-center overflow-hidden rounded-sm border border-lightGray bg-white p-2 lg:max-w-none ${
          canPickFromImage ? 'cursor-crosshair hover:border-dark' : 'opacity-50'
        }`}
        aria-label="컷 03에서 색상 추출"
      >
        {cut03PreviewUrl && !imageUnavailable ? (
          <AdaptiveProductImage
            src={cut03PreviewUrl}
            alt=""
            orientation="square"
            containClassName="pointer-events-none max-h-full max-w-full object-contain mix-blend-multiply"
            portraitClassName="pointer-events-none max-h-full max-w-full object-contain mix-blend-multiply"
            draggable={false}
            onFinalError={() => setImageUnavailable(true)}
          />
        ) : (
          <span className="px-2 text-center text-[11px] text-subtleText">
            {cut03PreviewUrl ? '컷 03 이미지 없음' : '컷 03'}
          </span>
        )}
      </div>

      <div className="flex min-h-[180px] flex-col justify-between gap-4 rounded-sm border border-lightGray bg-light3 px-5 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <DynamicColorSwatch hex={normalizedHex} sizeClassName="size-12" />
          <span className="font-mono text-bodyRegular2 uppercase text-dark">{normalizedHex}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleEyeDropper}
            className="h-10 rounded-sm border border-dark bg-white px-4 text-bodySmall text-dark hover:bg-white/80"
          >
            스포이트
          </button>
          <button
            type="button"
            onClick={() => colorInputRef.current?.click()}
            className="h-10 rounded-sm border border-lightGray bg-white px-4 text-bodySmall text-dark hover:border-dark"
          >
            색상표
          </button>
          <input
            ref={colorInputRef}
            type="color"
            value={normalizedHex}
            onChange={(event) => onChangeHex(event.target.value)}
            className="sr-only"
            aria-label="컬러 선택"
            tabIndex={-1}
          />
        </div>

        {eyeDropperError ? (
          <p className="m-0 text-[11px] text-primaryText">{eyeDropperError}</p>
        ) : null}
      </div>
    </div>
  )
}

function ToggleField({ checked, onChange, label, description, disabled = false }) {
  return (
    <label
      className={`flex items-start gap-3 rounded-sm border border-lightGray bg-light3 px-4 py-4 transition-colors ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-dark/20'
      }`}
    >
      <input
        type="checkbox"
        className="mt-0.5 size-4 shrink-0 accent-dark"
        checked={checked}
        disabled={disabled}
        onChange={(e) => {
          if (!disabled) onChange(e.target.checked)
        }}
      />
      <span className="min-w-0">
        <span className="block text-bodyRegular2 text-dark">{label}</span>
        {description ? (
          <span className="mt-1 block text-bodySmall text-subtleText">{description}</span>
        ) : null}
      </span>
    </label>
  )
}

function createEmptyForm(existingIds = []) {
  const { category, id } = suggestRegistrationCategoryAndId(existingIds)
  return {
    id: id != null ? String(id) : '',
    category,
    subcategory: ADMIN_SUBCATEGORY_AUTO,
    collection: '',
    keywords: '',
    name: '',
    price: '',
    discountRate: '0',
    isNew: false,
    isForYou: false,
    foruSortOrder: null,
    freeShipping: true,
    colorName: '',
    colorHex: '#000000',
    stock: buildDefaultProductStockForCategory(category),
  }
}

function formFromProduct(product) {
  const category = String(product.category ?? 'shoes01')
  const name = String(product.name ?? '')
  const savedColorName = String(product.color_name ?? '').trim()
  const autoColorName = savedColorName || extractColorNameFromProductName(name)
  const savedHex = normalizeColorHex(product.color_hex)
  const autoHex = savedHex ?? guessColorHexFromName(autoColorName) ?? '#000000'
  return {
    id: String(product.id),
    category,
    subcategory: product.subcategory
      ? String(normalizeSubcategoryLabel(product.subcategory) ?? product.subcategory)
      : ADMIN_SUBCATEGORY_AUTO,
    collection: String(product.collection ?? detectCollectionFromProductName(name) ?? ''),
    keywords: String(product.tags ?? ''),
    name,
    price: String(product.price ?? 0),
    discountRate: String(product.discount_rate ?? 0),
    isNew: coerceProductFlag(product.is_new),
    isForYou: coerceProductFlag(product.is_foru),
    foruSortOrder: parseForuSortOrder(product.foru_sort_order),
    freeShipping:
      product.free_shipping == null ? true : coerceProductFlag(product.free_shipping),
    colorName: autoColorName,
    colorHex: normalizeAdminColorHexInput(autoHex, '#000000'),
    stock: normalizeProductStockForCategory(product.stock, category),
  }
}

function ProductCutUploader({ cut, previewUrl, onSelect, onClear, disabled }) {
  const inputId = `product-cut-${cut}`

  return (
    <div className="flex flex-col gap-2 rounded-sm border border-lightGray bg-light3 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-bodySmall font-medium text-dark">컷 {cut}</span>
        {previewUrl ? (
          <button
            type="button"
            disabled={disabled}
            className="text-[11px] text-subtleText underline-offset-2 hover:text-dark hover:underline disabled:opacity-50"
            onClick={onClear}
          >
            제거
          </button>
        ) : null}
      </div>
      <div className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-sm border border-lightGray bg-white">
        {previewUrl ? (
          <AdaptiveProductImage
            src={previewUrl}
            alt=""
            orientation={cut === '03' ? 'square' : undefined}
            containClassName="w-full object-contain object-center mix-blend-multiply"
            portraitClassName="size-full object-cover object-center mix-blend-multiply"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-[11px] text-subtleText">
            이미지 없음
          </div>
        )}
      </div>
      <label
        htmlFor={inputId}
        className={`inline-flex h-9 items-center justify-center rounded-sm border border-dark bg-white px-3 text-bodySmall text-dark transition-opacity ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-light3'
        }`}
      >
        파일 선택
      </label>
      <input
        id={inputId}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onSelect(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}

/** Commerce-style admin product registration / edit form. */
export function ProductRegistration({ pathname }) {
  const editId = parseAdminProductEditId(pathname)
  const isEditMode = editId != null

  const [form, setForm] = useState(() => createEmptyForm())
  const [existingIds, setExistingIds] = useState([])
  const [catalogRows, setCatalogRows] = useState([])
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [loadError, setLoadError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [toast, setToast] = useState(null)
  const [pendingFiles, setPendingFiles] = useState({})
  const [previewUrls, setPreviewUrls] = useState({})
  const [existingImageUrl, setExistingImageUrl] = useState(null)
  const [existingColorSwatchUrl, setExistingColorSwatchUrl] = useState(null)
  const [pendingColorSwatchFile, setPendingColorSwatchFile] = useState(null)
  const [colorSwatchPreviewUrl, setColorSwatchPreviewUrl] = useState(null)
  const colorNameManualRef = useRef(false)
  const colorHexManualRef = useRef(false)

  const showToast = useCallback((message) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2400)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      setIsLoading(true)
      setLoadError(null)
      try {
        const rows = await fetchAllProductsFromSupabase()
        if (cancelled) return
        setExistingIds(rows.map((row) => row.id))
        setCatalogRows(rows)

        if (isEditMode && editId != null) {
          const product = rows.find((row) => row.id === editId) ?? (await fetchAdminProductById(editId))
          if (!product) {
            setLoadError('상품을 찾을 수 없습니다.')
            return
          }
          const nextForm = formFromProduct(product)
          setForm(nextForm)
          const storedImageUrl =
            typeof product.image_url === 'string' && product.image_url.trim()
              ? product.image_url.trim()
              : null
          setExistingImageUrl(storedImageUrl)
          const storedSwatchUrl =
            typeof product.color_swatch_url === 'string' && product.color_swatch_url.trim()
              ? product.color_swatch_url.trim()
              : null
          setExistingColorSwatchUrl(storedSwatchUrl)
          setColorSwatchPreviewUrl(storedSwatchUrl)
          colorNameManualRef.current = Boolean(String(product.color_name ?? '').trim())
          colorHexManualRef.current = Boolean(normalizeColorHex(product.color_hex))
          const folder = storageFolderForProduct(nextForm.category, product.id)
          const cacheVersion = imageUrlCacheVersion(storedImageUrl)
          const existingPreviews = Object.fromEntries(
            PRODUCT_PDP_CUTS.map((cut) => [
              cut,
              adminProductCutPublicUrl(folder, product.id, cut, 'png', cacheVersion),
            ]),
          )
          setPreviewUrls(existingPreviews)
        } else {
          setForm(createEmptyForm(rows.map((row) => row.id)))
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : String(err))
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [editId, isEditMode])

  const numericId = Number(form.id)
  const numericPrice = Number(form.price)
  const numericDiscount = Number(form.discountRate)
  const folder = useMemo(() => {
    if (!Number.isFinite(numericId) || numericId <= 0) return null
    return storageFolderForProduct(form.category, numericId)
  }, [form.category, numericId])

  const discountedPrice = useMemo(() => {
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) return 0
    const rate = Number.isFinite(numericDiscount) ? numericDiscount : 0
    return Math.round(numericPrice * (1 - rate / 100))
  }, [numericDiscount, numericPrice])

  const stockTotal = useMemo(
    () => Object.values(form.stock).reduce((sum, qty) => sum + qty, 0),
    [form.stock],
  )

  const subcategoryOptions = useMemo(
    () => getAdminSubcategoryOptions(form.category),
    [form.category],
  )

  const detectedSubcategoryPreview = useMemo(
    () => detectSubcategoryFromProductName(form.name, form.category),
    [form.category, form.name],
  )

  const forYouLimitBlocksToggle = useMemo(() => {
    if (form.isForYou) return false
    if (!Number.isFinite(numericId) || numericId <= 0) {
      return catalogRows.filter((row) => coerceProductFlag(row.is_foru)).length >= FOR_YOU_MAX_PRODUCTS
    }
    return !canRegisterMoreForYouProducts(catalogRows, numericId)
  }, [catalogRows, form.isForYou, numericId])

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleNameChange = (value) => {
    const collection = detectCollectionFromProductName(value) ?? ''
    if (!value.trim()) {
      colorNameManualRef.current = false
      colorHexManualRef.current = false
      setForm((prev) => ({
        ...prev,
        name: value,
        collection,
        colorName: '',
        colorHex: '#000000',
      }))
      return
    }

    setForm((prev) => {
      const next = { ...prev, name: value, collection }
      if (!colorNameManualRef.current) {
        const extracted = extractColorNameFromProductName(value)
        next.colorName = extracted
        if (!colorHexManualRef.current) {
          const guessedHex = guessColorHexFromName(extracted)
          if (guessedHex) next.colorHex = guessedHex
        }
      }
      return next
    })
  }

  const handleColorNameChange = (value) => {
    colorNameManualRef.current = true
    const guessedHex = resolveColorHexFromPalette(value)
    setForm((prev) => ({
      ...prev,
      colorName: value,
      ...(guessedHex && !colorHexManualRef.current ? { colorHex: guessedHex } : {}),
    }))
  }

  const cut03PreviewUrl = useMemo(() => {
    if (previewUrls['03']) return previewUrls['03']
    if (existingImageUrl && /_03_big\./i.test(existingImageUrl)) {
      return existingImageUrl
    }
    return null
  }, [existingImageUrl, previewUrls])

  const handleColorHexChange = (value) => {
    colorHexManualRef.current = true
    updateField('colorHex', value)
  }

  const handleCategoryChange = (category) => {
    const nextId = isEditMode ? undefined : suggestNextProductId(category, existingIds)
    setForm((prev) => ({
      ...prev,
      category,
      subcategory: ADMIN_SUBCATEGORY_AUTO,
      id: isEditMode ? prev.id : nextId != null ? String(nextId) : '',
      stock:
        prev.category === category
          ? prev.stock
          : buildDefaultProductStockForCategory(category),
    }))
  }

  const handleSelectColorSwatch = (file) => {
    if (colorSwatchPreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(colorSwatchPreviewUrl)
    }
    setPendingColorSwatchFile(file)
    setColorSwatchPreviewUrl(URL.createObjectURL(file))
  }

  const handleClearColorSwatch = () => {
    if (colorSwatchPreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(colorSwatchPreviewUrl)
    }
    setPendingColorSwatchFile(null)
    setColorSwatchPreviewUrl(null)
    setExistingColorSwatchUrl(null)
  }

  const handleStockChange = (size, rawValue) => {
    const numeric = Math.max(0, Math.round(Number(rawValue) || 0))
    setForm((prev) => ({
      ...prev,
      stock: { ...prev.stock, [size]: numeric },
    }))
  }

  const handleSelectCut = (cut, file) => {
    const objectUrl = URL.createObjectURL(file)
    setPendingFiles((prev) => ({ ...prev, [cut]: file }))
    setPreviewUrls((prev) => {
      const previous = prev[cut]
      if (previous?.startsWith('blob:')) URL.revokeObjectURL(previous)
      return { ...prev, [cut]: objectUrl }
    })
  }

  const handleClearCut = (cut) => {
    setPendingFiles((prev) => {
      const next = { ...prev }
      delete next[cut]
      return next
    })
    setPreviewUrls((prev) => {
      const next = { ...prev }
      const previous = next[cut]
      if (previous?.startsWith('blob:')) URL.revokeObjectURL(previous)
      if (isEditMode && folder && Number.isFinite(numericId)) {
        next[cut] = adminProductCutPublicUrl(
          folder,
          numericId,
          cut,
          'png',
          imageUrlCacheVersion(existingImageUrl),
        )
      } else {
        delete next[cut]
      }
      return next
    })
  }

  const handleBulkSelectCuts = (fileList) => {
    const files = Array.from(fileList ?? [])
    if (!files.length) return

    const { mapped, skipped, duplicateCuts } = mapFilesToProductCuts(files)
    const mappedCount = Object.keys(mapped).length

    if (mappedCount === 0) {
      showToast('파일명에서 컷 번호(01~08)를 찾지 못했습니다.')
      return
    }

    setPendingFiles((prev) => ({ ...prev, ...mapped }))
    setPreviewUrls((prev) => {
      const next = { ...prev }
      for (const [cut, file] of Object.entries(mapped)) {
        const previous = next[cut]
        if (previous?.startsWith('blob:')) URL.revokeObjectURL(previous)
        next[cut] = URL.createObjectURL(file)
      }
      return next
    })

    const parts = [`${mappedCount}개 컷에 이미지를 배치했습니다.`]
    if (duplicateCuts.length > 0) {
      parts.push(`중복 컷(마지막 파일 적용): ${duplicateCuts.join(', ')}`)
    }
    if (skipped.length > 0) {
      parts.push(`건너뜀 ${skipped.length}개`)
    }
    showToast(parts.join(' '))
  }

  const validateForm = () => {
    if (!form.name.trim()) return '상품명을 입력해 주세요.'
    if (!form.subcategory.trim()) return '서브카테고리를 선택해 주세요.'
    if (isAutoSubcategorySelection(form.subcategory) && !detectedSubcategoryPreview) {
      return '상품명에서 서브카테고리를 감지하지 못했습니다. 상품명을 확인하거나 서브카테고리를 직접 선택해 주세요.'
    }
    if (!Number.isFinite(numericId) || numericId <= 0) return '유효한 상품 ID를 입력해 주세요.'
    if (!isEditMode && existingIds.includes(numericId)) return '이미 사용 중인 상품 ID입니다.'
    if (!isProductIdInCategoryRange(numericId, form.category)) {
      const option = CATEGORY_OPTIONS.find((item) => item.value === form.category)
      return `${option?.label ?? '선택한 카테고리'}의 ID 범위(${option?.hint ?? ''})에 맞지 않습니다.`
    }
    if (!Number.isFinite(numericPrice) || numericPrice < 0) return '판매가를 입력해 주세요.'
    if (!Number.isFinite(numericDiscount) || numericDiscount < 0 || numericDiscount > 100) {
      return '할인율은 0~100 사이로 입력해 주세요.'
    }
    if (!isEditMode && Object.keys(pendingFiles).length === 0) {
      return '상품 이미지를 최소 1개 업로드해 주세요.'
    }
    if (!folder) return '상품 ID와 카테고리를 확인해 주세요.'
    if (
      form.isForYou &&
      Number.isFinite(numericId) &&
      !canRegisterMoreForYouProducts(catalogRows, numericId)
    ) {
      return forYouRegistrationBlockedMessage()
    }
    return null
  }

  const handleSubmit = async () => {
    const validationError = validateForm()
    if (validationError) {
      setSubmitError(validationError)
      return
    }

    setSubmitError(null)
    setIsSaving(true)

    const foruSortOrder = form.isForYou
      ? (parseForuSortOrder(form.foruSortOrder) ??
        suggestNextForuSortOrder(catalogRows.filter((row) => row.id !== numericId)))
      : null

    const basePayload = {
      category: form.category,
      subcategory: resolveAdminSubcategoryForSave(
        form.subcategory,
        form.name.trim(),
        form.category,
      ),
      collection: form.collection.trim() || detectCollectionFromProductName(form.name.trim()) || null,
      tags: form.keywords.trim() || null,
      name: form.name.trim(),
      price: numericPrice,
      discount_rate: numericDiscount,
      is_new: form.isNew,
      is_foru: form.isForYou,
      foru_sort_order: foruSortOrder,
      free_shipping: form.freeShipping,
      color_name: form.colorName.trim() || null,
      color_hex: normalizeColorHex(form.colorHex),
      stock: form.stock,
    }

    try {
      let imageUrl = existingImageUrl

      if (Object.keys(pendingFiles).length > 0) {
        const uploadedUrls = await uploadAdminProductCutImagesStrict(pendingFiles, folder, numericId)
        imageUrl = resolvePrimaryProductImageUrl(
          uploadedUrls,
          folder,
          numericId,
          existingImageUrl,
        )
        imageUrl = withFreshImageCacheBust(imageUrl)
      } else if (!imageUrl) {
        imageUrl = resolvePrimaryProductImageUrl({}, folder, numericId, existingImageUrl)
      }

      let colorSwatchUrl = existingColorSwatchUrl
      if (pendingColorSwatchFile) {
        colorSwatchUrl = await uploadAdminProductColorSwatchStrict(
          pendingColorSwatchFile,
          folder,
          numericId,
        )
      } else if (!colorSwatchPreviewUrl) {
        colorSwatchUrl = null
      }

      const savePayload = {
        ...basePayload,
        image_url: imageUrl,
        color_swatch_url: colorSwatchUrl,
      }

      if (isEditMode && editId != null) {
        await updateAdminProduct(editId, savePayload)
      } else {
        await insertAdminProduct({ id: numericId, ...savePayload })
      }

      setAdminProductFlash(isEditMode ? '상품 정보가 수정되었습니다.' : '상품이 등록되었습니다.')
      navigateSpa(ADMIN_PRODUCTS_PATH)
    } catch (err) {
      const message = err instanceof Error ? err.message : '저장에 실패했습니다.'
      setSubmitError(message)
      showToast(message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="px-8 py-8">
        <p className="m-0 text-bodyRegular2 text-textDefault">상품 정보를 불러오는 중…</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="px-8 py-8">
        <div className="rounded-sm border border-lightGray bg-light px-4 py-5">
          <p className="m-0 text-bodyRegular2 text-primaryText">{loadError}</p>
          <button
            type="button"
            className="mt-4 rounded-sm border border-dark bg-dark px-4 py-2 text-bodySmall text-white"
            onClick={() => navigateSpa(ADMIN_PRODUCTS_PATH)}
          >
            목록으로
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-0 flex-1 overflow-y-auto px-8 py-8">
      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-sm border border-dark bg-dark px-4 py-3 text-bodySmall text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-lightGray pb-6">
        <div>
          <button
            type="button"
            className="mb-3 text-bodySmall text-subtleText underline-offset-2 hover:text-dark hover:underline"
            onClick={() => navigateSpa(ADMIN_PRODUCTS_PATH)}
          >
            ← 상품 목록
          </button>
          <h2 className="m-0 text-h3 text-dark">{isEditMode ? '상품 수정' : '상품 등록'}</h2>
          <p className="m-0 mt-2 text-bodyRegular2 text-textDefault">
            기본 정보, 가격, 노출 설정, 사이즈별 재고, PDP 이미지를 등록합니다.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-sm border border-lightGray bg-white px-5 py-3 text-bodyRegular2 text-dark transition-colors hover:border-dark"
            onClick={() => navigateSpa(ADMIN_PRODUCTS_PATH)}
          >
            취소
          </button>
          <button
            type="button"
            disabled={isSaving}
            className="rounded-sm border border-dark bg-dark px-5 py-3 text-bodyRegular2 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            onClick={handleSubmit}
          >
            {isSaving ? '저장 중…' : isEditMode ? '수정 완료' : '상품 등록'}
          </button>
        </div>
      </header>

      {submitError ? (
        <div className="mb-5 rounded-sm border border-primaryText/20 bg-light px-4 py-3 text-bodySmall text-primaryText">
          {submitError}
        </div>
      ) : null}

      <div className="flex flex-col gap-6">
        <SectionCard
          title="기본 정보"
          description="카테고리와 상품 ID는 Storage 이미지 경로 및 PLP/PDP 노출 분류에 사용됩니다."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <FieldLabel hint="Storage 폴더 및 ID 범위 기준" required>
                카테고리
              </FieldLabel>
              <select
                value={form.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-sm border border-lightGray bg-white px-3 text-bodyRegular2 text-dark outline-none focus:border-dark"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.hint})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <FieldLabel hint={isEditMode ? '등록 후 ID는 변경할 수 없습니다.' : '자동 추천 ID를 확인해 주세요.'} required>
                상품 ID
              </FieldLabel>
              <div className="mt-1.5 flex flex-wrap items-center gap-4">
                <div className="min-w-[140px] flex-1">
                  <TextField
                    value={form.id}
                    disabled={isEditMode}
                    type="number"
                    min={1}
                    onChange={(value) => updateField('id', value)}
                    placeholder="예: 1043"
                  />
                </div>
                <label className="flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-sm border border-lightGray bg-white px-4 text-bodyRegular2 text-dark">
                  <input
                    type="checkbox"
                    className="size-4 shrink-0 accent-dark"
                    checked={form.freeShipping}
                    onChange={(e) => updateField('freeShipping', e.target.checked)}
                  />
                  무료배송
                </label>
              </div>
              {!isEditMode && !form.id ? (
                <p className="m-0 mt-2 text-bodySmall text-primaryText">
                  {(() => {
                    const option = CATEGORY_OPTIONS.find((item) => item.value === form.category)
                    return `${option?.label ?? form.category} ID 범위(${option?.hint ?? ''})가 모두 사용 중입니다. 다른 카테고리를 선택하거나 사용 가능한 ID를 직접 입력해 주세요.`
                  })()}
                </p>
              ) : null}
            </div>

            {subcategoryOptions.length > 0 ? (
              <div>
                <FieldLabel hint="상품명 키워드로 자동 감지되며, 필요 시 수동 변경 가능합니다." required>
                  서브카테고리
                </FieldLabel>
                <select
                  value={form.subcategory}
                  onChange={(e) => updateField('subcategory', e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-sm border border-lightGray bg-white px-3 text-bodyRegular2 text-dark outline-none focus:border-dark"
                >
                  <option value={ADMIN_SUBCATEGORY_AUTO}>자동</option>
                  {subcategoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {isAutoSubcategorySelection(form.subcategory) ? (
                  <p className="m-0 mt-2 text-bodySmall text-subtleText">
                    감지 결과: {detectedSubcategoryPreview || '— (상품명 입력 후 자동 분류)'}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className={subcategoryOptions.length > 0 ? '' : 'lg:col-span-2'}>
              <FieldLabel hint="상품명 키워드로 COLLECTION 탭에 자동 분류됩니다.">
                컬렉션 (자동)
              </FieldLabel>
              <div className="mt-1.5 flex h-11 items-center rounded-sm border border-lightGray bg-light3 px-3 text-bodyRegular2 text-dark">
                {form.collection || '—'}
              </div>
            </div>

            <div className="lg:col-span-2">
              <FieldLabel required>상품명</FieldLabel>
              <div className="mt-1.5 w-full">
                <TextField
                  value={form.name}
                  onChange={handleNameChange}
                  placeholder="예: [오찌x우무] 비들 레인부츠 크림 FLOTGS2W21"
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <FieldLabel hint="쉼표(,)로 구분. 스토어 검색 시 상품명과 함께 매칭됩니다.">
                검색 키워드
              </FieldLabel>
              <textarea
                value={form.keywords}
                rows={2}
                placeholder="예: 메리제인, 레인부츠, 오찌x우무"
                onChange={(e) => updateField('keywords', e.target.value)}
                className="mt-1.5 min-h-[72px] w-full resize-y rounded-sm border border-lightGray bg-white px-3 py-2.5 text-bodyRegular2 text-dark outline-none transition-colors placeholder:text-subtleText focus:border-dark"
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="컬러 필터">
          <div className="flex flex-col gap-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-x-10">
              <div>
                <FieldLabel>컬러 이름</FieldLabel>
                <div className="mt-1.5">
                  <TextField
                    value={form.colorName}
                    onChange={handleColorNameChange}
                    placeholder="예: 크림, 블랙"
                  />
                </div>
              </div>
            </div>

            <div>
              <FieldLabel>컬러 선택</FieldLabel>
              <div className="mt-1.5">
                <AdminColorPickerRow
                  colorHex={form.colorHex}
                  cut03PreviewUrl={cut03PreviewUrl}
                  onChangeHex={handleColorHexChange}
                />
              </div>
            </div>

            <div className="border-t border-lightGray pt-5">
              <FieldLabel>질감 이미지 (선택)</FieldLabel>
              <div className="mt-1.5 flex flex-wrap items-center gap-3">
                <div className="flex size-16 items-center justify-center overflow-hidden rounded-sm border border-lightGray bg-white">
                  {colorSwatchPreviewUrl ? (
                    <img src={colorSwatchPreviewUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <DynamicColorSwatch hex={form.colorHex} sizeClassName="size-10" />
                  )}
                </div>
                <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-sm border border-dark bg-white px-4 text-bodySmall text-dark hover:bg-light3">
                  파일 선택
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) handleSelectColorSwatch(file)
                      event.target.value = ''
                    }}
                  />
                </label>
                {colorSwatchPreviewUrl ? (
                  <button
                    type="button"
                    className="h-10 border-0 bg-transparent px-2 text-bodySmall text-subtleText underline-offset-2 hover:text-dark hover:underline"
                    onClick={handleClearColorSwatch}
                  >
                    제거
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="가격 정보" description="정가와 할인율을 입력하면 판매가가 자동 계산됩니다.">
          <div className="grid gap-5 lg:grid-cols-3">
            <div>
              <FieldLabel required>정가 (원)</FieldLabel>
              <TextField
                value={form.price}
                type="number"
                min={0}
                onChange={(value) => updateField('price', value)}
                placeholder="50330"
              />
            </div>

            <div>
              <FieldLabel hint="0 ~ 100">할인율 (%)</FieldLabel>
              <TextField
                value={form.discountRate}
                type="number"
                min={0}
                max={100}
                onChange={(value) => updateField('discountRate', value)}
                placeholder="0"
              />
            </div>

            <div className="rounded-sm border border-lightGray bg-light3 px-4 py-4">
              <p className="m-0 text-bodySmall text-subtleText">판매가 미리보기</p>
              <p className="m-0 mt-2 text-bodyBold1 text-dark">
                {discountedPrice > 0 ? formatAdminPrice(discountedPrice) : '-'}
              </p>
              {numericDiscount > 0 && numericPrice > 0 ? (
                <p className="m-0 mt-1 text-bodySmall text-subtleText line-through">
                  {formatAdminPrice(numericPrice)}
                </p>
              ) : null}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="판매 · 노출 설정">
          <div className="grid gap-3 lg:grid-cols-2">
            <ToggleField
              checked={form.isNew}
              onChange={(value) => updateField('isNew', value)}
              label="NEW 상품"
              description="NEW PLP 및 신상품 영역에 노출할 수 있습니다."
            />
            <ToggleField
              checked={form.isForYou}
              disabled={forYouLimitBlocksToggle}
              onChange={(value) => {
                setForm((prev) => ({
                  ...prev,
                  isForYou: value,
                  foruSortOrder: value ? prev.foruSortOrder : null,
                }))
              }}
              label="For You 메인 노출"
              description={
                forYouLimitBlocksToggle
                  ? forYouRegistrationBlockedMessage()
                  : `홈 For You 섹션에 노출합니다. 최대 ${FOR_YOU_MAX_PRODUCTS}개 · 순서는 상품 관리에서 조정합니다.`
              }
            />
          </div>
        </SectionCard>

        <SectionCard
          title="재고 관리"
          description={
            isShoesProductCategory(form.category)
              ? `220 ~ 260 (5단위) · 기본 ${DEFAULT_PRODUCT_STOCK_QTY}개 · 현재 합계 ${stockTotal.toLocaleString('ko-KR')}개`
              : `FREE 사이즈 · 기본 ${DEFAULT_PRODUCT_STOCK_QTY}개 · 현재 ${stockTotal.toLocaleString('ko-KR')}개`
          }
        >
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-sm border border-lightGray bg-white px-3 py-2 text-bodySmall text-dark hover:border-dark"
              onClick={() => updateField('stock', buildDefaultProductStockForCategory(form.category))}
            >
              기본 재고 ({DEFAULT_PRODUCT_STOCK_QTY}) 채우기
            </button>
          </div>
          {isShoesProductCategory(form.category) ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 xl:grid-cols-9">
              {ADMIN_STOCK_SIZES.map((size) => (
                <label
                  key={size}
                  className="flex flex-col gap-1.5 rounded-sm border border-lightGray bg-light3 p-3"
                >
                  <span className="text-[11px] font-medium leading-none text-subtleText">{size}</span>
                  <input
                    type="number"
                    min={0}
                    value={form.stock[size] ?? DEFAULT_PRODUCT_STOCK_QTY}
                    onChange={(e) => handleStockChange(size, e.target.value)}
                    className="h-9 w-full rounded-sm border border-lightGray bg-white px-2 text-center text-bodyRegular2 text-dark outline-none focus:border-dark"
                  />
                </label>
              ))}
            </div>
          ) : (
            <label className="flex max-w-[200px] flex-col gap-1.5 rounded-sm border border-lightGray bg-light3 p-3">
              <span className="text-[11px] font-medium leading-none text-subtleText">{ADMIN_FREE_SIZE}</span>
              <input
                type="number"
                min={0}
                value={form.stock[ADMIN_FREE_SIZE] ?? DEFAULT_PRODUCT_STOCK_QTY}
                onChange={(e) => handleStockChange(ADMIN_FREE_SIZE, e.target.value)}
                className="h-9 w-full rounded-sm border border-lightGray bg-white px-2 text-center text-bodyRegular2 text-dark outline-none focus:border-dark"
              />
            </label>
          )}
        </SectionCard>

        <SectionCard
          title="상품 이미지"
          description={
            folder
              ? `Storage 경로: products/${folder}/detail_${numericId}_{01~08}_big.png`
              : '상품 ID와 카테고리를 먼저 입력하면 업로드 경로가 결정됩니다.'
          }
        >
          <div className="mb-5 flex flex-col gap-3 rounded-sm border border-dashed border-lightGray bg-light3 p-4">
            <div className="flex flex-col gap-1">
              <p className="m-0 text-bodyRegular2 text-dark">한꺼번에 업로드</p>
              <p className="m-0 text-bodySmall text-subtleText">
                여러 파일을 선택하면 파일명의 컷 번호(01~08)에 맞게 자동 배치됩니다.
                예: <span className="font-mono">01.png</span>,{' '}
                <span className="font-mono">detail_{numericId || '1043'}_03_big.png</span>
              </p>
            </div>
            <label
              htmlFor="product-cut-bulk"
              className={`inline-flex h-10 w-fit items-center justify-center rounded-sm border border-dark bg-white px-4 text-bodySmall text-dark transition-opacity ${
                !folder || isSaving ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-light'
              }`}
            >
              이미지 여러 개 선택
            </label>
            <input
              id="product-cut-bulk"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              multiple
              disabled={!folder || isSaving}
              className="sr-only"
              onChange={(e) => {
                handleBulkSelectCuts(e.target.files)
                e.target.value = ''
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-8">
            {PRODUCT_PDP_CUTS.map((cut) => (
              <ProductCutUploader
                key={cut}
                cut={cut}
                previewUrl={previewUrls[cut]}
                disabled={!folder || isSaving}
                onSelect={(file) => handleSelectCut(cut, file)}
                onClear={() => handleClearCut(cut)}
              />
            ))}
          </div>
          <p className="m-0 mt-4 text-bodySmall text-subtleText">
            컷 03은 PLP 카드(누끼), 컷 07은 PLP 카드(화보)로 사용됩니다. PNG 또는 WebP 업로드를 권장합니다.
          </p>
        </SectionCard>
      </div>

      <div className="mt-8 flex justify-end gap-2 border-t border-lightGray pt-6">
        <button
          type="button"
          className="rounded-sm border border-lightGray bg-white px-5 py-3 text-bodyRegular2 text-dark"
          onClick={() => navigateSpa(ADMIN_PRODUCTS_PATH)}
        >
          취소
        </button>
        <button
          type="button"
          disabled={isSaving}
          className="rounded-sm border border-dark bg-dark px-5 py-3 text-bodyRegular2 text-white disabled:opacity-50"
          onClick={handleSubmit}
        >
          {isSaving ? '저장 중…' : isEditMode ? '수정 완료' : '상품 등록'}
        </button>
      </div>
    </div>
  )
}

export function isProductRegistrationPath(pathname) {
  return pathname === ADMIN_PRODUCT_NEW_PATH || parseAdminProductEditId(pathname) != null
}
