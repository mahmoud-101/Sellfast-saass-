import React, { useState } from 'react';
import { useProductIntelligence } from '../../context/ProductIntelligenceContext';
import { CampaignOrchestrator } from '../../orchestrator/CampaignOrchestrator';
import { useLoadingMessages, marketIntelligenceMessages } from '../../utils/useLoadingMessages';

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

    // Smart Mode State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [editableTrends, setEditableTrends] = useState<string>('');
    const [editableStrategy, setEditableStrategy] = useState<string>('');
    const { message: loadingMessage, start: startMessages, stop: stopMessages } = useLoadingMessages(marketIntelligenceMessages);

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
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Market Intelligence Hub</h1>
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
                            <span className="text-xs select-none">Advanced Tools</span>
                        </label>
                    </div>
                </div>

                {/* Global Product Context Inputs */}
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 space-y-4">
                    <h2 className="text-xl font-semibold mb-4">معلومات المنتج الأساسية</h2>
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
                            <label className="block text-sm text-gray-400 mb-1">السوق المستهدف</label>
                            <input
                                type="text"
                                value={data.targetMarket}
                                onChange={(e) => updateData({ targetMarket: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500"
                                placeholder="مثال: السعودية"
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

                    <div className="pt-4 flex justify-end">
                        <button
                            onClick={runSmartAnalysis}
                            disabled={isAnalyzing || !data.productName}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {isAnalyzing ? (
                                <div className="flex flex-col items-center gap-3 py-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-sm text-blue-300 animate-pulse">{loadingMessage}</span>
                                </div>
                            ) : (
                                <>🚀 تشغيل محركات التحليل الذكية</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Results Area */}
                {results && (
                    <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-2xl animate-fade-in-up">
                        <h3 className="text-2xl font-bold text-blue-400 mb-4">التحليل جاهز! 🎯</h3>
                        <p className="text-gray-300 mb-6">تم رصد التريندات الحالية وتحليل سوق المنتج بنجاح. النظام الآن يمتلك السياق الكامل لبناء الحملة.</p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                                <div className="text-3xl">{results.trends?.length || 0}</div>
                                <div className="text-gray-400 text-sm">تريندات تم رصدها</div>
                            </div>
                            <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                                <div className="text-3xl text-emerald-400">✓</div>
                                <div className="text-gray-400 text-sm">تم بناء استراتيجية النمو</div>
                            </div>
                        </div>

                        {/* Display Actual Generated Content Here */}
                        <div className="bg-gray-900 p-5 rounded-xl border border-gray-700 mb-6 max-h-96 overflow-y-auto custom-scrollbar">
                            {results.trends && results.trends.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-emerald-400 font-bold mb-3 border-b border-gray-800 pb-2 flex items-center justify-between">
                                        <span className="flex items-center gap-2"><span className="text-xl">🔥</span> التريندات المرصودة (قابلة للتعديل):</span>
                                        <span className="text-xs text-gray-500 font-normal">يمكنك تعديل التريندات قبل الإرسال</span>
                                    </h4>
                                    <textarea
                                        value={editableTrends}
                                        onChange={(e) => setEditableTrends(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 min-h-[150px] leading-relaxed"
                                        dir="auto"
                                    />
                                </div>
                            )}

                            {results.strategy && (
                                <div>
                                    <h4 className="text-blue-400 font-bold mb-3 border-b border-gray-800 pb-2 flex items-center justify-between">
                                        <span className="flex items-center gap-2"><span className="text-xl">🧠</span> تحليل واستراتيجية السوق (قابلة للتعديل):</span>
                                    </h4>
                                    <textarea
                                        value={editableStrategy}
                                        onChange={(e) => setEditableStrategy(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 min-h-[300px] leading-relaxed font-arabic custom-scrollbar"
                                        dir="auto"
                                    />
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleNextPhase}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all text-lg"
                        >
                            إرسال الملف إلى مصنع الحملات (Campaign Builder) ➡️
                        </button>
                    </div>
                )}

                {/* Advanced Mode Tools List */}
                {isAdvanced && (
                    <div className="mt-8 border-t border-gray-700 pt-8 animate-fade-in-up">
                        <h3 className="text-xl text-gray-400 mb-4 flex items-center gap-2">
                            <span className="text-purple-500">⚙️</span> Internal Engines (Advanced Mode)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button onClick={() => setInternalView('strategy')} className="text-right bg-gray-800 hover:bg-gray-700 p-6 rounded-xl border border-gray-600 transition-colors">
                                <div className="text-2xl mb-2">🎯</div>
                                <div className="font-bold text-lg mb-1">استراتيجية النمو السريع</div>
                                <div className="text-gray-400 text-sm">تحليل يدوي مفصل للسوق والجمهور (النسخة الكلاسيكية)</div>
                            </button>
                            <button onClick={() => setInternalView('trend')} className="text-right bg-gray-800 hover:bg-gray-700 p-6 rounded-xl border border-gray-600 transition-colors">
                                <div className="text-2xl mb-2">🔥</div>
                                <div className="font-bold text-lg mb-1">محرك التريندات</div>
                                <div className="text-gray-400 text-sm">بحث يدوي متقدم عن المحتوى الفيروسي (النسخة الكلاسيكية)</div>
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
