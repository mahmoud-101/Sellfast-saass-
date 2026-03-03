const { GoogleGenAI, Type } = require('@google/genai');

const SMART_MODEL = 'gemini-3-flash-preview';

const getApiKey = () => {
    const rawKeys = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
    const keys = rawKeys.split(',').map(k => k.trim()).filter(k => k.length > 0);
    if (keys.length === 0) return '';
    return keys[Math.floor(Math.random() * keys.length)];
};

async function executeWithRetry(operation, maxRetries = 4) {
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            return await operation();
        } catch (error) {
            attempt++;
            const msg = (error.message || '').toLowerCase();
            if (msg.includes("429") || msg.includes("503") || msg.includes("500") || msg.includes("timeout") || msg.includes("overloaded")) {
                if (attempt >= maxRetries) throw error;
                const delayMs = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                console.warn(`[AI Engine] Server busy (Attempt ${attempt}/${maxRetries}). Retrying in ${Math.round(delayMs)}ms...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
            } else {
                throw error;
            }
        }
    }
}

module.exports.processAI = async (event) => {
    try {
        const body = JSON.parse(event.body || '{}');
        const { action, payload } = body;

        if (!action) {
            return { statusCode: 400, body: JSON.stringify({ error: "No action provided" }) };
        }

        const ai = new GoogleGenAI({ apiKey: getApiKey() });

        let result;

        if (action === 'generateAdPack') {
            const { prompt, systemInstruction, referenceImage } = payload;

            const parts = [];
            if (referenceImage) {
                parts.push({ inlineData: { data: referenceImage.base64, mimeType: referenceImage.mimeType } });
            }
            parts.push({ text: prompt });

            result = await executeWithRetry(async () => {
                const aiInstance = new GoogleGenAI({ apiKey: getApiKey() });
                const res = await aiInstance.models.generateContent({
                    model: SMART_MODEL,
                    contents: { parts },
                    config: {
                        systemInstruction,
                        responseMimeType: "application/json",
                        temperature: 0.5,
                        topK: 40
                    }
                });
                return JSON.parse(res.text || "{}");
            });
        } else if (action === 'askGemini') {
            const { prompt, sys } = payload;
            result = await executeWithRetry(async () => {
                const aiInstance = new GoogleGenAI({ apiKey: getApiKey() });
                const res = await aiInstance.models.generateContent({
                    model: SMART_MODEL,
                    contents: prompt,
                    config: {
                        systemInstruction: sys,
                        temperature: 0.7,
                        maxOutputTokens: 2048
                    }
                });
                return res.text || "";
            });
        } else {
            return { statusCode: 400, body: JSON.stringify({ error: "Unknown action" }) };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify(result)
        };

    } catch (error) {
        console.error("AWS Lambda AI Error:", error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: error.message || "Internal Server Error" })
        };
    }
};
