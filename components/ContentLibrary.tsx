import React, { useState, useEffect } from 'react';
import { getGeneratedAssets, deleteGeneratedAsset } from '../lib/supabase';
import { SavedAsset } from '../types';

interface ContentLibraryProps {
    userId: string;
}

export function ContentLibrary({ userId }: ContentLibraryProps) {
    const [assets, setAssets] = useState<SavedAsset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'plan'>('all');

    useEffect(() => {
        fetchAssets();
    }, [userId]);

    const fetchAssets = async () => {
        setIsLoading(true);
        try {
            const data = await getGeneratedAssets(userId);
            setAssets(data);
        } catch (error) {
            console.error("Error fetching assets:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المحتوى؟')) return;
        try {
            await deleteGeneratedAsset(id, userId);
            setAssets(assets.filter(a => a.id !== id));
        } catch (error) {
            console.error("Error deleting asset:", error);
        }
    };

    const filteredAssets = assets.filter(asset => {
        if (filter === 'all') return true;
        if (filter === 'image') return asset.asset_type.includes('IMAGE');
        if (filter === 'video') return asset.asset_type.includes('VIDEO') || asset.asset_type.includes('REEL');
        if (filter === 'plan') return asset.asset_type.includes('PLAN') || asset.asset_type.includes('COPY') || asset.asset_type.includes('SCRIPT');
        return true;
    });

    const getBadgeInfo = (type: string) => {
        if (type.includes('IMAGE')) return { text: 'صورة', color: 'bg-emerald-500/20 text-emerald-400', icon: '📸' };
        if (type.includes('VIDEO') || type.includes('REEL')) return { text: 'فيديو', color: 'bg-rose-500/20 text-rose-400', icon: '🎬' };
        if (type.includes('PLAN') || type.includes('COPY') || type.includes('SCRIPT')) return { text: 'نص/خطة', color: 'bg-blue-500/20 text-blue-400', icon: '📄' };
        return { text: 'محتوى', color: 'bg-white/10 text-white/70', icon: '📦' };
    };

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-6 rounded-[2.5rem] border border-white/5">
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                        <span>📚</span> مكتبة المحتوى
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">كل ما قمت بإنشائه محفوظ هنا بأمان</p>
                </div>

                <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'all' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        الكل
                    </button>
                    <button
                        onClick={() => setFilter('image')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'image' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        📸 صور
                    </button>
                    <button
                        onClick={() => setFilter('video')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'video' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        🎬 فيديو
                    </button>
                    <button
                        onClick={() => setFilter('plan')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'plan' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        📄 نصوص وخطط
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="py-20 text-center flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-400 font-bold">جاري تحميل المكتبة...</p>
                </div>
            ) : filteredAssets.length === 0 ? (
                <div className="py-20 text-center bg-white/5 rounded-[2.5rem] border border-white/5">
                    <div className="text-5xl mb-4">📭</div>
                    <h3 className="text-xl font-bold text-white mb-2">المكتبة فارغة</h3>
                    <p className="text-slate-400">ابدأ بتوليد المحتوى من الأدوات المختلفة وسيتم حفظه هنا تلقائياً.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAssets.map(asset => {
                        const badge = getBadgeInfo(asset.asset_type);
                        const dateStr = new Date(asset.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });

                        return (
                            <div key={asset.id} className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden hover:border-[#FFD700]/30 transition-all group flex flex-col h-72">
                                {/* Media Area */}
                                <div className="h-40 bg-black/50 relative overflow-hidden flex items-center justify-center">
                                    {filter === 'image' || asset.asset_type.includes('IMAGE') ? (
                                        asset.url?.includes('data:image') || asset.url?.startsWith('http') ? (
                                            <img src={asset.url} alt="Asset" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        ) : (
                                            <div className="text-4xl">📸</div>
                                        )
                                    ) : filter === 'video' || asset.asset_type.includes('VIDEO') ? (
                                        asset.url ? (
                                            <video src={asset.url} className="w-full h-full object-cover" controls muted />
                                        ) : (
                                            <div className="text-4xl text-rose-500/50">🎥</div>
                                        )
                                    ) : (
                                        <div className="w-full h-full p-4 overflow-hidden relative">
                                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 z-10"></div>
                                            <p className="text-[9px] text-slate-400 leading-relaxed font-mono whitespace-pre-wrap break-words">{asset.url?.substring(0, 300)}...</p>
                                        </div>
                                    )}

                                    {/* Badge */}
                                    <div className="absolute top-3 right-3 z-20">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black tracking-widest ${badge.color} backdrop-blur-md`}>
                                            {badge.icon} {badge.text}
                                        </span>
                                    </div>
                                </div>

                                {/* Details Area */}
                                <div className="p-5 flex flex-col flex-grow justify-between">
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">{dateStr}</p>
                                        <p className="text-sm font-bold text-white line-clamp-2">
                                            {asset.config?.prompt ? `"${asset.config.prompt}"` :
                                                asset.config?.goal ? `هدف: ${asset.config.goal}` :
                                                    'محتوى مولد بالذكاء الاصطناعي'}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                                        <button
                                            onClick={() => asset.url && navigator.clipboard.writeText(asset.url)}
                                            className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-2 px-3 rounded-xl transition-colors text-center"
                                        >
                                            نسخ 📋
                                        </button>
                                        <button
                                            onClick={() => handleDelete(asset.id)}
                                            className="w-10 h-10 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
                                            title="حذف"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
