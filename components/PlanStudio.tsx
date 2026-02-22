
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
                    <div className="space-y-6 animate-in slide-in-from-bottom-5">
                        <div className="flex items-center gap-4 flex-row-reverse">
                            <h3 className="text-2xl font-black text-white tracking-tight">خطة الـ 9 أيام جاهزة 🗓️</h3>
                            <div className="h-px flex-grow bg-white/5"></div>
                            <span className="text-xs font-black text-[#FFD700] bg-[#FFD700]/10 px-4 py-1 rounded-full">{project.ideas.length} منشور</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {project.ideas.map((idea: any, idx) => {
                                const platform = idea.platform || 'Instagram';
                                const platformEmoji = platform === 'Facebook' ? '📘' : platform === 'TikTok' ? '🎵' : '📸';
                                const platformColor = platform === 'Facebook' ? 'text-blue-400' : platform === 'TikTok' ? 'text-pink-400' : 'text-rose-400';
                                const tovColors: Record<string, string> = {
                                    'Hook': 'bg-red-500/20 text-red-400 border-red-500/30',
                                    'Social Proof': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                                    'Educational': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                                    'CTA': 'bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30',
                                    'Problem-Solution': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
                                };
                                const tovKey = Object.keys(tovColors).find(k => idea.tov?.includes(k)) || 'Hook';
                                return (
                                    <div key={idea.id || idx} className="bg-white/5 rounded-[2.5rem] p-7 border border-white/5 space-y-5 hover:border-[#FFD700]/30 transition-all group flex flex-col">
                                        {/* Header */}
                                        <div className="flex items-center justify-between">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${tovColors[tovKey] || tovColors['Hook']}`}>
                                                {idea.tov || `يوم ${idx + 1}`}
                                            </span>
                                            <span className="text-[10px] font-black text-white/30">يوم {String(idx + 1).padStart(2, '0')}</span>
                                        </div>

                                        {/* Platform + Time */}
                                        <div className="flex items-center gap-2 text-[10px] font-black">
                                            <span className={`${platformColor} flex items-center gap-1`}>{platformEmoji} {platform}</span>
                                            {idea.postTime && <><span className="text-white/10">•</span><span className="text-slate-500">🕐 {idea.postTime}</span></>}
                                        </div>

                                        {/* Hook */}
                                        {idea.hook && (
                                            <div className="bg-[#FFD700]/5 border border-[#FFD700]/15 rounded-2xl p-4">
                                                <p className="text-[10px] font-black text-[#FFD700]/60 uppercase tracking-widest mb-1">الهوك ⚡</p>
                                                <p className="text-sm font-black text-white leading-relaxed">"{idea.hook}"</p>
                                            </div>
                                        )}

                                        {/* Caption */}
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-center mb-2">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">الكابشن الكامل</p>
                                                <button
                                                    onClick={() => navigator.clipboard.writeText((idea.hook ? idea.hook + '\n\n' : '') + idea.caption + '\n\n' + (idea.hashtags || ''))}
                                                    className="text-[9px] font-black text-[#FFD700]/50 hover:text-[#FFD700] transition-colors"
                                                >نسخ 📋</button>
                                            </div>
                                            <p className="text-xs text-slate-300 leading-relaxed line-clamp-5 font-bold">{idea.caption}</p>
                                        </div>

                                        {/* Hashtags */}
                                        {idea.hashtags && (
                                            <p className="text-[10px] text-[#FFD700]/70 font-bold leading-relaxed">{idea.hashtags}</p>
                                        )}

                                        {/* Scenario */}
                                        {idea.scenario && (
                                            <div className="border-t border-white/5 pt-4">
                                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">📸 سيناريو التصوير</p>
                                                <p className="text-[10px] text-slate-500 leading-relaxed italic">{idea.scenario}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
};

export default PlanStudio;
