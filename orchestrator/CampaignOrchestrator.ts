import { ProductIntelligenceData } from '../context/ProductIntelligenceContext';
import {
    generatePerformanceAdPack,
    askGemini,
    generateStoryboardPlan,
    fetchCurrentTrends,
    generateImage
} from '../services/geminiService';
import { askPerplexityJSON } from '../services/perplexityService';
import { getCinematicMotionPrompt, runGrokStrategy } from '../services/xaiService';
import { AD_FRAMEWORKS, SWIPE_FILE, HOOK_LIBRARY, CTA_LIBRARY } from '../lib/adFrameworks';
import { runHookScoringEngine } from '../features/performance/optimization/HookScoringEngine';
import { predictCTR, getPerformanceLabel } from '../features/performance/engine/ScoringPredictor';
import { buildTestingSuggestion } from '../features/performance/engine/TestingSuggestionBuilder';

export type OrchestrationMode = 'Quick' | 'Advanced' | 'Full';

export interface OrchestrationResult {
    success: boolean;
    message?: string;
    data?: any;
}

/**
 * The Campaign Orchestrator acts as the middle layer between the User Interfaces (Hubs)
 * and the raw AI Engines (geminiService). 
 * 
 * It takes the global ProduceIntelligenceContext and decides exactly which internal tools 
 * to string together to achieve the user's objective without requiring them to know 
 * about "Power Studio" or "Performance Pack".
 */
export class CampaignOrchestrator {

    /**
     * Resiliently parse JSON from AI responses.
     * Handles markdown blocks, trailing text, and malformed syntax.
     */
    static safeJsonParse(input: string, fallback: any = null): any {
        if (!input) return fallback;
        try {
            // 1. Try direct parse
            return JSON.parse(input.trim());
        } catch {
            try {
                // 2. Extract content between first [ or { and last ] or }
                const jsonMatch = input.match(/[\{\[].*[\}\]]/s);
                if (jsonMatch) {
                    const cleaned = jsonMatch[0].replace(/```json|```/g, '').trim();
                    return JSON.parse(cleaned);
                }
            } catch {
                // 3. Last ditch: clean common characters and retry
                try {
                    const superCleaned = input.replace(/```json|```/g, '').trim();
                    return JSON.parse(superCleaned);
                } catch {
                    console.warn('[Orchestrator] Failed to parse AI JSON:', input);
                    return fallback;
                }
            }
        }
        return fallback;
    }

