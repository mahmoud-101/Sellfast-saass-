import { GoogleGenAI, Modality, Part, Type, Chat } from "@google/genai";
import { ImageFile, PowerStudioResult, AudioFile, TrendItem } from '../types';
import { DYNAMIC_STYLES } from '../lib/dynamicTemplates';
import { awardPoints } from '../lib/supabase';
import { runHookScoringEngine } from '../features/performance/optimization/HookScoringEngine';
import { predictCTR, getPerformanceLabel } from '../features/performance/engine/ScoringPredictor';
import { getMasterAgentInstructions } from '../features/performance/engine/PromptBuilder';
import { ENV } from '../utils/env';
import { parseRobustJSON } from '../utils/safeJson';

// Re-export for backward compatibility
export { parseRobustJSON } from '../utils/safeJson';

const SMART_MODEL = 'gemini-1.5-flash';

// ============================================================================
// 🔑 ZERO-DOWNTIME KEY MANAGEMENT SYSTEM
// Keys never die permanently — they go to cooldown and auto-recover
// ============================================================================
interface KeyState {
    key: string;
    lastUsed: number;       // Timestamp of last use (for LRU)
    cooldownUntil: number;  // 0 = active, >0 = cooling down until this timestamp
    useCount: number;       // Total uses this session
}

let allKeyStates: KeyState[] = [];
let keysInitialized = false;

// Fallback models when primary model quota is exhausted for ALL keys
const MODEL_CASCADE = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
let currentModelIndex = 0;

const KEY_COOLDOWN_MS = 65_000;  // 65 seconds (Google resets quota every 60s + 5s buffer)
const MIN_KEY_SPACING_MS = 12_000; // 12 seconds between uses of the SAME key (5 req/min = 12s apart)

// ============================================================================
// CONCURRENCY MANAGER — Handles parallel API requests safely
// ============================================================================
class ConcurrencyManager {
    private queue: Array<{ resolve: (v: void) => void }> = [];
    private running = 0;
    constructor(private maxConcurrent: number = 3) { }

    async acquire(): Promise<void> {
        if (this.running < this.maxConcurrent) {
            this.running++;
            return;
        }
        return new Promise<void>(resolve => this.queue.push({ resolve }));
    }

    release(): void {
        this.running--;
        if (this.queue.length > 0) {
            this.running++;
            this.queue.shift()!.resolve();
        }
    }

    get activeCount() { return this.running; }
    get queueLength() { return this.queue.length; }
}

// Global concurrency limits
const textSemaphore = new ConcurrencyManager(5);   // 5 text requests at once
const imageSemaphore = new ConcurrencyManager(3);   // 3 image requests at once

// ============================================================================
// SMART CACHE — Avoid redundant API calls for identical prompts
// ============================================================================
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key: string): any | null {
    const entry = responseCache.get(key);
    if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.data;
    if (entry) responseCache.delete(key);
    return null;
}

function setCache(key: string, data: any): void {
    if (responseCache.size > 100) {
        const oldest = responseCache.keys().next().value;
        if (oldest) responseCache.delete(oldest);
    }
    responseCache.set(key, { data, timestamp: Date.now() });
}

// ============================================================================
// PARALLEL BATCH IMAGE GENERATION
// ============================================================================
export async function generateImagesBatch(
    productImage: ImageFile,
    prompts: string[],
    onProgress?: (index: number, total: number) => void
): Promise<ImageFile[]> {
    const results: ImageFile[] = new Array(prompts.length);
    const activeKeys = allKeyStates.filter(k => k.cooldownUntil === 0);
    const batchSize = Math.min(3, activeKeys.length || 1);

    for (let i = 0; i < prompts.length; i += batchSize) {
        const batch = prompts.slice(i, i + batchSize);
        const batchResults = await Promise.allSettled(
            batch.map(async (prompt, j) => {
                await imageSemaphore.acquire();
                try {
                    const img = await generateImage([productImage], prompt, null, '1:1', i + j);
                    if (onProgress) onProgress(i + j + 1, prompts.length);
                    return img;
                } finally {
                    imageSemaphore.release();
                }
            })
        );
        batchResults.forEach((result, j) => {
            results[i + j] = result.status === 'fulfilled' ? result.value : productImage;
        });
    }
    return results;
}

// ============================================================================
// TURBO BATCH AD GENERATION — Generate 20 ads in parallel
// ============================================================================
export async function turboBatchGenerate(config: {
    product: AgentProductData;
    productImage: ImageFile;
    count?: number;  // How many ads (default 5, max 20)
    onProgress?: (step: string, percent: number) => void;
}): Promise<any[]> {
    const { product, productImage, count = 5, onProgress } = config;
    const adCount = Math.min(count, 20);

    // Phase 1: Market Analysis (1 call)
    if (onProgress) onProgress('🔍 تحليل السوق والجمهور...', 5);
    const cacheKey = `market_${product.name}_${String(product.description || '').slice(0, 50)}`;
    let marketData = getCached(cacheKey);
    if (!marketData) {
        marketData = await agentMarketAnalyzer(product);
        setCache(cacheKey, marketData);
    }

    // Phase 2: Generate angle variations (1 call for 5 base angles)
    if (onProgress) onProgress('🎯 بناء الزوايا التسويقية...', 15);
    const angles = await agentAngleStrategist(product, marketData);

    // Phase 3: Parallel — Generate hooks + visual directions + copy for ALL angles at once
    if (onProgress) onProgress('⚡ توليد موازي للهوكات والكوبي والاتجاه البصري...', 25);

    // Duplicate angles to match count (cycle through 5 angles)
    const targetAngles = Array.from({ length: adCount }, (_, i) => angles[i % angles.length]);

    const adDataPromises = targetAngles.map(async (angle, i) => {
        await textSemaphore.acquire();
        try {
            const [hooks, visualData] = await Promise.all([
                agentHookWriter(product, angle),
                agentVisualDirector(product, angle)
            ]);
            const bestHook = hooks[0] || '';
            const copyData = await agentCopywriter(product, angle, bestHook);
            return { angle, hooks, copy: copyData, visual: visualData, index: i };
        } finally {
            textSemaphore.release();
        }
    });

    const adDataResults = await Promise.allSettled(adDataPromises);
    const adDataList = adDataResults
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
        .map(r => r.value);

    if (onProgress) onProgress('🎨 توليد الصور بالتوازي...', 50);

    // Phase 4: Batch generate images (3 at a time)
    const imagePrompts = adDataList.map(ad => ad.visual.imagePrompt || 'Premium product photography');
    const images = await generateImagesBatch(productImage, imagePrompts, (done, total) => {
        if (onProgress) onProgress(`📸 صورة ${done}/${total}...`, 50 + (done / total) * 40);
    });

    // Phase 5: Combine results
    if (onProgress) onProgress('✅ تجميع النتائج...', 95);
    const finalAds = adDataList.map((ad, i) => ({
        ...ad,
        visual: {
            ...ad.visual,
            generatedImageUrl: images[i] ? `data:${images[i].mimeType};base64,${images[i].base64}` : undefined
        }
    }));

    if (onProgress) onProgress('🚀 تم توليد ' + finalAds.length + ' إعلان!', 100);
    return finalAds;
}

// ============================================================================
// 🔑 KEY INITIALIZATION — Load all keys and create state objects
// ============================================================================
const initKeys = () => {
    if (keysInitialized) return;
    keysInitialized = true;
    let rawKeys = String(ENV.GEMINI_API_KEY || '');
    const keys = rawKeys.split(',').map((k: any) => String(k).trim()).filter((k: any) => k.length > 0);
    // Shuffle initially for load balancing
    keys.sort(() => Math.random() - 0.5);
    allKeyStates = keys.map(key => ({
        key,
        lastUsed: 0,
        cooldownUntil: 0,
        useCount: 0
    }));
    console.info(`[Key Manager] ✅ Loaded ${allKeyStates.length} Gemini keys`);
};

// ============================================================================
// 🔄 AUTO-RECOVERY SWEEP — Bring cooled-down keys back to life
// ============================================================================
const recoverCooledKeys = () => {
    const now = Date.now();
    let recovered = 0;
    allKeyStates.forEach(ks => {
        if (ks.cooldownUntil > 0 && now >= ks.cooldownUntil) {
            ks.cooldownUntil = 0;
            recovered++;
        }
    });
    if (recovered > 0) {
        console.info(`[Key Manager] 🔄 Recovered ${recovered} key(s) from cooldown. Active pool: ${allKeyStates.filter(k => k.cooldownUntil === 0).length}`);
    }
};

// ============================================================================
// 🎯 SMART KEY SELECTION — Pick the best available key (LRU with spacing)
// ============================================================================
export const getApiKey = (): string => {
    initKeys();
    recoverCooledKeys();

    const now = Date.now();
    // Get all active keys (not in cooldown)
    const activeKeys = allKeyStates.filter(k => k.cooldownUntil === 0);

    if (activeKeys.length === 0) {
        // ALL keys in cooldown — or NO keys loaded at all
        if (allKeyStates.length === 0) {
            console.warn('[Key Manager] ⚠️ No API keys configured. Add VITE_GEMINI_API_KEY to .env');
            return '';
        }
        const soonest = allKeyStates.reduce((a, b) => a.cooldownUntil < b.cooldownUntil ? a : b);
        const waitMs = Math.max(0, soonest.cooldownUntil - now);
        if (waitMs < 10_000) {
            soonest.cooldownUntil = 0;
            soonest.lastUsed = now;
            soonest.useCount++;
            return soonest.key;
        }
        return '';
    }

    // Sort by least recently used
    activeKeys.sort((a, b) => a.lastUsed - b.lastUsed);

    // Pick the key with the oldest lastUsed timestamp
    const chosen = activeKeys[0];
    chosen.lastUsed = now;
    chosen.useCount++;
    return chosen.key;
};

// ============================================================================
// 🚨 COOLDOWN KEY — Move to cooldown pool (auto-recovers after 65s)
// ============================================================================
export const reportExhaustedKey = (failedKey: string) => {
    initKeys();
    const keyStr = String(failedKey || '');
    const ks = allKeyStates.find(k => k.key === keyStr);
    if (ks) {
        ks.cooldownUntil = Date.now() + KEY_COOLDOWN_MS;
        const activeCount = allKeyStates.filter(k => k.cooldownUntil === 0).length;
        console.warn(`[Key Manager] ⏸️ Key ...${keyStr.slice(-4)} → cooldown (65s). Active: ${activeCount}/${allKeyStates.length}`);
    }
};

// Get the current model (with cascade support)
const getCurrentModel = () => MODEL_CASCADE[currentModelIndex % MODEL_CASCADE.length];
const advanceModel = () => {
    currentModelIndex++;
    const newModel = getCurrentModel();
    console.warn(`[Key Manager] 🔄 Switching to model: ${newModel}`);
    return newModel;
};

