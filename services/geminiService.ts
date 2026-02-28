
import { GoogleGenAI, Modality, Part, Type, Chat } from "@google/genai";
import { ImageFile, PowerStudioResult, AudioFile, TrendItem } from '../types';
import { askPerplexity, askPerplexityJSON } from './perplexityService';
import { DYNAMIC_STYLES } from '../lib/dynamicTemplates';
import { awardPoints } from '../lib/supabase';

const SMART_MODEL = 'gemini-2.5-flash';

/**
 * Key Rotation: Supports multiple comma-separated keys. 
 * Randomly picks one per request to multiply rate limits.
 */
const getApiKey = () => {
    let rawKeys = '';
    try { rawKeys = (import.meta as any).env.VITE_GEMINI_API_KEY || (import.meta as any).env.VITE_API_KEY || ''; } catch (e) { }
    if (!rawKeys) {
        try { rawKeys = process.env.GEMINI_API_KEY || process.env.API_KEY || ''; } catch (e) { }
    }
    const keys = rawKeys.split(',').map((k: any) => k.trim()).filter((k: any) => k.length > 0);
    if (keys.length === 0) return '';
    return keys[Math.floor(Math.random() * keys.length)];
};

const getPerplexityKey = () => {
    let pKey = '';
    try { pKey = (import.meta as any).env.VITE_PERPLEXITY_API_KEY || ''; } catch (e) { }
    if (!pKey) { try { pKey = process.env.PERPLEXITY_API_KEY || ''; } catch (e) { } }
    return pKey;
};

/**
 * OpenRouter Key: Loaded from environment variables for security.
 * Set OPENROUTER_API_KEY or VITE_OPENROUTER_API_KEY in Vercel env vars.
 */
const getOpenRouterKey = () => {
    let key = '';
    try { key = (import.meta as any).env.VITE_OPENROUTER_API_KEY || ''; } catch (e) { }
    if (!key) { try { key = process.env.OPENROUTER_API_KEY || ''; } catch (e) { } }
    return key;
};

/**
 * OpenRouter Fallback: Uses OpenRouter API (OpenAI-compatible) as a powerful fallback
 * when Gemini hits rate limits. Supports all models via a single paid key.
 */
async function askOpenRouter(prompt: string, sys?: string): Promise<string> {
    const messages: any[] = [];
    if (sys) messages.push({ role: 'system', content: sys });
    messages.push({ role: 'user', content: prompt });

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getOpenRouterKey()}`,
            'HTTP-Referer': 'https://sellfast-saass-8qqf.vercel.app',
            'X-Title': 'Ebdaa Pro'
        },
        body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages,
            temperature: 0.7,
            max_tokens: 2048
        })
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`OpenRouter error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
}

export function parseRobustJSON(text: string): any {
    if (!text) return {};
    let clean = text.trim();
    clean = clean.replace(/```json/gi, '');
    clean = clean.replace(/```/g, '');

    try {
        return JSON.parse(clean.trim());
    } catch (e) {
        // Fallback: try to match a JSON array or object block
        const match = clean.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
        if (match) {
            try { return JSON.parse(match[0]); } catch { }
        }
        console.warn("Failed to parse JSON, returning raw string to avoid crash:", clean);
        throw e;
    }
}

async function askOpenRouterJSON(prompt: string, sys?: string): Promise<any> {
    return executeWithRetry(async () => {
        const text = await askOpenRouter(prompt, sys);
        return parseRobustJSON(text);
    });
}

/**
 * Anti-Rate Limit & Timeout Wrapper
 * Automatically retries failed Gemini requests with exponential backoff to ensure "infinite" feeling
 */
