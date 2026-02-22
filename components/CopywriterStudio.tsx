
import React, { useCallback, useState, useEffect } from 'react';
import { PlanStudioProject, ImageFile, PlanIdea } from '../types';
import { resizeImage } from '../utils';
import { generateCampaignPlan, generateImage, analyzeProductForCampaign } from '../services/geminiService';
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
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
);

const TARGET_MARKETS = [
    'Egypt', 'Saudi Arabia (KSA)', 'United Arab Emirates (UAE)', 'The Gulf (General)', 'Global / International', 'Europe', 'North America'
];

const DIALECTS = [
    'Egyptian Arabic (General)', 'Egyptian Arabic (Street/Sarcastic)', 'Gulf Arabic (Saudi/Emirati)', 'Modern Standard Arabic (Formal)', 'Jordanian/Lebanese Arabic', 'English (Professional/Corporate)', 'English (Gen-Z/Slang)'
];

const LOGO_IMAGE_URL = "https://i.ibb.co/MDrpHPzS/Artboard-1.png";

const CopywriterStudio: React.FC<{
    project: PlanStudioProject;
    setProject: React.Dispatch<React.SetStateAction<PlanStudioProject>>;
}> = ({ project, setProject }) => {

    const [isDownloading, setIsDownloading] = useState<string | null>(null);

    // Safety checks
    const productImages = project?.productImages || [];
    const ideas = project?.ideas || [];
    const currentPrompt = project?.prompt || '';

    // Trigger Category Analysis when images change
    useEffect(() => {
        if (productImages.length > 0 && !project?.categoryAnalysis && !project?.isAnalyzingCategory) {
            const runAnalysis = async () => {
                setProject(s => ({ ...s, isAnalyzingCategory: true }));
                try {
                    const analysis = await analyzeProductForCampaign(productImages);
                    setProject(s => ({ ...s, categoryAnalysis: analysis, isAnalyzingCategory: false }));
                } catch (err) {
                    setProject(s => ({ ...s, isAnalyzingCategory: false }));
                }
            };
            runAnalysis();
        }
    }, [productImages.length, project?.categoryAnalysis, project?.isAnalyzingCategory, setProject]);

    if (!project) return null;

    const handleFileUpload = async (files: File[]) => {
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
            setProject(s => ({
                ...s,
                productImages: [...(s.productImages || []), ...uploaded],
                isUploading: false
            }));
        } catch (err) {
            setProject(s => ({ ...s, isUploading: false, error: "Upload failed" }));
        }
    };

    const onCreatePlan = async () => {
        if (!currentPrompt.trim()) {
            setProject(s => ({ ...s, error: 'Please describe your goal or campaign vision.' }));
            return;
        }
        setProject(s => ({ ...s, isGeneratingPlan: true, error: null }));
        try {
            const plan = await generateCampaignPlan(productImages, currentPrompt, project.targetMarket, project.dialect);
            const planIdeas: PlanIdea[] = plan.map((p: any) => ({
                ...p,
                image: null,
                isLoadingImage: false,
                imageError: null
            }));
            setProject(s => ({ ...s, ideas: planIdeas, isGeneratingPlan: false }));
        } catch (err) {
            setProject(s => ({ ...s, isGeneratingPlan: false, error: "Plan generation failed" }));
        }
    };

    const onGenerateIdeaImage = async (ideaId: string) => {
        const ideaIdx = ideas.findIndex(i => i.id === ideaId);
        if (ideaIdx === -1) return;

        setProject(s => {
            const next = [...(s.ideas || [])];
            next[ideaIdx] = { ...next[ideaIdx], isLoadingImage: true, imageError: null };
            return { ...s, ideas: next };
        });

        try {
            const textConstraint = "STRICTLY PRESERVE all original branding from the product images if provided. NO EXTRA generated text in the scene.";
            const categoryContext = project.categoryAnalysis ? `Product Category context: ${project.categoryAnalysis}.` : '';
            const finalPrompt = `Professional commercial photography for social media. ${categoryContext} Scenario: ${ideas[ideaIdx].scenario}. Style: Photorealistic, high-end commercial shot. ${textConstraint}`;
            
            const image = await generateImage(productImages, finalPrompt, null, "3:4");
            
            setProject(s => {
                const next = [...(s.ideas || [])];
                next[ideaIdx] = { ...next[ideaIdx], image, isLoadingImage: false };
                return { ...s, ideas: next };
            });
        } catch (err) {
            setProject(s => {
                const next = [...(s.ideas || [])];
                next[ideaIdx] = { ...next[ideaIdx], isLoadingImage: false, imageError: "Failed to generate image" };
                return { ...s, ideas: next };
            });
        }
    };

    const handleDownload = (image: ImageFile, label: string, resolution: '2k' | '4k' | 'original' = 'original') => {
        if (resolution === 'original') {
            const link = document.createElement('a');
            link.href = `data:${image.mimeType};base64,${image.base64}`;
            link.download = `Ebdaa-Pro-Post-${label.replace(/\s+/g, '-')}-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        setIsDownloading(`${label}-${resolution}`);
        const img = new Image();
        img.src = `data:${image.mimeType};base64,${image.base64}`;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                setIsDownloading(null);
                return;
            };

            const targetWidth = resolution === '4k' ? 4096 : 2048;
            const aspectRatio = img.width / img.height;
            
            canvas.width = targetWidth;
            canvas.height = targetWidth / aspectRatio;

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const link = document.createElement('a');
            link.download = `Ebdaa-Pro-Post-${label.replace(/\s+/g, '-')}-${resolution}-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            setIsDownloading(null);
        };
        img.onerror = () => setIsDownloading(null);
    };

    const updateIdea = (id: string, field: keyof PlanIdea, value: string) => {
        setProject(s => ({
            ...s,
            ideas: (s.ideas || []).map(i => i.id === id ? { ...i, [field]: value } : i)
        }));
    };

    const handleExportFullReport = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const ideasRows = ideas.map((idea, idx) => `
            <tr>
                <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: center; font-weight: bold; width: 50px;">${idx + 1}</td>
                <td style="padding: 15px; border-bottom: 1px solid #eee; font-weight: bold; color: #4f46e5; width: 150px;">${idea.tov}</td>
                <td style="padding: 15px; border-bottom: 1px solid #eee; line-height: 1.6;">${idea.caption}</td>
                <td style="padding: 15px; border-bottom: 1px solid #eee; font-size: 11px; color: #666; width: 120px;">${idea.schedule}</td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <html>
            <head>
                <title>Ebdaa Pro Campaign - ${project.name || 'Analysis'}</title>
                <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'Tajawal', sans-serif; direction: rtl; padding: 40px; color: #333; }
                    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
                    .logo { height: 60px; }
                    .title-box h1 { margin: 0; color: #000; font-size: 28px; }
                    .title-box p { margin: 5px 0 0 0; color: #666; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background: #f9f9f9; padding: 15px; text-align: right; border-bottom: 2px solid #eee; font-size: 14px; text-transform: uppercase; }
                    .footer { margin-top: 50px; text-align: center; font-size: 13px; color: #666; border-top: 1px solid #eee; padding-top: 25px; }
                    .footer a { color: #4f46e5; text-decoration: none; font-weight: bold; border-bottom: 1px dashed #4f46e5; }
                    @media print {
                        .no-print { display: none; }
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="title-box">
                        <h1>خطة المنشورات الإعلانية الذكية</h1>
                        <p>بواسطة Ebdaa Pro Intelligence</p>
                    </div>
                    <img src="${LOGO_IMAGE_URL}" class="logo" />
                </div>
                
                <div style="margin-bottom: 30px; background: #f5f5ff; padding: 20px; border-radius: 10px; border-right: 5px solid #4f46e5;">
                    <h3 style="margin-top: 0; color: #4f46e5;">تفاصيل الحملة:</h3>
                    <p><strong>السوق المستهدف:</strong> ${project.targetMarket}</p>
                    <p><strong>لهجة المحتوى:</strong> ${project.dialect}</p>
                    <p><strong>رؤية البراند:</strong> ${currentPrompt}</p>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>العنوان / الخطاف</th>
                            <th>نص المنشور (Caption)</th>
                            <th>موعد النشر المقترح</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ideasRows}
                    </tbody>
                </table>

                <div class="footer">
                    تم إنشاء هذا التقرير آلياً بواسطة Ebdaa Pro AI. جميع الحقوق محفوظة.
                </div>

                <div class="no-print" style="position: fixed; bottom: 30px; left: 30px;">
                    <button onclick="window.print()" style="background: #4f46e5; color: white; border: none; padding: 18px 35px; border-radius: 50px; font-weight: bold; cursor: pointer; box-shadow: 0 15px 30px rgba(79,70,229,0.4); font-size: 16px; transition: transform 0.2s;">
                        تأكيد وتحميل كـ PDF / طباعة
                    </button>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <main className="w-full flex flex-col gap-8 pt-4 pb-12 animate-in fade-in duration-700 text-right" dir="rtl">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-indigo-600 to-transparent opacity-20"></div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                        <MagicIcon /> استوديو المنشورات الذكي
                    </h2>
                    <div className="flex gap-3">
                        {ideas.length > 0 && (
                            <button
                                onClick={handleExportFullReport}
                                className="px-8 py-3 bg-[#FFD700] text-black rounded-full text-sm font-black uppercase tracking-widest flex items-center shadow-xl shadow-[#FFD700]/20 transition-all active:scale-95 border border-white/10"
                            >
                                <ExportIcon /> تصدير المنشورات (PDF)
                            </button>
                        )}
                        <div className="px-4 py-2.5 bg-slate-50 rounded-full border border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                            Output Size: 3:4
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="flex flex-col gap-4 text-center">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">صورة المنتج (اختياري)</label>
                            <ImageWorkspace
                                id="copy-product-up"
                                images={productImages}
                                onImagesUpload={handleFileUpload}
                                onImageRemove={(i) => setProject(s => ({ ...s, productImages: s.productImages.filter((_, idx) => idx !== i), categoryAnalysis: null }))}
                                isUploading={project.isUploading}
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <div className="flex flex-col gap-2 bg-black/40 p-6 rounded-3xl border border-white/10 shadow-inner">
                            <label className="text-xs font-bold text-[#FFD700] uppercase tracking-widest">هدف الحملة ورؤية البراند</label>
                            <textarea
                                value={project.prompt}
                                onChange={(e) => setProject(s => ({ ...s, prompt: e.target.value }))}
                                placeholder="مثلاً: 'إطلاق كولكشن ملابس صيفية جديدة تستهدف جيل الشباب في مصر والخليج.. التركيز على الحيوية والألوان المبهجة.'"
                                className="w-full bg-transparent border-none p-0 text-lg font-bold text-white focus:ring-0 placeholder:text-slate-500 min-h-[100px] suggestions-scrollbar"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <GlobeIcon /> السوق المستهدف
                                </label>
                                <select 
                                    value={project.targetMarket}
                                    onChange={(e) => setProject(s => ({ ...s, targetMarket: e.target.value }))}
                                    className="bg-transparent border-none p-0 text-sm font-bold text-slate-900 focus:ring-0 cursor-pointer outline-none"
                                >
                                    {TARGET_MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <ChatIcon /> لهجة المحتوى
                                </label>
                                <select 
                                    value={project.dialect}
                                    onChange={(e) => setProject(s => ({ ...s, dialect: e.target.value }))}
                                    className="bg-transparent border-none p-0 text-sm font-bold text-slate-900 focus:ring-0 cursor-pointer outline-none"
                                >
                                    {DIALECTS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className={`transition-all duration-500 overflow-hidden ${productImages.length > 0 ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0'}`}>
                            <div className="bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-2xl p-5">
                                <h4 className="text-[10px] font-black text-[#FFD700] uppercase tracking-[0.2em] mb-2">Market Intelligence</h4>
                                {project.isAnalyzingCategory ? (
                                    <div className="flex items-center gap-3 text-[#FFD700]/60 animate-pulse">
                                        <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
                                        <span className="text-[11px] font-bold">Analyzing product positioning...</span>
                                    </div>
                                ) : (
                                    <p className="text-[11px] text-slate-400 leading-relaxed italic">
                                        {project.categoryAnalysis || "Identify product category to get started..."}
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={onCreatePlan}
                            disabled={project.isGeneratingPlan || !project.prompt.trim()}
                            className="w-full bg-[#FFD700] text-black font-black py-5 rounded-2xl shadow-xl shadow-[#FFD700]/20 transition-all active:scale-[0.98] disabled:opacity-30 text-lg uppercase tracking-widest"
                        >
                            {project.isGeneratingPlan ? 'جاري رسم الاستراتيجية...' : 'توليد 9 منشورات احترافية'}
                        </button>
                    </div>
                </div>
            </div>

            {ideas.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {ideas.map((idea, idx) => (
                        <div key={idea.id} className="bg-white rounded-[2.5rem] overflow-hidden flex flex-col border border-slate-100 group hover:border-indigo-500/30 transition-all shadow-2xl animate-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
                            <div className="aspect-[3/4] bg-slate-100 relative overflow-hidden flex items-center justify-center">
                                {idea.isLoadingImage ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
                                        <span className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase">Generating 3:4 Visual...</span>
                                    </div>
                                ) : idea.image ? (
                                    <div className="w-full h-full relative group/img">
                                        <img src={`data:${idea.image.mimeType};base64,${idea.image.base64}`} alt="Post Visual" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => handleDownload(idea.image!, `Post-${idx+1}`, '2k')}
                                                className="p-3 bg-white text-black rounded-full hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-110 shadow-xl"
                                                title="Download 2K"
                                            >
                                                <span className="text-[10px] font-black">2K</span>
                                            </button>
                                            <button 
                                                onClick={() => handleDownload(idea.image!, `Post-${idx+1}`, '4k')}
                                                className="p-3 bg-white text-black rounded-full hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-110 shadow-xl"
                                                title="Download 4K"
                                            >
                                                <span className="text-[10px] font-black">4K</span>
                                            </button>
                                            <button 
                                                onClick={() => onGenerateIdeaImage(idea.id)}
                                                className="p-3 bg-slate-900 text-white rounded-full hover:bg-black transition-all transform hover:scale-110 border border-white/10"
                                                title="Regenerate"
                                            >
                                                <MagicIcon />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4 px-8 text-center">
                                        <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                                            <MagicIcon />
                                        </div>
                                        <button 
                                            onClick={() => onGenerateIdeaImage(idea.id)}
                                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-full transition-colors uppercase tracking-widest border border-white/10"
                                        >
                                            رندرة الصورة
                                        </button>
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-white">
                                    POST 0{idx + 1}
                                </div>
                            </div>

                            <div className="p-6 flex flex-col gap-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center flex-row-reverse">
                                        <label className="text-[9px] font-black text-[#FFD700] uppercase tracking-widest">المحتوى ({project.dialect})</label>
                                        <span className="text-[9px] font-bold text-slate-300">{idea.schedule}</span>
                                    </div>
                                    <textarea
                                        value={idea.caption}
                                        onChange={(e) => updateIdea(idea.id, 'caption', e.target.value)}
                                        className="w-full bg-black/40 rounded-xl p-3 text-sm text-white border border-white/5 focus:border-[#FFD700] focus:ring-0 resize-none suggestions-scrollbar h-24 font-bold"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1 text-right">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">عنوان التصميم</label>
                                        <input
                                            value={idea.tov}
                                            onChange={(e) => updateIdea(idea.id, 'tov', e.target.value)}
                                            className="w-full bg-slate-50 rounded-xl px-3 py-2 text-[11px] text-slate-900 font-black border border-slate-100"
                                        />
                                    </div>
                                    <div className="space-y-1 flex flex-col justify-end">
                                        <div className="flex gap-1.5 h-full pt-1">
                                            <button 
                                                onClick={() => handleDownload(idea.image!, `Post-${idx+1}`, '2k')}
                                                disabled={!idea.image || isDownloading === `Post-${idx+1}-2k`}
                                                className="flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[10px] font-black rounded-lg transition-all text-slate-600 disabled:opacity-20 flex items-center justify-center"
                                            >
                                                {isDownloading === `Post-${idx+1}-2k` ? '...' : '2K'}
                                            </button>
                                            <button 
                                                onClick={() => handleDownload(idea.image!, `Post-${idx+1}`, '4k')}
                                                disabled={!idea.image || isDownloading === `Post-${idx+1}-4k`}
                                                className="flex-1 bg-[#FFD700] hover:bg-yellow-400 text-[10px] font-black rounded-lg transition-all text-black disabled:opacity-20 flex items-center justify-center shadow-lg shadow-[#FFD700]/20"
                                            >
                                                {isDownloading === `Post-${idx+1}-4k` ? '...' : '4K'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1 text-right">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">فكرة التصوير (AI Scenario)</label>
                                    <textarea
                                        value={idea.scenario}
                                        onChange={(e) => updateIdea(idea.id, 'scenario', e.target.value)}
                                        className="w-full bg-slate-50 border border-dashed border-slate-200 rounded-xl px-3 py-2 text-[10px] text-slate-400 font-bold focus:border-indigo-500 focus:ring-0 resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {project.error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm text-center font-bold">
                    {project.error}
                </div>
            )}
        </main>
    );
};

export default CopywriterStudio;
