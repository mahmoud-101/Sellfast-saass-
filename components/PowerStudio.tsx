
import React, { useState } from 'react';
import { PowerStudioProject } from '../types';
import { runPowerProduction } from '../services/geminiService';
import { deductCredits, CREDIT_COSTS } from '../lib/supabase';
import { resizeImage } from '../utils';
import ImageWorkspace from './ImageWorkspace';

const PowerStudio: React.FC<{
    project: PowerStudioProject;
    setProject: (project: any) => void;
    userId?: string;
    refreshCredits?: () => void;
}> = ({ project, setProject, userId, refreshCredits }) => {
    const [step, setStep] = useState(1);
    const [activeTab, setActiveTab] = useState<'ad_pack' | 'visual' | 'targeting'>('ad_pack');

    const handleRun = async () => {
        if (!userId) return;
        setProject((s: any) => ({ ...s, isGenerating: true, error: null, progress: 10, currentStep: 'تحليل استراتيجي فوري...' }));
        
        const detailedContext = `Brand: ${project.brandName}, Category: ${project.productCategory}, Goal: ${project.goal}`;

        try {
            // تنفيذ الرندرة والتحليل عبر Gemini مباشرة بدون Amplify AI Route
            const res = await runPowerProduction(
                project.productImages, 
                detailedContext, 
                project.targetMarket, 
                project.dialect, 
                (s, p) => setProject((prev: any) => ({ ...prev, currentStep: s, progress: p }))
            );
            
            const deducted = await deductCredits(userId, CREDIT_COSTS.POWER_PROD);
            if (deducted) { 
                setProject((s: any) => ({ ...s, result: res, isGenerating: false, progress: 100 })); 
                refreshCredits?.(); 
            } else { 
                setProject((s: any) => ({ ...s, isGenerating: false, error: 'رصيد غير كافٍ.' })); 
            }
        } catch (err: any) { 
            setProject((s: any) => ({ ...s, isGenerating: false, error: "فشل التحليل: " + err.message })); 
        }
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 5));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    if (project.result) {
        return (
            <div className="w-full space-y-8 animate-in slide-in-from-bottom-5 duration-700 text-right" dir="rtl">
                <div className="flex flex-col md:flex-row justify-between items-center bg-white/5 p-8 rounded-[2.5rem] border border-white/5 gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter">حملة: {project.brandName || "مشروع جديد"}</h2>
                        <p className="text-[#FFD700] font-bold text-xs mt-1 uppercase tracking-widest flex items-center gap-2">
                           <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> وضع المعاينة النشط
                        </p>
                    </div>
                    <button onClick={() => setProject((s: any) => ({ ...s, result: null }))} className="px-10 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-black transition-all border border-white/5">إنشاء حملة جديدة</button>
                </div>

                <div className="flex justify-center bg-white/5 p-1.5 rounded-2xl border border-white/5 max-w-fit mx-auto gap-1">
                    {[{ id: 'ad_pack', label: 'إعلانات FB', icon: '📝' }, { id: 'visual', label: 'التصميم', icon: '🖼️' }, { id: 'targeting', label: 'الاستهداف', icon: '🎯' }].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-10 py-3 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-[#FFD700] text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                            <span>{tab.icon}</span> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="bg-white/5 rounded-[3.5rem] p-10 border border-white/5 min-h-[500px] shadow-2xl relative overflow-hidden">
                    {activeTab === 'ad_pack' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in">
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-[#FFD700] uppercase tracking-widest pr-4 border-r-4 border-[#FFD700]">Facebook Ad Copy</label>
                                    <div className="p-10 bg-black/40 rounded-[2.5rem] border border-white/5 text-slate-200 font-bold leading-relaxed whitespace-pre-wrap relative group text-lg shadow-inner">
                                        {project.result.fbAds.primaryText}
                                        <button onClick={() => navigator.clipboard.writeText(project.result!.fbAds.primaryText)} className="absolute top-6 left-6 p-3 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all text-xs hover:bg-[#FFD700] hover:text-black">نسخ 📋</button>
                                    </div>
                                </div>
                            </div>
                            <div className="aspect-square bg-black/40 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
                                <img src={`data:${project.result.visual.mimeType};base64,${project.result.visual.base64}`} className="w-full h-full object-cover" alt="Final Ad" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-8 text-right" dir="rtl">
            <div className="flex items-center justify-center gap-4 mb-10 overflow-x-auto no-scrollbar py-4">
                {[1, 2, 3, 4, 5].map(s => (
                    <div key={s} className="flex items-center gap-4 shrink-0">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all border-2 ${step === s ? 'bg-[#FFD700] border-[#FFD700] text-black scale-110 shadow-lg shadow-yellow-500/30' : step > s ? 'bg-yellow-900/50 border-yellow-800 text-[#FFD700]' : 'bg-white/5 border-white/10 text-slate-600'}`}>
                            {s === 1 ? '🛍️' : s === 2 ? '👥' : s === 3 ? '🎯' : s === 4 ? '🌍' : '🚀'}
                        </div>
                        {s < 5 && <div className={`w-8 md:w-16 h-1 rounded-full ${step > s ? 'bg-[#FFD700]' : 'bg-white/5'}`}></div>}
                    </div>
                ))}
            </div>

            <div className="bg-white/5 rounded-[3.5rem] p-10 md:p-14 border border-white/5 shadow-2xl relative overflow-hidden min-h-[650px] flex flex-col">
                <div className="flex-grow">
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-left-8 duration-500 space-y-10">
                            <h2 className="text-4xl font-black text-white tracking-tighter">المرحلة 1: البيانات الأساسية</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <input value={project.brandName} onChange={e => setProject((s: any) => ({ ...s, brandName: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 font-bold text-white outline-none focus:border-[#FFD700] transition-all shadow-inner" placeholder="اسم البراند" />
                                    <textarea value={project.productDescription} onChange={e => setProject((s: any) => ({ ...s, productDescription: e.target.value }))} className="w-full h-48 bg-white/5 border border-white/10 rounded-[2rem] p-6 font-bold text-white outline-none focus:border-[#FFD700] transition-all resize-none shadow-inner leading-relaxed" placeholder="وصف المنتج لـ AI" />
                                </div>
                                <ImageWorkspace id="power-up" images={project.productImages} onImagesUpload={async f => {
                                     const r = await resizeImage(f[0], 1024, 1024);
                                     const reader = new FileReader();
                                     reader.onloadend = () => setProject((s: any) => ({ ...s, productImages: [...s.productImages, { base64: (reader.result as string).split(',')[1], mimeType: r.type, name: r.name }] }));
                                     reader.readAsDataURL(r);
                                }} onImageRemove={(i) => setProject((s: any) => ({ ...s, productImages: s.productImages.filter((_, idx)=>idx!==i) }))} isUploading={false} />
                            </div>
                        </div>
                    )}
                    
                    {step === 5 && (
                        <div className="flex flex-col items-center justify-center h-full py-16 animate-in zoom-in-95 duration-700">
                             <div className="w-32 h-32 bg-[#FFD700] rounded-full flex items-center justify-center text-5xl shadow-[0_0_80px_rgba(255,215,0,0.4)] animate-bounce mb-8">🚀</div>
                             <h2 className="text-5xl font-black text-white tracking-tighter text-center mb-8">جاهز للإطلاق الفوري</h2>
                             <button onClick={handleRun} disabled={project.isGenerating} className="w-full max-w-md h-24 bg-[#FFD700] text-black font-black rounded-3xl shadow-2xl hover:bg-yellow-400 transition-all text-2xl flex items-center justify-center gap-4">
                                {project.isGenerating ? 'جاري الرندرة...' : 'إطلاق الحملة المتكاملة'}
                             </button>
                        </div>
                    )}
                </div>

                <div className="mt-16 flex justify-between items-center border-t border-white/5 pt-10">
                    <button onClick={prevStep} disabled={step === 1} className="px-12 py-5 rounded-2xl font-black text-sm bg-white/5 text-slate-400 hover:text-white transition-all disabled:opacity-0">السابق</button>
                    <button onClick={nextStep} disabled={step === 5} className="px-14 py-5 bg-white text-black font-black rounded-2xl hover:scale-105 transition-all shadow-xl">التالي</button>
                </div>
            </div>
        </div>
    );
};

export default PowerStudio;
