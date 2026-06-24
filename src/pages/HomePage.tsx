import { CategorySection } from '../components/organisms/CategorySection'
import { ForYouSection } from '../components/organisms/ForYouSection'
import { HomeContentSections } from '../components/organisms/HomeContentSections'
import { MainHeroSection } from '../components/organisms/MainHeroSection'

/** Route body only — shell, header, footer, tab bar live in `App` so the header does not remount on 홈/NEW. */
export function HomePage() {
  return (
    <main className="lg:w-full">
      <MainHeroSection />
      <CategorySection />
      <ForYouSection />
      <HomeContentSections />
    </main>
  )
}
