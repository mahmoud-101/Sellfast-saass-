
import React, { useState } from 'react';
import { PowerStudioProject, ImageFile } from '../types';
import { runPowerProduction } from '../services/geminiService';
import { deductCredits, CREDIT_COSTS } from '../lib/supabase';
import ImageWorkspace from './ImageWorkspace';

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);

const LOGO_IMAGE_URL = "https://i.ibb.co/MDrpHPzS/Artboard-1.png";

const PowerStudio: React.FC<{
    project: PowerStudioProject;
    setProject: (project: any) => void;
    userId?: string;
    refreshCredits?: () => void;
}> = ({ project, setProject, userId, refreshCredits }) => {
    const [activeTab, setActiveTab] = useState<'visual' | 'content' | 'strategy'>('visual');

    const handleRunProduction = async () => {
        if (project.productImages.length === 0 || !project.goal.trim() || !userId) return;
        
        setProject((s: any) => ({ ...s, isGenerating: true, error: null, progress: 5, currentStep: 'بدء المحرك وتحميل الأصول...' }));
        try {
            const result = await runPowerProduction(
                project.productImages, 
                project.goal, 
                project.targetMarket, 
                project.dialect,
                (step, prog) => setProject((s: any) => ({ ...s, currentStep: step, progress: prog }))
            );
            
            const deducted = await deductCredits(userId, CREDIT_COSTS.POWER_PROD);
            
            if (deducted) {
                setProject((s: any) => ({ ...s, result, isGenerating: false, progress: 100, currentStep: 'اكتملت الحملة بنجاح' }));
                if (refreshCredits) refreshCredits();
            } else {
                setProject((s: any) => ({ ...s, isGenerating: false, error: `رصيدك غير كافٍ. تكلفة الإنتاج الشامل هي ${CREDIT_COSTS.POWER_PROD} نقطة.` }));
            }
        } catch (err) {
            setProject((s: any) => ({ ...s, isGenerating: false, error: err instanceof Error ? err.message : 'عذراً، حدث خطأ في النظام الذكي' }));
        }
    };

    const handleExportFullReport = () => {
        if (!project.result) return;
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const postsHtml = project.result.socialPlan.map((post, i) => `
            <div style="padding: 20px; border: 1px solid #eef2ff; border-radius: 15px; margin-bottom: 20px; background: #fafbff;">
                <div style="font-weight: 900; color: #6366f1; margin-bottom: 10px;">المنشور ${i+1}</div>
                <div style="font-weight: bold; margin-bottom: 8px;">🔥 ${post.hook}</div>
                <div style="line-height: 1.6; color: #444;">${post.caption}</div>
                <div style="margin-top:10px; color:#6366f1; font-size:12px;"># ${post.hashtags.join(' ')}</div>
            </div>
        `).join('');

        printWindow.document.write(`
            <html>
            <head>
                <title>Ebdaa Pro - Full Campaign Report</title>
                <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'Tajawal', sans-serif; direction: rtl; padding: 40px; color: #1e293b; }
                    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #6366f1; padding-bottom: 20px; }
                    .section { margin-top: 40px; }
                    .visual { width: 100%; max-width: 600px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>تقرير الحملة الإعلانية المتكاملة</h1>
                    <img src="${LOGO_IMAGE_URL}" height="50" />
                </div>
                <div class="section">
                    <h2>الرؤية البصرية الرئيسية</h2>
                    <img src="data:${project.result.visual?.mimeType};base64,${project.result.visual?.base64}" class="visual" />
                </div>
                <div class="section"><h2>التحليل الاستراتيجي</h2><p>${project.result.analysis}</p></div>
                <div class="section"><h2>خطة المحتوى</h2>${postsHtml}</div>
                <button onclick="window.print()" style="margin-top:40px; padding:15px 30px; background:#6366f1; color:white; border:none; border-radius:10px; font-weight:bold; cursor:pointer;">تحميل PDF</button>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="w-full flex flex-col gap-8 animate-in fade-in duration-700">
            {/* Input Section */}
            <div className="glass-card rounded-[3rem] p-10 shadow-2xl relative overflow-hidden border border-white/5">
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="lg:w-1/3">
                        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4 text-center">أصول المنتج</h3>
                        <ImageWorkspace id="power-up" images={project.productImages} onImagesUpload={(f) => {
                            const r = new FileReader(); r.onload = () => setProject((s: any) => ({ ...s, productImages: [...s.productImages, { base64: (r.result as string).split(',')[1], mimeType: f[0].type, name: f[0].name }] }));
                            r.readAsDataURL(f[0]);
                        }} onImageRemove={(idx) => setProject((s: any) => ({ ...s, productImages: s.productImages.filter((_: any, i: any) => i !== idx) }))} isUploading={false} />
                    </div>

                    <div className="lg:w-2/3 flex flex-col gap-6 text-right">
                        <h2 className="text-4xl font-black text-white flex items-center justify-end"><SparklesIcon /> الإنتاج السحري الشامل</h2>
                        <p className="text-white/40 text-sm">أدخل رؤيتك وسيقوم النظام بتوليد: هوية بصرية، خطة محتوى، سيناريوهات ريلز، وتحليل سوق كامل.</p>
                        
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                            <label className="text-[10px] font-black text-[var(--color-accent)] uppercase mb-2 block tracking-widest">ما هو هدفك من هذه الحملة؟</label>
                            <textarea value={project.goal} onChange={(e) => setProject((s: any) => ({ ...s, goal: e.target.value }))} className="w-full bg-transparent border-none p-0 text-lg font-bold text-white focus:ring-0 min-h-[120px] resize-none" placeholder="مثال: إطلاق منتج جديد للقهوة المختصة في دبي يستهدف جيل الشباب بأسلوب فاخر..." />
                        </div>
                        
                        <button onClick={handleRunProduction} disabled={project.isGenerating || project.productImages.length === 0 || !project.goal.trim()} className="w-full h-20 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white font-black rounded-2xl shadow-xl shadow-[var(--color-accent)]/20 transition-all active:scale-95 disabled:opacity-50">
                            {project.isGenerating ? (
                                <div className="flex flex-col items-center">
                                    <span className="text-sm mb-1">{project.currentStep}</span>
                                    <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-white transition-all duration-500" style={{ width: `${project.progress}%` }}></div>
                                    </div>
                                </div>
                            ) : `إطلاق المحرك الذكي (${CREDIT_COSTS.POWER_PROD} نقطة)`}
                        </button>
                        {project.error && <p className="text-red-400 text-center font-bold text-xs">{project.error}</p>}
                    </div>
                </div>
            </div>

            {/* Results Dashboard */}
            {project.result && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-10 duration-1000">
                    <div className="flex justify-center">
                        <div className="bg-white/5 p-1.5 rounded-2xl border border-white/10 flex gap-2">
                            <button onClick={() => setActiveTab('visual')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'visual' ? 'bg-[var(--color-accent)] text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>الرؤية البصرية</button>
                            <button onClick={() => setActiveTab('content')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'content' ? 'bg-[var(--color-accent)] text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>خطة المحتوى</button>
                            <button onClick={() => setActiveTab('strategy')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'strategy' ? 'bg-[var(--color-accent)] text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>الاستراتيجية</button>
                        </div>
                    </div>

                    {activeTab === 'visual' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div className="glass-card rounded-[3rem] p-8 border border-white/5">
                                <img src={`data:${project.result.visual?.mimeType};base64,${project.result.visual?.base64}`} className="w-full rounded-[2rem] shadow-2xl" alt="Hero Visual" />
                                <button onClick={() => {
                                    const a = document.createElement('a');
                                    a.href = `data:${project.result!.visual!.mimeType};base64,${project.result!.visual!.base64}`;
                                    a.download = "Ebdaa-Pro-Hero.png";
                                    a.click();
                                }} className="w-full mt-6 py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl border border-white/10 transition-all">تحميل الصورة 4K</button>
                            </div>
                            <div className="glass-card rounded-[3rem] p-8 border border-white/5 text-right space-y-6">
                                <h3 className="text-2xl font-black text-white">تحليل المشهد الإبداعي</h3>
                                <div className="p-6 bg-white/5 rounded-3xl text-sm leading-relaxed text-white/70 italic">
                                    "{project.result.visualPrompt}"
                                </div>
                                <p className="text-white/60 leading-relaxed">{project.result.analysis.split('.')[0]}.</p>
                                <button onClick={handleExportFullReport} className="w-full py-5 bg-[var(--color-accent)] text-white font-black rounded-2xl shadow-xl">تصدير الملف كاملاً PDF</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'content' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {project.result.socialPlan.map((post, i) => (
                                <div key={i} className="glass-card p-6 rounded-[2rem] border border-white/5 text-right flex flex-col gap-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-3 py-1 rounded-full">{post.schedule}</span>
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Post 0{i+1}</span>
                                    </div>
                                    <h4 className="font-black text-white">🔥 {post.hook}</h4>
                                    <p className="text-xs text-white/50 leading-relaxed line-clamp-4">{post.caption}</p>
                                    <div className="flex flex-wrap gap-1 justify-end">
                                        {post.hashtags.map((h, idx) => <span key={idx} className="text-[9px] text-[var(--color-accent)] font-bold">#{h}</span>)}
                                    </div>
                                    <button onClick={() => navigator.clipboard.writeText(`${post.hook}\n\n${post.caption}\n\n${post.hashtags.map(h=>'#'+h).join(' ')}`)} className="mt-auto py-2 text-[10px] font-black text-white/30 hover:text-white uppercase tracking-widest transition-all">Copy Text</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'strategy' && (
                        <div className="glass-card rounded-[3rem] p-10 border border-white/5 text-right space-y-10">
                            <section className="space-y-4">
                                <h3 className="text-xl font-black text-[var(--color-accent)]">التموضع الاستراتيجي في السوق</h3>
                                <p className="text-white/70 leading-relaxed whitespace-pre-wrap">{project.result.analysis}</p>
                            </section>
                            <section className="space-y-6">
                                <h3 className="text-xl font-black text-[var(--color-accent)]">سيناريوهات الريلز المقترحة</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {project.result.reelsScripts.map((r, i) => (
                                        <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-3">
                                            <div className="font-black text-white text-sm">المشهد: {r.scene}</div>
                                            <div className="text-xs text-white/40"><span className="text-[var(--color-accent)] font-bold">بصرياً:</span> {r.visualDesc}</div>
                                            <div className="text-xs text-emerald-400"><span className="font-bold">الصوت:</span> {r.audioOverlay}</div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PowerStudio;
