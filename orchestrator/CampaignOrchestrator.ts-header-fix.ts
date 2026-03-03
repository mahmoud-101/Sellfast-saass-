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

export type OrchestrationMode = 'Quick' | 'Advanced' | 'Full';

export interface OrchestrationResult {
    success: boolean;
    message?: string;
    data?: any;
}
