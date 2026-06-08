export const tokens = {
  color: {
    primary: 'var(--otz-color-primary)',
    white: 'var(--otz-color-white)',
    black: 'var(--otz-color-black)',
    textPrimary: 'var(--otz-color-text-primary)',
    textSecondary: 'var(--otz-color-text-secondary)',
    textTertiary: 'var(--otz-color-text-tertiary)',
    surfaceSubtle: 'var(--otz-color-surface-subtle)',
    overlayStrong: 'var(--otz-color-overlay-strong)',
    overlaySoft: 'var(--otz-color-overlay-soft)',
  },
  spacing: {
    xs: 'var(--otz-space-4)',
    sm: 'var(--otz-space-8)',
    md: 'var(--otz-space-12)',
    lg: 'var(--otz-space-15)',
    xl: 'var(--otz-space-20)',
    x2: 'var(--otz-space-24)',
    x3: 'var(--otz-space-30)',
    x4: 'var(--otz-space-40)',
  },
  radius: {
    sm: 'var(--otz-radius-4)',
    lg: 'var(--otz-radius-20)',
  },
  typography: {
    bodySmall: {
      fontSize: 'var(--otz-font-size-body-s)',
      lineHeight: 'var(--otz-line-body)',
      letterSpacing: 'var(--otz-letter-tight)',
      fontWeight: 400,
    },
    titleLarge: {
      fontSize: 'var(--otz-font-size-title-l)',
      lineHeight: 'var(--otz-line-tight)',
      letterSpacing: 'var(--otz-letter-tight)',
      fontWeight: 600,
    },
    headingH3: {
      fontSize: 'var(--otz-font-size-heading-h3)',
      lineHeight: 'var(--otz-line-tight)',
      letterSpacing: 'var(--otz-letter-tight)',
      fontWeight: 800,
    },
  },
} as const
