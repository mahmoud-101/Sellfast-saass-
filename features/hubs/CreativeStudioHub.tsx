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
    const [activeTab, setActiveTab] = useState<'script' | 'shots' | 'ugc' | 'photoshoot'>('script');
    const [isSaving, setIsSaving] = useState(false);
    const [savedSuccessfully, setSavedSuccessfully] = useState(false);

    // Progressive Loading & Editable State
    const [reelsScript, setReelsScript] = useState('');
    const [shots, setShots] = useState<any[]>([]);
    const [ugcScript, setUgcScript] = useState('');
    const [photoshootBrief, setPhotoshootBrief] = useState<any>(null);

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
        setSavedSuccessfully(false);

        const angle = data.selectedAngle || data.productName || 'حملة إعلانية للمنتج';
        const result = await CampaignOrchestrator.runAllCreativeTools(data, angle);

        if (result.success) {
            setResults(result.data);
            setReelsScript(result.data.reelsScript || '');
            setShots(result.data.shots || []);
            setUgcScript(result.data.ugcScript || '');
            setPhotoshootBrief(result.data.photoshootBrief || null);
        }

        setIsGenerating(false);
        stopMessages();
    };

    const handleFinish = async () => {
        if (results && userId && !savedSuccessfully) {
            setIsSaving(true);

            // Map the unified results to the database fields
            await saveCampaign({
                user_id: userId,
                product_name: data.productName || 'حملة بلا اسم',
                campaign_goal: data.campaignGoal || '',
                selected_angle: data.selectedAngle || '',

                // Creative Studio Results (Using Edited State)
                reels_script: reelsScript,
                shots: shots,
                photoshoot_brief: photoshootBrief,
                ugc_script: ugcScript,

                // Enterprise Info
                version: 1,
                status: 'final'
            });
            setSavedSuccessfully(true);
            setIsSaving(false);
        }
        updateData({ smartMode: false });
        setInternalView('library');
    };

    // Advanced tool mode - show internal tool
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

    const TABS = [
        { id: 'script', label: '🎙️ سكريبت الريلز' },
        { id: 'shots', label: '🎥 قائمة اللقطات' },
        { id: 'ugc', label: '🤳 سكريبت UGC' },
        { id: 'photoshoot', label: '📸 بريف التصوير' },
    ] as const;

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500" dir="rtl">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-center bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">🎬 الاستوديو الإبداعي الكامل</h1>
                        <p className="text-gray-400 mt-2">سكريبت ريلز + لقطات تقنية + UGC + بريف تصوير — كلها دفعة واحدة.</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                        <input type="checkbox" checked={isAdvanced} onChange={(e) => setIsAdvanced(e.target.checked)} className="w-4 h-4 text-emerald-500 bg-gray-700 border-gray-600 rounded" />
                        <span className="text-xs select-none">أدوات الخبراء</span>
                    </label>
                </div>

                {/* Info + Run Button */}
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-emerald-900/30 border border-emerald-500/30 px-4 py-2 rounded-xl text-sm">
                            <span className="text-gray-400">الزاوية التسويقية: </span>
                            <span className="text-emerald-400 font-bold">{data.selectedAngle || data.productName || 'غير محدد'}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        {[
                            { icon: '🎙️', title: 'سكريبت ريلز', desc: 'نص صوتي بالعامية' },
                            { icon: '🎥', title: 'قائمة لقطات', desc: '8-10 لقطات تقنية' },
                            { icon: '🤳', title: 'سكريبت UGC', desc: 'صوت مؤثر حقيقي' },
                            { icon: '📸', title: 'بريف تصوير', desc: 'خلفيات، إكسسوارات، زوايا' },
                        ].map((t, i) => (
                            <div key={i} className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-center">
                                <div className="text-2xl mb-1">{t.icon}</div>
                                <div className="text-white text-xs font-bold">{t.title}</div>
                                <div className="text-gray-500 text-xs">{t.desc}</div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={runCreativeStudio}
                        disabled={isGenerating || (!data.productName && !data.selectedAngle)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
                    >
                        {isGenerating
                            ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> جاري تشغيل كل الأدوات...</>
                            : <>✨ شغّل الاستوديو الكامل (4 أدوات دفعة واحدة)</>
                        }
                    </button>

                    {isGenerating && (
                        <div className="bg-gray-900 border border-emerald-500/20 rounded-2xl p-5 mt-4">
                            <div className="text-sm text-emerald-400 font-bold mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                الذكاء الاصطناعي يشغّل 4 أدوات إبداعية تلقائياً...
                            </div>
                            <AIProgressSteps steps={CREATIVE_STEPS} isActive={isGenerating} accentColor="emerald" message={loadingMessage} />
                        </div>
                    )}
                </div>

                {/* ── Results Area — Tabbed Panel ── */}
                {results && (
                    <div className="space-y-4 animate-fade-in-up">

                        {/* Success banner */}
                        <div className="bg-emerald-900/20 border border-emerald-500/30 p-5 rounded-2xl flex items-center gap-4">
                            <div className="text-4xl">🎬</div>
                            <div>
                                <h3 className="text-xl font-bold text-emerald-400">الاستوديو الكامل جاهز!</h3>
                                <p className="text-gray-400 text-sm mt-1">4 أدوات إبداعية اشتغلت تلقائياً — تصفح كل واحدة من التابات.</p>
                            </div>
                        </div>

                        {/* Tab bar */}
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {TABS.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveTab(t.id)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeTab === t.id ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'}`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab content */}
                        <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">

                            {/* ── سكريبت الريلز ── */}
                            {activeTab === 'script' && (
                                <div className="p-5">
                                    <textarea
                                        value={reelsScript}
                                        onChange={(e) => setReelsScript(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white leading-loose text-base focus:ring-2 focus:ring-emerald-500 min-h-[200px]"
                                        dir="auto"
                                    />
                                    <div className="flex items-center gap-3 mt-4">
                                        <button
                                            onClick={() => bridgeToVideo(reelsScript)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl text-sm font-black flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
                                        >
                                            🎙️ توليد التعليق الصوتي AI
                                        </button>
                                        <button
                                            onClick={() => setInternalView('library')}
                                            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-xl text-sm font-black transition-all"
                                        >
                                            📁 حفظ للمراجعة
                                        </button>
                                    </div>
                                    <p className="text-xs text-emerald-500 mt-2 font-bold animate-pulse">🛠️ يمكنك التعديل مباشرة على النص أو توليد الصوت فوراً</p>
                                </div>
                            )}

                            {/* ── قائمة اللقطات ── */}
                            {activeTab === 'shots' && (
                                <div className="p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-xl">🎥</span>
                                        <h4 className="text-white font-bold">قائمة اللقطات التقنية ({Array.isArray(results.shots) ? results.shots.length : 0} لقطة)</h4>
                                        <span className="text-xs text-gray-500 mr-auto">جاهزة للتصوير المباشر</span>
                                    </div>
                                    <div className="space-y-3">
                                        {Array.isArray(shots) && shots.length > 0 ? shots.map((shot: any, idx: number) => (
                                            <div key={idx} className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                                                <div className="flex items-center gap-3 mb-3 flex-wrap">
                                                    <span className="w-7 h-7 bg-emerald-600/20 border border-emerald-500/30 rounded-lg flex items-center justify-center text-emerald-400 font-black text-sm shrink-0">
                                                        {shot.shotNumber || idx + 1}
                                                    </span>
                                                    <span className="bg-blue-900/40 border border-blue-500/30 text-blue-300 text-xs px-2.5 py-1 rounded-lg font-bold">{shot.shotType || 'Medium'}</span>
                                                    {shot.duration && <span className="bg-gray-700 text-gray-300 text-xs px-2.5 py-1 rounded-lg">⏱ {shot.duration}</span>}
                                                </div>
                                                <div className="flex flex-col md:flex-row gap-4">
                                                    {shot.imageUrl && (
                                                        <div className="w-full md:w-32 h-56 shrink-0 rounded-xl overflow-hidden border border-emerald-500/30">
                                                            <img src={shot.imageUrl} alt={`Shot ${shot.shotNumber}`} className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 space-y-2 text-sm">
                                                        {shot.action && (
                                                            <div>
                                                                <span className="text-gray-500 text-xs block mb-0.5">الحركة والأكشن:</span>
                                                                <textarea
                                                                    value={shot.action}
                                                                    onChange={(e) => {
                                                                        const newShots = [...shots];
                                                                        newShots[idx].action = e.target.value;
                                                                        setShots(newShots);
                                                                    }}
                                                                    className="w-full bg-transparent border-none p-0 text-gray-200 leading-relaxed resize-none focus:ring-0"
                                                                    dir="auto"
                                                                />
                                                            </div>
                                                        )}
                                                        {shot.textOnScreen && (
                                                            <div className="bg-yellow-900/20 border border-yellow-500/30 px-3 py-2 rounded-lg">
                                                                <span className="text-yellow-400 text-xs font-bold block mb-0.5">📝 نص على الشاشة:</span>
                                                                <input
                                                                    value={shot.textOnScreen}
                                                                    onChange={(e) => {
                                                                        const newShots = [...shots];
                                                                        newShots[idx].textOnScreen = e.target.value;
                                                                        setShots(newShots);
                                                                    }}
                                                                    className="w-full bg-transparent border-none p-0 text-yellow-100 text-sm font-semibold focus:ring-0"
                                                                    dir="auto"
                                                                />
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
                                            </div>
                                        )) : (
                                            <div className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed p-3 bg-gray-900 rounded-xl" dir="auto">
                                                {typeof results.shots === 'string' ? results.shots : 'لم يتم توليد لقطات.'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── سكريبت UGC ── */}
                            {activeTab === 'ugc' && (
                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-yellow-400 font-bold flex items-center gap-2">
                                            <span>🤳</span> سكريبت UGC — صوت مؤثر أمام الكاميرا
                                        </h4>
                                        <button onClick={() => navigator.clipboard.writeText(results.ugcScript || '')} className="text-xs text-gray-400 hover:text-white bg-gray-700 px-3 py-1.5 rounded-lg">📋 نسخ</button>
                                    </div>
                                    <textarea
                                        value={ugcScript}
                                        onChange={(e) => setUgcScript(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white leading-loose min-h-[220px] focus:ring-2 focus:ring-yellow-500"
                                        dir="auto"
                                    />
                                    <div className="flex items-center gap-3 mt-4">
                                        <button
                                            onClick={() => bridgeToVideo(ugcScript)}
                                            className="bg-yellow-600 hover:bg-yellow-700 text-black px-6 py-2 rounded-xl text-sm font-black flex items-center gap-2 transition-all shadow-lg shadow-yellow-900/20"
                                        >
                                            🎙️ توليد صوت المؤثر (AI)
                                        </button>
                                        <button
                                            onClick={() => setInternalView('library')}
                                            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-xl text-sm font-black transition-all"
                                        >
                                            📁 حفظ في المكتبة
                                        </button>
                                    </div>
                                    <p className="text-xs text-yellow-500 mt-2 font-bold animate-pulse">🛠️ سكريبت الـ UGC جاهز للإرسال للاستوديو</p>
                                </div>
                            )}

                            {/* ── بريف التصوير ── */}
                            {activeTab === 'photoshoot' && (
                                <div className="p-5">
                                    <h4 className="text-pink-400 font-bold flex items-center gap-2 mb-4">
                                        <span>📸</span> بريف التصوير الاحترافي
                                    </h4>
                                    {photoshootBrief && typeof photoshootBrief === 'object' ? (
                                        <div className="space-y-4">
                                            {photoshootBrief.concept && (
                                                <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-col md:flex-row gap-6">
                                                    {photoshootBrief.conceptImageUrl && (
                                                        <div className="w-full md:w-64 h-64 shrink-0 rounded-2xl overflow-hidden border border-pink-500/30 shadow-2xl">
                                                            <img src={photoshootBrief.conceptImageUrl} alt="Concept Preview" className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <span className="text-pink-400 font-bold text-xs block mb-1">💡 الفكرة البصرية الكاملة</span>
                                                        <textarea
                                                            value={photoshootBrief.concept}
                                                            onChange={(e) => setPhotoshootBrief({ ...photoshootBrief, concept: e.target.value })}
                                                            className="w-full bg-transparent border-none p-0 text-white text-lg leading-relaxed resize-none focus:ring-0"
                                                            dir="auto"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {photoshootBrief.backgrounds && (
                                                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                                                        <span className="text-blue-400 font-bold text-xs block mb-2">🖼️ الخلفيات</span>
                                                        <ul className="space-y-1">{photoshootBrief.backgrounds.map((b: string, i: number) => (
                                                            <li key={i} className="text-gray-300 text-sm" dir="auto">• {b}</li>
                                                        ))}</ul>
                                                    </div>
                                                )}
                                                {photoshootBrief.props && (
                                                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                                                        <span className="text-yellow-400 font-bold text-xs block mb-2">🎨 الإكسسوارات</span>
                                                        <ul className="space-y-1">{photoshootBrief.props.map((p: string, i: number) => (
                                                            <li key={i} className="text-gray-300 text-sm" dir="auto">• {p}</li>
                                                        ))}</ul>
                                                    </div>
                                                )}
                                                <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-2">
                                                    {photoshootBrief.colors && (
                                                        <div>
                                                            <span className="text-purple-400 font-bold text-xs block mb-1">🎨 لوحة الألوان</span>
                                                            <p className="text-gray-300 text-sm" dir="auto">{photoshootBrief.colors}</p>
                                                        </div>
                                                    )}
                                                    {photoshootBrief.lighting && (
                                                        <div>
                                                            <span className="text-orange-400 font-bold text-xs block mb-1">💡 الإضاءة</span>
                                                            <p className="text-gray-300 text-sm" dir="auto">{photoshootBrief.lighting}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {photoshootBrief.shots && photoshootBrief.shots.length > 0 && (
                                                <div>
                                                    <span className="text-pink-400 font-bold text-xs block mb-2">📷 اللقطات المقترحة</span>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {photoshootBrief.shots.map((s: any, i: number) => (
                                                            <div key={i} className="bg-gray-900 border border-gray-700 rounded-xl p-3">
                                                                <div className="text-white font-bold text-sm mb-1">{s.name}</div>
                                                                {s.setup && <p className="text-gray-400 text-xs" dir="auto">{s.setup}</p>}
                                                                {s.mood && <span className="text-pink-300 text-xs">{s.mood}</span>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm p-3 bg-gray-900 rounded-xl" dir="auto">
                                            {typeof results.photoshootBrief === 'string' ? results.photoshootBrief : 'لم يتم توليد بريف التصوير.'}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Save to Library */}
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

                {/* Advanced Mode Tools */}
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
