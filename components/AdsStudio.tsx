
import React, { useState, useEffect } from 'react';
import { AdsStudioProject, VideoJob } from '../types';
import { generateAdScript } from '../services/geminiService';
import { processFullAdProduction } from '../services/videoService';
import { deductCredits, createVideoJob, getUserVideoJobs, CREDIT_COSTS, updateVideoJob } from '../lib/supabase';

const AdsStudio: React.FC<{ userId: string; refreshCredits: () => void; }> = ({ userId, refreshCredits }) => {
    const [project, setProject] = useState<AdsStudioProject & { reviewScript: string | null, isDrafting: boolean }>({
        id: '1', name: 'New Ad Project', productName: '', benefits: '', price: '', language: 'ar', template: 'ugc', 
        isGenerating: false, isDrafting: false, reviewScript: null, currentStep: '', jobs: [], error: null
    });
    const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

    useEffect(() => { if (userId) loadHistory(); }, [userId]);
    const loadHistory = async () => { const jobs = await getUserVideoJobs(userId); setProject(prev => ({ ...prev, jobs })); };

    const handleStartDraft = async () => {
        if (!project.productName) return;
        setProject(p => ({ ...p, isDrafting: true, error: null }));
        try {
            const script = await generateAdScript(project.productName, project.benefits, project.price, project.language, project.template);
            setProject(p => ({ ...p, reviewScript: script, isDrafting: false }));
        } catch (err) { setProject(p => ({ ...p, isDrafting: false, error: 'فشل كتابة السكريبت' })); }
    };

    const handleFinalProduce = async () => {
        if (!project.reviewScript || !userId) return;
        setProject(p => ({ ...p, isGenerating: true, currentStep: 'جاري الرندرة النهائية...' }));
        try {
            const deducted = await deductCredits(userId, CREDIT_COSTS.AD_VIDEO);
            if (!deducted) { setProject(p => ({ ...p, isGenerating: false, error: 'رصيد غير كافٍ' })); return; }
            const job = await createVideoJob(userId, { product_name: project.productName, script: project.reviewScript, status: 'pending' });
            
            // Fix: Updated call parameters to match processFullAdProduction signature
            await processFullAdProduction(job.id, { 
                product: project.productName, 
                benefits: project.benefits,
                price: project.price,
                lang: project.language,
                template: project.template,
                script: project.reviewScript 
            }, (step) => setProject(p => ({ ...p, currentStep: step.text })));

            await loadHistory(); refreshCredits(); setProject(p => ({ ...p, isGenerating: false, reviewScript: null })); setActiveTab('history');
        } catch (err) { setProject(p => ({ ...p, isGenerating: false, error: 'فشل الإنتاج' })); }
    };

    return (
        <div className="w-full flex flex-col gap-10 animate-in fade-in duration-700 text-right" dir="rtl">
            <div className="flex justify-center">
                <div className="bg-white/5 p-1.5 rounded-2xl flex flex-wrap sm:flex-nowrap gap-2 border border-white/10 shadow-sm">
                    <button onClick={() => setActiveTab('create')} className={`flex-1 sm:flex-none px-8 md:px-12 py-3 rounded-xl text-[10px] md:text-xs font-black transition-all ${activeTab === 'create' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-slate-400'}`}>إنتاج فيديو</button>
                    <button onClick={() => setActiveTab('history')} className={`flex-1 sm:flex-none px-8 md:px-12 py-3 rounded-xl text-[10px] md:text-xs font-black transition-all ${activeTab === 'history' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-slate-400'}`}>الأرشيف</button>
                </div>
            </div>

            {activeTab === 'create' ? (
                <div className="bg-white/5 rounded-[3.5rem] p-6 md:p-12 shadow-2xl border border-white/5 overflow-hidden relative">
                    <div className="flex flex-col lg:flex-row gap-16">
                        <div className="lg:w-2/3 space-y-8">
                            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter">AI Video Producer</h2>
                            {!project.reviewScript ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <input value={project.productName} onChange={e => setProject(p => ({ ...p, productName: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 font-bold outline-none text-white focus:border-[#FFD700]" placeholder="اسم المنتج" />
                                        <input value={project.price} onChange={e => setProject(p => ({ ...p, price: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 font-bold outline-none text-white focus:border-[#FFD700]" placeholder="السعر" />
                                    </div>
                                    <textarea value={project.benefits} onChange={e => setProject(p => ({ ...p, benefits: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 font-bold h-40 outline-none text-white focus:border-[#FFD700]" placeholder="اكتب ميزات المنتج..." />
                                    <button onClick={handleStartDraft} disabled={project.isDrafting || !project.productName} className="w-full h-16 md:h-20 bg-[#FFD700] text-black font-black rounded-2xl shadow-xl hover:bg-yellow-400 transition-all">
                                        {project.isDrafting ? 'جاري كتابة السكريبت...' : 'الخطوة 1: صياغة السكريبت'}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in slide-in-from-left-5">
                                    <div className="p-8 bg-yellow-500/5 rounded-3xl border border-yellow-500/20 relative">
                                        <h3 className="text-[10px] font-black text-[#FFD700] uppercase mb-4">السكريبت الإعلاني (يمكنك التعديل يدوياً)</h3>
                                        <textarea value={project.reviewScript} onChange={e => setProject(p => ({ ...p, reviewScript: e.target.value }))} className="w-full bg-transparent border-none p-0 font-bold text-white h-64 focus:ring-0 resize-none leading-relaxed" />
                                    </div>
                                    <div className="flex gap-4">
                                        <button onClick={() => setProject(p => ({ ...p, reviewScript: null }))} className="flex-1 py-5 bg-white/5 border border-white/10 text-slate-400 font-black rounded-2xl hover:text-white transition-all">إعادة البدء</button>
                                        <button onClick={handleFinalProduce} disabled={project.isGenerating} className="flex-[2] py-5 bg-[#FFD700] text-black font-black rounded-2xl shadow-xl hover:bg-yellow-400 transition-all">
                                            {project.isGenerating ? project.currentStep : 'الخطوة 2: بدء الرندرة النهائية'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="lg:w-1/3 flex flex-col items-center justify-center bg-white/5 rounded-[3rem] border border-dashed border-white/10 p-12 text-center opacity-40">
                             <div className="text-8xl mb-6">🎬</div>
                             <p className="font-black text-xs text-white">Video Engine Ready</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {project.jobs.map(job => (
                        <div key={job.id} className="bg-white/5 p-8 rounded-[3rem] border border-white/10 shadow-sm hover:border-[#FFD700] transition-all group">
                             <div className="flex justify-between items-center mb-4">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${job.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{job.status}</span>
                             </div>
                             <h4 className="text-xl font-black text-white">{job.product_name}</h4>
                             {job.video_url && <a href={job.video_url} target="_blank" className="mt-8 block w-full py-4 bg-[#FFD700] text-black rounded-xl text-center text-xs font-black hover:bg-yellow-400">تحميل الفيديو</a>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdsStudio;
