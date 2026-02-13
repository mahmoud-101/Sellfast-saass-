
import React from 'react';
import { CopywriterStudioProject } from '../types';
import { generateCopy } from '../services/geminiService';
import { deductCredits, CREDIT_COSTS } from '../lib/supabase';

interface CopywriterStudioProps {
    project: CopywriterStudioProject;
    setProject: React.Dispatch<React.SetStateAction<CopywriterStudioProject>>;
    userId?: string;
    refreshCredits?: () => void;
}

const CopywriterStudio: React.FC<CopywriterStudioProps> = ({ project, setProject, userId, refreshCredits }) => {

    const handleGenerate = async () => {
        if (!project.productName || !userId) return;
        
        setProject(s => ({ ...s, isGenerating: true, error: null }));
        try {
            const results = await generateCopy(project.productName, project.features, project.targetAudience, "Egyptian Arabic");
            const deducted = await deductCredits(userId, CREDIT_COSTS.COPYWRITING);
            
            if (deducted) {
                setProject(s => ({ ...s, results, isGenerating: false }));
                if (refreshCredits) refreshCredits();
            } else {
                setProject(s => ({ ...s, isGenerating: false, error: `رصيدك غير كافٍ. تكلفة هذه العملية هي ${CREDIT_COSTS.COPYWRITING} نقاط.` }));
            }
        } catch { 
            setProject(s => ({ ...s, isGenerating: false, error: "فشل توليد النصوص" })); 
        }
    };

    return (
        <main className="w-full flex flex-col gap-8 pt-4 pb-12 animate-in fade-in duration-700 text-right">
            <div className="glass-card rounded-[3rem] p-10 shadow-2xl space-y-8 border border-white/5">
                <h2 className="text-4xl font-black text-white">كاتب المحتوى الإعلاني (AI Copywriter)</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-white/40">اسم المنتج</label>
                        <input value={project.productName} onChange={e => setProject(s => ({ ...s, productName: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-[var(--color-accent)] outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-white/40">أهم الميزات (نقاط)</label>
                        <input value={project.features} onChange={e => setProject(s => ({ ...s, features: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-[var(--color-accent)] outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-white/40">الجمهور المستهدف</label>
                        <input value={project.targetAudience} onChange={e => setProject(s => ({ ...s, targetAudience: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-[var(--color-accent)] outline-none" />
                    </div>
                </div>
                <button onClick={handleGenerate} disabled={project.isGenerating || !project.productName} className="w-full h-16 bg-white text-black font-black rounded-xl hover:bg-gray-200 transition-all shadow-xl">
                    {project.isGenerating ? 'جاري صياغة الكلمات...' : `توليد المحتوى الإعلاني الكامل (${CREDIT_COSTS.COPYWRITING} نقاط)`}
                </button>
                {project.error && <p className="text-red-400 text-center font-bold">{project.error}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {project.results.map((res, i) => (
                    <div key={i} className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                        <h4 className="text-[var(--color-accent)] font-black text-xs uppercase tracking-widest">{res.type}</h4>
                        <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{res.content}</p>
                        <button onClick={() => navigator.clipboard.writeText(res.content)} className="text-[10px] font-bold text-white/20 hover:text-white uppercase">Copy Text</button>
                    </div>
                ))}
            </div>
        </main>
    );
};

export default CopywriterStudio;
