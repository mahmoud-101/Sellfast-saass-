/**
 * AngleEngine.ts
 * Generates 5 performance angles for a given product profile.
 * No AI API calls — pure deterministic/structured logic.
 */

import type {
    ProductPerformanceProfile,
    PerformanceAngle,
    PerformanceAngleType,
    LayoutType,
} from '../types';

interface AngleConfig {
    type: PerformanceAngleType;
    coreLabel: string;
    layoutMap: Record<string, LayoutType>;
    buildTrigger: (profile: ProductPerformanceProfile) => string;
    buildRationale: (profile: ProductPerformanceProfile) => string;
    buildMarketHint: (profile: ProductPerformanceProfile) => string;
}

const ANGLE_CONFIGS: AngleConfig[] = [
    {
        type: 'pain',
        coreLabel: '🔥 تأثير الألم',
        layoutMap: { default: 'problem_solution' },
        buildTrigger: (p) =>
            `إبراز معاناة الجمهور من ${p.mainPain} وتقديم ${p.productName} كحل فوري`,
        buildRationale: (p) =>
            `الجمهور في مرحلة ${p.awarenessLevel} لا يزال بحاجة إلى رؤية مشكلته من جديد قبل أن يقرر الشراء. ضرب الألم يُسرّع قرار الشراء بنسبة 3 أضعاف.`,
        buildMarketHint: (p) =>
            p.market === 'egypt'
                ? 'استخدم مصطلحات مصرية مباشرة تعكس متاعب يومية'
                : 'استخدم أسلوب عرض واضح يُظهر الفجوة بين الوضع الحالي والمطلوب',
    },
    {
        type: 'comparison',
        coreLabel: '⚡ الفارق المقاس',
        layoutMap: { default: 'comparison' },
        buildTrigger: (p) =>
            `مقارنة مباشرة بين ${p.productName} والبديل التقليدي لإظهار التفوق الواضح`,
        buildRationale: (p) =>
            `مع وجود منافسة ${p.competitionLevel}، المقارنة تُذكّر الجمهور بأن هناك فارقاً حقيقياً. الجمهور يثق بالأرقام والمقارنات أكثر من الوعود.`,
        buildMarketHint: (p) =>
            p.priceTier === 'budget'
                ? 'أبرز فارق السعر والقيمة بشكل صريح'
                : 'أبرز الجودة والنتائج لا السعر',
    },
    {
        type: 'bold_claim',
        coreLabel: '🎯 الادعاء الجريء',
        layoutMap: { default: 'offer' },
        buildTrigger: (p) =>
            `ادعاء واثق ومباشر حول ${p.mainBenefit} بأسلوب لا يقبل الجدل`,
        buildRationale: (p) =>
            `في أسواق ${p.market} المشبعة بالإعلانات، العنوان الجريء يُوقف الـ Scroll فوراً. الثقة تبيع قبل أي دليل.`,
        buildMarketHint: (_p) =>
            'اجعل الادعاء قابلاً للتصديق برقم أو نتيجة ملموسة',
    },
    {
        type: 'transformation',
        coreLabel: '✨ التحول والنتيجة',
        layoutMap: { default: 'benefits' },
        buildTrigger: (p) =>
            `تصوير حياة العميل بعد استخدام ${p.productName} — الانتقال من ${p.mainPain} إلى ${p.mainBenefit}`,
        buildRationale: (_p) =>
            `الدماغ يشتري النتائج لا المنتجات. إظهار التحول يُنشّط الرغبة العاطفية في الشراء أكثر من أي ميزة تقنية.`,
        buildMarketHint: (p) =>
            p.awarenessLevel === 'cold'
                ? 'اجعل الـ Before/After واضحاً جداً بدون مصطلحات تقنية'
                : 'اختصر وأظهر النتيجة مباشرة بدون مقدمات',
    },
    {
        type: 'urgency',
        coreLabel: '⏰ الزخم والإلحاح',
        layoutMap: { default: 'offer' },
        buildTrigger: (p) =>
            `خلق شعور بالندرة أو الإلحاح لدفع الجمهور لاتخاذ قرار الشراء الآن بدلاً من تأجيله`,
        buildRationale: (p) =>
            `الجمهور الـ ${p.awarenessLevel} يحتاج إلى دافع خارجي للتحرك. الإلحاح يقلل التردد ويجبر الـ Fence-sitters على القرار.`,
        buildMarketHint: (p) =>
            p.market === 'egypt'
                ? 'اربط الإلحاح بطرح حقيقي (كمية محدودة / عرض ينتهي)'
                : 'استخدم حافز القيمة المضافة (هدية مجانية / شحن مجاني لفترة محدودة)',
    },
];

export function runAngleEngine(
    profile: ProductPerformanceProfile
): PerformanceAngle[] {
    return ANGLE_CONFIGS.map((config): PerformanceAngle => ({
        type: config.type,
        coreLabel: config.coreLabel,
        psychologicalTrigger: config.buildTrigger(profile),
        internalRationale: config.buildRationale(profile),
        suggestedLayout: config.layoutMap.default,
        marketPositioningHint: config.buildMarketHint(profile),
    }));
}
