
import React, { useState } from 'react';
import { PlanStudioProject, ImageFile, PlanIdea } from '../types';
import { resizeImage } from '../utils';
import { generateCampaignPlan, generateImage } from '../services/geminiService';
import ImageWorkspace from './ImageWorkspace';

const TARGET_MARKETS = ['مصر', 'السعودية', 'الإمارات', 'الخليج العربي', 'عالمي'];
const DIALECTS = ['لهجة مصرية', 'لهجة سعودية', 'فصحى بسيطة', 'لهجة شامية', 'الإنجليزية'];

interface Props {
    project: PlanStudioProject;
    setProject: React.Dispatch<React.SetStateAction<PlanStudioProject>>;
    onBridgeToPhotoshoot: (context: string) => void;
}

const PlanStudio: React.FC<Props> = ({ project, setProject, onBridgeToPhotoshoot }) => {

    const handleFileUpload = async (files: File[]) => {
        if (!files.length) return;
        setProject(s => ({ ...s, isUploading: true }));
        try {
            const uploaded = await Promise.all(files.map(async file => {
                // Fix: Changed variable usage to match the 'resized' identifier
                const resized = await resizeImage(file, 1024, 1024);
                const reader = new FileReader();
                return new Promise<ImageFile>(res => {
                    // Fix: Replaced undefined variable 'r' with 'resized'
                    reader.onloadend = () => res({ base64: (reader.result as string).split(',')[1], mimeType: resized.type, name: resized.name });
                    reader.readAsDataURL(resized);
                });
            }));
            setProject(s => ({ ...s, productImages: [...s.productImages, ...uploaded], isUploading: false }));
        } catch (err) { setProject(s => ({ ...s, isUploading: false })); }
    };

    const onCreatePlan = async () => {
        if (!project.prompt.trim()) return;
        setProject(s => ({ ...s, isGeneratingPlan: true, error: null }));
        try {
            const plan = await generateCampaignPlan(project.productImages, project.prompt, project.targetMarket, project.dialect);
            const ideas: PlanIdea[] = plan.map((p: any) => ({ ...p, image: null, isLoadingImage: false, imageError: null }));
            setProject(s => ({ ...s, ideas, isGeneratingPlan: false }));
        } catch (err) { setProject(s => ({ ...s, isGeneratingPlan: false, error: "فشل إنشاء الخطة" })); }
    };

    return (
        <main className="w-full py-10 animate-in fade-in duration-700 text-right" dir="rtl">
            <div className="max-w-6xl mx-auto space-y-12">
                <div className="flex justify-between items-center">
                    <div className="space-y-4">
                        <h1 className="text-5xl font-black text-white tracking-tighter">خطة المحتوى الذكية 🗓️</h1>
                        <p className="text-slate-400 text-xl font-bold">ارسم استراتيجية المحتوى لـ 9 أيام قادمة بضغطة زر.</p>
                    </div>
                    {project.ideas.length > 0 && (
                        <button onClick={() => onBridgeToPhotoshoot(project.prompt)} className="bg-[#FFD700] text-black px-8 py-3 rounded-2xl font-black text-xs shadow-glow hover:scale-105 transition-all">
                            📸 بدء تصوير المنتجات للخطة
                        </button>
                    )}
                </div>

                <div className="bg-white/5 rounded-[3.5rem] p-10 border border-white/10 shadow-2xl space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-4">
                            <ImageWorkspace id="plan-up" images={project.productImages} onImagesUpload={handleFileUpload} onImageRemove={(i) => setProject(s => ({ ...s, productImages: s.productImages.filter((_, idx) => idx !== i) }))} isUploading={project.isUploading} />
                        </div>
                        <div className="lg:col-span-8 flex flex-col gap-6">
                            <textarea value={project.prompt} onChange={(e) => setProject(s => ({ ...s, prompt: e.target.value }))} placeholder="هدف الحملة..." className="w-full bg-black/40 border border-white/10 rounded-3xl p-8 text-xl font-bold text-white outline-none focus:border-[#FFD700] min-h-[150px] resize-none shadow-inner" />
                            <div className="grid grid-cols-2 gap-4">
                                <select value={project.targetMarket} onChange={(e) => setProject(s => ({ ...s, targetMarket: e.target.value }))} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none">{TARGET_MARKETS.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                <select value={project.dialect} onChange={(e) => setProject(s => ({ ...s, dialect: e.target.value }))} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none">{DIALECTS.map(d => <option key={d} value={d}>{d}</option>)}</select>
                            </div>
                            <button onClick={onCreatePlan} disabled={project.isGeneratingPlan} className="w-full bg-[#FFD700] text-black font-black py-6 rounded-2xl text-xl shadow-xl active:scale-95 transition-all">
                                {project.isGeneratingPlan ? 'جاري رسم الاستراتيجية...' : 'توليد خطة الـ 9 أيام'}
                            </button>
                        </div>
                    </div>
                </div>

                {project.ideas.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {project.ideas.map((idea, idx) => (
                            <div key={idea.id} className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 space-y-4 hover:border-[#FFD700]/30 transition-all group">
                                <span className="px-4 py-1.5 bg-[#FFD700] text-black rounded-full text-[10px] font-black uppercase">Day 0{idx + 1}</span>
                                <h4 className="text-xl font-black text-white">{idea.tov}</h4>
                                <p className="text-xs text-slate-400 leading-relaxed italic line-clamp-4">"{idea.caption}"</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
};

export default PlanStudio;
