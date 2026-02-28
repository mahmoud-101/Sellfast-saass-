/**
 * ScoringPredictor.ts
 * Predicts the relative performance (CTR) of an ad variant using heuristic models.
 * Part of the "Diamond Ad Factory" core engine.
 */

export interface AdScoreFactors {
    headlineLength: number;         // Shorter is usually better for attention
    hasNumber: boolean;             // Numbers can increase CTR by ~23%
    hasEmoji: boolean;              // Emojis often increase engagement by ~15%
    hasQuestion: boolean;           // Questions provoke curiosity, raising CTR by ~18%
    urgencyLevel: 0 | 1 | 2 | 3;   // 0=None, 3=High. High urgency raises conversion.
    imageType: 'product' | 'lifestyle' | 'ugc' | 'graphic';
    colorContrast: number;          // 0-1 (higher typically improves visibility)
    textToImageRatio: number;       // Ratio of overlay text to image area (lower is better for Meta)
    ctaClarity: number;             // 0-1 (clearer CTA = higher click probability)
}

/**
 * Predicts the Click-Through Rate (CTR) based on provided ad factors.
 * Uses the weighting logic provided in the "Diamond Secrets".
 */
export function predictCTR(factors: AdScoreFactors): number {
    let baseCTR = 1.65; // Global industry average benchmark

    // ─── Text Optimization Factors ───
    if (factors.headlineLength < 35) baseCTR *= 1.15;
    if (factors.hasNumber) baseCTR *= 1.23;
    if (factors.hasEmoji) baseCTR *= 1.15;
    if (factors.hasQuestion) baseCTR *= 1.18;

    // ─── Urgency & FOMO ───
    baseCTR *= (1 + (factors.urgencyLevel * 0.12));

    // ─── Visual Context Multipliers ───
    const imageMultiplier = {
        'ugc': 1.45,        // Highest conversion (User Generated Content)
        'lifestyle': 1.25,
        'product': 1.05,
        'graphic': 0.85,
    };
    baseCTR *= imageMultiplier[factors.imageType];

    // ─── Technical & Formatting Constraints ───
    baseCTR *= (1 + (factors.colorContrast * 0.28));

    // Penalty for excessive text on ad images (Meta policy vibe)
    if (factors.textToImageRatio > 0.25) {
        baseCTR *= 0.65;
    }

    // ─── CTA Intensity ───
    baseCTR *= (1 + (factors.ctaClarity * 0.42));

    // Final rounding for user-friendly display
    return Math.round(baseCTR * 100) / 100;
}

/**
 * Maps a numerical CTR to a human-readable performance label.
 */
export function getPerformanceLabel(ctr: number): { label: string; color: string } {
    if (ctr >= 3.5) return { label: 'إعلان ذهبي 💎', color: '#FFD700' };
    if (ctr >= 2.5) return { label: 'أداء ممتاز 🔥', color: '#10B981' };
    if (ctr >= 1.8) return { label: 'أداء جيد ✅', color: '#3B82F6' };
    return { label: 'يحتاج تحسين 🛠️', color: '#9CA3AF' };
}
