// ============================================
// Ebdaa v2 - Response Analyzer
// ============================================

import { GenerationResult, AdCard, CardStyle } from '../types/ad.types';

// ألوان كل ستايل
export const CARD_STYLES: Record<CardStyle, {
    bg: string;
    badge: string;
    button: string;
    border: string;
}> = {
    pain: { bg: '#1a0a0a', badge: '#dc2626', button: '#ef4444', border: '#7f1d1d' },
    compare: { bg: '#0a0f1a', badge: '#2563eb', button: '#3b82f6', border: '#1e3a8a' },
    bold: { bg: '#0f0a1a', badge: '#7c3aed', button: '#8b5cf6', border: '#4c1d95' },
    transform: { bg: '#0a1a0f', badge: '#16a34a', button: '#22c55e', border: '#14532d' },
    urgency: { bg: '#1a0f0a', badge: '#ea580c', button: '#f97316', border: '#7c2d12' },
};

export function parseGeminiResponse(rawText: string): GenerationResult {
    const cleaned = rawText
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

    let parsed: GenerationResult;

    try {
        parsed = JSON.parse(cleaned) as GenerationResult;
    } catch {
        throw new Error('الـ AI مارجعش JSON صح — حاول تاني');
    }

    if (!parsed.ads || parsed.ads.length === 0) {
        throw new Error('الـ AI مارجعش إعلانات');
    }

    // أضف id لكل كارت
    parsed.ads = parsed.ads.map((ad: AdCard, index: number) => ({
        ...ad,
        id: `ad-${index + 1}`,
        imageUrl: ad.imageUrl ?? null,
        isLoading: false,
    }));

    return parsed;
}

export function isValidResult(result: GenerationResult): boolean {
    return (
        result.ads.length === 5 &&
        result.ads.every((ad: AdCard) =>
            ad.headline &&
            ad.primaryText &&
            ad.hooks.length === 3 &&
            ad.adPost &&
            ad.ctaButton &&
            ad.style
        )
    );
}

export function getHookScoreLabel(score: number): string {
    if (score >= 75) return '🔥 قوي جداً';
    if (score >= 60) return '✅ كويس';
    if (score >= 45) return '⚠️ محتاج تحسين';
    return '❌ ضعيف';
}

// تحقق إن الـ primaryText مختلف في كل كارت
export function hasDuplicateTexts(ads: AdCard[]): boolean {
    const texts = ads.map(ad => ad.primaryText.slice(0, 30));
    return new Set(texts).size !== texts.length;
}
