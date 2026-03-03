
import React, { useState } from 'react';
import { PlanStudioProject, ImageFile, PlanIdea } from '../types';
import { resizeImage } from '../utils';
import { generateCampaignPlan, generateImage } from '../services/geminiService';
import ImageWorkspace from './ImageWorkspace';
import { saveGeneratedAsset } from '../lib/supabase';

const TARGET_MARKETS = ['مصر', 'السعودية', 'الإمارات', 'الخليج العربي', 'عالمي'];
const DIALECTS = ['لهجة مصرية', 'لهجة سعودية', 'فصحى بسيطة', 'لهجة شامية', 'الإنجليزية'];

interface Props {
    project: PlanStudioProject;
    setProject: React.Dispatch<React.SetStateAction<PlanStudioProject>>;
    onBridgeToPhotoshoot: (context: string) => void;
    userId: string;
}

const PlanStudio: React.FC<Props> = ({ project, setProject, onBridgeToPhotoshoot, userId }) => {
    const [sallaUrl, setSallaUrl] = useState('');
    const [isScraping, setIsScraping] = useState(false);

    const handleScrapeSalla = async () => {
        if (!sallaUrl.trim()) return;
        setIsScraping(true);
        try {
            const res = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: sallaUrl })
            });
            const data = await res.json();

            if (res.ok) {
                // Prepare injected prompt text
                const injectedText = `[Product Name]: ${data.title}\n[Description]: ${data.description}\n[Price]: ${data.price}`;
                setProject(s => ({ ...s, prompt: injectedText + '\n\n' + s.prompt }));

                // Bring in the image if available and convert it to ImageFile
                if (data.image) {
                    try {
                        const imgRes = await fetch(data.image);
                        const blob = await imgRes.blob();
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const b64 = (reader.result as string).split(',')[1];
                            setProject(s => ({ ...s, productImages: [...s.productImages, { base64: b64, mimeType: blob.type, name: 'scraped.jpg' }] }));
                        };
                        reader.readAsDataURL(blob);
                    } catch (e) {
                        console.error("Failed to fetch image cross-origin", e);
                    }
                }
            } else {
                alert("Failed to extract product: " + data.error);
            }
        } catch (e: any) {
            alert("Error linking product: " + e.message);
        } finally {
            setIsScraping(false);
            setSallaUrl('');
        }
    };

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
            const ideas: PlanIdea[] = plan.map((p: any) => ({ ...p, image: null, isLoadingImage: true, imageError: null }));

            await saveGeneratedAsset(userId, 'CAMPAIGN_PLAN', { plan_content: JSON.stringify(plan) }, { prompt: project.prompt, market: project.targetMarket });

            setProject(s => ({ ...s, ideas, isGeneratingPlan: false }));

            // Background step: Generate actual images for each post idea
            ideas.forEach(async (idea) => {
                try {
                    const scenePrompt = `Social media creative for ${project.targetMarket}. Context: ${idea.visualPrompt}. Tone: ${idea.tov}. Highly aesthetic advertisement, professional lighting.`;
                    const img = await generateImage(project.productImages, scenePrompt, null, "1:1");
                    setProject(s => ({
                        ...s,
                        ideas: s.ideas.map(i => i.id === idea.id ? { ...i, image: img, isLoadingImage: false } : i)
                    }));
                } catch (e) {
                    setProject(s => ({
                        ...s,
                        ideas: s.ideas.map(i => i.id === idea.id ? { ...i, isLoadingImage: false, imageError: 'فشل في توليد الصورة' } : i)
                    }));
                }
            });

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
                            {/* Auto-Importer Bar */}
                            <div className="flex flex-col sm:flex-row gap-3 bg-white/5 border border-[#FFD700]/20 rounded-3xl p-4 shadow-inner">
                                <input
                                    type="text"
                                    value={sallaUrl}
                                    onChange={(e) => setSallaUrl(e.target.value)}
                                    placeholder="🔗 أدخل رابط منتج متجرك (سلة، زد، الخ...)"
                                    className="flex-1 bg-black/60 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-[#FFD700] transition-colors"
                                />
                                <button
                                    onClick={handleScrapeSalla}
                                    disabled={isScraping || !sallaUrl.trim()}
                                    className="bg-[#FFD700]/20 text-[#FFD700] hover:bg-[#FFD700] hover:text-black px-6 py-4 rounded-2xl font-black text-sm transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isScraping ? 'جاري السحب...' : '🎯 استيراد سحري'}
                                </button>
                            </div>


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
                            <div key={idea.id} className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 flex flex-col gap-4 hover:border-[#FFD700]/30 transition-all group">
                                <span className="px-4 py-1.5 bg-[#FFD700] text-black w-max rounded-full text-[10px] font-black uppercase">Day 0{idx + 1}</span>
                                <h4 className="text-xl font-black text-white">{idea.tov}</h4>
                                <p className="text-sm text-slate-300 leading-relaxed italic border-b border-white/5 pb-4">"{idea.caption}"</p>

                                <div className="w-full aspect-square rounded-[1.5rem] overflow-hidden relative shadow-lg bg-black">
                                    {idea.image ? (
                                        <div className="relative group/img w-full h-full">
                                            <img src={`data:${idea.image.mimeType};base64,${idea.image.base64}`} alt="Post Image" className="w-full h-full object-cover border border-white/10 rounded-[1.5rem]" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center rounded-[1.5rem] backdrop-blur-sm">
                                                <button
                                                    onClick={() => window.dispatchEvent(new CustomEvent('openImageEditor', { detail: idea.image }))}
                                                    className="bg-[#FFD700] text-black px-6 py-3 rounded-xl font-black text-sm hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)] flex items-center gap-2"
                                                >
                                                    <span>✏️</span> تعديل وتصميم
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 animate-pulse absolute inset-0 text-center gap-3">
                                            {idea.isLoadingImage ? (
                                                <>
                                                    <div className="w-8 h-8 border-4 border-[#FFD700] border-t-transparent flex items-center justify-center rounded-full animate-spin shadow-[0_0_15px_rgba(255,215,0,0.5)]"></div>
                                                    <span className="text-[#FFD700] text-xs font-bold tracking-widest">جاري رسم البوست...</span>
                                                </>
                                            ) : (
                                                <span className="text-red-500 text-xs font-bold">{idea.imageError || 'تعذر توليد الصورة'}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {idea.prompt && (
                                    <p className="text-[10px] text-slate-500 font-bold opacity-60 mt-2">✨ {idea.prompt}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
};

export default PlanStudio;
