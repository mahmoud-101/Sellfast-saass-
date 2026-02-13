
import React, { useState } from 'react';
import { UGCStudioProject, ImageFile } from '../types';
import { generateImage } from '../services/geminiService';
import { deductCredits, CREDIT_COSTS } from '../lib/supabase';
import ImageWorkspace from './ImageWorkspace';

const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

const UGC_SCENARIOS = [
    { id: 'unboxing', label: 'فتح الصندوق', prompt: 'Real unboxing experience, handheld vertical phone photo, raw aesthetic.' },
    { id: 'using', label: 'المنتج قيد الاستخدام', prompt: 'Candid smartphone photo of product in use, messy authentic background.' }
];

const UGCStudio: React.FC<{
    project: UGCStudioProject;
    setProject: React.Dispatch<React.SetStateAction<UGCStudioProject>>;
    userId?: string;
    refreshCredits?: () => void;
}> = ({ project, setProject, userId, refreshCredits }) => {

    const handleGenerate = async () => {
        if (project.productImages.length === 0 || project.selectedScenarios.length === 0 || !userId) return;
        
        // حساب التكلفة الإجمالية: 5 نقاط لكل سيناريو
        const totalCost = project.selectedScenarios.length * CREDIT_COSTS.IMAGE_BASIC;
        
        setProject(s => ({ ...s, isGenerating: true, error: null }));

        const deducted = await deductCredits(userId, totalCost);
        if (!deducted) {
            setProject(s => ({ ...s, isGenerating: false, error: `رصيدك غير كافٍ. تحتاج إلى ${totalCost} نقطة.` }));
            return;
        }

        const promises = project.selectedScenarios.map(async (id) => {
            const scenario = UGC_SCENARIOS.find(sc => sc.id === id);
            try {
                const img = await generateImage(project.productImages, scenario?.prompt + " Strictly preserve product.", null, "9:16");
                return { id, img, error: null };
            } catch (err) {
                return { id, img: null, error: 'فشل التوليد' };
            }
        });

        const completed = await Promise.all(promises);
        setProject(s => ({
            ...s,
            isGenerating: false,
            results: completed.map(c => ({ id: c.id, image: c.img, isLoading: false, scenario: '', error: c.error }))
        }));
        if (refreshCredits) refreshCredits();
    };

    return (
        <main className="w-full flex flex-col gap-8 pt-4 pb-12 animate-in fade-in duration-700 text-right">
            <div className="glass-card rounded-[3rem] p-10 shadow-2xl border border-white/5">
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="lg:w-1/3">
                        <ImageWorkspace id="ugc-up" images={project.productImages} onImagesUpload={(f) => {
                            const r = new FileReader(); r.onload = () => setProject(s => ({ ...s, productImages: [...s.productImages, { base64: (r.result as string).split(',')[1], mimeType: f[0].type, name: f[0].name }] }));
                            r.readAsDataURL(f[0]);
                        }} onImageRemove={(i) => setProject(s => ({ ...s, productImages: s.productImages.filter((_, idx) => idx !== i) }))} isUploading={false} />
                    </div>
                    <div className="lg:w-2/3 flex flex-col gap-6">
                        <h2 className="text-4xl font-black text-white flex items-center justify-end"><CameraIcon /> محتوى UGC احترافي</h2>
                        <p className="text-white/40">اختر سيناريوهات التصوير (سيتم خصم 5 نقاط لكل صورة يتم اختيارها):</p>
                        
                        <div className="flex gap-4 justify-end">
                            {UGC_SCENARIOS.map(sc => (
                                <button 
                                    key={sc.id} 
                                    onClick={() => setProject(s => ({ ...s, selectedScenarios: s.selectedScenarios.includes(sc.id) ? s.selectedScenarios.filter(i => i !== sc.id) : [...s.selectedScenarios, sc.id] }))}
                                    className={`px-6 py-4 rounded-2xl border-2 transition-all font-bold ${project.selectedScenarios.includes(sc.id) ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white' : 'bg-white/5 border-white/5 text-white/40'}`}
                                >
                                    {sc.label}
                                </button>
                            ))}
                        </div>

                        <button onClick={handleGenerate} disabled={project.isGenerating || project.selectedScenarios.length === 0} className="w-full h-20 bg-white text-black font-black rounded-2xl shadow-xl transition-all">
                            {project.isGenerating ? 'جاري الرندرة...' : `توليد ${project.selectedScenarios.length} مشاهد (${project.selectedScenarios.length * 5} نقطة)`}
                        </button>
                        {project.error && <p className="text-red-400 text-center font-bold mt-2">{project.error}</p>}
                    </div>
                </div>
            </div>

            {project.results.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {project.results.map(res => (
                        <div key={res.id} className="glass-card p-4 rounded-[2.5rem] border border-white/5">
                            <div className="aspect-[9/16] rounded-2xl overflow-hidden bg-black/40">
                                {res.image ? (
                                    <img src={`data:${res.image.mimeType};base64,${res.image.base64}`} className="w-full h-full object-cover" />
                                ) : <div className="h-full flex items-center justify-center text-red-400">{res.error}</div>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
};

export default UGCStudio;
