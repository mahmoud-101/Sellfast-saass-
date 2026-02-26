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
        }, 1500); // Added slight delay for UX loading feel
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
            {adSet && productImageSrc && (
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

                </div>
            )}
        </div>
    );
};

export default PerformancePanel;
