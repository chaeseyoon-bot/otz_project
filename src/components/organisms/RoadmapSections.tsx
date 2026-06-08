import type { CSSProperties } from 'react'
import { figmaGuide } from '../../data/homeSections'
import { tokens } from '../../design-system/tokens'

const pendingSections = [
  { key: 'category', label: 'Category' },
  { key: 'forYou', label: 'FOR U' },
  { key: 'brand', label: 'Brand Banner' },
  { key: 'styling', label: 'Styling Product' },
  { key: 'lookbook', label: 'Lookbook' },
] as const

export function RoadmapSections() {
  return (
    <section style={styles.section}>
      <h3 style={styles.heading}>Figma Implementation Backlog</h3>
      <ul style={styles.list}>
        {pendingSections.map((section) => (
          <li key={section.key} style={styles.item}>
            <strong>{section.label}</strong>
            <span>node: {figmaGuide.nodes[section.key]}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

const styles: Record<string, CSSProperties> = {
  section: {
    margin: `0 ${tokens.spacing.lg} ${tokens.spacing.x4}`,
    backgroundColor: tokens.color.surfaceSubtle,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.xl,
  },
  heading: {
    margin: 0,
    fontSize: 16,
    lineHeight: 1.3,
  },
  list: {
    listStyle: 'none',
    margin: `${tokens.spacing.lg} 0 0`,
    padding: 0,
    display: 'grid',
    gap: tokens.spacing.sm,
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 13,
    lineHeight: 1.4,
    color: tokens.color.textSecondary,
  },
}
