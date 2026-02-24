import React, { useState, useEffect } from 'react';
import { useProductIntelligence } from '../../context/ProductIntelligenceContext';
import { CampaignOrchestrator } from '../../orchestrator/CampaignOrchestrator';
import { useLoadingMessages, creativeStudioMessages } from '../../utils/useLoadingMessages';
import { saveCampaign } from '../../lib/supabase';
import AIProgressSteps, { CREATIVE_STEPS } from '../../components/AIProgressSteps';

// Import existing internal tools
import StoryboardStudio from '../../components/StoryboardStudio';
import UGCStudio from '../../components/UGCStudio';
import PhotoshootDirector from '../../components/PhotoshootDirector';
import { ContentLibrary } from '../../components/ContentLibrary';

export default function CreativeStudioHub({
    setView,
    userId,
    storyboardProject, setStoryboardProject,
    bridgeToVideo,
    ugcProject, setUgcProject,
    photoshootProject, setPhotoshootProject
}: {
    setView: (view: any) => void;
    userId: string;
    storyboardProject: any; setStoryboardProject: any;
    bridgeToVideo: any;
    ugcProject: any; setUgcProject: any;
    photoshootProject: any; setPhotoshootProject: any;
}) {
    const { data, updateData } = useProductIntelligence();
    const [isAdvanced, setIsAdvanced] = useState(false);
    const [internalView, setInternalView] = useState<'hub' | 'storyboard' | 'ugc' | 'photoshoot' | 'library'>('hub');

    // Smart Mode State
    const [isGenerating, setIsGenerating] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [editableStoryboard, setEditableStoryboard] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [savedSuccessfully, setSavedSuccessfully] = useState(false);
    const { message: loadingMessage, start: startMessages, stop: stopMessages } = useLoadingMessages(creativeStudioMessages);

    useEffect(() => {
        // If we have an angle from the Campaign Builder and Smart Mode is ON
        if (data.smartMode && data.selectedAngle && !results && !isGenerating) {
            runCreativeStudio();
        }
    }, [data.smartMode, data.selectedAngle]);

    const runCreativeStudio = async () => {
        setIsGenerating(true);
        startMessages();

        // Trigger Orchestrator to generate Video Storyboards automatically for the winning angle
        const result = await CampaignOrchestrator.generateCreatives(data, data.selectedAngle || 'حملة إعلانية للمنتج');

        if (result.success) {
            setResults(result.data);
            setEditableStoryboard(result.data.storyboard || []);
        }

        setIsGenerating(false);
        stopMessages();
    };

    const handleFinish = async () => {
        // Save the finished campaign to Supabase before navigating to the library
        if (editableStoryboard.length > 0 && userId && !savedSuccessfully) {
            setIsSaving(true);
            await saveCampaign({
                user_id: userId,
                product_name: data.productName || 'حملة بلا اسم',
                campaign_goal: data.campaignGoal || '',
                selected_angle: data.selectedAngle || '',
                ad_copy: typeof data.adPackResults?.launchPack?.adCopy === 'string'
                    ? data.adPackResults.launchPack.adCopy
                    : '',
                storyboard: editableStoryboard,
            });
            setSavedSuccessfully(true);
            setIsSaving(false);
        }
        updateData({ smartMode: false });
        setInternalView('library');
    };

    if (isAdvanced && internalView !== 'hub') {
        return (
            <div className="relative">
                <button onClick={() => setInternalView('hub')} className="absolute top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg z-50 shadow-xl border border-gray-600">العودة للمركز الإبداعي</button>
                {internalView === 'storyboard' && <StoryboardStudio project={storyboardProject} setProject={setStoryboardProject} onAutoGenerateVideo={bridgeToVideo} userId={userId} />}
                {internalView === 'ugc' && <UGCStudio project={ugcProject} setProject={setUgcProject} userId={userId} refreshCredits={() => { }} />}
                {internalView === 'photoshoot' && <PhotoshootDirector project={photoshootProject} setProject={setPhotoshootProject} userId={userId} />}
                {internalView === 'library' && <ContentLibrary userId={userId} />}
            </div>
        );
    }

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500" dir="rtl">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header & Modes */}
                <div className="flex justify-between items-center bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">🎬 الاستوديو الإبداعي المرئي</h1>
                        <p className="text-gray-400 mt-2">تحويل الزوايا التسويقية إلى محتوى مرئي قوي وجاهز للتنفيذ.</p>
                    </div>
                    <div className="flex gap-4">
                        {/* Hidden toggle for power users */}
                        <label className="flex items-center gap-2 cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                            <input
                                type="checkbox"
                                checked={isAdvanced}
                                onChange={(e) => setIsAdvanced(e.target.checked)}
                                className="w-4 h-4 text-emerald-500 bg-gray-700 border-gray-600 rounded focus:ring-emerald-600 focus:ring-2"
                            />
                            <span className="text-xs select-none">أدوات الخبراء</span>
                        </label>
                    </div>
                </div>

                {/* Global Context Viewer */}
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 space-y-4">
                    <h2 className="text-xl font-semibold mb-2">استكمال إنتاج المحتوى</h2>
                    {data.selectedAngle ? (
                        <div className="bg-emerald-900/30 border border-emerald-500/30 p-4 rounded-xl">
                            <span className="text-gray-400 text-sm block mb-1">يتم الآن إنتاج محتوى بناءً على زاوية:</span>
                            <span className="font-bold text-lg text-emerald-300">{data.selectedAngle}</span>
                        </div>
                    ) : (
                        <p className="text-gray-400">لم يتم اختيار زاوية تسويقية بعد أو المنتج غير محدد. يرجى تمرير زاوية من Campaign Builder لإخراج المحتوى تلقائياً.</p>
                    )}

                    <div className="pt-4 flex flex-col gap-4">
                        <button
                            onClick={runCreativeStudio}
                            disabled={isGenerating || !data.selectedAngle}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 self-end"
                        >
                            {isGenerating ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> جاري الإخراج...</>
                            ) : (
                                <>🎬 ابدأ إخراج المحتوى المرئي</>
                            )}
                        </button>
                        {isGenerating && (
                            <div className="bg-gray-900 border border-emerald-500/20 rounded-2xl p-5">
                                <div className="text-sm text-emerald-400 font-bold mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                    يُبنى السيناريو المرئي الآن...
                                </div>
                                <AIProgressSteps
                                    steps={CREATIVE_STEPS}
                                    isActive={isGenerating}
                                    accentColor="emerald"
                                    message={loadingMessage}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Area */}
                {results && (
                    <div className="space-y-6 animate-fade-in-up">

                        {/* Success banner */}
                        <div className="bg-emerald-900/20 border border-emerald-500/30 p-5 rounded-2xl flex items-center gap-4">
                            <div className="text-4xl">🎬</div>
                            <div>
                                <h3 className="text-xl font-bold text-emerald-400">السكريبت واللقطات جاهزة!</h3>
                                <p className="text-gray-400 text-sm mt-1">تم توليد سكريبت ريلز كامل وقائمة لقطات تقنية جاهزة للتصوير.</p>
                            </div>
                        </div>

                        {/* ── REELS SCRIPT ── */}
                        {results.reelsScript && (
                            <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
                                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">🎙️</span>
                                        <h4 className="text-emerald-400 font-bold">سكريبت الريلز — النص الصوتي الكامل</h4>
                                    </div>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(results.reelsScript)}
                                        className="text-xs text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg transition-all"
                                    >
                                        📋 نسخ السكريبت
                                    </button>
                                </div>
                                <div className="p-5">
                                    <textarea
                                        value={results.reelsScript}
                                        onChange={(e) => setResults((prev: any) => ({ ...prev, reelsScript: e.target.value }))}
                                        className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white leading-loose text-base focus:ring-2 focus:ring-emerald-500 min-h-[180px]"
                                        dir="auto"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">* النص قابل للتعديل — عدّل عليه كما تشاء قبل التصوير</p>
                                </div>
                            </div>
                        )}

                        {/* ── SHOT LIST ── */}
                        {results.shots && results.shots.length > 0 && (
                            <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
                                <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-700">
                                    <span className="text-xl">🎥</span>
                                    <h4 className="text-white font-bold">قائمة اللقطات التقنية ({results.shots.length} لقطة)</h4>
                                    <span className="text-xs text-gray-500 mr-auto">جاهزة للتصوير المباشر</span>
                                </div>
                                <div className="p-4 space-y-3">
                                    {results.shots.map((shot: any, idx: number) => (
                                        <div key={idx} className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                                                <span className="w-7 h-7 bg-emerald-600/20 border border-emerald-500/30 rounded-lg flex items-center justify-center text-emerald-400 font-black text-sm shrink-0">
                                                    {shot.shotNumber || idx + 1}
                                                </span>
                                                <span className="bg-blue-900/40 border border-blue-500/30 text-blue-300 text-xs px-2.5 py-1 rounded-lg font-bold">{shot.shotType || 'Medium'}</span>
                                                {shot.duration && <span className="bg-gray-700 text-gray-300 text-xs px-2.5 py-1 rounded-lg">⏱ {shot.duration}</span>}
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                {shot.action && (
                                                    <div>
                                                        <span className="text-gray-500 text-xs block mb-0.5">الحركة والأكشن:</span>
                                                        <p className="text-gray-200 leading-relaxed" dir="auto">{shot.action}</p>
                                                    </div>
                                                )}
                                                {shot.textOnScreen && (
                                                    <div className="bg-yellow-900/20 border border-yellow-500/30 px-3 py-2 rounded-lg">
                                                        <span className="text-yellow-400 text-xs font-bold block mb-0.5">📝 نص على الشاشة:</span>
                                                        <p className="text-yellow-100 text-sm font-semibold" dir="auto">{shot.textOnScreen}</p>
                                                    </div>
                                                )}
                                                {shot.technicalNote && (
                                                    <div>
                                                        <span className="text-gray-500 text-xs block mb-0.5">⚙️ ملاحظة تقنية:</span>
                                                        <p className="text-gray-400 text-xs leading-relaxed" dir="auto">{shot.technicalNote}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Save button */}
                        <button
                            onClick={handleFinish}
                            disabled={isSaving}
                            className={`w-full p-4 rounded-2xl font-bold text-lg transition-all border ${savedSuccessfully
                                ? 'bg-emerald-900/40 border-emerald-500 text-emerald-400'
                                : 'bg-emerald-600 hover:bg-emerald-700 border-transparent text-white'
                                }`}
                        >
                            {isSaving ? '⌛ جاري الحفظ...' : savedSuccessfully ? '✅ تم الحفظ — الذهاب للمكتبة' : '💾 حفظ الحملة الكاملة في المكتبة'}
                        </button>
                    </div>
                )}

                {/* Advanced Mode Tools List */}
                {isAdvanced && (
                    <div className="mt-8 border-t border-gray-700 pt-8 animate-fade-in-up">
                        <h3 className="text-xl text-gray-400 mb-4 flex items-center gap-2">
                            <span className="text-emerald-500">⚙️</span> الأدوات الداخلية المتقدمة
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <button onClick={() => setInternalView('storyboard')} className="text-right bg-gray-800 hover:bg-gray-700 p-4 rounded-xl border border-gray-600 transition-colors">
                                <div className="text-2xl mb-2">🎞️</div>
                                <div className="font-bold text-sm mb-1">استوديو الستوري بورد</div>
                                <div className="text-xs text-gray-500">مشاهد بصرية مفصلة</div>
                            </button>
                            <button onClick={() => setInternalView('ugc')} className="text-right bg-gray-800 hover:bg-gray-700 p-4 rounded-xl border border-gray-600 transition-colors">
                                <div className="text-2xl mb-2">🤳</div>
                                <div className="font-bold text-sm mb-1">استوديو UGC</div>
                                <div className="text-xs text-gray-500">محتوى المؤثرين</div>
                            </button>
                            <button onClick={() => setInternalView('photoshoot')} className="text-right bg-gray-800 hover:bg-gray-700 p-4 rounded-xl border border-gray-600 transition-colors">
                                <div className="text-2xl mb-2">📸</div>
                                <div className="font-bold text-sm mb-1">مدير التصوير</div>
                                <div className="text-xs text-gray-500">صور احترافية للمنتج</div>
                            </button>
                            <button onClick={() => setInternalView('library')} className="text-right bg-gray-800 hover:bg-gray-700 p-4 rounded-xl border border-gray-600 transition-colors">
                                <div className="text-2xl mb-2">📁</div>
                                <div className="font-bold text-sm mb-1">مكتبة المحتوى</div>
                                <div className="text-xs text-gray-500">حملاتك المحفوظة</div>
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
