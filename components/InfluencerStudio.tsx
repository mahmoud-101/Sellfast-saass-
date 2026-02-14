
import React from 'react';
import { InfluencerStudioProject, ImageFile } from '../types';
import { generateImage } from '../services/geminiService';
import ImageWorkspace from './ImageWorkspace';

const Personas = [
    {
        id: 'saudi_male',
        label: 'شاب سعودي مودرن',
        prompt: 'High-end commercial lifestyle photo of a stylish young Saudi man in luxury traditional-modern fusion attire. He is naturally interacting with the product in a minimalist high-tech lounge in Riyadh. Cinematic lighting, soft shadows, photorealistic skin textures, blurry desert-chic background.'
    },
    {
        id: 'egy_female',
        label: 'فتاة مصرية عملية',
        prompt: 'Professional advertisement photo of a confident young Egyptian businesswoman in a modern Cairo office. She is smiling naturally while holding the product. Soft window daylight, high-end editorial style, depth of field, real office environment background.'
    },
    {
        id: 'global_model',
        label: 'موديل عالمي (فاشن)',
        prompt: 'Ultra-luxury fashion editorial. A world-class professional model posing with the product. Minimalist artistic studio environment, dramatic rim lighting, vogue aesthetic, sharp textures, high-fashion color grading.'
    },
    {
        id: 'family_home',
        label: 'أم في منزل عصري',
        prompt: 'Warm, authentic lifestyle photography. A beautiful Arab mother in a luxury modern home kitchen, using the product naturally with a warm smile. Soft morning sun through the window, cozy domestic atmosphere, photorealistic, commercial quality.'
    }
];

const InfluencerStudio: React.FC<{
    project: InfluencerStudioProject;
    setProject: React.Dispatch<React.SetStateAction<InfluencerStudioProject>>;
    userId?: string;
    refreshCredits?: () => void;
}> = ({ project, setProject, userId, refreshCredits }) => {

    const handleGenerate = async () => {
        if (project.productImages.length === 0 || project.selectedPersonas.length === 0) return;

        setProject(s => ({
            ...s,
            isGenerating: true,
            results: project.selectedPersonas.map(id => ({
                id,
                image: null,
                isLoading: true,
                persona: Personas.find(p => p.id === id)?.label || '',
                error: null
            }))
        }));

        const promises = project.selectedPersonas.map(async (id) => {
            const persona = Personas.find(p => p.id === id);
            try {
                // We send the product image + the refined persona prompt
                const img = await generateImage(project.productImages, persona!.prompt, null, "3:4");
                return { id, img, error: null };
            } catch (err) {
                return { id, img: null, error: 'فشل التوليد' };
            }
        });

        const completed = await Promise.all(promises);

        setProject(s => ({
            ...s,
            isGenerating: false,
            results: s.results.map(r => {
                const comp = completed.find(c => c.id === r.id);
                return {
                    ...r,
                    image: comp?.img || null,
                    isLoading: false,
                    error: comp?.error || null
                };
            })
        }));
    };

    return (
        <main className="w-full flex flex-col gap-8 pt-4 pb-12 animate-in fade-in duration-700 text-right">
            <div className="glass-card rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-[var(--color-accent)] to-transparent opacity-30"></div>
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="lg:w-1/3">
                        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4 text-center">المنتج المراد تسويقه</h3>
                        <ImageWorkspace id="inf-up" images={project.productImages} onImagesUpload={(f) => {
                            const reader = new FileReader();
                            reader.onload = () => setProject(s => ({ ...s, productImages: [...s.productImages, { base64: (reader.result as string).split(',')[1], mimeType: f[0].type, name: f[0].name }] }));
                            reader.readAsDataURL(f[0]);
                        }} onImageRemove={(i) => setProject(s => ({ ...s, productImages: s.productImages.filter((_, idx) => idx !== i) }))} isUploading={false} />
                    </div>
                    <div className="lg:w-2/3 flex flex-col gap-6">
                        <div className="space-y-2">
                            <h2 className="text-4xl font-black text-white">استوديو الموديلز الافتراضيين</h2>
                            <p className="text-white/50 text-lg">اختر الشخصية المناسبة لعلامتك التجارية، وسيقوم المحرك بوضع منتجك في يدها بلمسة احترافية.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Personas.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setProject(s => ({ ...s, selectedPersonas: s.selectedPersonas.includes(p.id) ? s.selectedPersonas.filter(i => i !== p.id) : [...s.selectedPersonas, p.id] }))}
                                    className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${project.selectedPersonas.includes(p.id) ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)] text-white' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'}`}
                                >
                                    <div className={`w-3 h-3 rounded-full transition-all ${project.selectedPersonas.includes(p.id) ? 'bg-[var(--color-accent)] scale-125 shadow-[0_0_10px_var(--color-accent)]' : 'bg-white/10'}`}></div>
                                    <span className="font-bold">{p.label}</span>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={project.isGenerating || project.productImages.length === 0 || project.selectedPersonas.length === 0}
                            className="h-20 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white font-black rounded-2xl shadow-2xl shadow-[var(--color-accent)]/30 transition-all transform active:scale-95 disabled:opacity-30 disabled:transform-none"
                        >
                            {project.isGenerating ? 'جاري استدعاء الموديل وتجهيز الإضاءة...' : 'توليد الصور الإعلانية الآن'}
                        </button>
                    </div>
                </div>
            </div>

            {project.results.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {project.results.map(res => (
                        <div key={res.id} className="glass-card p-4 rounded-[2.5rem] border border-white/5 hover:border-[var(--color-accent)]/30 transition-all group/card">
                            <h4 className="text-[10px] font-black text-white/40 uppercase mb-3 text-center tracking-widest">{res.persona}</h4>
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-black/40 relative shadow-inner">
                                {res.isLoading ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-4 bg-black/20">
                                        <div className="w-12 h-12 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-[9px] font-black text-[var(--color-accent)] animate-pulse">PRO RENDERING</span>
                                    </div>
                                ) : res.image ? (
                                    <img src={`data:${res.image.mimeType};base64,${res.image.base64}`} className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105" alt={res.persona} />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-red-400 text-xs font-bold">{res.error}</div>
                                )}
                            </div>
                            {res.image && (
                                <button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = `data:${res.image!.mimeType};base64,${res.image!.base64}`;
                                        link.download = `EbdaaPro-Influencer-${res.persona}.png`;
                                        link.click();
                                    }}
                                    className="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-[10px] font-black rounded-xl transition-all uppercase tracking-widest"
                                >
                                    Download 4K
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
};

export default InfluencerStudio;