async function executeWithRetry<T>(operation: () => Promise<T>, maxRetries = 4): Promise<T> {
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            return await operation();
        } catch (error: any) {
            attempt++;
            const msg = error?.message?.toLowerCase() || "";
            // 429: Rate Limit, 503: Timeout, fetch failed: network drop, syntaxerror: json mapping
            if (msg.includes("429") || msg.includes("503") || msg.includes("500") || msg.includes("timeout") || msg.includes("fetch failed") || msg.includes("quota") || msg.includes("overloaded") || msg.includes("json") || msg.includes("syntax")) {
                if (attempt >= maxRetries) throw error;
                const delayMs = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                console.warn(`[AI Engine] Server busy or Data error (Attempt ${attempt}/${maxRetries}). Retrying in ${Math.round(delayMs)}ms... Error: ${msg.slice(0, 50)}`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
            } else {
                throw error;
            }
        }
    }
    throw new Error("Failed after maximum auto-retries.");
}

export function createEliteAdChat(mode: string): any {
    const pKey = getPerplexityKey();
    if (pKey) {
        let history: any[] = [];
        return {
            sendMessage: async (req: { message: string }) => {
                const sys = `أنت الآن محرك "إبداع برو" للذكاء الاصطناعي الاستراتيجي.
                مهمتك: قيادة المستخدم عبر 9 مراحل لبناء سكريبت إعلاني فيرال (Viral) يحقق مبيعات حقيقية.
                
                قواعد اللغة:
                - تحدث فقط بالعامية المصرية الطبيعية (Egyptian Colloquial Arabic).
                - ممنوع تماماً استخدام اللغة العربية الفصحى أو المصطلحات الروبوتية.
                - ممنوع استخدام اللغة الإنجليزية إلا في الضرورة القصوى.
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
                9. السكريبت النهائي: صياغة السكريبت الاحترافي.
                
                في كل رسالة، اطلب من المستخدم معلومة واحدة فقط بوضوح.
                بعد انتهاء المرحلة الثامنة، قم بصياغة السكريبت النهائي كاملاً في المرحلة التاسعة.`;

                history.push({ role: 'user', content: req.message });
                const prompt = history.map(m => `${m.role}: ${m.content}`).join('\n');
                const text = await askPerplexity(prompt, sys);
                history.push({ role: 'assistant', content: text });

                return { text };
            }
        };
    }

    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const sys = `أنت الآن محرك "إبداع برو" للذكاء الاصطناعي الاستراتيجي.
    مهمتك: قيادة المستخدم عبر 9 مراحل لبناء سكريبت إعلاني فيرال (Viral) يحقق مبيعات حقيقية.
    
    قواعد اللغة:
    - تحدث فقط بالعامية المصرية الطبيعية (Egyptian Colloquial Arabic).
    - ممنوع تماماً استخدام اللغة العربية الفصحى أو مصطلحات الروبوتية.
    - ممنوع استخدام اللغة الإنجليزية إلا في الضرورة القصوى.
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
    9. السكريبت النهائي: صياغة السكريبت الاحترافي.
    
    في كل رسالة، اطلب من المستخدم معلومة واحدة فقط بوضوح.
    بعد انتهاء المرحلة الثامنة، قم بصياغة السكريبت النهائي كاملاً في المرحلة التاسعة.`;

    return ai.chats.create({
        model: SMART_MODEL,
        config: {
            systemInstruction: sys,
            thinkingConfig: { thinkingBudget: 0 }
        }
    });
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

export async function askGemini(prompt: string, sys?: string): Promise<string> {
    const pKey = getPerplexityKey();
    if (pKey) {
        try {
            return await askPerplexity(prompt, sys);
        } catch (e) {
            console.warn("Perplexity failed, falling back to Gemini", e);
        }
    }

    try {
        return await executeWithRetry(async () => {
            // Get fresh key on every retry
            const ai = new GoogleGenAI({ apiKey: getApiKey() });
            const res = await ai.models.generateContent({
                model: SMART_MODEL,
                contents: prompt,
                config: {
                    systemInstruction: sys,
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                    topK: 40
                }
            });
            return res.text || "";
        });
    } catch (e) {
        console.warn("[AI Engine] Gemini exhausted, falling back to OpenRouter...", e);
        return await askOpenRouter(prompt, sys);
    }
}

export async function generateUGCScript(data: any): Promise<string> { return askGemini(`Generate viral UGC script for ${data.productSelling}`, "Expert Content Creator"); }
export async function generateShortFormIdeas(data: any): Promise<string[]> {
    const res = await askGemini(`Generate 30 short-form ideas for ${data.product}. Output as simple list.`, "Content Strategist");
    return res.split('\n').filter(l => l.trim().length > 0).slice(0, 30);
}
export async function generateFinalContentScript(topic: string, type: string): Promise<string> { return askGemini(`Write a ${type} script for: ${topic}`); }

export async function generateImage(productImages: ImageFile[], prompt: string, styleImages: ImageFile[] | null = null, aspectRatio: string = "1:1"): Promise<ImageFile> {
    const parts: Part[] = productImages.map(img => ({ inlineData: { data: img.base64, mimeType: img.mimeType } }));

    if (styleImages && styleImages.length > 0) {
        styleImages.forEach(img => parts.push({ inlineData: { data: img.base64, mimeType: img.mimeType } }));
    }

    const enhancedPrompt = `
    [Variation Seed: ${Math.random().toString(36).substring(2, 10)}]
    ${prompt}
    
    TECHNICAL ADDITIONS:
    - TARGET ASPECT RATIO: ${aspectRatio}
    - photorealistic, hyperrealistic, 8k resolution, sharp focus, detailed texture, cinematic lighting, DSLR photo, editorial photography, high detail, commercial quality.
    
    STRICT INSTRUCTIONS: 
    1. Place the provided product in a completely NEW environment and background according to the prompt. 
    2. DO NOT return the exact original image. You MUST generate a new background/composition.
    3. Keep the product's original details, logos, and text intact, but integrate it seamlessly into the new scene.
  `.trim();

    parts.push({ text: enhancedPrompt });

    return executeWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const res = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts },
            config: {
                // @ts-ignore
                responseModalities: ["IMAGE"],
            }
        });
        for (const part of res.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) return { base64: part.inlineData.data, mimeType: part.inlineData.mimeType || 'image/png', name: 'img.png' };
        }
        throw new Error('No image returned from Gemini');
    });
}

