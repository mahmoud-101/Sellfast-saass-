import { generateImage } from './services/geminiService';
import { loadEnv } from 'vite';

async function testImages() {
    console.log("🧪 Testing Image Generation Pipeline...");

    // Mock environment
    const env = loadEnv('development', process.cwd(), '');
    process.env.VITE_GEMINI_API_KEY = env.VITE_GEMINI_API_KEY || '';

    const testPrompt = "A luxury perfume bottle on a marble table, cinematic lighting, 8k resolution, professional photography";

    try {
        console.log("📡 Sending request to Image Engines (Flux first, then Gemini)...");
        const result = await generateImage([], testPrompt);

        if (result && result.base64) {
            console.log("✅ SUCCESS! Image generated successfully.");
            console.log(`📸 Source: ${result.name}`);
            console.log(`🖼️ MimeType: ${result.mimeType}`);
            console.log(`📏 Base64 Length: ${result.base64.length} chars`);
            console.log("\n-----------------------------------------");
            console.log("IMAGE GENERATION IS FULLY OPERATIONAL!");
            console.log("-----------------------------------------");
        } else {
            console.error("❌ FAILED: Received empty result from image service.");
        }
    } catch (error: any) {
        console.error("❌ CRITICAL ERROR during image generation:");
        console.error(error.message);
    }
}

testImages();
