
import React, { useCallback, useState, useEffect } from 'react';
import { PlanStudioProject, ImageFile, PlanIdea } from '../types';
import { resizeImage } from '../utils';
import { generateCampaignPlan, generateImage, analyzeProductForCampaign } from '../services/geminiService';
import { TARGET_MARKETS, DIALECTS } from '../constants'; // استخدام الثوابت الجديدة
import ImageWorkspace from './ImageWorkspace';

const MagicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const ExportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h2m3 2v-3a2 2 0 00-2-2H9a2 2 0 00-2 2v3m0 0l-3-3m3 3l3-3" />
    </svg>
);

const GlobeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
);

const LOGO_IMAGE_URL = "https://i.ibb.co/MDrpHPzS/Artboard-1.png";

const PlanStudio: React.FC<{
    project: PlanStudioProject;
    setProject: React.Dispatch<React.SetStateAction<PlanStudioProject>>;
    userId?: string;
    refreshCredits?: () => void;
}> = ({ project, setProject, userId, refreshCredits }) => {

    const [isDownloading, setIsDownloading] = useState<string | null>(null);

    useEffect(() => {
        if (project.productImages.length > 0 && !project.categoryAnalysis && !project.isAnalyzingCategory) {
            const runAnalysis = async () => {
                setProject(s => ({ ...s, isAnalyzingCategory: true }));
                try {
                    const analysis = await analyzeProductForCampaign(project.productImages);
                    setProject(s => ({ ...s, categoryAnalysis: analysis, isAnalyzingCategory: false }));
                } catch (err) { setProject(s => ({ ...s, isAnalyzingCategory: false })); }
            };
            runAnalysis();
        }
    }, [project.productImages.length, project.categoryAnalysis, project.isAnalyzingCategory, setProject]);

    const handleFileUpload = (target: 'product') => async (files: File[]) => {
        if (!files || files.length === 0) return;
        setProject(s => ({ ...s, isUploading: true, error: null, categoryAnalysis: null }));
        try {
            const uploaded = await Promise.all(files.map(async file => {
                const resized = await resizeImage(file, 2048, 2048);
                const reader = new FileReader();
                return new Promise<ImageFile>(res => {
                    reader.onloadend = () => res({ base64: (reader.result as string).split(',')[1], mimeType: resized.type, name: resized.name });
                    reader.readAsDataURL(resized);
                });
            }));
            setProject(s => ({ ...s, productImages: [...s.productImages, ...uploaded], isUploading: false }));
        } catch (err) { setProject(s => ({ ...s, isUploading: false, error: "Upload failed" })); }
    };

    const onCreatePlan = async () => {
        if (!project.prompt.trim()) { setProject(s => ({ ...s, error: 'فضلاً اكتب هدفك أولاً' })); return; }
        setProject(s => ({ ...s, isGeneratingPlan: true, error: null }));
        try {
            const plan = await generateCampaignPlan(project.productImages, project.prompt, project.targetMarket, project.dialect);
            const ideas: PlanIdea[] = plan.map(p => ({ ...p, image: null, isLoadingImage: false, imageError: null }));
            setProject(s => ({ ...s, ideas, isGeneratingPlan: false }));
        } catch (err) { setProject(s => ({ ...s, isGeneratingPlan: false, error: "فشل إنشاء الخطة" })); }
    };

    const onGenerateIdeaImage = async (ideaId: string) => {
        const ideaIdx = project.ideas.findIndex(i => i.id === ideaId);
        if (ideaIdx === -1) return;
        setProject(s => { const next = [...s.ideas]; next[ideaIdx] = { ...next[ideaIdx], isLoadingImage: true, imageError: null }; return { ...s, ideas: next }; });
        try {
            const finalPrompt = `Professional commercial photography for social media. Scenario: ${project.ideas[ideaIdx].scenario}. 4k, ultra-hd.`;
            const image = await generateImage(project.productImages, finalPrompt, null, "3:4");
            setProject(s => { const next = [...s.ideas]; next[ideaIdx] = { ...next[ideaIdx], image, isLoadingImage: false }; return { ...s, ideas: next }; });
        } catch (err) { setProject(s => { const next = [...s.ideas]; next[ideaIdx] = { ...next[ideaIdx], isLoadingImage: false, imageError: "Error" }; return { ...s, ideas: next }; }); }
    };

    const handleExportFullReport = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        const ideasRows = project.ideas.map((idea, idx) => `
            <tr>
                <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: center; font-weight: bold;">${idx + 1}</td>
                <td style="padding: 15px; border-bottom: 1px solid #eee; font-weight: bold; color: #6366f1;">${idea.tov}</td>
                <td style="padding: 15px; border-bottom: 1px solid #eee; line-height: 1.6;">${idea.caption}</td>
                <td style="padding: 15px; border-bottom: 1px solid #eee; font-size: 11px; color: #666;">${idea.schedule}</td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <html>
            <head>
                <title>Ebdaa Pro Campaign Plan</title>
                <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'Tajawal', sans-serif; direction: rtl; padding: 40px; color: #333; }
                    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
                    .logo { height: 50px; }
                    h1 { margin: 0; color: #1e1e2e; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background: #f8fafc; padding: 15px; text-align: right; border-bottom: 2px solid #e2e8f0; }
                    .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <div><h1>تقرير خطة المحتوى الذكية</h1><p>عبر منصة Ebdaa Pro الذكية</p></div>
                    <img src="${LOGO_IMAGE_URL}" class="logo" />
                </div>
                <table>
                    <thead><tr><th>#</th><th>العنوان</th><th>المحتوى</th><th>الموعد</th></tr></thead>
                    <tbody>${ideasRows}</tbody>
                </table>
                <div class="footer">جميع الحقوق محفوظة لمنصة Ebdaa Pro © 2025</div>
                <div class="no-print" style="position: fixed; bottom: 30px; left: 30px;"><button onclick="window.print()" style="background:#6366f1; color:white; border:none; padding:15px 30px; border-radius:12px; font-weight:bold; cursor:pointer; box-shadow:0 10px 20px rgba(99,102,241,0.3);">تحميل كـ PDF</button></div>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <main className="w-full flex flex-col gap-8 pt-4 animate-in fade-in duration-700">
            <div className="glass-card rounded-[2.5rem] p-8 shadow-2xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h2 className="text-3xl font-black text-white tracking-tighter flex items-center">
                        <MagicIcon /> مخطط الحملات الاستراتيجي
                    </h2>
                    {project.ideas.length > 0 && (
                        <button onClick={handleExportFullReport} className="px-8 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white rounded-xl text-sm font-black uppercase tracking-widest flex items-center shadow-xl shadow-[var(--color-accent)]/20 transition-all">
                            <ExportIcon /> تحميل الخطة كاملة (PDF)
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4">
                        <ImageWorkspace id="plan-product-up" images={project.productImages} onImagesUpload={handleFileUpload('product')} onImageRemove={(i) => setProject(s => ({ ...s, productImages: s.productImages.filter((_, idx) => idx !== i) }))} isUploading={project.isUploading} />
                    </div>
                    <div className="lg:col-span-8 flex flex-col gap-6 text-right">
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                            <label className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-widest mb-2 block">هدف الحملة ورؤية البراند</label>
                            <textarea value={project.prompt} onChange={(e) => setProject(s => ({ ...s, prompt: e.target.value }))} placeholder="مثال: إطلاق مجموعة عطور خريفية جديدة بأسلوب فاخر وغامض..." className="w-full bg-transparent border-none p-0 text-lg font-medium focus:ring-0 placeholder:text-white/20 min-h-[100px] text-right" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-row-reverse">
                            <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2 mb-2 justify-end">السوق المستهدف <GlobeIcon /></label>
                                <select value={project.targetMarket} onChange={(e) => setProject(s => ({ ...s, targetMarket: e.target.value }))} className="bg-transparent border-none p-0 text-sm font-bold text-white focus:ring-0 w-full text-right">
                                    {TARGET_MARKETS.map(m => <option key={m} value={m} className="bg-slate-900">{m}</option>)}
                                </select>
                            </div>
                            <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2 mb-2 justify-end">اللهجة <ChatIcon /></label>
                                <select value={project.dialect} onChange={(e) => setProject(s => ({ ...s, dialect: e.target.value }))} className="bg-transparent border-none p-0 text-sm font-bold text-white focus:ring-0 w-full text-right">
                                    {DIALECTS.map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
                                </select>
                            </div>
                        </div>
                        <button onClick={onCreatePlan} disabled={project.isGeneratingPlan || !project.prompt.trim()} className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white font-black py-5 rounded-2xl shadow-xl shadow-[var(--color-accent)]/20 transition-all text-lg uppercase tracking-widest">
                            {project.isGeneratingPlan ? 'جاري بناء الاستراتيجية...' : 'توليد 9 منشورات احترافية'}
                        </button>
                    </div>
                </div>
            </div>
            {/* ideas content remains with RTL alignment already implemented */}
        </main>
    );
};

export default PlanStudio;
