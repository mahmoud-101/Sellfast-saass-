/**
 * 🤖 AI AGENT — Self-Healing Error Suppressor
 * Wraps ANY async operation and guarantees:
 * 1. NEVER throws to the caller
 * 2. NEVER shows errors to the user
 * 3. Auto-retries silently (configurable)
 * 4. Returns a clean fallback value on failure
 * 
 * Usage:
 *   const result = await safeAI(() => askGemini(prompt), '');
 *   const data = await safeAI(() => generateImage(prompt), { image: null });
 */

export interface SafeAIOptions {
    /** Number of silent retries before giving up (default: 2) */
    retries?: number;
    /** Delay between retries in ms (default: 1000) */
    retryDelay?: number;
    /** Label for console logs (default: 'AI') */
    label?: string;
    /** If true, don't log anything at all (default: false) */
    silent?: boolean;
}

/**
 * Universal safe wrapper for ANY async AI operation.
 * 
 * @param operation - The async function to execute
 * @param fallback - The value to return if all attempts fail
 * @param options - Configuration for retries and logging
 * @returns The result of the operation, or the fallback value
 */
export async function safeAI<T>(
    operation: () => Promise<T>,
    fallback: T,
    options: SafeAIOptions = {}
): Promise<T> {
    const { retries = 2, retryDelay = 1000, label = 'AI', silent = false } = options;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const result = await operation();
            // Guard against null/undefined returns
            if (result === null || result === undefined) {
                if (!silent) console.warn(`[${label}] Operation returned null/undefined. Using fallback.`);
                return fallback;
            }
            return result;
        } catch (error: any) {
            const msg = String(error?.message || error || 'Unknown error');
            if (!silent) {
                console.warn(`[${label}] Attempt ${attempt + 1}/${retries + 1} failed: ${msg.slice(0, 150)}`);
            }
            // Don't retry on validation errors (user input issues)
            if (msg.includes('أدخل') || msg.includes('رفع') || msg.includes('SKIP')) {
                break;
            }
            // Wait before retry (except last attempt)
            if (attempt < retries) {
                await new Promise(r => setTimeout(r, retryDelay * (attempt + 1)));
            }
        }
    }
    return fallback;
}

/**
 * Wraps a sync operation that might crash (eg: .map(), .reduce(), property access)
 */
export function safeSync<T>(operation: () => T, fallback: T): T {
    try {
        const result = operation();
        return result ?? fallback;
    } catch {
        return fallback;
    }
}

/**
 * Safe array guard — ensures .map(), .filter(), .reduce() never crash
 */
export function safeArray<T>(input: any, fallback: T[] = []): T[] {
    if (Array.isArray(input)) return input;
    return fallback;
}

/**
 * Safe property access — deep access without crashes
 * Usage: safeProp(result, 'data.items[0].name', 'default')
 */
export function safeProp<T>(obj: any, path: string, fallback: T): T {
    try {
        const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
        let current = obj;
        for (const key of keys) {
            if (current === null || current === undefined) return fallback;
            current = current[key];
        }
        return (current ?? fallback) as T;
    } catch {
        return fallback;
    }
}
