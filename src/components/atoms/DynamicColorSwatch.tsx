import type { CSSProperties } from 'react'
import { normalizeColorHex } from '../../lib/productColor'

export interface DynamicColorSwatchProps {
  hex: string
  swatchUrl?: string | null
  selected?: boolean
  sizeClassName?: string
  className?: string
}

/** Circular PLP/admin color chip — HEX fill with optional texture image overlay. */
export function DynamicColorSwatch({
  hex,
  swatchUrl,
  selected = false,
  sizeClassName = 'size-[30px]',
  className = '',
}: DynamicColorSwatchProps) {
  const normalizedHex = normalizeColorHex(hex) ?? '#cccccc'
  const swatchStyle: CSSProperties = {
    backgroundColor: normalizedHex,
    boxSizing: 'border-box',
    border: selected ? '4px solid #ffffff' : '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: selected ? '0 0 0 1px #1a1a1a' : undefined,
    backgroundImage: swatchUrl ? `url(${swatchUrl})` : undefined,
    backgroundSize: swatchUrl ? 'cover' : undefined,
    backgroundPosition: swatchUrl ? 'center' : undefined,
  }

  return (
    <div
      className={`shrink-0 overflow-hidden rounded-full ${sizeClassName}${className ? ` ${className}` : ''}`}
      style={swatchStyle}
      aria-hidden
    />
  )
}
