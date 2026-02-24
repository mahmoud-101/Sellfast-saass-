import React, { useState, useEffect } from 'react';
import { getGeneratedAssets, deleteGeneratedAsset, getCampaigns, deleteCampaign, SavedCampaign } from '../lib/supabase';
import { SavedAsset } from '../types';

interface ContentLibraryProps {
    userId: string;
}

export function ContentLibrary({ userId }: ContentLibraryProps) {
    const [assets, setAssets] = useState<SavedAsset[]>([]);
    const [campaigns, setCampaigns] = useState<SavedCampaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'plan' | 'campaign'>('all');
    const [selectedCampaign, setSelectedCampaign] = useState<SavedCampaign | null>(null);

    useEffect(() => {
        fetchAll();
    }, [userId]);

    const fetchAll = async () => {
        setIsLoading(true);
        try {
            const [assetsData, campaignsData] = await Promise.all([
                getGeneratedAssets(userId).catch(() => []),
                getCampaigns(userId).catch(() => [])
            ]);
            setAssets(assetsData);
            setCampaigns(campaignsData);
        } catch (error) {
            console.error("Error fetching library:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAsset = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('هل أنت متأكد من حذف هذا المحتوى؟')) return;
        try {
            await deleteGeneratedAsset(id, userId);
            setAssets(assets.filter(a => a.id !== id));
        } catch (error) {
            console.error("Error deleting asset:", error);
        }
    };

    const handleDeleteCampaign = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('هل أنت متأكد من حذف هذه الحملة الكاملة؟')) return;
        try {
            await deleteCampaign(id);
            setCampaigns(campaigns.filter(c => c.id !== id));
        } catch (error) {
            console.error("Error deleting campaign:", error);
        }
    };

    const getBadgeInfo = (type: string) => {
        if (type.includes('IMAGE')) return { text: 'صورة', color: 'bg-emerald-500/20 text-emerald-400', icon: '📸' };
        if (type.includes('VIDEO') || type.includes('REEL')) return { text: 'فيديو', color: 'bg-rose-500/20 text-rose-400', icon: '🎬' };
        if (type.includes('PLAN') || type.includes('COPY') || type.includes('SCRIPT')) return { text: 'نص/خطة', color: 'bg-blue-500/20 text-blue-400', icon: '📄' };
        return { text: 'محتوى', color: 'bg-white/10 text-white/70', icon: '📦' };
    };

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/5 p-6 rounded-[2.5rem] border border-white/5 shadow-2xl backdrop-blur-md">
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                        <span className="animate-pulse">📚</span> مكتبة المحتوى الذكية
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">حملاتك الموحدة، فيديوهاتك، وصورك في مكان واحد</p>
                </div>

                <div className="flex flex-wrap gap-1 bg-black/40 p-1.5 rounded-2xl border border-white/10">
                    {[
                        { id: 'all', label: 'الكل' },
                        { id: 'campaign', label: '🚀 حملات موحدة' },
                        { id: 'image', label: '📸 صور' },
                        { id: 'video', label: '🎬 فيديو' },
                        { id: 'plan', label: '📄 خطط' },
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id as any)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${filter === f.id ? 'bg-[#FFD700] text-black shadow-lg scale-105' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="py-20 text-center flex flex-col items-center">
                    <div className="w-14 h-14 border-4 border-[#FFD700]/10 border-t-[#FFD700] rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(255,215,0,0.3)]"></div>
                    <p className="text-[#FFD700] font-black animate-pulse tracking-widest">جاري مزامنة المكتبة...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2">
                    {/* Render Campaigns First if All or Campaign is selected */}
                    {(filter === 'all' || filter === 'campaign') && campaigns.map(camp => (
                        <div
                            key={camp.id}
                            onClick={() => setSelectedCampaign(camp)}
                            className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-[2rem] border border-purple-500/30 p-6 hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all cursor-pointer group relative flex flex-col h-64"
                        >
                            <div className="absolute top-4 right-4 bg-purple-500 text-white text-[10px] font-black px-2 py-1 rounded-lg">حملة موحدة 🚀</div>
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📁</div>
                            <h3 className="text-lg font-black text-white line-clamp-2 leading-tight mb-2">{camp.product_name}</h3>
                            <p className="text-slate-400 text-xs line-clamp-1">🎯 {camp.campaign_goal}</p>
                            <p className="text-purple-400 text-[10px] font-bold mt-2 uppercase tracking-wider">
                                {new Date(camp.created_at!).toLocaleDateString('ar-EG')}
                                {camp.version && <span className="mr-2 bg-white/10 px-1.5 py-0.5 rounded text-gray-300">V{camp.version}</span>}
                            </p>

                            <div className="mt-auto flex gap-2">
                                <button className="flex-1 bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-white text-[10px] font-bold py-2 rounded-xl transition-all">فتح المعاينة</button>
                                <button onClick={(e) => handleDeleteCampaign(camp.id!, e)} className="px-3 py-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">🗑️</button>
                            </div>
                        </div>
                    ))}

                    {/* Render Assets */}
                    {(filter !== 'campaign') && assets.filter(asset => {
                        if (filter === 'all') return true;
                        if (filter === 'image') return asset.asset_type.includes('IMAGE');
                        if (filter === 'video') return asset.asset_type.includes('VIDEO') || asset.asset_type.includes('REEL');
                        if (filter === 'plan') return asset.asset_type.includes('PLAN') || asset.asset_type.includes('COPY') || asset.asset_type.includes('SCRIPT');
                        return true;
                    }).map(asset => {
                        const badge = getBadgeInfo(asset.asset_type);
                        return (
                            <div key={asset.id} className="bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden hover:border-[#FFD700]/30 transition-all group flex flex-col h-64">
                                <div className="h-32 bg-black/50 relative overflow-hidden flex items-center justify-center">
                                    {asset.asset_type.includes('IMAGE') ? (
                                        asset.url?.startsWith('http') || asset.url?.includes('data:') ? <img src={asset.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" /> : <div className="text-3xl">📸</div>
                                    ) : asset.asset_type.includes('VIDEO') ? (
                                        <div className="text-3xl"> Rose rose rose rose rose 🎬</div>
                                    ) : <div className="p-4 text-[8px] text-slate-500 font-mono line-clamp-6">{asset.url?.substring(0, 100)}</div>}
                                    <div className="absolute top-3 right-3"><span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${badge.color}`}>{badge.icon} {badge.text}</span></div>
                                </div>
                                <div className="p-4 flex flex-col flex-grow">
                                    <p className="text-white text-xs font-bold line-clamp-1 mb-1">{asset.config?.productName || asset.config?.prompt || 'محتوى مولد'}</p>
                                    <p className="text-slate-500 text-[10px]">{new Date(asset.created_at).toLocaleDateString('ar-EG')}</p>
                                    <div className="mt-auto flex gap-2">
                                        <button onClick={() => asset.url && navigator.clipboard.writeText(asset.url)} className="flex-1 bg-white/5 py-2 rounded-xl text-[10px] font-bold text-white hover:bg-white/10">نسخ 📋</button>
                                        <button onClick={(e) => handleDeleteAsset(asset.id, e)} className="px-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">🗑️</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Unified Campaign Preview Modal */}
            {selectedCampaign && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
                    <div className="bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(168,85,247,0.2)] overflow-hidden flex flex-col relative" dir="rtl">
                        <button onClick={() => setSelectedCampaign(null)} className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-white z-10 transition-colors">✕</button>

                        <div className="p-8 pb-4 bg-gradient-to-l from-purple-900/40 to-transparent">
                            <span className="text-purple-400 text-xs font-bold tracking-[0.2em]">UNIFIED CAMPAIGN RECAP</span>
                            <h2 className="text-3xl font-black text-white mt-1">{selectedCampaign.product_name}</h2>
                            <p className="text-slate-400 mt-2 text-sm max-w-xl">🎯 {selectedCampaign.selected_angle}</p>
                        </div>

                        <div className="flex-grow overflow-y-auto px-8 pb-8 custom-scrollbar space-y-8">
                            {/* Tabs for Preview */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Reels Script */}
                                <div className="space-y-4">
                                    <h4 className="text-emerald-400 font-black flex items-center gap-2">🎙️ سكريبت الريلز</h4>
                                    <div className="bg-black/40 p-5 rounded-[2rem] border border-white/5 text-slate-300 text-sm leading-loose whitespace-pre-wrap font-arabic">
                                        {selectedCampaign.reels_script || 'لا يوجد سكريبت'}
                                    </div>
                                </div>

                                {/* Photoshoot Brief */}
                                <div className="space-y-4">
                                    <h4 className="text-pink-400 font-black flex items-center gap-2">📸 بريف التصوير</h4>
                                    <div className="bg-black/40 p-5 rounded-[2rem] border border-white/5 space-y-3">
                                        {selectedCampaign.photoshoot_brief ? (
                                            <>
                                                {selectedCampaign.photoshoot_brief.conceptImageUrl && (
                                                    <div className="w-full h-40 rounded-2xl overflow-hidden mb-3 border border-pink-500/30">
                                                        <img src={selectedCampaign.photoshoot_brief.conceptImageUrl} className="w-full h-full object-cover" alt="Concept" />
                                                    </div>
                                                )}
                                                <p className="text-xs text-slate-400">💡 {selectedCampaign.photoshoot_brief.concept}</p>
                                                <div className="flex flex-wrap gap-2 pt-2">
                                                    {selectedCampaign.photoshoot_brief.props?.map((p: string, i: number) => (
                                                        <span key={i} className="px-2 py-1 bg-pink-500/10 text-pink-300 text-[10px] rounded-lg">#{p}</span>
                                                    ))}
                                                </div>
                                            </>
                                        ) : 'لا يوجد بريف'}
                                    </div>
                                </div>
                            </div>

                            {/* Shot List */}
                            {Array.isArray(selectedCampaign.shots) && selectedCampaign.shots.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-blue-400 font-black flex items-center gap-2">🎥 قائمة اللقطات التقنية</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {selectedCampaign.shots.map((shot: any, i: number) => (
                                            <div key={i} className="bg-black/40 p-4 rounded-2xl border border-white/5">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="w-6 h-6 bg-blue-500/20 text-blue-400 font-bold text-[10px] flex items-center justify-center rounded-md">{i + 1}</span>
                                                    <span className="text-[10px] text-slate-500 uppercase">{shot.shotType}</span>
                                                </div>
                                                {shot.imageUrl && (
                                                    <div className="w-full h-32 rounded-xl overflow-hidden mb-3 border border-blue-500/30">
                                                        <img src={shot.imageUrl} className="w-full h-full object-cover" alt={`Shot ${i + 1}`} />
                                                    </div>
                                                )}
                                                <p className="text-xs text-white leading-relaxed">{shot.action}</p>
                                                {shot.motionPrompt && (
                                                    <div className="mt-2 p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                                        <p className="text-[8px] text-purple-400 font-black uppercase tracking-widest mb-1">X.ai Cinematic Motion</p>
                                                        <p className="text-[9px] text-slate-400 italic font-mono">{shot.motionPrompt}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Super-Intelligence Section (Perplexity & Grok Data) */}
                            {selectedCampaign.original_analysis && (
                                <div className="space-y-6 pt-8 border-t border-white/10">
                                    <h4 className="text-orange-400 font-black flex items-center gap-3 text-xl">
                                        🚀 بيانات الذكاء الفائق (Super-Intelligence)
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Targeting & Strategy */}
                                        <div className="space-y-4">
                                            <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-3xl">
                                                <h5 className="text-blue-400 font-black text-xs mb-3 flex items-center gap-2">🎯 استهداف المنصات (Perplexity)</h5>
                                                <div className="space-y-3">
                                                    <div>
                                                        <span className="text-[10px] text-slate-500 font-bold block mb-1">Meta Interests:</span>
                                                        <div className="flex flex-wrap gap-1">
                                                            {selectedCampaign.original_analysis.targeting?.meta?.interests?.map((tag: string, i: number) => (
                                                                <span key={i} className="px-2 py-0.5 bg-blue-500/10 text-blue-300 text-[9px] rounded-md">{tag}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-slate-500 font-bold block mb-1">TikTok Keywords:</span>
                                                        <div className="flex flex-wrap gap-1">
                                                            {selectedCampaign.original_analysis.targeting?.tiktok?.interests?.map((tag: string, i: number) => (
                                                                <span key={i} className="px-2 py-0.5 bg-pink-500/10 text-pink-300 text-[9px] rounded-md">{tag}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-5 bg-orange-500/5 border border-orange-500/20 rounded-3xl">
                                                <h5 className="text-orange-400 font-black text-xs mb-3 flex items-center gap-2">🧠 التحليل الاستراتيجي (Grok)</h5>
                                                <p className="text-xs text-white font-bold mb-2">Persona: {selectedCampaign.original_analysis.strategicDepth?.personas?.[0]?.name}</p>
                                                <p className="text-[10px] text-slate-400 leading-relaxed italic line-clamp-3">"{selectedCampaign.original_analysis.strategicDepth?.personas?.[0]?.lifestyle}"</p>
                                            </div>
                                        </div>

                                        {/* Launch Captions */}
                                        <div className="space-y-4">
                                            <h5 className="text-orange-400 font-black text-xs flex items-center gap-2 mr-2">✍️ نصوص الإطلاق النهائية (Gemini)</h5>
                                            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                                                {selectedCampaign.original_analysis.launchCaptions?.map((cap: any, i: number) => (
                                                    <div key={i} className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-[9px] font-black text-white/40 uppercase">{cap.platform}</span>
                                                            <button
                                                                onClick={() => navigator.clipboard.writeText(cap.text)}
                                                                className="text-[9px] text-[#FFD700] font-bold hover:underline"
                                                            >نسخ</button>
                                                        </div>
                                                        <p className="text-[11px] text-slate-300 leading-relaxed">{cap.text}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
