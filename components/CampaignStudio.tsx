
import React, { useCallback, useState } from 'react';
import { CampaignStudioProject, ImageFile, BrandingResult } from '../types';
import { resizeImage } from '../utils';
import { analyzeProductForCampaign, generateImage, editImage } from '../services/geminiService';
import { deductCredits, CREDIT_COSTS } from '../lib/supabase';
import ImageWorkspace from './ImageWorkspace';
import BrandingResultsGrid from './BrandingResultsGrid';

const CAMPAIGN_SCENARIOS = [
    'Professional Hero Front View (Studio)', 
    'Lifestyle: A person using the product naturally (Human connection)', 
    'Aesthetic Flat Lay Shot (Environment)'
];

const CAMPAIGN_MOODS = [
    { label: 'الأصلي', value: '' },
    { label: 'مينيماليست أبيض', value: 'Clean, minimalist white studio aesthetic' },
    { label: 'فخامة داكنة', value: 'Dramatic dark luxury with gold accents' },
    { label: 'ألوان باستيل', value: 'Soft playful pastel colors' },
    { label: 'طبيعة خضراء', value: 'Organic fresh natural green aesthetic' },
    { label: 'أزرق محيطي', value: 'Deep serene ocean blue tones' },
    { label: 'ذهبي دافئ', value: 'Warm, golden hour luxury lighting' },
    { label: 'نيون سايبربانك', value: 'Vibrant neon cyberpunk style' },
];

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-emerald-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
);

const PaletteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
);

