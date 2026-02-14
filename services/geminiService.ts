import { ImageFile, AudioFile, PlanIdea } from '../types';

// API Keys (Preserved from previous context)
const API_KEY = "AIzaSyCTUhWvEYSSmmVKWZywJjAQcGnNkjkPJSY";
const PPLX_KEY = "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";

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const demoImage: ImageFile = {
    base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", // 1x1 pixel
    mimeType: "image/png",
    name: "demo.png"
};

/**
 * Analyzes product images to generate a description or campaign context.
 */
export const analyzeProductForCampaign = async (images: ImageFile[]): Promise<string> => {
    await delay(2000);
    // In a real app, this would call Gemini Vision API
    return "A high-quality product suitable for luxury markets, featuring sleek design and premium materials.";
};

/**
 * Generates an image based on product context and specific prompt.
 */
export const generateImage = async (
    productImages: ImageFile[],
    prompt: string,
    negativePrompt: string | null = null,
    aspectRatio: string = "1:1"
): Promise<ImageFile> => {
    await delay(3000);
    console.log("Generating image with prompt:", prompt);
    // In a real app, this calls an Image Generation API (e.g. Ideogram, Midjourney via proxy, or SDXL)

    // Return a placeholder or the first product image for demo purposes if available
    if (productImages.length > 0) {
        return {
            ...productImages[0],
            name: `generated_${Date.now()}.png`
        };
    }
    return demoImage;
};

/**
 * Edits an existing image based on a text prompt.
 */
export const editImage = async (image: ImageFile, prompt: string): Promise<ImageFile> => {
    await delay(2500);
    console.log("Editing image with prompt:", prompt);
    return {
        ...image,
        name: `edited_${Date.now()}.png`
    };
};

/**
 * Generates a campaign plan with ideas.
 */
export const generateCampaignPlan = async (
    productImages: ImageFile[],
    prompt: string,
    targetMarket: string,
    dialect: string
): Promise<PlanIdea[]> => {
    await delay(3000);

    // Mock response matching PlanIdea interface
    return [
        {
            id: '1',
            tov: 'Exciting & Urgent',
            caption: `🔥 Don't miss out! The new collection is here. #${targetMarket}`,
            schedule: 'Day 1 - 10:00 AM',
            scenario: 'Product Reveal',
            image: null,
            isLoadingImage: false,
            imageError: null
        },
        {
            id: '2',
            tov: 'Educational',
            caption: 'Did you know? Our product solves X problem.',
            schedule: 'Day 3 - 5:00 PM',
            scenario: 'Product Demo',
            image: null,
            isLoadingImage: false,
            imageError: null
        },
        {
            id: '3',
            tov: 'Lifestyle',
            caption: 'Elevate your daily routine.',
            schedule: 'Day 5 - 8:00 PM',
            scenario: 'Lifestyle Shot',
            image: null,
            isLoadingImage: false,
            imageError: null
        }
    ];
};

/**
 * Analyzes logo for branding colors.
 */
export const analyzeLogoForBranding = async (logos: ImageFile[]): Promise<{ colors: string[] }> => {
    await delay(1500);
    return {
        colors: ['#FF5733', '#33FF57', '#3357FF', '#F3F3F3', '#111111']
    };
};

/**
 * Generates voice over audio.
 */
export const generateVoiceOver = async (text: string, voiceId: string): Promise<AudioFile> => {
    await delay(2000);
    return {
        base64: "", // Empty for now
        name: "voice_output.mp3"
    };
};
/**
 * Expands an image using AI Generative Fill.
 */
export const expandImage = async (image: ImageFile, prompt: string): Promise<ImageFile> => {
    await delay(4000);
    console.log("Expanding image with prompt:", prompt);
    return {
        ...image,
        name: `expanded_${Date.now()}.png`
    };
};
