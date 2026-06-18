import { useRef, useState } from 'react'
import { uploadAdminBannerImage } from '../../lib/adminBannerUpload'
import {
  COLLECTION_PRODUCT_SLOTS,
  LOOKBOOK_GALLERY_MAX_IMAGES,
  PRODUCT_SHOWCASE_GALLERY_SLOTS,
  createEmptyCollectionImageBlock,
  createEmptyCollectionLookbookGalleryBlock,
  createEmptyCollectionProductShowcaseBlock,
  createEmptyCollectionProductsBlock,
} from '../../lib/adminEditorialConfig'
import { FormRow, ImageUploader, ProductSlotPicker, TextInput } from './editorialAdminPrimitives'

function BlockOrderToolbar({ index, total, onMoveUp, onMoveDown, onRemove }) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        disabled={index === 0}
        className="rounded-sm border border-lightGray bg-white px-1.5 py-0.5 text-[10px] disabled:opacity-30"
        onClick={onMoveUp}
        aria-label="위로"
      >
        ↑
      </button>
      <button
        type="button"
        disabled={index >= total - 1}
        className="rounded-sm border border-lightGray bg-white px-1.5 py-0.5 text-[10px] disabled:opacity-30"
        onClick={onMoveDown}
        aria-label="아래로"
      >
        ↓
      </button>
      <button
        type="button"
        className="rounded-sm border border-lightGray bg-white px-1.5 py-0.5 text-[10px] text-subtleText"
        onClick={onRemove}
      >
        제거
      </button>
    </div>
  )
}

const BLOCK_TYPE_LABELS = {
  lookbook_gallery: '룩북 갤러리',
  product_showcase: '단독상품',
  products: '상품 그리드',
  image: '단일 이미지',
}

