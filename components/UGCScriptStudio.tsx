
import React from 'react';
import { UGCScriptProject } from '../types';
import { generateUGCScript, generateShortFormIdeas, generateFinalContentScript, transformScriptToUGC } from '../services/geminiService';
import { deductCredits, CREDIT_COSTS } from '../lib/supabase';

interface UGCScriptStudioProps {
    project: UGCScriptProject;
    setProject: React.Dispatch<React.SetStateAction<UGCScriptProject>>;
    userId: string;
    refreshCredits?: () => void;
}

const UGCScriptStudio: React.FC<UGCScriptStudioProps> = ({ project, setProject, userId, refreshCredits }) => {

    const handleGenerateAvatarScript = async () => {
        if (!project.who || !project.teaches || !userId) return;
        setProject(s => ({ ...s, isGenerating: true, error: null, finalScript: null }));
        try {
            const deducted = await deductCredits(userId, CREDIT_COSTS.COPYWRITING);
            if (deducted) {
                const script = await generateUGCScript({
                    who: project.who, teaches: project.teaches, toWhom: project.toWhom,
                    painPoints: project.painPoints, results: project.results, cta: project.cta,
                    avatarDescription: project.avatarDescription
                });
                setProject(s => ({ ...s, finalScript: script, isGenerating: false }));
                if (refreshCredits) refreshCredits();
            }
        } catch (err) { setProject(s => ({ ...s, isGenerating: false, error: 'حدث خطأ' })); }
    };

    const handleGenerate30Ideas = async () => {
        if (!project.achievesWhat || !project.productSelling || !userId) return;
        setProject(s => ({ ...s, isGenerating: true, error: null, topicIdeas: [] }));
        try {
            const deducted = await deductCredits(userId, CREDIT_COSTS.COPYWRITING);
            if (deducted) {
                const ideas = await generateShortFormIdeas({
                    who: project.who, achieves: project.achievesWhat, product: project.productSelling,
                    pains: project.customerPains, outcomes: project.desiredOutcome, action: project.targetAction
                });
                setProject(s => ({ ...s, topicIdeas: ideas, isGenerating: false }));
                if (refreshCredits) refreshCredits();
            }
        } catch (err) { setProject(s => ({ ...s, isGenerating: false, error: 'حدث خطأ' })); }
    };

    const handleGenerateFinalScript = async (topic: string, type: 'reel' | 'youtube') => {
        setProject(s => ({ ...s, isGenerating: true, selectedTopic: topic, scriptType: type, finalScript: null }));
        try {
            const script = await generateFinalContentScript(topic, type);
            setProject(s => ({ ...s, finalScript: script, isGenerating: false }));
        } catch (err) { setProject(s => ({ ...s, isGenerating: false, error: 'فشل التوليد' })); }
    };

    const handleTransformToUGC = async () => {
        if (!project.originalScriptInput.trim() || !userId) return;
        setProject(s => ({ ...s, isGenerating: true, error: null, transformedUGCScript: null, finalScript: null }));
        try {
            const deducted = await deductCredits(userId, CREDIT_COSTS.COPYWRITING);
            if (deducted) {
                const transformed = await transformScriptToUGC(project.originalScriptInput);
                setProject(s => ({ ...s, finalScript: transformed, scriptType: 'transformed_ugc', isGenerating: false }));
                if (refreshCredits) refreshCredits();
            }
        } catch (err) { setProject(s => ({ ...s, isGenerating: false, error: 'فشل التحويل' })); }
    };

    return (
        <div className="w-full max-w-6xl mx-auto py-10 animate-in fade-in duration-700 text-right" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div className="space-y-4">
                    <h1 className="text-5xl font-black text-white tracking-tighter italic">UGC & Content Studio 🎬</h1>
                    <p className="text-slate-400 text-xl font-bold">المحرك المتكامل لصناعة وتحويل السكريبتات.</p>
                </div>
                <div className="bg-white/5 p-1.5 rounded-2xl border border-white/10 flex gap-2">
                    <button onClick={() => setProject(s => ({...s, activeMode: 'machine'}))} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all ${project.activeMode === 'machine' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-slate-400'}`}>أفكار وريلز (Machine)</button>
                    <button onClick={() => setProject(s => ({...s, activeMode: 'avatar'}))} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all ${project.activeMode === 'avatar' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-slate-400'}`}>سكريبت أفاتار (UGC)</button>
                    <button onClick={() => setProject(s => ({...s, activeMode: 'transformer'}))} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all ${project.activeMode === 'transformer' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-slate-400'}`}>مُعالج الـ UGC & مُحسّن الخطافات</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Inputs Column */}
                <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-10 space-y-6 shadow-2xl h-fit">
                    <h3 className="text-xl font-black text-[#FFD700] pr-4 border-r-4 border-[#FFD700] mb-6 uppercase tracking-widest">
                        {project.activeMode === 'transformer' ? 'صياغة بشرية & خطافات فيرال' : 'تحليل الجمهور والمنتج'}
                    </h3>
                    
                    {project.activeMode === 'avatar' && (
                        <div className="space-y-4">
                            <input value={project.who} onChange={e => setProject(s => ({ ...s, who: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold text-white outline-none focus:border-[#FFD700] shadow-inner" placeholder="أنا (مثال: خبير تسويق)" />
                            <input value={project.teaches} onChange={e => setProject(s => ({ ...s, teaches: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold text-white outline-none focus:border-[#FFD700] shadow-inner" placeholder="ماذا أعلم / أبيع (كيف تصنع فيديو AI)" />
                            <input value={project.toWhom} onChange={e => setProject(s => ({ ...s, toWhom: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold text-white outline-none focus:border-[#FFD700] shadow-inner" placeholder="الفئة المستهدفة" />
                            <input value={project.painPoints} onChange={e => setProject(s => ({ ...s, painPoints: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold text-white outline-none focus:border-[#FFD700] shadow-inner" placeholder="نقاط الألم (بدون...)" />
                            <textarea value={project.results} onChange={e => setProject(s => ({ ...s, results: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold text-white outline-none focus:border-[#FFD700] shadow-inner h-20" placeholder="النتائج والفوائد (3 نتائج)" />
                            <input value={project.cta} onChange={e => setProject(s => ({ ...s, cta: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold text-white outline-none focus:border-[#FFD700] shadow-inner" placeholder="طلب اتخاذ إجراء (CTA)" />
                            <input value={project.avatarDescription} onChange={e => setProject(s => ({ ...s, avatarDescription: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold text-white outline-none focus:border-[#FFD700] shadow-inner" placeholder="وصف الأفاتار (المكان والوضعية)" />
                            <button onClick={handleGenerateAvatarScript} disabled={project.isGenerating} className="w-full h-16 bg-[#FFD700] text-black font-black rounded-2xl text-lg shadow-xl transition-all active:scale-95">توليد سكريبت UGC</button>
                        </div>
                    )}

                    {project.activeMode === 'machine' && (
                        <div className="space-y-4">
                            <input value={project.who} onChange={e => setProject(s => ({ ...s, who: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold text-white outline-none focus:border-[#FFD700]" placeholder="أنا (مثال: مدرب حياة)" />
                            <input value={project.achievesWhat} onChange={e => setProject(s => ({ ...s, achievesWhat: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold text-white outline-none focus:border-[#FFD700]" placeholder="أساعدهم في تحقيق (ماذا؟)" />
                            <input value={project.productSelling} onChange={e => setProject(s => ({ ...s, productSelling: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold text-white outline-none focus:border-[#FFD700]" placeholder="المنتج الذي أبيعه" />
                            <textarea value={project.customerPains} onChange={e => setProject(s => ({ ...s, customerPains: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold text-white outline-none focus:border-[#FFD700] h-20" placeholder="3 مشاكل لعملائك" />
                            <textarea value={project.desiredOutcome} onChange={e => setProject(s => ({ ...s, desiredOutcome: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold text-white outline-none focus:border-[#FFD700] h-20" placeholder="3 نتائج يحلمون بها" />
                            <input value={project.targetAction} onChange={e => setProject(s => ({ ...s, targetAction: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold text-white outline-none focus:border-[#FFD700]" placeholder="الإجراء المطلوب (Action)" />
                            <button onClick={handleGenerate30Ideas} disabled={project.isGenerating} className="w-full h-16 bg-white text-black font-black rounded-2xl text-lg shadow-xl transition-all active:scale-95">استخراج 30 فكرة تريند 🚀</button>
                        </div>
                    )}

                    {project.activeMode === 'transformer' && (
                        <div className="space-y-6">
                            <p className="text-xs font-bold text-slate-400 leading-relaxed">انسخ السكريبت الإعلاني "الناشف" هنا، وسأقوم بتحويله فوراً لمحتوى سيلفي (Direct-to-camera) جذاب مع تحسين أول 5 ثوانٍ بلهجة طبيعية تماماً.</p>
                            <textarea 
                                value={project.originalScriptInput} 
                                onChange={e => setProject(s => ({ ...s, originalScriptInput: e.target.value }))} 
                                className="w-full h-64 bg-black/40 border border-white/10 rounded-2xl p-6 font-bold text-white outline-none focus:border-[#FFD700] shadow-inner resize-none" 
                                placeholder="الصق السكريبت الأصلي هنا..." 
                            />
                            <button onClick={handleTransformToUGC} disabled={project.isGenerating || !project.originalScriptInput} className="w-full h-16 bg-[#FFD700] text-black font-black rounded-2xl text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3">
                                🪄 تحويل لـ UGC & تحسين الخطاف
                            </button>
                        </div>
                    )}
                </div>

                {/* Results Column */}
                <div className="lg:col-span-7 space-y-6">
                    {project.topicIdeas.length > 0 && project.activeMode === 'machine' && (
                        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-2xl animate-in slide-in-from-left-5">
                            <h3 className="text-xl font-black text-[#FFD700] mb-6 pr-4 border-r-4 border-[#FFD700]">30 فكرة محتوى قيمة</h3>
                            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto suggestions-scrollbar pr-2">
                                {project.topicIdeas.map((idea, i) => (
                                    <div key={i} className="group p-4 bg-black/40 border border-white/5 rounded-2xl hover:border-[#FFD700]/50 transition-all flex items-center justify-between gap-4">
                                        <span className="text-sm font-bold text-slate-300 leading-tight flex-1">{i+1}. {idea}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleGenerateFinalScript(idea, 'reel')} className="px-4 py-2 bg-[#FFD700] text-black text-[10px] font-black rounded-xl hover:scale-105 transition-all">ريلز 30 ثانية</button>
                                            <button onClick={() => handleGenerateFinalScript(idea, 'youtube')} className="px-4 py-2 bg-white text-black text-[10px] font-black rounded-xl hover:scale-105 transition-all">يوتيوب 2 د</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-10 min-h-[400px] flex flex-col shadow-2xl relative overflow-hidden group">
                        <h3 className="text-xl font-black text-[#FFD700] mb-6 pr-4 border-r-4 border-[#FFD700]">
                            {project.scriptType === 'transformed_ugc' ? 'السكريبت البشري (مُحسّن الخطافات)' : 'السكريبت النهائي'}
                        </h3>
                        
                        {project.finalScript ? (
                            <div className="space-y-6 animate-in fade-in">
                                <div className="p-8 bg-black/40 rounded-3xl border border-white/5 text-slate-200 font-bold leading-relaxed whitespace-pre-wrap text-lg shadow-inner">
                                    {project.finalScript}
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <button onClick={() => navigator.clipboard.writeText(project.finalScript || '')} className="px-10 py-4 bg-[#FFD700] text-black font-black rounded-2xl transition-all">نسخ السكريبت 📋</button>
                                    {project.scriptType !== 'transformed_ugc' && (
                                        <button onClick={() => handleGenerateFinalScript(project.selectedTopic, project.scriptType as any)} className="px-10 py-4 bg-white/10 text-white font-black rounded-2xl border border-white/10 hover:bg-white/20 transition-all">أقصر / أطول؟ 🔄</button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-grow flex flex-col items-center justify-center opacity-10 text-center space-y-6">
                                <div className="text-9xl">🪄</div>
                                <p className="font-black text-2xl uppercase tracking-tighter">Hook Optimization Ready</p>
                            </div>
                        )}

                        {project.isGenerating && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-[#FFD700] font-black animate-pulse">جاري صياغة الخطافات الفيرال...</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <a href="https://heygen.com" target="_blank" className="p-6 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-[2rem] flex flex-col items-center gap-2 hover:bg-[#FFD700]/20 transition-all">
                            <span className="text-2xl">👤</span>
                            <span className="text-xs font-black text-[#FFD700] uppercase tracking-widest">Create Avatar</span>
                        </a>
                        <a href="https://www.submagic.co" target="_blank" className="p-6 bg-purple-900/10 border border-purple-500/20 rounded-[2rem] flex flex-col items-center gap-2 hover:bg-purple-900/20 transition-all">
                            <span className="text-2xl">🪄</span>
                            <span className="text-xs font-black text-purple-400 uppercase tracking-widest">Add Captions</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UGCScriptStudio;
