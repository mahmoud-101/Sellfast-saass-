
/**
 * Perplexity AI Service
 * OpenAI-compatible API for text generation and reasoning.
 */

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

const getApiKey = () => {
    return process.env.PERPLEXITY_API_KEY || '';
};

export async function askPerplexity(prompt: string, systemInstruction?: string, model: string = 'sonar'): Promise<string> {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('PERPLEXITY_API_KEY is missing in environment variables.');
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
                temperature: 0.2,
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
        console.error('Perplexity Service Error:', error);
        throw error;
    }
}

/**
 * Helper for structured JSON output
 */
export async function askPerplexityJSON(prompt: string, systemInstruction?: string, model: string = 'sonar'): Promise<any> {
    const fullPrompt = `${prompt}\n\nIMPORTANT: Your response MUST be valid JSON only. Do not include any markdown formatting or extra text.`;
    const response = await askPerplexity(fullPrompt, systemInstruction, model);

    try {
        // Clean markdown if present
        let cleanJson = response.trim();
        cleanJson = cleanJson.replace(/```json/gi, '');
        cleanJson = cleanJson.replace(/```/g, '');
        return JSON.parse(cleanJson.trim());
    } catch (error) {
        console.warn('Failed to parse Perplexity JSON response:', response);
        throw new Error('Failed to parse structured response from Perplexity.');
    }
}
