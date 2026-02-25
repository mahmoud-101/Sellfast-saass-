/**
 * TestingSuggestionBuilder.ts
 * Produces a structured testing suggestion for each angle variant.
 */

import type {
    PerformanceAngle,
    ProductPerformanceProfile,
    TestingSuggestion,
} from '../types';

export function buildTestingSuggestion(
    angle: PerformanceAngle,
    profile: ProductPerformanceProfile
): TestingSuggestion {
    const market = profile.market === 'egypt' ? 'المصري' : profile.market === 'gulf' ? 'الخليجي' : 'العربي';

    const map: Record<string, TestingSuggestion> = {
        pain: {
            suggestedObjective: 'Conversion',
            suggestedAudience: `Broad + Lookalike من عملاء سابقين في السوق ${market}`,
            budgetSplitSuggestion: '60% Conversion — 40% Retargeting',
            testingNote: 'ابدأ بـ Cold Audience لاختبار قوة الرسالة. إذا تجاوز الـ CTR نسبة 2%، ضاعف الميزانية.',
        },
        comparison: {
            suggestedObjective: 'Conversion',
            suggestedAudience: `مهتمون بمنتجات منافسة + Retargeting زوار الموقع في السوق ${market}`,
            budgetSplitSuggestion: '70% Retargeting — 30% Cold Interest',
            testingNote: 'هذا الأسلوب يعمل أفضل مع Warm Audience. تأكد من تغطية المنافسين الرئيسيين.',
        },
        bold_claim: {
            suggestedObjective: 'Engagement',
            suggestedAudience: `Broad، 25–45، السوق ${market}، بدون تضييق مفرط`,
            budgetSplitSuggestion: '80% Video Views/Reach — 20% Conversion',
            testingNote: 'اختبر 3 نسخ من الـ Hook مع نفس الـ Body Copy لمعرفة أيها يُولّد أعلى CTR.',
        },
        transformation: {
            suggestedObjective: 'Video Views',
            suggestedAudience: `مهتمون بالتطوير الشخصي أو الصحة أو الحياة الأفضل في السوق ${market}`,
            budgetSplitSuggestion: '50% Video Views — 50% Conversion من المشاهدين',
            testingNote: 'ابدأ بـ Video Views لبناء Warm Audience، ثم أعد استهدافهم بإعلان Conversion مباشر.',
        },
        urgency: {
            suggestedObjective: 'Conversion',
            suggestedAudience: `عربة مهجورة + زوار الصفحة + Warm Retargeting في السوق ${market}`,
            budgetSplitSuggestion: '90% Retargeting — 10% Cold للاختبار فقط',
            testingNote: 'هذا الأسلوب يعمل فقط مع من يعرفون منتجك بالفعل. استخدمه كـ Final Push قبل انتهاء العرض.',
        },
    };

    return map[angle.type] ?? {
        suggestedObjective: 'Conversion',
        suggestedAudience: `السوق ${market}، 25–45 سنة`,
        budgetSplitSuggestion: '50% Conversion — 50% Retargeting',
        testingNote: 'اختبر النسخة مع جمهور متنوع ثم حسّن بناءً على النتائج.',
    };
}
