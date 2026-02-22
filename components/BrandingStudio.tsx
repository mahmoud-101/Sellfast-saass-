
import React, { useCallback } from 'react';
import { ImageFile, BrandingStudioProject, AspectRatio } from '../types';
import { resizeImage } from '../utils';
import { analyzeLogoForBranding, generateImage } from '../services/geminiService';
import ImageWorkspace from './ImageWorkspace';
import BrandingResultsGrid from './BrandingResultsGrid';
import { ASPECT_RATIOS } from '../constants';

const MOCKUP_CATEGORIES = [
    'Logo Grid System', 'Premium Business Card', '3D Wall Signage', 'App Icon Presentation',
    'Luxury Packaging', 'Stationery Set', 'Embroided Cap', 'Vehicle Branding'
];

const BrandingStudio: React.FC<{
  project: BrandingStudioProject;
  setProject: React.Dispatch<React.SetStateAction<BrandingStudioProject>>;
}> = ({ project, setProject }) => {

    const onGenerate = useCallback(async () => {
        if (project.logos.length === 0) return;
        setProject(s => ({...s, isAnalyzing: true, isGenerating: true, error: null, results: []}));
        try {
            const analysis = await analyzeLogoForBranding(project.logos);
            setProject(s => ({...s, colors: analysis.colors, isAnalyzing: false}));
            
            const initialResults = MOCKUP_CATEGORIES.map(category => ({ category, image: null, isLoading: true, error: null, editPrompt: '', isEditing: false }));
            setProject(s => ({...s, results: initialResults as any}));

            const promises = MOCKUP_CATEGORIES.map(category => {
                const prompt = `Hyper-realistic professional brand mockup: ${category} featuring the provided logo. Elegant studio background, soft lighting, 8k resolution.`;
                return generateImage([project.logos[0]], prompt, null, project.aspectRatio)
                    .then(image => ({ category, image }))
                    .catch(error => ({ category, error: error.message }));
            });

            const completed = await Promise.all(promises);
            setProject(s => {
                const next = [...s.results];
                completed.forEach(res => {
                    const idx = next.findIndex(r => r.category === res.category);
                    if (idx !== -1) {
                        if ('image' in res) next[idx] = { ...next[idx], image: res.image, isLoading: false };
                        else next[idx] = { ...next[idx], error: res.error, isLoading: false };
                    }
                });
                return { ...s, results: next };
            });
        } catch(err) { setProject(s => ({...s, error: 'تعذر تحليل الشعار، حاول مرة أخرى.' })); }
        finally { setProject(s => ({...s, isGenerating: false})); }
    }, [project.logos, project.aspectRatio, setProject]);

    return (
        <main className="w-full max-w-7xl flex flex-col gap-10 animate-in fade-in duration-700 text-right" dir="rtl">
            <div className="bg-white/5 rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-12 shadow-2xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-l from-[#FFD700] to-yellow-600 opacity-20"></div>
                
                <div className="w-full md:w-64">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">ارفع شعار براندك</h3>
                    <ImageWorkspace id="brand-up" title="Upload Logo" images={project.logos} onImagesUpload={async f => {
                        const r = await resizeImage(f[0], 1024, 1024);
                        const reader = new FileReader();
                        reader.onload = () => setProject(s => ({ ...s, logos: [{ base64: (reader.result as string).split(',')[1], mimeType: r.type, name: r.name }] }));
                        reader.readAsDataURL(r);
                    }} onImageRemove={() => setProject(s => ({ ...s, logos: [] }))} isUploading={project.isUploading} />
                </div>

                <div className="flex-grow space-y-6">
                    <h2 className="text-4xl font-black text-white tracking-tight">بناء الهوية البصرية الذكية</h2>
                    <p className="text-slate-500 text-lg font-bold">ارفع شعارك وسيقوم المحرك باستخلاص الألوان وإنشاء تطبيقات (Mockups) واقعية ترفع من قيمة براندك.</p>
                    
                    <div className="flex flex-wrap gap-3 justify-end pt-4">
                        {ASPECT_RATIOS.map(r => (
                            <button key={r.value} onClick={() => setProject(s => ({ ...s, aspectRatio: r.value as AspectRatio }))} className={`px-6 py-2.5 text-xs font-black rounded-xl border transition-all ${project.aspectRatio === r.value ? 'bg-[#FFD700] border-[#FFD700] text-black shadow-lg' : 'bg-white/5 border-white/10 text-slate-400 hover:border-[#FFD700]'}`}>{r.label}</button>
                        ))}
                    </div>
                </div>

                <button onClick={onGenerate} disabled={project.logos.length === 0 || project.isGenerating} className="w-full md:w-auto h-24 px-12 bg-[#FFD700] text-black font-black rounded-[2rem] shadow-2xl hover:bg-yellow-400 transition-all active:scale-95 disabled:opacity-30">
                    {project.isGenerating ? 'جاري الرندرة...' : 'توليد الهوية الكاملة'}
                </button>
            </div>

            {project.colors.length > 0 && (
                <div className="bg-white/5 rounded-[3rem] p-10 text-right animate-in slide-in-from-bottom-5 border border-white/5 shadow-xl">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-10 pr-4 border-r-4 border-[#FFD700]">لوحة الألوان المستخلصة</h3>
                    <div className="flex flex-wrap gap-10 justify-end">
                        {project.colors.map(c => (
                            <div key={c} className="flex flex-col items-center gap-4 group">
                                <div className="w-24 h-24 rounded-[2rem] border border-white/10 shadow-xl transition-all group-hover:scale-110 group-hover:rotate-6 cursor-pointer" style={{backgroundColor: c}}></div>
                                <span className="text-xs font-black text-slate-400 bg-white/5 px-3 py-1 rounded-lg border border-white/10">{c}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {project.results.length > 0 && (
                <div className="space-y-10">
                    <h3 className="text-2xl font-black text-white pr-4 border-r-4 border-[#FFD700]">تطبيقات الهوية البصرية</h3>
                    <BrandingResultsGrid results={project.results} />
                </div>
            )}
        </main>
    );
};

export default BrandingStudio;
