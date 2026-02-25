/**
 * Performance Ad Engine: Strict Type Definitions
 * Arabic Ecom Performance Intelligence System
 */

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

// ─── Testing Suggestion ───────────────────────────────────────────────────────
export interface TestingSuggestion {
    suggestedObjective: 'Conversion' | 'Engagement' | 'Video Views';
    suggestedAudience: string;
    budgetSplitSuggestion: string;
    testingNote: string;
}
