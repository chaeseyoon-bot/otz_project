import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArchiveMasonryGrid } from '../components/organisms/ArchiveMasonryGrid'
import type { ArchiveLookbookItem } from '../data/archiveLookbooks'
import { ARCHIVE_DETAIL_CONFIG_UPDATED_EVENT } from '../lib/adminArchiveDetailConfig'
import { filterResolvedArchiveLookbooks } from '../lib/archiveLookbooksResolver'
import { getArchiveDetailPath, navigateSpa } from '../lib/spaNavigation'
import { ARCHIVE_SEASON_FILTERS, type ArchiveSeasonId } from '../data/archiveLookbooks'

/** Figma 2624:12205 (MO) / 2474:3469 (PC) */
export function ArchivePage() {
  const [activeSeason, setActiveSeason] = useState<ArchiveSeasonId>('all')
  const [listVersion, setListVersion] = useState(0)

  useEffect(() => {
    const refresh = () => setListVersion((version) => version + 1)
    window.addEventListener(ARCHIVE_DETAIL_CONFIG_UPDATED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(ARCHIVE_DETAIL_CONFIG_UPDATED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const lookbooks = useMemo(
    () => filterResolvedArchiveLookbooks(activeSeason),
    [activeSeason, listVersion],
  )

  const handleLookbookClick = useCallback((item: ArchiveLookbookItem) => {
    navigateSpa(getArchiveDetailPath(item.id))
  }, [])

  return (
    <main className="bg-white lg:w-full">
      {/* Mobile — season chips */}
      <section className="h-[45px] bg-[#f8f8f8] px-[15px] py-[14px] lg:hidden">
        <div className="flex h-[17px] gap-3 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {ARCHIVE_SEASON_FILTERS.map((filter) => {
            const isActive = filter.id === activeSeason
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveSeason(filter.id)}
                className={`shrink-0 border-0 bg-transparent px-0 py-0 ${
                  isActive
                    ? 'text-[13px] font-medium leading-[1.2] tracking-[-0.02em] text-dark'
                    : 'text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-[#999999]'
                }`}
              >
                {filter.label}
              </button>
            )
          })}
        </div>
      </section>

      {/* PC — Figma 2474:3473: title + season filter pills (NEW/BEST 패턴) */}
      <section className="hidden lg:mx-auto lg:block lg:w-full lg:max-w-[1400px] lg:px-0 lg:pt-10">
        <h1 className="m-0 flex flex-col items-center justify-start text-[34px] font-extrabold leading-[1.2] tracking-[-0.02em] text-dark">
          ARCHIVE
        </h1>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 pt-5">
          {ARCHIVE_SEASON_FILTERS.map((filter) => {
            const isActive = filter.id === activeSeason
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveSeason(filter.id)}
                className={`shrink-0 rounded-[100px] border border-solid px-[60px] py-[15px] text-[15px] leading-[1.4] tracking-[-0.02em] text-[var(--otz-color-text-primary)] transition-opacity ${
                  isActive
                    ? 'border-[var(--otz-color-text-primary)] bg-white font-normal hover:opacity-80'
                    : 'border-lightGray bg-transparent font-normal hover:opacity-100'
                }`}
              >
                {filter.label}
              </button>
            )
          })}
        </div>
      </section>

      {/* Mobile masonry — Figma 2624:12588 */}
      <section className="px-[10px] pb-10 pt-[10px] lg:hidden">
        <ArchiveMasonryGrid
          items={lookbooks}
          variant="mobile"
          onItemClick={handleLookbookClick}
        />
      </section>

      {/* PC masonry — Figma 2474:3521 (3열) */}
      <section className="hidden lg:mx-auto lg:block lg:max-w-[1400px] lg:px-0 lg:pb-20 lg:pt-5">
        <ArchiveMasonryGrid items={lookbooks} variant="pc" onItemClick={handleLookbookClick} />
      </section>
    </main>
  )
}
