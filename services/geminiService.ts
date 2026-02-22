
import { GoogleGenAI, Modality, Part, Type, Chat } from "@google/genai";
import { ImageFile, PowerStudioResult, AudioFile, TrendItem } from '../types';
import { askPerplexity, askPerplexityJSON } from './perplexityService';

const SMART_MODEL = 'gemini-3-flash-preview'; 

const getApiKey = () => {
    return process.env.API_KEY || process.env.GEMINI_API_KEY || '';
};

const getPerplexityKey = () => {
    return process.env.PERPLEXITY_API_KEY || '';
};

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
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
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

    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const res = await ai.models.generateContent({ model: SMART_MODEL, contents: prompt, config: { systemInstruction: sys } });
    return res.text || "";
}

export async function generateUGCScript(data: any): Promise<string> { return askGemini(`Generate viral UGC script for ${data.productSelling}`, "Expert Content Creator"); }
export async function generateShortFormIdeas(data: any): Promise<string[]> { 
    const res = await askGemini(`Generate 30 short-form ideas for ${data.product}. Output as simple list.`, "Content Strategist");
    return res.split('\n').filter(l => l.trim().length > 0).slice(0, 30);
}
export async function generateFinalContentScript(topic: string, type: string): Promise<string> { return askGemini(`Write a ${type} script for: ${topic}`); }

export async function generateImage(productImages: ImageFile[], prompt: string, styleImages: ImageFile[] | null = null, aspectRatio: string = "1:1"): Promise<ImageFile> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const parts: Part[] = productImages.map(img => ({ inlineData: { data: img.base64, mimeType: img.mimeType } }));
  
  // Apply "Master Prompt" spices and structure
  const enhancedPrompt = `
    ${prompt}
    
    TECHNICAL SPECS: photorealistic, hyperrealistic, 8k resolution, sharp focus, detailed texture, cinematic lighting, DSLR photo, editorial photography, high detail, commercial quality.
    STRICT: PRESERVE all original logos, text, and branding from the product images.
  `.trim();

  parts.push({ text: enhancedPrompt });
  const res = await ai.models.generateContent({ 
    model: 'gemini-2.5-flash-image', 
    contents: { parts }, 
    config: { 
        imageConfig: { 
            aspectRatio: aspectRatio as any 
        } 
    } 
  });
  for (const part of res.candidates?.[0]?.content?.parts || []) { if (part.inlineData) return { base64: part.inlineData.data, mimeType: part.inlineData.mimeType, name: 'img.png' }; }
  throw new Error('Fail');
}

export async function generateCampaignPlan(productImages: ImageFile[], goal: string, market: string, dialect: string): Promise<any[]> {
    const res = await askGemini(`Create 9-day content plan for ${goal} in ${market} with ${dialect}. Return JSON array with {id, tov, caption, schedule, scenario}.`);
    try { return JSON.parse(res.replace(/```json|```/g, '')); } catch { return []; }
}

export async function analyzeProductForCampaign(images: ImageFile[]): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const parts: Part[] = images.map(img => ({ inlineData: { data: img.base64, mimeType: img.mimeType } }));
    parts.push({ text: "Analyze this product for marketing purposes. What is it? What are its strengths?" });
    const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: { parts } });
    return res.text || "";
}

export async function editImage(image: ImageFile, prompt: string): Promise<ImageFile> { return generateImage([image], prompt); }
export async function expandImage(image: ImageFile, prompt: string): Promise<ImageFile> { return generateImage([image], prompt); }
export async function enhancePrompt(prompt: string): Promise<string> { return askGemini(`Enhance this prompt for AI image generation: ${prompt}`); }
export async function analyzeLogoForBranding(logos: ImageFile[]): Promise<{ colors: string[] }> { return { colors: ['#4f46e5', '#0f172a', '#f8fafc'] }; }

export async function generateSpeech(text: string, style: string, voice: string): Promise<AudioFile> {
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
}

export async function runPowerProduction(images: ImageFile[], context: string, m: string, d: string, cb: any): Promise<PowerStudioResult> {
    const visual = await generateImage(images, "High-end commercial photo");
    return { analysis: "Strategic Plan", visualPrompt: "Prompt", fbAds: { primaryText: "Ad Copy", headline: "Headline" }, visual };
}

export async function generateAdScript(p: string, b: string, pr: string, l: string, t: string): Promise<string> { return askGemini(`Write an ad script for ${p}`); }

export async function generateDynamicStoryboard(productImages: ImageFile[], referenceImages: ImageFile[], userInstructions: string): Promise<string[]> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const parts: Part[] = [];
    
    productImages.forEach(img => parts.push({ inlineData: { data: img.base64, mimeType: img.mimeType } }));
    referenceImages.forEach(img => parts.push({ inlineData: { data: img.base64, mimeType: img.mimeType } }));
    
    parts.push({ text: `
        Analyze the PRODUCT in Image 1 and the STYLE/MODEL in Image 2.
        User Instructions: ${userInstructions}
        
        TASK: Generate 9 unique, high-converting, and creative shot descriptions for a professional commercial photoshoot.
        The goal is to show the model from Image 2 wearing the product from Image 1 in various cinematic scenarios.
        
        VARIETY REQUIREMENTS:
        - 2 Catalog shots (Clean, product-focused, studio background).
        - 3 Lifestyle shots (In-use, natural environment, storytelling).
        - 2 Editorial shots (High-fashion, dramatic lighting, artistic pose).
        - 2 Creative shots (Unique perspective, conceptual, eye-catching).
        
        Output exactly 9 lines, each being a detailed description of a shot.
    ` });

    const res = await ai.models.generateContent({
        model: SMART_MODEL,
        contents: { parts },
        config: {
            systemInstruction: "You are a world-class Creative Director and Fashion Photographer. Your goal is to create a diverse and powerful 9-shot storyboard using the 'Master Prompt' framework to sell a product effectively."
        }
    });

    return (res.text || "").split('\n').filter(l => l.trim().length > 0).slice(0, 9);
}
export async function generateMarketingAnalysis(d: any, l: string): Promise<string> { return "Market Analysis Result"; }
export async function generateStoryboardPlan(i: any, ins: string): Promise<any[]> { return []; }
export async function animateImageToVideo(i: any, p: string, a: string, cb: any): Promise<string> { return ""; }
export async function fetchCurrentTrends(r: string, n: string): Promise<TrendItem[]> { return []; }
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
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const parts: Part[] = images.map(img => ({ inlineData: { data: img.base64, mimeType: img.mimeType } }));
    parts.push({ text: `Create a highly detailed, professional AI image generation prompt based on these images and instructions: ${instructions}` });
    const res = await ai.models.generateContent({ model: SMART_MODEL, contents: { parts } });
    return res.text || "";
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

    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    const parts: Part[] = [];
    if (data.referenceImage) {
        parts.push({ inlineData: { data: data.referenceImage.base64, mimeType: data.referenceImage.mimeType } });
    }

    const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [...parts, { text: prompt }] },
        config: {
            systemInstruction,
            responseMimeType: "application/json",
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
        return JSON.parse(res.text || "{}");
    } catch {
        throw new Error("فشل تحليل استجابة المحرك النخبة");
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

    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
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

    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
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
}

export async function generatePromptFromText(instructions: string): Promise<string> {
    return askGemini(`Create a detailed professional prompt for an AI image generator from these instructions: ${instructions}.`, "Expert Prompt Engineer");
}
