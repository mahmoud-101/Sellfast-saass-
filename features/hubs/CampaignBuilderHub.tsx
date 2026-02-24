import React, { useState } from 'react';
import { useProductIntelligence } from '../../context/ProductIntelligenceContext';
import { CampaignOrchestrator } from '../../orchestrator/CampaignOrchestrator';
import { useLoadingMessages, campaignBuilderMessages } from '../../utils/useLoadingMessages';
import AIProgressSteps, { CAMPAIGN_STEPS } from '../../components/AIProgressSteps';

// Import existing internal tools
import AdContentFactory from '../../components/AdContentFactory';
import PowerStudio from '../../components/PowerStudio';
import PlanStudio from '../../components/PlanStudio';

export default function CampaignBuilderHub({
    setView,
    userId,
    performanceProject, setPerformanceProject,
    powerProject, setPowerProject,
    planProject, setPlanProject,
    bridgeToVideo, bridgeToPhotoshoot
}: {
    setView: (view: any) => void,
    userId: string,
    performanceProject: any, setPerformanceProject: any,
    powerProject: any, setPowerProject: any,
    planProject: any, setPlanProject: any,
    bridgeToVideo: any, bridgeToPhotoshoot: any
}) {
    const { data, updateData } = useProductIntelligence();
    const [isAdvanced, setIsAdvanced] = useState(false);
    const [internalView, setInternalView] = useState<'hub' | 'performance' | 'power' | 'plan'>('hub');

    // Smart Mode State
    const [isBuilding, setIsBuilding] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'ads' | 'ugc' | 'hooks' | 'angles'>('ads');
    const { message: loadingMessage, start: startMessages, stop: stopMessages } = useLoadingMessages(campaignBuilderMessages);

    const runCampaignBuilder = async () => {
        setIsBuilding(true);
        startMessages();

        // Run ALL campaign tools in parallel
        const result = await CampaignOrchestrator.runAllCampaignTools(data);

        if (result.success) {
            setResults(result.data);
            // Pick first angle for Creative Studio
            const firstAngle = Array.isArray(result.data.salesAngles) && result.data.salesAngles.length > 0
                ? result.data.salesAngles[0].angle
                : (data.selectedAngle || data.productName || '');
            updateData({ selectedAngle: firstAngle });
        }

        setIsBuilding(false);
        stopMessages();
    };

    const handleNextPhase = () => {
        setView('creative_studio_hub');
    };

    // Advanced mode — internal tool selected
    if (isAdvanced && internalView !== 'hub') {
        return (
            <div className="relative">
                <button onClick={() => setInternalView('hub')} className="absolute top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg z-50">العودة للمركز</button>
                {internalView === 'performance' && (
                    <AdContentFactory
                        performanceProject={performanceProject}
                        setPerformanceProject={setPerformanceProject}
                        masterProject={powerProject}
                        setMasterProject={setPowerProject}
                        userId={userId}
                        refreshCredits={() => { }}
                        onBridgeToVideo={bridgeToVideo}
                    />
                )}
                {internalView === 'power' && <PowerStudio project={powerProject} setProject={setPowerProject} userId={userId} refreshCredits={() => { }} />}
                {internalView === 'plan' && <PlanStudio project={planProject} setProject={setPlanProject} onBridgeToPhotoshoot={bridgeToPhotoshoot} userId={userId} />}
            </div>
        );
    }

    const TABS = [
        { id: 'ads', label: '📣 الإعلانات المباشرة' },
        { id: 'ugc', label: '🤳 سكريبت UGC' },
        { id: 'hooks', label: '🎣 الخطافات الفيرال' },
        { id: 'angles', label: '🎯 الزوايا التسويقية' },
    ] as const;

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500" dir="rtl">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-center bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">🚀 مصنع الحملات الإعلانية</h1>
                        <p className="text-gray-400 mt-2">كل الأدوات تشتغل مع بعض — إعلانات، UGC، خطافات، وزوايا دفعة واحدة.</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                        <input type="checkbox" checked={isAdvanced} onChange={(e) => setIsAdvanced(e.target.checked)} className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-600" />
                        <span className="text-xs select-none">أدوات الخبراء</span>
                    </label>
                </div>

                {/* Campaign Goal Selection + Run Button */}
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 space-y-6">
                    <h2 className="text-xl font-semibold mb-4">
                        ما هو الهدف من الحملة للمنتج: <span className="text-blue-400">{data.productName || 'غير محدد'}</span>؟
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => updateData({ campaignGoal: 'المبيعات والتحويلات' })}
                            className={`p-6 rounded-xl border text-right transition-all ${data.campaignGoal === 'المبيعات والتحويلات' ? 'bg-purple-900/40 border-purple-500' : 'bg-gray-900 border-gray-700 hover:border-gray-500'}`}
                        >
                            <div className="text-2xl mb-2">💰</div>
                            <div className="font-bold text-lg">أرقام ومبيعات مباشرة (Direct Response)</div>
                            <div className="text-gray-400 text-sm mt-1">يركز المحرك على الزوايا البيعية الحادة والـ Hooks المباشرة</div>
                        </button>
                        <button
                            onClick={() => updateData({ campaignGoal: 'بناء الوعي والانتشار' })}
                            className={`p-6 rounded-xl border text-right transition-all ${data.campaignGoal === 'بناء الوعي والانتشار' ? 'bg-blue-900/40 border-blue-500' : 'bg-gray-900 border-gray-700 hover:border-gray-500'}`}
                        >
                            <div className="text-2xl mb-2">🌍</div>
                            <div className="font-bold text-lg">بناء مجتمع وانتشار (Brand Building)</div>
                            <div className="text-gray-400 text-sm mt-1">يركز المحرك على رواية القصص والمحتوى القابل للمشاركة</div>
                        </button>
                    </div>

                    <div className="pt-4 flex flex-col gap-4">
                        <button
                            onClick={runCampaignBuilder}
                            disabled={isBuilding || !data.productName}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 self-end"
                        >
                            {isBuilding
                                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> جاري تشغيل كل الأدوات...</>
                                : <>✨ شغّل كل الأدوات دفعة واحدة</>
                            }
                        </button>
                        {isBuilding && (
                            <div className="bg-gray-900 border border-purple-500/20 rounded-2xl p-5">
                                <div className="text-sm text-purple-400 font-bold mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                    الذكاء الاصطناعي يشغّل 4 أدوات في نفس الوقت...
                                </div>
                                <AIProgressSteps steps={CAMPAIGN_STEPS} isActive={isBuilding} accentColor="purple" message={loadingMessage} />
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Results Area — Tabbed Panel ── */}
                {results && (
                    <div className="space-y-4 animate-fade-in-up">

                        {/* Success banner + quick CTA */}
                        <div className="bg-purple-900/20 border border-purple-500/30 p-5 rounded-2xl flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">🚀</span>
                                <div>
                                    <div className="text-purple-400 font-bold">كل الأدوات اشتغلت!</div>
                                    <div className="text-gray-400 text-sm">الزاوية المختارة للاستوديو الإبداعي:</div>
                                    <div className="text-white font-bold text-sm mt-0.5">{data.selectedAngle || '—'}</div>
                                </div>
                            </div>
                            <button onClick={handleNextPhase} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm flex items-center gap-2">
                                ➡️ استوديو الإبداع
                            </button>
                        </div>

                        {/* Tab bar */}
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {TABS.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveTab(t.id)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeTab === t.id ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'}`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab content panel */}
                        <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">

                            {/* ── الإعلانات المباشرة ── */}
                            {activeTab === 'ads' && (
                                <div className="p-5 space-y-4">
                                    <h4 className="text-purple-400 font-bold flex items-center gap-2">
                                        <span>📣</span> 3 إعلانات مباشرة جاهزة للنشر
                                    </h4>
                                    {Array.isArray(results.performanceAds) ? results.performanceAds.map((ad: any, i: number) => (
                                        <div key={i} className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-purple-300 font-bold text-sm">{ad.headline}</span>
                                                <div className="flex items-center gap-2">
                                                    {ad.format && <span className="text-xs text-gray-500 bg-gray-800 border border-gray-600 px-2 py-0.5 rounded">{ad.format}</span>}
                                                    <button onClick={() => navigator.clipboard.writeText(`${ad.headline}\n\n${ad.body}\n\n${ad.cta}`)} className="text-xs text-gray-400 hover:text-white bg-gray-700 px-2 py-1 rounded">📋 نسخ</button>
                                                </div>
                                            </div>
                                            <p className="text-gray-200 text-sm leading-relaxed" dir="auto">{ad.body}</p>
                                            {ad.cta && <div className="mt-2 text-emerald-400 text-xs font-bold">👉 {ad.cta}</div>}
                                        </div>
                                    )) : (
                                        <div className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed p-3 bg-gray-900 rounded-xl" dir="auto">
                                            {typeof results.performanceAds === 'string' ? results.performanceAds : 'لم يتم توليد إعلانات.'}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── سكريبت UGC ── */}
                            {activeTab === 'ugc' && (
                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-yellow-400 font-bold flex items-center gap-2">
                                            <span>🤳</span> سكريبت UGC — صوت مؤثر حقيقي
                                        </h4>
                                        <button onClick={() => navigator.clipboard.writeText(results.ugcScript || '')} className="text-xs text-gray-400 hover:text-white bg-gray-700 px-3 py-1.5 rounded-lg">📋 نسخ</button>
                                    </div>
                                    <textarea
                                        value={results.ugcScript || ''}
                                        onChange={(e) => setResults((prev: any) => ({ ...prev, ugcScript: e.target.value }))}
                                        className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white leading-loose min-h-[220px] focus:ring-2 focus:ring-yellow-500"
                                        dir="auto"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">قابل للتعديل — للاستخدام مع مؤثر حقيقي أو Avatar AI (HeyGen, Synthesia)</p>
                                </div>
                            )}

                            {/* ── الخطافات الفيرال ── */}
                            {activeTab === 'hooks' && (
                                <div className="p-5">
                                    <h4 className="text-pink-400 font-bold flex items-center gap-2 mb-4">
                                        <span>🎣</span> 10 خطافات فيرال — أوقف التمرير من أول ثانية
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {Array.isArray(results.viralHooks) ? results.viralHooks.map((h: any, i: number) => (
                                            <div key={i} className="bg-gray-900 border border-gray-700 rounded-xl p-3">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <p className="text-white font-bold text-sm leading-snug flex-1" dir="auto">"{h.hook}"</p>
                                                    <button onClick={() => navigator.clipboard.writeText(h.hook)} className="text-xs text-gray-500 hover:text-white shrink-0 bg-gray-800 px-2 py-1 rounded">📋</button>
                                                </div>
                                                <div className="flex gap-2 mt-1.5 flex-wrap">
                                                    {h.type && <span className="text-xs bg-pink-900/40 border border-pink-500/30 text-pink-300 px-2 py-0.5 rounded">{h.type}</span>}
                                                    {h.why && <span className="text-xs text-gray-500 italic">{h.why}</span>}
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="col-span-2 text-gray-300 leading-relaxed text-sm whitespace-pre-wrap" dir="auto">
                                                {typeof results.viralHooks === 'string' ? results.viralHooks : 'لم يتم توليد خطافات.'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── الزوايا التسويقية ── */}
                            {activeTab === 'angles' && (
                                <div className="p-5">
                                    <h4 className="text-blue-400 font-bold flex items-center gap-2 mb-4">
                                        <span>🎯</span> 6 زوايا تسويقية — اختر زاوية للاستوديو الإبداعي
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Array.isArray(results.salesAngles) ? results.salesAngles.map((a: any, i: number) => (
                                            <div
                                                key={i}
                                                onClick={() => updateData({ selectedAngle: a.angle })}
                                                className={`bg-gray-900 border rounded-xl p-4 cursor-pointer transition-all hover:border-blue-500 ${data.selectedAngle === a.angle ? 'border-blue-500 ring-1 ring-blue-500/30' : 'border-gray-700'}`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-blue-300 font-bold text-sm">{a.angle}</span>
                                                    {data.selectedAngle === a.angle && (
                                                        <span className="text-xs text-blue-400 bg-blue-900/40 px-2 py-0.5 rounded border border-blue-500/30">✓ مختارة</span>
                                                    )}
                                                </div>
                                                {a.concept && <p className="text-gray-400 text-xs leading-relaxed mb-1" dir="auto">{a.concept}</p>}
                                                {a.exampleHook && <p className="text-gray-200 text-xs italic" dir="auto">"{a.exampleHook}"</p>}
                                                {a.targetEmotion && <span className="text-xs text-purple-400 mt-1 block">🎭 {a.targetEmotion}</span>}
                                            </div>
                                        )) : (
                                            <div className="col-span-2 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap" dir="auto">
                                                {typeof results.salesAngles === 'string' ? results.salesAngles : 'لم يتم توليد زوايا.'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bottom CTA */}
                        <button
                            onClick={handleNextPhase}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all text-lg flex items-center justify-center gap-2"
                        >
                            <span className="text-xl">🎬</span> إرسال للاستوديو الإبداعي (Creative Studio)
                        </button>
                    </div>
                )}

                {/* Advanced Mode — internal tools */}
                {isAdvanced && (
                    <div className="mt-8 border-t border-gray-700 pt-8 animate-fade-in-up">
                        <h3 className="text-xl text-gray-400 mb-4 flex items-center gap-2">
                            <span className="text-purple-500">⚙️</span> الأدوات الداخلية المتقدمة
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button onClick={() => setInternalView('performance')} className="text-right bg-gray-800 hover:bg-gray-700 p-6 rounded-xl border border-gray-600 transition-colors">
                                <div className="text-2xl mb-2">⚡</div>
                                <div className="font-bold text-lg mb-1">مصنع الإعلانات</div>
                                <div className="text-gray-400 text-sm">مولد إعلانات الأداء المتقدم</div>
                            </button>
                            <button onClick={() => setInternalView('power')} className="text-right bg-gray-800 hover:bg-gray-700 p-6 rounded-xl border border-gray-600 transition-colors">
                                <div className="text-2xl mb-2">🔥</div>
                                <div className="font-bold text-lg mb-1">باور ستوديو</div>
                                <div className="text-gray-400 text-sm">توليد نصوص قوية للـ Reels</div>
                            </button>
                            <button onClick={() => setInternalView('plan')} className="text-right bg-gray-800 hover:bg-gray-700 p-6 rounded-xl border border-gray-600 transition-colors">
                                <div className="text-2xl mb-2">📅</div>
                                <div className="font-bold text-lg mb-1">خطة المحتوى</div>
                                <div className="text-gray-400 text-sm">مولد خطة ٣٠ يوم من المحتوى</div>
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