export function EditorialCollectionAdminFields({
  event,
  uploadingKey,
  onUpdate,
  onImageUpload,
}) {
  const bulkInputRef = useRef(null)
  const galleryBulkInputRef = useRef(null)
  const [bulkUploadBlockIndex, setBulkUploadBlockIndex] = useState(null)
  const [isBulkUploading, setIsBulkUploading] = useState(false)

  const updateBlock = (blockIndex, patch) => {
    const nextBlocks = event.collectionBlocks.map((block, index) =>
      index === blockIndex ? { ...block, ...patch } : block,
    )
    onUpdate({ collectionBlocks: nextBlocks })
  }

  const removeBlock = (blockIndex) => {
    onUpdate({ collectionBlocks: event.collectionBlocks.filter((_, index) => index !== blockIndex) })
  }

  const moveBlock = (blockIndex, direction) => {
    const next = [...event.collectionBlocks]
    const target = blockIndex + direction
    if (target < 0 || target >= next.length) return
    ;[next[blockIndex], next[target]] = [next[target], next[blockIndex]]
    onUpdate({ collectionBlocks: next })
  }

  const addBlock = (factory) => {
    onUpdate({ collectionBlocks: [...event.collectionBlocks, factory()] })
  }

  const handleBulkUpload = async (fileList, blockIndex = null) => {
    const files = Array.from(fileList || []).filter((file) => file.type.startsWith('image/'))
    if (!files.length) return

    setIsBulkUploading(true)
    try {
      const uploaded = []
      for (const file of files) {
        const result = await uploadAdminBannerImage(file, `editorial-collection-${event.id}`)
        uploaded.push({ imageUrl: result.url, imageFileName: result.fileName })
      }

      if (blockIndex != null) {
        const block = event.collectionBlocks[blockIndex]
        if (block?.type === 'lookbook_gallery') {
          const nextImages = [...block.images, ...uploaded].slice(0, LOOKBOOK_GALLERY_MAX_IMAGES)
          updateBlock(blockIndex, { images: nextImages })
        }
        return
      }

      const newBlock = {
        ...createEmptyCollectionLookbookGalleryBlock(),
        images: uploaded,
      }
      onUpdate({ collectionBlocks: [...event.collectionBlocks, newBlock] })
    } finally {
      setIsBulkUploading(false)
      setBulkUploadBlockIndex(null)
    }
  }

  const updateProductId = (blockIndex, slotIndex, productId) => {
    const block = event.collectionBlocks[blockIndex]
    if (block.type !== 'products') return
    const nextIds = [...block.productIds]
    nextIds[slotIndex] = productId
    updateBlock(blockIndex, { productIds: nextIds })
  }

  const updateShowcaseGallerySlot = (blockIndex, slotIndex, patch) => {
    const block = event.collectionBlocks[blockIndex]
    if (block.type !== 'product_showcase') return
    const nextGallery = block.gallery.map((slot, index) => (index === slotIndex ? { ...slot, ...patch } : slot))
    updateBlock(blockIndex, { gallery: nextGallery })
  }

  const removeLookbookImage = (blockIndex, imageIndex) => {
    const block = event.collectionBlocks[blockIndex]
    if (block.type !== 'lookbook_gallery') return
    updateBlock(blockIndex, {
      images: block.images.filter((_, index) => index !== imageIndex),
    })
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="m-0 text-[11px] font-semibold text-dark">콘텐츠 블록</p>
            <p className="m-0 mt-0.5 text-[10px] text-subtleText">
              Figma 143:4090 PC 레이아웃 — 룩북 갤러리, 단독상품, 상품 그리드를 순서대로 배치합니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <input
              ref={bulkInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                handleBulkUpload(e.target.files)
                e.target.value = ''
              }}
            />
            <input
              ref={galleryBulkInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (bulkUploadBlockIndex != null) {
                  handleBulkUpload(e.target.files, bulkUploadBlockIndex)
                }
                e.target.value = ''
              }}
            />
            <button
              type="button"
              disabled={isBulkUploading}
              className="rounded-sm border border-lightGray bg-white px-2 py-1 text-[10px] text-dark disabled:opacity-50"
              onClick={() => bulkInputRef.current?.click()}
            >
              {isBulkUploading ? '업로드 중…' : '+ 룩북 갤러리'}
            </button>
            <button
              type="button"
              className="rounded-sm border border-dashed border-lightGray bg-white px-2 py-1 text-[10px]"
              onClick={() => addBlock(createEmptyCollectionProductShowcaseBlock)}
            >
              + 단독상품
            </button>
            <button
              type="button"
              className="rounded-sm border border-dashed border-lightGray bg-white px-2 py-1 text-[10px]"
              onClick={() => addBlock(createEmptyCollectionProductsBlock)}
            >
              + 상품 그리드
            </button>
            <button
              type="button"
              className="rounded-sm border border-dashed border-lightGray bg-white px-2 py-1 text-[10px]"
              onClick={() => addBlock(createEmptyCollectionImageBlock)}
            >
              + 단일 이미지
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          {event.collectionBlocks.map((block, blockIndex) => {
            const label = `${BLOCK_TYPE_LABELS[block.type] ?? block.type} ${String(blockIndex + 1).padStart(2, '0')}`

            return (
              <div key={block.id} className="rounded-sm border border-lightGray bg-light3 p-2.5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="m-0 text-[11px] font-semibold text-dark">{label}</p>
                  <BlockOrderToolbar
                    index={blockIndex}
                    total={event.collectionBlocks.length}
                    onMoveUp={() => moveBlock(blockIndex, -1)}
                    onMoveDown={() => moveBlock(blockIndex, 1)}
                    onRemove={() => removeBlock(blockIndex)}
                  />
                </div>

                {block.type === 'lookbook_gallery' ? (
                  <div className="space-y-2.5">
                    <p className="m-0 text-[10px] text-subtleText">
                      2열 메이슨리 갤러리 · 최대 {LOOKBOOK_GALLERY_MAX_IMAGES}장
                    </p>
                    <button
                      type="button"
                      disabled={isBulkUploading}
                      className="rounded-sm border border-lightGray bg-white px-2 py-1 text-[10px] disabled:opacity-50"
                      onClick={() => {
                        setBulkUploadBlockIndex(blockIndex)
                        galleryBulkInputRef.current?.click()
                      }}
                    >
                      이미지 추가
                    </button>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {block.images.map((slot, imageIndex) => (
                        <div key={`${block.id}-img-${imageIndex}`} className="rounded-sm border border-lightGray bg-white p-2">
                          <ImageUploader
                            label={`이미지 ${imageIndex + 1}`}
                            spec="룩북"
                            aspectClass="aspect-[4/5] w-full"
                            previewUrl={slot.imageUrl}
                            fileName={slot.imageFileName}
                            isUploading={uploadingKey === `editorial-collection-${event.id}-${block.id}-${imageIndex}`}
                            onSelect={(e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              onImageUpload(
                                file,
                                `editorial-collection-${event.id}-${block.id}-${imageIndex}`,
                                (url, fileName) => {
                                  const nextImages = [...block.images]
                                  nextImages[imageIndex] = { imageUrl: url, imageFileName: fileName }
                                  updateBlock(blockIndex, { images: nextImages })
                                },
                              )
                              e.target.value = ''
                            }}
                            onClear={() => removeLookbookImage(blockIndex, imageIndex)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {block.type === 'product_showcase' ? (
                  <div className="space-y-2.5">
                    <FormRow label="섹션 제목">
                      <TextInput
                        value={block.title}
                        onChange={(value) => updateBlock(blockIndex, { title: value })}
                        placeholder="ROMARY SNEAKERS"
                      />
                    </FormRow>
                    <FormRow label="부제목">
                      <TextInput
                        value={block.subtitle}
                        onChange={(value) => updateBlock(blockIndex, { subtitle: value })}
                        placeholder="로마리 밴딩 SE 스니커즈 다크 브라운 FLOTGA1W59"
                      />
                    </FormRow>
                    <FormRow label="연결 상품">
                      <ProductSlotPicker
                        slotLabel="상품"
                        productId={block.productId}
                        onAssign={(id) => updateBlock(blockIndex, { productId: id })}
                        onClear={() => updateBlock(blockIndex, { productId: null })}
                      />
                    </FormRow>
                    <p className="m-0 text-[10px] text-subtleText">
                      연결 상품의 03·04·05·07·08 컷이 자동 출력됩니다 (08 없으면 생략). 직접 업로드 시 자동 컷 대신 사용됩니다.
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {block.gallery.map((slot, slotIndex) => (
                        <div key={`${block.id}-gallery-${slotIndex}`} className="rounded-sm border border-lightGray bg-white p-2">
                          <FormRow label={`컷 ${slotIndex + 1}`}>
                            <select
                              value={slot.variant}
                              onChange={(e) =>
                                updateShowcaseGallerySlot(blockIndex, slotIndex, {
                                  variant: e.target.value === 'editorial' ? 'editorial' : 'cutout',
                                })
                              }
                              className="mb-2 h-7 w-full rounded-sm border border-lightGray bg-white px-2 text-[11px]"
                            >
                              <option value="cutout">누끼컷</option>
                              <option value="editorial">화보컷</option>
                            </select>
                          </FormRow>
                          <ImageUploader
                            label=""
                            spec={slot.variant === 'editorial' ? '화보 4:5' : '누끼 정사각'}
                            aspectClass={slot.variant === 'editorial' ? 'aspect-[4/5] w-full' : 'aspect-square w-full'}
                            previewUrl={slot.imageUrl}
                            fileName={slot.imageFileName}
                            isUploading={uploadingKey === `editorial-collection-${event.id}-${block.id}-g${slotIndex}`}
                            onSelect={(e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              onImageUpload(
                                file,
                                `editorial-collection-${event.id}-${block.id}-g${slotIndex}`,
                                (url, fileName) => {
                                  updateShowcaseGallerySlot(blockIndex, slotIndex, {
                                    imageUrl: url,
                                    imageFileName: fileName,
                                  })
                                },
                              )
                              e.target.value = ''
                            }}
                            onClear={() =>
                              updateShowcaseGallerySlot(blockIndex, slotIndex, {
                                imageUrl: null,
                                imageFileName: null,
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {block.type === 'image' ? (
                  <ImageUploader
                    label="에디토리얼 이미지"
                    spec="전체 너비 · MO/PC 공용"
                    aspectClass="aspect-[4/3] w-[120px]"
                    previewUrl={block.imageUrl}
                    fileName={block.imageFileName}
                    isUploading={uploadingKey === `editorial-collection-${event.id}-${block.id}`}
                    onSelect={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      onImageUpload(file, `editorial-collection-${event.id}-${block.id}`, (url, fileName) => {
                        updateBlock(blockIndex, { imageUrl: url, imageFileName: fileName })
                      })
                      e.target.value = ''
                    }}
                    onClear={() => updateBlock(blockIndex, { imageUrl: null, imageFileName: null })}
                  />
                ) : null}

                {block.type === 'products' ? (
                  <div className="space-y-2.5">
                    <FormRow label="섹션 제목">
                      <TextInput
                        value={block.title}
                        onChange={(value) => updateBlock(blockIndex, { title: value })}
                        placeholder="SHOES"
                      />
                    </FormRow>
                    <FormRow label="열 수">
                      <select
                        value={block.columns}
                        onChange={(e) =>
                          updateBlock(blockIndex, { columns: Number(e.target.value) === 4 ? 4 : 5 })
                        }
                        className="h-8 w-full rounded-sm border border-lightGray bg-white px-2 text-[13px]"
                      >
                        <option value={5}>5열 (PC · Figma)</option>
                        <option value={4}>4열 (PC)</option>
                      </select>
                    </FormRow>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {block.productIds.map((productId, slotIndex) => (
                        <ProductSlotPicker
                          key={`${block.id}-slot-${slotIndex}`}
                          slotLabel={`${slotIndex + 1}`}
                          productId={productId}
                          onAssign={(id) => updateProductId(blockIndex, slotIndex, id)}
                          onClear={() => updateProductId(blockIndex, slotIndex, null)}
                        />
                      ))}
                    </div>
                    <p className="m-0 text-[10px] text-subtleText">최대 {COLLECTION_PRODUCT_SLOTS}개 슬롯</p>
                  </div>
                ) : null}
              </div>
            )
          })}
          {!event.collectionBlocks.length ? (
            <p className="m-0 rounded-sm border border-dashed border-lightGray px-3 py-6 text-center text-[11px] text-subtleText">
              룩북 갤러리, 상품 쇼케이스, 상품 그리드를 추가해 주세요.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
