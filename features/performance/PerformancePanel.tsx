/**
 * PerformancePanel.tsx
 * Self-contained UI panel displayed inside CampaignBuilderHub.
 * Overhauled for Phase 10 UX to feature mandatory image upload
 * and a simplified Results Grid showing 5 specific outputs per ad.
 */

import React, { useState, useRef, useEffect } from 'react';
import type {
    Market,
    PriceTier,
    AwarenessLevel,
    CompetitionLevel,
} from './types';
import type { GenerationResult, AdCard as AdCardType, ProductFormData } from './types/ad.types';
import { buildAdPrompt } from './engine/PromptBuilder';
import { parseGeminiResponse, isValidResult } from './engine/ResponseAnalyzer';
import { askGemini, generateImage } from '../../services/geminiService';

// ─── Loading State Component ──────────────────────────────────────────────────
const STEPS = [
    { title: 'جاري تحليل السوق والمنافسة...', duration: 2000 },
    { title: 'جاري كتابة الهوكات الفعّالة...', duration: 2500 },
    { title: 'جاري بناء زوايا البيع...', duration: 2000 },
    { title: 'جاري تصميم الكريتف الإعلاني...', duration: 2500 },
    { title: 'جاري التجميع النهائي...', duration: 1500 },
];

const PerformanceLoadingState: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        const advanceStep = (stepIndex: number) => {
            if (stepIndex >= STEPS.length - 1) return;
            timer = setTimeout(() => {
                setCurrentStep(stepIndex + 1);
                advanceStep(stepIndex + 1);
            }, STEPS[stepIndex].duration);
        };
        advanceStep(0);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="w-full max-w-2xl mx-auto bg-black/40 border border-orange-500/20 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl animate-in fade-in zoom-in-95 duration-500" dir="rtl">
            <div className="w-20 h-20 mb-6 relative">
                <div className="absolute inset-0 border-4 border-orange-500/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-3xl animate-pulse">🔥</div>
            </div>

            <h3 className="text-2xl font-black text-white mb-2">لحظات ويجهز مصنع الإعلانات...</h3>
            <p className="text-sm text-slate-400 mb-8">نعتمد على تحليل الأداء وصياغة الإعلانات بالسوق المصري.</p>

            <div className="w-full space-y-4 text-right">
                {STEPS.map((step, index) => {
                    const isActive = index === currentStep;
                    const isPassed = index < currentStep;

                    return (
                        <div key={index} className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 font-bold text-sm ${isPassed ? 'bg-emerald-500 text-black' :
                                isActive ? 'bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.5)] scale-110' :
                                    'bg-white/5 text-slate-500'
                                }`}>
                                {isPassed ? '✓' : index + 1}
                            </div>
                            <div className="flex-1">
                                <p className={`font-bold transition-all duration-300 ${isPassed ? 'text-slate-300' :
                                    isActive ? 'text-orange-400 text-lg' :
                                        'text-slate-600'
                                    }`}>
                                    {step.title}
                                </p>
                                {isActive && (
                                    <div className="w-full h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
                                        <div className="h-full bg-orange-500 rounded-full animate-progress" style={{ width: '100%', animationDuration: `${step.duration}ms`, animationTimingFunction: 'linear' }}></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes progress {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
                .animate-progress { animation-name: progress; }
            `}} />
        </div>
    );
};

// ─── Form State ──────────────────────────────────────────────────────────────
interface FormState {
    productName: string;
    productDescription: string;
    mainBenefit: string;
    mainPain: string;
    uniqueDifferentiator: string;
    market: Market;
    priceTier: PriceTier;
    awarenessLevel: AwarenessLevel;
    competitionLevel: CompetitionLevel;
}

const INITIAL_FORM: FormState = {
    productName: '',
    productDescription: '',
    mainBenefit: '',
    mainPain: '',
    uniqueDifferentiator: '',
    market: 'egypt',
    priceTier: 'mid',
    awarenessLevel: 'cold',
    competitionLevel: 'medium',
};

// ─── Select Helper ────────────────────────────────────────────────────────────
const Select = <T extends string>({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: T;
    onChange: (v: T) => void;
    options: { value: T; label: string }[];
}) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs text-slate-400 font-bold">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value as T)}
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-yellow-500/60 transition-colors"
        >
            {options.map((o) => (
                <option key={o.value} value={o.value}>
                    {o.label}
                </option>
            ))}
        </select>
    </div>
);

