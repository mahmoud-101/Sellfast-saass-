import { ImageFile, AudioFile, PlanIdea, PowerStudioResult } from '../types';

// API Keys — loaded from environment variables (never hardcode)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const PPLX_KEY = import.meta.env.VITE_PPLX_KEY || '';

// Helper to simulate delay (for mock/demo mode)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const demoImage: ImageFile = {
    base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    mimeType: "image/png",
    name: "demo.png"
};

// ─────────────────────────────────────────────
// 1. Analyze product images for campaign context
// ─────────────────────────────────────────────
export const analyzeProductForCampaign = async (images: ImageFile[]): Promise<string> => {
    await delay(2000);
    return "منتج عالي الجودة مناسب للأسواق الفاخرة، يتميز بتصميم أنيق ومواد راقية.";
};

// ─────────────────────────────────────────────
// 2. Analyze logo for branding colors
// ─────────────────────────────────────────────
export const analyzeLogoForBranding = async (logos: ImageFile[]): Promise<{ colors: string[] }> => {
    await delay(1500);
    return {
        colors: ['#FF5733', '#33FF57', '#3357FF', '#F3F3F3', '#111111']
    };
};

// ─────────────────────────────────────────────
// 3. Analyze style image for CreatorStudio
// ─────────────────────────────────────────────
export const analyzeStyleImage = async (image: ImageFile): Promise<string> => {
    await delay(2000);
    return "أسلوب بصري مودرن بإضاءة استوديو احترافية وخلفية محايدة.";
};

// ─────────────────────────────────────────────
// 4. Analyze image to generate AI prompt
// ─────────────────────────────────────────────
export const analyzeImageForPrompt = async (images: ImageFile[], instructions?: string): Promise<string> => {
    await delay(3000);
    const base = "مدينة مستقبلية بسيارات طائرة وأضواء نيون، بأسلوب سايبربانك، دقة عالية.";
    return instructions ? `${base} ${instructions}` : base;
};

// ─────────────────────────────────────────────
// 5. Generate prompt from text instructions
// ─────────────────────────────────────────────
export const generatePromptFromText = async (instructions: string): Promise<string> => {
    await delay(2000);
    return `بروميبت احترافي بناءً على: ${instructions}. تصوير فوتوغرافي احترافي، دقة 8K، تفاصيل عالية.`;
};

// ─────────────────────────────────────────────
// 6. Generate image
// ─────────────────────────────────────────────
export const generateImage = async (
    productImages: ImageFile[],
    prompt: string,
    negativePrompt: string | null = null,
    aspectRatio: string = "1:1"
): Promise<ImageFile> => {
    await delay(3000);
    console.log("Generating image with prompt:", prompt);
    if (productImages.length > 0) {
        return { ...productImages[0], name: `generated_${Date.now()}.png` };
    }
    return demoImage;
};

// ─────────────────────────────────────────────
// 7. Edit existing image
// ─────────────────────────────────────────────
export const editImage = async (image: ImageFile, prompt: string): Promise<ImageFile> => {
    await delay(2500);
    console.log("Editing image with prompt:", prompt);
    return { ...image, name: `edited_${Date.now()}.png` };
};

// ─────────────────────────────────────────────
// 8. Expand image (AI Generative Fill)
// ─────────────────────────────────────────────
export const expandImage = async (image: ImageFile, prompt: string): Promise<ImageFile> => {
    await delay(4000);
    console.log("Expanding image with prompt:", prompt);
    return { ...image, name: `expanded_${Date.now()}.png` };
};

// ─────────────────────────────────────────────
// 9. Generate campaign plan ideas
// ─────────────────────────────────────────────
export const generateCampaignPlan = async (
    productImages: ImageFile[],
    prompt: string,
    targetMarket: string,
    dialect: string
): Promise<PlanIdea[]> => {
    await delay(3000);
    return [
        {
            id: '1',
            tov: 'مثير وعاجل',
            caption: `🔥 لا تفوّت الفرصة! المجموعة الجديدة وصلت. #${targetMarket}`,
            schedule: 'اليوم الأول - 10:00 ص',
            scenario: 'كشف المنتج',
            image: null,
            isLoadingImage: false,
            imageError: null
        },
        {
            id: '2',
            tov: 'تعليمي',
            caption: 'هل تعلم؟ منتجنا يحل مشكلة X بطريقة ذكية.',
            schedule: 'اليوم الثالث - 5:00 م',
            scenario: 'عرض توضيحي',
            image: null,
            isLoadingImage: false,
            imageError: null
        },
        {
            id: '3',
            tov: 'أسلوب حياة',
            caption: 'ارتقِ بروتينك اليومي.',
            schedule: 'اليوم الخامس - 8:00 م',
            scenario: 'لقطة نمط الحياة',
            image: null,
            isLoadingImage: false,
            imageError: null
        }
    ];
};

// ─────────────────────────────────────────────
// 10. Generate voice over audio
// ─────────────────────────────────────────────
export const generateVoiceOver = async (text: string, voiceId: string): Promise<AudioFile> => {
    await delay(2000);
    return { base64: "", name: "voice_output.mp3" };
};

// ─────────────────────────────────────────────
// 11. Generate speech (returns ArrayBuffer)
// ─────────────────────────────────────────────
export const generateSpeech = async (text: string, voiceId: string): Promise<ArrayBuffer> => {
    await delay(3000);
    console.log("Generating speech for:", text);
    return new ArrayBuffer(44100 * 2);
};

