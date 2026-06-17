import { buildPcBlocksFromImages } from '../data/archiveLookbookDetails'
import type { ArchiveSeasonId } from '../data/archiveLookbooks'
import { parseArchiveSeasonFromTitle } from './archiveSeasonFilters'

export const ARCHIVE_DETAIL_CONFIG_UPDATED_EVENT = 'otz-archive-detail-config-updated'

const STORAGE_KEY = 'otz-admin-archive-detail'

let remoteConfigCache: AdminArchiveDetailConfig | null = null

export function setArchiveDetailConfigCache(config: AdminArchiveDetailConfig | null): void {
  remoteConfigCache = config
}

/** In-memory Supabase cache after hydrate. Never reads localStorage for storefront truth. */
export function getEffectiveArchiveDetailConfig(): AdminArchiveDetailConfig {
  return remoteConfigCache ?? createDefaultAdminArchiveDetailConfig()
}

export const MAX_ARCHIVE_DETAIL_IMAGES = 30
export const MAX_ARCHIVE_DETAIL_ROWS = 20
export const MAX_ARCHIVE_LOOKBOOKS = 50

export type ArchiveColumnsPerRow = 1 | 2 | 3

export interface AdminArchiveImageRef {
  imageUrl: string | null
  imageFileName: string | null
}

export interface AdminArchiveDetailRow {
  id: string
  columnsPerRow: ArchiveColumnsPerRow
  images: AdminArchiveImageRef[]
}

export interface AdminArchiveLookbookEntry {
  id: string
  /** List card title on archive page */
  title: string
  seasons: ArchiveSeasonId[]
  /** Masonry aspect ratio (width / height) */
  aspectRatio: number
  thumbnailUrl: string | null
  thumbnailFileName: string | null
  detailRows: AdminArchiveDetailRow[]
  /** Shown below the first detail image row (Figma 131:3486). */
  introHeading: string
  introBody: string
  /** ISO timestamp — newest entries sort to the top of the list */
  createdAt: string
}

export interface AdminArchiveDetailConfig {
  version: 1
  lookbooks: AdminArchiveLookbookEntry[]
  updatedAt: string | null
}

/** @deprecated Legacy flat layout — migrated to detailRows on load. */
interface LegacyAdminArchiveLookbookEntry extends Partial<AdminArchiveLookbookEntry> {
  columnsPerRow?: ArchiveColumnsPerRow
  detailImages?: AdminArchiveImageRef[]
}

const DEFAULT_ASPECT_RATIO = 460 / 575

export function createEmptyAdminArchiveImageRef(): AdminArchiveImageRef {
  return { imageUrl: null, imageFileName: null }
}

