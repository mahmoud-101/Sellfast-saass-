/**
 * PlatformAdaptationEngine.ts
 * Adapts ad creatives for specific platform requirements (dimensions, safe zones, text limits).
 * Part of the "Diamond Ad Factory" core engine.
 */

import type { Platform, PlatformSpec } from '../types';

/**
 * Global specifications for major advertising platforms.
 * Based on latest 2024/2025 performance standards.
 */
export const PLATFORM_SPECS: Record<Platform, PlatformSpec> = {
    facebook_feed: {
        id: 'facebook_feed',
        name: 'Facebook Feed',
        dimensions: { width: 1200, height: 1200 },
        maxHeadlineLength: 40,
        maxDescriptionLength: 90,
        safeZone: { top: 0, bottom: 0, left: 40, right: 40 },
        fontScale: 1,
        ctaStyle: 'button',
        textPosition: 'bottom',
    },
    instagram_story: {
        id: 'instagram_story',
        name: 'Instagram Story',
        dimensions: { width: 1080, height: 1920 },
        maxHeadlineLength: 30,
        maxDescriptionLength: 60,
        safeZone: { top: 200, bottom: 250, left: 40, right: 40 },
        fontScale: 1.3,
        ctaStyle: 'swipe_up',
        textPosition: 'center',
    },
    instagram_feed: {
        id: 'instagram_feed',
        name: 'Instagram Feed',
        dimensions: { width: 1080, height: 1080 },
        maxHeadlineLength: 40,
        maxDescriptionLength: 90,
        safeZone: { top: 0, bottom: 0, left: 40, right: 40 },
        fontScale: 1,
        ctaStyle: 'button',
        textPosition: 'bottom',
    },
    tiktok: {
        id: 'tiktok',
        name: 'TikTok',
        dimensions: { width: 1080, height: 1920 },
        maxHeadlineLength: 35,
        maxDescriptionLength: 70,
        safeZone: { top: 150, bottom: 350, left: 50, right: 150 },
        fontScale: 1.1,
        ctaStyle: 'button', // TikTok has a floating CTA overlay
        textPosition: 'center',
    },
    snapchat: {
        id: 'snapchat',
        name: 'Snapchat',
        dimensions: { width: 1080, height: 1920 },
        maxHeadlineLength: 30,
        maxDescriptionLength: 50,
        safeZone: { top: 150, bottom: 250, left: 40, right: 40 },
        fontScale: 1.2,
        ctaStyle: 'swipe_up',
        textPosition: 'bottom',
    },
    linkedin: {
        id: 'linkedin',
        name: 'LinkedIn',
        dimensions: { width: 1200, height: 627 },
        maxHeadlineLength: 50,
        maxDescriptionLength: 125,
        safeZone: { top: 0, bottom: 0, left: 40, right: 40 },
        fontScale: 0.9,
        ctaStyle: 'button',
        textPosition: 'bottom',
    },
    google_display: {
        id: 'google_display',
        name: 'Google Display',
        dimensions: { width: 300, height: 250 },
        maxHeadlineLength: 30,
        maxDescriptionLength: 90,
        safeZone: { top: 0, bottom: 0, left: 20, right: 20 },
        fontScale: 0.8,
        ctaStyle: 'text_link',
        textPosition: 'top',
    },
    twitter: {
        id: 'twitter',
        name: 'Twitter (X) Feed',
        dimensions: { width: 1200, height: 628 },
        maxHeadlineLength: 45,
        maxDescriptionLength: 90,
        safeZone: { top: 0, bottom: 0, left: 40, right: 40 },
        fontScale: 1,
        ctaStyle: 'button',
        textPosition: 'bottom',
    }
};

/**
 * Smart Truncation for Arabic text that doesn't split words.
 */
export function truncateSmart(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;

    // Take a slice up to the max length
    const truncated = text.slice(0, maxLength);

    // Find the last space to avoid cutting a word in half
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace < maxLength * 0.7) {
        // If the last word is very long, just cut it at max length with elipsis
        return text.slice(0, maxLength - 3) + '...';
    }

    return truncated.slice(0, lastSpace).trim() + '...';
}

/**
 * Adapts an ad variant with specific platform constraints.
 */
export function adaptForPlatform(
    headline: string,
    description: string,
    platform: Platform
): { headline: string; description: string; spec: PlatformSpec } {
    const spec = PLATFORM_SPECS[platform] || PLATFORM_SPECS.facebook_feed;

    return {
        headline: truncateSmart(headline, spec.maxHeadlineLength),
        description: truncateSmart(description, spec.maxDescriptionLength),
        spec
    };
}

/**
 * Calculates current text layout based on safe zones.
 * Returns percentages for CSS absolute positioning.
 */
export function calculateSafeLayout(platform: Platform) {
    const spec = PLATFORM_SPECS[platform] || PLATFORM_SPECS.facebook_feed;
    const { width, height } = spec.dimensions;
    const { top, bottom, left, right } = spec.safeZone;

    return {
        topOffset: (top / height) * 100,
        bottomOffset: (bottom / height) * 100,
        leftOffset: (left / width) * 100,
        rightOffset: (right / width) * 100,
        usableHeightPercent: ((height - top - bottom) / height) * 100,
        usableWidthPercent: ((width - left - right) / width) * 100
    };
}
