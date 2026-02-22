
import React, { useState } from 'react';
import { UGCStudioProject, ImageFile } from '../types';
import { generateImage } from '../services/geminiService';
import { deductCredits, CREDIT_COSTS } from '../lib/supabase';
import { resizeImage } from '../utils';
import ImageWorkspace from './ImageWorkspace';

const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

const UGC_SCENARIOS = [
    { id: 'unboxing', label: 'فتح الصندوق (Real Unboxing)', prompt: 'Authentic raw unboxing photo, shot on iPhone 15 Pro, hand-held, slightly messy bedroom background, natural lighting, high dynamic range, focus on hands opening product.' },
    { id: 'using', label: 'ريلز استخدام (Action Shot)', prompt: 'Candid smartphone photo of a person using the product in real life setting like a living room or street. Raw aesthetic, vertical 9:16, natural skin textures, slight motion blur.' },
    { id: 'review', label: 'تقييم عميل (Review Look)', prompt: 'Product placed on a kitchen table or desk, amateur smartphone photography style, honest raw lighting, very realistic consumer review photo.' }
];

const UGCStudio: React.FC<{
    project: UGCStudioProject;
    setProject: React.Dispatch<React.SetStateAction<UGCStudioProject>>;
    userId?: string;
    refreshCredits?: () => void;
}> = ({ project, setProject, userId, refreshCredits }) => {

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
            setProject(s => ({ ...s, productImages: [...(s.productImages || []), ...uploaded], isUploading: false }));
        } catch (err) { setProject(s => ({ ...s, isUploading: false })); }
    };

    const handleGenerate = async () => {
        if (!project || (project.productImages?.length || 0) === 0 || project.selectedScenarios.length === 0 || !userId) return;
        const totalCost = project.selectedScenarios.length * CREDIT_COSTS.IMAGE_BASIC;
        setProject(s => ({ ...s, isGenerating: true, error: null }));
        const deducted = await deductCredits(userId, totalCost);
        if (!deducted) { setProject(s => ({ ...s, isGenerating: false, error: `رصيد غير كافٍ.` })); return; }
        
        const promises = project.selectedScenarios.map(async (id) => {
            const scenario = UGC_SCENARIOS.find(sc => sc.id === id);
            try {
                const img = await generateImage(project.productImages, scenario?.prompt + " STICK TO ORIGINAL PRODUCT DESIGN.", null, "9:16");
                return { id, img, error: null };
            } catch (err) { return { id, img: null, error: 'فشل التوليد' }; }
        });

        const completed = await Promise.all(promises);
        setProject(s => ({ 
            ...s, 
            isGenerating: false, 
            results: completed.map(c => ({ 
                category: c.id, 
                image: c.img, 
                isLoading: false, 
                error: c.error, 
                isEditing: false,
                editPrompt: '' 
            })) 
        }));
        if (refreshCredits) refreshCredits();
    };

    return (
        <main className="w-full flex flex-col gap-10 pt-4 pb-12 animate-in fade-in duration-700 text-right" dir="rtl">
            <div className="bg-white/5 rounded-[3rem] p-10 border border-white/5 shadow-2xl">
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="lg:w-1/3">
                        <ImageWorkspace id="ugc-up" images={project?.productImages || []} onImagesUpload={handleFileUpload} onImageRemove={(i) => setProject(s => ({ ...s, productImages: (s.productImages || []).filter((_, idx) => idx !== i) }))} isUploading={project?.isUploading || false} />
                    </div>
                    <div className="lg:w-2/3 flex flex-col gap-8">
                        <h2 className="text-4xl font-black text-white flex items-center justify-start tracking-tighter"><CameraIcon /> استوديو محتوى العملاء (UGC)</h2>
                        <p className="text-slate-400 font-medium text-lg">حول منتجك لتريند حقيقي. صور تبدو وكأنها مصورة بهاتف عميل حقيقي - السلاح السري لمتاجر الدروبشيبينغ.</p>
                        <div className="flex flex-wrap gap-4 justify-start">
                            {UGC_SCENARIOS.map(sc => (
                                <button key={sc.id} onClick={() => setProject(s => ({ ...s, selectedScenarios: s.selectedScenarios.includes(sc.id) ? s.selectedScenarios.filter(i => i !== sc.id) : [...s.selectedScenarios, sc.id] }))} className={`px-8 py-5 rounded-[2rem] border-2 transition-all font-black text-xs ${project.selectedScenarios.includes(sc.id) ? 'bg-[#FFD700] border-[#FFD700] text-black shadow-lg shadow-yellow-500/20' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}>
                                    {sc.label}
                                </button>
                            ))}
                        </div>
                        <button onClick={handleGenerate} disabled={project.isGenerating || project.selectedScenarios.length === 0} className="w-full h-20 bg-[#FFD700] text-black font-black rounded-3xl shadow-xl hover:bg-yellow-400 transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-4">
                            {project.isGenerating ? 'جاري الرندرة العفوية...' : `توليد مشاهد UGC (${project.selectedScenarios.length * 5} نقطة)`}
                        </button>
                    </div>
                </div>
            </div>

            {project.results.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {project.results.map((res, idx) => (
                        <div key={idx} className="bg-white/5 p-6 rounded-[3.5rem] border border-white/5 group hover:border-[#FFD700]/30 transition-all">
                             <div className="aspect-[9/16] rounded-[2.5rem] overflow-hidden bg-black relative shadow-inner">
                                {res.image ? (
                                    <img src={`data:${res.image.mimeType};base64,${res.image.base64}`} className="w-full h-full object-cover" />
                                ) : <div className="h-full flex items-center justify-center text-[#FFD700] font-black animate-pulse uppercase tracking-widest text-[10px]">{res.error || 'Rendering...'}</div>}
                            </div>
                            <div className="mt-6 flex gap-2">
                                <button className="flex-1 bg-[#FFD700] text-black py-4 rounded-2xl font-black text-xs" onClick={() => { if(res.image) { const a = document.createElement('a'); a.href=`data:${res.image.mimeType};base64,${res.image.base64}`; a.download='UGC.png'; a.click(); }}}>تحميل 4K</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
};

export default UGCStudio;
