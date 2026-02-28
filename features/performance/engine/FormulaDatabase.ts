/**
 * FormulaDatabase.ts
 * proven marketing frameworks for headlines and descriptions.
 * Part of the "Diamond Ad Factory" core engine.
 */

export interface CopyFormula {
    id: string;
    name: string;
    template: string;
    variables: string[];
    bestFor: ('awareness' | 'consideration' | 'conversion')[];
    avgCTR: number;
    example_ar_eg: string;
}

export const HEADLINE_FORMULAS: CopyFormula[] = [
    {
        id: 'number_benefit',
        name: 'رقم + فائدة',
        template: '{{number}} {{benefit}} في {{timeframe}}',
        variables: ['number', 'benefit', 'timeframe'],
        bestFor: ['conversion', 'consideration'],
        avgCTR: 3.2,
        example_ar_eg: '3 أسباب تخليك توفر 50% النهارده'
    },
    {
        id: 'pas',
        name: 'مشكلة-تأزيم-حل (PAS)',
        template: 'تعبت من {{problem}}؟ {{solution}} هو الحل.',
        variables: ['problem', 'solution'],
        bestFor: ['awareness', 'consideration'],
        avgCTR: 2.8,
        example_ar_eg: 'تعبت من الشحن الغالي؟ توصيل مجاني لحد باب بيتك'
    },
    {
        id: 'how_to',
        name: 'إزاي (How To)',
        template: 'إزاي {{result}} بدون {{obstacle}}',
        variables: ['result', 'obstacle'],
        bestFor: ['awareness', 'consideration'],
        avgCTR: 2.5,
        example_ar_eg: 'إزاي تضاعف مبيعاتك بدون ما تصرف ميزانية ضخمة'
    },
    {
        id: 'social_proof',
        name: 'دليل اجتماعي',
        template: '+{{count}} {{audience}} {{action}} {{result}}',
        variables: ['count', 'audience', 'action', 'result'],
        bestFor: ['consideration', 'conversion'],
        avgCTR: 3.5,
        example_ar_eg: '+10,000 عميلة جربوا الزيت وشعرهم بقى أنعم'
    },
    {
        id: 'curiosity_gap',
        name: 'فجوة الفضول',
        template: 'السر اللي {{group}} مش عايزينك تعرفه عن {{topic}}',
        variables: ['group', 'topic'],
        bestFor: ['awareness'],
        avgCTR: 3.8,
        example_ar_eg: 'السر اللي شركات العقارات مش عايزينك تعرفه عن الاستثمار'
    },
    {
        id: 'before_after',
        name: 'قبل وبعد',
        template: 'من {{state_before}} لـ {{state_after}} مع {{product}}',
        variables: ['state_before', 'state_after', 'product'],
        bestFor: ['consideration'],
        avgCTR: 3.1,
        example_ar_eg: 'من كركبة المطبخ لراحة بال تامة مع منظماتنا الجديدة'
    },
    {
        id: 'fomo',
        name: 'الخوف من الضياع (FOMO)',
        template: 'آخر {{timeframe}} لـ {{offer}} على {{product}}',
        variables: ['timeframe', 'offer', 'product'],
        bestFor: ['conversion'],
        avgCTR: 4.2,
        example_ar_eg: 'آخر 4 ساعات لخصم الـ 50% على كل الكوليكشن'
    },
    {
        id: 'direct_command',
        name: 'أمر مباشر',
        template: '{{verb}} {{benefit}} دلوقتي مع {{product}}',
        variables: ['verb', 'benefit', 'product'],
        bestFor: ['conversion'],
        avgCTR: 2.9,
        example_ar_eg: 'وفّر فلوسك دلوقتي مع أحسن باقة اشتراك'
    }
];

export const DESCRIPTION_FORMULAS: CopyFormula[] = [
    {
        id: 'feature_benefit_emotion',
        name: 'ميزة -> فائدة -> شعور',
        template: 'مع {{feature}}، هتقدر {{benefit}} وهتحس بـ {{emotion}}.',
        variables: ['feature', 'benefit', 'emotion'],
        bestFor: ['consideration'],
        avgCTR: 1.9,
        example_ar_eg: 'مع خاصية الشحن السريع، هتقدر تستلم طلبك في 24 ساعة وهتحس براحة بال حقيقية.'
    },
    {
        id: 'objection_handler',
        name: 'تفنيد الاعتراضات',
        template: 'من غير {{objection}}، {{benefit}} مع {{product}}.',
        variables: ['objection', 'benefit', 'product'],
        bestFor: ['consideration', 'conversion'],
        avgCTR: 2.4,
        example_ar_eg: 'من غير اشتراكات شهرية أو مصاريف مخفية، استمتع بكل الميزات مجاناً.'
    },
    {
        id: 'testimonial_style',
        name: 'أسلوب الشهادات',
        template: 'زي ما {{name}} قال: "{{quote}}"',
        variables: ['name', 'quote'],
        bestFor: ['consideration'],
        avgCTR: 2.6,
        example_ar_eg: 'زي ما مروة قالت: "المنتج ده غير روتين بشرتي تماماً في أسبوع واحد"'
    },
    {
        id: 'comparison',
        name: 'مقارنة',
        template: 'بدل {{old_way}}، جرب {{product}} وشوف الفرق.',
        variables: ['old_way', 'product'],
        bestFor: ['awareness', 'consideration'],
        avgCTR: 2.1,
        example_ar_eg: 'بدل ما تضيع وقتك في المذاكرة التقليدية، جرب تطبيقنا وشوف الفرق في استيعابك.'
    },
    {
        id: 'scarcity',
        name: 'الندرة',
        template: 'متبقي {{number}} {{unit}} بس بسعر {{offer}}.',
        variables: ['number', 'unit', 'offer'],
        bestFor: ['conversion'],
        avgCTR: 3.9,
        example_ar_eg: 'متبقي 5 قطع بس بسعر التصفية.'
    }
];

/**
 * Injects variables into a template string.
 */
export function injectFormula(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
}