export function createRowId(): string {
  return `row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createEmptyAdminArchiveDetailRow(
  columnsPerRow: ArchiveColumnsPerRow = 1,
): AdminArchiveDetailRow {
  return {
    id: createRowId(),
    columnsPerRow,
    images: Array.from({ length: columnsPerRow }, () => createEmptyAdminArchiveImageRef()),
  }
}

export function createEmptyAdminArchiveLookbookEntry(id: string): AdminArchiveLookbookEntry {
  return {
    id,
    title: '',
    seasons: ['all'],
    aspectRatio: DEFAULT_ASPECT_RATIO,
    thumbnailUrl: null,
    thumbnailFileName: null,
    detailRows: [],
    introHeading: '',
    introBody: '',
    createdAt: new Date().toISOString(),
  }
}

export function createDefaultAdminArchiveDetailConfig(): AdminArchiveDetailConfig {
  return {
    version: 1,
    lookbooks: [],
    updatedAt: null,
  }
}

export function archiveEntryHasListData(entry: AdminArchiveLookbookEntry): boolean {
  return Boolean(entry.thumbnailUrl?.trim())
}

/** Thumbnail must be a durable URL (not blob/data) for storefront list/detail. */
export function isPublishableArchiveImageUrl(url: string | null | undefined): boolean {
  const normalized = url?.trim()
  if (!normalized) return false
  if (normalized.startsWith('blob:') || normalized.startsWith('data:')) return false
  return normalized.startsWith('http') || normalized.startsWith('/')
}

export function archiveEntryHasPublishableListData(entry: AdminArchiveLookbookEntry): boolean {
  return isPublishableArchiveImageUrl(entry.thumbnailUrl)
}

export function archiveEntryHasDetailData(entry: AdminArchiveLookbookEntry): boolean {
  if (entry.introHeading?.trim() || entry.introBody?.trim()) return true
  if (entry.thumbnailUrl?.trim()) return true
  return entry.detailRows.some((row) =>
    row.images.slice(0, row.columnsPerRow).some((img) => Boolean(img.imageUrl?.trim())),
  )
}

function parseArchiveIdNumber(id: string): number {
  const match = /^archive-(\d+)$/.exec(id)
  return match ? Number(match[1]) : 0
}

/** Newest first — higher id / later createdAt at the top. */
export function compareArchiveLookbooksNewestFirst(
  a: AdminArchiveLookbookEntry,
  b: AdminArchiveLookbookEntry,
): number {
  const aMs = Date.parse(a.createdAt)
  const bMs = Date.parse(b.createdAt)
  if (Number.isFinite(aMs) && Number.isFinite(bMs) && aMs !== bMs) return bMs - aMs
  return parseArchiveIdNumber(b.id) - parseArchiveIdNumber(a.id)
}

export function sortArchiveLookbooksNewestFirst(
  lookbooks: AdminArchiveLookbookEntry[],
): AdminArchiveLookbookEntry[] {
  return [...lookbooks].sort(compareArchiveLookbooksNewestFirst)
}

export function getNextArchiveLookbookId(lookbooks: AdminArchiveLookbookEntry[]): string | null {
  if (lookbooks.length >= MAX_ARCHIVE_LOOKBOOKS) return null
  const maxNum = lookbooks.reduce((max, entry) => Math.max(max, parseArchiveIdNumber(entry.id)), 0)
  return `archive-${String(maxNum + 1).padStart(2, '0')}`
}

export function getLatestArchiveLookbookIdFromConfig(
  config: AdminArchiveDetailConfig = getEffectiveArchiveDetailConfig(),
): string | null {
  const published = sortArchiveLookbooksNewestFirst(config.lookbooks).filter(archiveEntryHasPublishableListData)
  return published[0]?.id ?? null
}

export function countDetailImages(rows: AdminArchiveDetailRow[]): number {
  return rows.reduce(
    (total, row) => total + row.images.slice(0, row.columnsPerRow).filter((img) => img.imageUrl?.trim()).length,
    0,
  )
}

export function countCompleteRows(rows: AdminArchiveDetailRow[]): number {
  return rows.filter((row) =>
    row.images.slice(0, row.columnsPerRow).every((img) => Boolean(img.imageUrl?.trim())),
  ).length
}

function flattenPublishableImageUrls(entry: AdminArchiveLookbookEntry): string[] {
  const urls: string[] = []
  const thumb = entry.thumbnailUrl?.trim()
  if (isPublishableArchiveImageUrl(thumb)) urls.push(thumb!)

  for (const row of entry.detailRows) {
    for (let index = 0; index < row.columnsPerRow; index += 1) {
      const url = row.images[index]?.imageUrl?.trim()
      if (isPublishableArchiveImageUrl(url)) urls.push(url!)
    }
  }

  return urls
}

function flattenImageFileNames(entry: AdminArchiveLookbookEntry): string[] {
  const names: string[] = []
  if (entry.thumbnailFileName?.trim()) names.push(entry.thumbnailFileName.trim())

  for (const row of entry.detailRows) {
    for (let index = 0; index < row.columnsPerRow; index += 1) {
      const name = row.images[index]?.imageFileName?.trim()
      if (name) names.push(name)
    }
  }

  return names
}

/** Re-applies durable image URLs onto a saved row layout (title/intro/columns preserved). */
export function remapDetailRowsWithPublishableUrls(
  rows: AdminArchiveDetailRow[],
  publishableUrls: string[],
  fileNames: string[] = [],
): AdminArchiveDetailRow[] {
  let urlIndex = 0

  return rows.map((row) => ({
    ...row,
    images: Array.from({ length: row.columnsPerRow }, (_, slotIndex) => {
      const previous = row.images[slotIndex] ?? createEmptyAdminArchiveImageRef()
      const imageUrl = publishableUrls[urlIndex] ?? previous.imageUrl
      const imageFileName = fileNames[urlIndex] ?? previous.imageFileName
      urlIndex += 1
      return { imageUrl, imageFileName }
    }),
  }))
}

export interface MergeArchiveLookbookFallback {
  imageUrls: string[]
  fileNames?: string[]
}

/** Merges browser draft (titles/rows) with Supabase (durable URLs). */
export function mergeArchiveLookbookEntry(
  draft: AdminArchiveLookbookEntry,
  remote: AdminArchiveLookbookEntry | undefined,
  fallback?: MergeArchiveLookbookFallback,
): AdminArchiveLookbookEntry {
  const publishableUrls = [
    ...new Set([
      ...flattenPublishableImageUrls(remote ?? createEmptyAdminArchiveLookbookEntry(draft.id)),
      ...flattenPublishableImageUrls(draft),
      ...(fallback?.imageUrls ?? []),
    ]),
  ].filter(isPublishableArchiveImageUrl)

  const fileNames = [
    ...flattenImageFileNames(remote ?? createEmptyAdminArchiveLookbookEntry(draft.id)),
    ...flattenImageFileNames(draft),
    ...(fallback?.fileNames ?? []),
  ]

  const layoutSource =
    draft.detailRows.length > 0
      ? draft
      : remote?.detailRows.length
        ? remote
        : draft

  const detailRows =
    layoutSource.detailRows.length > 0
      ? remapDetailRowsWithPublishableUrls(layoutSource.detailRows, publishableUrls, fileNames)
      : []

  const thumbnailUrl =
    (isPublishableArchiveImageUrl(remote?.thumbnailUrl) ? remote!.thumbnailUrl!.trim() : null) ??
    (isPublishableArchiveImageUrl(draft.thumbnailUrl) ? draft.thumbnailUrl!.trim() : null) ??
    publishableUrls[0] ??
    null

  return {
    ...createEmptyAdminArchiveLookbookEntry(draft.id),
    ...(remote ?? {}),
    ...draft,
    id: draft.id,
    title: draft.title.trim() || remote?.title.trim() || '',
    introHeading: draft.introHeading.trim() || remote?.introHeading.trim() || '',
    introBody: draft.introBody.trim() || remote?.introBody.trim() || '',
    seasons: draft.seasons.length ? draft.seasons : (remote?.seasons ?? ['all']),
    aspectRatio: draft.aspectRatio || remote?.aspectRatio || DEFAULT_ASPECT_RATIO,
    thumbnailUrl,
    thumbnailFileName: draft.thumbnailFileName || remote?.thumbnailFileName || fallback?.fileNames?.[0] || null,
    detailRows,
    createdAt: draft.createdAt || remote?.createdAt || new Date().toISOString(),
  }
}

export function archiveEntryHasRicherMetadata(
  draft: AdminArchiveLookbookEntry,
  remote?: AdminArchiveLookbookEntry,
): boolean {
  if (draft.title.trim() && !remote?.title?.trim()) return true
  if (draft.introHeading.trim() && !remote?.introHeading?.trim()) return true
  if (draft.introBody.trim() && !remote?.introBody?.trim()) return true
  if (draft.detailRows.some((row) => row.columnsPerRow > 1) && !remote?.detailRows?.some((row) => row.columnsPerRow > 1)) {
    return true
  }
  if (draft.detailRows.length > 0 && !(remote?.detailRows.length ?? 0)) return true
  return false
}

/** Union merge — draft supplies copy/layout, remote/fallback supply durable image URLs. */
export function mergeArchiveDetailConfigs(
  draft: AdminArchiveDetailConfig,
  remote: AdminArchiveDetailConfig,
  fallbackById: Record<string, MergeArchiveLookbookFallback> = {},
): AdminArchiveDetailConfig {
  const remoteById = new Map(remote.lookbooks.map((entry) => [entry.id, entry]))
  const draftById = new Map(draft.lookbooks.map((entry) => [entry.id, entry]))
  const ids = [...new Set([...draftById.keys(), ...remoteById.keys()])]

  const lookbooks = ids
    .map((id) => {
      const draftEntry = draftById.get(id)
      const remoteEntry = remoteById.get(id)
      if (!draftEntry && remoteEntry) return remoteEntry
      if (!draftEntry) return null
      return mergeArchiveLookbookEntry(draftEntry, remoteEntry, fallbackById[id])
    })
    .filter((entry): entry is AdminArchiveLookbookEntry => entry != null)
    .filter((entry) => archiveEntryHasDetailData(entry) || entry.title.trim())

  return normalizeAdminArchiveDetailConfig({
    version: 1,
    lookbooks,
    updatedAt: new Date().toISOString(),
  })
}

export function archiveConfigHasRicherDraftMetadata(
  draft: AdminArchiveDetailConfig,
  remote: AdminArchiveDetailConfig,
): boolean {
  const remoteById = new Map(remote.lookbooks.map((entry) => [entry.id, entry]))
  return draft.lookbooks.some((entry) => archiveEntryHasRicherMetadata(entry, remoteById.get(entry.id)))
}

function normalizeColumnsPerRow(value: unknown): ArchiveColumnsPerRow {
  if (value === 1 || value === 2 || value === 3) return value
  return 1
}

function normalizeImageRef(raw: unknown): AdminArchiveImageRef {
  const item = raw as Partial<AdminArchiveImageRef>
  return {
    imageUrl: typeof item?.imageUrl === 'string' ? item.imageUrl : null,
    imageFileName: typeof item?.imageFileName === 'string' ? item.imageFileName : null,
  }
}

function normalizeDetailRow(raw: unknown, fallback: AdminArchiveDetailRow): AdminArchiveDetailRow {
  const item = raw as Partial<AdminArchiveDetailRow>
  const columnsPerRow = normalizeColumnsPerRow(item?.columnsPerRow ?? fallback.columnsPerRow)
  const images = Array.from({ length: columnsPerRow }, (_, index) =>
    normalizeImageRef(item?.images?.[index]),
  )

  return {
    id: typeof item?.id === 'string' ? item.id : fallback.id,
    columnsPerRow,
    images,
  }
}

function migrateLegacyDetailRows(raw: LegacyAdminArchiveLookbookEntry): AdminArchiveDetailRow[] {
  if (Array.isArray(raw.detailRows)) {
    return raw.detailRows.slice(0, MAX_ARCHIVE_DETAIL_ROWS).map((row) =>
      normalizeDetailRow(row, createEmptyAdminArchiveDetailRow(1)),
    )
  }

  const columnsPerRow = normalizeColumnsPerRow(raw.columnsPerRow)
  const detailImages = Array.isArray(raw.detailImages)
    ? raw.detailImages.map(normalizeImageRef).filter((img) => Boolean(img.imageUrl?.trim()))
    : []

  if (!detailImages.length) return []

  const blocks = buildPcBlocksFromImages(
    detailImages.map((img) => ({ src: img.imageUrl! })),
    columnsPerRow,
  )

  return blocks
    .map((block) => {
      if (block.type === 'full') {
        return {
          id: createRowId(),
          columnsPerRow: 1 as const,
          images: [{ imageUrl: block.image.src, imageFileName: null }],
        }
      }
      if (block.type === 'split') {
        return {
          id: createRowId(),
          columnsPerRow: 2 as const,
          images: [
            { imageUrl: block.left.src, imageFileName: null },
            { imageUrl: block.right.src, imageFileName: null },
          ],
        }
      }
      return {
        id: createRowId(),
        columnsPerRow: 3 as const,
        images: [
          { imageUrl: block.left.src, imageFileName: null },
          { imageUrl: block.center.src, imageFileName: null },
          { imageUrl: block.right.src, imageFileName: null },
        ],
      }
    })
    .slice(0, MAX_ARCHIVE_DETAIL_ROWS)
}

function inferLegacyCreatedAt(id: string): string {
  const index = parseArchiveIdNumber(id)
  if (!index) return new Date().toISOString()
  return new Date(Date.UTC(2020, 0, index)).toISOString()
}

function normalizeSeasons(value: unknown, title = ''): ArchiveSeasonId[] {
  const fromTitle = title.trim() ? parseArchiveSeasonFromTitle(title) : null
  if (fromTitle) return ['all', fromTitle.id]

  if (!Array.isArray(value)) return ['all']
  const seasonPattern = /^\d{2}(ss|fw)$/
  const seasons = value.filter(
    (item): item is ArchiveSeasonId =>
      typeof item === 'string' && (item === 'all' || seasonPattern.test(item)),
  )
  return seasons.length ? seasons : ['all']
}

function normalizeLookbookEntry(raw: LegacyAdminArchiveLookbookEntry | undefined): AdminArchiveLookbookEntry | null {
  if (!raw || typeof raw.id !== 'string' || !raw.id.trim()) return null

  const detailRows = migrateLegacyDetailRows(raw)
  const entry = createEmptyAdminArchiveLookbookEntry(raw.id)

  return {
    ...entry,
    title: typeof raw.title === 'string' ? raw.title : entry.title,
    seasons: normalizeSeasons(raw.seasons, typeof raw.title === 'string' ? raw.title : ''),
    aspectRatio:
      typeof raw.aspectRatio === 'number' && Number.isFinite(raw.aspectRatio) && raw.aspectRatio > 0
        ? raw.aspectRatio
        : entry.aspectRatio,
    thumbnailUrl: typeof raw.thumbnailUrl === 'string' ? raw.thumbnailUrl : null,
    thumbnailFileName: typeof raw.thumbnailFileName === 'string' ? raw.thumbnailFileName : null,
    detailRows,
    introHeading: typeof raw.introHeading === 'string' ? raw.introHeading : '',
    introBody: typeof raw.introBody === 'string' ? raw.introBody : '',
    createdAt:
      typeof raw.createdAt === 'string' && raw.createdAt.trim()
        ? raw.createdAt
        : inferLegacyCreatedAt(raw.id),
  }
}

export function normalizeAdminArchiveDetailConfig(
  raw: Partial<AdminArchiveDetailConfig> | null | undefined,
  options?: { keepEmptyEntries?: boolean },
): AdminArchiveDetailConfig {
  if (!raw || !Array.isArray(raw.lookbooks)) return createDefaultAdminArchiveDetailConfig()

  const lookbooks = raw.lookbooks
    .map((item) => normalizeLookbookEntry(item))
    .filter((item): item is AdminArchiveLookbookEntry => item != null)
    .filter(
      (entry) =>
        options?.keepEmptyEntries || archiveEntryHasDetailData(entry) || entry.title.trim(),
    )
    .slice(0, MAX_ARCHIVE_LOOKBOOKS)

  return {
    version: 1,
    lookbooks: sortArchiveLookbooksNewestFirst(lookbooks),
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : null,
  }
}

/** Mirrors server payload to localStorage — offline cache only, not source of truth. */
export function mirrorAdminArchiveDetailConfigLocally(config: AdminArchiveDetailConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {
    /* ignore quota errors */
  }
}

export function loadAdminArchiveDetailConfig(): AdminArchiveDetailConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultAdminArchiveDetailConfig()
    return normalizeAdminArchiveDetailConfig(JSON.parse(raw) as Partial<AdminArchiveDetailConfig>)
  } catch {
    return createDefaultAdminArchiveDetailConfig()
  }
}

export function saveAdminArchiveDetailConfig(
  config: Pick<AdminArchiveDetailConfig, 'lookbooks'>,
): AdminArchiveDetailConfig {
  const next = normalizeAdminArchiveDetailConfig(
    {
      version: 1,
      lookbooks: config.lookbooks,
      updatedAt: new Date().toISOString(),
    },
    { keepEmptyEntries: true },
  )

  mirrorAdminArchiveDetailConfigLocally(next)
  setArchiveDetailConfigCache(next)
  window.dispatchEvent(new CustomEvent(ARCHIVE_DETAIL_CONFIG_UPDATED_EVENT))
  return next
}