export async function generateCampaignPlan(productImages: ImageFile[], goal: string, market: string, dialect: string): Promise<any[]> {
    const res = await askGemini(`Create 9-day content plan for ${goal} in ${market} with ${dialect}. Return JSON array with {id, tov, caption, schedule, scenario}.`);
    try {
        const plan = JSON.parse(res.replace(/```json|```/g, ''));
        // Award points for planning
        if ((import.meta as any).env.VITE_USER_ID) {
            await awardPoints((import.meta as any).env.VITE_USER_ID, 40, "تصميم خطة حملة كاملة");
        }
        return plan;
    } catch { return []; }
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
      "visualPrompt": "Detailed AI image generation prompt for this day",
      "script": "If type is video, provide a 30s script, else null"
    }

    Respond ONLY with the JSON array.
    `;

    const res = await askGemini(prompt, "Senior Social Media Strategist");
    try {
        const plan = parseRobustJSON(res);
        if ((import.meta as any).env.VITE_USER_ID) {
            await awardPoints((import.meta as any).env.VITE_USER_ID, 100, "برمجة خطة محتوى 7 أيام");
        }
        return plan;
    } catch { return []; }
}

export async function analyzeProductForCampaign(images: ImageFile[]): Promise<string> {
    try {
        return await executeWithRetry(async () => {
            const ai = new GoogleGenAI({ apiKey: getApiKey() });
            const parts: Part[] = images.map(img => ({ inlineData: { data: img.base64, mimeType: img.mimeType } }));
            parts.push({ text: "Analyze this product for marketing purposes. What is it? What are its strengths?" });
            const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts } });
            return res.text || "";
        });
    } catch (e) {
        console.warn("[AI] analyzeProductForCampaign falling back to OpenRouter", e);
        return await askOpenRouter("Analyze this product for marketing purposes. What is it? What are its strengths? Describe it in detail.");
    }
}

export async function editImage(image: ImageFile, prompt: string): Promise<ImageFile> { return generateImage([image], prompt); }
export async function expandImage(image: ImageFile, prompt: string): Promise<ImageFile> { return generateImage([image], prompt); }
export async function enhancePrompt(prompt: string): Promise<string> { return askGemini(`Enhance this prompt for AI image generation: ${prompt}`); }
export async function analyzeLogoForBranding(logos: ImageFile[]): Promise<{ colors: string[] }> { return { colors: ['#4f46e5', '#0f172a', '#f8fafc'] }; }

export async function generateSpeech(text: string, style: string, voice: string): Promise<AudioFile> {
    return executeWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const res = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } }
            }
        });
        return { base64: res.candidates?.[0]?.content?.parts[0]?.inlineData?.data || '', name: 'v.pcm' };
    });
}

export async function runPowerProduction(images: ImageFile[], context: string, m: string, d: string, cb: any): Promise<PowerStudioResult> {
    const visual = await generateImage(images, "High-end commercial photo");
    return { analysis: "Strategic Plan", visualPrompt: "Prompt", fbAds: { primaryText: "Ad Copy", headline: "Headline" }, visual };
}

export async function generateAdScript(p: string, b: string, pr: string, l: string, t: string): Promise<string> { return askGemini(`Write an ad script for ${p}`); }

export async function generateDynamicStoryboard(productImages: ImageFile[], referenceImages: ImageFile[], userInstructions: string): Promise<string[]> {
    try {
        return await executeWithRetry(async () => {
            const ai = new GoogleGenAI({ apiKey: getApiKey() });
            const parts: Part[] = [];
            productImages.forEach(img => parts.push({ inlineData: { data: img.base64, mimeType: img.mimeType } }));
            referenceImages.forEach(img => parts.push({ inlineData: { data: img.base64, mimeType: img.mimeType } }));
            parts.push({ text: `Analyze the PRODUCT and STYLE images. User Instructions: ${userInstructions}. Generate 9 unique shot descriptions for a professional commercial photoshoot. Include 2 Catalog, 3 Lifestyle, 2 Editorial, 2 Creative shots. Output exactly 9 lines.` });
            const res = await ai.models.generateContent({ model: SMART_MODEL, contents: { parts }, config: { systemInstruction: "You are a world-class Creative Director and Fashion Photographer." } });
            return (res.text || "").split('\n').filter(l => l.trim().length > 0).slice(0, 9);
        });
    } catch (e) {
        console.warn("[AI] generateDynamicStoryboard falling back to OpenRouter", e);
        const text = await askOpenRouter(`Generate 9 unique shot descriptions for a commercial photoshoot. User instructions: ${userInstructions}. Include 2 Catalog, 3 Lifestyle, 2 Editorial, 2 Creative shots. Output exactly 9 lines.`, "You are a world-class Creative Director.");
        return text.split('\n').filter(l => l.trim().length > 0).slice(0, 9);
    }
}
export async function generateMarketingAnalysis(d: any, l: string): Promise<string> {
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
5. Action plan for first 30 days`, "You are a Senior Marketing Strategist specialized in the Arabic/MENA market.");
}
export async function generateStoryboardPlan(i: any, ins: string): Promise<any[]> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    const parts: Part[] = [];
    if (i && i.length > 0) {
        i.forEach((img: any) => parts.push({ inlineData: { data: img.base64, mimeType: img.mimeType } }));
    }

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

    Then generate a structured output containing:

    PERSONA:
    Create a realistic persona aligned with the audience archetype.
    Include name, age, personality, speaking style, and filming location.
    Persona must feel culturally authentic to the selected dialect.

    VIDEO STRUCTURE (Exactly 6 shots):

    Shot 1–2: High-impact scroll-stopping hook. Use pattern interrupt or strong emotional trigger. Must match funnel stage.
    Shot 3–4: Demonstrate product in action. Show transformation, usage, or result. Visually reinforce benefits instead of listing features.
    Shot 5: Social proof or credibility reinforcement. Could be testimonial-style delivery, comparison, or before/after logic.
    Shot 6: Strong call-to-action aligned with funnel stage. Include urgency or incentive if appropriate.

    DIALOGUE RULES:
    - Must sound natural in the selected dialect (Arabic).
    - Avoid robotic tone.
    - Avoid corporate language.
    - Keep sentences short and spoken-friendly.
    - Designed for 9:16 vertical consumption.

    VISUAL RULES:
    - Cinematic but realistic.
    - Designed for mobile-first viewing.
    - Emotionally aligned with the chosen angle.

    IMPORTANT: This is a sales video, not a film school project. Every shot must serve conversion.
    `;

    parts.push({ text: promptText });

    try {
        return await executeWithRetry(async () => {
            const ai = new GoogleGenAI({ apiKey: getApiKey() });
            const res = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
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
            try {
                const plan = JSON.parse(res.text || "[]");
                if (plan.length > 0 && (import.meta as any).env.VITE_USER_ID) {
                    await awardPoints((import.meta as any).env.VITE_USER_ID, 30, "صناعة سكريبت إعلاني احترافي");
                }
                return plan;
            } catch {
                return [];
            }
        });
    } catch (e) {
        console.warn("[AI] generateStoryboardPlan falling back to OpenRouter", e);
        const text = await askOpenRouter(promptText + "\n\nReturn ONLY a JSON array of 6 objects with: id, description, visualPrompt, cameraAngle, dialogue. JSON only, no markdown.", "You are an Elite Performance Creative Director for short-form vertical ads.");
        try {
            return JSON.parse(text.replace(/```json|```/g, '').trim());
        } catch { return []; }
    }
}
export async function animateImageToVideo(i: any, p: string, a: string, cb: any): Promise<string> { return ""; }
export async function fetchCurrentTrends(r: string, n: string): Promise<TrendItem[]> {
    try {
        const res = await askOpenRouter(`You are a social media trends analyst. Find the TOP 10 current viral trends in region: ${r}, niche: ${n}.

