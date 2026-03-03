import React, { useCallback, useState } from 'react';
import { ControllerStudioProject, ImageFile, ControlCategory, ControllerSlider, HistoryItem } from '../types';
import { resizeImage } from '../utils';
import { editImage } from '../services/geminiService';
import ImageWorkspace from './ImageWorkspace';
import HistoryPanel from './HistoryPanel';

interface ControllerStudioProps {
    project: ControllerStudioProject;
    setProject: React.Dispatch<React.SetStateAction<ControllerStudioProject>>;
}

const FaceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ResetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;

const ControllerStudio: React.FC<ControllerStudioProps> = ({ project, setProject }) => {
    const [isComparing, setIsComparing] = useState(false);

    const handleFileUpload = async (files: File[]) => {
        if (!files || files.length === 0) return;
        setProject(s => ({ ...s, isUploading: true, error: null }));
        try {
            const resized = await resizeImage(files[0], 1024, 1024);
            const reader = new FileReader();
            reader.onload = () => setProject(s => ({ ...s, sourceImages: [{ base64: (reader.result as string).split(',')[1], mimeType: resized.type, name: resized.name }], isUploading: false }));
            reader.readAsDataURL(resized);
        } catch (e) { setProject(s => ({ ...s, isUploading: false, error: "فشل تحميل الصورة" })); }
    };

    const handleSliderChange = (id: string, value: number) => {
        setProject(s => ({ ...s, sliders: s.sliders.map(sl => sl.id === id ? { ...sl, value } : sl) }));
    };

    const handleGenerate = async () => {
        if (project.sourceImages.length === 0) return;
        setProject(s => ({ ...s, isGenerating: true, error: null }));
        
        const activeChanges = project.sliders.filter(sl => sl.value !== 0).map(sl => `${sl.label}: ${sl.value > 0 ? 'زيادة' : 'تقليل'}`).join(', ');
        const prompt = `Adjust the face in this photo: ${activeChanges}. Keep original high-end identity and studio lighting. Hyper-realistic results.`;

        try {
            const result = await editImage(project.sourceImages[0], prompt);
            setProject(s => ({ ...s, generatedImage: result, isGenerating: false, history: [{ image: result, prompt }, ...s.history] }));
        } catch (err: any) { setProject(s => ({ ...s, isGenerating: false, error: err.message })); }
    };

    return (
        <main className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 pb-12 items-start text-right">
            <div className="lg:col-span-3 flex flex-col gap-6">
                <div className="glass-card p-6 rounded-[2rem] border border-white/5">
                    <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">صورة الموديل</h3>
                    <div className="aspect-[3/4] w-full">
                        <ImageWorkspace id="ctrl-src" images={project.sourceImages} onImagesUpload={handleFileUpload} onImageRemove={() => setProject(s => ({...s, sourceImages: [], generatedImage: null}))} isUploading={project.isUploading} />
                    </div>
                </div>
                <HistoryPanel history={project.history} onSelect={(img) => setProject(s => ({ ...s, generatedImage: img }))} />
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="glass-card p-4 rounded-[2.5rem] min-h-[500px] border border-white/5 flex flex-col relative overflow-hidden">
                    <div className="flex-grow bg-black/40 rounded-[2rem] relative overflow-hidden flex items-center justify-center group shadow-inner">
                        {project.isGenerating && (
                             <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-md flex items-center justify-center">
                                 <div className="w-12 h-12 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
                             </div>
                        )}
                        
                        {project.sourceImages.length > 0 ? (
                            <>
                                <img src={`data:${(isComparing || !project.generatedImage ? project.sourceImages[0] : project.generatedImage).mimeType};base64,${(isComparing || !project.generatedImage ? project.sourceImages[0] : project.generatedImage).base64}`} className="w-full h-full object-contain" alt="Preview" />
                                <div className="absolute top-6 left-6 px-4 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[9px] font-black text-white uppercase tracking-widest">
                                    {isComparing || !project.generatedImage ? 'الأصل (Original)' : 'المعدلة (Generated)'}
                                </div>
                                {project.generatedImage && (
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-[8px] font-black uppercase tracking-widest bg-black/40 px-4 py-1 rounded-full">اضغط مطولاً للمقارنة</div>
                                )}
                            </>
                        ) : <p className="text-white/20 font-black">ارفع صورة لبدء التحكم</p>}
                    </div>

                    <div className="mt-6 flex flex-col gap-4">
                        <button onClick={handleGenerate} disabled={project.isGenerating || project.sourceImages.length === 0} className="w-full h-16 bg-white text-black font-black rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-30">
                            {project.isGenerating ? 'جاري الرندرة الحية...' : 'تطبيق التعديلات (10 نقاط)'}
                        </button>
                        {project.generatedImage && (
                            <button onMouseDown={() => setIsComparing(true)} onMouseUp={() => setIsComparing(false)} onTouchStart={() => setIsComparing(true)} onTouchEnd={() => setIsComparing(false)} className="w-full h-12 bg-[#FFD700]/20 text-[#FFD700] font-black rounded-xl border border-[#FFD700]/20 select-none">اضغط هنا للمقارنة مع الأصل</button>
                        )}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4 glass-card p-8 rounded-[2.5rem] border border-white/5 space-y-8 h-full">
                <div className="flex items-center justify-between flex-row-reverse">
                    <h3 className="text-lg font-black text-white">لوحة التحكم بالملامح</h3>
                    <button onClick={() => setProject(s => ({...s, sliders: s.sliders.map(sl => ({...sl, value: 0}))}))} className="text-[10px] font-black text-white/30 hover:text-white flex items-center gap-1 uppercase transition-all"><ResetIcon /> ريست</button>
                </div>
                <div className="space-y-8 overflow-y-auto max-h-[500px] suggestions-scrollbar pr-2">
                    {project.sliders.map(s => (
                        <div key={s.id} className="space-y-4">
                            <div className="flex justify-between items-center flex-row-reverse">
                                <label className="text-xs font-bold text-white/80">{s.label}</label>
                                <span className="text-[10px] font-mono text-[#FFD700] bg-[#FFD700]/10 px-2 py-0.5 rounded">{s.value.toFixed(2)}</span>
                            </div>
                            <input type="range" min={s.min} max={s.max} step={s.step} value={s.value} onChange={(e) => handleSliderChange(s.id, parseFloat(e.target.value))} className="w-full h-1.5 bg-white/5 rounded-full appearance-none accent-[#FFD700] cursor-pointer" />
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
};

export default ControllerStudio;