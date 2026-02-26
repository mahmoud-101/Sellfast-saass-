import { loadEnv } from 'vite';
import { askGemini } from './services/geminiService';
import { GoogleGenAI } from '@google/genai';

async function runTest() {
    console.log("🚀 Starting AI Engine Diagnostics...");

    // Load environment variables simulating Vite
    const env = loadEnv('development', process.cwd(), '');

    // Setup global process.env mocks for the test context
    process.env.GEMINI_API_KEY = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || env.API_KEY || '';
    process.env.PERPLEXITY_API_KEY = env.PERPLEXITY_API_KEY || env.VITE_PERPLEXITY_API_KEY || '';

    console.log("🔍 Checking Keys:");
    if (process.env.PERPLEXITY_API_KEY) {
        console.log(`✅ Perplexity Key Found: ${process.env.PERPLEXITY_API_KEY.substring(0, 5)}...`);
    } else {
        console.log("⚠️ No Perplexity Key found locally.");
    }

    if (process.env.GEMINI_API_KEY) {
        console.log(`✅ Gemini Key Found: ${process.env.GEMINI_API_KEY.substring(0, 5)}...`);
    } else {
        console.log("⚠️ No Gemini Key found locally.");
    }

    if (!process.env.PERPLEXITY_API_KEY && !process.env.GEMINI_API_KEY) {
        console.log("❌ CRITICAL: No API keys available in the local environment to test with. (Make sure they are on Vercel)");
        return;
    }

    try {
        console.log("⏳ Sending Test Prompt to AI Engine...");
        const result = await askGemini("قول جملة ترحيب قصيرة جداً بالمصري (5 كلمات فقط)", "أنت مساعد ذكي ولطيف");
        console.log("🎉 SUCCESS! AI Replied:");
        console.log("-----------------------------------------");
        console.log(result);
        console.log("-----------------------------------------");
    } catch (error: any) {
        console.log("❌ GENERATION FAILED:");
        console.error(error.message);
    }
}

runTest();