/**
 * UNIFIED AI ENGINE: Gemini-Only (with 10-key rotation)
 * All legacy calls (OpenRouter/Perplexity) are now redirected to Gemini 
 * for absolute stability and zero-confusion.
 */
export async function askGemini(prompt: string, sys?: string, temperature: number = 0.7, model: string = SMART_MODEL): Promise<string> {
    try {
        const result = await import('../utils/aiAgent').then(m => m.safeAI(async () => {
            return await executeWithRetry(async (apiKey) => {
                const ai = new GoogleGenAI({ apiKey });
                const res = await ai.models.generateContent({
                    model: model || SMART_MODEL,
                    contents: { parts: [{ text: prompt }] },
                    config: { systemInstruction: sys, temperature: temperature, maxOutputTokens: 2048 }
                });
                return (typeof res.text === 'function') ? await (res as any).text() : (res.text || "");
            });
        }, ''));

        return String(result || "").trim();
    } catch (e) {
        console.error('[Unified AI] Gemini critical failure:', e);
        return '';
    }
}

// Backward compatibility aliases
export const askOpenRouter = askGemini;

export async function askGeminiJSON(prompt: string, sys?: string, model: string = SMART_MODEL, temperature: number = 0.2): Promise<any> {
    const text = await askGemini(prompt, sys, temperature, model);
    if (!text) return {};
    return parseRobustJSON(text, {});
}

export const askOpenRouterJSON = askGeminiJSON;

/**
 * 🛡️ ZERO-DOWNTIME RETRY ENGINE
 * 1. On 429 → cooldown the key (65s auto-recovery) and immediately try next
 * 2. If ALL keys are cooling → wait up to 5s for the first one to recover
 * 3. On server errors (500/503) → exponential backoff
 * 4. NEVER throws — returns fallback value on total failure
 */
