/**
 * 🔑 Centralized Environment Variable Loader
 * Single source of truth for ALL env var access across the app.
 * ALWAYS returns a string. Never returns null, undefined, or non-string.
 */
export function getEnv(viteKey: string, processKey?: string): string {
    const fallbackKey = processKey || viteKey;
    let val: any = '';
    try { val = (import.meta as any).env?.[viteKey]; } catch { }
    if (!val) { try { val = (import.meta as any).env?.[fallbackKey]; } catch { } }
    if (!val) { try { val = process.env[fallbackKey]; } catch { } }
    // CRITICAL: Always coerce to string — Vite can return non-strings
    if (val === null || val === undefined || val === false) return '';
    return String(val);
}

/**
 * Preloaded keys — import these instead of calling getEnv() repeatedly.
 */
export const ENV = {
    get GEMINI_API_KEY() { return getEnv('VITE_GEMINI_API_KEY', 'GEMINI_API_KEY') || getEnv('VITE_API_KEY', 'API_KEY'); },
    get PERPLEXITY_API_KEY() { return getEnv('VITE_PERPLEXITY_API_KEY', 'PERPLEXITY_API_KEY'); },
    get OPENROUTER_API_KEY() { return getEnv('VITE_OPENROUTER_API_KEY', 'OPENROUTER_API_KEY'); },
    get XAI_API_KEY() { return getEnv('VITE_XAI_API_KEY', 'XAI_API_KEY'); },
    get SUPABASE_URL() { return getEnv('VITE_SUPABASE_URL', 'SUPABASE_URL'); },
    get SUPABASE_ANON_KEY() { return getEnv('VITE_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY'); },
    get INSFORGE_API_KEY() { return getEnv('VITE_INSFORGE_API_KEY', 'INSFORGE_API_KEY'); },
    get INSFORGE_BASE_URL() { return getEnv('VITE_INSFORGE_BASE_URL', 'INSFORGE_BASE_URL'); },
};
