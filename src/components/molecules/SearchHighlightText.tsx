interface SearchHighlightTextProps {
  text: string
  query: string
  className?: string
  highlightClassName?: string
}

/** Highlights the first case-insensitive match of `query` in `text` (Figma primaryText #DA4D4D). */
export function SearchHighlightText({
  text,
  query,
  className,
  highlightClassName = 'text-primaryText',
}: SearchHighlightTextProps) {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) {
    return <span className={className}>{text}</span>
  }

  const lowerText = text.toLowerCase()
  const lowerQuery = trimmedQuery.toLowerCase()
  const matchIndex = lowerText.indexOf(lowerQuery)

  if (matchIndex === -1) {
    return <span className={className}>{text}</span>
  }

  const before = text.slice(0, matchIndex)
  const match = text.slice(matchIndex, matchIndex + trimmedQuery.length)
  const after = text.slice(matchIndex + trimmedQuery.length)

  return (
    <span className={className}>
      {before}
      <span className={highlightClassName}>{match}</span>
      {after}
    </span>
  )
}
