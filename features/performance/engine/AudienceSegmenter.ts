/**
 * AudienceSegmenter.ts
 * Manages audience-specific ad styles and psychological targeting (DCO).
 * Part of the "Diamond Ad Factory" core engine.
 */

import type { AudienceSegment, BuyingMotivation } from '../types';

/**
 * Predefined segments based on core consumer psychological drivers.
 */
export const SEGMENTS: Record<BuyingMotivation, AudienceSegment> = {
    price: {
        id: 'price_sensitive',
        name: 'الباحث عن التوفير (Price Sensitive)',
        buyingMotivation: 'price',
        colorScheme: 'warm', // Orange/Red for urgency/sales
        urgencyLevel: 3,     // High urgency
        headlinePrefix: '🔥 عرض خاص: ',
    },
    quality: {
        id: 'quality_seeker',
        name: 'الباحث عن الجودة (Quality Seeker)',
        buyingMotivation: 'quality',
        colorScheme: 'premium', // Clean whites/blues/greens
        urgencyLevel: 1,      // Low urgency, high trust
        headlinePrefix: '✨ الحل الأصلي: ',
    },
    status: {
        id: 'status_buyer',
        name: 'باحث عن التميز (Status Buyer)',
        buyingMotivation: 'status',
        colorScheme: 'luxury', // Gold/Black/Deep purples
        urgencyLevel: 2,     // Medium (Exclusivity)
        headlinePrefix: '💎 للنخبة فقط: ',
    },
    convenience: {
        id: 'convenience',
        name: 'محبي الراحة (Convenience)',
        buyingMotivation: 'convenience',
        colorScheme: 'corporate', // Blue/Silver
        urgencyLevel: 2,
        headlinePrefix: '⚡ بضغطة واحدة: ',
    }
};

/**
 * Segment-Specific Style Configuration for the Renderer.
 */
export const SEGMENT_STYLES: Record<AudienceSegment['colorScheme'], {
    gradient: string;
    accent: string;
    textContrast: string;
}> = {
    warm: {
        gradient: 'linear-gradient(135deg, #F97316 0%, #EF4444 100%)',
        accent: '#FACC15',
        textContrast: '#000000'
    },
    premium: {
        gradient: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
        accent: '#FFFFFF',
        textContrast: '#101827'
    },
    luxury: {
        gradient: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
        accent: '#D4AF37', // Gold
        textContrast: '#FFFFFF'
    },
    corporate: {
        gradient: 'linear-gradient(135deg, #64748B 0%, #1E293B 100%)',
        accent: '#38BDF8',
        textContrast: '#FFFFFF'
    }
};

/**
 * Enriches ad copy based on the target audience segment.
 */
export function enrichForSegment(
    headline: string,
    description: string,
    segmentType: BuyingMotivation
): { headline: string; description: string; segment: AudienceSegment } {
    const segment = SEGMENTS[segmentType] || SEGMENTS.quality;

    let finalHeadline = headline;
    if (segment.headlinePrefix && !headline.startsWith(segment.headlinePrefix)) {
        finalHeadline = segment.headlinePrefix + headline;
    }

    // Add segment-specific urgency to description if not present
    let finalDescription = description;
    if (segment.urgencyLevel >= 2 && !description.includes('الآن')) {
        finalDescription += ' اطلب الآن ولا تتردد.';
    }

    return {
        headline: finalHeadline,
        description: finalDescription,
        segment
    };
}
