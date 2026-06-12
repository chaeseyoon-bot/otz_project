import { buildPcBlocksFromImages } from '../data/archiveLookbookDetails'
import { ARCHIVE_LOOKBOOK_ITEMS } from '../data/archiveLookbooks'

export const ARCHIVE_DETAIL_CONFIG_UPDATED_EVENT = 'otz-archive-detail-config-updated'

const STORAGE_KEY = 'otz-admin-archive-detail'

export const MAX_ARCHIVE_DETAIL_IMAGES = 30
export const MAX_ARCHIVE_DETAIL_ROWS = 20

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
  thumbnailUrl: string | null
  thumbnailFileName: string | null
  detailRows: AdminArchiveDetailRow[]
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
    thumbnailUrl: null,
    thumbnailFileName: null,
    detailRows: [],
  }
}

export function createDefaultAdminArchiveDetailConfig(): AdminArchiveDetailConfig {
  return {
    version: 1,
    lookbooks: ARCHIVE_LOOKBOOK_ITEMS.map((item) => createEmptyAdminArchiveLookbookEntry(item.id)),
    updatedAt: null,
  }
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

function normalizeLookbookEntry(
  raw: LegacyAdminArchiveLookbookEntry | undefined,
  fallback: AdminArchiveLookbookEntry,
): AdminArchiveLookbookEntry {
  const detailRows = migrateLegacyDetailRows(raw ?? {})

  return {
    id: typeof raw?.id === 'string' ? raw.id : fallback.id,
    thumbnailUrl: typeof raw?.thumbnailUrl === 'string' ? raw.thumbnailUrl : null,
    thumbnailFileName: typeof raw?.thumbnailFileName === 'string' ? raw.thumbnailFileName : null,
    detailRows: detailRows.length ? detailRows : fallback.detailRows,
  }
}

export function normalizeAdminArchiveDetailConfig(
  raw: Partial<AdminArchiveDetailConfig> | null | undefined,
): AdminArchiveDetailConfig {
  const defaults = createDefaultAdminArchiveDetailConfig()
  if (!raw || !Array.isArray(raw.lookbooks)) return defaults

  return {
    version: 1,
    lookbooks: defaults.lookbooks.map((fallback) => {
      const found = raw.lookbooks?.find((item) => item.id === fallback.id)
      return normalizeLookbookEntry(found, fallback)
    }),
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : null,
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
  const next = normalizeAdminArchiveDetailConfig({
    version: 1,
    lookbooks: config.lookbooks,
    updatedAt: new Date().toISOString(),
  })

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    throw new Error('ARCHIVE_DETAIL_CONFIG_STORAGE_FAILED')
  }

  window.dispatchEvent(new CustomEvent(ARCHIVE_DETAIL_CONFIG_UPDATED_EVENT))
  return next
}
