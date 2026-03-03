
import React, { useState, useEffect, useCallback } from 'react';
import { generateImage, generateDynamicStoryboard } from '../services/geminiService';
import { deductCredits } from '../lib/supabase';
import ImageWorkspace from './ImageWorkspace';
import { ImageFile } from '../types';

interface StoryboardResult {
    id: number;
    shotName: string;
    image: ImageFile | null;
    isLoading: boolean;
    error: string | null;
}

interface VideoStudioProps {
    userId?: string;
    refreshCredits?: () => void;
    initialScript?: string;
}

const FusionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const PlacementIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

const PROMPT_TEMPLATES = {
    FUSION: "تجربة افتراضية ودمج الأنماط: خذ المنتج من الصورة 1 وضعه على الموديل في الصورة 2. يجب أن يرتدي الموديل في الصورة 2 المنتج من الصورة 1. حافظ على ملامح الوجه والوضعية والبيئة المحيطة بالموديل في الصورة 2. جودة تجارية عالية، 8k، واقعية. حافظ بدقة على جميع النصوص والشعارات الأصلية من الصورة 1.",
    PLACEMENT: "دمج المنتج باحترافية: استخرج المنتج من الصورة 1 وضعه بشكل واقعي في مشهد الصورة 2. إذا كان هناك موديل في الصورة 2، فيجب أن يرتدي أو يمسك المنتج من الصورة 1. استبدل الملابس الأصلية في الصورة 2 بالمنتج من الصورة 1. طابق الإضاءة والظلال والمنظور بشكل مثالي. حافظ بدقة على جميع النصوص والشعارات الأصلية من الصورة 1."
};

const SHOT_VARIATIONS = [
    "لقطة قريبة لتفاصيل ملمس المنتج والشعار",
    "لقطة متوسطة لموديل يرتدي أو يمسك المنتج",
    "لقطة نمط حياة كاملة في بيئة سينمائية",
    "لقطة حركة: شخص يمشي أثناء استخدام المنتج",
    "زاوية علوية فنية للمنتج",
    "لقطة جانبية مع إضاءة حواف درامية",
    "عرض خلفي يوضح ملاءمة المنتج وحركته",
    "لقطة 'هيرو' من زاوية منخفضة لمظهر براند قوي",
    "لقطة فنية مع خلفية ضبابية (بوكيه)"
];

