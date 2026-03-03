import React, { useState, useEffect } from 'react';
import { useProductIntelligence } from '../../context/ProductIntelligenceContext';
import { CampaignOrchestrator } from '../../orchestrator/CampaignOrchestrator';
import { useLoadingMessages } from '../../utils/useLoadingMessages';
import { saveCampaign } from '../../lib/supabase';
import AIProgressSteps, { CREATIVE_STEPS } from '../../components/AIProgressSteps';

const LAUNCH_STEPS = [
    { label: 'أبحاث الاستهداف', icon: '🎯', durationMs: 4000 },
    { label: 'الذكاء الاستراتيجي', icon: '🧠', durationMs: 5000 },
    { label: 'نصوص الإطلاق', icon: '✍️', durationMs: 4000 }
];

export default function LaunchBriefHub({
    setView,
    userId
}: {
    setView: (view: any) => void;
    userId: string;
}) {
    const { data, updateData } = useProductIntelligence();
    const [isGenerating, setIsGenerating] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'targeting' | 'strategy' | 'captions'>('targeting');
    const [isSaving, setIsSaving] = useState(false);
    const [savedSuccessfully, setSavedSuccessfully] = useState(false);

    // Editable State
    const [targeting, setTargeting] = useState<any>(null);
    const [strategicDepth, setStrategicDepth] = useState<any>(null);
    const [launchCaptions, setLaunchCaptions] = useState<any[]>([]);

    const loadingMessages = [
        "جاري استدعاء Perplexity للبحث عن أحدث اهتمامات الجمهور...",
        "Grok يقوم بتحليل البيانات الاستراتيجية للعملاء...",
        "Gemini يصيغ الكابشن والهاشتاجات الأكثر فتكاً...",
        "مركز التحكم جاهز للإطلاق في 3.. 2.. 1.."
    ];
    const { message: loadingMessage, start: startMessages, stop: stopMessages } = useLoadingMessages(loadingMessages);

    useEffect(() => {
        if (!results && !isGenerating && data.productName) {
            runLaunchBrief();
        }
    }, [data.productName]);

    const runLaunchBrief = async () => {
        setIsGenerating(true);
        startMessages();
        setSavedSuccessfully(false);

        const result = await CampaignOrchestrator.runLaunchBrief(data);

        if (result.success) {
            setResults(result.data);
            setTargeting(result.data.targeting);
            setStrategicDepth(result.data.strategicDepth);
            setLaunchCaptions(result.data.launchCaptions || []);
        }

        setIsGenerating(false);
        stopMessages();
    };

    const handleSave = async () => {
        if (results && userId) {
            setIsSaving(true);
            await saveCampaign({
                user_id: userId,
                product_name: data.productName || 'حملة بلا اسم',
                campaign_goal: data.campaignGoal || '',
                selected_angle: data.selectedAngle || '',
                original_analysis: {
                    targeting,
                    strategicDepth,
                    launchCaptions
                },
                version: 1,
                status: 'active'
            });
            setSavedSuccessfully(true);
            setIsSaving(false);
        }
    };

    if (isGenerating) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
                <div className="w-32 h-32 relative mb-8">
                    <div className="absolute inset-0 rounded-full border-4 border-orange-500/20 animate-pulse"></div>
                    <div className="absolute inset-0 rounded-full border-t-4 border-orange-500 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-4xl transform animate-bounce">🚀</div>
                </div>
                <h2 className="text-3xl font-black text-white mb-4 tracking-tight">غرفة التحكم والإطلاق</h2>
                <p className="text-orange-400 font-bold text-lg animate-pulse">{loadingMessage}</p>

                <div className="mt-12 w-full max-w-md">
                    <AIProgressSteps steps={LAUNCH_STEPS} isActive={isGenerating} accentColor="orange" />
                </div>
            </div>
        );
    }

    return (
        <div className="py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-700" dir="rtl">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 bg-gradient-to-l from-orange-900/40 to-transparent p-8 rounded-[2.5rem] border border-orange-500/20">
                <div className="text-right">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg text-xs font-black uppercase tracking-widest mb-3">
                        Media Launch Control
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">مركز الإطلاق النهائي</h1>
                    <p className="text-slate-400 mt-2 font-bold focus:outline-none">بيانات الاستهداف الحية، الاستراتيجية، ونصوص الإطلاق المتكاملة.</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={runLaunchBrief}
                        className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-bold flex items-center gap-2"
                    >
                        <span>🔄 تحديث البيانات</span>
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || savedSuccessfully}
                        className={`px-8 py-4 rounded-2xl font-black transition-all flex items-center gap-3 ${savedSuccessfully ? 'bg-emerald-500 text-white' : 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-xl shadow-orange-900/20 hover:scale-105 active:scale-95'}`}
                    >
                        {isSaving ? (
                            <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <span>{savedSuccessfully ? '✅ تم الحفظ' : '🚀 إطلاق وحفظ'}</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 mb-8 max-w-2xl mx-auto shadow-inner">
                <button
                    onClick={() => setActiveTab('targeting')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black transition-all ${activeTab === 'targeting' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    <span className="text-lg">🎯</span>
                    <span>الاستهداف (Perplexity)</span>
                </button>
                <button
                    onClick={() => setActiveTab('strategy')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black transition-all ${activeTab === 'strategy' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    <span className="text-lg">🧠</span>
                    <span>الاستراتيجية (Grok)</span>
                </button>
                <button
                    onClick={() => setActiveTab('captions')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black transition-all ${activeTab === 'captions' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    <span className="text-lg">✍️</span>
                    <span>الكابشن (Gemini)</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 gap-8">

                {/* 1. Targeting Tab */}
                {activeTab === 'targeting' && targeting && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Meta Ads Box */}
                            <div className="bg-[#111] border border-blue-500/30 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-3xl bg-blue-500/10 w-14 h-14 flex items-center justify-center rounded-2xl shadow-inner border border-blue-500/20">📘</span>
                                    <div>
                                        <h3 className="text-xl font-black text-white">إعلانات Meta</h3>
                                        <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">Facebook & Instagram Targeting</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-slate-500 text-xs font-black block mb-2 uppercase">الاهتمامات الرئيسية:</span>
                                        <div className="flex flex-wrap gap-2">
                                            {targeting.meta?.interests?.map((interest: string, idx: number) => (
                                                <span key={idx} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-300 font-bold">{interest}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <span className="text-slate-500 text-xs font-black block mb-1 uppercase">نصيحة الاستهداف:</span>
                                        <p className="text-slate-300 text-sm leading-relaxed">استخدم استراتيجية Broad Targeting مع الـ Interests المذكورة أعلاه لزيادة الوصول بأقل تكلفة.</p>
                                    </div>
                                </div>
                            </div>

                            {/* TikTok Ads Box */}
                            <div className="bg-[#111] border border-pink-500/30 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-3xl group-hover:bg-pink-500/10 transition-colors"></div>
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-3xl bg-pink-500/10 w-14 h-14 flex items-center justify-center rounded-2xl shadow-inner border border-pink-500/20">🎵</span>
                                    <div>
                                        <h3 className="text-xl font-black text-white">إعلانات TikTok</h3>
                                        <p className="text-pink-400 text-xs font-bold uppercase tracking-widest">Viral Behavior & Keywords</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-slate-500 text-xs font-black block mb-2 uppercase">الكلمات الدلالية والتفاعلات:</span>
                                        <div className="flex flex-wrap gap-2">
                                            {targeting.tiktok?.interests?.map((interest: string, idx: number) => (
                                                <span key={idx} className="px-3 py-1.5 bg-pink-500/10 border border-pink-500/20 rounded-lg text-sm text-pink-300 font-bold">{interest}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <span className="text-slate-500 text-xs font-black block mb-1 uppercase">نصيحة الإبداع:</span>
                                        <p className="text-slate-300 text-sm leading-relaxed">تيك توك يفضل المحتوى العفوي (UGC). ركز على أول 3 ثواني لإيقاف "التمرير" (Scrolly-Stopped).</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Strategy Tab (Grok) */}
                {activeTab === 'strategy' && strategicDepth && (
                    <div className="space-y-6 animate-in fade-in duration-500 bg-[#0a0a0a] border border-orange-500/10 p-10 rounded-[2.5rem] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[100px]"></div>
                        <div className="relative z-10 space-y-8">
                            <div>
                                <h3 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
                                    <span className="text-orange-500">𝕏</span> الذكاء الاستراتيجي من Grok
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl">
                                        <span className="text-orange-400 font-black text-xs block mb-2 uppercase tracking-tighter">الطلب في السوق</span>
                                        <p className="text-white text-lg font-bold">{strategicDepth.marketAnalysis?.demand || 'عالي جداً'}</p>
                                    </div>
                                    <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl">
                                        <span className="text-orange-400 font-black text-xs block mb-2 uppercase tracking-tighter">سلوك العميل</span>
                                        <p className="text-white text-lg font-bold">{strategicDepth.marketAnalysis?.customerBehavior || 'يبحث عن الجودة الفورية'}</p>
                                    </div>
                                    <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl">
                                        <span className="text-orange-400 font-black text-xs block mb-2 uppercase tracking-tighter">فجوة المنافسين</span>
                                        <p className="text-white text-lg font-bold">{strategicDepth.marketAnalysis?.competitorGaps?.[0] || 'نقص في خدمة ما بعد البيع'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-gradient-to-br from-orange-600/10 to-transparent border border-orange-500/20 rounded-[2rem]">
                                <span className="text-orange-400 font-black text-sm block mb-4 italic uppercase">بروفايل العميل المثالي (Persona):</span>
                                <div className="space-y-4">
                                    <h4 className="text-2xl font-black text-white">{strategicDepth.personas?.[0]?.name}</h4>
                                    <p className="text-slate-300 leading-relaxed font-medium">{strategicDepth.personas?.[0]?.lifestyle}</p>
                                    <div className="flex flex-wrap gap-3 mt-4">
                                        {strategicDepth.personas?.[0]?.painPoints?.slice(0, 3).map((p: string, i: number) => (
                                            <span key={i} className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold">⚠️ {p}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Captions Tab (Gemini) */}
                {activeTab === 'captions' && launchCaptions && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {launchCaptions.map((caption: any, idx: number) => (
                                <div key={idx} className="bg-[#131313] border border-white/5 rounded-3xl p-8 hover:border-orange-500/30 transition-all group">
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="bg-orange-500/10 text-orange-400 px-3 py-1 rounded-lg text-xs font-black uppercase">{caption.platform}</span>
                                        <button className="text-slate-500 hover:text-white transition-colors" onClick={() => navigator.clipboard.writeText(caption.text)}>📋 تنسخ</button>
                                    </div>
                                    <div className="min-h-[150px]">
                                        <textarea
                                            value={caption.text}
                                            onChange={(e) => {
                                                const newCaps = [...launchCaptions];
                                                newCaps[idx].text = e.target.value;
                                                setLaunchCaptions(newCaps);
                                            }}
                                            className="w-full bg-transparent border-none p-0 text-gray-200 text-sm leading-relaxed resize-none focus:ring-0"
                                            rows={6}
                                            dir="auto"
                                        />
                                    </div>
                                    <div className="mt-6 flex flex-wrap gap-2 pt-6 border-t border-white/5">
                                        {caption.hashtags?.map((tag: string, i: number) => (
                                            <span key={i} className="text-orange-500/80 text-xs font-bold">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {/* Back Navigation */}
            <div className="mt-16 flex justify-center">
                <button
                    onClick={() => setView('dashboard')}
                    className="text-slate-500 hover:text-white transition-all font-bold flex items-center gap-2 group"
                >
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                    <span>العودة للوحة التحكم الرئيسية</span>
                </button>
            </div>
        </div>
    );
}
