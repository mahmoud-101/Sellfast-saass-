
import React, { useCallback } from 'react';
import { ImageFile, BrandingStudioProject, AspectRatio } from '../types';
import { resizeImage } from '../utils';
import { analyzeLogoForBranding, generateImage } from '../services/geminiService';
import ImageWorkspace from './ImageWorkspace';
import BrandingResultsGrid from './BrandingResultsGrid';
import { ASPECT_RATIOS } from '../constants';

const MOCKUP_CATEGORIES = [
    'Logo Construction Grid', 'Typography Showcase', 'Logo Color Variations', 'Monochrome Version',
    '3D Glass Logo', 'Business Card Mockup', '3D Glass App Icon', 'Creative Pen Mockup',
    'Merchandise (Tote Bag)', 'Pencil Sketch Logo', 'Notebook Mockup', 'Waving Flag Mockup'
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
                const prompt = `Premium Brand Identity: ${category} using the provided logo. Aspect ratio: ${project.aspectRatio}. 4k resolution, professional presentation.`;
                return generateImage([project.logos[0]], prompt, null)
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
        } catch(err) { setProject(s => ({...s, error: 'Analysis failed' })); }
        finally { setProject(s => ({...s, isGenerating: false})); }
    }, [project.logos, project.aspectRatio, setProject]);

    return (
        <main className="w-full max-w-7xl flex flex-col gap-6 animate-in fade-in duration-700">
            <div className="glass-card rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
                <div className="w-full md:w-56">
                    <ImageWorkspace id="brand-up" title="Upload Logo" images={project.logos} onImagesUpload={async f => {
                        const r = await resizeImage(f[0], 1024, 1024);
                        const reader = new FileReader();
                        reader.onload = () => setProject(s => ({ ...s, logos: [{ base64: (reader.result as string).split(',')[1], mimeType: r.type, name: r.name }] }));
                        reader.readAsDataURL(r);
                    }} onImageRemove={() => setProject(s => ({ ...s, logos: [] }))} isUploading={project.isUploading} />
                </div>
                <div className="flex-grow text-right">
                    <h2 className="text-3xl font-black text-white">استوديو الهوية البصرية الذكي</h2>
                    <p className="text-white/40 text-sm mt-2">ارفع شعارك وسنقوم ببناء دليل هوية كامل وموك آب احترافي في ثوانٍ.</p>
                    <div className="mt-6 flex flex-wrap gap-2 justify-end">
                        {ASPECT_RATIOS.map(r => (
                            <button key={r.value} onClick={() => setProject(s => ({ ...s, aspectRatio: r.value as AspectRatio }))} className={`px-5 py-2 text-[10px] font-black rounded-full border transition-all ${project.aspectRatio === r.value ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white' : 'bg-white/5 border-white/5 text-white/40 hover:text-white'}`}>{r.label}</button>
                        ))}
                    </div>
                </div>
                <button onClick={onGenerate} disabled={project.logos.length === 0 || project.isGenerating} className="w-full md:w-auto h-20 px-10 bg-[var(--color-accent)] text-white font-black rounded-2xl shadow-xl transition-all disabled:opacity-30">توليد الهوية الآن</button>
            </div>

            {project.colors.length > 0 && (
                <div className="glass-card rounded-[2rem] p-6 text-right animate-in slide-in-from-bottom-2">
                    <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-4">لوحة الألوان المستخرجة</h3>
                    <div className="flex flex-wrap gap-4 justify-end">
                        {project.colors.map(c => (
                            <div key={c} className="flex flex-col items-center gap-2">
                                <div className="w-16 h-16 rounded-2xl border border-white/10 shadow-lg" style={{backgroundColor: c}}></div>
                                <span className="text-[10px] font-mono text-white/50">{c}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {project.results.length > 0 && <BrandingResultsGrid results={project.results} />}
        </main>
    );
};

export default BrandingStudio;
