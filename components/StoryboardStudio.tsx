
import React, { useCallback, useState, useEffect } from 'react';
import { StoryboardStudioProject, ImageFile, StoryboardScene } from '../types';
import { resizeImage } from '../utils';
import { generateStoryboardPlan, generateImage, animateImageToVideo } from '../services/geminiService';
import { getCinematicMotionPrompt } from '../services/xaiService';
import { deductCredits, CREDIT_COSTS } from '../lib/supabase';
import ImageWorkspace from './ImageWorkspace';

const DirectorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const VideoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const KeyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
);

const StoryboardStudio: React.FC<{
    project: StoryboardStudioProject;
    setProject: React.Dispatch<React.SetStateAction<StoryboardStudioProject>>;
    userId?: string;
    refreshCredits?: () => void;
}> = ({ project, setProject, userId, refreshCredits }) => {
    const [hasApiKey, setHasApiKey] = useState(false);
    const [isReelModalOpen, setIsReelModalOpen] = useState(false);
    const [currentReelIndex, setCurrentReelIndex] = useState(0);

    // التحقق من مفتاح الـ API عند التحميل
    useEffect(() => {
        const checkKey = async () => {
            const selected = await (window as any).aistudio?.hasSelectedApiKey?.() || false;
            setHasApiKey(selected);
        };
        checkKey();
    }, []);

    const handleSelectKey = async () => {
        if ((window as any).aistudio?.openSelectKey) {
            await (window as any).aistudio.openSelectKey();
            setHasApiKey(true);
        }
    };

    const handleFileUpload = async (files: File[]) => {
        if (!files || files.length === 0) return;
        setProject(s => ({ ...s, isUploading: true, error: null }));
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
                subjectImages: [...s.subjectImages, ...uploaded],
                isUploading: false,
                gridImage: null,
                scenes: []
            }));
        } catch (err) {
            setProject(s => ({ ...s, isUploading: false, error: "Upload failed" }));
        }
    };

    const handleRemoveSubject = (idx: number) => {
        setProject(s => ({ ...s, subjectImages: s.subjectImages.filter((_, i) => i !== idx), scenes: [], gridImage: null }));
    };

    const onCreatePlan = async () => {
        setProject(s => ({ ...s, isGeneratingPlan: true, error: null, scenes: [], gridImage: null }));
        try {
            const plan = await generateStoryboardPlan(project.subjectImages, project.customInstructions);
            const scenes: StoryboardScene[] = plan.map(p => ({
                ...p,
                id: Math.random().toString(36).substr(2, 9),
                image: null,
                videoUrl: null,
                isLoading: false,
                isVideoLoading: false,
                error: null
            }));
            setProject(s => ({ ...s, scenes, isGeneratingPlan: false }));
        } catch (err) {
            setProject(s => ({ ...s, isGeneratingPlan: false, error: "فشل في بناء المخطط" }));
        }
    };

    const onGenerateSceneImage = async (sceneId: string) => {
        const sceneIdx = project.scenes.findIndex(s => s.id === sceneId);
        if (sceneIdx === -1) return;

        setProject(s => {
            const next = [...s.scenes];
            next[sceneIdx] = { ...next[sceneIdx], isLoading: true, error: null };
            return { ...s, scenes: next };
        });

        try {
            const scene = project.scenes[sceneIdx];
            const textConstraint = "STRICTLY PRESERVE all original branding. NO EXTRA text.";
            const finalPrompt = `Professional Cinema Shot. ${scene.cameraAngle}. ${scene.visualPrompt}. Photorealistic. ${textConstraint}`;
            const image = await generateImage(project.subjectImages, finalPrompt, null, project.aspectRatio);
            
            setProject(s => {
                const next = [...s.scenes];
                next[sceneIdx] = { ...next[sceneIdx], image, isLoading: false };
                return { ...s, scenes: next };
            });
        } catch (err) {
            setProject(s => {
                const next = [...s.scenes];
                next[sceneIdx] = { ...next[sceneIdx], isLoading: false, error: "فشل الرندرة" };
                return { ...s, scenes: next };
            });
        }
    };

    const onAnimateScene = async (sceneId: string) => {
        // التحقق من مفتاح الـ API قبل البدء
        if (!hasApiKey && !process.env.API_KEY) {
            await handleSelectKey();
            return;
        }

        const sceneIdx = project.scenes.findIndex(s => s.id === sceneId);
        if (sceneIdx === -1 || !project.scenes[sceneIdx].image || !userId) return;

        setProject(s => {
            const next = [...s.scenes];
            next[sceneIdx] = { ...next[sceneIdx], isVideoLoading: true, error: null };
            return { ...s, scenes: next };
        });

        try {
            const deducted = await deductCredits(userId, 10); 
            if (!deducted) throw new Error("رصيد غير كافٍ");

            const scene = project.scenes[sceneIdx];
            const motionPrompt = await getCinematicMotionPrompt(scene.description, scene.cameraAngle);
            
            const videoUrl = await animateImageToVideo(scene.image!, motionPrompt, project.aspectRatio, (status) => {
                console.log(`Video status: ${status}`);
            });

            setProject(s => {
                const next = [...s.scenes];
                next[sceneIdx] = { ...next[sceneIdx], videoUrl, isVideoLoading: false };
                return { ...s, scenes: next };
            });
            refreshCredits?.();
        } catch (err: any) {
            if (err.message?.includes('Requested entity was not found')) {
                setHasApiKey(false); // إعادة ضبط حالة المفتاح
                setProject(s => ({ ...s, error: "يرجى اختيار مفتاح API صالح لديه اشتراك مفعل." }));
            }
            setProject(s => {
                const next = [...s.scenes];
                next[sceneIdx] = { ...next[sceneIdx], isVideoLoading: false, error: err.message || "فشل التحريك" };
                return { ...s, scenes: next };
            });
        }
    };

    const handleDownload = (uri: string, label: string) => {
        const link = document.createElement('a');
        link.href = uri;
        link.download = `Ebdaa-Pro-${label}-${Date.now()}.mp4`;
        link.click();
    };

    const animatedScenes = project.scenes.filter(s => !!s.videoUrl);

    return (
        <main className="w-full flex flex-col gap-10 pt-4 pb-12 animate-in fade-in duration-700 text-right" dir="rtl">
            {/* API Key Banner */}
            {!hasApiKey && !process.env.API_KEY && (
                <div className="bg-[#FFD700]/10 border border-[#FFD700]/20 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#FFD700] rounded-2xl flex items-center justify-center text-black shadow-lg">⚡</div>
                        <div>
                            <h4 className="text-sm font-black text-white">تفعيل محرك الحركة (Veo Engine)</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">مطلوب مفتاح API من مشروع Google Cloud مدفوع</p>
                        </div>
                    </div>
                    <button onClick={handleSelectKey} className="px-8 py-3 bg-[#FFD700] text-black rounded-xl text-xs font-black shadow-xl hover:bg-yellow-400 transition-all flex items-center gap-2">
                        <KeyIcon /> اختيار مفتاح التشغيل
                    </button>
                </div>
            )}

            {/* Control Section */}
            <div className="bg-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-l from-[#FFD700] to-transparent opacity-20"></div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <h2 className="text-3xl font-black text-white tracking-tighter flex items-center">
                        <DirectorIcon /> مخطط القصص السينمائي (Storyboard)
                    </h2>
                    <div className="flex items-center gap-4">
                        {animatedScenes.length > 0 && (
                            <button 
                                onClick={() => { setIsReelModalOpen(true); setCurrentReelIndex(0); }}
                                className="px-6 py-2.5 bg-[#FFD700] text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-yellow-400 transition-all"
                            >
                                🎬 مشاهدة الفيلم الكامل
                            </button>
                        )}
                        <div className="flex bg-black/40 rounded-2xl p-1 border border-white/10">
                            <button 
                                onClick={() => setProject(s => ({ ...s, aspectRatio: '16:9' }))}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${project.aspectRatio === '16:9' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-slate-400 hover:text-[#FFD700]'}`}
                            >
                                16:9
                            </button>
                            <button 
                                onClick={() => setProject(s => ({ ...s, aspectRatio: '9:16' }))}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${project.aspectRatio === '9:16' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-slate-400 hover:text-[#FFD700]'}`}
                            >
                                9:16
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">صور المنتج المرجعية</h3>
                        <div className="bg-black/40 p-4 rounded-3xl border border-white/10 shadow-inner">
                            <ImageWorkspace
                                id="storyboard-up"
                                images={project.subjectImages}
                                onImagesUpload={handleFileUpload}
                                onImageRemove={handleRemoveSubject}
                                isUploading={project.isUploading}
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <div className="flex flex-col gap-3 bg-black/40 p-8 rounded-[2rem] border border-white/10 shadow-inner">
                            <label className="text-xs font-black text-[#FFD700] uppercase tracking-widest">قصة الإعلان أو السيناريو</label>
                            <textarea
                                value={project.customInstructions}
                                onChange={(e) => setProject(s => ({ ...s, customInstructions: e.target.value }))}
                                placeholder="صف مشاهد إعلانك هنا.. مثال: رائد فضاء يكتشف زجاجة عطر وسط غابة نيون مع إضاءة درامية."
                                className="w-full bg-transparent border-none p-0 text-xl font-bold text-white focus:ring-0 placeholder:text-slate-600 min-h-[150px] resize-none leading-relaxed"
                            />
                        </div>

                        <button
                            onClick={onCreatePlan}
                            disabled={project.isGeneratingPlan || !project.customInstructions.trim() || project.subjectImages.length === 0}
                            className="w-full bg-[#FFD700] hover:bg-yellow-400 text-black font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-30"
                        >
                            {project.isGeneratingPlan ? 'جاري رسم المخطط...' : 'توليد مخطط الـ 9 مشاهد (30 نقطة)'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Detailed Scenes List */}
            {project.scenes.length > 0 && (
                <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-1000">
                    <div className="flex items-center gap-4 flex-row-reverse">
                        <h3 className="text-2xl font-black text-white tracking-tight">الإخراج التفصيلي والتحريك</h3>
                        <div className="h-px flex-grow bg-white/5"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {project.scenes.map((scene, idx) => (
                            <div key={scene.id} className="bg-white/5 rounded-[2.5rem] overflow-hidden border border-white/5 flex flex-col group hover:border-[#FFD700]/30 transition-all shadow-xl">
                                <div className={`relative bg-black/40 flex items-center justify-center overflow-hidden ${project.aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-video'}`}>
                                    {scene.isVideoLoading ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#FFD700]"></div>
                                            <span className="text-[10px] font-black text-[#FFD700] animate-pulse uppercase">إخراج الحركة عبر Grok & Veo...</span>
                                        </div>
                                    ) : scene.videoUrl ? (
                                        <div className="w-full h-full relative">
                                            <video src={scene.videoUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                <button onClick={() => handleDownload(scene.videoUrl!, `Scene-${idx+1}`)} className="p-4 bg-emerald-500 text-white rounded-full hover:scale-110 shadow-xl transition-all">
                                                    <DownloadIcon />
                                                </button>
                                                <button onClick={() => onAnimateScene(scene.id)} className="p-4 bg-white text-slate-900 rounded-full hover:scale-110 shadow-xl transition-all">
                                                    <VideoIcon />
                                                </button>
                                            </div>
                                        </div>
                                    ) : scene.isLoading ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#FFD700]"></div>
                                            <span className="text-[10px] font-black text-[#FFD700] animate-pulse uppercase">رندرة المشهد...</span>
                                        </div>
                                    ) : scene.image ? (
                                        <div className="w-full h-full relative group/img">
                                            <img src={`data:${scene.image.mimeType};base64,${scene.image.base64}`} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                <button onClick={() => onAnimateScene(scene.id)} className="px-6 py-3 bg-[#FFD700] text-black rounded-full font-black text-xs hover:scale-110 transition-all shadow-xl flex items-center gap-2">
                                                    <VideoIcon /> تحريك المشهد (10 نقاط)
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => onGenerateSceneImage(scene.id)}
                                            className="px-8 py-3 bg-white/5 border border-white/10 text-white text-[10px] font-black rounded-xl hover:bg-[#FFD700] hover:text-black transition-all shadow-sm"
                                        >
                                            رندرة هذا المشهد (5 نقاط)
                                        </button>
                                    )}
                                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-white">
                                        المشهد 0{idx + 1}
                                    </div>
                                </div>

                                <div className="p-8 space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-[#FFD700] uppercase tracking-widest">خطة الكاميرا (Grok Director)</label>
                                        <p className="text-xs font-bold text-white leading-tight">{scene.cameraAngle}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">الوصف الفني</label>
                                        <p className="text-xs text-slate-400 font-bold leading-relaxed">{scene.description}</p>
                                    </div>
                                    {scene.error && <p className="text-[9px] font-black text-red-500 uppercase">{scene.error}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Reel Modal Preview */}
            {isReelModalOpen && animatedScenes.length > 0 && (
                <div className="fixed inset-0 z-[1000] bg-black flex items-center justify-center animate-in fade-in duration-500">
                    <div className={`relative max-w-full max-h-full ${project.aspectRatio === '9:16' ? 'aspect-[9/16] h-[90vh]' : 'aspect-video w-[90vw]'}`}>
                        <video 
                            key={animatedScenes[currentReelIndex].videoUrl}
                            src={animatedScenes[currentReelIndex].videoUrl!} 
                            autoPlay 
                            className="w-full h-full object-cover rounded-3xl shadow-2xl border border-white/10"
                            onEnded={() => {
                                if (currentReelIndex < animatedScenes.length - 1) {
                                    setCurrentReelIndex(currentReelIndex + 1);
                                } else {
                                    setCurrentReelIndex(0);
                                }
                            }}
                        />
                        <div className="absolute top-10 right-10 flex items-center gap-6">
                            <div className="bg-black/60 backdrop-blur-md px-6 py-2 rounded-full text-white font-black text-xs">
                                المشهد {currentReelIndex + 1} من {animatedScenes.length}
                            </div>
                            <button onClick={() => setIsReelModalOpen(false)} className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center font-bold backdrop-blur-md transition-all">✕</button>
                        </div>
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
                            {animatedScenes.map((_, i) => (
                                <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentReelIndex ? 'bg-[#FFD700] w-8' : 'bg-white/30 w-2'}`}></div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {project.error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-sm text-center font-bold">
                    {project.error}
                </div>
            )}
        </main>
    );
};

export default StoryboardStudio;
