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
                // Route to Content/Brand Engine (formerly Plan Studio / Daily Pack)
                const prompt = `Generate a 7-day social media content pack for ${context.productName}. Description: ${context.productDescription}. Dialect: ${context.dialect}. Focus on brand awareness.`;
                const contentText = await askGemini(prompt, "You are a Social Media Content Strategist.");
                const pack = contentText.split('\n\n').filter(p => p.trim().length > 10).slice(0, 7);
                return { success: true, data: { strategy: 'content', pack } };
            }
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    /**
     * Run the Creative Studio phase.
     * Auto-routes to Storyboard or UGC Engine.
     */
    static async generateCreatives(context: ProductIntelligenceData, angle: string): Promise<OrchestrationResult> {
        try {
            // Feed the winning angle into the Storyboard Director automatically
            const prompt = `Product: ${context.productName}. Angle: ${angle}. Create a detailed video storyboard.`;
            const storyboard = await generateStoryboardPlan([], prompt);

            return {
                success: true,
                data: { storyboard }
            };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
}
