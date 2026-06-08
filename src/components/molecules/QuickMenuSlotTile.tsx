import type { AdminQuickMenuSlot } from '../../lib/adminHomeMainConfig'

/** Figma 2601:22679 — text-only tile label: MO 14px / PC 18px, weight 800, centered, multiline. */
export const QUICK_MENU_TILE_TEXT_CLASS =
  'text-center font-extrabold leading-normal whitespace-pre-line text-[14px] lg:text-[18px]'

/** Figma 2601:22679 — mixed tile in-tile overlay (e.g. Best / Sellers). */
export const QUICK_MENU_MIXED_TEXT_CLASS =
  'pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center font-extrabold leading-normal whitespace-pre-line text-[14px] lg:text-[19px]'

export const QUICK_MENU_TILE_FRAME_CLASS =
  'relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-[15px] border border-black/[0.06] lg:h-[100px] lg:w-40 lg:rounded-[20px]'

interface QuickMenuSlotTileProps {
  slot: AdminQuickMenuSlot
  /** Fallback image when `image` slot has no uploaded asset. */
  fallbackImageUrl?: string | null
  /** `adminPreview` fills the 160×100 admin canvas; `home` matches the live home tile. */
  variant?: 'home' | 'adminPreview'
}

export function QuickMenuSlotTile({
  slot,
  fallbackImageUrl,
  variant = 'home',
}: QuickMenuSlotTileProps) {
  const frameClass =
    variant === 'adminPreview'
      ? 'relative flex size-full items-center justify-center overflow-hidden rounded-[20px] border border-black/[0.06]'
      : QUICK_MENU_TILE_FRAME_CLASS

  const frameStyle = { backgroundColor: slot.bgColor || '#f6f6f6' }
  const textStyle = { color: slot.textColor || '#1a1a1a' }
  const imageSrc = slot.imageUrl ?? fallbackImageUrl ?? null

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
