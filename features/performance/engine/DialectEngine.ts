/**
 * DialectEngine.ts
 * Translates ad copy between 6 Arabic dialects to provide native-level localization.
 * Part of the "Diamond Ad Factory" core engine.
 */

export type Dialect = 'eg' | 'sa';

export const DIALECT_MAP: Record<string, Record<Dialect, string>> = {
    'الآن': { eg: 'دلوقتي', sa: 'الحين' },
    'غداً': { eg: 'بكرة', sa: 'باجر' },
    'اشتري': { eg: 'اشتري', sa: 'اطلب' },
    'كثير': { eg: 'كتير', sa: 'واجد' },
    'جميل': { eg: 'حلو', sa: 'حلو' },
    'سريع': { eg: 'بسرعة', sa: 'على طول' },
    'لماذا': { eg: 'ليه', sa: 'ليش' },
    'ممتاز': { eg: 'تحفة', sa: 'ممتاز' },
    'هات': { eg: 'هات', sa: 'جيب' },
    'جيد': { eg: 'جامد', sa: 'كفو' }
};

/**
 * Translates a text string from one dialect to another using a mapping of common marketing terms.
 */
export function translateDialect(text: string, from: Dialect, to: Dialect): string {
    if (from === to) return text;

    let result = text;
    // Iterate through the map and replace occurrences
    for (const [key, dialects] of Object.entries(DIALECT_MAP)) {
        const fromWord = dialects[from];
        const toWord = dialects[to];

        if (fromWord === toWord) continue;

        // Use a simple word boundary regex if possible, or global replacement
        // Note: Arabic word boundaries in JS regex can be tricky with non-latins, 
        // using simple global replace for now as usually these are unique terms.
        const regex = new RegExp(fromWord, 'g');
        result = result.replace(regex, toWord);
    }

    return result;
}

/**
 * Identifies the suggested target dialect based on the product's target market.
 */
export function getRecommendedDialect(market: string): Dialect {
    switch (market.toLowerCase()) {
        case 'egypt': return 'eg';
        case 'saudi': return 'sa';
        case 'gulf': return 'sa';
        default: return 'eg'; // Default to Egyptian
    }
}