const VideoStudio: React.FC<VideoStudioProps> = ({ userId, refreshCredits, initialScript = '' }) => {
    const [prompt, setPrompt] = useState(initialScript);
    const [productImages, setProductImages] = useState<ImageFile[]>([]);
    const [referenceImages, setReferenceImages] = useState<ImageFile[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [results, setResults] = useState<StoryboardResult[]>([]);
    const [statusText, setStatusText] = useState('جاهز للإنتاج');

    useEffect(() => {
        if (initialScript) setPrompt(initialScript);
    }, [initialScript]);

    const handleGenerate = async () => {
        if (productImages.length === 0 || !userId) return;

        setIsGenerating(true);
        setStatusText('جاري تحليل الصور وابتكار 9 أفكار إبداعية...');

        try {
            if (userId !== 'guest') {
                const deducted = await deductCredits(userId, 30);
                if (!deducted) {
                    setStatusText('رصيد غير كافٍ');
                    setIsGenerating(false);
                    return;
                }
            }

            // Step 1: Generate Dynamic Storyboard
            const dynamicShots = await generateDynamicStoryboard(productImages, referenceImages, prompt);

            // Step 2: Initialize Results
            const initialResults: StoryboardResult[] = (dynamicShots || []).map((name, i) => ({
                id: i,
                shotName: name,
                image: null,
                isLoading: true,
                error: null
            }));
            setResults(initialResults);

            setStatusText('جاري رندرة المشاهد المبتكرة...');

            // Step 3: Generate Images in Parallel with a small staggered delay to avoid burst rate limits
            const inputImages = [...productImages, ...referenceImages];
            const imagePromises = (dynamicShots || []).map(async (shotDescription, i) => {
                // Add a small staggered delay (e.g., 1500ms per image)
                await new Promise(resolve => setTimeout(resolve, i * 1500));

                const finalPrompt = `
                    VIRTUAL TRY-ON & PRODUCT SWAP:
                    IMAGE 1 is the ONLY product to be shown.
                    IMAGE 2 provides the model and the environment.
                    
                    INSTRUCTION: Take the model from IMAGE 2 and make them wear the product from IMAGE 1.
                    The clothing originally worn by the model in IMAGE 2 MUST be completely replaced by the product in IMAGE 1.
                    DO NOT show the original clothing from IMAGE 2.
                    
                    SCENE: ${shotDescription}.
                    
                    TECHNICAL: High-end commercial photography, 8k, photorealistic, editorial style.
                    STRICT: Maintain the model's facial features and identity from IMAGE 2. PRESERVE ALL LOGOS AND BRANDING FROM IMAGE 1.
                `.trim();

                try {
                    const img = await generateImage(inputImages, finalPrompt, null, "16:9");
                    setResults(prev => prev.map(res => res.id === i ? { ...res, image: img, isLoading: false } : res));
                } catch (err: any) {
                    console.error(`Error generating shot ${i}:`, err);
                    setResults(prev => prev.map(res => res.id === i ? { ...res, isLoading: false, error: 'فشل في الرندرة (ربما بسبب الضغط)' } : res));
                }
            });

            await Promise.all(imagePromises);

            setStatusText('اكتمل إنتاج المشاهد!');
            if (refreshCredits) refreshCredits();
        } catch (err: any) {
            setStatusText('حدث خطأ فني');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleUpload = (setter: React.Dispatch<React.SetStateAction<ImageFile[]>>) => (files: File[]) => {
        if (!files.length) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result) {
                setter([{ base64: (reader.result as string || '').split(',')[1] || '', mimeType: files[0].type, name: files[0].name }]);
            }
        };
        reader.readAsDataURL(files[0]);
    };

    return (
        <main className="w-full flex flex-col gap-10 pt-4 pb-12 animate-in fade-in duration-700 text-right font-tajawal" dir="rtl">
            <div className="bg-black/40 border border-white/5 rounded-[3.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Control Panel */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-white tracking-tighter italic">استوديو تصميم الفيديوهات <span className="text-[#FFD700]">9-Individual</span></h2>
                            <p className="text-slate-500 text-sm font-bold leading-relaxed">ادمج المنتج والرفرنس للحصول على 9 صور احترافية منفصلة بجودة الـ 4K.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3 text-center">
                                <label className="text-[10px] font-black text-[#FFD700] uppercase tracking-widest block">1. المنتج (Identity)</label>
                                <div className="aspect-square">
                                    <ImageWorkspace id="prod-indiv" images={productImages} onImagesUpload={handleUpload(setProductImages)} onImageRemove={() => setProductImages([])} isUploading={false} title="صورة المنتج" />
                                </div>
                            </div>
                            <div className="space-y-3 text-center">
                                <label className="text-[10px] font-black text-yellow-600 uppercase tracking-widest block">2. الرفرنس (Style)</label>
                                <div className="aspect-square">
                                    <ImageWorkspace id="ref-indiv" images={referenceImages} onImagesUpload={handleUpload(setReferenceImages)} onImageRemove={() => setReferenceImages([])} isUploading={false} title="الموديل/البيئة" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">أوضاع الكتابة التلقائية</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setPrompt(PROMPT_TEMPLATES.FUSION)}
                                    className="flex flex-col items-center justify-center p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-[#FFD700]/20 hover:border-[#FFD700] transition-all gap-2 group"
                                >
                                    <FusionIcon />
                                    <span className="text-[9px] font-black uppercase text-slate-400 group-hover:text-white">دمج الأنماط</span>
                                </button>
                                <button
                                    onClick={() => setPrompt(PROMPT_TEMPLATES.PLACEMENT)}
                                    className="flex flex-col items-center justify-center p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-[#FFD700]/20 hover:border-[#FFD700] transition-all gap-2 group"
                                >
                                    <PlacementIcon />
                                    <span className="text-[9px] font-black uppercase text-slate-400 group-hover:text-white">وضع المشهد</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">وصف السيناريو</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="اكتب وصفك أو اختر وضعاً من الأعلى..."
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white focus:border-[#FFD700] outline-none min-h-[140px] resize-none leading-relaxed"
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || productImages.length === 0}
                            className="w-full h-20 bg-[#FFD700] hover:bg-yellow-400 disabled:opacity-30 text-black rounded-2xl font-black text-xl flex items-center justify-center gap-4 transition-all shadow-[0_20px_50px_rgba(255,215,0,0.2)]"
                        >
                            {isGenerating ? (
                                <div className="flex flex-col items-center">
                                    <span className="text-sm mb-1">{statusText}</span>
                                    <div className="w-48 h-1 bg-black/20 rounded-full mt-2 overflow-hidden">
                                        <div className="h-full bg-black animate-progress-indefinite"></div>
                                    </div>
                                </div>
                            ) : "توليد 9 صور منفصلة (30 نقطة)"}
                        </button>
                    </div>

                    {/* Individual Results Grid */}
                    <div className="lg:col-span-8">
                        {results.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-5">
                                {results.map((res) => (
                                    <div key={res.id} className="bg-white/5 border border-white/5 rounded-[2.5rem] p-4 flex flex-col gap-4 group hover:border-[#FFD700]/30 transition-all overflow-hidden relative">
                                        <div className="aspect-video rounded-[1.8rem] bg-black/40 overflow-hidden relative shadow-inner">
                                            {res.isLoading ? (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                                    <div className="w-8 h-8 border-2 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
                                                    <span className="text-[8px] font-black text-[#FFD700] uppercase animate-pulse">جاري الرندرة...</span>
                                                </div>
                                            ) : res.image ? (
                                                <img src={`data:${res.image.mimeType};base64,${res.image.base64}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={res.shotName} />
                                            ) : (
                                                <div className="h-full flex items-center justify-center p-4 text-center">
                                                    <span className="text-[9px] text-red-400 font-bold">{res.error}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-[#FFD700] uppercase tracking-widest">لقطة 0{res.id + 1}</p>
                                            <p className="text-[10px] font-bold text-slate-300 truncate">{res.shotName}</p>
                                        </div>

                                        {res.image && (
                                            <button
                                                onClick={() => {
                                                    const a = document.createElement('a');
                                                    a.href = `data:${res.image!.mimeType};base64,${res.image!.base64}`;
                                                    a.download = `EbdaaPro-Shot-0${res.id + 1}.png`;
                                                    a.click();
                                                }}
                                                className="w-full py-2.5 bg-white text-black rounded-xl text-[10px] font-black opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0"
                                            >
                                                تحميل 4K 📥
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center opacity-10 space-y-8">
                                <div className="grid grid-cols-3 gap-4">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => <div key={i} className="w-16 h-10 border-2 border-white rounded-xl"></div>)}
                                </div>
                                <p className="font-black uppercase tracking-[0.5em] text-sm">9 لقطات إبداعية جاهزة</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-3xl text-center">
                    <p className="text-[10px] font-black text-emerald-500 uppercase mb-1">Ultra HD</p>
                    <p className="text-[11px] font-bold text-slate-400">تحميل كل صورة بشكل مستقل</p>
                </div>
                <div className="bg-[#FFD700]/10 border border-[#FFD700]/20 p-5 rounded-3xl text-center">
                    <p className="text-[10px] font-black text-[#FFD700] uppercase mb-1">Identity Lock</p>
                    <p className="text-[11px] font-bold text-slate-400">ثبات كامل لشعار المنتج</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-5 rounded-3xl text-center">
                    <p className="text-[10px] font-black text-yellow-500 uppercase mb-1">Cinema Flow</p>
                    <p className="text-[11px] font-bold text-slate-400">9 زوايا إخراجية عالمية</p>
                </div>
            </div>
        </main>
    );
};

export default VideoStudio;