async function executeWithRetry<T>(operation: (apiKey: string) => Promise<T>, maxRetries = 15): Promise<T> {
    let attempt = 0;
    let lastError: any = null;
    while (attempt < maxRetries) {
        const apiKey = getApiKey();
        if (!apiKey) {
            // ALL keys in cooldown or missing — wait a bit for recovery
            console.warn('[AI Engine] ⏳ No active keys. Waiting 5s...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            recoverCooledKeys();
            const retryKey = getApiKey();
            if (!retryKey) {
                throw new Error("No active Gemini API keys available after wait.");
            }
            // Continue to try with the recovered key
            try {
                return await operation(retryKey);
            } catch (e: any) {
                reportExhaustedKey(retryKey);
                lastError = e;
                attempt++;
                continue;
            }
        }

        try {
            return await operation(apiKey);
        } catch (error: any) {
            attempt++;
            lastError = error;
            const rawErrorMsg = typeof error === 'string' ? error : (error?.message || JSON.stringify(error));
            const msg = rawErrorMsg.toLowerCase();

            // QUOTA EXHAUSTED (429) → Cooldown the key and try next immediately
            if (msg.includes("429") || msg.includes("quota") || msg.includes("exhausted") || msg.includes("limit") || msg.includes("resource_exhausted")) {
                console.warn(`[AI Engine] 🚨 Key quota hit! Switching... (Attempt ${attempt}/${maxRetries})`);
                reportExhaustedKey(apiKey);
                continue;
            }

            // TRANSIENT SERVER ERRORS (500, 503, etc.) - Exponential Backoff
            if (msg.includes("503") || msg.includes("500") || msg.includes("timeout") || msg.includes("fetch failed") || msg.includes("overloaded")) {
                if (attempt >= maxRetries) break;
                const delayMs = Math.min(Math.pow(2, attempt) * 500, 8000) + Math.random() * 500;
                console.warn(`[AI Engine] Server busy (Attempt ${attempt}/${maxRetries}). Retrying in ${Math.round(delayMs)}ms...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
                continue;
            }

            // Non-retryable error (e.g. invalid prompt, or specific 400 error)
            // But we still want to try other keys in case it's a model availability issue
            console.warn(`[AI Engine] ⚠️ Error: ${String(rawErrorMsg || '').slice(0, 150)}`);
            if (attempt >= 5) break; // Don't try all 15 times for a 400 error
            continue;
        }
    }

    // If we're here, all retries failed
    const finalMsg = typeof lastError === 'string' ? lastError : (lastError?.message || "Unknown error");
    throw new Error(`AI Engine exhausted all ${maxRetries} attempts. Last error: ${finalMsg}`);
}

export function createEliteAdChat(mode: string): any {
    let history: any[] = [];
    const systemInstruction = getMasterAgentInstructions('eg') + `
    أنت الآن محرك "إبداع برو" للذكاء الاصطناعي الاستراتيجي.
    مهمتك: قيادة المستخدم عبر 9 مراحل لبناء سكريبت إعلاني فيرال (Viral) يحقق مبيعات حقيقية.
    
    قواعد اللغة:
    - تحدث فقط بالعامية المصرية الطبيعية (Egyptian Colloquial Arabic).
    - ممنوع تماماً استخدام اللغة العربية الفصحى أو الروبوتية.
    - كن حماسياً، عملياً، ومباشراً.
    
    المراحل الـ 9 التي ستقود المستخدم فيها:
    1. الهوية: تحديد شخصية البراند.
    2. المنتج: الميزة التنافسية الحقيقية.
    3. التحول: من الحالة "قبل" إلى الحالة "بعد".
    4. القوة: العرض الذي لا يمكن رفضه.
    5. الزمن: خلق حالة الاستعجال.
    6. الألم: لمس نقطة الوجع عند العميل.
    7. الإغلاق: نداء اتخاذ إجراء (CTA) قوي.
    8. المعاينة: مراجعة العناصر.
    9. السكريبت النهائي: صياغة السكريبت الاحترافي.`;

    return {
        sendMessage: async (req: { message: string }) => {
            history.push({ role: 'user', content: req.message });
            const prompt = history.map(m => `${m.role}: ${m.content}`).join('\n');

            // PRIMARY: Gemini
            const geminiResult = await import('../utils/aiAgent').then(m => m.safeAI(async () => {
                return await executeWithRetry(async (apiKey) => {
                    const ai = new GoogleGenAI({ apiKey });
                    const res = await ai.models.generateContent({
                        model: SMART_MODEL,
                        contents: { parts: [{ text: prompt }] },
                        config: { systemInstruction, temperature: 0.7, maxOutputTokens: 2048 }
                    });
                    const text = (typeof res.text === 'function') ? await (res as any).text() : (res.text || "");
                    return text;
                });
            }, ''));

            let responseText = String(geminiResult || '');

            if (!responseText) {
                responseText = "عذراً، المحرك مشغول حالياً. جارٍ الإصلاح الذاتي...";
            }

            if (!responseText) {
                responseText = "عذراً، هناك ضغط كبير على المحرك حالياً. من فضلك حاول مرة أخرى بعد قليل.";
            }

            history.push({ role: 'assistant', content: responseText });
            return { text: responseText };
        }
    };
}
export async function generateFlowVideo(script: string, aspectRatio: "9:16" | "16:9" = "9:16", onProgress: (msg: string) => void): Promise<string> {
    // إنشاء نسخة جديدة من AI في كل مرة لضمان استخدام المفتاح المختار حديثاً
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });

    onProgress("تحليل السكريبت وصياغة المشاهد...");

    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: `Professional high-end commercial for a brand, 9:16 vertical reel format. The video follows this script precisely: ${script}. Cinematic lighting, 4k, hyper-realistic, 60fps.`,
            config: {
                numberOfVideos: 1,
                resolution: '1080p',
                aspectRatio: aspectRatio
            }
        });

        onProgress("بدأت الرندرة السحابية (دقيقة تقريباً)...");

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
            onProgress("المحرك يعمل على رندرة الإضاءة والظلال...");
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) throw new Error("لم يتم العثور على رابط الفيديو المولد");

        const response = await fetch(`${downloadLink}&key=${apiKey}`);
        if (!response.ok) throw new Error("فشل تحميل ملف الفيديو النهائي");

        const blob = await response.blob();

        // Award points for high-value creation
        if ((import.meta as any).env.VITE_USER_ID) {
            await awardPoints((import.meta as any).env.VITE_USER_ID, 100, "إنتاج فيديو احترافي");
        }

        return URL.createObjectURL(blob);
    } catch (error: any) {
        if (error.message?.includes("Requested entity was not found")) {
            throw new Error("API_KEY_NOT_FOUND");
        }
        throw error;
    }
}

// ----------------------------------------------------------------------------
// Legacy Content Generation Tools - Unified to Gemini
// ----------------------------------------------------------------------------

export async function generateUGCScript(data: any): Promise<string> {
    return askGemini(`Generate viral UGC script for ${data.productSelling}`, getMasterAgentInstructions('eg') + "\n\nExpert Content Creator");
}
export async function generateShortFormIdeas(data: any): Promise<string[]> {
    const res = await askGemini(`Generate 30 short-form ideas for ${data.product}. Output as simple list.`, getMasterAgentInstructions('eg') + "\\n\\nContent Strategist");
    return (res || '').split('\\n').filter(l => l.trim().length > 0).slice(0, 30);
}
export async function generateFinalContentScript(topic: string, type: string): Promise<string> {
    return askGemini(`Write a ${type} script for: ${topic}`, getMasterAgentInstructions('eg') + "\\n\\nVideo Script Writer");
}

export async function generateImage(productImages: ImageFile[], prompt: string, styleImages: ImageFile[] | null = null, aspectRatio: string = "1:1", variationIndex: number = -1): Promise<ImageFile> {
    // ========================================================================
    // VARIATION SYSTEM: Force drastically different outputs per call
    // ========================================================================
    const SCENE_PRESETS = [
        { bg: "luxurious marble studio with soft golden backlighting", mood: "elegant premium", color: "warm gold and ivory tones", angle: "slightly elevated 3/4 angle" },
        { bg: "vibrant neon-lit urban street at night with rain reflections", mood: "edgy street style", color: "electric blue and magenta neon", angle: "dramatic low angle looking up" },
        { bg: "bright airy minimalist room with huge windows and natural sunlight", mood: "clean modern lifestyle", color: "soft whites and natural greens", angle: "eye-level straight on" },
        { bg: "tropical beach at golden hour with palm shadows", mood: "warm vacation energy", color: "sunset oranges and ocean teals", angle: "wide environmental shot" },
        { bg: "sleek dark studio with single spotlight and smoke effects", mood: "mysterious dramatic", color: "deep blacks with sharp white highlights", angle: "close-up detail shot" },
        { bg: "colorful pop-art inspired flat background with geometric shapes", mood: "playful bold graphic", color: "saturated primary colors red yellow blue", angle: "perfectly centered symmetrical" },
        { bg: "cozy coffee shop interior with warm ambient lighting", mood: "authentic relatable", color: "warm browns and cream tones", angle: "casual handheld perspective" },
        { bg: "futuristic white void with holographic floating elements", mood: "tech-forward innovative", color: "iridescent chrome and white", angle: "top-down bird's eye view" }
    ];

    // Pick a scene: if variationIndex provided use it, otherwise random
    const sceneIdx = variationIndex >= 0 ? (variationIndex % SCENE_PRESETS.length) : Math.floor(Math.random() * SCENE_PRESETS.length);
    const scene = SCENE_PRESETS[sceneIdx];

    // Build the prompt - this is the ONLY thing the model should follow
    const finalPrompt = `Generate a NEW, ORIGINAL commercial photograph.

SCENE DESCRIPTION: ${prompt}

MANDATORY VISUAL DIRECTION (DO NOT IGNORE):
- Setting: ${scene.bg}
- Visual Mood: ${scene.mood}
- Color Palette: ${scene.color}
- Camera Angle: ${scene.angle}
- Aspect Ratio: ${aspectRatio}

CRITICAL RULES:
1. Create a COMPLETELY NEW image composition from scratch.
2. If a reference product photo is provided, extract ONLY the product itself and place it naturally into the new scene described above.
3. The background, lighting, pose, and composition MUST match the scene description above, NOT the reference photo.
4. Output must be photorealistic, 8K quality, commercially polished.
5. This image MUST look drastically different from any other image - unique composition, unique framing, unique mood.`;

    // Build parts: text FIRST, then optional reference image
    const parts: Part[] = [{ text: finalPrompt }];

    // Only include reference image if provided - and limit to ONE to reduce its dominance
    if (productImages.length > 0) {
        parts.push({ inlineData: { data: productImages[0].base64, mimeType: productImages[0].mimeType } });
    }

    if (styleImages && styleImages.length > 0) {
        parts.push({ inlineData: { data: styleImages[0].base64, mimeType: styleImages[0].mimeType } });
    }

    // CHECK: Is Gemini key available?
    const geminiKey = getApiKey();
    if (!geminiKey) {
        throw new Error('⚠️ لتوليد الصور، أضف مفتاح Gemini جديد في إعدادات Vercel (VITE_GEMINI_API_KEY). الأدوات النصية كلها شغالة عادي على Perplexity.');
    }

    // Image model priority chain (best → fallback)
    const IMAGE_MODELS = [
        'imagen-3.0-generate-002',       // Latest high-quality Imagen
        'gemini-1.5-flash',               // Multimodal fallback
    ];

    return executeWithRetry(async (apiKey) => {
        // PRIMARY: Gemini Models Chain
        const ai = new GoogleGenAI({ apiKey });
        let lastError: any = null;

        for (const modelName of IMAGE_MODELS) {
            try {
                console.log(`[IMG] 🔄 Trying Gemini primary: ${modelName}...`);
                const res = await ai.models.generateContent({
                    model: modelName,
                    contents: { parts },
                    config: {
                        temperature: 1.0,
                        responseModalities: ["IMAGE"],
                    }
                });
                for (const part of res.candidates?.[0]?.content?.parts || []) {
                    if (part.inlineData) {
                        console.log(`[IMG] ✅ Generated with ${modelName}`);
                        return { base64: part.inlineData.data, mimeType: part.inlineData.mimeType || 'image/png', name: 'img.png' };
                    }
                }
                throw new Error(`No image in response from ${modelName}`);
            } catch (err: any) {
                lastError = err;
                const msg = err?.message?.toLowerCase() || '';
                if (msg.includes('429') || msg.includes('quota') || msg.includes('limit')) {
                    throw err; // Re-throw to trigger key rotation in executeWithRetry
                }
                console.warn(`[IMG] Gemini ${modelName} failed, trying next...`, err.message);
                continue; // Try next model
            }
        }
        throw lastError || new Error('جميع محركات الصور (Flux & Gemini) متوقفة حالياً.');
    });
}

export async function generateCampaignPlan(productImages: ImageFile[], goal: string, market: string, dialect: string): Promise<any[]> {
    const sysPrompt = getMasterAgentInstructions(dialect as any) + `\n\nأنت خبير إطلاق حملات محترف.`;
    const res = await askGemini(`Create 9-day content plan for ${goal} in ${market} with ${dialect}. Return JSON array with {id, tov, caption, schedule, scenario}. \nCRITICAL INSTRUCTION: Make sure EVERY visualPrompt and scenario is drastically visually different from the others.`, sysPrompt, 0.4);
    const plan = parseRobustJSON(res, []);
    if (Array.isArray(plan) && plan.length > 0 && (import.meta as any).env.VITE_USER_ID) {
        await awardPoints((import.meta as any).env.VITE_USER_ID, 40, "تصميم خطة حملة كاملة");
    }
    return Array.isArray(plan) ? plan : [];
}

export async function generateContentCalendar7Days(productImages: ImageFile[], goal: string, market: string, dialect: string): Promise<any[]> {
    const prompt = `
    You are a World-Class Content Strategist for the Arabic/MENA market.
    Create a 7-day content calendar for:
    - Goal: ${goal}
    - Market: ${market}
    - Dialect: ${dialect}
    
    The calendar MUST be a balanced mix:
    - 40% Product Showcase (Selling directly)
    - 30% Viral/Educational (Sharing secrets, value, storytelling)
    - 20% Engagement (Questions, polls, memes)
    - 10% Video/Reel Scripts (High impact)
    
    Return ONLY a JSON array of 7 objects. Each object MUST have:
    {
      "id": "day-1 to day-7",
      "date": "Day 1",
      "type": "product | viral | engagement | video",
      "title": "Short catchy title",
      "caption": "Full social media caption in ${dialect}",
      "visualPrompt": "Detailed AI image generation prompt for this day. CRITICAL: Every single visualPrompt MUST be completely different in setting, lighting, and style.",
      "script": "If type is video, provide a 30s script, else null"
    }

    Respond ONLY with the JSON array.
    `;

    const sysPrompt = getMasterAgentInstructions(dialect as any) + `\n\nYou are a Senior Social Media Strategist.`;
    const res = await askGemini(prompt, sysPrompt, 0.4);
    try {
        const plan = parseRobustJSON(res);
        if ((import.meta as any).env.VITE_USER_ID) {
            await awardPoints((import.meta as any).env.VITE_USER_ID, 100, "برمجة خطة محتوى 7 أيام");
        }
        return plan;
    } catch { return []; }
}

export async function analyzeProductForCampaign(images: ImageFile[]): Promise<string> {
    const sysInstr = getMasterAgentInstructions('eg');
    try {
        return await executeWithRetry(async (apiKey) => {
            const ai = new GoogleGenAI({ apiKey });
            const parts: Part[] = images.map(img => ({ inlineData: { data: img.base64, mimeType: img.mimeType } }));
            parts.push({
                text: `أنت خبير تسويق رقمي. حلل هذا المنتج من الصور المقدمة وأجب بالعامية المصرية:

1. 📦 إيه المنتج ده بالظبط؟ (اسم + فئة)
2. 💪 إيه نقاط القوة الفريدة (USP)؟
3. 👥 مين الجمهور المثالي اللي هيشتريه؟
4. 😫 إيه أكبر ألم بيحله المنتج ده؟
5. 🎯 أقوى 3 زوايا تسويقية لبيعه
6. 💰 اقتراح استراتيجية تسعير نفسي
7. 🎣 هوك افتتاحي قوي للإعلان` });
            const res = await ai.models.generateContent({ model: SMART_MODEL, contents: { parts }, config: { systemInstruction: sysInstr } });
            return res.text || '';
        });
    } catch (e) {
        console.warn('[AI] analyzeProductForCampaign using Unified Gemini fallback', e);
        return await askGemini('حلل المنتج من منظور تسويقي: ما هو؟ نقاط القوة؟ الجمهور المستهدف؟ أقوى زاوية بيع؟ اكتب بالعامية المصرية.', sysInstr);
    }
}

export async function editImage(image: ImageFile, prompt: string): Promise<ImageFile> { return generateImage([image], prompt); }
export async function expandImage(image: ImageFile, prompt: string): Promise<ImageFile> { return generateImage([image], prompt); }
export async function enhancePrompt(prompt: string): Promise<string> { return askGemini(`Enhance this prompt for AI image generation: ${prompt}`); }

export async function analyzeLogoForBranding(logos: ImageFile[]): Promise<{ colors: string[] }> {
    try {
        return await executeWithRetry(async (apiKey) => {
            if (logos.length === 0) return { colors: ['#FFD700', '#0f172a', '#f8fafc', '#10b981', '#6366f1'] };
            const ai = new GoogleGenAI({ apiKey });
            const parts: Part[] = logos.map(img => ({ inlineData: { data: img.base64, mimeType: img.mimeType } }));
            parts.push({ text: `Analyze this logo/brand image. Extract the exact dominant colors used.\nReturn ONLY a valid JSON object: {"colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"]}\nExtract 5 colors: primary, secondary, accent, dark, light. Return HEX codes only.` });
            const res = await ai.models.generateContent({ model: SMART_MODEL, contents: { parts } });
            const text = res.text || '';
            const cleaned = (text || '').replace(/```json|```/g, '').trim();
            const parsed = parseRobustJSON(cleaned, { colors: ['#FFD700', '#0f172a', '#f8fafc'] });
            return { colors: Array.isArray(parsed?.colors) ? parsed.colors.slice(0, 6) : ['#FFD700', '#0f172a', '#f8fafc'] };
        });
    } catch (e) {
        console.warn('[AI] analyzeLogoForBranding fallback', e);
        return { colors: ['#FFD700', '#0f172a', '#f8fafc', '#10b981', '#6366f1'] };
    }
}

export async function generateSpeech(text: string, style: string, voice: string): Promise<AudioFile> {
    return executeWithRetry(async (apiKey) => {
        const ai = new GoogleGenAI({ apiKey });
        const styledText = style === 'energetic' ? `(بحماس وطاقة عالية) ${text}` :
            style === 'calm' ? `(بهدوء وثقة) ${text}` :
                style === 'serious' ? `(بجدية واحترافية) ${text}` : text;
        const res = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text: styledText }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice || 'Kore' } } }
            }
        });
        const rawBase64 = res.candidates?.[0]?.content?.parts[0]?.inlineData?.data || '';
        if (!rawBase64) throw new Error('لم يتم توليد صوت');
        // Convert raw PCM to playable WAV by adding proper headers
        const pcmBytes = Uint8Array.from(atob(rawBase64), c => c.charCodeAt(0));
        const sampleRate = 24000;
        const numChannels = 1;
        const bitsPerSample = 16;
        const dataSize = pcmBytes.length;
        const wavHeader = new ArrayBuffer(44);
        const view = new DataView(wavHeader);
        const writeStr = (offset: number, str: string) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };
        writeStr(0, 'RIFF');
        view.setUint32(4, 36 + dataSize, true);
        writeStr(8, 'WAVE');
        writeStr(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numChannels * bitsPerSample / 8, true);
        view.setUint16(32, numChannels * bitsPerSample / 8, true);
        view.setUint16(34, bitsPerSample, true);
        writeStr(36, 'data');
        view.setUint32(40, dataSize, true);
        const wavBytes = new Uint8Array(44 + dataSize);
        wavBytes.set(new Uint8Array(wavHeader), 0);
        wavBytes.set(pcmBytes, 44);
        const wavBase64 = btoa(String.fromCharCode(...wavBytes));
        return { base64: wavBase64, name: 'voiceover.wav' };
    });
}

export async function runPowerProduction(images: ImageFile[], context: string, m: string, d: string, cb: any): Promise<PowerStudioResult> {
    const sysPrompt = getMasterAgentInstructions(d as any);
    if (cb) cb('🔍 جاري تحليل المنتج وبناء الاستراتيجية...');

    const analysisPrompt = `أنت استراتيجي تسويق رقمي محترف. حلل هذا المنتج للسوق العربي:
السياق: ${context}
السوق: ${m}
اللهجة: ${d}

اكتب تحليل استراتيجي شامل يتضمن:
1. الجمهور المستهدف بدقة (ديموغرافي + نفسي)
2. نقاط الألم الـ 3 الأقوى
3. القيمة الفريدة (USP)
4. الزاوية الإعلانية الأقوى
5. استراتيجية التسعير النفسي
arabic only.`;
    let analysis: string;
    try {
        analysis = await askGemini(analysisPrompt, sysPrompt);
    } catch (e) {
        console.warn('[AI] runPowerProduction analysis failed, using Unified Gemini fallback', e);
        analysis = await askGemini(analysisPrompt, sysPrompt);
    }


    if (cb) cb('🎨 جاري بناء الاتجاه البصري...');
    const visualPromptText = `Based on this product analysis:\n${analysis}\n\nCreate a highly detailed, cinematic product photography prompt in English. Include: lighting setup, background props, surface material, atmosphere, camera angle, lens type. Make it premium and editorial quality.`;
    let visualPrompt: string;
    try {
        visualPrompt = await askGemini(visualPromptText, 'You are a world-class Commercial Photographer and Art Director.');
    } catch (e) {
        console.warn('[AI] runPowerProduction visual prompt failed, using Unified Gemini fallback', e);
        visualPrompt = await askGemini(visualPromptText, 'You are a world-class Commercial Photographer and Art Director.');
    }


    if (cb) cb('📝 جاري كتابة الإعلان...');
    const adPrompt = `بناءً على هذا التحليل الاستراتيجي:
${analysis}

اكتب إعلان فيسبوك/إنستجرام احترافي يتضمن:
- Primary Text: نص الإعلان الرئيسي (3-5 أسطر بالعامية)
- Headline: عنوان قصير جذاب (5-7 كلمات)

أخرج JSON فقط: {"primaryText": "...", "headline": "..."}`;
    let fbAds;
    try {
        fbAds = await askGeminiJSON(adPrompt, sysPrompt);
    } catch {
        fbAds = { primaryText: String(analysis || '').slice(0, 300), headline: String(context || '').slice(0, 50) };
    }

    if (cb) cb('📸 جاري توليد الصورة الاحترافية...');
    const visual = await generateImage(images, visualPrompt);

    return { analysis, visualPrompt, fbAds, visual };
}

export async function generateAdScript(p: string, b: string, pr: string, l: string, t: string): Promise<string> {
    const sysPrompt = getMasterAgentInstructions(l as any) + `\n\nأنت كاتب سكريبتات إعلانية محترف ومخرج فيديوهات TikTok وReels.`;
    const prompt = `اكتب سكريبت إعلاني احترافي لهذا المنتج:
المنتج: ${p}
الجمهور المستهدف: ${b}
السعر: ${pr}
الأسلوب/التون: ${t}

السكريبت لازم يتضمن:
🎬 Hook (0-3 ثواني): جملة صادمة تخطف الانتباه
📌 المشكلة (3-7 ثواني): وصف الألم اللي العميل حاسس بيه
💡 الحل (7-15 ثانية): إزاي المنتج بيحل المشكلة
✅ الإثبات (15-22 ثانية): Social proof أو نتائج
🛒 CTA (22-30 ثانية): دعوة واضحة للشراء مع urgency

لكل مشهد اكتب:
- التوجيه المرئي (Visual Direction)
- النص المنطوق (Voiceover/Dialog)
- المدة بالثواني

اكتب بالعامية ${l === 'egyptian' ? 'المصرية' : 'الخليجية'} واستخدم أسلوب ${t}.`;
    return askGemini(prompt, sysPrompt);
}

export async function generateDynamicStoryboard(productImages: ImageFile[], referenceImages: ImageFile[], userInstructions: string): Promise<string[]> {
    try {
        return await executeWithRetry(async (apiKey) => {
            const ai = new GoogleGenAI({ apiKey });
            const parts: Part[] = [];
            productImages.forEach(img => parts.push({ inlineData: { data: img.base64, mimeType: img.mimeType } }));
            referenceImages.forEach(img => parts.push({ inlineData: { data: img.base64, mimeType: img.mimeType } }));
            parts.push({ text: `Analyze the PRODUCT and STYLE images. User Instructions: ${userInstructions}. Generate 9 unique shot descriptions for a professional commercial photoshoot. Include 2 Catalog, 3 Lifestyle, 2 Editorial, 2 Creative shots. Output exactly 9 lines.` });
            const res = await ai.models.generateContent({ model: SMART_MODEL, contents: { parts }, config: { systemInstruction: "You are a world-class Creative Director and Fashion Photographer." } });
            return (res.text || "").split('\n').filter(l => l.trim().length > 0).slice(0, 9);
        });
    } catch (e) {
        console.warn("[AI] generateDynamicStoryboard using Unified Gemini fallback", e);
        const text = await askGemini(`Generate 9 unique shot descriptions for a commercial photoshoot. User instructions: ${userInstructions}. Include 2 Catalog, 3 Lifestyle, 2 Editorial, 2 Creative shots. Output exactly 9 lines.`, "You are a world-class Creative Director.");
        return (text || '').split('\n').filter(l => l.trim().length > 0).slice(0, 9);
    }
}
export async function generateMarketingAnalysis(d: any, l: string): Promise<string> {
    const sysPrompt = getMasterAgentInstructions(l as any) + `\n\nYou are a Senior Marketing Strategist specialized in the Arabic/MENA market.`;
    return askGemini(`Perform a comprehensive marketing & competitor analysis for this brand:
Brand: ${d.brandName || 'Unknown'}
Specialty: ${d.specialty || 'General'}
Brief: ${d.brief || ''}
Language: ${l}

Provide:
1. Market landscape overview
2. Competitor strengths & weaknesses
3. Unique positioning opportunities
4. Recommended channels & tactics
5. Action plan for first 30 days`, sysPrompt, 0.2);
}
export async function generateStoryboardPlan(i: any, ins: string): Promise<any[]> {
    const promptText = `
    You are an Elite Performance Creative Director specialized in short-form vertical ads (9:16) for Arabic markets.

    Your mission is NOT to generate a generic storyboard.
    Your mission is to create a conversion-oriented video execution plan designed to sell.

    USER INSTRUCTIONS / PRODUCT CONTEXT:
    ${ins}

    Before generating the storyboard, you MUST internally define:
    1) Product Type (Impulse / Considered / Premium / Utility)
    2) Emotional Driver (Pain / Desire / Status / Fear / Convenience)
    3) Primary Audience Archetype (e.g., Busy Mom, Young Trend Seeker, Skeptical Buyer, Status Buyer)
    4) Funnel Stage (Cold / Warm / Hot)
    5) Strongest Objection
    6) Persona (Arabic culturally authentic)

    Generate a structured JSON array of 6 objects with: id, description, visualPrompt, cameraAngle, dialogue.
    `;

    try {
        return await executeWithRetry(async (apiKey) => {
            const ai = new GoogleGenAI({ apiKey });
            const parts: Part[] = [];
            if (i && i.length > 0) {
                i.forEach((img: any) => parts.push({ inlineData: { data: img.base64, mimeType: img.mimeType } }));
            }
            parts.push({ text: promptText });

            const res = await ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: { parts },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                description: { type: Type.STRING },
                                visualPrompt: { type: Type.STRING },
                                cameraAngle: { type: Type.STRING },
                                dialogue: { type: Type.STRING }
                            }
                        }
                    }
                }
            });
            const plan = parseRobustJSON(res.text || "[]", []);
            if (Array.isArray(plan) && plan.length > 0 && (import.meta as any).env.VITE_USER_ID) {
                await awardPoints((import.meta as any).env.VITE_USER_ID, 30, "صناعة سكريبت إعلاني احترافي");
            }
            return Array.isArray(plan) ? plan : [];
        });
    } catch (e) {
        console.warn("[AI] generateStoryboardPlan using Unified Gemini fallback", e);
        const text = await askGemini(promptText + "\n\nReturn ONLY a JSON array of 6 objects with: id, description, visualPrompt, cameraAngle, dialogue. JSON only, no markdown.", "You are an Elite Performance Creative Director for short-form vertical ads.");
        return parseRobustJSON(text, []);
    }
}
export async function animateImageToVideo(i: any, p: string, a: string, cb: any): Promise<string> { return ""; }
export async function fetchCurrentTrends(r: string, n: string): Promise<TrendItem[]> {
    try {
        const res = await askGemini(`You are a social media trends analyst. Find the TOP 10 current viral trends in region: ${r}, niche: ${n}.

