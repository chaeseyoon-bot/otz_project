import type { CSSProperties } from 'react'
import { tokens } from '../../design-system/tokens'

interface SectionTitleProps {
  text: string
  color?: string
}

export function SectionTitle({ text, color = tokens.color.white }: SectionTitleProps) {
  const style: CSSProperties = {
    margin: 0,
    color,
    fontSize: tokens.typography.headingH3.fontSize,
    lineHeight: tokens.typography.headingH3.lineHeight,
    letterSpacing: tokens.typography.headingH3.letterSpacing,
    fontWeight: tokens.typography.headingH3.fontWeight,
  }

  return <h2 style={style}>{text}</h2>
}
