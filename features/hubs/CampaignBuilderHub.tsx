import React, { useState, useEffect } from 'react';
import { useProductIntelligence } from '../../context/ProductIntelligenceContext';
import { CampaignOrchestrator } from '../../orchestrator/CampaignOrchestrator';
import { useLoadingMessages, campaignBuilderMessages } from '../../utils/useLoadingMessages';
import AIProgressSteps, { CAMPAIGN_STEPS } from '../../components/AIProgressSteps';

// Import existing internal tools
import AdContentFactory from '../../components/AdContentFactory'; // Ensure this matches what PerformanceStudio is usually called 
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
    const [editableAdCopy, setEditableAdCopy] = useState<string>('');
    const [editableSocialPosts, setEditableSocialPosts] = useState<string[]>([]);
    const { message: loadingMessage, start: startMessages, stop: stopMessages } = useLoadingMessages(campaignBuilderMessages);

    // If Smart Mode is on, we can auto-run the campaign builder when arriving here
    useEffect(() => {
        if (data.smartMode && !results && data.productName && !isBuilding) {
            // Auto run disabled by default so user can confirm goal first, but they can click it.
        }
    }, [data.smartMode]);

    const runCampaignBuilder = async () => {
        setIsBuilding(true);
        startMessages();

        // Trigger Orchestrator
        const result = await CampaignOrchestrator.buildCampaign(data, 'Quick');

        if (result.success) {
            setResults(result.data);

            if (result.data.strategy === 'performance') {
                setEditableAdCopy(result.data.pack?.launchPack?.adCopy || '');
            } else if (result.data.strategy === 'content') {
                setEditableSocialPosts(Array.isArray(result.data.pack) ? result.data.pack : []);
            }

            updateData({
                adPackResults: result.data.pack,
                // Pick the first angle automatically if available
                selectedAngle: result.data.pack?.creativeStrategyMatrix?.angles?.[0]?.title || result.data.pack?.campaigns?.[0]?.angle || null
            });
        }

        setIsBuilding(false);
        stopMessages();
    };

    const handleNextPhase = () => {
        // Construct the angle to pass to Creative Studio depending on strategy
        if (results?.strategy === 'performance') {
            const updatedPack = { ...results.pack };
            if (updatedPack.launchPack) updatedPack.launchPack.adCopy = editableAdCopy;

            updateData({
                adPackResults: updatedPack,
                selectedAngle: `${data.selectedAngle} | النص الإعلاني: ${editableAdCopy}`
            });
        } else if (results?.strategy === 'content') {
            updateData({
                adPackResults: editableSocialPosts,
                selectedAngle: `نشر محتوى: ${editableSocialPosts[0] || 'محتوى السوشيال ميديا'}`
            });
        }
        setView('creative_studio_hub');
    };

    if (isAdvanced && internalView !== 'hub') {
        return (
            <div className="relative">
                <button onClick={() => setInternalView('hub')} className="absolute top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg z-50">العودة للمركز</button>
                {internalView === 'performance' && (
                    <AdContentFactory
                        performanceProject={performanceProject}
                        setPerformanceProject={setPerformanceProject}
                        masterProject={powerProject} // This acts as master factory
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

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500" dir="rtl">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header & Modes */}
                <div className="flex justify-between items-center bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">🚀 مصنع الحملات الإعلانية</h1>
                        <p className="text-gray-400 mt-2">محرك بناء الحملات الإعلانية وصناعة المحتوى.</p>
                    </div>
                    <div className="flex gap-4">
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

                {/* Campaign Goal Selection */}
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 space-y-6">
                    <h2 className="text-xl font-semibold mb-4">ما هو الهدف من الحملة للمنتج: <span className="text-blue-400">{data.productName || 'غير محدد'}</span>؟</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => updateData({ campaignGoal: 'المبيعات والتحويلات' })}
                            className={`p-6 rounded-xl border text-right transition-all ${data.campaignGoal === 'المبيعات والتحويلات' ? 'bg-purple-900/40 border-purple-500' : 'bg-gray-900 border-gray-700 hover:border-gray-500'} `}
                        >
                            <div className="text-2xl mb-2">💰</div>
                            <div className="font-bold text-lg">أرقام ومبيعات مباشرة (Direct Response)</div>
                            <div className="text-gray-400 text-sm mt-1">يركز المحرك على الزوايا البيعية الحادة والـ Hooks المباشرة</div>
                        </button>

                        <button
                            onClick={() => updateData({ campaignGoal: 'بناء الوعي والانتشار' })}
                            className={`p-6 rounded-xl border text-right transition-all ${data.campaignGoal === 'بناء الوعي والانتشار' ? 'bg-blue-900/40 border-blue-500' : 'bg-gray-900 border-gray-700 hover:border-gray-500'} `}
                        >
                            <div className="text-2xl mb-2">🌍</div>
                            <div className="font-bold text-lg">بناء مجتمع وانتشار (Brand Building)</div>
                            <div className="text-gray-400 text-sm mt-1">يركز المحرك على رواية القصص والمحتوى القابل للمشاركة (Viral)</div>
                        </button>
                    </div>

                    <div className="pt-4 flex flex-col gap-4">
                        <button
                            onClick={runCampaignBuilder}
                            disabled={isBuilding || !data.productName}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 self-end"
                        >
                            {isBuilding ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> جاري البناء...</>
                            ) : (
                                <>✨ بناء الحملة الإعلانية حصرياً لهذا الهدف</>
                            )}
                        </button>
                        {isBuilding && (
                            <div className="bg-gray-900 border border-purple-500/20 rounded-2xl p-5">
                                <div className="text-sm text-purple-400 font-bold mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                    الذكاء الاصطناعي يبني حملتك...
                                </div>
                                <AIProgressSteps
                                    steps={CAMPAIGN_STEPS}
                                    isActive={isBuilding}
                                    accentColor="purple"
                                    message={loadingMessage}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Area */}
                {results && (
                    <div className="bg-purple-900/20 border border-purple-500/30 p-6 rounded-2xl animate-fade-in-up">
                        <h3 className="text-2xl font-bold text-purple-400 mb-4">الحملة جاهزة! 🚀</h3>
                        <p className="text-gray-300 mb-6">تم توليد {results.pack?.campaigns?.length || 3} زوايا تسويقية قوية. النظام التقط الزاوية الفضلى وسيوجهك تلقائياً لاستوديو الإبداع.</p>

                        <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 mb-6">
                            <div className="text-sm text-gray-500 mb-1">الزاوية المختارة تلقائياً لدخول الاستوديو:</div>
                            <div className="text-xl font-bold text-white mb-4">{data.selectedAngle || "لا يوجد"}</div>

                            {/* Display Display Generated Campaign Output */}
                            <div className="mt-4 p-4 bg-gray-800 rounded-lg max-h-96 overflow-y-auto custom-scrollbar">
                                {results.strategy === 'performance' && results.pack?.creativeStrategyMatrix?.angles && (
                                    <div>
                                        <h4 className="text-purple-400 font-bold mb-3 border-b border-gray-700 pb-2 flex items-center gap-2">🎯 جميع الزوايا البيعية:</h4>
                                        <div className="space-y-4">
                                            {results.pack.creativeStrategyMatrix.angles.map((angle: any, idx: number) => (
                                                <div key={idx} className="bg-gray-900 p-3 rounded-lg border border-gray-700">
                                                    <div className="font-bold text-emerald-400 mb-1">{angle.title}</div>
                                                    <div className="text-gray-300 text-sm">{angle.trigger}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {results.pack.launchPack?.adCopy && (
                                            <div className="mt-6">
                                                <h4 className="text-purple-400 font-bold mb-3 border-b border-gray-700 pb-2 flex items-center justify-between">
                                                    <span className="flex items-center gap-2"><span className="text-xl">📝</span> نص الإعلان المقترح (قابل للتعديل):</span>
                                                </h4>
                                                <textarea
                                                    value={editableAdCopy}
                                                    onChange={(e) => setEditableAdCopy(e.target.value)}
                                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 min-h-[250px] leading-relaxed font-arabic"
                                                    dir="auto"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {results.strategy === 'content' && editableSocialPosts.length > 0 && (
                                    <div>
                                        <h4 className="text-blue-400 font-bold mb-3 border-b border-gray-700 pb-2 flex items-center gap-2">📅 خطة المحتوى (قابلة للتعديل):</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {editableSocialPosts.map((post: string, idx: number) => (
                                                <div key={idx} className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                                                    <div className="text-blue-400 font-bold mb-2">اليوم {idx + 1}</div>
                                                    <textarea
                                                        value={post}
                                                        onChange={(e) => {
                                                            const arr = [...editableSocialPosts];
                                                            arr[idx] = e.target.value;
                                                            setEditableSocialPosts(arr);
                                                        }}
                                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 min-h-[120px] leading-relaxed font-arabic text-sm"
                                                        dir="auto"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleNextPhase}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all text-lg flex items-center justify-center gap-2"
                        >
                            <span className="text-xl">➡️</span>  إرسال الزاوية والنصوص لـ استوديو الإخراج (Creative Studio)
                        </button>
                    </div>
                )}

                {/* Advanced Mode Tools List */}
                {isAdvanced && (
                    <div className="mt-8 border-t border-gray-700 pt-8 animate-fade-in-up">
                        <h3 className="text-xl text-gray-400 mb-4 flex items-center gap-2">
                            <span className="text-purple-500">⚙️</span> Internal Engines (Advanced Mode)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button onClick={() => setInternalView('performance')} className="text-right bg-gray-800 hover:bg-gray-700 p-6 rounded-xl border border-gray-600 transition-colors">
                                <div className="text-2xl mb-2">⚡</div>
                                <div className="font-bold text-lg mb-1">Performance Studio</div>
                                <div className="text-gray-400 text-sm">مولد إعلانات المبيعات</div>
                            </button>
                            <button onClick={() => setInternalView('power')} className="text-right bg-gray-800 hover:bg-gray-700 p-6 rounded-xl border border-gray-600 transition-colors">
                                <div className="text-2xl mb-2">🔥</div>
                                <div className="font-bold text-lg mb-1">Power Studio</div>
                                <div className="text-gray-400 text-sm">توليد نصوص قوية للـ Reels</div>
                            </button>
                            <button onClick={() => setInternalView('plan')} className="text-right bg-gray-800 hover:bg-gray-700 p-6 rounded-xl border border-gray-600 transition-colors">
                                <div className="text-2xl mb-2">📅</div>
                                <div className="font-bold text-lg mb-1">خطة المحتوى الذكية</div>
                                <div className="text-gray-400 text-sm">مولد الـ 30 يوم من المحتوى</div>
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
