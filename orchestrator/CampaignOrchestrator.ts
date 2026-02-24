import { ProductIntelligenceData } from '../context/ProductIntelligenceContext';
import {
    generatePerformanceAdPack,
    askGemini,
    generateStoryboardPlan,
    fetchCurrentTrends
} from '../services/geminiService';

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
     * Run the Market Intelligence phase.
     * Auto-routes to Trend Engine + Strategy Analysis based on context.
     */
    static async runMarketIntelligence(context: ProductIntelligenceData): Promise<OrchestrationResult> {
        try {
            // Run BOTH in parallel: product analysis (primary) + trends (secondary)
            const [productAnalysis, trends] = await Promise.allSettled([
                // PRIMARY: Deep structured product analysis based on user inputs
                askGemini(
                    `أنت خبير تسويق متخصص في الأسواق العربية. قم بتحليل هذا المنتج بعمق:

المنتج: ${context.productName}
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
                // SECONDARY: Fetch live trends (don't block if it fails)
                fetchCurrentTrends(context.targetMarket, context.productName)
            ]);

            // Parse product analysis
            let parsedAnalysis: any = null;
            if (productAnalysis.status === 'fulfilled') {
                try {
                    const cleaned = productAnalysis.value.replace(/```json|```/g, '').trim();
                    parsedAnalysis = JSON.parse(cleaned);
                } catch {
                    // If JSON parsing fails, use raw text
                    parsedAnalysis = { summary: productAnalysis.value };
                }
            }

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
                let pack: any[] = [];
                try {
                    pack = JSON.parse(contentText.replace(/```json|```/g, '').trim());
                } catch {
                    // Fallback: split into text blocks
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

                // ── 2. SHOT LIST: Technical directions (not story scenes) ─────────
                askGemini(
                    `أنت مخرج فيديو محترف متخصص في إعلانات الريلز العمودية (9:16) للأسواق العربية.

اكتب قائمة لقطات تقنية (Shot List) لإعلان ريلز عن:
المنتج: ${product}
الزاوية: ${angle}
المدة الكلية: 30-45 ثانية

أعطني JSON array بالضبط (8-10 لقطات):
[
  {
    "shotNumber": 1,
    "duration": "3 ثواني",
    "shotType": "Close-up / Wide / Medium / Macro / Over-shoulder",
    "action": "وصف دقيق لما يحدث في اللقطة من زاوية المخرج",
    "textOnScreen": "النص أو التايتل اللي يظهر على الشاشة (فاضي لو مفيش)",
    "technicalNote": "ملاحظة تقنية: الإضاءة، اللون، السرعة، التأثير"
  }
]

JSON فقط بدون markdown.`,
                    'أنت مخرج فيديو محترف متخصص في إعلانات رقمية للأسواق العربية.'
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
}