Return ONLY a valid JSON array with this exact format:
[{"topic":"Trend name in Arabic","relevance":"Why this matters for the niche (in Arabic)","contentIdea":"A specific content idea to capitalize on this trend (in Arabic)","viralHook":"A scroll-stopping hook line in Arabic"}]

Return exactly 10 items. JSON only, no markdown, no code blocks.`, "You are a viral trends analyst for Arabic social media markets. Always respond in Arabic.");
        const parsed = parseRobustJSON(res, []);
        if (Array.isArray(parsed) && parsed.length > 0 && (import.meta as any).env.VITE_USER_ID) {
            await awardPoints((import.meta as any).env.VITE_USER_ID, 20, "تحليل التريندات العالمية");
        }
        return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
}
export async function transformScriptToUGC(originalScript: string): Promise<string> { return askGemini(`Transform this to raw UGC script: ${originalScript}`); }

export async function generateSocialContentPack(script: string): Promise<string[]> {
    const sysPrompt = getMasterAgentInstructions('eg') + '\n\nأنت خبير Social Media Content بتكتب بوستات تشد الناس من أول سطر.';
    return executeWithRetry(async (apiKey) => {
        const res = await askGemini(`بناءً على هذا السكريبت الاستراتيجي:
${script}

اكتب 9 بوستات سوشيال ميديا احترافية (فيسبوك/إنستجرام) بالعامية المصرية.
كل بوست لازم يتضمن:
- 🎣 Hook قوي (سطر واحد يخطف العين)
- 📝 Body (2-3 أسطر تشرح القيمة)
- 🛒 CTA واضح (دعوة للتصرف)
- إيموجيز في مكانها الصح

