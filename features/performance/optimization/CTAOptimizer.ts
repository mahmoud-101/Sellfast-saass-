/**
 * CTAOptimizer.ts
 * Selects the optimal CTA based on market, awareness, price tier, and angle type.
 */

import type {
    Market,
    AwarenessLevel,
    PriceTier,
    PerformanceAngleType,
    CTAResult,
} from '../types';

const CTA_MATRIX: Record<Market, Record<AwarenessLevel, Record<PriceTier, { primary: string; variants: [string, string] }>>> = {
    egypt: {
        cold: {
            budget: {
                primary: 'اعرف أكتر دلوقتي',
                variants: ['شوف التفاصيل', 'اكتشف السعر'],
            },
            mid: {
                primary: 'اعرف أكتر دلوقتي',
                variants: ['شوف المنتج', 'اكتشف التفاصيل'],
            },
            premium: {
                primary: 'اكتشف الفرق بنفسك',
                variants: ['تعرف على المنتج', 'شاهد النتائج'],
            },
        },
        warm: {
            budget: {
                primary: 'اطلب دلوقتي بأحسن سعر',
                variants: ['الحق العرض', 'احجز نسختك'],
            },
            mid: {
                primary: 'اطلب دلوقتي',
                variants: ['اضغط للطلب', 'جرب وارجع إن مش عاجبك'],
            },
            premium: {
                primary: 'احصل عليه دلوقتي',
                variants: ['اطلب الآن', 'احجز مكانك'],
            },
        },
        hot: {
            budget: {
                primary: 'الحق العرض قبل ما يخلص 🔥',
                variants: ['اطلب قبل ما يخلص', 'الكمية محدودة — اطلب الآن'],
            },
            mid: {
                primary: 'الحق العرض — كمية محدودة!',
                variants: ['اطلب الآن قبل ما ينتهي', 'الموعد النهائي قريب'],
            },
            premium: {
                primary: 'احجز نسختك قبل نفاد الكمية',
                variants: ['أمّن نسختك الآن', 'لا تضيع الفرصة'],
            },
        },
    },
    gulf: {
        cold: {
            budget: {
                primary: 'اكتشف المزيد',
                variants: ['شاهد التفاصيل', 'تعرف على المنتج'],
            },
            mid: {
                primary: 'تعرف على المنتج',
                variants: ['اكتشف الآن', 'شاهد التفاصيل'],
            },
            premium: {
                primary: 'اكتشف التجربة الفارقة',
                variants: ['تعرف على المزايا', 'شاهد النتائج'],
            },
        },
        warm: {
            budget: {
                primary: 'اطلب اليوم',
                variants: ['استفد من العرض', 'اطلب الآن'],
            },
            mid: {
                primary: 'اطلب الآن',
                variants: ['احصل عليه اليوم', 'استفد من الفرصة'],
            },
            premium: {
                primary: 'احصل على تجربتك المميزة',
                variants: ['اطلب الآن', 'احجز نسختك'],
            },
        },
        hot: {
            budget: {
                primary: 'استفد من العرض قبل انتهائه',
                variants: ['اطلب اليوم فقط', 'العرض محدود'],
            },
            mid: {
                primary: 'اطلب اليوم — عرض حصري',
                variants: ['الكمية محدودة', 'احجز نسختك الآن'],
            },
            premium: {
                primary: 'امتلك تجربتك قبل نفاد الكمية',
                variants: ['احجز الآن', 'لا تفوّت الفرصة'],
            },
        },
    },
    mena: {
        cold: {
            budget: { primary: 'اكتشف المزيد', variants: ['تعرف على المنتج', 'شاهد التفاصيل'] },
            mid: { primary: 'اعرف أكتر', variants: ['اكتشف الآن', 'تعرف على الحل'] },
            premium: { primary: 'اكتشف الفرق', variants: ['شاهد النتائج', 'تعرف على المميزات'] },
        },
        warm: {
            budget: { primary: 'اطلب الآن بأفضل سعر', variants: ['احجز نسختك', 'الفرصة لن تتكرر'] },
            mid: { primary: 'اطلب الآن', variants: ['احصل عليه اليوم', 'لا تؤجل'] },
            premium: { primary: 'احصل على النسخة المميزة الآن', variants: ['اطلب الآن', 'احجز مكانك'] },
        },
        hot: {
            budget: { primary: 'الآن أو لا — كمية محدودة!', variants: ['اطلب قبل أن تنتهي', 'العرض ينتهي قريباً'] },
            mid: { primary: 'اطلب الآن — لا تفوّت الفرصة', variants: ['العرض محدود', 'احجز نسختك'] },
            premium: { primary: 'احجز نسختك الحصرية الآن', variants: ['لا تفوّت الفرصة', 'الكمية شارفت على النفاد'] },
        },
    },
};

function getUrgencyLevel(
    angleType: PerformanceAngleType,
    awareness: AwarenessLevel
): CTAResult['urgencyLevel'] {
    if (angleType === 'urgency') return 'high';
    if (awareness === 'hot') return 'high';
    if (awareness === 'warm') return 'medium';
    return 'low';
}

export function runCTAOptimizer(
    market: Market,
    awareness: AwarenessLevel,
    priceTier: PriceTier,
    angleType: PerformanceAngleType
): CTAResult {
    const { primary, variants } = CTA_MATRIX[market][awareness][priceTier];
    const urgencyLevel = getUrgencyLevel(angleType, awareness);

    // For urgency angle, override with stronger CTA if needed
    const finalPrimary =
        angleType === 'urgency' && awareness !== 'hot'
            ? market === 'egypt'
                ? 'الحق العرض قبل ما يخلص 🔥'
                : 'استفد من العرض قبل انتهائه'
            : primary;

    return {
        primary: finalPrimary,
        variants,
        urgencyLevel,
    };
}
