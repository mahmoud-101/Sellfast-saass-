/**
 * LayoutGenerator.ts
 * Converts a PerformanceAdVariant into a LayoutData object
 * ready to be passed to presentation templates.
 */

import type {
    LayoutData,
    LayoutType,
    PerformanceAdVariant,
    PerformanceAngleType,
} from '../types';

const ANGLE_TO_LAYOUT: Record<PerformanceAngleType, LayoutType> = {
    pain: 'problem_solution',
    comparison: 'comparison',
    bold_claim: 'offer',
    transformation: 'benefits',
    urgency: 'offer',
};

const ACCENT_COLORS: Record<PerformanceAngleType, string> = {
    pain: '#EF4444',
    comparison: '#3B82F6',
    bold_claim: '#F59E0B',
    transformation: '#10B981',
    urgency: '#F97316',
};

function extractHighlightWord(headline: string): string | undefined {
    const words = headline.split(' ');
    // pick the longest meaningful word as highlight
    return words.sort((a, b) => b.length - a.length)[0];
}

function buildComparisonData(variant: PerformanceAdVariant): { leftLabel: string; rightLabel: string } | undefined {
    if (variant.angle.type !== 'comparison') return undefined;
    return {
        leftLabel: '❌ الطريقة القديمة',
        rightLabel: `✅ ${variant.angle.psychologicalTrigger.split(' ').slice(0, 4).join(' ')}...`,
    };
}

function buildIconSet(layoutType: LayoutType): string[] | undefined {
    const icons: Record<LayoutType, string[]> = {
        benefits: ['✅', '⚡', '🎯', '💎'],
        problem_solution: ['😩', '➡️', '😊', '🏆'],
        comparison: ['❌', '✅'],
        offer: ['🔥', '⏰', '💰', '✨'],
    };
    return icons[layoutType];
}

export function runLayoutGenerator(variant: PerformanceAdVariant): LayoutData {
    const layoutType = ANGLE_TO_LAYOUT[variant.angle.type];
    const headline = variant.primaryHook;
    const accentColor = ACCENT_COLORS[variant.angle.type];

    return {
        layoutType,
        headline,
        bullets: Array.from(variant.bullets),
        cta: variant.cta.primary,
        badge:
            variant.confidenceScore >= 85
                ? '🔥 الأقوى أداءً'
                : variant.angle.type === 'urgency'
                    ? '⏰ عرض محدود'
                    : undefined,
        comparison: buildComparisonData(variant),
        iconSet: buildIconSet(layoutType),
        highlightWord: extractHighlightWord(headline),
        accentColor,
    };
}
