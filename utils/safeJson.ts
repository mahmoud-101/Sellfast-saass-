/**
 * 🔧 SELF-HEALING JSON PARSER
 * Single source of truth for ALL JSON parsing across the app.
 * Fixes truncated AI responses: unterminated strings, unclosed brackets, trailing commas.
 * NEVER throws — always returns a usable result (fallback = empty object or array).
 */
export function parseRobustJSON(text: string, fallback: any = {}): any {
    if (!text || text.trim().length === 0) return fallback;

    // Step 1: Remove markdown code blocks
    let clean = text.trim();
    clean = clean.replace(/```json\s*/gi, '');
    clean = clean.replace(/```\s*/g, '');
    clean = clean.trim();

    // Step 2: Try direct parse first (fast path)
    try {
        return JSON.parse(clean);
    } catch { /* continue to healing */ }

    // Step 3: Extract JSON block from surrounding text
    const jsonMatch = clean.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
        clean = jsonMatch[0];
        try {
            return JSON.parse(clean);
        } catch { /* continue to healing */ }
    }

    // Step 4: SELF-HEALING — Fix common AI truncation issues
    let healed = clean;

    // 4a: Fix unterminated strings
    let inString = false;
    let escaped = false;
    for (let i = 0; i < healed.length; i++) {
        const ch = healed[i];
        if (escaped) { escaped = false; continue; }
        if (ch === '\\') { escaped = true; continue; }
        if (ch === '"') { inString = !inString; }
    }
    if (inString) healed += '"';

    // 4b: Remove trailing commas
    healed = healed.replace(/,\s*([}\]])/g, '$1');
    healed = healed.replace(/,\s*$/g, '');

    // 4c: Balance unclosed brackets and braces
    let openBraces = 0, openBrackets = 0;
    inString = false;
    escaped = false;
    for (let i = 0; i < healed.length; i++) {
        const ch = healed[i];
        if (escaped) { escaped = false; continue; }
        if (ch === '\\') { escaped = true; continue; }
        if (ch === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (ch === '{') openBraces++;
        if (ch === '}') openBraces--;
        if (ch === '[') openBrackets++;
        if (ch === ']') openBrackets--;
    }
    for (let i = 0; i < openBrackets; i++) healed += ']';
    for (let i = 0; i < openBraces; i++) healed += '}';

    // 4d: Try parsing the healed JSON
    try {
        return JSON.parse(healed);
    } catch { /* continue to final fallback */ }

    // Step 5: Nuclear option — progressive truncation
    for (let cutoff = healed.length - 1; cutoff > 10; cutoff--) {
        const segment = healed.substring(0, cutoff);
        const lastGoodEnd = Math.max(
            segment.lastIndexOf('}'),
            segment.lastIndexOf(']'),
            segment.lastIndexOf('"')
        );
        if (lastGoodEnd > 10) {
            let truncated = segment.substring(0, lastGoodEnd + 1);
            let ob = 0, obk = 0;
            let inStr = false, esc = false;
            for (let i = 0; i < truncated.length; i++) {
                if (esc) { esc = false; continue; }
                if (truncated[i] === '\\') { esc = true; continue; }
                if (truncated[i] === '"') { inStr = !inStr; continue; }
                if (inStr) continue;
                if (truncated[i] === '{') ob++;
                if (truncated[i] === '}') ob--;
                if (truncated[i] === '[') obk++;
                if (truncated[i] === ']') obk--;
            }
            for (let i = 0; i < obk; i++) truncated += ']';
            for (let i = 0; i < ob; i++) truncated += '}';
            try {
                return JSON.parse(truncated);
            } catch { continue; }
        }
    }

    console.warn("[JSON Healer] Could not parse AI response. Returning fallback.", String(clean || '').slice(0, 200));
    return fallback;
}