نوّع البوستات بين: سؤال، قصة، عرض، إثبات اجتماعي، تعليمي، ترفيهي، UGC.
اكتب كل بوست بعد رقم (1. ، 2. ، إلخ).`, sysPrompt);
        return (res || '').split(/\d+\./).filter(l => l.trim().length > 0).slice(0, 9);
    });
}

export async function generateReelsProductionScript(script: string): Promise<string> {
    const sysPrompt = getMasterAgentInstructions('eg') + '\n\nأنت مخرج Reels وTikTok محترف.';
    return executeWithRetry(async (apiKey) => {
        return askGemini(`بناءً على السكريبت ده:
${script}

اكتب سكريبت إنتاج Reels/TikTok (30-60 ثانية) بالعامية المصرية.
لكل مشهد حدد:
🎬 المشهد (رقم + اسم)
⏱️ التوقيت بالثواني
📹 التوجيه المرئي (Visual Cue)
🎤 التعليق الصوتي (Voiceover)
🎵 الموسيقى/الصوت المقترح
📝 النص المكتوب على الشاشة (Text Overlay)`, sysPrompt);
    });
}

export async function generateImagePromptsFromStrategy(script: string): Promise<string[]> {
    return executeWithRetry(async (apiKey) => {
        const res = await askGemini(`Based on this marketing strategy:\n${script}\n\nGenerate 5 highly detailed AI image generation prompts for premium ad visuals. Focus on:lighting, texture, camera angle, and professional photography terms. Output as numbered list (1. 2. 3. 4. 5.)`, 'You are a world-class Commercial Photography Art Director. Write in English only.');
        return (res || '').split(/\d+\./).filter(l => l.trim().length > 0).slice(0, 5);
    });
}

export async function analyzeImageForPrompt(images: ImageFile[], instructions: string): Promise<string> {
    try {
        return await executeWithRetry(async (apiKey) => {
            const ai = new GoogleGenAI({ apiKey });
            const parts: Part[] = images.map(img => ({ inlineData: { data: img.base64, mimeType: img.mimeType } }));
            parts.push({ text: `Create a highly detailed, professional AI image generation prompt based on these images and instructions: ${instructions}` });
            const res = await ai.models.generateContent({ model: SMART_MODEL, contents: { parts } });
            return res.text || "";
        });
    } catch (e) {
        console.warn("[AI] analyzeImageForPrompt using Unified Gemini fallback", e);
        return await askGemini(`Create a highly detailed, professional AI image generation prompt based on these instructions: ${instructions}`);
    }
}

export async function generatePerformanceAdPack(data: {
    targetMarket: string;
    campaignGoal: string;
    dialect: string;
    platform: string;
    productDescription: string;
    sellingPrice: string;
    brandTone: string;
    referenceImage?: ImageFile | null;
}): Promise<any> {
    return await import('../utils/aiAgent').then(m => m.safeAI(async () => {
        // Unified Gemini strategy generation

        const prompt = `
    Product Description: ${data.productDescription}
    Selling Price: ${data.sellingPrice}
    Target Market: ${data.targetMarket}
    Campaign Goal: ${data.campaignGoal}
    Platform: ${data.platform}
    Dialect: ${data.dialect}
    Brand Tone: ${data.brandTone}

    TASK: Perform as Business Domination Engine – Arabic Market Edition.
    Replace the need for a media buyer, content creator, designer, and creative director.
    
    LANGUAGE RULE:
    If Dialect = Egyptian → write naturally in Egyptian Arabic (عامية مصرية حقيقية).
    If Gulf → adapt culturally.
    Never use robotic tone.
    
    EXECUTION:
    1. Strategic Intelligence
    2. Angle Matrix (Rank 3 angles, select ONE to "START WITH THIS ANGLE")
    3. Recommended Launch Pack (The "LAUNCH THIS NOW" section)
    4. Visual Matching Engine
    5. Profit Brain
    6. Performance Simulation
    
    IMPORTANT: Return the response as a valid JSON object following this structure:
    {
        "strategicIntelligence": { "productType": "", "riskLevel": "", "emotionalDriver": "", "archetype": "", "psychologicalTrigger": "", "biggestObjection": "" },
        "creativeStrategyMatrix": { "angles": [{ "title": "", "trigger": "", "principle": "", "marketReason": "", "objectionNeutralizer": "", "rank": 1, "isRecommended": true }], "recommendationReason": "" },
        "launchPack": { "hooks": [], "adCopy": "", "ugcScript": "", "offerStructure": "", "upsellSuggestion": "", "cta": "", "testingHooks": [] },
        "visualMatchingEngine": { "imageConcepts": [], "thumbnailConcept": "", "storyboard": [] },
        "profitBrain": { "valueStacking": "", "aovIncrease": "", "scarcityUrgency": "", "riskReversal": "" },
        "performanceSimulation": { "hookStrength": "High", "conversionConfidence": 9, "riskLevel": "", "testingStructure": "" }
    }
    `;

        const systemInstruction = `
    You are Business Domination Engine – Arabic Market Edition.
    You are a Senior Conversion Strategist, Creative Director, Media Buyer, and Revenue Optimization Consultant.
    Your mission: Replace the need for hiring a media buyer, content creator, designer, and creative director.
    Think in sales, profitability, execution, and speed.
    Output must be: Clear. Decisive. Actionable. Conversion-driven.
    No fluff. No corporate tone. No generic AI phrases.
    `;

        // PRIMARY: Gemini
        try {
            const geminiResult = await executeWithRetry(async (apiKey) => {
                const ai = new GoogleGenAI({ apiKey });
                const parts: Part[] = [];
                if (data.referenceImage) {
                    parts.push({ inlineData: { data: data.referenceImage.base64, mimeType: data.referenceImage.mimeType } });
                }
                parts.push({ text: prompt });
                const res = await ai.models.generateContent({
                    model: SMART_MODEL,
                    contents: { parts },
                    config: {
                        systemInstruction,
                        responseMimeType: "application/json",
                        temperature: 0.2,
                        topK: 40,
                    }
                });
                const text = (typeof res.text === 'function') ? await (res as any).text() : (res.text || "");
                return parseRobustJSON(text, {});
            });

            const result = geminiResult;
            if (result && Object.keys(result).length > 0) {
                // --- Inject Validation Engines ---
                if (result.launchPack) {
                    const marketParam = data.targetMarket.includes('Egypt') || data.dialect.includes('Egyptian') ? 'egypt' : 'gulf';

                    if (Array.isArray(result.launchPack.hooks)) {
                        result.launchPack.hooks = result.launchPack.hooks.map((h: string) => {
                            const evalResult = runHookScoringEngine(h, marketParam);
                            const badge = evalResult.score.total >= 80 ? '🔥 قوي جداً' : evalResult.score.total >= 60 ? '✅ جيد' : '⚠️ متوسط';
                            return `[التقييم: ${evalResult.score.total}/100 ${badge}] ${evalResult.finalHook}`;
                        });
                    }

                    if (result.launchPack.adCopy) {
                        const ctr = predictCTR({
                            headlineLength: 50,
                            hasNumber: /\d/.test(result.launchPack.adCopy),
                            hasEmoji: /[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(result.launchPack.adCopy),
                            hasQuestion: result.launchPack.adCopy.includes('؟') || result.launchPack.adCopy.includes('?'),
                            urgencyLevel: result.launchPack.adCopy.includes('الآن') || result.launchPack.adCopy.includes('محدود') ? 3 : 1,
                            imageType: 'product',
                            colorContrast: 0.8,
                            textToImageRatio: 0.1,
                            ctaClarity: result.launchPack.cta ? 0.9 : 0.5
                        });
                        const perf = getPerformanceLabel(ctr);
                        result.launchPack.adCopy = `[توقع الـ CTR: ${ctr}% - ${perf.label}]\n\n${result.launchPack.adCopy}`;
                    }
                }

                if (result.strategicIntelligence && (import.meta as any).env.VITE_USER_ID) {
                    await awardPoints((import.meta as any).env.VITE_USER_ID, 50, "تحليل استراتيجي متكامل");
                }
                return result;
            }
        } catch (e) {
            console.warn("Gemini Performance Pack failed", e);
        }

        throw new Error("All AI Engines failed to generate strategy pack.");
    }, {}));
}

export async function generateVisualStrategy(data: {
    angle: string;
    pain: string;
    persona: string;
    emotion: string;
    goal: string;
    platform: string;
    offer: string;
    tone: string;
}): Promise<any> {
    return await import('../utils/aiAgent').then(m => m.safeAI(async () => {
        // Unified Gemini visual strategy
        const prompt = `
    Primary Selling Angle: ${data.angle}
    Core Pain Point: ${data.pain}
    Target Persona: ${data.persona}
    Emotional Driver: ${data.emotion}
    Conversion Goal: ${data.goal}
    Platform: ${data.platform}
    Offer Structure: ${data.offer}
    Brand Tone: ${data.tone}
    `;

        const systemInstruction = `
    You are a senior creative director and performance marketing visual strategist.
    Your task: Transform the existing advertising strategy into high-converting visual concepts.
    You are NOT generating aesthetic images. You are generating conversion-oriented visual storytelling.

    STRUCTURE YOUR RESPONSE AS JSON:
    {
      "intent": "Brief summary of visual intent",
      "concepts": [
        { "description": "Scene description", "angle": "Camera angle", "framing": "Framing", "expression": "Facial expression", "lighting": "Lighting style", "why": "Why it works", "solves": "What it solves" }
      ],
      "storyboard": [
        { "frame": 1, "scene": "Scene", "shot": "Shot type", "movement": "Movement", "text": "On-screen text", "purpose": "Emotional purpose" }
      ],
      "guardrails": ["Guardrail 1", "Guardrail 2"]
    }
    `;

        // PRIMARY: Gemini
        try {
            const result = await executeWithRetry(async (apiKey) => {
                const ai = new GoogleGenAI({ apiKey });
                const res = await ai.models.generateContent({
                    model: SMART_MODEL,
                    contents: prompt,
                    config: {
                        systemInstruction,
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                intent: { type: Type.STRING },
                                concepts: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            description: { type: Type.STRING },
                                            angle: { type: Type.STRING },
                                            framing: { type: Type.STRING },
                                            expression: { type: Type.STRING },
                                            lighting: { type: Type.STRING },
                                            why: { type: Type.STRING },
                                            solves: { type: Type.STRING }
                                        }
                                    }
                                },
                                storyboard: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            frame: { type: Type.INTEGER },
                                            scene: { type: Type.STRING },
                                            shot: { type: Type.STRING },
                                            movement: { type: Type.STRING },
                                            text: { type: Type.STRING },
                                            purpose: { type: Type.STRING }
                                        }
                                    }
                                },
                                guardrails: { type: Type.ARRAY, items: { type: Type.STRING } }
                            },
                            required: ["intent", "concepts", "storyboard", "guardrails"]
                        }
                    }
                });
                return parseRobustJSON(res.text || "{}", { intent: '', concepts: [], storyboard: [], guardrails: [] });
            });
            return result;
        } catch (e) {
            console.error("[AI] generateVisualStrategy failure", e);
            throw e;
        }
    }, { intent: '', concepts: [], storyboard: [], guardrails: [] }));
}

export async function generateFullCampaignVisuals(strategy: string, angles: any[]): Promise<any> {
    return await import('../utils/aiAgent').then(m => m.safeAI(async () => {
        // Unified Gemini campaign visuals
        const prompt = `
    Strategy: ${strategy}
    Angles: ${JSON.stringify(angles)}
    
    Task: Create a full visual and storyboard campaign for each angle.
    For each angle, provide:
    1. A highly detailed AI image generation prompt for the main ad visual.
    CRITICAL INSTRUCTION: EVERY SINGLE visualPrompt MUST BE DRASTICALLY DIFFERENT FROM THE OTHERS. Use completely different locations, color palettes, models, and props, and lighting for EACH angle. If angle 1 is a studio shot, angle 2 must be outdoors, angle 3 must be lifestyle, etc.
    2. A 6-frame storyboard for a video ad.
    
    Output 6 to 8 ad sets.
    `;

        const systemInstruction = `
    You are a world-class Creative Director.
    Transform marketing angles into high-converting visual and video concepts.
    
    STRUCTURE YOUR RESPONSE AS JSON:
    {
      "adSets": [
        {
          "angle": "The original angle headline",
          "visualPrompt": "Detailed AI image prompt (Photorealistic, commercial style)",
          "storyboard": [
            { "frame": 1, "scene": "Description", "text": "Overlay text" }
          ]
        }
      ]
    }
    `;

        // PRIMARY: Gemini
        try {
            return await executeWithRetry(async (apiKey) => {
                const ai = new GoogleGenAI({ apiKey });
                const res = await ai.models.generateContent({
                    model: SMART_MODEL,
                    contents: prompt,
                    config: {
                        systemInstruction,
                        temperature: 0.9,
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                adSets: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            angle: { type: Type.STRING },
                                            visualPrompt: { type: Type.STRING },
                                            storyboard: {
                                                type: Type.ARRAY,
                                                items: {
                                                    type: Type.OBJECT,
                                                    properties: {
                                                        frame: { type: Type.INTEGER },
                                                        scene: { type: Type.STRING },
                                                        text: { type: Type.STRING }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            required: ["adSets"]
                        }
                    }
                });
                return parseRobustJSON(res.text || "{}", { adSets: [] });
            });
        } catch (e) {
            console.error("Gemini Full Campaign failed", e);
        }

        throw new Error("All AI Engines failed for Full Campaign Visuals.");
    }, { adSets: [] }));
}

export async function generatePromptFromText(instructions: string): Promise<string> {
    return askGemini(`Create a detailed professional prompt for an AI image generator from these instructions: ${instructions}.`, "Expert Prompt Engineer");
}

export async function autoFillDynamicVariables(
    productDescription: string,
    styleName: string,
    styleDescription: string,
    requiredVariables: string[]
): Promise<Record<string, string>> {
    const prompt = `
  You are an expert AI Ad Creative Director.
  You are given a product description and a goal to generate the required creative variables for a specific visual template.

  PRODUCT DESCRIPTION:
  ${productDescription}

  TARGET STYLE:
  ${styleName} (${styleDescription})

  REQUIRED VARIABLES TO FILL:
  ${JSON.stringify(requiredVariables)}

  INSTRUCTIONS:
  1. For each required variable, generate a highly descriptive and creative English (or Arabic if explicitly asked by the variable name, e.g., 'Main_Arabic_Headline') value that perfectly fits the Product and the Target Style.
  2. The values should be concise but highly descriptive (e.g., for [Surface_Material] use "polished white marble", for [Color_Theme] use "luxurious gold and deep navy").
  3. Ensure the Arabic text for headlines/CTAs is catchy, marketing-focused, perfectly written in Egyptian Arabic or Modern Standard Arabic depending on context, and WITHOUT any quotes.

  OUTPUT STRICTLY AS JSON in the following format:
  {
    "variable_name_1": "value_1",
    "variable_name_2": "value_2"
  }
  `;

    const systemInstruction = "You are a highly precise Creative Director AI. Output JSON only.";

    try {
        const res = await executeWithRetry(async (apiKey) => {
            const ai = new GoogleGenAI({ apiKey });
            const result = await ai.models.generateContent({
                model: SMART_MODEL,
                contents: prompt,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                }
            });
            const rawText = result.text || "{}";
            const jsonMatch = rawText.match(/```json\s*([\s\S]*?)```/) || rawText.match(/\{[\s\S]*\}/);
            const cleanedText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : rawText;
            return parseRobustJSON(cleanedText, {});
        });
        return res;
    } catch (e) {
        console.error("Failed to auto fill dynamic variables via Gemini", e);
        throw e;
    }
}

import { buildEnrichmentPrompt, buildAdPrompt, EnrichmentResult } from '../features/performance/engine/PromptBuilder';
import { ProductFormData } from '../features/performance/types/ad.types';
import { parseGeminiResponse } from '../features/performance/engine/ResponseAnalyzer';

/**
 * generateAdsWithEnrichment
 * ─────────────────────────
 * بدل call واحدة → callين:
 * Call 1: تحليل المنتج والجمهور والسوق
 * Call 2: توليد الإعلانات بناءً على التحليل
 *
 * النتيجة: إعلانات مخصصة للجمهور الفعلي مش كلام عام
 */
export async function generateAdsWithEnrichment(
    product: ProductFormData,
    onProgress?: (step: string) => void
): Promise<ReturnType<typeof parseGeminiResponse>> {
    return await import('../utils/aiAgent').then(m => m.safeAI(async () => {

        // ── CALL 1: Enrichment ─────────────────────────────────────────────────────
        onProgress?.('جاري تحليل المنتج والسوق...');

        const enrichmentPrompt = buildEnrichmentPrompt(product);

        let enrichmentRaw: string;
        try {
            enrichmentRaw = await askGemini(enrichmentPrompt);
        } catch (e) {
            console.warn('[generateAdsWithEnrichment] Enrichment call failed, using Unified Gemini fallback', e);
            // Fallback: نكمل من غير enrichment لو فشلت
            enrichmentRaw = '{}';
        }

        // Parse الـ enrichment result
        let enrichment: EnrichmentResult;
        try {
            const cleaned = enrichmentRaw
                .replace(/```json/gi, '')
                .replace(/```/g, '')
                .trim();
            enrichment = parseRobustJSON(cleaned, {});
        } catch (e) {
            console.warn('[generateAdsWithEnrichment] Failed to parse enrichment, using defaults', e);
            // Fallback defaults لو فشل الـ parse
            enrichment = {
                targetGender: 'الاثنين',
                ageRange: '20-40',
                lifestyle: 'جمهور مصري عادي',
                topPains: [product.mainPain || 'مشكلة المنتج', 'الألم اليومي', 'الخوف من القرار الغلط'],
                competitorWeakness: 'جودة أقل بسعر أعلى',
                suggestedTone: 'كاجوال',
                bestAngle: 'pain',
                uniqueInsight: 'الجمهور محتاج يشوف نتيجة حقيقية',
                categoryInsights: 'السوق المصري بيشتري بالثقة والتوصية',
                visualStyle: 'lifestyle photography in Egyptian setting'
            };
        }

        // ── CALL 2: Ad Generation ──────────────────────────────────────────────────
        onProgress?.('جاري صياغة الإعلانات الجذابة بناءً على التحليل...');

        const adPrompt = buildAdPrompt(product, enrichment);

        let adRaw: string;
        try {
            adRaw = await askGemini(adPrompt, "You are a senior Meta Ad buyer and copywriter expert in the Egyptian and Gulf markets.");
        } catch (e) {
            adRaw = '[]';
        }
        return parseGeminiResponse(adRaw || '[]');
    }, { ads: [], advancedAnalysis: { market: '', priceSegment: '', awareness: '', usp: '', hooksAnalysis: [] } } as any));
}

// ============================================================================
// ==================== PRO MODE: 6-AGENT PIPELINE ============================
// ============================================================================

export interface AgentProductData {
    name: string;
    description: string;
    price: string;
}

// Agent 1: Market Analyzer
export async function agentMarketAnalyzer(data: AgentProductData): Promise<any> {
    return await import('../utils/aiAgent').then(m => m.safeAI(async () => {
        const prompt = `
    أنت محلل أسواق خبير (Market Analyzer) متخصص في السوق المصري والعربي.
    حلل هذا المنتج بدقة شديدة:
    اسم المنتج: ${data.name}
    الوصف: ${data.description}
    السعر: ${data.price}

    أخرج النتيجة كـ JSON فقط بالصيغة التالية:
    {
      "targetAudience": "وصف دقيق بـ 10 كلمات للجمهور الفعلي",
      "marketAwareness": "cold, warm, or hot",
      "coreDesire": "الرغبة العميقة المدفونة التي يحققها المنتج",
      "biggestPain": "أكبر ألم يهرب منه العميل الآن",
      "marketSophistication": "مدى وعي العميل بالمنتجات المنافسة"
    }
    `;
        const sys = "You are an expert Data Analyst. Output valid JSON only.";
        try {
            const result = await executeWithRetry(async (apiKey) => {
                const ai = new GoogleGenAI({ apiKey });
                const res = await ai.models.generateContent({
                    model: SMART_MODEL,
                    contents: { parts: [{ text: prompt }] },
                    config: {
                        systemInstruction: sys,
                        responseMimeType: "application/json",
                        temperature: 0.5
                    }
                });
                const text = (typeof res.text === 'function') ? await (res as any).text() : (res.text || "");
                if (!text) throw new Error("Empty response");
                return parseRobustJSON(text, {});
            });
            if (result && Object.keys(result).length > 0) return result;
            throw new Error("Invalid format");
        } catch (e) {
            console.warn("Market Analyzer Gemini failed, using Unified Gemini fallback", e);
            const fallback = await askGeminiJSON(prompt, sys);
            if (fallback && Object.keys(fallback).length > 0) return fallback;
            // Final Self-Healing Fallback
            return generateSelfHealingMarketAnalysis(data);
        }
    }, {}));
}

// ============================================================================
// SELF-HEALING: GENERIC FALLBACK CONTENT (If all AI engines fail)
// ============================================================================

function generateSelfHealingMarketAnalysis(data: AgentProductData): any {
    return {
        targetAudience: "جمهور مهتم بالجودة والقيمة مقابل السعر في مصر والخليج",
        marketAwareness: "warm",
        coreDesire: `الحصول على أفضل تجربة مع ${data.name}`,
        biggestPain: "البحث عن منتج موثوق بسعر عادل",
        marketSophistication: "متوسط"
    };
}

function generateSelfHealingAngles(data: AgentProductData): any[] {
    console.warn("[Self-Healing] Generating generic marketing angles due to AI exhaustion.");
    return [
        { id: "pain", title: "زاوية التوفير والذكاء", concept: `كيف يوفر ${data.name} مالك ومجهودك يومياً.` },
        { id: "status", title: "زاوية التميز والشياكة", concept: `الظهور بمظهر جذاب ومختلف مع ${data.name}.` },
        { id: "logic", title: "زاوية الجودة والمقارنة", concept: `لماذا ${data.name} هو الخيار رقم 1 مقارنة بأي بديل.` },
        { id: "urgency", title: "زاوية الفرصة المحدودة", concept: `احصل على ${data.name} الآن قبل نفاذ الكمية أو انتهاء العرض.` },
        { id: "transform", title: "زاوية التحول الفوري", concept: `التغيير الحقيقي الذي ستشعر به بعد امتلاكك لـ ${data.name}.` }
    ];
}

function generateSelfHealingHooks(angle: any): string[] {
    return [
        `أخيراً.. الحل اللي كنت بتدور عليه لـ ${angle.title}`,
        "لو لسه مجربتش ده، فايتك كتير جداً!",
        "اتفرج وشوف الفرق بنفسك في ثواني"
    ];
}

function generateSelfHealingCopy(data: AgentProductData, angle: any): any {
    return {
        adBody: `مستني إيه؟ ${data.name} وصل وبأفضل جودة ممكنة.\n\n${angle.concept}\n\nالحل الأسرع والأذكى لراحتك وشياكتك.\n\nاطلب دلوقتي قبل ما العرض يخلص!`,
        callToAction: "اطلب الآن"
    };
}

function generateSelfHealingVisual(data: AgentProductData, angle: any): any {
    return {
        imagePrompt: `Premium product photography of ${data.name}, cinematic lighting, high resolution, marketing concept for ${angle.title}`,
        selectedStyleName: "Pro Style"
    };
}

// Agent 2: Angle Strategist
export async function agentAngleStrategist(data: AgentProductData, marketAnalysis: any): Promise<any> {
    return await import('../utils/aiAgent').then(m => m.safeAI(async () => {
        const prompt = `
    أنت استراتيجي إعلانات (Angle Strategist).
    بناءً على هذا التحليل للسوق: ${JSON.stringify(marketAnalysis)}
    اعطني 5 زوايا تسويقية (Angles) مختلفة تماماً لبيع: ${data.name} (${data.price})

    أخرج النتيجة كـ JSON Array فقط بالصيغة التالية:
    [
      { "id": "pain", "title": "زاوية الألم والتخلص منه", "concept": "شرح الفكرة في سطر" },
      { "id": "status", "title": "زاوية المكانة والبرستيج", "concept": "شرح الفكرة في سطر" },
      { "id": "logic", "title": "زاوية المقارنة والمنطق", "concept": "شرح الفكرة في سطر" },
      { "id": "urgency", "title": "زاوية العرض والندرة", "concept": "شرح الفكرة في سطر" },
      { "id": "transform", "title": "زاوية التحول والنتيجة", "concept": "شرح الفكرة في سطر" }
    ]
    `;
        const sys = "You are a Master Strategist. Output valid JSON Array only.";
        try {
            const result = await executeWithRetry(async (apiKey) => {
                const ai = new GoogleGenAI({ apiKey });
                const res = await ai.models.generateContent({
                    model: SMART_MODEL,
                    contents: { parts: [{ text: prompt }] },
                    config: { systemInstruction: sys, responseMimeType: "application/json", temperature: 0.6 }
                });
                const text = (typeof res.text === 'function') ? await (res as any).text() : (res.text || "");
                if (!text) throw new Error("Empty response");
                return parseRobustJSON(text, []);
            });
            if (Array.isArray(result) && result.length > 0) return result;
            throw new Error("Invalid format");
        } catch (e) {
            console.warn("Angle Strategist Gemini failed, using Unified Gemini fallback", e);
            const fallback = await askGeminiJSON(prompt, sys);
            if (Array.isArray(fallback) && fallback.length > 0) return fallback;
            // Final Self-Healing Fallback
            return generateSelfHealingAngles(data);
        }
    }, []));
}

// Agent 3: Hook Writer
export async function agentHookWriter(data: AgentProductData, angle: any): Promise<any> {
    return await import('../utils/aiAgent').then(m => m.safeAI(async () => {
        const prompt = `
    أنت صانع هوكات (Hook Writer) خبير في التيك توك وانستجرام ريلز (بالعامية المصرية).
    زاوية الإعلان المطلوبة: ${angle.title} (${angle.concept})
    المنتج: ${data.name}

    اكتب 3 هوكات (Hooks) مختلفة تماماً، تخطف العين من أول ثانية وتجبر العميل يكمل قراية. (10 كلمات كحد أقصى للهوك).
    أخرج النتيجة كـ JSON Array لمصفوفة نصوص فقط:
    ["الهوك الأول هنا...", "الهوك الثاني هنا...", "الهوك الثالث هنا..."]
    `;
        const sys = "You are an expert Copywriter. Output valid JSON Array of strings only.";
        try {
            const result = await executeWithRetry(async (apiKey) => {
                const ai = new GoogleGenAI({ apiKey });
                const res = await ai.models.generateContent({
                    model: SMART_MODEL,
                    contents: { parts: [{ text: prompt }] },
                    config: { systemInstruction: sys, responseMimeType: "application/json", temperature: 0.8 }
                });
                const text = (typeof res.text === 'function') ? await (res as any).text() : (res.text || "");
                return parseRobustJSON(text, []);
            });
            if (Array.isArray(result) && result.length > 0) return result;
            throw new Error("Invalid format");
        } catch (e) {
            console.warn("[AI] Ad generation failed, trying Unified Gemini fallback", e);
            const fallback = await askGeminiJSON(prompt, sys);
            if (Array.isArray(fallback) && fallback.length > 0) return fallback;
            return generateSelfHealingHooks(angle);
        }
    }, []));
}

// Agent 4: Copywriter
export async function agentCopywriter(data: AgentProductData, angle: any, selectedHook: string): Promise<any> {
    return await import('../utils/aiAgent').then(m => m.safeAI(async () => {
        const prompt = `
    أنت كاتب إعلانات محترف (Copywriter) يكتب بالعامية المصرية.
    اكتب لي إعلان كامل ومقنع جداً بناءً على هذه الزاوية: ${angle.title}
    وهذا الهوك الذي اخترناه كبداية للإعلان: "${selectedHook}"
    
    المنتج: ${data.description}
    السعر: ${data.price}

    أخرج النتيجة كـ JSON فقط بالصيغة التالية:
    {
      "adBody": "محتوى الإعلان كاملاً مع الإيموجيز والسطور المنفصلة بدءاً من الهوك وحتى النهاية",
      "callToAction": "زر الشراء القصير (مثال: اطلب دلوقتي والخصم شغال)"
    }
    `;
        const sys = "You are an expert Direct Response Copywriter. Output valid JSON only.";
        try {
            const result = await executeWithRetry(async (apiKey) => {
                const ai = new GoogleGenAI({ apiKey });
                const res = await ai.models.generateContent({
                    model: SMART_MODEL,
                    contents: { parts: [{ text: prompt }] },
                    config: { systemInstruction: sys, responseMimeType: "application/json", temperature: 0.7 }
                });
                const text = (typeof res.text === 'function') ? await (res as any).text() : (res.text || "");
                return parseRobustJSON(text, { adBody: "", callToAction: "" });
            });
            if (result && result.adBody) return result;
            throw new Error("Invalid format");
        } catch (e) {
            console.warn("Copywriter Gemini failed, using Unified Gemini fallback", e);
            const fallback = await askGeminiJSON(prompt, sys);
            if (fallback && fallback.adBody) return fallback;
            return generateSelfHealingCopy(data, angle);
        }
    }, {}));
}

// Agent 5: Visual Director
export async function agentVisualDirector(data: AgentProductData, angle: any): Promise<any> {
    return await import('../utils/aiAgent').then(m => m.safeAI(async () => {
        const prompt = `
    أنت مخرج فني (Visual Director) عبقري لماركات عالمية.
    نصور إعلاناً للمنتج: ${data.description}
    الزاوية التسويقية هي: ${angle.title} (${angle.concept})

    مهمتك اختيار القالب البصري الأنسب من القوالب التالية، ثم تعبئة المتغيرات ببراعة لإنشاء مشهد سينمائي عالي الجودة للمنتج:
    ${JSON.stringify(DYNAMIC_STYLES.map(s => ({ styleName: s.styleName, variables: s.requiredVariables })))}

    🚨 قاعدة هامة لإخراج الصور الاحترافية (خاصة لمنتجات الملابس والفاشون):
    عند إنشاء الـ imagePrompt بالإنجليزية، يجب أن يكون شديد التفصيل (Highly Detailed) ويحتوي على الأقسام التالية لضمان نتيجة مبهرة:
    - Core Item (The product looking premium)
    - Background Props (e.g. stylish street sneakers, steaming coffee, cool sunglasses, urban stickers)
    - Surface Material (e.g. rustic wooden, sleek marble)
    - Atmosphere & Vibe (e.g. warm winter aesthetic, streetwear hype, cyberpunk neon)
    - Lighting (e.g. dramatic lighting, neon glows, soft studio lighting)
    - Camera (e.g. DSLR, 85mm lens, sharp focus, 8k photorealistic)

    أخرج النتيجة كـ JSON فقط بالصيغة التالية:
    {
      "selectedStyleName": "اسم القالب الإنجليزي بالظبط من القائمة",
      "variables": {
        "Variable_1": "تفاصيل إنجليزية معبرة",
        "Variable_2": "تفاصيل إنجليزية معبرة"
      },
      "imagePrompt": "A master prompt entirely in English incorporating all the deep variables mentioned above (Props, Vibe, Material, Lighting, Camera) to create a premium, diverse, and photorealistic editorial scene."
    }
    `;
        const sys = "You are an expert Creative Director. Output valid JSON only.";
        try {
            const result = await executeWithRetry(async (apiKey) => {
                const ai = new GoogleGenAI({ apiKey });
                const res = await ai.models.generateContent({
                    model: SMART_MODEL,
                    contents: { parts: [{ text: prompt }] },
                    config: { systemInstruction: sys, responseMimeType: "application/json", temperature: 0.8 }
                });
                const text = (typeof res.text === 'function') ? await (res as any).text() : (res.text || "");
                return parseRobustJSON(text, { imagePrompt: "", selectedStyleName: "" });
            });
            if (result && result.imagePrompt) return result;
            throw new Error("Invalid format");
        } catch (e) {
            console.warn("Visual Director Gemini failed, using Unified Gemini fallback", e);
            const fallback = await askGeminiJSON(prompt, sys);
            if (fallback && fallback.imagePrompt) return fallback;
            return generateSelfHealingVisual(data, angle);
        }
    }, {}));
}

// Agent 6: Objection Handler
export async function agentObjectionHandler(data: AgentProductData, adBody: string): Promise<any> {
    return await import('../utils/aiAgent').then(m => m.safeAI(async () => {
        const prompt = `
    أنت محامي شيطان (Objection Handler) ومدير خدمة عملاء خبير في السوق العربي.
    اقرأ هذا الإعلان جيداً:
    ${adBody}
    
    المنتج هو: ${data.description} وبسعر ${data.price}

    استخرج أكبر 3 اعتراضات (شكوك أو مخاوف) ستمنع العميل المحتمل من الشراء فوراً بعد قراءة هذا الإعلان. واكتب لكل اعتراض "رد ساحق" لإقناعه وإغلاق البيعة.
    
    أخرج النتيجة كـ JSON Array فقط لهذه الأوبجكتات:
    [
      { "objection": "الاعتراض الأول من وعي العميل", "rebuttal": "الرد الحاسم لخدمة العملاء بالعامية المصرية" },
      { "objection": "...", "rebuttal": "..." }
    ]
    `;
        const sys = "You are an expert Sales Manager. Output valid JSON Array only.";
        try {
            const geminiResult = await executeWithRetry(async (apiKey) => {
                const ai = new GoogleGenAI({ apiKey });
                const res = await ai.models.generateContent({
                    model: SMART_MODEL,
                    contents: { parts: [{ text: prompt }] },
                    config: {
                        systemInstruction: sys,
                        responseMimeType: "application/json",
                        temperature: 0.6
                    }
                });
                const text = (typeof res.text === 'function') ? await (res as any).text() : (res.text || "");
                return parseRobustJSON(text, []);
            });
            return geminiResult;
        } catch (e) {
            console.warn("Objection Handler Gemini failed, using Unified Gemini fallback", e);
            return askGeminiJSON(prompt, sys);
        }
    }, []));
}

// Agent 7: Result Validator (Diversity Enforcement)
export async function agentResultValidator(visualPrompts: any[]): Promise<any[]> {
    const prompt = `
    أنت مدقق جودة بصرخة (Quality Assurance Validator) ومصلح أخطاء عبقري.
    لقد قام فريقنا بتوليد هذه الـ ${visualPrompts.length} توجيهات بصرية (Visual Prompts) لنفس المنتج:
    ${JSON.stringify(visualPrompts, null, 2)}

    مهمتك مزدوجة الآن:
    أولاً: "إصلاح الأخطاء" (Auto-Fixing) 🛠️
    - راجع الـ \`selectedStyleName\` في كل أوبجكت. هل هو اسم حقيقي موجود في النظام؟ استخدم فقط أسماء إنجليزية واضحة وعامة (مثل: Studio Soft Light, Cyberpunk, Cinematic Street, الخ).
    - راجع الـ \`variables\`. هل هناك متغيرات ضرورية ناقصة؟ إذا كانت ناقصة، قم بـ "تأليفها واستنتاجها" فوراً من عندك بالإنجليزية. لا تترك أي متغير فارغ أو تظهر رسالة خطأ.

    ثانياً: "التنوع البصري" (Visual Diversity) 🎨
    - مراجعة الـ imagePrompt لكل عنصر. إذا كانت متشابهة جداً، قم بإعادة كتابتها جذرياً (باللغة الإنجليزية) لضمان أقصى قدر من "التنوع البصري".
    - نريد أن تكون الصور الخمسة مختلفة تماماً في:
      1. Background Props (عناصر الخلفية)
      2. Surface Material (الملمس والأرضية)
      3. Atmosphere & Vibe (الجو العام)
      4. Lighting (الإضاءة)
      5. Camera Angles (زوايا التصوير)

    أخرج النتيجة كـ JSON Array لنفس الأوبجكتات بعد الإصلاح والتعديل:
    [
      {
        "selectedStyleName": "الاسم المصحح",
        "variables": { "متغير_1": "قيمة مصلحة", "متغير_2": "قيمة مستنتجة" },
        "imagePrompt": "A completely REWRITTEN, completely UNIQUE prompt..."
      }
    ]
    `;

    const sys = "You are an expert QA and Prompt Engineer. Output valid JSON Array only.";
    try {
        const geminiResult = await executeWithRetry(async (apiKey) => {
            const ai = new GoogleGenAI({ apiKey });
            const res = await ai.models.generateContent({
                model: SMART_MODEL,
                contents: { parts: [{ text: prompt }] },
                config: {
                    systemInstruction: sys,
                    responseMimeType: "application/json",
                    temperature: 0.5
                }
            });
            const text = res.text || "";
            const result = parseRobustJSON(text, []);
            return Array.isArray(result) ? result : visualPrompts;
        });
        return geminiResult;
    } catch (e) {
        console.warn("Agent 7 Validation Gemini failed, using Unified Gemini fallback", e);
        try {
            const result = await askGeminiJSON(prompt, sys);
            return Array.isArray(result) ? result : visualPrompts;
        } catch (e2) {
            console.error("ALL ENGINES FAILED for Agent 7 Validation", e2);
            return visualPrompts;
        }
    }
}

