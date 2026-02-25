/**
 * HookScoringEngine.ts
 * Scores a hook on 6 dimensions (0-100).
 * If score < 75, auto-enhances the hook.
 */

import type { HookScore, Market } from '../types';

interface ScoringResult {
    score: HookScore;
    finalHook: string;
}

// ─── Scorer Helpers ───────────────────────────────────────────────────────────
const PAIN_WORDS = ['تعبت', 'مشكلة', 'معاناة', 'لا تزال', 'يكفي', 'فشلت', 'خسرت'];
const URGENCY_WORDS = ['الآن', 'اليوم', 'محدود', 'ينتهي', 'أخر', 'قريباً', 'لفترة'];
const SPECIFIC_INDICATORS = ['100%', '%', 'رقم', 'ضعف', 'أضعاف', 'يوم', 'ساعة', 'سنة'];
const COMPLEX_SIGNS = ['والذي', 'حيث أن', 'من المعلوم أن', 'استناداً إلى'];

function scoreClarity(hook: string): number {
    if (hook.length > 120) return 10;
    const hasComplexity = COMPLEX_SIGNS.some((s) => hook.includes(s));
    if (hasComplexity) return 12;
    if (hook.split(' ').length <= 12) return 20;
    return 16;
}

function scoreSpecificity(hook: string): number {
    const specifics = SPECIFIC_INDICATORS.filter((s) => hook.includes(s));
    if (specifics.length >= 2) return 20;
    if (specifics.length === 1) return 13;
    return 6;
}

function scoreEmotionalStrength(hook: string): number {
    const painHits = PAIN_WORDS.filter((w) => hook.includes(w)).length;
    if (painHits >= 2) return 20;
    if (painHits === 1) return 14;
    if (hook.includes('؟')) return 10; // Question = curiosity trigger
    return 5;
}

function scoreUrgency(hook: string): number {
    const hits = URGENCY_WORDS.filter((w) => hook.includes(w)).length;
    if (hits >= 2) return 20;
    if (hits === 1) return 12;
    return 0;
}

function scoreMarketAlignment(hook: string, market: Market): number {
    const egyptianWords = ['كده', 'إيه', 'بقا', 'يعم', 'والله'];
    const gulfWords = ['وايد', 'زين', 'عيل', 'هذا', 'حيل'];
    const words = market === 'egypt' ? egyptianWords : gulfWords;
    const hits = words.filter((w) => hook.includes(w)).length;
    return hits > 0 ? 10 : 5;
}

function scoreSimplicity(hook: string): number {
    const words = hook.split(' ').length;
    if (words <= 8) return 10;
    if (words <= 14) return 7;
    return 3;
}

// ─── Auto-Enhancer ────────────────────────────────────────────────────────────
function enhanceHook(original: string, market: Market): string {
    // Add urgency prefix if missing
    const hasUrgency = URGENCY_WORDS.some((w) => original.includes(w));
    const hasPain = PAIN_WORDS.some((w) => original.includes(w));

    let enhanced = original;

    if (!hasUrgency && !hasPain) {
        const prefix = market === 'egypt' ? '🔥 لفترة محدودة: ' : '⚡ عرض خاص: ';
        enhanced = prefix + enhanced;
    }

    if (enhanced.length > 120) {
        enhanced = enhanced.substring(0, 117) + '...';
    }

    return enhanced;
}

// ─── Main Engine ──────────────────────────────────────────────────────────────
export function runHookScoringEngine(
    hook: string,
    market: Market
): ScoringResult {
    const clarity = scoreClarity(hook);
    const specificity = scoreSpecificity(hook);
    const emotionalStrength = scoreEmotionalStrength(hook);
    const urgency = scoreUrgency(hook);
    const marketAlignment = scoreMarketAlignment(hook, market);
    const simplicity = scoreSimplicity(hook);

    const total = clarity + specificity + emotionalStrength + urgency + marketAlignment + simplicity;
    const wasEnhanced = total < 75;
    const finalHook = wasEnhanced ? enhanceHook(hook, market) : hook;

    return {
        score: {
            total,
            clarity,
            specificity,
            emotionalStrength,
            urgency,
            marketAlignment,
            simplicity,
            wasEnhanced,
        },
        finalHook,
    };
}
