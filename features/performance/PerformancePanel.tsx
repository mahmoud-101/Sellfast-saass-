/**
 * PerformancePanel.tsx
 * Self-contained UI panel displayed inside CampaignBuilderHub
 * when "Performance Mode" is enabled. Orchestrates all engine calls.
 * Does NOT fetch data — accepts a product description and settings.
 */

import React, { useState, useRef } from 'react';
import type {
    Market,
    PriceTier,
    AwarenessLevel,
    CompetitionLevel,
    ProductPerformanceProfile,
    PerformanceAdSet,
    LayoutData,
} from './types';
import { runAngleEngine } from './engine/AngleEngine';
import { runAdVariationEngine } from './engine/AdVariationEngine';
import { runLayoutGenerator } from './engine/LayoutGenerator';
import AdRenderer from './renderer/AdRenderer';
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

// ─── Score Bar ────────────────────────────────────────────────────────────────
const ScoreBar: React.FC<{ label: string; value: number; max: number; color: string }> = ({
    label, value, max, color,
}) => (
    <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400 w-28 shrink-0">{label}</span>
        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${(value / max) * 100}%`, background: color }} />
        </div>
        <span className="text-white font-bold w-6 text-right">{value}</span>
    </div>
);

// ─── Confidence Badge ─────────────────────────────────────────────────────────
const ConfidenceBadge: React.FC<{ score: number }> = ({ score }) => {
    const color = score >= 85 ? '#10B981' : score >= 70 ? '#F59E0B' : '#EF4444';
    const label = score >= 85 ? 'قوي جداً' : score >= 70 ? 'جيد' : 'متوسط';
    return (
        <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black"
            style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
        >
            <span>{score}%</span>
            <span>{label}</span>
        </div>
    );
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

// ─── Main Panel ───────────────────────────────────────────────────────────────
const PerformancePanel: React.FC = () => {
    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [adSet, setAdSet] = useState<PerformanceAdSet | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeIdx, setActiveIdx] = useState(0);
    const [exportedUrl, setExportedUrl] = useState<string | null>(null);
    const [exportedTab, setExportedTab] = useState<number | null>(null);

    // Product image for visual creative
    const [productImageSrc, setProductImageSrc] = useState<string | null>(null);
    const [creativeTab, setCreativeTab] = useState<'template' | 'visual'>('template');
    const imgInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        if (productImageSrc) URL.revokeObjectURL(productImageSrc);
        setProductImageSrc(url);
        setCreativeTab('visual');
    };

    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        setForm((f) => ({ ...f, [key]: value }));

    const handleGenerate = () => {
        if (!form.productName.trim() || !form.mainBenefit.trim()) return;
        setIsGenerating(true);
        setAdSet(null);

        // Run engines in a microtask to keep UI responsive
        setTimeout(() => {
            const profile: ProductPerformanceProfile = { ...form };
            const angles = runAngleEngine(profile);
            const result = runAdVariationEngine(profile, angles);
            setAdSet(result);
            setActiveIdx(0);
            setIsGenerating(false);
        }, 0);
    };

    const activeVariant = adSet?.variants[activeIdx];
    const layoutData: LayoutData | null = activeVariant
        ? runLayoutGenerator(activeVariant)
        : null;

    const handleExported = (url: string) => {
        if (exportedUrl) URL.revokeObjectURL(exportedUrl);
        setExportedUrl(url);
        setExportedTab(activeIdx);
    };

    return (
        <div dir="rtl" className="flex flex-col gap-8 animate-in fade-in duration-300">

            {/* ── Section Header ─────────────────────────────────────── */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-xl select-none">
                    🔥
                </div>
                <div>
                    <p className="text-lg font-black text-white">وضع الأداء العالي</p>
                    <p className="text-xs text-slate-400">محرك إعلانات Ecom مُحسَّن للتحويل</p>
                </div>
            </div>

            {/* ── Input Form ────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white/3 border border-white/5 rounded-3xl p-6">
                {/* Product Name */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs text-slate-400 font-bold">اسم المنتج / الخدمة *</label>
                    <input
                        type="text"
                        value={form.productName}
                        onChange={(e) => setField('productName', e.target.value)}
                        placeholder="مثال: كريم تبييض متقدم"
                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-yellow-500/60 transition-colors"
                    />
                </div>

                {/* Main Benefit */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-bold">الفائدة الرئيسية *</label>
                    <input
                        type="text"
                        value={form.mainBenefit}
                        onChange={(e) => setField('mainBenefit', e.target.value)}
                        placeholder="مثال: بشرة مشرقة في 7 أيام"
                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-yellow-500/60 transition-colors"
                    />
                </div>

                {/* Main Pain */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-bold">الألم الأساسي للعميل</label>
                    <input
                        type="text"
                        value={form.mainPain}
                        onChange={(e) => setField('mainPain', e.target.value)}
                        placeholder="مثال: البشرة الداكنة والبهتان"
                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-yellow-500/60 transition-colors"
                    />
                </div>

                {/* Unique Differentiator */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs text-slate-400 font-bold">نقطة التميز الفريدة</label>
                    <input
                        type="text"
                        value={form.uniqueDifferentiator}
                        onChange={(e) => setField('uniqueDifferentiator', e.target.value)}
                        placeholder="مثال: التركيبة الوحيدة بـ 3 مواد نادرة ... مع ضمان استرداد المال"
                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-yellow-500/60 transition-colors"
                    />
                </div>

                {/* Market */}
                <Select<Market>
                    label="السوق المستهدف"
                    value={form.market}
                    onChange={(v) => setField('market', v)}
                    options={[
                        { value: 'egypt', label: '🇪🇬 مصر' },
                        { value: 'gulf', label: '🇸🇦 الخليج' },
                        { value: 'mena', label: '🌍 MENA' },
                    ]}
                />

                {/* Price Tier */}
                <Select<PriceTier>
                    label="شريحة السعر"
                    value={form.priceTier}
                    onChange={(v) => setField('priceTier', v)}
                    options={[
                        { value: 'budget', label: '💰 اقتصادي' },
                        { value: 'mid', label: '💎 متوسط' },
                        { value: 'premium', label: '🏆 بريميوم' },
                    ]}
                />

                {/* Awareness Level */}
                <Select<AwarenessLevel>
                    label="وعي الجمهور بالمنتج"
                    value={form.awarenessLevel}
                    onChange={(v) => setField('awarenessLevel', v)}
                    options={[
                        { value: 'cold', label: '🧊 بارد — لا يعرف المنتج' },
                        { value: 'warm', label: '🌡️ دافئ — يعرف لكن لم يشترِ' },
                        { value: 'hot', label: '🔥 حار — مستعد للشراء' },
                    ]}
                />

                {/* Competition */}
                <Select<CompetitionLevel>
                    label="مستوى المنافسة"
                    value={form.competitionLevel}
                    onChange={(v) => setField('competitionLevel', v)}
                    options={[
                        { value: 'low', label: '🟢 منخفضة' },
                        { value: 'medium', label: '🟡 متوسطة' },
                        { value: 'high', label: '🔴 عالية' },
                    ]}
                />

                {/* Generate Button */}
                <div className="md:col-span-2">
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !form.productName.trim() || !form.mainBenefit.trim()}
                        className="w-full py-4 rounded-2xl font-black text-base text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 flex items-center justify-center gap-2"
                        style={{ background: isGenerating ? '#6B7280' : 'linear-gradient(90deg, #F59E0B, #EF4444)' }}
                    >
                        {isGenerating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                <span>جاري التحليل والتوليد...</span>
                            </>
                        ) : (
                            <>🔥 توليد 5 زوايا إعلانية محترفة</>
                        )}
                    </button>
                </div>
            </div>

            {/* ── Results ────────────────────────────────────────────────── */}
            {adSet && (
                <div className="flex flex-col gap-6">
                    {/* Angle Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {adSet.variants.map((v, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveIdx(i)}
                                className={`px-4 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeIdx === i
                                    ? 'bg-white/10 text-white border border-white/20'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {v.angle.coreLabel}
                                <ConfidenceBadge score={v.confidenceScore} />
                            </button>
                        ))}
                    </div>

                    {activeVariant && layoutData && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Left: Copy Panel */}
                            <div className="flex flex-col gap-5 bg-white/3 border border-white/5 rounded-3xl p-6">

                                {/* Hook */}
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">الهوك الرئيسي</p>
                                    <p className="text-xl font-black text-white leading-snug">
                                        {activeVariant.primaryHook}
                                    </p>
                                    {activeVariant.hookScore.wasEnhanced && (
                                        <span className="text-[10px] text-yellow-400 mt-1 block">⚡ تم تعزيز الهوك تلقائياً</span>
                                    )}
                                </div>

                                {/* Hook Score */}
                                <div className="flex flex-col gap-2 bg-black/30 rounded-2xl p-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">جودة الهوك</p>
                                    <ScoreBar label="الوضوح" value={activeVariant.hookScore.clarity} max={20} color="#3B82F6" />
                                    <ScoreBar label="التحديد" value={activeVariant.hookScore.specificity} max={20} color="#10B981" />
                                    <ScoreBar label="التأثير العاطفي" value={activeVariant.hookScore.emotionalStrength} max={20} color="#EF4444" />
                                    <ScoreBar label="الإلحاح" value={activeVariant.hookScore.urgency} max={20} color="#F59E0B" />
                                    <ScoreBar label="توافق السوق" value={activeVariant.hookScore.marketAlignment} max={10} color="#8B5CF6" />
                                    <div className="border-t border-white/5 mt-1 pt-2 flex justify-between text-sm font-black">
                                        <span className="text-slate-400">الإجمالي</span>
                                        <span className="text-white">{activeVariant.hookScore.total} / 100</span>
                                    </div>
                                </div>

                                {/* Hook Variations */}
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">تنويعات الهوك</p>
                                    <div className="flex flex-col gap-2">
                                        {activeVariant.hookVariations.map((h, i) => (
                                            <p key={i} className="text-sm text-slate-300 bg-white/3 rounded-xl px-4 py-2.5 border border-white/5 leading-relaxed">
                                                {h}
                                            </p>
                                        ))}
                                    </div>
                                </div>

                                {/* Body Short */}
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">نص مختصر</p>
                                    <p className="text-sm text-slate-200 leading-relaxed">{activeVariant.bodyShort}</p>
                                </div>

                                {/* Body Expanded */}
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">نص موسّع</p>
                                    <p className="text-sm text-slate-300 leading-relaxed">{activeVariant.bodyExpanded}</p>
                                </div>

                                {/* CTA */}
                                <div className="bg-black/30 rounded-2xl p-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">الـ CTA المثالي</p>
                                    <p className="text-lg font-black text-yellow-400">{activeVariant.cta.primary}</p>
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                        {activeVariant.cta.variants.map((v, i) => (
                                            <span key={i} className="text-xs text-slate-300 bg-white/5 rounded-lg px-3 py-1">{v}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Audience */}
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">الجمهور المُقترح</p>
                                    <p className="text-sm text-slate-200">{activeVariant.recommendedAudience}</p>
                                </div>

                                {/* Testing Strategy */}
                                <div className="bg-blue-950/30 border border-blue-500/10 rounded-2xl p-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">🧪 استراتيجية الاختبار</p>
                                    <div className="flex flex-col gap-1.5">
                                        <p className="text-sm text-slate-300"><span className="text-blue-300 font-bold">الهدف: </span>{activeVariant.testingSuggestion.suggestedObjective}</p>
                                        <p className="text-sm text-slate-300"><span className="text-blue-300 font-bold">الميزانية: </span>{activeVariant.testingSuggestion.budgetSplitSuggestion}</p>
                                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{activeVariant.testingSuggestion.testingNote}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Creative Preview */}
                            <div className="flex flex-col gap-4">
                                {/* Sub-tabs: Template vs Visual Creative */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCreativeTab('template')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${creativeTab === 'template' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        🎨 كريتف نصي
                                    </button>
                                    <button
                                        onClick={() => { setCreativeTab('visual'); imgInputRef.current?.click(); }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${creativeTab === 'visual' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        📸 كريتف بصري {productImageSrc ? '✅' : '(ارفع صورة المنتج)'}
                                    </button>
                                    <input
                                        ref={imgInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                </div>

                                {/* Template-based preview */}
                                {creativeTab === 'template' && layoutData && (
                                    <>
                                        <AdRenderer
                                            layoutData={layoutData}
                                            onExported={handleExported}
                                        />
                                        {exportedUrl && exportedTab === activeIdx && (
                                            <a
                                                href={exportedUrl}
                                                download={`sellfast_ad_${activeVariant.angle.type}.png`}
                                                className="w-full py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 text-center"
                                                onClick={() => { setTimeout(() => URL.revokeObjectURL(exportedUrl!), 60000); }}
                                            >
                                                ⬇️ تحميل الصورة المُصدَّرة
                                            </a>
                                        )}
                                    </>
                                )}

                                {/* Visual (photo + copy) creative */}
                                {creativeTab === 'visual' && (
                                    <>
                                        {productImageSrc ? (
                                            <AdCreativeCanvas
                                                variant={activeVariant}
                                                productImageSrc={productImageSrc}
                                                onExported={(url) => {
                                                    setExportedUrl(url);
                                                    setExportedTab(activeIdx);
                                                }}
                                            />
                                        ) : (
                                            <button
                                                onClick={() => imgInputRef.current?.click()}
                                                className="w-full min-h-[320px] rounded-2xl border-2 border-dashed border-orange-500/30 bg-orange-500/5 flex flex-col items-center justify-center gap-3 hover:bg-orange-500/10 transition-colors cursor-pointer"
                                            >
                                                <span className="text-5xl">📸</span>
                                                <p className="text-orange-300 font-black text-sm">ارفع صورة المنتج</p>
                                                <p className="text-slate-500 text-xs">سيتم وضع النص الإعلاني عليها تلقائياً</p>
                                            </button>
                                        )}
                                        {productImageSrc && (
                                            <button
                                                onClick={() => imgInputRef.current?.click()}
                                                className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                                            >
                                                🔄 تغيير صورة المنتج
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PerformancePanel;
