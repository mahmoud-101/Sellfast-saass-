
import React, { useState } from 'react';
import { TrendEngineProject, TrendItem } from '../types';
import { fetchCurrentTrends } from '../services/geminiService';
import { deductCredits } from '../lib/supabase';

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const TrendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

const REGIONS = ['مصر', 'السعودية', 'الإمارات', 'الخليج العربي', 'عالمي'];

const TrendEngine: React.FC<{
    project: TrendEngineProject;
    setProject: React.Dispatch<React.SetStateAction<TrendEngineProject>>;
    userId?: string;
    refreshCredits?: () => void;
}> = ({ project, setProject, userId, refreshCredits }) => {

    const onDiscover = async () => {
        if (!project.niche || !userId) return;
        setProject(s => ({ ...s, isGenerating: true, error: null, results: [] }));
        
        try {
            const deducted = await deductCredits(userId, 5);
            if (!deducted) {
                setProject(s => ({ ...s, isGenerating: false, error: 'رصيد غير كافٍ (تحتاج 5 نقاط).' }));
                return;
            }

            const trends = await fetchCurrentTrends(project.region, project.niche);
            setProject(s => ({ ...s, results: trends, isGenerating: false }));
            refreshCredits?.();
        } catch (err) {
            setProject(s => ({ ...s, isGenerating: false, error: 'فشل البحث عن التريندات حالياً.' }));
        }
    };

    return (
        <main className="w-full flex flex-col gap-10 pt-4 pb-12 animate-in fade-in duration-700 text-right" dir="rtl">
            <div className="bg-white/5 rounded-[3rem] p-10 shadow-2xl border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-l from-[#FFD700] to-transparent opacity-20"></div>
                
                <div className="flex flex-col lg:flex-row gap-12 items-center">
                    <div className="lg:w-1/2 space-y-8">
                        <div className="inline-flex px-4 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-[10px] font-black text-[#FFD700] uppercase tracking-widest gap-2 flex-row-reverse items-center">
                            <span className="w-2 h-2 bg-[#FFD700] rounded-full animate-pulse"></span>
                            Google Search Grounding Active
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tighter">محرك التريندات اللحظي</h2>
                        <p className="text-slate-400 font-medium text-lg">اكتشف ما يتحدث عنه الناس الآن في بلدك ومجالك، واحصل على أفكار محتوى "تضرب" فوراً.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">المنطقة الجغرافية</label>
                                <select 
                                    value={project.region}
                                    onChange={e => setProject(s => ({ ...s, region: e.target.value }))}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold outline-none focus:border-[#FFD700] transition-all text-white"
                                >
                                    {REGIONS.map(r => <option key={r} value={r} className="bg-black">{r}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">مجال عملك (Niche)</label>
                                <input 
                                    value={project.niche}
                                    onChange={e => setProject(s => ({ ...s, niche: e.target.value }))}
                                    placeholder="مثال: العقارات، العطور، ملابس الأطفال..."
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold outline-none focus:border-[#FFD700] transition-all text-right text-white"
                                />
                            </div>
                        </div>

                        <button 
                            onClick={onDiscover} 
                            disabled={project.isGenerating || !project.niche}
                            className="w-full h-20 bg-[#FFD700] text-black font-black rounded-2xl shadow-xl hover:bg-yellow-400 transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3"
                        >
                            {project.isGenerating ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                    <span>جاري البحث في خوادم جوجل...</span>
                                </div>
                            ) : (
                                <><SearchIcon /> اكتشف التريندات الآن (5 نقاط)</>
                            )}
                        </button>
                    </div>

                    <div className="lg:w-1/2 w-full grid grid-cols-2 gap-4 opacity-20">
                         <div className="aspect-square bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center text-4xl">🔥</div>
                         <div className="aspect-square bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center text-4xl">📈</div>
                         <div className="aspect-square bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center text-4xl">🌍</div>
                         <div className="aspect-square bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center text-4xl">💬</div>
                    </div>
                </div>
            </div>

            {project.results.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-10 duration-1000">
                    {project.results.map((item, i) => (
                        <div key={i} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-sm hover:shadow-xl hover:border-[#FFD700]/30 transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="bg-yellow-500/10 text-[#FFD700] px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center">
                                    <TrendIcon /> تريند نشط
                                </div>
                                <span className="text-[10px] font-bold text-slate-500">Google Grounding</span>
                            </div>
                            
                            <h3 className="text-2xl font-black text-white mb-4 group-hover:text-[#FFD700] transition-colors leading-tight">{item.topic}</h3>
                            
                            <div className="space-y-6">
                                <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                                    <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">لماذا يهمك؟ (Relevance)</h4>
                                    <p className="text-sm font-bold text-slate-300 leading-relaxed">{item.relevance}</p>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <h4 className="text-[9px] font-black text-[#FFD700] uppercase tracking-widest">فكرة محتوى مقترحة</h4>
                                        <p className="text-xs font-bold text-slate-400 leading-relaxed">{item.contentIdea}</p>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-2xl relative overflow-hidden group/hook">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-[#FFD700]"></div>
                                        <h4 className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-2">خطاف فيرال (Viral Hook)</h4>
                                        <p className="text-lg font-black text-white leading-tight">"{item.viralHook}"</p>
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(item.viralHook)}
                                            className="absolute bottom-4 left-4 p-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-lg transition-all opacity-0 group-hover/hook:opacity-100"
                                        >
                                            نسخ
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
};

export default TrendEngine;
