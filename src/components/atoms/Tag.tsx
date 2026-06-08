import type { CSSProperties, ReactNode } from 'react'
import { tokens } from '../../design-system/tokens'

interface TagProps {
  children: ReactNode
}

export function Tag({ children }: TagProps) {
  const style: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.color.black,
    color: tokens.color.white,
    padding: '6px 15px',
    fontSize: tokens.typography.bodySmall.fontSize,
    fontWeight: 700,
    lineHeight: '1.2',
    letterSpacing: tokens.typography.bodySmall.letterSpacing,
  }

  return <span style={style}>{children}</span>
}
