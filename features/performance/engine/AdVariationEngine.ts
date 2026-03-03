/**
 * AdVariationEngine.ts
 * For each PerformanceAngle, generates a full PerformanceAdVariant,
 * including hooks, body copy, CTA, bullets, score, and testing suggestion.
 */

import type {
    ProductPerformanceProfile,
    PerformanceAngle,
    PerformanceAdVariant,
    PerformanceAdSet,
} from '../types';
import { runHookScoringEngine } from '../optimization/HookScoringEngine';
import { runCTAOptimizer } from '../optimization/CTAOptimizer';
import { buildTestingSuggestion } from './TestingSuggestionBuilder';

// ─── Internal Hook Template Builder ──────────────────────────────────────────
function buildHooksForAngle(
    angle: PerformanceAngle,
    profile: ProductPerformanceProfile
): { primary: string; variations: [string, string, string] } {
    const { productName, mainBenefit, mainPain, priceTier } = profile;

    const hookMap: Record<string, { primary: string; variations: [string, string, string] }> = {
        pain: {
            primary: `هل لا تزال تعاني من ${mainPain}؟ — ${productName} غيّر المعادلة.`,
            variations: [
                `تعبت من ${mainPain}؟ إليك الحل الحقيقي.`,
                `${mainPain} — يكفي كده. ${productName} هنا.`,
                `99% من الناس بيعانوا من ${mainPain}... وهم لا يعرفون الحل.`,
            ],
        },
        comparison: {
            primary: `${productName} مقابل كل البدائل — الفرق واضح.`,
            variations: [
                `ليه تدفع أكتر وتاخد أقل؟ ${productName} يعطيك الأفضل.`,
                `قارن بنفسك: ${productName} أو الطريقة القديمة.`,
                `البديل التقليدي لـ${mainPain}... و${productName}.`,
            ],
        },
        bold_claim: {
            primary: `${mainBenefit} — مضمون 100%. أو نردّ لك فلوسك.`,
            variations: [
                `هذا المنتج غيّر حياة آلاف العملاء. والتالي أنت.`,
                `${productName}: النتيجة ليست وعداً — هي ضمان.`,
                `الحل الوحيد الذي يضمن لك ${mainBenefit} من أول استخدام.`,
            ],
        },
        transformation: {
            primary: `من ${mainPain} إلى ${mainBenefit} — هذا ما يفعله ${productName}.`,
            variations: [
                `تخيل حياتك بعد أسبوع واحد مع ${productName}.`,
                `قبل ${productName}: ${mainPain}. بعده: ${mainBenefit}.`,
                `العملاء الذين استخدموا ${productName} لم يعودوا إلى الوضع القديم.`,
            ],
        },
        urgency: {
            primary: `الكمية محدودة جداً — اطلب ${productName} الآن قبل انتهاء العرض.`,
            variations: [
                `العرض ينتهي قريباً — ${mainBenefit} لك الآن.`,
                priceTier === 'budget'
                    ? `سعر استثنائي على ${productName} — لفترة محدودة فقط.`
                    : `لا تفوّت فرصة الحصول على ${productName} بهذا الثمن.`,
                `آخر ${priceTier === 'budget' ? '20' : '5'} قطعة متاحة — اطلب الآن.`,
            ],
        },
    };

    return hookMap[angle.type] ?? {
        primary: `اكتشف ${productName} الآن.`,
        variations: [
            `${productName} — الخيار الأذكى.`,
            `جرب ${productName} اليوم.`,
            `${mainBenefit} في متناول يدك.`,
        ],
    };
}