Return ONLY a valid JSON array with this exact format:
[{"topic":"Trend name in Arabic","relevance":"Why this matters for the niche (in Arabic)","contentIdea":"A specific content idea to capitalize on this trend (in Arabic)","viralHook":"A scroll-stopping hook line in Arabic"}]

Return exactly 10 items. JSON only, no markdown, no code blocks.`, "You are a viral trends analyst for Arabic social media markets. Always respond in Arabic.");
        try {
            const cleaned = res.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            if (Array.isArray(parsed) && parsed.length > 0 && (import.meta as any).env.VITE_USER_ID) {
                await awardPoints((import.meta as any).env.VITE_USER_ID, 20, "تحليل التريندات العالمية");
            }
            return Array.isArray(parsed) ? parsed : [];
        } catch { return []; }
    } catch { return []; }
}
export async function transformScriptToUGC(originalScript: string): Promise<string> { return askGemini(`Transform this to raw UGC script: ${originalScript}`); }

export async function generateSocialContentPack(script: string): Promise<string[]> {
    const res = await askGemini(`Based on this strategy script: ${script}, generate 9 unique social media posts (Facebook/Instagram). Each post should have a hook, body, and CTA. Output as a numbered list.`, "Social Media Strategist");
    return res.split(/\d+\./).filter(l => l.trim().length > 0).slice(0, 9);
}

export async function generateReelsProductionScript(script: string): Promise<string> {
    return askGemini(`Based on this strategy script: ${script}, write a detailed 30-60 second Reels production script with visual cues and voiceover.`, "Video Creative Director");
}

export async function generateImagePromptsFromStrategy(script: string): Promise<string[]> {
    const res = await askGemini(`Based on this strategy script: ${script}, generate 3 highly detailed AI image generation prompts for ad visuals. Output as a numbered list.`, "Creative Director");
    return res.split(/\d+\./).filter(l => l.trim().length > 0).slice(0, 3);
}

export async function analyzeImageForPrompt(images: ImageFile[], instructions: string): Promise<string> {
    try {
        return await executeWithRetry(async () => {
            const ai = new GoogleGenAI({ apiKey: getApiKey() });
            const parts: Part[] = images.map(img => ({ inlineData: { data: img.base64, mimeType: img.mimeType } }));
            parts.push({ text: `Create a highly detailed, professional AI image generation prompt based on these images and instructions: ${instructions}` });
            const res = await ai.models.generateContent({ model: SMART_MODEL, contents: { parts } });
            return res.text || "";
        });
    } catch (e) {
        console.warn("[AI] analyzeImageForPrompt falling back to OpenRouter", e);
        return await askOpenRouter(`Create a highly detailed, professional AI image generation prompt based on these instructions: ${instructions}`);
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
    const pKey = getPerplexityKey();

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

    if (pKey) {
        try {
            return await askPerplexityJSON(prompt, systemInstruction);
        } catch (e) {
            console.warn("Perplexity JSON failed, falling back to Gemini", e);
        }
    }

    const parts: Part[] = [];
    if (data.referenceImage) {
        parts.push({ inlineData: { data: data.referenceImage.base64, mimeType: data.referenceImage.mimeType } });
    }

    try {
        return await executeWithRetry(async () => {
            const ai = new GoogleGenAI({ apiKey: getApiKey() });
            const res = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [...parts, { text: prompt }] },
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    temperature: 0.5,
                    topK: 40,
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            strategicIntelligence: {
                                type: Type.OBJECT,
                                properties: {
                                    productType: { type: Type.STRING, description: "Impulse / Considered / Premium / Routine" },
                                    riskLevel: { type: Type.STRING },
                                    emotionalDriver: { type: Type.STRING, description: "Pain / Desire / Status / Fear / Convenience" },
                                    archetype: { type: Type.STRING },
                                    psychologicalTrigger: { type: Type.STRING },
                                    biggestObjection: { type: Type.STRING }
                                }
                            },
                            creativeStrategyMatrix: {
                                type: Type.OBJECT,
                                properties: {
                                    angles: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                title: { type: Type.STRING },
                                                trigger: { type: Type.STRING },
                                                principle: { type: Type.STRING },
                                                marketReason: { type: Type.STRING },
                                                objectionNeutralizer: { type: Type.STRING },
                                                rank: { type: Type.INTEGER },
                                                isRecommended: { type: Type.BOOLEAN }
                                            }
                                        }
                                    },
                                    recommendationReason: { type: Type.STRING, description: "Max 3 lines why this angle was chosen" }
                                }
                            },
                            launchPack: {
                                type: Type.OBJECT,
                                properties: {
                                    hooks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "5 Scroll-Stopping Hooks" },
                                    adCopy: { type: Type.STRING, description: "High-Converting Direct Response Ad" },
                                    ugcScript: { type: Type.STRING, description: "Hook -> Problem -> Demo -> Emotion -> CTA" },
                                    offerStructure: { type: Type.STRING },
                                    upsellSuggestion: { type: Type.STRING },
                                    cta: { type: Type.STRING },
                                    testingHooks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 Hook Variations for Testing" }
                                }
                            },
                            visualMatchingEngine: {
                                type: Type.OBJECT,
                                properties: {
                                    imageConcepts: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                description: { type: Type.STRING },
                                                angle: { type: Type.STRING },
                                                emotion: { type: Type.STRING },
                                                lighting: { type: Type.STRING },
                                                why: { type: Type.STRING }
                                            }
                                        }
                                    },
                                    thumbnailConcept: { type: Type.STRING },
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
                                    }
                                }
                            },
                            profitBrain: {
                                type: Type.OBJECT,
                                properties: {
                                    valueStacking: { type: Type.STRING },
                                    aovIncrease: { type: Type.STRING },
                                    scarcityUrgency: { type: Type.STRING },
                                    riskReversal: { type: Type.STRING }
                                }
                            },
                            performanceSimulation: {
                                type: Type.OBJECT,
                                properties: {
                                    hookStrength: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                                    conversionConfidence: { type: Type.INTEGER, description: "1-10" },
                                    riskLevel: { type: Type.STRING },
                                    testingStructure: { type: Type.STRING }
                                }
                            }
                        },
                        required: [
                            "strategicIntelligence", "creativeStrategyMatrix", "launchPack",
                            "visualMatchingEngine", "profitBrain", "performanceSimulation"
                        ]
                    }
                }
            });

            try {
                const result = JSON.parse(res.text || "{}");
                if (result.strategicIntelligence && (import.meta as any).env.VITE_USER_ID) {
                    await awardPoints((import.meta as any).env.VITE_USER_ID, 50, "تحليل استراتيجي متكامل");
                }
                return result;
            } catch {
                throw new Error("فشل تحليل استجابة المحرك النخبة");
            }
        });
    } catch (e) {
        console.warn("[AI] generatePerformanceAdPack falling back to OpenRouter", e);
        return await askOpenRouterJSON(prompt, systemInstruction);
    }
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
    const pKey = getPerplexityKey();
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

    if (pKey) {
        try {
            return await askPerplexityJSON(prompt, systemInstruction);
        } catch (e) {
            console.warn("Perplexity Visual Strategy failed, falling back to Gemini", e);
        }
    }

    try {
        return await executeWithRetry(async () => {
            const ai = new GoogleGenAI({ apiKey: getApiKey() });
            const res = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
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
            try {
                return JSON.parse(res.text || "{}");
            } catch {
                throw new Error("فشل تحليل استجابة المحرك البصري");
            }
        });
    } catch (e) {
        console.warn("[AI] generateVisualStrategy falling back to OpenRouter", e);
        return await askOpenRouterJSON(prompt, systemInstruction);
    }
}

export async function generateFullCampaignVisuals(strategy: string, angles: any[]): Promise<any> {
    const pKey = getPerplexityKey();
    const prompt = `
    Strategy: ${strategy}
    Angles: ${JSON.stringify(angles)}
    
    Task: Create a full visual and storyboard campaign for each angle.
    For each angle, provide:
    1. A highly detailed AI image generation prompt for the main ad visual.
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

    if (pKey) {
        try {
            return await askPerplexityJSON(prompt, systemInstruction);
        } catch (e) {
            console.warn("Perplexity Full Campaign failed, falling back to Gemini", e);
        }
    }

    try {
        return await executeWithRetry(async () => {
            const ai = new GoogleGenAI({ apiKey: getApiKey() });
            const res = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    systemInstruction,
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
            try {
                return JSON.parse(res.text || "{}");
            } catch {
                throw new Error("فشل توليد الحملة البصرية");
            }
        });
    } catch (e) {
        console.warn("[AI] generateFullCampaignVisuals falling back to OpenRouter", e);
        return await askOpenRouterJSON(prompt, systemInstruction);
    }
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
        const res = await executeWithRetry(async () => {
            const ai = new GoogleGenAI({ apiKey: getApiKey() });
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                }
            });
            const rawText = result.text || "{}";
            const jsonMatch = rawText.match(/```json\s*([\s\S]*?)```/) || rawText.match(/\{[\s\S]*\}/);
            const cleanedText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : rawText;
            return JSON.parse(cleanedText);
        });
        return res;
    } catch (e) {
        console.warn("Failed to auto fill dynamic variables via Gemini, falling back to OpenRouter", e);
        return await askOpenRouterJSON(prompt, systemInstruction);
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

    // ── CALL 1: Enrichment ─────────────────────────────────────────────────────
    onProgress?.('جاري تحليل المنتج والسوق...');

    const enrichmentPrompt = buildEnrichmentPrompt(product);

    let enrichmentRaw: string;
    try {
        enrichmentRaw = await askGemini(enrichmentPrompt);
    } catch (e) {
        console.warn('[generateAdsWithEnrichment] Enrichment call failed, using fallback', e);
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
        enrichment = JSON.parse(cleaned);
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
        throw new Error('فشل توليد الإعلانات — حاول تاني');
    }

    // Parse وارجع النتيجة
    return parseGeminiResponse(adRaw);
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
    return askOpenRouterJSON(prompt, "You are an expert Data Analyst. Output valid JSON only.");
}

