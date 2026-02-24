import React, { useState } from 'react';
import { useProductIntelligence } from '../../context/ProductIntelligenceContext';
import { CampaignOrchestrator } from '../../orchestrator/CampaignOrchestrator';
import { useLoadingMessages, marketIntelligenceMessages } from '../../utils/useLoadingMessages';
import AIProgressSteps, { MARKET_STEPS } from '../../components/AIProgressSteps';
import ImageUploader from '../../components/ImageUploader';

// Import existing internal tools to be used in advanced mode
import TrendEngine from '../../components/TrendEngine';
import MarketingStudio from '../../components/MarketingStudio';

export default function MarketIntelligenceHub({
    setView,
    userId,
    trendEngine, setTrendEngine,
    marketingProject, setMarketingProject,
    bridgeToPlan
}: {
    setView: (view: any) => void,
    userId: string,
    trendEngine: any, setTrendEngine: any,
    marketingProject: any, setMarketingProject: any,
    bridgeToPlan: any
}) {
    const { data, updateData } = useProductIntelligence();
    const [isAdvanced, setIsAdvanced] = useState(false);
    const [internalView, setInternalView] = useState<'hub' | 'trend' | 'strategy'>('hub');
    const [isUploadingFiles, setIsUploadingFiles] = useState(false);

    // Smart Mode State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [editableTrends, setEditableTrends] = useState<string>('');
    const [editableStrategy, setEditableStrategy] = useState<string>('');

    // Detailed Editable Analysis
    const [targetAudience, setTargetAudience] = useState('');
    const [mainUSP, setMainUSP] = useState('');
    const [positioning, setPositioning] = useState('');
    const [pricingStrategy, setPricingStrategy] = useState('');

    const { message: loadingMessage, start: startMessages, stop: stopMessages } = useLoadingMessages(marketIntelligenceMessages);

    const handleFileUpload = async (files: File[]) => {
        if (!files.length) return;
        setIsUploadingFiles(true);
        const newImages = [];
        for (const file of files) {
            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(file);
            });
            newImages.push({
                base64,
                mimeType: file.type,
                name: file.name
            });
        }
        updateData({ productImages: [...data.productImages, ...newImages] });
        setIsUploadingFiles(false);
    };

    const handleRemoveImage = (index: number) => {
        const updated = [...data.productImages];
        updated.splice(index, 1);
        updateData({ productImages: updated });
    };

    const runSmartAnalysis = async () => {
        setIsAnalyzing(true);
        startMessages();
        // 1. Save smart mode flag
        updateData({ smartMode: true });

        // 2. Trigger Orchestrator
        const result = await CampaignOrchestrator.runMarketIntelligence(data);

        if (result.success) {
            setResults(result.data);

            // Properly serialize TrendItem objects → readable Arabic text
            const trends = result.data.trends || [];
            const trendsText = trends.map((t: any) => {
                if (typeof t === 'string') return t;
                // TrendItem shape: {topic, relevance, contentIdea, viralHook}
                const parts = [];
                if (t.topic) parts.push(`📌 ${t.topic}`);
                if (t.relevance) parts.push(`• ${t.relevance}`);
                if (t.contentIdea) parts.push(`💡 ${t.contentIdea}`);
                if (t.viralHook) parts.push(`🎣 ${t.viralHook}`);
                return parts.join('\n');
            }).join('\n\n');

            setEditableTrends(trendsText);
            setEditableStrategy(typeof result.data.categoryAnalysis === 'string'
                ? result.data.categoryAnalysis
                : JSON.stringify(result.data.categoryAnalysis || '', null, 2));

            const pa = result.data.productAnalysis || {};
            setTargetAudience(pa.targetAudience || '');
            setMainUSP(pa.mainUSP || '');
            setPositioning(pa.positioning || '');
            setPricingStrategy(pa.pricingStrategy || '');

            updateData({
                marketTrends: result.data.trends,
                categoryAnalysis: result.data.categoryAnalysis
            });
        }

        setIsAnalyzing(false);
        stopMessages();
    };

    const handleNextPhase = () => {
        // Save the edited texts back to Context
        updateData({
            marketTrends: editableTrends.split('\n').filter(t => t.trim() !== ''),
            categoryAnalysis: editableStrategy
        });
        setView('campaign_builder_hub');
    };

    if (isAdvanced && internalView === 'trend') {
        return (
            <div className="relative">
                <button onClick={() => setInternalView('hub')} className="absolute top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg z-50">العودة للمركز</button>
                <TrendEngine project={trendEngine} setProject={setTrendEngine} userId={userId} refreshCredits={() => { }} />
            </div>
        );
    }

    if (isAdvanced && internalView === 'strategy') {
        return (
            <div className="relative">
                <button onClick={() => setInternalView('hub')} className="absolute top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg z-50">العودة للمركز</button>
                <MarketingStudio project={marketingProject} setProject={setMarketingProject} onBridgeToPlan={bridgeToPlan} userId={userId} />
            </div>
        );
    }

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500" dir="rtl">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header & Modes */}
                <div className="flex justify-between items-center bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">🧠 مركز ذكاء السوق</h1>
                        <p className="text-gray-400 mt-2">تحليل المنتج، السوق، واكتشاف الزوايا البيعية تلقائياً.</p>
                    </div>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer bg-gray-900 px-4 py-2 rounded-xl border border-gray-700 hover:border-blue-500 transition-colors">
                            <input
                                type="checkbox"
                                checked={data.smartMode}
                                onChange={(e) => updateData({ smartMode: e.target.checked })}
                                className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-600 focus:ring-2"
                            />
                            <span className="font-semibold select-none">Smart Auto Flow</span>
                        </label>

                        {/* Hidden toggle for power users */}
                        <label className="flex items-center gap-2 cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                            <input
                                type="checkbox"
                                checked={isAdvanced}
                                onChange={(e) => setIsAdvanced(e.target.checked)}
                                className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-600 focus:ring-2"
                            />
                            <span className="text-xs select-none">أدوات الخبراء</span>
                        </label>
                    </div>
                </div>

                {/* Global Product Context Inputs */}
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 space-y-4">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">📸 صور المنتج الأساسية <span className="text-xs text-gray-400 font-normal">(اختياري ولكن يفضل للعرض المرئي)</span></h2>
                    <div className="h-48 mb-8">
                        <ImageUploader
                            id="product-images"
                            title="ارفع صور المنتج"
                            images={data.productImages}
                            onFileUpload={handleFileUpload}
                            onRemove={handleRemoveImage}
                            multiple={true}
                            isUploading={isUploadingFiles}
                        />
                    </div>

                    <h2 className="text-xl font-semibold mb-4 pt-4">معلومات المنتج والجمهور</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">اسم المنتج</label>
                            <input
                                type="text"
                                value={data.productName}
                                onChange={(e) => updateData({ productName: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500"
                                placeholder="مثال: سماعات بلوتوث X1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">سعر البيع</label>
                            <input
                                type="text"
                                value={data.sellingPrice}
                                onChange={(e) => updateData({ sellingPrice: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500"
                                placeholder="مثال: 199 ريال"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">السوق المستهدف</label>
                            <input
                                type="text"
                                value={data.targetMarket}
                                onChange={(e) => updateData({ targetMarket: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500"
                                placeholder="مثال: السعودية"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">الجمهور المستهدف (اختياري)</label>
                            <input
                                type="text"
                                value={data.targetAudienceInput}
                                onChange={(e) => updateData({ targetAudienceInput: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500"
                                placeholder="مثال: الشباب المهتمين بالرياضة"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">وصف المنتج</label>
                        <textarea
                            value={data.productDescription}
                            onChange={(e) => updateData({ productDescription: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 h-24"
                            placeholder="اكتب وصفاً مفصلاً للمنتج ومميزاته..."
                        />
                    </div>

                    <div className="pt-4 flex flex-col gap-4">
                        <button
                            onClick={runSmartAnalysis}
                            disabled={isAnalyzing || !data.productName}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 self-end"
                        >
                            {isAnalyzing ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> جاري التحليل...</>
                            ) : (
                                <>🚀 تشغيل محركات التحليل الذكية</>
                            )}
                        </button>

                        {/* AI Progress Steps */}
                        {isAnalyzing && (
                            <div className="bg-gray-900 border border-blue-500/20 rounded-2xl p-5">
                                <div className="text-sm text-blue-400 font-bold mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                    الذكاء الاصطناعي يعمل الآن...
                                </div>
                                <AIProgressSteps
                                    steps={MARKET_STEPS}
                                    isActive={isAnalyzing}
                                    accentColor="blue"
                                    message={loadingMessage}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Area */}
                {results && (() => {
                    const pa = results.productAnalysis;
                    return (
                        <div className="space-y-6 animate-fade-in-up">

                            {/* ── SUCCESS BANNER ── */}
                            <div className="bg-blue-900/20 border border-blue-500/30 p-5 rounded-2xl flex items-center gap-4">
                                <div className="text-4xl">🎯</div>
                                <div>
                                    <h3 className="text-xl font-bold text-blue-400">تحليل المنتج جاهز!</h3>
                                    <p className="text-gray-400 text-sm mt-1">تم تحليل منتجك بدقة بناءً على مدخلاتك. راجع النتائج وعدّل ما تشاء قبل الانتقال لمرحلة بناء الحملة.</p>
                                </div>
                            </div>

                            {/* ── PRIMARY: PRODUCT ANALYSIS CARDS ── */}
                            {pa && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Target Audience */}
                                    <div className="bg-purple-900/20 border border-purple-500/30 p-5 rounded-xl">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-xl">👥</span>
                                            <h4 className="text-purple-400 font-bold">الجمهور المستهدف</h4>
                                        </div>
                                        <textarea
                                            value={targetAudience}
                                            onChange={(e) => setTargetAudience(e.target.value)}
                                            className="w-full bg-transparent border-none p-0 text-gray-300 text-sm leading-relaxed resize-none focus:ring-0"
                                            dir="auto"
                                            rows={4}
                                        />
                                    </div>

                                    {/* Main USP */}
                                    <div className="bg-yellow-900/20 border border-yellow-500/30 p-5 rounded-xl">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-xl">⚡</span>
                                            <h4 className="text-yellow-400 font-bold">نقطة البيع الفريدة (USP)</h4>
                                        </div>
                                        <textarea
                                            value={mainUSP}
                                            onChange={(e) => setMainUSP(e.target.value)}
                                            className="w-full bg-transparent border-none p-0 text-gray-300 text-sm leading-relaxed resize-none focus:ring-0"
                                            dir="auto"
                                            rows={4}
                                        />
                                    </div>

                                    {/* Positioning */}
                                    <div className="bg-blue-900/20 border border-blue-500/30 p-5 rounded-xl">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-xl">🏆</span>
                                            <h4 className="text-blue-400 font-bold">التموضع التنافسي</h4>
                                        </div>
                                        <textarea
                                            value={positioning}
                                            onChange={(e) => setPositioning(e.target.value)}
                                            className="w-full bg-transparent border-none p-0 text-gray-300 text-sm leading-relaxed resize-none focus:ring-0"
                                            dir="auto"
                                            rows={4}
                                        />
                                    </div>

                                    {/* Pricing Strategy */}
                                    <div className="bg-emerald-900/20 border border-emerald-500/30 p-5 rounded-xl">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-xl">💰</span>
                                            <h4 className="text-emerald-400 font-bold">استراتيجية التسعير</h4>
                                        </div>
                                        <textarea
                                            value={pricingStrategy}
                                            onChange={(e) => setPricingStrategy(e.target.value)}
                                            className="w-full bg-transparent border-none p-0 text-gray-300 text-sm leading-relaxed resize-none focus:ring-0"
                                            dir="auto"
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Advantages list */}
                            {pa?.advantages && pa.advantages.length > 0 && (
                                <div className="bg-gray-800 border border-gray-700 p-5 rounded-xl">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xl">✅</span>
                                        <h4 className="text-white font-bold">المزايا الرئيسية للمنتج</h4>
                                    </div>
                                    <ul className="space-y-2">
                                        {pa.advantages.map((adv: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                                                <span className="text-emerald-400 mt-0.5">•</span>
                                                <span>{adv}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Sales Angles */}
                            {pa?.salesAngles && pa.salesAngles.length > 0 && (
                                <div className="bg-gray-800 border border-gray-700 p-5 rounded-xl">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xl">🎯</span>
                                        <h4 className="text-white font-bold">الزوايا البيعية المقترحة</h4>
                                        <span className="text-xs text-gray-500">(ستُستخدم في بناء الحملة)</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {pa.salesAngles.map((angle: string, i: number) => (
                                            <span key={i} className="bg-blue-900/40 border border-blue-500/40 text-blue-300 px-3 py-1.5 rounded-lg text-sm">
                                                {angle}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Suggested Hook */}
                            {pa?.suggestedHook && (
                                <div className="bg-orange-900/20 border border-orange-500/30 p-5 rounded-xl">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xl">🎣</span>
                                        <h4 className="text-orange-400 font-bold">الجملة الافتتاحية المقترحة للإعلان</h4>
                                    </div>
                                    <p className="text-gray-200 text-base font-semibold leading-relaxed italic">"{pa.suggestedHook}"</p>
                                </div>
                            )}

                            {/* Editable Strategy Summary */}
                            <div className="bg-gray-800 border border-gray-700 p-5 rounded-xl">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">🧠</span>
                                        <h4 className="text-blue-400 font-bold">ملخص تحليل الاستراتيجية (قابل للتعديل)</h4>
                                    </div>
                                    <span className="text-xs text-gray-500">يُرسل للمرحلة التالية</span>
                                </div>
                                <textarea
                                    value={editableStrategy}
                                    onChange={(e) => setEditableStrategy(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 min-h-[120px] leading-relaxed text-sm"
                                    dir="auto"
                                    placeholder="سيظهر هنا ملخص التحليل التسويقي..."
                                />
                            </div>

                            {/* SECONDARY: Trends (Collapsible) */}
                            {results.trends && results.trends.length > 0 && editableTrends && (
                                <details className="bg-gray-800 border border-gray-700 rounded-xl">
                                    <summary className="p-4 cursor-pointer flex items-center gap-2 text-gray-400 hover:text-white font-bold select-none">
                                        <span className="text-lg">🔥</span>
                                        تريندات السوق الحالية ({results.trends.length} تريند) — انقر للعرض
                                    </summary>
                                    <div className="p-4 border-t border-gray-700">
                                        <textarea
                                            value={editableTrends}
                                            onChange={(e) => setEditableTrends(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-gray-300 focus:ring-2 focus:ring-orange-500 min-h-[200px] leading-relaxed text-sm"
                                            dir="auto"
                                        />
                                    </div>
                                </details>
                            )}

                            {/* NEXT PHASE BUTTON */}
                            <button
                                onClick={handleNextPhase}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all text-lg"
                            >
                                إرسال التحليل إلى مصنع الحملات ➡️
                            </button>
                        </div>
                    );
                })()}

                {/* Advanced Mode Tools List */}
                {isAdvanced && (
                    <div className="mt-8 border-t border-gray-700 pt-8 animate-fade-in-up">
                        <h3 className="text-xl text-gray-400 mb-4 flex items-center gap-2">
                            <span className="text-purple-500">⚙️</span> أدوات متقدمة (Advanced Mode)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button onClick={() => setInternalView('strategy')} className="text-right bg-gray-800 hover:bg-gray-700 p-6 rounded-xl border border-gray-600 transition-colors">
                                <div className="text-2xl mb-2">🎯</div>
                                <div className="font-bold text-lg mb-1">استراتيجية النمو السريع</div>
                                <div className="text-gray-400 text-sm">تحليل يدوي مفصل للسوق والجمهور</div>
                            </button>
                            <button onClick={() => setInternalView('trend')} className="text-right bg-gray-800 hover:bg-gray-700 p-6 rounded-xl border border-gray-600 transition-colors">
                                <div className="text-2xl mb-2">🔥</div>
                                <div className="font-bold text-lg mb-1">محرك التريندات</div>
                                <div className="text-gray-400 text-sm">بحث يدوي متقدم عن المحتوى الفيروسي</div>
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

