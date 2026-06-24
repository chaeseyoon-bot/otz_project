import { Fragment, useMemo, type ReactNode } from 'react'
import { BrandIntroSection } from './BrandIntroSection'
import { BrandSection } from './BrandSection'
import { BrandSeriesSection } from './BrandSeriesSection'
import { CurationSection } from './CurationSection'
import { LookbookSection } from './LookbookSection'
import { PlanningBannerSection } from './PlanningBannerSection'
import { PlanningCollectionSection } from './PlanningCollectionSection'
import { PlanningDesktopMerchSection } from './PlanningDesktopMerchSection'
import { StylingSection } from './StylingSection'
import { useAdminHomeMainConfig } from '../../hooks/useAdminHomeMainConfig'
import {
  getPcHomeContentSections,
  shouldRenderCombinedBrandSection,
  type HomeContentSectionEntry,
  type HomeContentSectionId,
} from '../../lib/homeContentSections'

function renderHomeContentSection(id: HomeContentSectionId) {
  switch (id) {
    case 'brand':
      return <BrandIntroSection key="brand" />
    case 'series':
      return <BrandSeriesSection key="series" />
    case 'planning':
      return <PlanningBannerSection key="planning" />
    case 'collection':
      return (
        <Fragment key="collection">
          <PlanningCollectionSection />
          <PlanningDesktopMerchSection />
        </Fragment>
      )
    case 'curation':
      return <CurationSection key="curation" />
    case 'styling':
      return <StylingSection key="styling" />
    case 'lookbook':
      return <LookbookSection key="lookbook" />
    default:
      return null
  }
}

function buildSectionNodes(sections: HomeContentSectionEntry[]): ReactNode[] {
  const enabled = sections.filter((entry) => entry.enabled)
  const nodes: ReactNode[] = []
  let index = 0

  while (index < enabled.length) {
    if (shouldRenderCombinedBrandSection(enabled, index)) {
      nodes.push(<BrandSection key="brand-series-combined" />)
      index += 2
      continue
    }

    nodes.push(renderHomeContentSection(enabled[index].id))
    index += 1
  }

  return nodes
}

/** Mobile — admin-configured order (tabs 3–9). */
function HomeContentSectionsMobile() {
  const { homeContentSections } = useAdminHomeMainConfig()
  const nodes = useMemo(() => buildSectionNodes(homeContentSections), [homeContentSections])
  return <>{nodes}</>
}

/** PC — fixed default order; only ON/OFF from admin applies. */
function HomeContentSectionsPc() {
  const { homeContentSections } = useAdminHomeMainConfig()
  const nodes = useMemo(
    () => buildSectionNodes(getPcHomeContentSections(homeContentSections)),
    [homeContentSections],
  )
  return <>{nodes}</>
}

/** Renders home sections 3–9: reorder on mobile only, fixed order on PC. */
export function HomeContentSections() {
  return (
    <>
      <div className="lg:hidden">
        <HomeContentSectionsMobile />
      </div>
      <div className="hidden lg:contents">
        <HomeContentSectionsPc />
      </div>
    </>
  )
}