// ============================================================================
// STANDALONE CREATOR TOOLS (Phase 12)
// ============================================================================

export async function generateStandaloneHooks(productInfo: string): Promise<any> {
    return await import('../utils/aiAgent').then(m => m.safeAI(async () => {
        const prompt = `
    أنت صانع محتوى إعلاني (Hook Generator) عبقري، متخصص في السوق المصري والعربي.
    لديك هذا المنتج أو الفكرة أو رابط صفحة الهبوط:
    ${productInfo}

    مهمتك كتابة 12 هوك (Hook) إعلاني خاطف للأنظار (Scroll-Stopping للفيسبوك وتيك توك وانستجرام) مقسمين إلى 4 فئات:
    1. Pain (ألم العميل ومشاكله)
    2. Desire (رغبات العميل العميقة)
    3. Mystery (غموض وفضول غير متوقع)
    4. Objection (رد على اعتراض صريح وتحدي)

    أخرج النتيجة كـ JSON Object فقط بالصيغة التالية تماماً:
    {
      "hooks": [
        { "category": "Pain", "text": "هوك رقم 1 بالعامية المصرية الجذابة...", "explanation": "ليه الهوك ده قوي وبيشد الانتباه؟" },
        // ... (مجموع 12 هوك, 3 لكل فئة)
      ]
    }
    `;
        const sys = "You are an elite short-form video copywriter. Output valid JSON only.";
        try {
            const geminiResult = await executeWithRetry(async (apiKey) => {
                const ai = new GoogleGenAI({ apiKey });
                const res = await ai.models.generateContent({
                    model: SMART_MODEL,
                    contents: { parts: [{ text: prompt }] },
                    config: {
                        systemInstruction: sys,
                        responseMimeType: "application/json",
                        temperature: 0.7
                    }
                });
                const text = res.text || "";
                return parseRobustJSON(text, { hooks: [] });
            });
            return geminiResult;
        } catch (e) {
            console.error("Standalone Hooks failure", e);
            throw e;
        }
    }, { hooks: [] }));
}