// ─── Ad Card Component ────────────────────────────────────────────────────────
const AdCard: React.FC<{ variant: AdCardType, productImageSrc: string, index: number }> = ({ variant, productImageSrc, index }) => {
    return (
        <div className="bg-[#0f1219] border border-white/10 rounded-3xl p-6 flex flex-col gap-6 shadow-2xl relative overflow-hidden group hover:border-orange-500/30 transition-colors">
            {/* Angle Name Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-l from-orange-600 to-orange-400 text-black text-xs font-black px-4 py-1.5 rounded-bl-xl z-20 shadow-lg flex items-center gap-1">
                <span>{variant.badgeEmoji}</span> إعلان {index + 1}: {variant.badgeLabel}
            </div>

            {/* 1. Image */}
            <div className="w-full relative rounded-2xl overflow-hidden aspect-square border border-white/5 bg-black/40 group-hover:border-orange-500/20 transition-colors">
                {variant.isLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-10 transition-opacity duration-300">
                        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-[11px] font-black tracking-widest text-orange-400 animate-pulse text-center px-4 leading-relaxed uppercase">
                            جاري تصميم الصورة بأسلوب<br />
                            <span className="text-white mt-1 block">({variant.imageStyleName})</span>
                        </p>
                    </div>
                ) : null}
                {variant.generatedImageUrl ? (
                    <img src={variant.generatedImageUrl} alt="Generated Ad" className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-700" />
                ) : (
                    <img src={productImageSrc} alt="Fallback Ad" className="w-full h-full object-cover opacity-60 grayscale blur-[2px] scale-105" />
                )}
            </div>

            <div className="space-y-6 flex-1 flex flex-col">
                {/* 2. Ad Post (Copy-paste ready) */}
                <div className="bg-white/5 rounded-2xl p-5 border border-white/5 flex-1 relative rtl group-hover:bg-white/10 transition-colors">
                    <p className="text-[11px] font-black uppercase text-orange-400/80 mb-4 flex items-center gap-1.5"><span className="text-sm">📝</span> الكوبي الإعلاني (متوافق مع الذوق العام)</p>
                    <div className="text-sm text-slate-300 leading-loose whitespace-pre-wrap font-sans font-medium">
                        {variant.adPost}
                    </div>
                </div>

                {/* Buttons Action Bar */}
                <div className="flex flex-col gap-3 pt-2">
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => navigator.clipboard.writeText(variant.adPost)}
                            className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white px-4 py-3 rounded-xl transition-all font-bold shadow-sm active:scale-95 flex items-center justify-center gap-2 border border-emerald-500/20 hover:border-emerald-500 text-sm"
                        >
                            <span>📋</span> نسخ الإعلان
                        </button>
                        <button
                            onClick={() => {
                                const a = document.createElement("a");
                                a.href = variant.generatedImageUrl || productImageSrc;
                                a.download = `ad-${index + 1}-image.jpg`;
                                a.click();
                            }}
                            className="bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white px-4 py-3 rounded-xl transition-all font-bold shadow-sm active:scale-95 flex items-center justify-center gap-2 border border-blue-500/20 hover:border-blue-500 text-sm"
                        >
                            <span>⬇️</span> تحميل الصورة
                        </button>
                    </div>

                    <button
                        onClick={() => alert("سيتم تفعيل ميزة إعادة توليد هذا الإعلان قريباً!")}
                        className="w-full bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-black px-4 py-3 rounded-xl transition-all font-bold shadow-sm active:scale-95 flex items-center justify-center gap-2 border border-orange-500/20 hover:border-orange-500 text-sm mt-1"
                    >
                        <span>🔄</span> إعادة توليد الإعلان والحصول على تصميم جديد
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Panel ───────────────────────────────────────────────────────────────
const PerformancePanel: React.FC = () => {
    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [adSet, setAdSet] = useState<GenerationResult | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isIntelligenceOpen, setIsIntelligenceOpen] = useState(false);

    // Product image for visual creative
    const [productImageSrc, setProductImageSrc] = useState<string | null>(null);
    const imgInputRef = useRef<HTMLInputElement>(null);

    // Reference image (UGC style)
    const [referenceImageSrc, setReferenceImageSrc] = useState<string | null>(null);
    const refImgInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        if (productImageSrc) URL.revokeObjectURL(productImageSrc);
        setProductImageSrc(url);
    };

    const handleRefImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        if (referenceImageSrc) URL.revokeObjectURL(referenceImageSrc);
        setReferenceImageSrc(url);
    };

    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        setForm((f) => ({ ...f, [key]: value }));

    const getBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleGenerate = async () => {
        const file = imgInputRef.current?.files?.[0];
        const refFile = refImgInputRef.current?.files?.[0] || null;
        if (!form.productName.trim() || !form.mainBenefit.trim() || !productImageSrc || !file) return;
        setIsGenerating(true);
        setIsIntelligenceOpen(false); // Reset accordion state
        setAdSet(null);

        // Map form to ProductFormData
        const formData: ProductFormData = {
            productName: form.productName,
            price: form.priceTier === 'budget' ? 'اقتصادي' : form.priceTier === 'mid' ? 'متوسط' : 'غالي / مميز', // simplified adaptation
            mainBenefit: form.mainBenefit,
            audience: form.market === 'egypt' ? 'مصريين' : form.market === 'gulf' ? 'خلايجة' : 'عرب',
            ageRange: '20-45', // Fixed assumption or can be added to the form later
            category: 'أخرى',
            budget: 'مفتوحة للنمو',
            imageFile: file,
            referenceImageFile: refFile,
            productUrl: ''
        };

        try {
            // Build prompt
            const prompt = buildAdPrompt(formData);

            // Only ask Gemini for the text parts first.
            const rawText = await askGemini(prompt, "You are a senior Meta Ad buyer and copywriter expert in the Egyptian and Gulf markets.");
            const parsed = parseGeminiResponse(rawText);

            if (!isValidResult(parsed)) {
                throw new Error("Invalid response from analyzer");
            }

            // Set initial AdSet with loading state for images
            setAdSet(parsed);
            setIsGenerating(false);

            // Now, parallel fetch exactly the generated image for each style
            const base64Data = (await getBase64(file)).split(',')[1];
            const productImage = { base64: base64Data, mimeType: file.type, name: file.name };

            let referenceImages = null;
            if (refFile) {
                const refBase64Data = (await getBase64(refFile)).split(',')[1];
                referenceImages = [{ base64: refBase64Data, mimeType: refFile.type, name: refFile.name }];
            }

            parsed.ads.forEach(async (ad, index) => {
                try {
                    const generatedImage = await generateImage([productImage], ad.imagePrompt, referenceImages, "3:4");
                    const finalUrl = `data:${generatedImage.mimeType};base64,${generatedImage.base64}`;

                    setAdSet(prev => {
                        if (!prev) return prev;
                        const newAds = [...prev.ads];
                        newAds[index] = { ...newAds[index], generatedImageUrl: finalUrl, isLoading: false };
                        return { ...prev, ads: newAds };
                    });
                } catch (imgError) {
                    console.error("Failed to generate image for ad", index, imgError);
                    setAdSet(prev => {
                        if (!prev) return prev;
                        const newAds = [...prev.ads];
                        newAds[index] = { ...newAds[index], isLoading: false };
                        return { ...prev, ads: newAds };
                    });
                }
            });

        } catch (error) {
            console.error("Error generating ads:", error);
            setIsGenerating(false);
            // Show alert in actual implementation or handle fallback gracefully
        }
    };

    return (
        <div dir="rtl" className="flex flex-col gap-8 animate-in fade-in duration-300 pb-20">

            {/* ── Section Header ─────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-orange-500/10 border border-orange-500/20 p-6 rounded-3xl">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center text-3xl select-none shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                        🔥
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white">محرك الإعلانات الفائق</h1>
                        <p className="text-sm text-slate-400 mt-1">أدخل المنتج، ارفع الصورة، واحصل على 5 إعلانات אداء جاهزة.</p>
                    </div>
                </div>
            </div>

            {/* ── Input Form ────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">

                {/* ── Image Uploads ── */}
                <div className="md:col-span-1">
                    <label className="text-sm text-white font-black mb-2 block">1. صورة المنتج الأساسية (مطلوبة) *</label>
                    {productImageSrc ? (
                        <div className="relative w-full h-48 rounded-2xl overflow-hidden border-2 border-orange-500/50 group">
                            <img src={productImageSrc} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    onClick={() => imgInputRef.current?.click()}
                                    className="bg-white text-black px-6 py-2 rounded-xl font-bold shadow-xl"
                                >
                                    تغيير الصورة
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => imgInputRef.current?.click()}
                            className="w-full h-48 rounded-2xl border-2 border-dashed border-orange-500/50 bg-orange-500/5 flex flex-col items-center justify-center gap-3 hover:bg-orange-500/10 transition-colors"
                        >
                            <span className="text-5xl">📸</span>
                            <p className="text-orange-300 font-black">أضف صورة المنتج</p>
                            <p className="text-slate-400 text-xs">مطلوبة لبناء الإعلان</p>
                        </button>
                    )}
                    <input
                        ref={imgInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                    />
                </div>

                <div className="md:col-span-1">
                    <label className="text-sm text-slate-300 font-bold mb-2 flex items-center gap-2 block">صورة ريفرانس (اختياري) <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full">ستايل أو ملامح</span></label>
                    {referenceImageSrc ? (
                        <div className="relative w-full h-48 rounded-2xl overflow-hidden border-2 border-slate-500/50 group">
                            <img src={referenceImageSrc} alt="Reference Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    onClick={() => refImgInputRef.current?.click()}
                                    className="bg-white text-black px-6 py-2 rounded-xl font-bold shadow-xl"
                                >
                                    تغيير الريفرانس
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => refImgInputRef.current?.click()}
                            className="w-full h-48 rounded-2xl border-2 border-dashed border-slate-500/50 bg-white/5 flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-colors"
                        >
                            <span className="text-5xl opacity-50">🖼️</span>
                            <p className="text-slate-300 font-bold">UGC أو Photoshoot ريفرانس</p>
                            <p className="text-slate-500 text-xs">يساعد الذكاء الاصطناعي في فهم المود المطلوب</p>
                        </button>
                    )}
                    <input
                        ref={refImgInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleRefImageUpload}
                    />
                </div>

                <div className="md:col-span-2 border-t border-white/10 my-2" />

                <div className="md:col-span-2">
                    <label className="text-sm text-white font-black mb-2 block">2. تفاصيل المنتج</label>
                </div>

                {/* Product Name */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs text-slate-400 font-bold">اسم المنتج / الخدمة *</label>
                    <input
                        type="text"
                        value={form.productName}
                        onChange={(e) => setField('productName', e.target.value)}
                        placeholder="مثال: كريم تبييض متقدم"
                        className="bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/60 transition-colors"
                    />
                </div>

                {/* Main Benefit */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs text-slate-400 font-bold">المنتج مميز في إيه؟ (الفائدة الرئيسية) *</label>
                    <input
                        type="text"
                        value={form.mainBenefit}
                        onChange={(e) => setField('mainBenefit', e.target.value)}
                        placeholder="مثال: بشرة مشرقة في 7 أيام"
                        className="bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/60 transition-colors"
                    />
                </div>

                {/* Main Pain */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-bold">إيه المشكلة اللي بيحلها؟</label>
                    <input
                        type="text"
                        value={form.mainPain}
                        onChange={(e) => setField('mainPain', e.target.value)}
                        placeholder="مثال: البشرة الداكنة والبهتان"
                        className="bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/60 transition-colors"
                    />
                </div>

                {/* Unique Differentiator */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-bold">الميزة التنافسية (ضمان/ميزة)</label>
                    <input
                        type="text"
                        value={form.uniqueDifferentiator}
                        onChange={(e) => setField('uniqueDifferentiator', e.target.value)}
                        placeholder="مثال: الوحيد بـ 3 مواد نادرة"
                        className="bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/60 transition-colors"
                    />
                </div>

                {/* Selects */}
                <Select<Market> label="السوق" value={form.market} onChange={(v) => setField('market', v)} options={[{ value: 'egypt', label: '🇪🇬 مصر' }, { value: 'gulf', label: '🇸🇦 الخليج' }, { value: 'mena', label: '🌍 MENA' }]} />
                <Select<PriceTier> label="شريحة السعر" value={form.priceTier} onChange={(v) => setField('priceTier', v)} options={[{ value: 'budget', label: '💰 اقتصادي' }, { value: 'mid', label: '💎 متوسط' }, { value: 'premium', label: '🏆 غالي' }]} />
                <Select<AwarenessLevel> label="تفاعل الجمهور" value={form.awarenessLevel} onChange={(v) => setField('awarenessLevel', v)} options={[{ value: 'cold', label: '🧊 بارد (لا يعرفون)' }, { value: 'warm', label: '🌡️ دافئ (يعرفون)' }, { value: 'hot', label: '🔥 حار (جاهزين للشراء)' }]} />
                <Select<CompetitionLevel> label="المنافسة" value={form.competitionLevel} onChange={(v) => setField('competitionLevel', v)} options={[{ value: 'low', label: '🟢 ضعيفة' }, { value: 'medium', label: '🟡 متوسطة' }, { value: 'high', label: '🔴 عالية' }]} />

                {/* Generate Button */}
                <div className="md:col-span-2 mt-4">
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !form.productName.trim() || !form.mainBenefit.trim() || !productImageSrc}
                        className="w-full py-5 rounded-2xl font-black text-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 flex items-center justify-center gap-3 shadow-[0_10px_30px_-10px_rgba(249,115,22,0.5)]"
                        style={{ background: isGenerating ? '#374151' : 'linear-gradient(to right, #F97316, #EF4444)' }}
                    >
                        {isGenerating ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>جاري توليد الصور والنصوص الإعلانية...</span>
                            </>
                        ) : (
                            <>🚀 أنشئ 5 إعلانات أداء مبيعات جاهزة الآن</>
                        )}
                    </button>
                    {(!productImageSrc || !form.productName.trim() || !form.mainBenefit.trim()) && (
                        <p className="text-center text-orange-400 text-xs mt-3 bg-orange-500/10 py-2 rounded-lg border border-orange-500/20">
                            * الرجاء إرفاق الصورة واسم المنتج والفائدة الرئيسية للمتابعة
                        </p>
                    )}
                </div>
            </div>

            {/* ── Results Grid ────────────────────────────────────────────────── */}
            {isGenerating && (
                <div className="mt-8">
                    <PerformanceLoadingState />
                </div>
            )}

            {!isGenerating && adSet && productImageSrc && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 mt-4">

                    <div className="text-center space-y-2 mb-8">
                        <h2 className="text-3xl font-black text-white">✨ إعلاناتك الـ 5 جاهزة</h2>
                        <p className="text-slate-400">تم تصميم كل إعلان بزاوية بيعية مختلفة لتعظيم الأداء والتحويلات.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-8">
                        {adSet.ads.map((v, idx) => (
                            <AdCard key={idx} variant={v} productImageSrc={productImageSrc} index={idx} />
                        ))}
                    </div>

                    {/* ── Advanced Intelligence Accordion ── */}
                    <div className="mt-12 bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-lg">
                        <button
                            onClick={() => setIsIntelligenceOpen(!isIntelligenceOpen)}
                            className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🧠</span>
                                <h3 className="text-lg font-black text-purple-400">عرض التحليل المتقدم</h3>
                            </div>
                            <span className="text-white text-xl transition-transform duration-300" style={{ transform: isIntelligenceOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                        </button>

                        {isIntelligenceOpen && (
                            <div className="p-6 border-t border-white/10 bg-black/40 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4">
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-white mb-2">📊 تموضع السوق والمنافسة</h4>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-sm text-slate-300">
                                        <p><span className="text-orange-400 font-bold">السوق المتوقع للنتيجة: </span>{adSet.advancedAnalysis.market}</p>
                                        <p><span className="text-orange-400 font-bold">شريحة السعر المستهدفة: </span>{adSet.advancedAnalysis.priceSegment}</p>
                                        <p><span className="text-orange-400 font-bold">مستوى وعي العميل الأفضل: </span>{adSet.advancedAnalysis.awareness}</p>
                                    </div>

                                    <h4 className="text-sm font-bold text-white mt-6 mb-2">🎯 نقطة البيع الفريدة (USP) كما فهمها الذكاء</h4>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-sm text-slate-300 leading-relaxed font-semibold">
                                        "{adSet.advancedAnalysis.usp}"
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-white mb-2">📈 قوة الهوكات وتقييم الذكاء الاصطناعي</h4>
                                    <div className="space-y-3">
                                        {adSet.advancedAnalysis.hooksAnalysis.map((analysisItem, i) => (
                                            <div key={i} className="flex flex-col gap-2 bg-white/5 p-3 rounded-xl border border-white/10">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-300 font-bold">{analysisItem.angle.replace('_', ' ')}</span>
                                                    <span className={`font-black ${analysisItem.score >= 70 ? 'text-emerald-400' : analysisItem.score >= 55 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                        {analysisItem.score}/100 🎯
                                                    </span>
                                                </div>
                                                <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${analysisItem.score}%`,
                                                            background: analysisItem.score >= 70 ? '#10B981' : analysisItem.score >= 55 ? '#FBBF24' : '#EF4444'
                                                        }}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-yellow-500 mt-1 leading-relaxed border-t border-white/5 pt-1.5">
                                                    💡 <strong>توصية الذكاء: </strong> {analysisItem.tip}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PerformancePanel;
