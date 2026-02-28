/**
 * Performance Ad Engine: Strict Type Definitions
 * Arabic Ecom Performance Intelligence System
 */

export * from './ad.types';

// ─── Angle Types ────────────────────────────────────────────────────────────
export type PerformanceAngleType =
    | 'pain'
    | 'comparison'
    | 'bold_claim'
    | 'transformation'
    | 'urgency';

// ─── Layout Types ────────────────────────────────────────────────────────────
export type LayoutType =
    | 'comparison'
    | 'benefits'
    | 'offer'
    | 'problem_solution';

// ─── Market & Funnel Config ──────────────────────────────────────────────────
export type Market = 'egypt' | 'gulf' | 'mena';
export type PriceTier = 'budget' | 'mid' | 'premium';
export type AwarenessLevel = 'cold' | 'warm' | 'hot';
export type CompetitionLevel = 'low' | 'medium' | 'high';

// ─── Product Profile ─────────────────────────────────────────────────────────
export interface ProductPerformanceProfile {
    productName: string;
    productDescription: string;
    market: Market;
    priceTier: PriceTier;
    awarenessLevel: AwarenessLevel;
    competitionLevel: CompetitionLevel;
    mainBenefit: string;
    mainPain: string;
    uniqueDifferentiator: string;
}

// ─── Performance Angle ───────────────────────────────────────────────────────
export interface PerformanceAngle {
    type: PerformanceAngleType;
    coreLabel: string;              // User-facing label
    psychologicalTrigger: string;   // The emotion being triggered
    internalRationale: string;      // Strategic reasoning (not shown to user)
    suggestedLayout: LayoutType;
    marketPositioningHint: string;
}

// ─── Hook Quality Score ───────────────────────────────────────────────────────
export interface HookScore {
    total: number;            // 0–100
    clarity: number;          // 0–20
    specificity: number;      // 0–20
    emotionalStrength: number;// 0–20
    urgency: number;          // 0–20
    marketAlignment: number;  // 0–10
    simplicity: number;       // 0–10
    wasEnhanced: boolean;
}

// ─── CTA Result ───────────────────────────────────────────────────────────────
export interface CTAResult {
    primary: string;
    variants: [string, string];
    urgencyLevel: 'low' | 'medium' | 'high';
}

// ─── Ad Variant ──────────────────────────────────────────────────────────────
export interface PerformanceAdVariant {
    angle: PerformanceAngle;
    primaryHook: string;
    hookVariations: [string, string, string];
    hookScore: HookScore;
    bodyShort: string;
    bodyExpanded: string;
    cta: CTAResult;
    bullets: [string, string, string];
    emotionalTrigger: string;
    recommendedAudience: string;
    confidenceScore: number;      // 0–100
    testingSuggestion: TestingSuggestion;
}

// ─── Full Ad Set (returned to UI) ────────────────────────────────────────────
export interface PerformanceAdSet {
    profile: ProductPerformanceProfile;
    variants: PerformanceAdVariant[];
    generatedAt: string;          // ISO timestamp
}

// ─── Layout Data (passed to templates) ──────────────────────────────────────
export interface LayoutData {
    layoutType: LayoutType;
    headline: string;
    bullets: string[];
    cta: string;
    badge?: string;
    comparison?: {
        leftLabel: string;
        rightLabel: string;
    };
    iconSet?: string[];
    highlightWord?: string;
    accentColor?: string;
}

export interface TestingSuggestion {
    suggestedObjective: 'Conversion' | 'Engagement' | 'Video Views';
    suggestedAudience: string;
    budgetSplitSuggestion: string;
    testingNote: string;
}

// ─── Diamond Engine: Tagged Elements ───────────────────────────────────────
export type ElementTag = 'emotional' | 'logical' | 'urgent' | 'social_proof' | 'benefit' | 'feature';

export interface TaggedElement {
    content: string;
    tags: ElementTag[];
    weight: number; // 1-10
}

// ─── Diamond Engine: Platform Specs ──────────────────────────────────────────
export type Platform = 'facebook_feed' | 'instagram_story' | 'instagram_feed' |
    'tiktok' | 'snapchat' | 'linkedin' | 'google_display' | 'twitter';

export interface PlatformSpec {
    id: Platform;
    name: string;
    dimensions: { width: number; height: number };
    maxHeadlineLength: number;
    maxDescriptionLength: number;
    safeZone: { top: number; bottom: number; left: number; right: number };
    fontScale: number;
    ctaStyle: 'button' | 'swipe_up' | 'text_link';
    textPosition: 'top' | 'center' | 'bottom';
}

// ─── Diamond Engine: Audience Segments ───────────────────────────────────────
export type BuyingMotivation = 'price' | 'quality' | 'status' | 'convenience';

export interface AudienceSegment {
    id: string;
    name: string;
    buyingMotivation: BuyingMotivation;
    colorScheme: 'warm' | 'premium' | 'luxury' | 'corporate';
    urgencyLevel: 0 | 1 | 2 | 3;
    headlinePrefix?: string;
}

// ─── Diamond Engine: Dialects ────────────────────────────────────────────────
export type Dialect = 'eg' | 'sa';

// ─── Diamond Engine: Ad Score Factors ────────────────────────────────────────
export interface AdScoreFactors {
    headlineLength: number;
    hasNumber: boolean;
    hasEmoji: boolean;
    hasQuestion: boolean;
    urgencyLevel: 0 | 1 | 2 | 3;
    imageType: 'product' | 'lifestyle' | 'ugc' | 'graphic';
    colorContrast: number;
    textToImageRatio: number;
    ctaClarity: number;
}
