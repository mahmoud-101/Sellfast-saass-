import React, { useState, useEffect } from 'react';
import { DynamicAdsStudioProject, DynamicPromptStyle, ImageFile } from '../types';
import { generateImage, autoFillDynamicVariables } from '../services/geminiService';
import { deductCredits, CREDIT_COSTS } from '../lib/supabase';
import { resizeImage } from '../utils';
import ImageWorkspace from './ImageWorkspace';

const MagicWandIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;

import { DYNAMIC_STYLES } from '../lib/dynamicTemplates';

const DynamicAdsStudio: React.FC<{
    project: DynamicAdsStudioProject;
    setProject: React.Dispatch<React.SetStateAction<DynamicAdsStudioProject>>;
    userId?: string;
    refreshCredits?: () => void;
}> = ({ project, setProject, userId, refreshCredits }) => {

    const selectedStyle = DYNAMIC_STYLES.find(s => s.id === project.selectedStyleId);

    // Initialize variables when a new style is selected
    useEffect(() => {
        if (selectedStyle && Object.keys(project.variableValues).length === 0) {
            const initialVars: Record<string, string> = {};
            selectedStyle.requiredVariables.forEach(v => {
                initialVars[v] = '';
            });
            setProject(p => ({ ...p, variableValues: initialVars }));
        }
    }, [selectedStyle?.id]);

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

    const setVariableValue = (varName: string, val: string) => {
        setProject(p => ({ ...p, variableValues: { ...p.variableValues, [varName]: val } }));
    };

    const handleAutoFill = async () => {
        if (!project.autoFillDescription || !selectedStyle) {
            setProject(s => ({ ...s, error: 'الرجاء إدخال تفاصيل المنتج أولاً قبل استخدام المساعد الذكي.' }));
            return;
        }

        setProject(s => ({ ...s, isAutoFilling: true, error: null }));
        try {
            const generatedValues = await autoFillDynamicVariables(
                project.autoFillDescription,
                selectedStyle.styleName,
                selectedStyle.styleDescription,
                selectedStyle.requiredVariables
            );

            // Override current variables with matched keys from the generated values
            const newVariables = { ...project.variableValues };
            selectedStyle.requiredVariables.forEach(v => {
                if (generatedValues[v]) {
                    newVariables[v] = generatedValues[v];
                } else if (generatedValues[v.toLowerCase()]) {
                    newVariables[v] = generatedValues[v.toLowerCase()];
                } else if (generatedValues[v.toUpperCase()]) {
                    newVariables[v] = generatedValues[v.toUpperCase()];
                }
            });

            setProject(s => ({ ...s, variableValues: newVariables, isAutoFilling: false }));
        } catch (err) {
            setProject(s => ({ ...s, isAutoFilling: false, error: 'حدث خطأ أثناء الملء التلقائي. جرب مرة أخرى.' }));
        }
    };

    const handleGenerate = async () => {
        if (!project || !selectedStyle || !userId || project.productImages.length === 0) return;

        // Check if all variables are filled
        const missingVars = selectedStyle.requiredVariables.filter(v => !project.variableValues[v]?.trim());
        if (missingVars.length > 0) {
            setProject(s => ({ ...s, error: `الرجاء تعبئة جميع الحقول المطلوبة.` }));
            return;
        }

        const totalCost = CREDIT_COSTS.IMAGE_BASIC;
        setProject(s => ({ ...s, isGenerating: true, error: null }));
        const deducted = await deductCredits(userId, totalCost);
        if (!deducted) { setProject(s => ({ ...s, isGenerating: false, error: `رصيد غير كافٍ.` })); return; }

        // Replace Variables in the prompt
        let finalPrompt = selectedStyle.dynamicPrompt;
        selectedStyle.requiredVariables.forEach(v => {
            finalPrompt = finalPrompt.replace(new RegExp(`\\[${v}\\]`, 'g'), project.variableValues[v]);
        });

        // Add product instruction constraint
        finalPrompt += ` STRICT INSTRUCTION: Explicitly use the provided user uploaded reference image as the main product. DO NOT hallucinate the product.`;

        try {
            const img = await generateImage(project.productImages, finalPrompt, null, "3:4");
            const newResult = { id: Date.now().toString(), styleName: selectedStyle.styleName, image: img, isLoading: false, error: null };

            setProject(s => ({ ...s, isGenerating: false, results: [newResult, ...s.results] }));
            if (refreshCredits) refreshCredits();
        } catch (err) {
            setProject(s => ({ ...s, isGenerating: false, error: 'فشل التوليد، يرجى المحاولة مرة أخرى.' }));
        }
    };

    return (
        <main className="w-full flex flex-col gap-10 pt-4 pb-12 animate-in fade-in duration-700 text-right" dir="rtl">
            <div className="bg-white/5 rounded-[3rem] p-8 md:p-12 border border-white/5 shadow-2xl">
                <div className="flex flex-col lg:flex-row gap-12">

                    <div className="lg:w-1/3 space-y-8">
                        <h2 className="text-3xl font-black text-white flex items-center justify-start tracking-tighter">
                            <span className="text-blue-500 text-4xl ml-3">✨</span> المتغيرات الديناميكية
                        </h2>
                        <p className="text-slate-400 font-medium text-sm leading-relaxed">
                            اختر القالب وقم بتعبئة المتغيرات المخصصة له لإنشاء إعلانك المميز.
                        </p>

                        <ImageWorkspace id="dy-up" images={project?.productImages || []} onImagesUpload={handleFileUpload} onImageRemove={(i) => setProject(s => ({ ...s, productImages: (s.productImages || []).filter((_, idx) => idx !== i) }))} isUploading={project?.isUploading || false} />
                    </div>

                    <div className="lg:w-2/3 flex flex-col gap-8">
                        <div className="space-y-4">
                            <label className="text-sm text-slate-400 font-bold block">1. اختر القالب (Style Template)</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {DYNAMIC_STYLES.map(style => (
                                    <button
                                        key={style.id}
                                        onClick={() => {
                                            setProject(s => ({ ...s, selectedStyleId: style.id, variableValues: {} })); // Reset vars on change
                                        }}
                                        className={`p-4 rounded-[1.5rem] border-2 transition-all text-right flex flex-col gap-2 ${project.selectedStyleId === style.id ? 'bg-blue-500/10 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/30'}`}
                                    >
                                        <span className="font-black text-sm">{style.styleName.replace(/_/g, ' ')}</span>
                                        <span className="text-[10px] opacity-70 line-clamp-2 md:line-clamp-3 leading-relaxed">{style.styleDescription}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedStyle && (
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mt-4 animate-in slide-in-from-bottom-5">

                                <div className="mb-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex flex-col gap-4">
                                    <h3 className="text-sm font-black text-blue-400">⚡ الإكمال الذكي (Auto-Fill)</h3>
                                    <p className="text-xs text-slate-300 font-medium leading-relaxed">اكتب وصف المنتج أو الفكرة الخاصة بك هنا، وسيقوم الذكاء الاصطناعي بتعبئة كافة الحقول المطلوبة تلقائياً وبشكل احترافي بناءً على القالب المختار.</p>
                                    <textarea
                                        value={project.autoFillDescription || ''}
                                        onChange={(e) => setProject(p => ({ ...p, autoFillDescription: e.target.value }))}
                                        placeholder="مثال: منتج هو عبارة عن زجاجة عطر فخمة اسمها 'سحر الشرق'، برائحة العود، لونها أسود وذهبي، أداة تجميل راقية..."
                                        className="w-full bg-black/50 border border-blue-500/30 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-blue-400 h-24 resize-none placeholder-slate-500"
                                    />
                                    <button
                                        onClick={handleAutoFill}
                                        disabled={project.isAutoFilling || !project.autoFillDescription}
                                        className="w-full py-3 bg-blue-600/20 border border-blue-500 hover:bg-blue-600/40 text-blue-400 font-black rounded-xl transition-all disabled:opacity-50"
                                    >
                                        {project.isAutoFilling ? 'جاري العصف الذهني وتعبئة الحقول...' : 'تعبئة الحقول بضغطة زر 🪄'}
                                    </button>
                                </div>

                                <h3 className="text-lg font-black text-white mb-6">2. املأ الفراغات (Variables)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedStyle.requiredVariables.map((variable) => (
                                        <div key={variable} className="flex flex-col gap-1.5">
                                            <label className="text-xs text-blue-400 font-bold">[{variable.replace(/_/g, ' ')}]</label>
                                            <input
                                                type="text"
                                                value={project.variableValues[variable] || ''}
                                                onChange={(e) => setVariableValue(variable, e.target.value)}
                                                placeholder="أدخل القيمة المناسبة..."
                                                className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500/60 transition-colors shadow-inner"
                                            />
                                        </div>
                                    ))}
                                </div>

                                {project.error && (
                                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm font-bold animate-pulse text-center">
                                        {project.error}
                                    </div>
                                )}

                                <button
                                    onClick={handleGenerate}
                                    disabled={project.isGenerating || project.productImages.length === 0}
                                    className="w-full mt-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl shadow-xl hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                                >
                                    {project.isGenerating ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>جاري تركيب السحر...</span>
                                        </>
                                    ) : (
                                        <>توليد باستخدام الديناميك (${CREDIT_COSTS.IMAGE_BASIC} نقطة) <MagicWandIcon /></>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Results grid */}
            {project.results.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-2xl font-black text-white px-2">معرض النتائج الديناميكية</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {project.results.map((res) => (
                            <div key={res.id} className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 group hover:border-blue-500/30 transition-all">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[10px] font-black uppercase bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full">{res.styleName.replace(/_/g, ' ')}</span>
                                </div>
                                <div className="aspect-[3/4] rounded-[1.5rem] overflow-hidden bg-black relative shadow-inner">
                                    {res.image ? (
                                        <img src={`data:${res.image.mimeType};base64,${res.image.base64}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Generated Dynamic" />
                                    ) : res.error ? (
                                        <div className="h-full flex items-center justify-center text-red-400 font-bold p-6 text-center text-sm">{res.error}</div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-blue-500 font-black animate-pulse uppercase tracking-widest text-[10px]">Processing...</div>
                                    )}
                                </div>
                                <div className="mt-6 flex gap-2">
                                    <button
                                        className="flex-1 bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-black text-xs transition-colors"
                                        onClick={() => { if (res.image) { const a = document.createElement('a'); a.href = `data:${res.image.mimeType};base64,${res.image.base64}`; a.download = `Dynamic_${res.styleName}.png`; a.click(); } }}
                                    >
                                        تحميل عالي الجودة
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
};

export default DynamicAdsStudio;
