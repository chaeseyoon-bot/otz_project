import { DEFAULT_SEARCH_RESULTS_QUERY } from '../data/searchContent'

/** Search results — mobile Figma 2978:14848, PC Figma 2978:14413 (`/search/results?q=`). */

export function isSearchResultsPath(pathname: string) {
  return pathname.startsWith('/search/results')
}

export function isSearchOverlayPath(pathname: string) {
  return pathname === '/search' || pathname === '/search/'
}

export function readSearchQueryFromLocation(): string {
  if (typeof window === 'undefined') return DEFAULT_SEARCH_RESULTS_QUERY
  const value = new URLSearchParams(window.location.search).get('q')?.trim() ?? ''
  return value || DEFAULT_SEARCH_RESULTS_QUERY
}

export function buildSearchResultsPath(query: string) {
  const value = query.trim()
  if (!value) return '/search'
  return `/search/results?q=${encodeURIComponent(value)}`
}
