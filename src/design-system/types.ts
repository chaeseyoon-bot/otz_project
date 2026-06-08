export interface BaseSectionProps {
  id: string
  title: string
}

export interface HeroSlide {
  id: string
  title: string
  subtitle: string
  ctaLabel: string
  imageUrl: string
}

export interface PromotionalBanner {
  id: string
  badge: string
  title: string
  subtitle: string
  imageUrl: string
}

export interface CurationItem {
  id: string
  /** Mobile 2×2 lifestyle grid + PC lookbook thumbnail */
  imageUrl: string
  /** PC product row (Figma 2601:23364) */
  productName: string
  discount: string
  price: string
}