    /**
     * Run the Market Intelligence phase.
     * Auto-routes to Trend Engine + Strategy Analysis based on context.
     */
    static async runMarketIntelligence(context: ProductIntelligenceData): Promise<OrchestrationResult> {
        try {
            // Run BOTH in parallel: product analysis (primary) + Real-time trends (Perplexity)
            const [productAnalysis, trends] = await Promise.allSettled([
                // PRIMARY: Deep structured product analysis based on user inputs
                askGemini(
                    `أنت خبير تسويق متخصص في الأسواق العربية. قم بتحليل هذا المنتج بعمق:

المنتج: ${context.productName}
السعر: ${context.sellingPrice}
الجمهور المستهدف: ${context.targetAudienceInput}
الوصف: ${context.productDescription}
السوق المستهدف: ${context.targetMarket}
اللهجة: ${context.dialect}

أرجع JSON بالشكل التالي بالضبط (بالعربية):
{
  "targetAudience": "وصف دقيق للعميل المثالي (العمر، الاهتمامات، الألم، الرغبة)",
  "positioning": "كيف يتميز المنتج ويُوضَع في السوق",
  "mainUSP": "أقوى نقطة بيع فريدة واحدة للمنتج",
  "advantages": ["ميزة 1", "ميزة 2", "ميزة 3"],
  "pricingStrategy": "استراتيجية التسعير المقترحة",
  "salesAngles": ["زاوية بيعية 1", "زاوية بيعية 2", "زاوية بيعية 3"],
  "suggestedHook": "جملة افتتاحية مقترحة لإعلان فيديو بالعامية",
  "summary": "ملخص تحليلي شامل في 3-4 جمل"
}

JSON فقط بدون markdown.`,
                    "أنت محلل تسويق متمرس متخصص في منتجات التجارة الإلكترونية العربية."
                ),
                // SECONDARY: Fetch REAL-TIME trends using Perplexity
                askPerplexityJSON(
                    `What are the currently trending marketing topics and hashtags on social media for ${context.productName} in the ${context.targetMarket} market? 
                    Return an array of objects: [{"name": "trend name", "relevance": "why it matters", "hashtags": ["#h1", "#h2"]}]`,
                    "You are a real-time market research expert."
                )
            ]);

            // Resilient Parsing
            let parsedAnalysis: any = this.safeJsonParse(
                productAnalysis.status === 'fulfilled' ? productAnalysis.value : '',
                { summary: 'حدث خطأ أثناء التحليل. يرجى المحاولة مرة أخرى.' }
            );

            const trendData = trends.status === 'fulfilled' ? trends.value : [];

            return {
                success: true,
                data: {
                    productAnalysis: parsedAnalysis,
                    categoryAnalysis: parsedAnalysis?.summary || '',
                    trends: trendData
                }
            };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    /**
     * Run the Campaign Builder phase.
     * Auto-routes to Performance Studio or Power Studio based on the goal.
     */
    static async buildCampaign(context: ProductIntelligenceData, mode: OrchestrationMode): Promise<OrchestrationResult> {
        try {
            if (context.campaignGoal === 'المبيعات والتحويلات' || context.campaignGoal === 'Sales') {
                // Route to Performance Engine (formerly Performance Studio)
                const pack = await generatePerformanceAdPack({
                    productDescription: context.productDescription,
                    targetMarket: context.targetMarket,
                    campaignGoal: context.campaignGoal,
                    platform: 'Facebook/TikTok',
                    dialect: context.dialect,
                    brandTone: 'Direct Response',
                    sellingPrice: 'N/A'
                });
                return { success: true, data: { strategy: 'performance', pack } };
            } else {
                // Route to Content/Brand Engine — 7-day Arabic social plan
                const contentPrompt = `أنت مخطط محتوى رقمي محترف متخصص في الأسواق العربية.

اكتب خطة محتوى ٧ أيام بـ${context.dialect || 'اللهجة المصرية'} للمنتج التالي:
المنتج: ${context.productName}
الوصف: ${context.productDescription}
السوق: ${context.targetMarket}

أعطني JSON array بالضبط (٧ أيام):
[
  {
    "day": "اليوم الأول",
    "goal": "هدف البوست (جذب الانتباه / إثبات الفائدة / دليل اجتماعي / الإلحاح / إلخ)",
    "platform": "أنسب منصة",
    "hook": "جملة الجذب (Hook) — أول سطر يوقف المستخدم",
    "body": "نص البوست الكامل بالعامية (عفوي، إنساني، غير رسمي، 60-120 كلمة)",
    "cta": "الدعوة للتصرف",
    "hashtags": ["وسم1", "وسم2", "وسم3"]
  }
]

JSON فقط بدون markdown.`;
                const contentText = await askGemini(contentPrompt, 'أنت مخطط محتوى محترف للسوشيال ميديا العربية.');
                let pack = this.safeJsonParse(contentText, []);
                if (!Array.isArray(pack) || pack.length === 0) {
                    // Fallback to text blocks if parsing fails
                    pack = contentText.split('\n\n').filter(p => p.trim().length > 10).slice(0, 7).map((p, i) => ({
                        day: `اليوم ${i + 1}`,
                        body: p.trim()
                    }));
                }
                return { success: true, data: { strategy: 'content', pack } };
            }
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    /**
     * Run the Creative Studio phase.
     * Returns: reelsScript (full voiceover text) + shots (technical shot list)
     */
    static async generateCreatives(context: ProductIntelligenceData, angle: string): Promise<OrchestrationResult> {
        try {
            const dialect = context.dialect || 'اللهجة المصرية';
            const product = context.productName || 'المنتج';
            const desc = context.productDescription || '';

            const [scriptResult, shotsResult] = await Promise.allSettled([

                // ── 1. REELS SCRIPT: Full spoken voiceover text ──────────────────
                askGemini(
                    `أنت كاتب سكريبت محترف متخصص في إعلانات الريلز والتيك توك بالأسواق العربية.

اكتب سكريبت ريلز إعلاني كامل بـ${dialect} للمنتج التالي:
المنتج: ${product}
الوصف: ${desc}
الزاوية البيعية: ${angle}

يجب أن يكون السكريبت:
- مدته: 30-45 ثانية (60-90 كلمة تقريباً)
- يبدأ بجملة Hook قوية تشد الانتباه في أول 3 ثواني
- يُحدد مشكلة حقيقية يعانيها الجمهور
- يقدم المنتج كالحل الأمثل بطريقة عفوية وغير مباشرة
- يتضمن دليل اجتماعي مختصر (رقم أو شهادة)
- ينتهي بـ CTA واضح وعاجل
- الأسلوب: عفوي، محادثاتي، يشبه كلام الناس الحقيقي — مش إعلان رسمي
- اكتبه كنص متصل (سكريبت صوتي) بدون ترقيم أو نقاط

أعطني النص السكريبت فقط بدون شرح.`,
                    'أنت كاتب سكريبت محترف لإعلانات السوشيال ميديا العربية.'
                ),

                // ── 2. SHOT LIST: Technical directions with CINEMATIC motion (X.ai) ─────────
                askGemini(
                    `أنت مخرج فيديو محترف متخصص في إعلانات الريلز العمودية (9:16) للأسواق العربية.
اكتب قائمة لقطات تقنية (Shot List) لمنتج: ${product} بالزاوية: ${angle}.

أعطني JSON array بالضبط (8-10 لقطات):
[
  {
    "shotNumber": 1,
    "duration": "3 ثواني",
    "shotType": "Z-Axis Zoom / Pan / Dolly / Crane",
    "action": "وصف دقيق لما يحدث",
    "textOnScreen": "Text",
    "technicalNote": "Cinematic AI motion prompt (English)",
    "motionPrompt": "Elite cine-prompt"
  }
]`,
                    'أنت مخرج فيديو محترف يستخدم تقنيات التصوير السينمائي.'
                )
            ]);

            let reelsScript = '';
            if (scriptResult.status === 'fulfilled') {
                reelsScript = scriptResult.value.trim();
            }

            let shots: any[] = [];
            if (shotsResult.status === 'fulfilled') {
                try {
                    shots = JSON.parse(shotsResult.value.replace(/```json|```/g, '').trim());
                } catch {
                    shots = [];
                }
            }

            return {
                success: true,
                data: { reelsScript, shots }
            };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    /**
     * Run ALL Campaign Builder tools in parallel.
     * Returns: performanceAds + ugcScript + viralHooks + salesAngles
     */
    static async runAllCampaignTools(context: ProductIntelligenceData): Promise<OrchestrationResult> {
        const p = context.productName || 'المنتج';
        const d = context.productDescription || '';
        const m = context.targetMarket || 'السوق العربي';
        const dial = context.dialect || 'اللهجة المصرية';
        const angle = context.selectedAngle || p;

        const [adsR, ugcR, hooksR, anglesR] = await Promise.allSettled([

            // 1. نصوص إعلانات مباشرة
            askGemini(
                `أنت كاتب إعلانات Direct Response للأسواق العربية. اكتب 3 إعلانات مختلفة بـ${dial} لـ: ${p}. ${d}. السوق: ${m}. الزاوية: ${angle}.
استخدم نماذج الكتابة التالية للإلهام:
${AD_FRAMEWORKS.slice(0, 3).map(f => `- ${f.name}: ${f.structure}`).join('\n')}

أمثلة من الـ Swipe File:
${[...SWIPE_FILE.ecommerce, ...SWIPE_FILE.agency].slice(0, 2).map(s => `- ${s.title}: ${s.copy.slice(0, 50)}...`).join('\n')}

أعطني JSON array: [{"headline":"عنوان جذاب","body":"نص الإعلان 50-80 كلمة بالعامية","cta":"دعوة للشراء","format":"Facebook/TikTok"}] JSON فقط.`,
                'أنت خبير إعلانات مباشرة للأسواق العربية.'
            ),

            // 2. سكريبت UGC
            askGemini(
                `اكتب سكريبت UGC بـ${dial} (شخص يتكلم للكاميرا مباشرة) لمنتج: ${p}. ${d}. الزاوية: ${angle}.
أسلوب سيلفي، عفوي، صادق. 30-45 ثانية. نص صوتي متصل فقط.`,
                'أنت كاتب UGC محترف للسوشيال ميديا العربية.'
            ),

            // 3. 10 خطافات فيرال
            askGemini(
                `اكتب 10 hooks فيرال بـ${dial} لمنتج: ${p}. ${d}. تنوع: سؤال/صدمة/فضول/ألم/وعد.
استلهم من مكتبة الهوكات:
${HOOK_LIBRARY.text.slice(0, 5).map(h => `- ${h.text}`).join('\n')}

JSON array: [{"hook":"الجملة","type":"نوع","why":"لماذا يوقف التمرير"}] JSON فقط.`,
                'أنت خبير Viral Hooks للأسواق العربية.'
            ),

            // 4. زوايا تسويقية
            askGemini(
                `أعطني 6 زوايا تسويقية مبتكرة بالعربية لمنتج: ${p}. ${d}. السوق: ${m}.
JSON array: [{"angle":"الاسم","concept":"الفكرة","exampleHook":"مثال hook","targetEmotion":"المشاعر"}] JSON فقط.`,
                'أنت استراتيجي تسويق محترف للأسواق العربية.'
            ),
        ]);

        const parseJ = (r: PromiseSettledResult<string>, fallback: any = null) => {
            if (r.status !== 'fulfilled') return fallback;
            return this.safeJsonParse(r.value, fallback);
        };

        const parsedHooks = parseJ(hooksR, []).map((h: any) => {
            if (h.hook) {
                const analysis = runHookScoringEngine(h.hook, m.includes('مصر') || dial.includes('مصر') ? 'egypt' : 'gulf');
                return { ...h, hook: analysis.finalHook, score: analysis.score.total, originalHook: h.hook, isEnhanced: analysis.score.wasEnhanced };
            }
            return h;
        });

        const parsedAds = parseJ(adsR, []).map((ad: any) => {
            if (ad.headline && ad.body) {
                const ctr = predictCTR({
                    headlineLength: ad.headline?.length || 50,
                    hasNumber: /\d/.test(ad.headline || ''),
                    hasEmoji: /[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(ad.headline || ''),
                    hasQuestion: (ad.headline || '').includes('؟') || (ad.headline || '').includes('?'),
                    urgencyLevel: (ad.body || '').includes('الآن') || (ad.body || '').includes('محدود') ? 3 : 1,
                    imageType: 'product',
                    colorContrast: 0.8,
                    textToImageRatio: 0.1,
                    ctaClarity: ad.cta ? 0.9 : 0.5
                });
                const perf = getPerformanceLabel(ctr);
                const marketParam = m.includes('مصر') || dial.includes('مصر') ? 'egypt' : 'gulf';
                const testing = buildTestingSuggestion({ type: 'pain', name: 'Pain Angle', description: '' } as any, { market: marketParam, productCategory: p } as any);
                return { ...ad, expectedCTR: ctr, performanceLabel: perf.label, testingSuggestion: testing, performanceColor: perf.color };
            }
            return ad;
        });

        return {
            success: true,
            data: {
                performanceAds: parsedAds,
                ugcScript: ugcR.status === 'fulfilled' ? ugcR.value.trim() : null,
                viralHooks: parsedHooks,
                salesAngles: parseJ(anglesR, []),
            }
        };
    }

    /**
     * Run ALL Creative Studio tools in parallel.
     * Returns: reelsScript + shots + ugcScript + photoshootBrief
     */
    static async runAllCreativeTools(context: ProductIntelligenceData, angle: string): Promise<OrchestrationResult> {
        const p = context.productName || 'المنتج';
        const d = context.productDescription || '';
        const dial = context.dialect || 'اللهجة المصرية';

        const [scriptR, shotsR, ugcR, photoR] = await Promise.allSettled([

            // 1. سكريبت ريلز
            askGemini(
                `اكتب سكريبت ريلز كامل بـ${dial} للمنتج: ${p} بالزاوية: ${angle}. 30-45 ثانية، Hook قوي، ينتهي بـ CTA.
استخدم نموذج (HSO) أو (AIDA) في بناء السكريبت.
استلهم من هوكات الفيديو الناجحة:
${HOOK_LIBRARY.video.slice(0, 3).map(h => h.text).join(' | ')}

نص متصل فقط.`,
                'أنت كاتب سكريبت ريلز للأسواق العربية.'
            ),

            // 2. قائمة لقطات تقنية
            askGemini(
                `اكتب shot list تقني لريلز 9:16 للمنتج: ${p} بالزاوية: ${angle}. 8-10 لقطات.
JSON array: [{"shotNumber":1,"duration":"3ث","shotType":"Close-up","action":"وصف","textOnScreen":"تايتل","technicalNote":"ملاحظة"}] JSON فقط.`,
                'أنت مخرج فيديو محترف.'
            ),

            // 3. سكريبت UGC مرئي
            askGemini(
                `اكتب سكريبت UGC بـ${dial} (شخص حقيقي يتكلم للكاميرا) للمنتج: ${p}. ${d}. الزاوية: ${angle}. عفوي، صادق، 30-45 ثانية.`,
                'أنت كاتب UGC محترف.'
            ),

            // 4. بريف التصوير الاحترافي
            askGemini(
                `اكتب بريف تصوير منتج احترافي بالعربية للمنتج: ${p}. ${d}. الزاوية: ${angle}.
JSON: {"concept":"الفكرة البصرية","backgrounds":["خلفية 1","خلفية 2","خلفية 3"],"props":["إكسسوار 1","إكسسوار 2"],"shots":[{"name":"اسم","setup":"إعداد","mood":"مزاج"}],"colors":"لوحة الألوان","lighting":"نوع الإضاءة"} JSON فقط.`,
                'أنت مدير إبداعي لتصوير منتجات e-commerce.'
            ),
        ]);

        const parseJ = (r: PromiseSettledResult<string>, fallback: any = null) => {
            if (r.status !== 'fulfilled') return fallback;
            return this.safeJsonParse(r.value, fallback);
        };

        let shots: any[] = parseJ(shotsR, []);

        // --- NEW: Generate AI Visuals for the Creative Suite ---
        const productImages = context.productImages || [];

        // 1. Generate images for the first 3 key shots in the storyboard
        const shotsWithImages = await Promise.all(shots.map(async (shot, idx) => {
            if (idx < 3 && productImages.length > 0) {
                try {
                    const img = await generateImage(productImages, `Video Shot #${shot.shotNumber}: ${shot.action}. Cinematic lighting, professional ${shot.shotType} camera angle. 8k resolution, photorealistic.`, null, "9:16");
                    return { ...shot, imageUrl: `data:${img.mimeType};base64,${img.base64}` };
                } catch (e) { return { ...shot, imageUrl: null }; }
            }
            return { ...shot, imageUrl: null };
        }));

        // 2. Generate a "Master Concept" image for the photoshoot
        let photoshootWithImage = parseJ(photoR, { concept: 'لم يتم توليد بريف.', backgrounds: [], props: [], shots: [], colors: '', lighting: '' });
        if (photoshootWithImage && productImages.length > 0) {
            try {
                const img = await generateImage(productImages, `Professional Product Photoshoot: ${photoshootWithImage.concept}. Lighting: ${photoshootWithImage.lighting}. Colors: ${photoshootWithImage.colors}. High-end commercial photography, 8k.`, null, "1:1");
                photoshootWithImage.conceptImageUrl = `data:${img.mimeType};base64,${img.base64}`;
            } catch (e) { photoshootWithImage.conceptImageUrl = null; }
        }

        return {
            success: true,
            data: {
                reelsScript: scriptR.status === 'fulfilled' ? scriptR.value.trim() : '',
                shots: shotsWithImages,
                ugcScript: ugcR.status === 'fulfilled' ? ugcR.value.trim() : '',
                photoshootBrief: photoshootWithImage,
            }
        };
    }

    /**
     * Run the Launch Strategy phase (Perplexity + Grok + Gemini).
     * Returns: Targeting suggestions, captions, and platform-specific metadata.
     */
    static async runLaunchBrief(context: ProductIntelligenceData): Promise<OrchestrationResult> {
        try {
            const [realTimeTargeting, strategyGrok] = await Promise.allSettled([
                // 1. Perplexity: Live targeting interests
                askPerplexityJSON(
                    `Find current high-interest targeting groups on Meta and TikTok Ads for ${context.productName} in ${context.targetMarket}. 
                    Suggest specific interest keywords, behaviors, and demographics. 
                    Format: {"meta": {"interests": []}, "tiktok": {"interests": []}}`,
                    "You are a performance marketing researcher."
                ),
                // 2. Grok: Strategic depth
                runGrokStrategy(context.productDescription, context.targetMarket, context.dialect)
            ]);

            const targeting = realTimeTargeting.status === 'fulfilled' ? realTimeTargeting.value : {};
            const strategicDepth = strategyGrok.status === 'fulfilled' ? strategyGrok.value : {};

            // 3. Gemini: Finalize captions based on above info
            const captions = await askGemini(
                `Create 3 high-converting captions for Instagram/TikTok for this product: ${context.productName}. 
                Dialect: ${context.dialect}. 
                Use these targeting insights: ${JSON.stringify(targeting)}.
                JSON array: [{"platform": "Instagram", "text": "...", "hashtags": []}]`,
                "You are an expert Arabic social media copywriter."
            );

            return {
                success: true,
                data: {
                    targeting,
                    strategicDepth,
                    launchCaptions: this.safeJsonParse(captions, [])
                }
            };
        } catch (e: any) {
            return { success: false, message: e.message };
        }
    }

    /**
     * Generate a detailed 5-stage campaign workflow.
     */
    static async generateCampaignWorkflow(product: string, goal: string, dialect: string) {
        const prompt = `
            أنت Strategist Campaign متخصص في الماركتنج للسوق العربي.
            مهمتك عمل خطة إطلاق حملة إعلانية كاملة للمنتج: ${product} والهدف: ${goal}.
            
            الخطة يجب أن تتبع 5 مراحل صارمة:
            1. التأسيس (Foundation): Pixel, Landing Page, Trust Signals.
            2. الاختبار (Testing): CBO/ABO, Ad Sets, Broad vs Interests.
            3. التحليل (Analysis): Kill Rules, Retention KPIs.
            4. التحسين (Optimization): Scaling winners, refreshing creative.
            5. التوسع (Scaling): Vertical and Horizontal scaling.

            لكل خطوة اكتب: الأكشن المطلوب، الوقت المتوقع، الخطأ الشائع، والـ KPI.
            اللغة: ${dialect}.
            أخرج النتيجة كـ JSON Array لكل مرحلة.
        `;

        const res = await askGemini(prompt, "You are a Senior Campaign Strategist.");
    }

    /**
     * Generate a 3-2-1 Launch Strategy (3 Angles x 3 Audiences = 9 Test Sets).
     */
    static async generateLaunch321(product: string, goal: string, dialect: string) {
        const prompt = `
            أنت Senior Media Buyer متخصص في استراتيجية الـ 3-2-1.
            الهدف: إطلاق حملة اختبار سريعة للمنتج: ${product} والهدف: ${goal}.
            
            الخطة الإجبارية:
            - 3 زوايا إعلانية: (Pain Point, Social Proof, Story/Narrative).
            - 3 جماهير: (Broad, Interest-based, Lookalike).
            - المجموع: 9 Ad Sets متميزة.
            
            لكل Ad Set حدد: الجمهور الدقيق، الزاوية المستخدمة، والميزانية المقترحة (CBO vs ABO).
            اللغة: ${dialect}.
            أخرج النتيجة كـ JSON Array.
        `;
        const res = await askGemini(prompt, "You are a Media Buying Expert.");
        return this.safeJsonParse(res, []);
    }

    /**
     * Generate a 4-stage Retargeting Ladder.
     */
    static async generateRetargetingLadder(product: string, dialect: string) {
        const prompt = `
            أنت متخصص Retargeting للسوق العربي.
            صمم سلم إعادة الاستهداف (Retargeting Ladder) لمنتج: ${product}.
            
            المراحل الأربعة:
            1. الوعي (Cold): المحتوى التعليمي.
            2. الاهتمام (Warm): إثبات اجتماعي (Testimonials).
            3. الرغبة (Hot): عرض لفترة محدودة + إلحاح.
            4. الولاء (Customers): Upsell / Cross-sell.

            لكل مرحلة حدد: المحتوى المخصص، نسبة الميزانية (Targeting Budget %)، والهدف (CPA vs ROAS).
            اللغة: ${dialect}.
            أخرج النتيجة كـ JSON Array.
        `;
        const res = await askGemini(prompt, "You are a Retargeting Expert.");
        return this.safeJsonParse(res, []);
    }

    /**
     * Funnel Architect Hub: Generate specialized funnels.
     */
    static async generateSpecializedFunnel(product: string, type: 'webinar' | 'quiz' | 'challenge' | 'free_tool', dialect: string) {
        const prompt = `
            أنت Funnel Architect متخصص في نوع: ${type}.
            صمم قمع مبيعات (Sales Funnel) كامل للمنتج: ${product}.
            
            المراحل المطلوبة:
            - الإعلان (Ad): الزاوية والـ Hook.
            - صفحة الهبوط (Landing Page): النقاط الأساسية.
            - المتابعة (Email/WhatsApp Sequence): 5 أيام.
            - العرض النهائي (Offer): الـ Stack Offer القاتل.

            اللغة: ${dialect}.
            أخرج النتيجة كـ JSON Object مفصل.
        `;
        const res = await askGemini(prompt, "You are a Funnel Scientist.");
        return this.safeJsonParse(res, {});
    }
}
