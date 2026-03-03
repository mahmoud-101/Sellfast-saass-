/**
 * CombinationEngine.ts
 * Implements weighted combinations and compatibility rules for ad elements.
 * Part of the "Diamond Ad Factory" core engine.
 */

import type { TaggedElement, ElementTag } from '../types';

/**
 * Compatibility Matrix defining the relationship between different psychological triggers.
 * Scores represent the likelihood of high conversion when paired.
 */
export const COMPATIBILITY: Record<ElementTag, Partial<Record<ElementTag, number>>> = {
    'emotional': { 'logical': 0.9, 'emotional': 0.3, 'urgent': 0.8 },
    'logical': { 'emotional': 0.9, 'logical': 0.5, 'benefit': 0.8 },
    'urgent': { 'social_proof': 0.95, 'benefit': 0.85 },
    'social_proof': { 'urgent': 0.95, 'feature': 0.7 },
    'benefit': { 'logical': 0.85, 'urgent': 0.9 },
    'feature': { 'social_proof': 0.75, 'benefit': 0.6 }
};

/**
 * Calculates a compatibility score between two tagged ad elements (e.g., Headline and Description).
 */
export function getCompatibilityScore(primary: TaggedElement, secondary: TaggedElement): number {
    let totalScore = 0;
    let comparisons = 0;

    for (const pTag of primary.tags) {
        for (const sTag of secondary.tags) {
            const score = COMPATIBILITY[pTag]?.[sTag] ?? 0.5; // Default neutral score
            totalScore += score;
            comparisons++;
        }
    }

    const avgScore = comparisons > 0 ? totalScore / comparisons : 0.5;

    // Factor in the individual weights of the elements (1-10)
    const weightFactor = (primary.weight + secondary.weight) / 20;

    return avgScore * (0.7 + (weightFactor * 0.3));
}

/**
 * Curates the best combinations from a pool of headlines and descriptions
 * based on compatibility scores and relevance.
 */
export function curateBestCombinations<T extends TaggedElement, U extends TaggedElement>(
    headlines: T[],
    descriptions: U[],
    limit: number = 20
): { headline: T; description: U; score: number }[] {
    const results: { headline: T; description: U; score: number }[] = [];

    for (const headline of headlines) {
        for (const description of descriptions) {
            const score = getCompatibilityScore(headline, description);
            results.push({ headline, description, score });
        }
    }

    // Sort by score descending and return the top results
    return results
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}
