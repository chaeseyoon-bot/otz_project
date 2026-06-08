import { BrandSection } from '../components/organisms/BrandSection'
import { CategorySection } from '../components/organisms/CategorySection'
import { CurationSection } from '../components/organisms/CurationSection'
import { ForYouSection } from '../components/organisms/ForYouSection'
import { LookbookSection } from '../components/organisms/LookbookSection'
import { MainHeroSection } from '../components/organisms/MainHeroSection'
import { PlanningBannerSection } from '../components/organisms/PlanningBannerSection'
import { PlanningCollectionSection } from '../components/organisms/PlanningCollectionSection'
import { PlanningDesktopMerchSection } from '../components/organisms/PlanningDesktopMerchSection'
import { StylingSection } from '../components/organisms/StylingSection'

/** Route body only — shell, header, footer, tab bar live in `App` so the header does not remount on 홈/NEW. */
export function HomePage() {
  return (
    <main className="lg:w-full">
      <MainHeroSection />
      <CategorySection />
      <ForYouSection />
      <BrandSection />
      <PlanningBannerSection />
      <PlanningCollectionSection />
      <PlanningDesktopMerchSection />
      <CurationSection />
      <StylingSection />
      <LookbookSection />
    </main>
  )
}
