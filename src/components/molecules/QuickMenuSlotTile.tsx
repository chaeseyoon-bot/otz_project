import type { CSSProperties, ReactNode } from 'react'
import type { AdminQuickMenuSlot } from '../../lib/adminHomeMainConfig'

/** Figma 2601:22679 — text-only tile label: MO 14px / PC 18px, weight 800, centered, multiline. */
export const QUICK_MENU_TILE_TEXT_CLASS =
  'text-center font-extrabold leading-normal whitespace-pre-line text-[14px] lg:text-[18px]'

/** Figma 2601:22679 — mixed tile in-tile overlay (e.g. Best / Sellers). */
export const QUICK_MENU_MIXED_TEXT_CLASS =
  'pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center font-extrabold leading-normal whitespace-pre-line text-[14px] lg:text-[19px]'

/** Figma 2601:22678 — admin slot preview tile (160×100). */
export const QUICK_MENU_ADMIN_PREVIEW_TILE_CLASS =
  'relative flex h-[100px] w-[160px] shrink-0 flex-col items-center justify-center overflow-hidden rounded-[20px] border border-black/[0.06]'

/** Figma 2601:22678/22682 — caption below tile. */
export const QUICK_MENU_CAPTION_CLASS =
  'm-0 shrink-0 text-center text-[13px] font-normal leading-[1.4] tracking-[-0.26px] text-dark'

export const QUICK_MENU_ADMIN_PREVIEW_MIXED_TEXT_CLASS =
  'pointer-events-none absolute left-[calc(50%+0.5px)] top-[calc(50%-23px)] z-10 flex h-fit w-fit -translate-x-1/2 flex-col items-center justify-center text-center text-[19px] font-extrabold leading-[0]'

export const QUICK_MENU_TILE_FRAME_CLASS =
  'relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-[15px] border border-black/[0.06] lg:h-[100px] lg:w-40 lg:rounded-[20px]'

interface QuickMenuSlotTileProps {
  slot: AdminQuickMenuSlot
  /** Fallback image when `image` slot has no uploaded asset. */
  fallbackImageUrl?: string | null
  /** `adminPreview` fills the 160×100 admin canvas; `home` matches the live home tile. */
  variant?: 'home' | 'adminPreview'
}

function MixedTileLabel({
  label,
  className,
  style,
}: {
  label: string
  className: string
  style?: CSSProperties
}) {
  const lines = label.split('\n')

  return (
    <div className={className} style={style}>
      {lines.map((line, index) => (
        <p key={`${line}-${index}`} className="m-0 h-fit w-fit leading-[normal]">
          {line}
        </p>
      ))}
    </div>
  )
}

function resolveAdminPreviewImageSrc(
  slot: AdminQuickMenuSlot,
  fallbackImageUrl?: string | null,
): string | null {
  const uploaded = slot.imageUrl?.trim()
  if (uploaded) return uploaded

  if (slot.slotType === 'image' || slot.slotType === 'cutout' || slot.slotType === 'mixed') {
    return fallbackImageUrl?.trim() || null
  }

  return null
}

function AdminPreviewTile({
  slot,
  fallbackImageUrl,
}: {
  slot: AdminQuickMenuSlot
  fallbackImageUrl?: string | null
}) {
  const imageSrc = resolveAdminPreviewImageSrc(slot, fallbackImageUrl)
  const frameStyle: CSSProperties = { backgroundColor: slot.bgColor || '#f6f6f6' }
  const textStyle: CSSProperties = { color: slot.textColor || '#1a1a1a' }

  let content: ReactNode = null

  if (slot.slotType === 'mixed') {
    content = (
      <>
        {imageSrc ? (
          <div
            className="pointer-events-none absolute left-[-23px] top-[-5px] h-[106px] w-[199px]"
            data-name="Mask group"
          >
            <img
              src={imageSrc}
              alt=""
              className="absolute inset-0 block size-full max-w-none object-cover"
              draggable={false}
            />
          </div>
        ) : null}
        {slot.label.trim() ? (
          <MixedTileLabel
            label={slot.label}
            className={QUICK_MENU_ADMIN_PREVIEW_MIXED_TEXT_CLASS}
            style={textStyle}
          />
        ) : null}
      </>
    )
  } else if (slot.slotType === 'text') {
    content = (
      <span
        className="flex size-full items-center justify-center px-1.5 text-center text-[14px] font-extrabold leading-normal whitespace-pre-line"
        style={textStyle}
      >
        {slot.label}
      </span>
    )
  } else if (slot.slotType === 'image') {
    content = (
      <div className="absolute -left-px -top-px h-[100px] w-[160px]" data-name="Category Image">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={slot.label}
            className="pointer-events-none absolute inset-0 size-full max-w-none object-cover"
            draggable={false}
          />
        ) : null}
      </div>
    )
  } else if (slot.slotType === 'cutout') {
    content = imageSrc ? (
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
      <span
        className="flex size-full items-center justify-center px-1.5 text-center text-[14px] font-extrabold leading-normal whitespace-pre-line text-dark"
      >
        {slot.label}
      </span>
    )
  }

  return (
    <div className={QUICK_MENU_ADMIN_PREVIEW_TILE_CLASS} style={frameStyle} data-name="Category Image">
      {content}
    </div>
  )
}

export function QuickMenuSlotTile({
  slot,
  fallbackImageUrl,
  variant = 'home',
}: QuickMenuSlotTileProps) {
  const imageSrc = slot.imageUrl ?? fallbackImageUrl ?? null

  if (variant === 'adminPreview') {
    return <AdminPreviewTile slot={slot} fallbackImageUrl={fallbackImageUrl} />
  }

  const frameClass = QUICK_MENU_TILE_FRAME_CLASS
  const frameStyle = { backgroundColor: slot.bgColor || '#f6f6f6' }
  const textStyle = { color: slot.textColor || '#1a1a1a' }

  return (
    <div className={frameClass} style={frameStyle}>
      {slot.slotType === 'mixed' ? (
        <>
          {imageSrc ? (
            <img
              src={imageSrc}
              alt=""
              className="pointer-events-none absolute inset-0 size-full object-cover object-center"
              draggable={false}
            />
          ) : null}
          {slot.label.trim() ? (
            <span className={`${QUICK_MENU_MIXED_TEXT_CLASS} px-1.5`} style={textStyle}>
              {slot.label}
            </span>
          ) : null}
        </>
      ) : null}

      {slot.slotType === 'text' ? (
        <span className={`px-1.5 ${QUICK_MENU_TILE_TEXT_CLASS}`} style={textStyle}>
          {slot.label}
        </span>
      ) : null}

      {slot.slotType === 'image' && imageSrc ? (
        <img
          src={imageSrc}
          alt={slot.label}
          className="size-full object-cover object-center"
          draggable={false}
        />
      ) : null}

      {slot.slotType === 'cutout' ? (
        imageSrc ? (
          <img
            src={imageSrc}
            alt={slot.label}
            className="max-h-[88%] max-w-[88%] object-contain object-center mix-blend-multiply lg:max-h-[90%] lg:max-w-[90%]"
            draggable={false}
          />
        ) : (
          <span className={`px-1.5 ${QUICK_MENU_TILE_TEXT_CLASS} text-dark`}>{slot.label}</span>
        )
      ) : null}

      {slot.slotType === 'image' && !imageSrc ? (
        <span className="text-[12px] text-subtleText">160×100</span>
      ) : null}
    </div>
  )
}
