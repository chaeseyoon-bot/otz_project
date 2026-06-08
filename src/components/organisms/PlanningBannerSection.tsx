import type { CSSProperties } from 'react'
import { planningBanner } from '../../data/homeSections'
import { tokens } from '../../design-system/tokens'
import { Tag } from '../atoms/Tag'

export function PlanningBannerSection() {
  return (
    <section style={styles.section} className="lg:hidden">
      <article style={styles.card}>
        <img src={planningBanner.imageUrl} alt={planningBanner.title} style={styles.image} />
        <div style={styles.overlay} />
        <div style={styles.content}>
          <Tag>{planningBanner.badge}</Tag>
          <h3 style={styles.title}>{planningBanner.title}</h3>
          <p style={styles.subtitle}>{planningBanner.subtitle}</p>
        </div>
      </article>
    </section>
  )
}

const styles: Record<string, CSSProperties> = {
  section: {
    padding: `${tokens.spacing.x4} ${tokens.spacing.lg} 0`,
  },
  card: {
    position: 'relative',
    height: 431,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(0,0,0,0) 56.7%, rgba(0,0,0,0.2) 82.6%)',
  },
  content: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 28,
    display: 'grid',
    gap: 8,
    justifyItems: 'center',
    color: tokens.color.white,
  },
  title: {
    margin: 0,
    fontSize: tokens.typography.titleLarge.fontSize,
    fontWeight: tokens.typography.titleLarge.fontWeight,
    lineHeight: tokens.typography.titleLarge.lineHeight,
    letterSpacing: tokens.typography.titleLarge.letterSpacing,
  },
  subtitle: {
    margin: 0,
    fontSize: tokens.typography.bodySmall.fontSize,
    lineHeight: tokens.typography.bodySmall.lineHeight,
    letterSpacing: tokens.typography.bodySmall.letterSpacing,
  },
}
