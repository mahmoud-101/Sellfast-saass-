
/**
 * Perplexity AI Service
 * OpenAI-compatible API for text generation and reasoning.
 */
import { ENV } from '../utils/env';
import { parseRobustJSON } from '../utils/safeJson';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

export async function askPerplexity(prompt: string, systemInstruction?: string, model: string = 'sonar', temperature: number = 0.2): Promise<string> {
    const apiKey = ENV.PERPLEXITY_API_KEY;
    if (!apiKey) {
        console.warn('[Perplexity] API key missing — will fallback to Gemini');
        throw new Error('PERPLEXITY_SKIP');
    }

    const messages = [];
    if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    try {
        const response = await fetch(PERPLEXITY_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model,
                messages,
                temperature,
                top_p: 0.9,
                return_images: false,
                return_related_questions: false,
                stream: false
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Perplexity API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || '';
    } catch (error: any) {
        console.warn('[Perplexity] Service error (will fallback to Gemini):', error?.message || error);
        throw error;
    }
}

/**
 * Helper for structured JSON output — uses centralized parseRobustJSON
 */
export async function askPerplexityJSON(prompt: string, systemInstruction?: string, model: string = 'sonar', temperature: number = 0.2): Promise<any> {
    const fullPrompt = `${prompt}\n\nIMPORTANT: Your response MUST be valid JSON only. Do not include any markdown formatting or extra text.`;
    const response = await askPerplexity(fullPrompt, systemInstruction, model, temperature);
    return parseRobustJSON(response, {});
}