// Agent 2: Angle Strategist
export async function agentAngleStrategist(data: AgentProductData, marketAnalysis: any): Promise<any> {
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
    return askOpenRouterJSON(prompt, "You are a Master Strategist. Output valid JSON Array only.");
}

// Agent 3: Hook Writer
export async function agentHookWriter(data: AgentProductData, angle: any): Promise<any> {
    const prompt = `
    أنت صانع هوكات (Hook Writer) خبير في التيك توك وانستجرام ريلز (بالعامية المصرية).
    زاوية الإعلان المطلوبة: ${angle.title} (${angle.concept})
    المنتج: ${data.name}

    اكتب 3 هوكات (Hooks) مختلفة تماماً، تخطف العين من أول ثانية وتجبر العميل يكمل قراية. (10 كلمات كحد أقصى للهوك).
    أخرج النتيجة كـ JSON Array لمصفوفة نصوص فقط:
    ["الهوك الأول هنا...", "الهوك الثاني هنا...", "الهوك الثالث هنا..."]
    `;
    return askOpenRouterJSON(prompt, "You are an expert Copywriter. Output valid JSON Array of strings only.");
}

// Agent 4: Copywriter
export async function agentCopywriter(data: AgentProductData, angle: any, selectedHook: string): Promise<any> {
    const prompt = `
    أنت كاتب إعلانات محترف (Copywriter) يكتب بالعامية المصرية.
    اكتب لي إعلان كامل ومقنع جداً بناءً على هذه الزاوية: ${angle.title}
    وهذا الهوك الذي اخترناه كبداية للإعلان: "${selectedHook}"
    
    المنتج: ${data.description}
    السعر: ${data.price}

    قواعد الكتابة الاحترافية (خاصة للملابس والفاشون):
    - استخدم لغة عامية مصرية، جمل قصيرة، وإيقاع سريع يلمس قلب العميل.
    - اكتب كوبي يصف "الخامة، التفاصيل، الشياكة، وكيف سيشعر العميل عند ارتدائه".
    - استخدم إيموجيز احترافية في مكانها المناسب بدون مبالغة.
    - اذكر السعر أو العرض بطريقة ذكية تزيد من الـ AOV (مثل عرض الصحاب، وفر فلوسك).
    - اجعل الإعلان مقسماً لفقرات مريحة للعين.

    أخرج النتيجة كـ JSON فقط بالصيغة التالية:
    {
      "adBody": "محتوى الإعلان كاملاً مع الإيموجيز والسطور المنفصلة بدءاً من الهوك وحتى النهاية",
      "callToAction": "زر الشراء القصير (مثال: اطلب دلوقتي والخصم شغال)"
    }
    `;
    return askOpenRouterJSON(prompt, "You are an expert Direct Response Copywriter. Output valid JSON only.");
}