// ─── Body Copy Builder ────────────────────────────────────────────────────────
function buildBodyCopy(
    angle: PerformanceAngle,
    profile: ProductPerformanceProfile
): { short: string; expanded: string } {
    const { productName, mainBenefit, mainPain, uniqueDifferentiator } = profile;

    const short = `${productName} هو الحل المُثبَت لـ${mainPain}. ${mainBenefit} في أسرع وقت وبأعلى جودة.`;

    const expanded = [
        `هل تعلم أن معظم الناس يعانون من ${mainPain} لأنهم لم يجدوا الحل الصحيح بعد؟`,
        `${productName} صُمِّم خصيصاً لمن يريد ${mainBenefit} دون تعقيد أو وقت ضائع.`,
        `ما يميز ${productName}: ${uniqueDifferentiator}.`,
        angle.type === 'urgency' ? `ولكن الكميات محدودة — اطلب الآن ولا تنتظر.` : `آلاف العملاء اختاروا ${productName} لأنه ببساطة يُنجز.`,
    ].join(' ');

    return { short, expanded };
}

// ─── Bullets Builder ──────────────────────────────────────────────────────────
function buildBullets(profile: ProductPerformanceProfile): [string, string, string] {
    return [
        `✅ ${profile.mainBenefit} مضمون`,
        `✅ ${profile.uniqueDifferentiator}`,
        `✅ مناسب لـ${profile.market === 'egypt' ? 'السوق المصري' : profile.market === 'gulf' ? 'السوق الخليجي' : 'السوق العربي'} 100%`,
    ];
}

// ─── Confidence Scorer ────────────────────────────────────────────────────────
function calcConfidence(
    angle: PerformanceAngle,
    profile: ProductPerformanceProfile,
    hookScore: number
): number {
    let base = 60;
    if (profile.awarenessLevel === 'hot') base += 15;
    else if (profile.awarenessLevel === 'warm') base += 8;

    if (profile.competitionLevel === 'low') base += 10;
    else if (profile.competitionLevel === 'high') base -= 5;

    if (angle.type === 'pain' || angle.type === 'urgency') base += 8;

    // Factor in hook quality
    base = Math.floor(base + hookScore * 0.15);
    return Math.min(Math.max(base, 30), 99);
}

// ─── Audience Builder ─────────────────────────────────────────────────────────
function buildAudience(
    angle: PerformanceAngle,
    profile: ProductPerformanceProfile
): string {
    const baseAudience = profile.market === 'egypt'
        ? 'جمهور مصري، 25–45 سنة'
        : 'جمهور خليجي، 25–50 سنة';

    const angleExtra: Record<string, string> = {
        pain: `${baseAudience}، مهتمون بـ${profile.mainPain}، Lookalike من عملاء سابقين`,
        comparison: `${baseAudience}، مهتمون بالمنتجات المشابهة، يبحثون عن بدائل`,
        bold_claim: `${baseAudience}، Broad عالي الجودة، بدون تضييق إضافي`,
        transformation: `${baseAudience}، مهتمون بالتطوير الشخصي أو الحياة الأفضل`,
        urgency: `${baseAudience}، زوار الموقع السابقون، عربة مهجورة، Warm Retargeting`,
    };

    return angleExtra[angle.type] ?? baseAudience;
}

// ─── Main Variation Engine ─────────────────────────────────────────────────────
export function runAdVariationEngine(
    profile: ProductPerformanceProfile,
    angles: PerformanceAngle[]
): PerformanceAdSet {
    const variants: PerformanceAdVariant[] = angles.map((angle): PerformanceAdVariant => {
        const { primary, variations } = buildHooksForAngle(angle, profile);
        const { short, expanded } = buildBodyCopy(angle, profile);
        const bullets = buildBullets(profile);
        const hookResult = runHookScoringEngine(primary, profile.market);
        const cta = runCTAOptimizer(profile.market, profile.awarenessLevel, profile.priceTier, angle.type);
        const confidence = calcConfidence(angle, profile, hookResult.score.total);
        const testingSuggestion = buildTestingSuggestion(angle, profile);

        return {
            angle,
            primaryHook: hookResult.finalHook,
            hookVariations: variations,
            hookScore: hookResult.score,
            bodyShort: short,
            bodyExpanded: expanded,
            cta,
            bullets,
            emotionalTrigger: angle.psychologicalTrigger,
            recommendedAudience: buildAudience(angle, profile),
            confidenceScore: confidence,
            testingSuggestion,
        };
    });

    return {
        profile,
        variants,
        generatedAt: new Date().toISOString(),
    };
}
