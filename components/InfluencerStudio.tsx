
import React, { useState } from 'react';
import { InfluencerStudioProject, ImageFile } from '../types';
import { generateImage, editImage } from '../services/geminiService';
import { resizeImage } from '../utils';
import ImageWorkspace from './ImageWorkspace';

const Personas = [
    { id: 'saudi_male', label: 'شاب سعودي مودرن', prompt: 'Professional thobe model young Saudi man in Riyadh office.' },
    { id: 'egy_female', label: 'فتاة مصرية عملية', prompt: 'Egyptian modern business woman tholding product, natural light.' },
    { id: 'global_model', label: 'موديل عالمي', prompt: 'Vogue editorial fashion model posing with product.' },
    { id: 'family_home', label: 'أم في منزل عصري', prompt: 'Arab mother in bright luxury kitchen using the product.' }
];

const InfluencerStudio: React.FC<{
    project: InfluencerStudioProject;
    setProject: React.Dispatch<React.SetStateAction<InfluencerStudioProject>>;
}> = ({ project, setProject }) => {

    const handleFileUpload = async (files: File[]) => {
        if (!files || files.length === 0) return;
        setProject(s => ({ ...s, isUploading: true }));
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
            setProject(s => ({ ...s, isUploading: false }));
        }
    };

    const handleGenerate = async () => {
        if (!project || (project.productImages?.length || 0) === 0 || project.selectedPersonas.length === 0) return;
        setProject(s => ({ ...s, isGenerating: true, results: project.selectedPersonas.map(id => ({ id, image: null, isLoading: true, persona: Personas.find(p => p.id === id)?.label || '', error: null })) }));
        
        const promises = project.selectedPersonas.map(async (id) => {
            const persona = Personas.find(p => p.id === id);
            try {
                const img = await generateImage(project.productImages, persona!.prompt, null, "3:4");
                return { id, img, error: null };
            } catch (err) { return { id, img: null, error: 'فشل التوليد' }; }
        });

        const completed = await Promise.all(promises);
        setProject(s => ({ ...s, isGenerating: false, results: s.results.map(r => {
            const comp = completed.find(c => c.id === r.id);
            return { ...r, image: comp?.img || null, isLoading: false, error: comp?.error || null };
        }) }));
    };

    const handleEditImage = async (idx: number, prompt: string) => {
        const target = project.results[idx];
        if (!target.image) return;
        
        const nextResults = [...project.results];
        nextResults[idx] = { ...target, isLoading: true };
        setProject(s => ({ ...s, results: nextResults }));

        try {
            const newImg = await editImage(target.image, prompt);
            nextResults[idx] = { ...target, image: newImg, isLoading: false };
            setProject(s => ({ ...s, results: nextResults }));
        } catch (err) {
            nextResults[idx] = { ...target, isLoading: false, error: 'فشل التعديل' };
            setProject(s => ({ ...s, results: nextResults }));
        }
    };

    return (
        <main className="w-full flex flex-col gap-8 pt-4 pb-12 animate-in fade-in duration-700 text-right" dir="rtl">
            <div className="bg-white/5 rounded-[3rem] p-10 shadow-2xl border border-white/5">
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="lg:w-1/3">
                        <ImageWorkspace 
                            id="inf-up" 
                            images={project?.productImages || []} 
                            onImagesUpload={handleFileUpload} 
                            onImageRemove={(i) => setProject(s => ({ ...s, productImages: (s.productImages || []).filter((_, idx) => idx !== i) }))} 
                            isUploading={project?.isUploading || false} 
                        />
                    </div>
                    <div className="lg:w-2/3 flex flex-col gap-6">
                        <h2 className="text-4xl font-black text-white tracking-tighter">استوديو الموديلز الاحترافي</h2>
                        <p className="text-slate-400 font-bold">اختر الموديل وسيقوم المحرك بدمجه مع منتجك بشكل واقعي تماماً.</p>
                        <div className="grid grid-cols-2 gap-4">
                            {Personas.map(p => (
                                <button key={p.id} onClick={() => setProject(s => ({ ...s, selectedPersonas: s.selectedPersonas.includes(p.id) ? s.selectedPersonas.filter(i => i !== p.id) : [...s.selectedPersonas, p.id] }))} className={`p-5 rounded-2xl border-2 transition-all font-bold ${project.selectedPersonas.includes(p.id) ? 'bg-[#FFD700] border-[#FFD700] text-black' : 'bg-black/40 border-white/10 text-slate-400 hover:border-[#FFD700]/50'}`}>{p.label}</button>
                            ))}
                        </div>
                        <button onClick={handleGenerate} disabled={project.isGenerating || (project.productImages?.length || 0) === 0} className="h-20 bg-[#FFD700] text-black font-black rounded-2xl shadow-xl transition-all hover:bg-yellow-400 active:scale-95 disabled:opacity-30">توليد الصور الإعلانية (10 نقاط)</button>
                    </div>
                </div>
            </div>

            {project.results.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {project.results.map((res, idx) => (
                        <div key={res.id} className="bg-white/5 p-4 rounded-[2.5rem] border border-white/5 shadow-sm flex flex-col gap-3 group">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase text-center">{res.persona}</h4>
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-black/40 relative">
                                {res.isLoading ? (
                                    <div className="h-full flex items-center justify-center animate-pulse text-[#FFD700] font-black flex-col gap-2">
                                        <div className="w-8 h-8 border-2 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-[8px] tracking-widest">PROCESSING...</span>
                                    </div>
                                ) : res.image ? (
                                    <img src={`data:${res.image.mimeType};base64,${res.image.base64}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                ) : null}
                            </div>
                            {!res.isLoading && res.image && (
                                <div className="relative group/edit">
                                    <input 
                                        placeholder="اطلب تعديل..." 
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-[10px] font-bold focus:border-[#FFD700] outline-none text-white"
                                        onKeyDown={e => e.key === 'Enter' && handleEditImage(idx, (e.target as HTMLInputElement).value)}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
};

export default InfluencerStudio;
