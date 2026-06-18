import { useRef, useState } from 'react'
import { uploadAdminBannerImage } from '../../lib/adminBannerUpload'
import { HERO_GALLERY_MAX_IMAGES } from '../../lib/adminEditorialConfig'
import { EditorialCouponAdminFields } from './EditorialCouponAdminFields'
import { FormRow, TextInput } from './editorialAdminPrimitives'

function HeroGalleryImageRow({
  index,
  slot,
  isUploading,
  onReplace,
  onRemove,
}) {
  const inputRef = useRef(null)
  const fileName = slot.imageFileName?.trim() || `이미지 ${index + 1}`

  return (
    <li className="flex items-center gap-2.5 px-3 py-2">
      <span className="w-5 shrink-0 text-center text-[11px] font-medium tabular-nums text-subtleText">
        {index + 1}
      </span>
      <div className="h-12 w-10 shrink-0 overflow-hidden rounded-sm border border-lightGray bg-light">
        {slot.imageUrl ? (
          <img src={slot.imageUrl} alt="" className="size-full object-cover" draggable={false} />
        ) : (
          <div className="flex size-full items-center justify-center text-[9px] text-subtleText">없음</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate text-[12px] font-medium leading-snug text-dark" title={fileName}>
          {fileName}
        </p>
        <p className="m-0 text-[11px] text-subtleText">2열 갤러리</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          disabled={isUploading}
          className="rounded-sm border border-lightGray bg-white px-2 py-1 text-[11px] text-dark hover:border-dark disabled:opacity-50"
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? '업로드…' : '변경'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          disabled={isUploading}
          onChange={onReplace}
        />
        <button
          type="button"
          className="rounded-sm border border-lightGray bg-white px-2 py-1 text-[11px] text-subtleText hover:text-dark"
          onClick={onRemove}
        >
          삭제
        </button>
      </div>
    </li>
  )
}

export function EditorialHeroInfoAdminFields({ event, onUpdate }) {
  return (
    <div className="space-y-2.5">
      <FormRow label="디스플레이 타이틀" hint="히어로 배너 아래 대형 타이틀 · Enter로 줄바꿈">
        <TextInput
          multiline
          rows={3}
          value={event.heroInfoTitle}
          onChange={(value) => onUpdate({ heroInfoTitle: value })}
          placeholder={'SPORTS BRAND\nSEASON OFF'}
        />
      </FormRow>
      <FormRow label="서브타이틀" hint="우측 설명 문구 · 첫 줄은 굵게 표시">
        <TextInput
          multiline
          rows={5}
          value={event.heroInfoSubtitle}
          onChange={(value) => onUpdate({ heroInfoSubtitle: value })}
          placeholder="기획전 소개 문구를 입력하세요."
        />
      </FormRow>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-[13px] text-dark">
          <input
            type="checkbox"
            checked={event.heroInfoShowPeriod !== false}
            onChange={(e) => onUpdate({ heroInfoShowPeriod: e.target.checked })}
          />
          날짜 영역 표시
        </label>
        <label className="flex items-center gap-2 text-[13px] text-dark">
          <input
            type="checkbox"
            checked={event.heroInfoShowCoupon === true}
            onChange={(e) => onUpdate({ heroInfoShowCoupon: e.target.checked })}
          />
          쿠폰 영역 표시
        </label>
      </div>

      <EditorialCouponAdminFields event={event} onUpdate={onUpdate} embedded />

      <p className="m-0 text-[11px] leading-snug text-subtleText">
        날짜는 기본 정보의 기간 필드를 사용합니다. (예: 2026.06.13 - 2026.06.24)
      </p>
    </div>
  )
}

export function EditorialHeroGalleryAdminFields({ event, onUpdate, uploadingKey, onImageUpload }) {
  const bulkInputRef = useRef(null)
  const [isBulkUploading, setIsBulkUploading] = useState(false)

  const heroGalleryImages = event.heroGalleryImages ?? []

  const updateGalleryImages = (nextImages) => {
    onUpdate({ heroGalleryImages: nextImages.slice(0, HERO_GALLERY_MAX_IMAGES) })
  }

  const handleBulkUpload = async (fileList) => {
    const files = Array.from(fileList || []).filter((file) => file.type.startsWith('image/'))
    if (!files.length) return

    setIsBulkUploading(true)
    try {
      const uploaded = []
      for (const file of files) {
        const result = await uploadAdminBannerImage(file, `editorial-hero-gallery-${event.id}`)
        uploaded.push({ imageUrl: result.url, imageFileName: result.fileName })
      }
      updateGalleryImages([...heroGalleryImages, ...uploaded])
    } finally {
      setIsBulkUploading(false)
    }
  }

  const removeGalleryImage = (imageIndex) => {
    updateGalleryImages(heroGalleryImages.filter((_, index) => index !== imageIndex))
  }

  return (
    <div className="space-y-2.5">
      <p className="m-0 text-[10px] leading-snug text-subtleText">
        쿠폰 아래 2열 메이슨리 · 최대 {HERO_GALLERY_MAX_IMAGES}장
      </p>
      <div className="overflow-hidden rounded-sm border border-lightGray bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-lightGray bg-light3 px-3 py-2.5">
          <div className="min-w-0">
            <p className="m-0 text-[12px] font-medium text-dark">
              등록 이미지 {heroGalleryImages.length}/{HERO_GALLERY_MAX_IMAGES}
            </p>
            <p className="m-0 mt-0.5 text-[11px] leading-snug text-subtleText">
              여러 장을 한 번에 추가할 수 있습니다.
            </p>
          </div>
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
          <button
            type="button"
            disabled={isBulkUploading || heroGalleryImages.length >= HERO_GALLERY_MAX_IMAGES}
            className="shrink-0 rounded-sm border border-dark bg-dark px-3 py-1.5 text-[11px] font-medium text-white hover:opacity-90 disabled:opacity-40"
            onClick={() => bulkInputRef.current?.click()}
          >
            {isBulkUploading ? '업로드 중…' : '이미지 일괄 추가'}
          </button>
        </div>

        {heroGalleryImages.length > 0 ? (
          <ul className="m-0 list-none divide-y divide-lightGray p-0">
            {heroGalleryImages.map((slot, imageIndex) => (
              <HeroGalleryImageRow
                key={`hero-gallery-${imageIndex}-${slot.imageFileName ?? slot.imageUrl ?? imageIndex}`}
                index={imageIndex}
                slot={slot}
                isUploading={uploadingKey === `editorial-hero-gallery-${event.id}-${imageIndex}`}
                onReplace={(e) => {
                  const file = e.target.files?.[0]
                  if (!file || !onImageUpload) return
                  onImageUpload(
                    file,
                    `editorial-hero-gallery-${event.id}-${imageIndex}`,
                    (url, fileName) => {
                      const nextImages = [...heroGalleryImages]
                      nextImages[imageIndex] = { imageUrl: url, imageFileName: fileName }
                      updateGalleryImages(nextImages)
                    },
                  )
                  e.target.value = ''
                }}
                onRemove={() => removeGalleryImage(imageIndex)}
              />
            ))}
          </ul>
        ) : (
          <p className="m-0 px-3 py-6 text-center text-[12px] text-subtleText">
            등록된 이미지가 없습니다. 상단 버튼으로 추가해 주세요.
          </p>
        )}
      </div>
    </div>
  )
}