export async function optimizeFailedAd(adCopy: string, productContext?: string): Promise<any> {
    return await import('../utils/aiAgent').then(m => m.safeAI(async () => {
        const prompt = `
    أنت طبيب إعلانات محترف (Ad Doctor) وخبير إعلانات ممولة في السوق المصري والعربي.
    لديك إعلان فاشل لم يحقق مبيعات:
    النص الإعلاني الفاشل:
    "${adCopy}"

    ${productContext ? `معلومات إضافية عن المنتج: ${productContext}` : ''}

    مهمتك:
    1. تشخيص الإعلان بناءً على 4 محاور (الفحص: Creative / Targeting / Landing Page / Offer).
    2. تحديد مستوى الخطورة (Critical / Medium / Low) والسبب الجذري للمشكلة.
    3. كتابة 3 نسخ إعلانية جديدة كلياً (Optimized Variations) مبنية على زوايا نفسية مختلفة لإنقاذ المبيعات.

    أخرج النتيجة كـ JSON Object فقط بالصيغة التالية:
    {
      "diagnosis": "نص التشخيص المفصل بالعامية المصرية",
      "severity": "Critical | Medium | Low",
      "rootCause": "السبب الجذري للمشكلة في جملة واحدة",
      "variations": [
        {
          "strategy": "الاستراتيجية (مثال: اللعب على الألم)",
          "hook": "الجملة الافتتاحية الخاطفة",
          "body": "السطور الإقنااسية بالعامية المصرية",
          "cta": "طلب الشراء القوي"
        }
      ]
    }
    `;
        const sys = "You are a master direct response copywriter and conversion optimization expert. Output valid JSON only.";
        try {
            const geminiResult = await executeWithRetry(async (apiKey) => {
                const ai = new GoogleGenAI({ apiKey });
                const res = await ai.models.generateContent({
                    model: SMART_MODEL,
                    contents: { parts: [{ text: prompt }] },
                    config: {
                        systemInstruction: sys,
                        responseMimeType: "application/json",
                        temperature: 0.6
                    }
                });
                const text = (typeof res.text === 'function') ? await (res as any).text() : (res.text || "");
                return parseRobustJSON(text, {});
            });
            return geminiResult;
        } catch (e) {
            console.error("Optimize Failed Ad failure", e);
            throw e;
        }
    }, {}));
}
