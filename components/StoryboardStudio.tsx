import React, { useState } from 'react';

import { Upload, ChevronRight, Wand2, X, Plus, AlertCircle, RefreshCw, Smartphone, Film, Info } from 'lucide-react';
import { StoryboardStudioProject, StoryboardScene, ImageFile } from '../types';
import { generateStoryboardPlan, generateImage } from '../services/geminiService';
import { saveGeneratedAsset } from '../lib/supabase';

interface Props {
    project: StoryboardStudioProject;
    setProject: React.Dispatch<React.SetStateAction<StoryboardStudioProject>>;
    onAutoGenerateVideo: (sceneId: string, customPrompt?: string) => void;
    userId: string;
}

const StoryboardStudio: React.FC<Props> = ({ project, setProject, onAutoGenerateVideo, userId }) => {
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newImages: ImageFile[] = [];
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    newImages.push({
                        base64: reader.result.split(',')[1],
                        mimeType: file.type,
                        name: file.name
                    });
                    if (newImages.length === files.length) {
                        setProject(s => ({
                            ...s,
                            subjectImages: [...s.subjectImages, ...newImages].slice(0, 5) // Max 5 images
                        }));
                    }
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setProject(s => ({
            ...s,
            subjectImages: s.subjectImages.filter((_, i) => i !== index)
        }));
    };

    const onGeneratePlan = async () => {
        if (project.subjectImages.length === 0 && !project.customInstructions) return;

        setProject(s => ({ ...s, isGeneratingPlan: true, error: null }));
        try {
            const plans = await generateStoryboardPlan(
                project.subjectImages,
                project.customInstructions
            );

            const generatedScenes: StoryboardScene[] = plans.map(p => ({
                id: p.id || Math.random().toString(36).substr(2, 9),
                description: p.description,
                visualPrompt: p.visualPrompt,
                cameraAngle: p.cameraAngle,
                dialogue: p.dialogue,
                image: null,
                videoUrl: null,
                isLoading: true, // Set to true to show image skeleton
                isVideoLoading: false,
                error: null
            }));

            // Automatically save to Content Library (Plan saved first)
            await saveGeneratedAsset(userId, 'STORYBOARD_PLAN',
                { plan_content: generatedScenes, instructions: project.customInstructions },
                { type: 'AI_STORYBOARD' }
            );

            setProject(s => ({
                ...s,
                scenes: generatedScenes,
                isGeneratingPlan: false,
                error: generatedScenes.length > 0 ? null : "Could not generate storyboard. Please try again."
            }));

            // Background step: Generate actual images for each scene immediately
            generatedScenes.forEach(async (scene) => {
                try {
                    const prompt = `Cinematic storyboard shot, professional advertising: ${scene.description}. Style: ${scene.visualPrompt}. High quality, photorealistic.`;
                    const img = await generateImage(project.subjectImages, prompt, null, "9:16");
                    setProject(s => ({
                        ...s,
                        scenes: s.scenes.map(sc => sc.id === scene.id ? { ...sc, image: img, isLoading: false } : sc)
                    }));
                } catch (e) {
                    setProject(s => ({
                        ...s,
                        scenes: s.scenes.map(sc => sc.id === scene.id ? { ...sc, isLoading: false, error: 'Failed to draw scene' } : sc)
                    }));
                }
            });

        } catch (err: any) {
            setProject(s => ({
                ...s,
                isGeneratingPlan: false,
                error: "حدث خطأ أثناء إنشاء الستوري بورد: " + err.message
            }));
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in relative z-10">

            {/* Header Area */}
            <div className="bg-gradient-to-r from-gray-900 to-black p-8 rounded-3xl border border-yellow-500/20 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-sm font-medium mb-4 border border-yellow-500/20">
                        <Film className="w-4 h-4" />
                        استوديو الإخراج الفني
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                        مُخرج الستوري بورد <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">الذكي</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                        وداعاً للحيرة والتفكير المعقد... ارفع صور منتجك، واشرح فكرتك باختصار، وسيقوم المخرج الذكي بكتابة ورسم سلسلة من 6 مشاهد إعلانية (9:16) جاهزة للإنتاج وتحقيق المبيعات.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column - Inputs */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 shadow-xl glass-panel relative overflow-hidden">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                                1
                            </div>
                            مُدخلات العقل المدبر
                        </h2>

                        {/* Images Upload */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                صور المنتج (اختياري، بحد أقصى 5)
                            </label>
                            <div className="space-y-4">
                                {project.subjectImages.length < 5 && (
                                    <label className="block w-full border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all">
                                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                                        <Upload className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                                        <p className="text-sm text-gray-400">اسحب الصور هنا أو اضغط للاختيار</p>
                                    </label>
                                )}
                                {project.subjectImages.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {project.subjectImages.map((img, i) => (
                                            <div key={i} className="relative aspect-square rounded-lg overflow-hidden group border border-white/10">
                                                <img src={"data:" + img.mimeType + ";base64," + img.base64} alt="Target" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => removeImage(i)}
                                                    className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                تعليماتك للمخرج (بكل التفاصيل)
                            </label>
                            <textarea
                                value={project.customInstructions}
                                onChange={(e) => setProject(s => ({ ...s, customInstructions: e.target.value }))}
                                placeholder="مثال: الهدف هو بيع عطر رجالي جديد (اسم العطر: ليالي). العطر فخم جداً ومناسب للمناسبات الرسمية. أريد التركيز على إحساس الثقة والتميز. شخصية البطل شاب طموح ورجل أعمال. ركز على إظهار فخامة زجاجة العطر وتأثيره على من حوله."
                                rows={8}
                                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                                dir="auto"
                            />
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={onGeneratePlan}
                            disabled={project.isGeneratingPlan || (!project.customInstructions && project.subjectImages.length === 0)}
                            className="w-full relative group overflow-hidden rounded-xl p-[1px]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative bg-black/80 backdrop-blur-xl px-6 py-4 rounded-xl flex items-center justify-center gap-3">
                                {project.isGeneratingPlan ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />
                                        <span className="text-white font-medium">جاري تحليل الإخراج...</span>
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-5 h-5 text-yellow-500" />
                                        <span className="text-white font-medium group-hover:text-yellow-400 transition-colors">ابني الستوري بورد</span>
                                        <ChevronRight className="w-5 h-5 text-white/50" />
                                    </>
                                )}
                            </div>
                        </button>
                        {project.error && (
                            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <p>{project.error}</p>
                            </div>
                        )}

                        <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl text-blue-400 text-xs flex items-start gap-3">
                            <Info className="w-5 h-5 shrink-0" />
                            <p className="leading-relaxed">يعمل هذا النظام باستخدام خوارزمية ذكية تحلل طلبك وتبني 6 مشاهد متتالية مبنية على نفسيات الشراء (Hook, Demo, Proof, CTA) لتحويل المشاهد المباشر إلى مشتري.</p>
                        </div>
                    </div>
                </div>

                {/* Right Column - Results */}
                <div className="lg:col-span-2">
                    {!project.scenes || project.scenes.length === 0 ? (
                        <div className="bg-[#1A1A1A] p-12 rounded-2xl border border-white/5 h-[800px] flex flex-col items-center justify-center text-center glass-panel">
                            <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-black border border-white/5 space-y-2 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
                                <Smartphone className="w-10 h-10 text-gray-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">لوحة الإخراج فارغة</h3>
                            <p className="text-gray-500 max-w-md">
                                قم بإدخال تعليمات المخرج في اللوحة الجانبية واضغط على "ابني الستوري بورد" لتوليد مشاهد إعلانك الاحترافي (Vertical 9:16).
                            </p>
                        </div>
                    ) : (
                        <div className="bg-black/40 rounded-2xl p-6 border border-white/5">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
                                        🎬
                                    </span>
                                    مشاهد الإعلان (الستوري بورد)
                                </h2>
                                <span className="px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-sm font-semibold">
                                    حفظ تلقائي ✓
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {project.scenes.map((scene, index) => (
                                    <div key={scene.id} className="bg-[#1A1A1A] border border-white/10 rounded-2xl overflow-hidden hover:border-yellow-500/30 transition-all group">
                                        <div className="p-4 bg-gradient-to-r from-gray-900 to-black border-b border-white/5 flex items-center justify-between">
                                            <h4 className="font-bold text-white flex items-center gap-2">
                                                <span className="text-yellow-500 font-black">M{index + 1}</span>
                                                {/* You can parse out the angle or focus from the description if you want a title here, or just keep it minimal */}
                                                تفاصيل المشهد
                                            </h4>
                                            <CameraAngleBadge angle={scene.cameraAngle} />
                                        </div>
                                        <div className="p-0">
                                            {/* Generated Image or Skeleton */}
                                            {scene.image ? (
                                                <div className="w-full aspect-[9/16] bg-black relative group/scene-img">
                                                    <img src={`data:${scene.image.mimeType};base64,${scene.image.base64}`} alt="Scene" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/scene-img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                        <button
                                                            onClick={() => window.dispatchEvent(new CustomEvent('openImageEditor', { detail: scene.image }))}
                                                            className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2"
                                                        >
                                                            <span>✏️</span> تعديل الصورة
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full aspect-[9/16] bg-gray-800 animate-pulse flex items-center justify-center relative">
                                                    {scene.isLoading ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                                                            <span className="text-yellow-500 text-xs font-bold">جاري رسم المشهد...</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-red-500 text-xs font-bold">{scene.error || 'فشل في بناء الصورة'}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 space-y-4">
                                            {scene.dialogue && (
                                                <div className="bg-black/50 p-4 border border-white/5 rounded-xl relative">
                                                    <div className="absolute top-0 right-4 w-4 h-4 bg-[#1A1A1A] border-l border-b border-white/5 transform rotate-45 -translate-y-[9px]"></div>
                                                    <span className="text-xs font-bold text-blue-400 mb-1 flex items-center gap-1">
                                                        <span>التعليق الصوتي / النص</span>
                                                    </span>
                                                    <p className="text-white font-medium text-sm leading-relaxed" dir="auto">"{scene.dialogue}"</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 bg-black/40 border-t border-white/5">
                                            <button
                                                onClick={() => onAutoGenerateVideo(scene.id, scene.visualPrompt)}
                                                disabled={scene.isLoading || scene.isVideoLoading}
                                                className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Film className="w-4 h-4" />
                                                توليد هذا المشهد كفيديو AI
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper Component for Visual Polish
const CameraAngleBadge = ({ angle }: { angle?: string }) => {
    if (!angle) return null;
    return (
        <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] text-gray-400 font-semibold tracking-wider uppercase">
            {angle.substring(0, 20)}
        </span>
    );
};

export default StoryboardStudio; 