// Agent 5: Visual Director
export async function agentVisualDirector(data: AgentProductData, angle: any): Promise<any> {
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
    return askOpenRouterJSON(prompt, "You are an expert Creative Director. Output valid JSON only.");
}

// Agent 6: Objection Handler
export async function agentObjectionHandler(data: AgentProductData, adBody: string): Promise<any> {
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
    return askOpenRouterJSON(prompt, "You are an expert Sales Manager. Output valid JSON Array only.");
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

    try {
        const result = await askOpenRouterJSON(prompt, "You are an expert QA and Prompt Engineer. Output valid JSON Array only.");
        return Array.isArray(result) ? result : visualPrompts;
    } catch (e) {
        console.warn("Agent 7 Validation failed, returning original prompts to avoid breaking the UI.");
        return visualPrompts;
    }
}

// ============================================================================
// STANDALONE CREATOR TOOLS (Phase 12)
// ============================================================================

export async function generateStandaloneHooks(productInfo: string): Promise<any> {
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
        // ... (مجموع 12 هوك، 3 لكل فئة)
      ]
    }
    `;
    return askOpenRouterJSON(prompt, "You are an elite short-form video copywriter. Output valid JSON only.");
}

export async function optimizeFailedAd(adCopy: string, productContext?: string): Promise<any> {
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
    return askOpenRouterJSON(prompt, "You are a master direct response copywriter and conversion optimization expert. Output valid JSON only.");
}
