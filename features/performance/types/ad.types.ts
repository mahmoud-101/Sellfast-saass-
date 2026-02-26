// ============================================
// Ebdaa v2 - Ad Engine Types
// ============================================

export type AdAngle =
  | 'تأثير_الألم'
  | 'الفارق_المقاس'
  | 'الادعاء_الجريء'
  | 'التحول_والنتيجة'
  | 'الزخم_والإلحاح'

export type CardStyle =
  | 'pain'
  | 'compare'
  | 'bold'
  | 'transform'
  | 'urgency'

export interface AdCard {
  id: string
  angle: AdAngle
  style: CardStyle
  badgeLabel: string
  badgeEmoji: string
  primaryText: string
  headline: string
  description: string
  hooks: [string, string, string]
  adPost: string
  ctaButton: string
  hookScore: number
  imageUrl: string | null
  imagePrompt: string
  imageStyleName: string
  generatedImageUrl?: string
  isLoading: boolean
}

export interface ProductFormData {
  productName: string
  price: string
  mainBenefit: string
  audience: string
  category: 'ملابس' | 'تجميل' | 'أدوات منزلية' | 'أخرى'
  ageRange: string
  budget: string
  imageFile: File | null
  referenceImageFile: File | null
  productUrl: string
}

export interface AdvancedAnalysis {
  market: string
  priceSegment: string
  awareness: string
  usp: string
  hooksAnalysis: Array<{
    angle: AdAngle
    score: number
    tip: string
  }>
}

export interface GenerationResult {
  ads: AdCard[]
  advancedAnalysis: AdvancedAnalysis
}
