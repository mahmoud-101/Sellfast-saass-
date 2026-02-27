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
  imageVariables?: Record<string, string>
  generatedImageUrl?: string
  isLoading: boolean
}

export interface ProductFormData {
  productName?: string
  productDescription: string
  price: string
  mainBenefit?: string
  mainPain?: string
  uniqueDifferentiator?: string
  market?: string
  awarenessLevel?: string
  competitionLevel?: string
  imageFile: File | null
  referenceImageFile: File | null
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
