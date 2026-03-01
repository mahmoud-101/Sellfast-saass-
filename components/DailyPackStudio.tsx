
import React, { useState } from 'react';
import { DailyPackProject, ImageFile } from '../types';
import { generateImage, askGemini } from '../services/geminiService';
import { resizeImage } from '../utils';
import ImageWorkspace from './ImageWorkspace';

const DailyPackStudio: React.FC<{
    project: DailyPackProject;
    setProject: React.Dispatch<React.SetStateAction<DailyPackProject>>;
    userId: string;
}> = ({ project, setProject, userId }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleFileUpload = async (files: File[]) => {
        if (!files.length) return;
        const uploaded = await Promise.all(files.slice(0, 3).map(async f => {
            const r = await resizeImage(f, 1024, 1024);
            return new Promise<ImageFile>(res => {
                const reader = new FileReader();
                reader.onload = () => res({ base64: (reader.result as string).split(',')[1], mimeType: r.type, name: r.name });
                reader.readAsDataURL(r);
            });
        }));
        setProject(p => ({ ...p, productImages: [...p.productImages, ...uploaded] }));
    };

    const handleGenerateAll = async () => {
        if (!project.productImages.length) return;
        setIsGenerating(true);
        setProject(p => ({ ...p, progress: 10 }));

        try {
            // 1. Marketing Strategy
            setProject(p => ({ ...p, progress: 20 }));
            const prompt = `Create a daily marketing content pack for this product. Context: ${project.description}. 
            Output JSON: { "captions": [{"hook": "string", "body": "string", "tags": "string"}], "reel": {"script": "string"}, "ugc_prompts": ["string", "string"], "ad_prompt": "string" }`;
            const aiText = await askGemini(prompt, "Professional E-commerce Strategist");
            const data = JSON.parse(aiText.replace(/```json|```/g, ''));

            // 2. Parallel Production (Simulation of high-speed)
            setProject(p => ({ ...p, progress: 40 }));
            const ugc1 = await generateImage(project.productImages, data.ugc_prompts[0], null, "9:16", 0);
            setProject(p => ({ ...p, progress: 60 }));
            const ugc2 = await generateImage(project.productImages, data.ugc_prompts[1], null, "9:16", 1);
            setProject(p => ({ ...p, progress: 85 }));
            const ad = await generateImage(project.productImages, data.ad_prompt, null, "1:1", 2);

            setProject(p => ({
                ...p,
                progress: 100,
                result: {
                    analysis: "تم تحليل المنتج وبناء المحتوى بناءً على اهتمامات جمهورك.",
                    ugcImages: [ugc1, ugc2],
                    adCreative: ad,
                    socialContent: data.captions.map((c: any) => ({ platform: 'Instagram', caption: c.body, hashtags: c.tags, hook: c.hook })),
                    reelPlan: { script: data.reel.script, musicMood: 'Energetic', scenes: [] }
                }
            }));
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    if (project.result) {
        return (
            <div className="w-full space-y-10 py-10 animate-in slide-in-from-bottom-5 text-right" dir="rtl">
                <div className="flex flex-col md:flex-row justify-between items-center bg-white/5 p-10 rounded-[3rem] border border-white/5 gap-6">
                    <div>
                        <h2 className="text-4xl font-black text-white">حقيبة اليوم جاهزة! 🎉</h2>
                        <p className="text-[#FFD700] font-bold mt-2">راجع، عدل بلمسة، وحمل كل شيء بضغطة زر.</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => setProject(p => ({ ...p, result: null, progress: 0 }))} className="px-10 py-4 bg-white/10 text-white font-black rounded-2xl hover:bg-white/20 transition-all border border-white/10">إنتاج جديد</button>
                        <button className="px-10 py-4 bg-[#FFD700] text-black font-black rounded-2xl shadow-xl hover:bg-yellow-400 transition-all">تحميل الكل ZIP 📥</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Visual Section */}
                    <div className="lg:col-span-2 space-y-8">
                        <h3 className="text-xl font-black text-[#FFD700] pr-4 border-r-4 border-[#FFD700]">المحتوى البصري (UGC & Ads)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {project.result.ugcImages.map((img, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="aspect-[9/16] rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/10 group relative shadow-2xl">
                                        <img src={`data:${img.mimeType};base64,${img.base64}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button className="px-6 py-2 bg-white text-black rounded-full font-black text-[10px]">تحميل 📥</button>
                                        </div>
                                    </div>
                                    <p className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">UGC Image 0{i + 1}</p>
                                </div>
                            ))}
                            <div className="space-y-3">
                                <div className="aspect-square rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/10 group relative shadow-2xl">
                                    <img src={`data:${project.result.adCreative.mimeType};base64,${project.result.adCreative.base64}`} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button className="px-6 py-2 bg-white text-black rounded-full font-black text-[10px]">تحميل 📥</button>
                                    </div>
                                </div>
                                <p className="text-center text-[10px] font-black text-[#FFD700] uppercase tracking-widest">Master Ad Post</p>
                            </div>
                        </div>
                    </div>

                    {/* Copywriting Section */}
                    <div className="space-y-8">
                        <h3 className="text-xl font-black text-[#FFD700] pr-4 border-r-4 border-[#FFD700]">الكابشن والخطافات</h3>
                        <div className="space-y-4">
                            {project.result.socialContent.map((c, i) => (
                                <div key={i} className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 space-y-4 hover:border-[#FFD700]/50 transition-all">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black bg-[#FFD700] text-black px-3 py-1 rounded-full uppercase">Caption 0{i + 1}</span>
                                        <button onClick={() => navigator.clipboard.writeText(c.caption)} className="text-[#FFD700] text-[10px] font-black hover:text-white transition-colors">نسخ 📋</button>
                                    </div>
                                    <p className="text-sm font-bold text-slate-200 leading-relaxed italic">"{c.hook}"</p>
                                    <p className="text-xs text-slate-400 leading-relaxed">{c.caption}</p>
                                    <p className="text-[#FFD700] text-[10px] font-black">{c.hashtags}</p>
                                </div>
                            ))}
                        </div>
                        <div className="bg-yellow-900/20 border border-yellow-500/30 p-8 rounded-[2.5rem] space-y-4 shadow-inner">
                            <div className="flex items-center gap-2 text-[#FFD700]">
                                <span className="text-2xl">🎬</span>
                                <h4 className="text-xs font-black uppercase tracking-widest">خطة الريلز (Reel Script)</h4>
                            </div>
                            <p className="text-xs text-slate-300 font-bold leading-relaxed italic">"{project.result.reelPlan.script}"</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <main className="w-full py-10 animate-in fade-in duration-700 text-right" dir="rtl">
            <div className="max-w-5xl mx-auto space-y-12">
                <div className="space-y-4 text-center md:text-right">
                    <h1 className="text-6xl font-black text-white tracking-tighter">Daily Content Pack 📅</h1>
                    <p className="text-slate-400 text-xl font-bold">خلص محتوى الأسبوع في 5 دقايق صبّاحي.</p>
                </div>

                <div className="bg-white/5 rounded-[3.5rem] p-10 md:p-14 border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.5)] space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <label className="text-sm font-black text-[#FFD700] uppercase tracking-widest pr-4 border-r-4 border-[#FFD700]">1. صور المنتج (2-3 صور)</label>
                            <div className="aspect-square">
                                <ImageWorkspace
                                    id="daily-up-v2"
                                    images={project.productImages}
                                    onImagesUpload={handleFileUpload}
                                    onImageRemove={(idx) => setProject(p => ({ ...p, productImages: p.productImages.filter((_, i) => i !== idx) }))}
                                    isUploading={false}
                                    title="اسحب صور المنتج هنا"
                                />
                            </div>
                        </div>
                        <div className="space-y-10">
                            <div className="space-y-6">
                                <label className="text-sm font-black text-[#FFD700] uppercase tracking-widest pr-4 border-r-4 border-[#FFD700]">2. وصف سريع لهدفك اليوم</label>
                                <textarea
                                    value={project.description}
                                    onChange={e => setProject(p => ({ ...p, description: e.target.value }))}
                                    placeholder="مثلاً: 'إطلاق عطر جديد بخصم 30% لمتابعين تيك توك'..."
                                    className="w-full h-48 bg-black/40 border border-white/10 rounded-[2.5rem] p-8 font-bold text-white outline-none focus:border-[#FFD700] shadow-inner resize-none text-lg leading-relaxed placeholder:text-slate-600"
                                />
                            </div>
                            <div className="space-y-6">
                                <label className="text-sm font-black text-[#FFD700] uppercase tracking-widest pr-4 border-r-4 border-[#FFD700]">3. نبرة المحتوى</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['عفوي وجذاب', 'احترافي وفخم', 'كوميدي ومرح', 'مثير للجدل'].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setProject(p => ({ ...p, tone: t }))}
                                            className={`py-4 rounded-2xl font-black text-xs border-2 transition-all ${project.tone === t ? 'bg-[#FFD700] border-[#FFD700] text-black shadow-lg' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerateAll}
                        disabled={isGenerating || !project.productImages.length}
                        className="w-full h-20 md:h-24 bg-[#FFD700] text-black font-black rounded-[2.5rem] text-xl md:text-3xl shadow-[0_20px_60px_rgba(255,215,0,0.4)] transition-all active:scale-95 flex items-center justify-center gap-6"
                    >
                        {isGenerating ? (
                            <div className="flex flex-col items-center">
                                <span className="text-xl">جاري توليد حقيبة المحتوى... {project.progress}%</span>
                                <div className="w-80 h-2 bg-white/20 rounded-full mt-4 overflow-hidden">
                                    <div className="h-full bg-white transition-all duration-500 shadow-[0_0_20px_white]" style={{ width: `${project.progress}%` }}></div>
                                </div>
                            </div>
                        ) : (
                            <>🚀 توليد الحقيبة الكاملة (30 نقطة)</>
                        )}
                    </button>
                </div>
            </div>
        </main>
    );
};

export default DailyPackStudio;
