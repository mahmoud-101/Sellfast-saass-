import React, { useState, useEffect } from 'react';
import { useProductIntelligence } from '../../context/ProductIntelligenceContext';
import { CampaignOrchestrator } from '../../orchestrator/CampaignOrchestrator';

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

    useEffect(() => {
        // If we have an angle from the Campaign Builder and Smart Mode is ON
        if (data.smartMode && data.selectedAngle && !results && !isGenerating) {
            runCreativeStudio();
        }
    }, [data.smartMode, data.selectedAngle]);

    const runCreativeStudio = async () => {
        setIsGenerating(true);

        // Trigger Orchestrator to generate Video Storyboards automatically for the winning angle
        const result = await CampaignOrchestrator.generateCreatives(data, data.selectedAngle || 'حملة إعلانية للمنتج');

        if (result.success) {
            setResults(result.data);
        }

        setIsGenerating(false);
    };

    const handleFinish = () => {
        // End of the 3-Core Flow
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
        <div className="min-h-screen bg-gray-900 text-white p-8 ltr:pl-8 rtl:pr-8 ltr:md:pl-64 rtl:md:pr-64 pt-20">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header & Modes */}
                <div className="flex justify-between items-center bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Creative Studio Hub</h1>
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
                            <span className="text-xs select-none">Advanced Tools</span>
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

                    <div className="pt-4 flex justify-end">
                        <button
                            onClick={runCreativeStudio}
                            disabled={isGenerating || !data.selectedAngle}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {isGenerating ? (
                                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> جاري التوليد المرئي...</>
                            ) : (
                                <>🎬 ابدأ إخراج المحتوى المرئي</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Results Area */}
                {results && (
                    <div className="bg-emerald-900/20 border border-emerald-500/30 p-6 rounded-2xl animate-fade-in-up">
                        <h3 className="text-2xl font-bold text-emerald-400 mb-4">المعلّم المرئي جاهز! 🎬</h3>
                        <p className="text-gray-300 mb-6">النظام أنشأ السيناريوهات المرئية والستوري بورد كاملة للزاوية المختارة. يمكنك تصفحها الآن أو الانتقال للمكتبة.</p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <button onClick={() => setInternalView('storyboard')} className="bg-gray-900 border border-gray-700 hover:border-emerald-500 p-4 rounded-xl transition-all">
                                <div className="text-3xl mb-1">🎞️</div>
                                <div className="text-white font-bold">تصفح الستوري بورد</div>
                            </button>
                            <button onClick={handleFinish} className="bg-gray-900 border border-gray-700 hover:border-blue-500 p-4 rounded-xl transition-all">
                                <div className="text-3xl mb-1">📁</div>
                                <div className="text-white font-bold">الحفظ في المكتبة كحملة نهائية</div>
                            </button>
                        </div>
                    </div>
                )}

                {/* Advanced Mode Tools List */}
                {isAdvanced && (
                    <div className="mt-8 border-t border-gray-700 pt-8 animate-fade-in-up">
                        <h3 className="text-xl text-gray-400 mb-4 flex items-center gap-2">
                            <span className="text-emerald-500">⚙️</span> Internal Engines (Advanced Mode)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <button onClick={() => setInternalView('storyboard')} className="text-right bg-gray-800 hover:bg-gray-700 p-4 rounded-xl border border-gray-600 transition-colors">
                                <div className="text-2xl mb-2">🎞️</div>
                                <div className="font-bold text-md mb-1">Storyboard Studio</div>
                            </button>
                            <button onClick={() => setInternalView('ugc')} className="text-right bg-gray-800 hover:bg-gray-700 p-4 rounded-xl border border-gray-600 transition-colors">
                                <div className="text-2xl mb-2">🤳</div>
                                <div className="font-bold text-md mb-1">UGC Studio</div>
                            </button>
                            <button onClick={() => setInternalView('photoshoot')} className="text-right bg-gray-800 hover:bg-gray-700 p-4 rounded-xl border border-gray-600 transition-colors">
                                <div className="text-2xl mb-2">📸</div>
                                <div className="font-bold text-md mb-1">Photoshoot Director</div>
                            </button>
                            <button onClick={() => setInternalView('library')} className="text-right bg-gray-800 hover:bg-gray-700 p-4 rounded-xl border border-gray-600 transition-colors">
                                <div className="text-2xl mb-2">📁</div>
                                <div className="font-bold text-md mb-1">Content Library</div>
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