// ─────────────────────────────────────────────
// 12. Generate copywriting content
// ─────────────────────────────────────────────
export const generateCopy = async (
    productName: string,
    features: string,
    targetAudience: string
): Promise<Array<{ type: string; content: string }>> => {
    await delay(2500);
    return [
        { type: 'عنوان إعلاني', content: `${productName} — الخيار الأول لـ${targetAudience}` },
        { type: 'وصف المنتج', content: `${productName} يقدم لك ${features}. مصمم خصيصاً لـ${targetAudience}.` },
        { type: 'دعوة للتصرف', content: 'اطلب الآن واحصل على شحن مجاني!' },
        { type: 'هاشتاقات', content: `#${productName.replace(/\s/g, '')} #تسوق_أونلاين #عروض_حصرية` },
    ];
};

// ─────────────────────────────────────────────
// 13. Power Production — Full Campaign Engine
// ─────────────────────────────────────────────
export const runPowerProduction = async (
    productImages: ImageFile[],
    goal: string,
    targetMarket: string,
    dialect: string,
    onProgress: (step: string, progress: number) => void
): Promise<PowerStudioResult> => {
    onProgress('تحليل صور المنتج...', 15);
    await delay(1500);

    onProgress('بناء الاستراتيجية التسويقية...', 30);
    await delay(1500);

    onProgress('توليد الهوية البصرية...', 50);
    await delay(2000);

    onProgress('كتابة خطة المحتوى...', 70);
    await delay(1500);

    onProgress('كتابة سيناريوهات الريلز...', 85);
    await delay(1000);

    onProgress('تجميع التقرير النهائي...', 95);
    await delay(500);

    const heroImage = productImages.length > 0
        ? { ...productImages[0], name: `hero_${Date.now()}.png` }
        : demoImage;

    return {
        analysis: `تحليل استراتيجي شامل للمنتج في سوق ${targetMarket}: المنتج يتميز بجودة عالية وتموضع ممتاز في الفئة المستهدفة. الهدف المحدد هو "${goal}" ويمكن تحقيقه من خلال حملة متكاملة تجمع بين المحتوى الرقمي والإعلانات المدفوعة. اللهجة ${dialect} ستضمن التواصل الفعّال مع الجمهور المستهدف.`,
        visualPrompt: `صورة احترافية للمنتج بإضاءة استوديو فاخرة، خلفية نظيفة مع لمسات تعكس ${targetMarket}، أسلوب تصوير تجاري راقٍ.`,
        socialPlan: [
            { hook: '🔥 أطلقنا شيئاً لم تره من قبل!', caption: `${goal} — نقدم لك تجربة جديدة كلياً في ${targetMarket}. اكتشف الفرق الآن.`, schedule: 'اليوم 1 - 10ص', hashtags: ['إبداع', targetMarket.replace(/\s/g, ''), 'جودة', 'منتج_جديد'] },
            { hook: '💡 هل تعلم ماذا يجعلنا مختلفين؟', caption: 'نحن لا نبيع منتجاً، نبيع تجربة. اقرأ قصتنا ولن تندم.', schedule: 'اليوم 3 - 5م', hashtags: ['قصة_نجاح', 'لماذا_نحن'] },
            { hook: '⭐ آراء عملاؤنا تتحدث!', caption: 'أكثر من 1000 عميل راضٍ. انضم لعائلتنا اليوم.', schedule: 'اليوم 5 - 8م', hashtags: ['تقييمات', 'ثقة', 'عملاء_سعداء'] },
            { hook: '🎁 عرض محدود — لا يفوتك!', caption: `خصم حصري لساكني ${targetMarket}. الكمية محدودة!`, schedule: 'اليوم 7 - 12م', hashtags: ['عرض', 'خصم', 'محدود'] },
        ],
        reelsScripts: [
            { scene: 'الافتتاحية', visualDesc: 'كلوز-أب على المنتج مع موسيقى ديناميكية', audioOverlay: `صوت: "هذا ما كنت تنتظره..."` },
            { scene: 'عرض المميزات', visualDesc: 'لقطات سريعة للمنتج من زوايا مختلفة', audioOverlay: 'صوت: "قوة، أناقة، وجودة لا مثيل لها."' },
            { scene: 'الدعوة للتصرف', visualDesc: 'نص على الشاشة مع رابط الموقع', audioOverlay: 'صوت: "اطلب الآن وانضم لآلاف العملاء السعداء!"' },
        ],
        adCopies: [
            { platform: 'إنستجرام', headline: `${goal} — ابدأ رحلتك معنا`, body: `اكتشف منتجاً صمم خصيصاً لـ${targetMarket}. جودة لا تُقارن وسعر لا يُصدق.` },
            { platform: 'تيك توك', headline: 'Trend Alert 🔥', body: `الكل يتحدث عن هذا المنتج في ${targetMarket}. شوف بنفسك ليه!` },
            { platform: 'سناب شات', headline: 'عرض اليوم فقط!', body: `${goal} بأفضل الأسعار. اطلب قبل نفاد الكمية.` },
        ],
        voiceScript: `مرحباً بك في عالم الجودة. منتجنا الجديد صمّم خصيصاً لك أنت، في ${targetMarket}. لأن هدفنا دائماً هو "${goal}". لا تتردد، اطلب الآن.`,
        visual: heroImage,
        brandingColors: ['#6366f1', '#8b5cf6', '#a78bfa', '#f8fafc', '#1e1b4b'],
    };
};
