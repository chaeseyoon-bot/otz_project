/** Shared with FOR U and other product tiles — inline SVG as data URI for crisp scaling. */
const HEART_SVG_PATH =
  'M4.98611 0.5C2.50883 0.5 0.5 2.62706 0.5 5.25012C0.5 10.5 9 16.5 9 16.5C9 16.5 17.5 10.5 17.5 5.25012C17.5 2.00024 15.4912 0.5 13.0139 0.5C11.2572 0.5 9.73667 1.56918 9 3.12588C8.26333 1.56918 6.74278 0.5 4.98611 0.5Z'

export function getProductHeartIconDataUri(isActive: boolean): string {
  const fill = isActive ? '#EE6363' : 'rgba(255,255,255,0.15)'
  const stroke = isActive ? '#DA4D4D' : 'rgba(0,0,0,0.4)'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 17" fill="none"><path d="${HEART_SVG_PATH}" fill="${fill}" stroke="${stroke}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}
