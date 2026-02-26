/**
 * PerformancePanel.tsx
 * Self-contained UI panel displayed inside CampaignBuilderHub.
 * Overhauled for Phase 10 UX to feature mandatory image upload
 * and a simplified Results Grid showing 5 specific outputs per ad.
 */

import React, { useState, useRef } from 'react';
import type {
    Market,
    PriceTier,
    AwarenessLevel,
    CompetitionLevel,
    ProductPerformanceProfile,
    PerformanceAdSet,
    PerformanceAdVariant,
} from './types';
import { runAngleEngine } from './engine/AngleEngine';
import { runAdVariationEngine } from './engine/AdVariationEngine';
import AdCreativeCanvas from './renderer/AdCreativeCanvas';

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
const AdCard: React.FC<{ variant: PerformanceAdVariant, productImageSrc: string, index: number }> = ({ variant, productImageSrc, index }) => {
    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-6 shadow-xl relative overflow-hidden">
            {/* Angle Name Badge */}
            <div className="absolute top-0 right-0 bg-orange-500 text-black text-xs font-black px-4 py-1.5 rounded-bl-xl z-10 shadow-lg">
                إعلان {index + 1}: {variant.angle.coreLabel}
            </div>

            {/* 1. Image */}
            <div className="w-full max-w-sm mx-auto mt-6">
                <AdCreativeCanvas variant={variant} productImageSrc={productImageSrc} />
            </div>

            <div className="space-y-5 mt-2">
                {/* 2. Primary Text */}
                <div>
                    <p className="text-[10px] font-black uppercase text-orange-400 mb-1 flex items-center gap-1"><span>📝</span> النص الرئيسي (Primary Text)</p>
                    <p className="text-sm text-slate-200 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">{variant.bodyExpanded}</p>
                </div>

                {/* 3. Headline */}
                <div>
                    <p className="text-[10px] font-black uppercase text-orange-400 mb-1 flex items-center gap-1"><span>🔤</span> العنوان (Headline)</p>
                    <p className="text-xl font-black text-white bg-black/20 p-3 rounded-xl border border-white/5">{variant.primaryHook}</p>
                </div>

                {/* 4. Description */}
                <div>
                    <p className="text-[10px] font-black uppercase text-orange-400 mb-1 flex items-center gap-1"><span>📄</span> الوصف (Description)</p>
                    <p className="text-sm text-slate-300 bg-black/20 p-3 rounded-xl border border-white/5">{variant.bodyShort}</p>
                </div>

                {/* 5. Hooks */}
                <div>
                    <p className="text-[10px] font-black uppercase text-orange-400 mb-2 flex items-center gap-1"><span>🪝</span> الهوكات المتاحة للاختبار</p>
                    <ul className="list-disc list-inside flex flex-col gap-1.5 text-sm text-slate-200 bg-black/20 p-3 rounded-xl border border-white/5">
                        {variant.hookVariations.slice(0, 3).map((hook, i) => (
                            <li key={i}>{hook}</li>
                        ))}
                    </ul>
                </div>

                {/* 6. Ad Post (Copy-paste ready) */}
                <div className="bg-black/40 rounded-2xl p-4 border border-emerald-500/20 shadow-inner">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[11px] font-black uppercase text-emerald-400 flex items-center gap-1"><span>📢</span> البوست الإعلاني الكامل</p>
                        <button
                            onClick={() => navigator.clipboard.writeText(`${variant.primaryHook}\n\n${variant.bodyExpanded}\n\n${variant.cta.primary}`)}
                            className="text-xs bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl hover:bg-emerald-500/30 transition-colors font-bold shadow-md active:scale-95 flex items-center gap-2"
                        >
                            📋 نسخ البوست
                        </button>
                    </div>
                    <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-sans relative selection:bg-emerald-500/30">
                        {`${variant.primaryHook}\n\n${variant.bodyExpanded}\n\n${variant.cta.primary}`}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Main Panel ───────────────────────────────────────────────────────────────
const PerformancePanel: React.FC = () => {
    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [adSet, setAdSet] = useState<PerformanceAdSet | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isIntelligenceOpen, setIsIntelligenceOpen] = useState(false);

    // Product image for visual creative
    const [productImageSrc, setProductImageSrc] = useState<string | null>(null);
    const imgInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        if (productImageSrc) URL.revokeObjectURL(productImageSrc);
        setProductImageSrc(url);
    };

    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        setForm((f) => ({ ...f, [key]: value }));

    const handleGenerate = () => {
        if (!form.productName.trim() || !form.mainBenefit.trim() || !productImageSrc) return;
        setIsGenerating(true);
        setAdSet(null);

        // Run engines in a microtask to keep UI responsive
        setTimeout(() => {
            const profile: ProductPerformanceProfile = { ...form };
            const angles = runAngleEngine(profile);
            const result = runAdVariationEngine(profile, angles);
            setAdSet(result);
            setIsGenerating(false);
        }, 10500); // 10.5 seconds to allow the loading animation to complete
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

                {/* ── Image Upload (Required) ── */}
                <div className="md:col-span-2">
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
                            <p className="text-orange-300 font-black">أضف صورة المنتج هنا</p>
                            <p className="text-slate-400 text-xs">يفضل صورة مربعة وعالية الجودة</p>
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
                        {adSet.variants.map((v, idx) => (
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
                                        <p><span className="text-orange-400 font-bold">السوق: </span>{form.market === 'egypt' ? 'مصري 🇪🇬' : form.market === 'gulf' ? 'خليجي 🇸🇦' : 'الشرق الأوسط 🌍'}</p>
                                        <p><span className="text-orange-400 font-bold">شريحة السعر: </span>{form.priceTier === 'budget' ? 'اقتصادي (يبحث عن التوفير)' : form.priceTier === 'mid' ? 'متوسط (توازن القيمة والسعر)' : 'بريميوم (يبحث عن الجودة والمكانة)'}</p>
                                        <p><span className="text-orange-400 font-bold">مستوى الوعي: </span>{form.awarenessLevel === 'cold' ? 'بارد (يحتاج شرح وتوعية)' : form.awarenessLevel === 'warm' ? 'دافئ (يحتاج إثبات)' : 'حار (جاهز للشراء فوراً)'}</p>
                                    </div>

                                    <h4 className="text-sm font-bold text-white mt-6 mb-2">🎯 نقطة البيع الفريدة (USP)</h4>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-sm text-slate-300 leading-relaxed font-semibold">
                                        "{form.uniqueDifferentiator || form.mainBenefit}"
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-white mb-2">📈 قوة الهوكات المولدة</h4>
                                    <div className="space-y-3">
                                        {adSet.variants.map((v, i) => (
                                            <div key={i} className="flex flex-col gap-1 bg-white/5 p-3 rounded-xl border border-white/10">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-300">{v.angle.coreLabel}</span>
                                                    <span className={`font-black ${v.confidenceScore >= 85 ? 'text-emerald-400' : v.confidenceScore >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                        {v.confidenceScore}% ثقة
                                                    </span>
                                                </div>
                                                <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${v.confidenceScore}%`,
                                                            background: v.confidenceScore >= 85 ? '#10B981' : v.confidenceScore >= 70 ? '#FBBF24' : '#EF4444'
                                                        }}
                                                    />
                                                </div>
                                                {v.hookScore.wasEnhanced && (
                                                    <p className="text-[10px] text-yellow-500 mt-1">✨ تم تعزيز الهوك تلقائياً عبر AI</p>
                                                )}
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
