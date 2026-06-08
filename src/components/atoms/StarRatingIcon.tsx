interface StarRatingIconProps {
  className?: string
}

export function StarRatingIcon({ className }: StarRatingIconProps) {
  return (
    <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden className={className}>
      <path d="M6 1.02 7.39 4.24l3.47.51-2.51 2.45.59 3.45L6 9.02l-2.94 1.63.59-3.45-2.51-2.45 3.47-.51L6 1.02Z" />
    </svg>
  )
}
