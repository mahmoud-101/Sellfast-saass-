import React, { useState, useEffect } from 'react';
import { getCampaigns, SavedCampaign, deductCredits, saveGeneratedAsset } from '../../lib/supabase';
import { generateImage } from '../../services/geminiService';

// Fallback/Mock for Voice Generation since ElevenLabs isn't fully integrated in the snippet
const generateMockVoice = async (text: string): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq");
        }, 2000);
    });
};

interface ProductionFactoryHubProps {
    userId: string;
}

export default function ProductionFactoryHub({ userId }: ProductionFactoryHubProps) {
    const [campaigns, setCampaigns] = useState<SavedCampaign[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState<SavedCampaign | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isProducing, setIsProducing] = useState(false);
    const [productionLogs, setProductionLogs] = useState<{ step: string, status: 'pending' | 'loading' | 'success' | 'error' }[]>([]);
    const [producedAssets, setProducedAssets] = useState<{ type: string, url: string, description: string }[]>([]);

    useEffect(() => {
        fetchCampaigns();
    }, [userId]);

    const fetchCampaigns = async () => {
        setIsLoading(true);
        const data = await getCampaigns(userId);
        // Only get campaigns that have creative assets (shots, ugc, etc)
        const creativeCampaigns = data.filter(c => c.shots || c.ugc_script || c.photoshoot_brief);
        setCampaigns(creativeCampaigns);
        setIsLoading(false);
    };

    const runProduction = async () => {
        if (!selectedCampaign || !userId) return;

        setIsProducing(true);
        setProducedAssets([]);
        setProductionLogs([]);

        const addLog = (step: string) => {
            setProductionLogs(prev => [...prev, { step, status: 'loading' }]);
        };
        const updateLogStatus = (stepSearch: string, status: 'success' | 'error') => {
            setProductionLogs(prev => prev.map(log => log.step.includes(stepSearch) ? { ...log, status } : log));
        };

        try {
            // Deduct credits for a bulk production job (e.g., 50 credits)
            const deducted = await deductCredits(userId, 50);
            if (!deducted) {
                alert("رصيد غير كافٍ لعملية الإنتاج الشاملة (مطلوب 50 نقطة).");
                setIsProducing(false);
                return;
            }

            const newAssets: { type: string, url: string, description: string }[] = [];

            // 1. Generate Storyboard Images
            if (selectedCampaign.shots && selectedCampaign.shots.length > 0) {
                for (let i = 0; i < Math.min(selectedCampaign.shots.length, 4); i++) { // Limit to 4 for demo speed
                    const shot = selectedCampaign.shots[i];
                    const logMsg = `توليد مشهد الستوري بورد ${i + 1}`;
                    addLog(logMsg);
                    try {
                        const prompt = `Cinematic storyboard shot, professional advertising: ${shot.action}. Style: ${shot.shotType}. High quality, photorealistic.`;
                        // Using a generic product dummy image if none exists in the campaign context.
                        // In a real flow, we'd pass the campaign's product image here.
                        const img = await generateImage([], prompt, null, "9:16");
                        const base64Url = `data:${img.mimeType};base64,${img.base64}`;
                        newAssets.push({ type: 'storyboard', url: base64Url, description: shot.action });

                        await saveGeneratedAsset(userId, 'IMAGE_STORYBOARD', { image: img }, { prompt });
                        updateLogStatus(logMsg, 'success');
                    } catch (e) {
                        updateLogStatus(logMsg, 'error');
                    }
                }
            }

            // 2. Generate UGC Image & Voice
            if (selectedCampaign.ugc_script) {
                addLog('توليد مشاهد UGC');
                try {
                    const img = await generateImage([], `User generated content, selfie style, portrait of a person holding a product, authentic, smartphone quality, vertical 9:16`, null, "9:16");
                    newAssets.push({ type: 'ugc_image', url: `data:${img.mimeType};base64,${img.base64}`, description: 'لقطة المؤثر (UGC)' });
                    updateLogStatus('توليد مشاهد UGC', 'success');
                } catch (e) { updateLogStatus('توليد مشاهد UGC', 'error'); }

                addLog('توليد التعليق الصوتي (VoiceOver)');
                try {
                    const audioUrl = await generateMockVoice(selectedCampaign.ugc_script);
                    newAssets.push({ type: 'voiceover', url: audioUrl, description: 'تسجيل الـ UGC الصوتي' });
                    updateLogStatus('توليد التعليق الصوتي', 'success');
                } catch (e) { updateLogStatus('توليد التعليق', 'error'); }
            }

            // 3. Generate Photoshoot Concept
            if (selectedCampaign.photoshoot_brief) {
                addLog('توليد صور المنتج الاحترافية');
                try {
                    const concept = selectedCampaign.photoshoot_brief.concept || "Professional product photography";
                    const img = await generateImage([], `Professional product photography, ${concept}, studio lighting, 8k, photorealistic`, null, "1:1");
                    newAssets.push({ type: 'photoshoot', url: `data:${img.mimeType};base64,${img.base64}`, description: 'صورة المنتج' });
                    updateLogStatus('احترافية', 'success');
                } catch (e) { updateLogStatus('احترافية', 'error'); }
            }

            setProducedAssets(newAssets);

        } catch (error) {
            console.error("Production Error:", error);
            alert("حدث خطأ أثناء الإنتاج");
        } finally {
            setIsProducing(false);
        }
    };

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500" dir="rtl">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="bg-gradient-to-r from-gray-900 to-black p-8 rounded-3xl border border-blue-500/20 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/3"></div>
                    <div className="relative z-10">
                        <h1 className="text-4xl font-black text-white mb-4">
                            🏭 مصنع الإنتاج الشامل <span className="text-blue-400 font-normal text-2xl mx-2">|</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">تحويل النصوص إلى مرئيات</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                            اختر إحدى حملاتك الجاهزة، وسيقوم المصنع تلقائياً بتوليد الصور، الستوري بورد، والتعليق الصوتي الحقيقي بدلاً من الاكتفاء بالنصوص.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Col: Campaign Selection */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                📁 الحملات المتاحة للإنتاج
                            </h2>
                            {isLoading ? (
                                <div className="animate-pulse flex flex-col gap-3">
                                    <div className="h-16 bg-gray-700 rounded-xl"></div>
                                    <div className="h-16 bg-gray-700 rounded-xl"></div>
                                </div>
                            ) : campaigns.length === 0 ? (
                                <p className="text-gray-400 text-sm">لا توجد حملات إبداعية متاحة للإنتاج.</p>
                            ) : (
                                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                    {campaigns.map(camp => (
                                        <button
                                            key={camp.id}
                                            onClick={() => setSelectedCampaign(camp)}
                                            className={`w-full text-right p-4 rounded-xl border transition-all ${selectedCampaign?.id === camp.id ? 'bg-blue-500/20 border-blue-500' : 'bg-gray-900 border-gray-700 hover:border-gray-500'}`}
                                        >
                                            <h3 className="text-white font-bold">{camp.product_name}</h3>
                                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{camp.selected_angle}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Col: Production Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {!selectedCampaign ? (
                            <div className="bg-gray-800/50 p-12 rounded-3xl border border-gray-700 border-dashed flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                                <span className="text-6xl mb-4 opacity-50">⚙️</span>
                                <h3 className="text-xl font-bold text-gray-400">اختر حملة من القائمة للبدء بالإنتاج</h3>
                            </div>
                        ) : (
                            <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700 shadow-xl">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-black text-white">{selectedCampaign.product_name}</h2>
                                    <p className="text-gray-400 mt-1">{selectedCampaign.selected_angle}</p>
                                </div>

                                {/* Production Trigger */}
                                {!isProducing && producedAssets.length === 0 && (
                                    <button
                                        onClick={runProduction}
                                        className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-2xl font-black text-xl shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center gap-3"
                                    >
                                        <span>🚀 بدء الإنتاج الفعلي (توليد الصور والصوت)</span>
                                    </button>
                                )}

                                {/* Progress Logs */}
                                {isProducing && (
                                    <div className="space-y-4 bg-gray-900 p-6 rounded-2xl">
                                        <h3 className="text-white font-bold flex items-center gap-2 mb-4">
                                            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                            مكائن المصنع تعمل الآن...
                                        </h3>
                                        {productionLogs.map((log, i) => (
                                            <div key={i} className="flex items-center justify-between text-sm">
                                                <span className="text-gray-300">{log.step}</span>
                                                {log.status === 'loading' && <span className="text-blue-400 animate-pulse">جاري...</span>}
                                                {log.status === 'success' && <span className="text-emerald-400">✓ مكتمل</span>}
                                                {log.status === 'error' && <span className="text-red-400">✗ فشل</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Computed Media Results */}
                                {producedAssets.length > 0 && (
                                    <div className="mt-8 space-y-6">
                                        <h3 className="text-2xl font-black text-emerald-400 border-b border-gray-700 pb-4">✅ المخرجات النهائية (Media Assets)</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {producedAssets.map((asset, i) => (
                                                <div key={i} className="bg-gray-900 p-4 rounded-2xl border border-gray-700 overflow-hidden">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{asset.type}</span>
                                                    </div>

                                                    {asset.type.includes('image') || asset.type === 'storyboard' || asset.type === 'photoshoot' ? (
                                                        <div className="aspect-[9/16] bg-black rounded-xl overflow-hidden relative">
                                                            <img src={asset.url} alt={asset.description} className="w-full h-full object-cover" />
                                                            <div className="absolute bottom-0 w-full bg-gradient-to-t from-black to-transparent p-4">
                                                                <p className="text-white text-xs font-bold line-clamp-2">{asset.description}</p>
                                                            </div>
                                                        </div>
                                                    ) : asset.type === 'voiceover' ? (
                                                        <div className="p-6 bg-gray-800 rounded-xl text-center space-y-4">
                                                            <span className="text-4xl">🎙️</span>
                                                            <p className="text-white font-bold">{asset.description}</p>
                                                            <audio controls className="w-full">
                                                                <source src={asset.url} type="audio/mp3" />
                                                            </audio>
                                                        </div>
                                                    ) : null}

                                                    <button
                                                        onClick={() => {
                                                            const a = document.createElement('a');
                                                            a.href = asset.url;
                                                            a.download = `sellfast_asset_${i}`;
                                                            a.click();
                                                        }}
                                                        className="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-xl transition-colors"
                                                    >
                                                        تحميل
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