const CampaignStudio: React.FC<{
    project: CampaignStudioProject;
    setProject: React.Dispatch<React.SetStateAction<CampaignStudioProject>>;
    userId?: string;
    refreshCredits?: () => void;
}> = ({ project, setProject, userId, refreshCredits }) => {

    if (!project) return null;
    const productImages = project.productImages || [];
    const results = project.results || [];
    const mode = project.mode || 'auto';

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
            const combined = [...productImages, ...uploaded];
            setProject(s => ({ ...s, productImages: combined, isUploading: false, isAnalyzing: true }));
            const analysis = await analyzeProductForCampaign(combined);
            setProject(s => ({ ...s, productAnalysis: analysis, isAnalyzing: false }));
        } catch (err) {
            setProject(s => ({ ...s, isUploading: false, isAnalyzing: false, error: "فشل الرفع" }));
        }
    };

    const handleRemoveProduct = (idx: number) => {
        setProject(s => ({ ...s, productImages: s.productImages.filter((_, i) => i !== idx) }));
    };

    const handleUpdateProduct = (idx: number, newImage: ImageFile) => {
        setProject(s => {
            const nextImages = [...s.productImages];
            nextImages[idx] = newImage;
            return { ...s, productImages: nextImages };
        });
    };

    const handleCustomIdeaChange = (index: number, value: string) => {
        setProject(s => {
            const nextIdeas = [...s.customIdeas];
            nextIdeas[index] = value;
            return { ...s, customIdeas: nextIdeas };
        });
    };

    const onGenerate = useCallback(async () => {
        if (productImages.length === 0 || !userId) return;
        
        if (mode === 'custom' && project.customIdeas.every(idea => !idea.trim())) {
            setProject(s => ({ ...s, error: 'فضلاً اكتب فكرة واحدة على الأقل.' }));
            return;
        }

        setProject(s => ({ ...s, isGenerating: true, error: null, results: [] }));
        
        try {
            const deducted = await deductCredits(userId, 30); // 10 points * 3 images
            if (!deducted) {
                setProject(s => ({ ...s, isGenerating: false, error: 'رصيد غير كافٍ (تحتاج 30 نقطة للحملة الكاملة).' }));
                return;
            }

            let analysis = project.productAnalysis || await analyzeProductForCampaign(productImages);
            
            const scenarios = mode === 'auto' 
                ? CAMPAIGN_SCENARIOS 
                : project.customIdeas.filter(idea => idea.trim().length > 0);

            const initial = scenarios.map(scenario => ({ 
                scenario, 
                image: null, 
                isLoading: true, 
                error: null, 
                editPrompt: '', 
                isEditing: false 
            }));

            setProject(s => ({ ...s, results: initial as any }));

            const promises = scenarios.map((scenario) => {
                const moodV = mode === 'auto' ? (CAMPAIGN_MOODS.find(m => m.label === project.selectedMood)?.value || '') : '';
                const backgroundInfo = project.customPrompt ? ` Style details: ${project.customPrompt}.` : '';
                
                const textConstraint = "STRICTLY PRESERVE all original text, labels, and branding on the product. DO NOT erase or modify existing writing. NO EXTRA generated text in the scene environment.";

                const prompt = mode === 'auto'
                    ? `Professional Commercial Photography: ${analysis}. Scenario: ${scenario}. Style: ${moodV}.${backgroundInfo} PHOTOREALISTIC, HIGH-RESOLUTION, CLEAN IMAGE. ${textConstraint}`
                    : `Professional Product Idea Shoot: ${analysis}. Idea: ${scenario}.${backgroundInfo} PHOTOREALISTIC, STRICT IDENTITY PRESERVATION. ${textConstraint}`;
                
                return generateImage(productImages, prompt, null)
                    .then(image => ({ scenario, image }))
                    .catch(error => ({ scenario, error: error.message }));
            });

            const completed = await Promise.all(promises);
            
            setProject(s => {
                const nextResults = [...s.results];
                completed.forEach(res => {
                    const idx = nextResults.findIndex(r => r && r.scenario === res.scenario);
                    if (idx !== -1) {
                        if ('image' in res) nextResults[idx] = { ...nextResults[idx], image: res.image, isLoading: false };
                        else nextResults[idx] = { ...nextResults[idx], error: res.error, isLoading: false };
                    }
                });
                return { ...s, results: nextResults };
            });
            if (refreshCredits) refreshCredits();
        } catch (err) {
            setProject(s => ({ ...s, error: 'فشل التوليد، حاول مرة أخرى', isGenerating: false }));
        } finally {
            setProject(s => ({ ...s, isGenerating: false }));
        }
    }, [productImages, project.productAnalysis, project.selectedMood, project.customPrompt, project.customIdeas, mode, userId, refreshCredits, setProject]);

    const handleEditResult = async (index: number, editPromptText: string) => {
        const resultToEdit = results[index];
        if (!resultToEdit || !resultToEdit.image || !userId) return;

        setProject(s => {
            const nextResults = [...s.results];
            nextResults[index] = { ...nextResults[index], isEditing: true, error: null };
            return { ...s, results: nextResults };
        });

        try {
            const deducted = await deductCredits(userId, CREDIT_COSTS.AI_EXPAND);
            if (!deducted) {
                setProject(s => {
                    const nextResults = [...s.results];
                    nextResults[index] = { ...nextResults[index], isEditing: false, error: 'رصيد غير كافٍ' };
                    return { ...s, results: nextResults };
                });
                return;
            }

            const updatedImage = await editImage(resultToEdit.image, editPromptText);
            setProject(s => {
                const nextResults = [...s.results];
                nextResults[index] = { ...nextResults[index], image: updatedImage, isEditing: false };
                return { ...s, results: nextResults };
            });
            if (refreshCredits) refreshCredits();
        } catch (err) {
            setProject(s => {
                const nextResults = [...s.results];
                nextResults[index] = { ...nextResults[index], isEditing: false, error: "فشل التعديل" };
                return { ...s, results: nextResults };
            });
        }
    };

    const safeGridResults: BrandingResult[] = results.map(r => ({
        category: r.scenario as any,
        image: r.image || null,
        isLoading: !!r.isLoading,
        isEditing: !!r.isEditing,
        error: r.error || null,
        editPrompt: r.editPrompt || ''
    }));

    return (
        <main className="w-full flex flex-col gap-8 pt-4 pb-12 animate-in fade-in duration-700 text-right" dir="rtl">
            {/* Mode Switcher */}
            <div className="flex justify-center">
                <div className="bg-white/5 p-1 rounded-2xl border border-white/5 flex gap-1 shadow-sm">
                    <button 
                        onClick={() => setProject(s => ({ ...s, mode: 'auto' }))}
                        className={`px-8 py-2 rounded-xl text-sm font-black transition-all ${mode === 'auto' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-slate-400 hover:text-[#FFD700]'}`}
                    >
                        السيناريوهات التلقائية
                    </button>
                    <button 
                        onClick={() => setProject(s => ({ ...s, mode: 'custom' }))}
                        className={`px-8 py-2 rounded-xl text-sm font-black transition-all ${mode === 'custom' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-slate-400 hover:text-[#FFD700]'}`}
                    >
                        أفكار إعلانية مخصصة
                    </button>
                </div>
            </div>

            {/* Control Panel */}
            <div className="bg-white/5 rounded-[3rem] p-8 md:p-12 flex flex-col lg:flex-row gap-10 shadow-2xl border border-white/5">
                {/* Left: Product Selection */}
                <div className="w-full lg:w-72 flex-shrink-0">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 text-center">صور المنتج</h3>
                    <div className="w-full relative">
                        <ImageWorkspace
                            id="campaign-product-uploader"
                            images={productImages}
                            onImagesUpload={handleFileUpload}
                            onImageRemove={handleRemoveProduct}
                            isUploading={project.isUploading}
                            onImageUpdate={handleUpdateProduct}
                        />
                    </div>
                </div>

                {/* Right: Campaign Controls */}
                <div className="flex-grow flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="text-right">
                            <h2 className="text-3xl font-black text-white tracking-tighter">
                                {mode === 'auto' ? 'استوديو الحملات الذكي' : 'استوديو الأفكار الإبداعية'}
                            </h2>
                            <p className="text-sm text-slate-400 font-bold mt-1">
                                {mode === 'auto' 
                                    ? 'سيقوم المحرك بتوليد 3 منشورات إعلانية فريدة بناءً على استخدامات المنتج في ثوانٍ.' 
                                    : 'اكتب أفكارك الخاصة وسيقوم المحرك بتحويلها لصور إعلانية فائقة الدقة.'}
                            </p>
                        </div>
                        <button 
                            onClick={onGenerate} 
                            disabled={productImages.length === 0 || project.isGenerating} 
                            className="bg-[#FFD700] hover:bg-yellow-400 text-black font-black py-4 px-10 rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-30 whitespace-nowrap"
                        >
                            {project.isGenerating 
                                ? 'جاري الرندرة...' 
                                : mode === 'auto' ? 'إطلاق الحملة (30 نقطة)' : 'توليد أفكارك (30 نقطة)'}
                        </button>
                    </div>

                    {/* Shared Style/Background Prompt */}
                    <div className="flex flex-col gap-2 bg-black/40 p-6 rounded-[2rem] border border-white/10 shadow-inner">
                        <label className="text-[10px] font-black text-[#FFD700] uppercase tracking-widest flex items-center gap-2">
                            <PaletteIcon /> الطابع الجمالي والروح العامة للتصاميم
                        </label>
                        <textarea 
                            value={project.customPrompt} 
                            onChange={(e) => setProject(s => ({ ...s, customPrompt: e.target.value }))} 
                            placeholder="حدد السمة الفنية (مثال: أسطح رخامية، إضاءة سينمائية، خلفية مينيماليست...)" 
                            className="w-full bg-transparent border-none p-0 text-sm font-bold text-white focus:ring-0 placeholder:text-slate-600 resize-none min-h-[60px]"
                        />
                    </div>

                    {mode === 'auto' ? (
                        <div className="flex flex-col gap-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">قوالب بصرية جاهزة (Presets)</label>
                            <div className="flex flex-wrap gap-2 flex-row-reverse">
                                {CAMPAIGN_MOODS.map(mood => (
                                    <button 
                                        key={mood.label} 
                                        onClick={() => setProject(s => ({ ...s, selectedMood: mood.label }))} 
                                        className={`px-6 py-2 text-xs font-black rounded-xl transition-all border ${
                                            project.selectedMood === mood.label 
                                            ? 'bg-[#FFD700] text-black border-[#FFD700] shadow-lg' 
                                            : 'bg-black/40 text-slate-400 border-white/10 hover:border-[#FFD700]/50 hover:text-[#FFD700]'
                                        }`}
                                    >
                                        {mood.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[0, 1, 2].map((idx) => (
                                <div key={idx} className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">الفكرة المخصصة {idx + 1}</label>
                                    <textarea 
                                        value={project.customIdeas[idx]}
                                        onChange={(e) => handleCustomIdeaChange(idx, e.target.value)}
                                        placeholder={`مثال: "المنتج في يد موديل ترتدي ملابس عصرية في كافيه..."`}
                                        className="w-full h-28 bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white focus:border-[#FFD700] outline-none resize-none shadow-inner"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Analysis Section */}
                    <div className={`transition-all duration-500 overflow-hidden ${project.productAnalysis || project.isAnalyzing ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0'}`}>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-6 group/analysis">
                            <div className="flex justify-between items-center mb-3 flex-row-reverse">
                                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">تحليل المحرك للمنتج (AI Intelligence)</h4>
                                {!project.isAnalyzing && project.productAnalysis && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10">
                                        <EditIcon />
                                        <span className="text-[9px] font-black text-emerald-400 uppercase">قابل للتعديل</span>
                                    </div>
                                )}
                            </div>
                            
                            {project.isAnalyzing ? (
                                <div className="flex items-center gap-3 text-emerald-400/60 animate-pulse py-2 justify-end">
                                    <span className="text-xs font-black uppercase tracking-widest">جاري تحليل منتجك لبناء أفضل حملة...</span>
                                    <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
                                </div>
                            ) : (
                                <textarea 
                                    value={project.productAnalysis || ''}
                                    onChange={(e) => setProject(s => ({ ...s, productAnalysis: e.target.value }))}
                                    rows={4}
                                    className="w-full bg-transparent border-none p-0 text-xs font-bold text-emerald-200 leading-relaxed focus:ring-0 resize-none no-scrollbar text-right"
                                    placeholder="سيظهر تحليل المحرك هنا لتعريف الموديلات بمنتجك..."
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            {results.length > 0 && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-5 duration-1000">
                    <div className="flex items-center gap-4 flex-row-reverse">
                        <h3 className="text-2xl font-black text-white tracking-tight">معرض نتائج الحملة</h3>
                        <div className="h-px flex-grow bg-white/5"></div>
                    </div>
                    <BrandingResultsGrid 
                        results={safeGridResults}
                        gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
                        onEditResult={handleEditResult}
                    />
                </div>
            )}
            
            {project.error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-sm text-center font-bold animate-shake">
                    {project.error}
                </div>
            )}
        </main>
    );
};

export default CampaignStudio;
