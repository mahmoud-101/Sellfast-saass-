/**
 * BrandKitSystem.ts
 * Manages brand-specific visual assets and styling rules.
 * Part of the "Diamond Ad Factory" core engine.
 */

import type { Dialect } from '../types';

export interface BrandKit {
    id: string;
    name: string;

    // ─── Visual Identity ───
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    gradients: {
        primary: { start: string; end: string; angle: number };
        secondary: { start: string; end: string; angle: number };
    };

    // ─── Typography ───
    headlineFont: string;
    bodyFont: string;

    // ─── Logo Assets ───
    logoLight: string;  // For dark backgrounds
    logoDark: string;   // For light backgrounds
    logoIcon: string;   // Icon only

    // ─── Tone & Voice ───
    tone: 'formal' | 'casual' | 'playful' | 'luxury' | 'friendly';
    dialect: Dialect;

    // ─── Strategic Rules ───
    rules: {
        neverUseWords: string[];      // Forbidden keywords
        alwaysInclude: string[];      // Mandatory taglines/keywords
        maxDiscountPercent: number;   // Business constraint
        competitorNames: string[];    // Direct avoidance
    };
}

/**
 * Default Brand Kit (Ecom Standard)
 */
export const DEFAULT_BRAND_KIT: BrandKit = {
    id: 'default',
    name: 'Ebdaa Standard',
    primaryColor: '#6366F1',
    secondaryColor: '#10B981',
    accentColor: '#F59E0B',
    gradients: {
        primary: { start: '#6366F1', end: '#4F46E5', angle: 135 },
        secondary: { start: '#10B981', end: '#059669', angle: 135 }
    },
    headlineFont: 'Inter, sans-serif',
    bodyFont: 'Inter, sans-serif',
    logoLight: '/logos/logo-white.png',
    logoDark: '/logos/logo-black.png',
    logoIcon: '/logos/icon.png',
    tone: 'friendly',
    dialect: 'eg',
    rules: {
        neverUseWords: ['رخيص', 'زفت', 'سيء'],
        alwaysInclude: ['ضمان 100%', 'توصيل سريع'],
        maxDiscountPercent: 70,
        competitorNames: []
    }
};

/**
 * Validates generated copy against Brand Kit rules.
 * Highlights forbidden words or missing mandatory elements.
 */
export function validateBrandSafety(text: string, kit: BrandKit): { safe: boolean; violations: string[] } {
    const violations: string[] = [];
    const normalizedText = text.toLowerCase();

    // Check for forbidden words
    kit.rules.neverUseWords.forEach(word => {
        if (normalizedText.includes(word.toLowerCase())) {
            violations.push(`Forbidden word used: "${word}"`);
        }
    });

    // Check for competitor names
    kit.rules.competitorNames.forEach(comp => {
        if (normalizedText.includes(comp.toLowerCase())) {
            violations.push(`Competitor mention found: "${comp}"`);
        }
    });

    return {
        safe: violations.length === 0,
        violations
    };
}

/**
 * Generates a CSS-ready gradient string from Brand Kit settings.
 */
export function getBrandGradient(kit: BrandKit, type: 'primary' | 'secondary' = 'primary'): string {
    const g = kit.gradients[type];
    return `linear-gradient(${g.angle}deg, ${g.start} 0%, ${g.end} 100%)`;
}
