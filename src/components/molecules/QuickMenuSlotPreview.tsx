import type { CSSProperties } from 'react'
import type { AdminQuickMenuSlot } from '../../lib/adminHomeMainConfig'
import { getQuickMenuCaptionBelow } from '../../lib/adminHomeMainConfig'
import { homeBannerAsset } from '../../lib/homeBannersAssetUrl'

/** Figma 2601:22673 — default quick menu tile images by slot index. */
export const QUICK_MENU_SLOT_FALLBACK_IMAGES = [
  homeBannerAsset('category_01.png'),
  homeBannerAsset('category_02.png'),
  homeBannerAsset('category_03.png'),
  homeBannerAsset('category_04.png'),
  homeBannerAsset('category_05.png'),
  homeBannerAsset('category_06.png'),
] as const

const TILE_CLASS =
  'relative flex h-[100px] w-[160px] shrink-0 flex-col items-center justify-center overflow-hidden rounded-[20px] border border-black/[0.06]'

const CAPTION_CLASS =
  'm-0 w-[160px] shrink-0 text-center text-[13px] font-normal leading-[1.4] tracking-[-0.26px] text-dark'

const MIXED_LABEL_CLASS =
  'pointer-events-none absolute left-[calc(50%+0.5px)] top-[calc(50%-23px)] z-10 flex h-fit w-fit -translate-x-1/2 flex-col items-center justify-center text-center text-[19px] font-extrabold leading-[0]'

export interface QuickMenuSlotPreviewProps {
  slot: AdminQuickMenuSlot
  slotIndex: number
}

function isRemoteImageUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')
}

function resolvePreviewImageSrc(slot: AdminQuickMenuSlot, slotIndex: number): string | null {
  const uploaded = slot.imageUrl?.trim()
  if (uploaded && isRemoteImageUrl(uploaded)) return uploaded

  if (slot.slotType === 'image' || slot.slotType === 'cutout' || slot.slotType === 'mixed') {
    return QUICK_MENU_SLOT_FALLBACK_IMAGES[slotIndex] ?? null
  }

  return null
}

function MixedLabel({ label, style }: { label: string; style: CSSProperties }) {
  return (
    <div className={MIXED_LABEL_CLASS} style={style}>
      {label.split('\n').map((line, index) => (
        <p key={`${line}-${index}`} className="m-0 h-fit w-fit leading-[normal]">
          {line}
        </p>
      ))}
    </div>
  )
}

function PreviewTile({ slot, slotIndex }: { slot: AdminQuickMenuSlot; slotIndex: number }) {
  const imageSrc = resolvePreviewImageSrc(slot, slotIndex)
  const frameStyle: CSSProperties = { backgroundColor: slot.bgColor || '#f6f6f6' }
  const textStyle: CSSProperties = { color: slot.textColor || '#1a1a1a' }

  if (slot.slotType === 'mixed') {
    return (
      <div className={TILE_CLASS} style={frameStyle}>
        {imageSrc ? (
          <div className="pointer-events-none absolute left-[-23px] top-[-5px] h-[106px] w-[199px]">
            <img
              src={imageSrc}
              alt=""
              className="absolute inset-0 block size-full max-w-none object-cover"
              draggable={false}
            />
          </div>
        ) : null}
        {slot.label.trim() ? <MixedLabel label={slot.label} style={textStyle} /> : null}
      </div>
    )
  }

  if (slot.slotType === 'text') {
    return (
      <div className={TILE_CLASS} style={frameStyle}>
        <span
          className="flex size-full items-center justify-center px-1.5 text-center text-[14px] font-extrabold leading-normal whitespace-pre-line"
          style={textStyle}
        >
          {slot.label}
        </span>
      </div>
    )
  }

  if (slot.slotType === 'image') {
    return (
      <div className={TILE_CLASS} style={frameStyle}>
        {imageSrc ? (
          <div className="absolute -left-px -top-px h-[100px] w-[160px]">
            <img
              src={imageSrc}
              alt={slot.label}
              className="pointer-events-none absolute inset-0 size-full max-w-none object-cover"
              draggable={false}
            />
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className={TILE_CLASS} style={frameStyle}>
      {imageSrc ? (
        <div className="absolute left-1/2 top-1/2 h-[100px] w-[160px] -translate-x-1/2 -translate-y-1/2">
          <div className="pointer-events-none absolute inset-0 overflow-hidden mix-blend-multiply">
            <img
              src={imageSrc}
              alt={slot.label}
              className="absolute left-1/2 top-[9%] h-[80%] w-1/2 max-w-none -translate-x-1/2 object-contain"
              draggable={false}
            />
          </div>
        </div>
      ) : (
        <span className="flex size-full items-center justify-center px-1.5 text-center text-[14px] font-extrabold leading-normal whitespace-pre-line text-dark">
          {slot.label}
        </span>
      )}
    </div>
  )
}

/** Figma 2601:22678 — 160×100 tile + 10px gap + 13px caption (admin slot preview). */
export function QuickMenuSlotPreview({ slot, slotIndex }: QuickMenuSlotPreviewProps) {
  const captionBelow = getQuickMenuCaptionBelow(slot)

  return (
    <div
      className="flex w-[160px] flex-col items-center gap-[10px]"
      data-figma-node="2601:22678"
      data-preview-version="figma-22678-v3"
    >
      <PreviewTile slot={slot} slotIndex={slotIndex} />
      {captionBelow ? <p className={CAPTION_CLASS}>{captionBelow}</p> : null}
    </div>
  )
}
