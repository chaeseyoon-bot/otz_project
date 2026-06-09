import { PRODUCT_PDP_CUTS } from './productImage'

export type ProductPdpCut = (typeof PRODUCT_PDP_CUTS)[number]

const VALID_CUTS = new Set<string>(PRODUCT_PDP_CUTS)

function normalizeCut(raw: string): ProductPdpCut | null {
  const cut = raw.padStart(2, '0')
  return VALID_CUTS.has(cut) ? (cut as ProductPdpCut) : null
}

/**
 * Extracts PDP cut number (01–08) from an uploaded filename.
 *
 * Supported examples:
 * - detail_1043_01_big.png
 * - 03.png / 03_big.webp
 * - cut_07.jpg
 */
export function parseProductCutFromFileName(fileName: string): ProductPdpCut | null {
  const base = fileName.replace(/^.*[/\\]/, '').replace(/\.[^.]+$/i, '')

  const detailMatch = base.match(/detail_\d+_(\d{2})(?:_big)?$/i)
  if (detailMatch) return normalizeCut(detailMatch[1])

  const leadingMatch = base.match(/^(\d{1,2})(?:_big)?$/i)
  if (leadingMatch) return normalizeCut(leadingMatch[1])

  const cutPrefixMatch = base.match(/^cut[_-]?(\d{1,2})(?:_big)?$/i)
  if (cutPrefixMatch) return normalizeCut(cutPrefixMatch[1])

  const embeddedMatches = [...base.matchAll(/(?:^|[_-])(\d{2})(?:_big)?(?=$|[_-])/gi)]
  for (let i = embeddedMatches.length - 1; i >= 0; i -= 1) {
    const cut = normalizeCut(embeddedMatches[i][1])
    if (cut) return cut
  }

  return null
}

export interface MapFilesToProductCutsResult {
  mapped: Partial<Record<ProductPdpCut, File>>
  skipped: string[]
  duplicateCuts: ProductPdpCut[]
}

/** Maps multiple files to PDP cuts by parsing each filename. Last file wins on duplicate cuts. */
export function mapFilesToProductCuts(files: readonly File[]): MapFilesToProductCutsResult {
  const mapped: Partial<Record<ProductPdpCut, File>> = {}
  const skipped: string[] = []
  const duplicateCuts: ProductPdpCut[] = []

  for (const file of files) {
    const cut = parseProductCutFromFileName(file.name)
    if (!cut) {
      skipped.push(file.name)
      continue
    }
    if (mapped[cut]) duplicateCuts.push(cut)
    mapped[cut] = file
  }

  return {
    mapped,
    skipped,
    duplicateCuts: [...new Set(duplicateCuts)],
  }
}
