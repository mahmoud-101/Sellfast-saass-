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
            // 1. Fetch live trends for the target niche and market
            const trends = await fetchCurrentTrends(context.targetMarket, context.productName);

            // 2. Perform deep category analysis (mimicking classic Marketing Studio / Strategy Engine)
            const analysisPrompt = `Product: ${context.productName}\nDescription: ${context.productDescription}\nMarket: ${context.targetMarket}\n\nProvide a deep marketing analysis including target audience, positioning, and 3 key USP angles.`;
            const categoryAnalysis = await askGemini(analysisPrompt, "You are a Senior Product Marketing Analyst.");

            return {
                success: true,
                data: {
                    trends,
                    categoryAnalysis
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
