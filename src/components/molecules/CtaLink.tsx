import type { CSSProperties, MouseEvent } from 'react'
import { tokens } from '../../design-system/tokens'
import { isSpaPath, navigateSpa, type SpaPath } from '../../lib/spaNavigation'

interface CtaLinkProps {
  label: string
  href?: string
}

export function CtaLink({ label, href }: CtaLinkProps) {
  const style: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 122,
    height: 38,
    padding: '10px 16px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    border: `1px solid ${tokens.color.white}`,
    borderRadius: 4,
    color: tokens.color.white,
    fontSize: 13,
    lineHeight: tokens.typography.bodySmall.lineHeight,
    letterSpacing: tokens.typography.bodySmall.letterSpacing,
    fontWeight: tokens.typography.bodySmall.fontWeight,
    textDecoration: 'none',
    boxSizing: 'border-box',
    whiteSpace: 'nowrap',
  }

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const trimmed = href?.trim()
    if (!trimmed || trimmed === '#') return

    event.preventDefault()
    if (isSpaPath(trimmed)) {
      navigateSpa(trimmed as SpaPath)
      return
    }
    window.location.assign(trimmed)
  }

  return (
    <a href={href?.trim() || '#'} style={style} onClick={handleClick}>
      {label}
    </a>
  )
}
