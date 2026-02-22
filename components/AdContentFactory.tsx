
import React, { useState, useEffect, useRef } from 'react';
import { PerformanceStudioProject, MasterFactoryProject } from '../types';
import { 
    generatePerformanceAdPack, 
    generateFullCampaignVisuals, 
    generateImage,
    createEliteAdChat,
    generateShortFormIdeas,
    generateFinalContentScript,
    transformScriptToUGC,
    generateFlowVideo,
    generateSocialContentPack,
    generateReelsProductionScript,
    generateImagePromptsFromStrategy
} from '../services/geminiService';
import { deductCredits, CREDIT_COSTS } from '../lib/supabase';
import { Chat } from '@google/genai';

interface AdContentFactoryProps {
    performanceProject: PerformanceStudioProject;
    setPerformanceProject: React.Dispatch<React.SetStateAction<PerformanceStudioProject>>;
    masterProject: MasterFactoryProject;
    setMasterProject: React.Dispatch<React.SetStateAction<MasterFactoryProject>>;
    userId: string;
    refreshCredits?: () => void;
    onBridgeToVideo: (script: string) => void;
}

const STEPS_LABELS: { [key: number]: string } = {
    1: 'الهوية', 2: 'المنتج', 3: 'التحول', 4: 'القوة', 5: 'الزمن', 6: 'الألم', 7: 'الإغلاق', 8: 'المعاينة', 9: 'السكريبت'
};

const AdContentFactory: React.FC<AdContentFactoryProps> = ({ 
    performanceProject, 
    setPerformanceProject, 
    masterProject,
    setMasterProject,
    userId, 
    refreshCredits,
    onBridgeToVideo
}) => {
    const [activeMode, setActiveMode] = useState<'elite' | 'guided' | 'machine' | 'transformer'>('elite');
    const [activeTab, setActiveTab] = useState<'inputs' | 'intelligence' | 'matrix' | 'launch_pack' | 'visuals' | 'profit' | 'simulation' | 'full_campaign'>('inputs');
    
    // Master Factory States
    const [input, setInput] = useState('');
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [genStage, setGenStage] = useState<'IDLE' | 'FLOW' | 'DONE'>('IDLE');
    const [videoStatus, setVideoStatus] = useState('');
    const [socialPosts, setSocialPosts] = useState<string[]>([]);
    const [reelsScript, setReelsScript] = useState<string | null>(null);
    const [imagePrompts, setImagePrompts] = useState<string[]>([]);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [isGeneratingExtra, setIsGeneratingExtra] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // --- Performance (Elite) Logic ---
    const handleGenerateFullCampaign = async () => {
        if (!performanceProject.result || !userId) return;
        setPerformanceProject(s => ({ ...s, isGeneratingFull: true, error: null }));
        try {
            const deducted = await deductCredits(userId, 50); 
            if (deducted) {
                const strategyContext = `
                    Product Type: ${performanceProject.result.strategicIntelligence.productType}
                    Emotional Driver: ${performanceProject.result.strategicIntelligence.emotionalDriver}
                    Archetype: ${performanceProject.result.strategicIntelligence.archetype}
                `;
                const campaignData = await generateFullCampaignVisuals(strategyContext, performanceProject.result.creativeStrategyMatrix.angles);
                
                setPerformanceProject(s => ({ 
                    ...s, 
                    fullCampaign: { adSets: campaignData.adSets }, 
                    isGeneratingFull: false 
                }));
                setActiveTab('full_campaign');

                // Generate images sequentially with delay to avoid rate limits
                for (let i = 0; i < campaignData.adSets.length; i++) {
                    const set = campaignData.adSets[i];
                    try {
                        if (i > 0) await new Promise(resolve => setTimeout(resolve, 1500));
                        
                        const img = await generateImage(performanceProject.referenceImage ? [performanceProject.referenceImage] : [], set.visualPrompt, null, "1:1");
                        const imageUrl = `data:${img.mimeType};base64,${img.base64}`;
                        
                        setPerformanceProject(s => {
                            if (!s.fullCampaign) return s;
                            const newAdSets = [...s.fullCampaign.adSets];
                            newAdSets[i] = { ...newAdSets[i], image: imageUrl };
                            return { ...s, fullCampaign: { adSets: newAdSets } };
                        });
                    } catch (err) {
                        console.error("Image generation failed for set", i, err);
                    }
                }

                if (refreshCredits) refreshCredits();
            } else {
                setPerformanceProject(s => ({ ...s, isGeneratingFull: false, error: 'رصيدك غير كافٍ (تحتاج 50 نقطة)' }));
            }
        } catch (err: any) {
            setPerformanceProject(s => ({ ...s, isGeneratingFull: false, error: err.message }));
        }
    };

    const handleGenerateElite = async () => {
        if (!performanceProject.productDescription || !userId) return;
        setPerformanceProject(s => ({ ...s, isGenerating: true, error: null, result: null }));
        try {
            const deducted = await deductCredits(userId, CREDIT_COSTS.COPYWRITING * 4);
            if (deducted) {
                const result = await generatePerformanceAdPack({
                    targetMarket: performanceProject.targetMarket,
                    campaignGoal: performanceProject.campaignGoal,
                    dialect: performanceProject.dialect,
                    platform: performanceProject.platform,
                    productDescription: performanceProject.productDescription,
                    sellingPrice: performanceProject.sellingPrice,
                    brandTone: performanceProject.brandTone,
                    referenceImage: performanceProject.referenceImage
                });
                setPerformanceProject(s => ({ ...s, result, isGenerating: false }));
                setActiveTab('intelligence');
                if (refreshCredits) refreshCredits();
            } else {
                setPerformanceProject(s => ({ ...s, isGenerating: false, error: 'رصيدك غير كافٍ (تحتاج 40 نقطة)' }));
            }
        } catch (err: any) {
            setPerformanceProject(s => ({ ...s, isGenerating: false, error: err.message }));
        }
    };

    // --- Master Factory (Quick) Logic ---
    useEffect(() => {
        if (activeMode === 'guided' && !chatSession) {
            const chat = createEliteAdChat(masterProject.currentTone);
            setChatSession(chat);
            const startChat = async () => {
                setMasterProject(s => ({ ...s, isGenerating: true }));
                try {
                    const response = await chat.sendMessage({ message: "ابدأ معايا المرحلة الأولى: إيه هي هوية البراند بتاعك؟" });
                    setMasterProject(s => ({ ...s, messages: [{ role: 'bot', text: response.text || '' }], isGenerating: false, step: 1 }));
                } catch (e) { setMasterProject(s => ({ ...s, isGenerating: false, error: 'فشل بدء المحرك' })); }
            };
            startChat();
        }
    }, [activeMode]);

    useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [masterProject.messages]);

    const handleGuidedSend = async (customText?: string) => {
        const textToSend = customText || input;
        if (!textToSend.trim() || !chatSession || masterProject.isGenerating) return;
        setInput('');
        setMasterProject(s => ({ ...s, messages: [...s.messages, { role: 'user', text: textToSend }], isGenerating: true }));
        try {
            const response = await chatSession.sendMessage({ message: textToSend });
            const botText = response.text || '';
            setMasterProject(s => {
                const nextStep = s.step + 1;
                return { 
                    ...s, 
                    messages: [...s.messages, { role: 'bot', text: botText }], 
                    isGenerating: false, 
                    step: nextStep,
                    finalScript: nextStep >= 9 ? botText : null 
                };
            });
        } catch (err) { setMasterProject(s => ({ ...s, isGenerating: false, error: "فشل الاتصال." })); }
    };

    const handleResetGuided = () => {
        setChatSession(null);
        setMasterProject(s => ({ 
            ...s, 
            messages: [], 
            step: 0, 
            finalScript: null, 
            error: null 
        }));
        setSocialPosts([]);
        setReelsScript(null);
        setImagePrompts([]);
        setGeneratedImages([]);
    };

    const handleGenerateViralIdeas = async () => {
        if (!masterProject.productInfo.product || !userId) return;
        setMasterProject(s => ({ ...s, isGenerating: true, error: null, topicIdeas: [] }));
        try {
            const deducted = await deductCredits(userId, CREDIT_COSTS.COPYWRITING);
            if (deducted) {
                const ideas = await generateShortFormIdeas({ product: masterProject.productInfo.product });
                setMasterProject(s => ({ ...s, topicIdeas: ideas, isGenerating: false }));
            }
        } catch (err) { setMasterProject(s => ({ ...s, isGenerating: false, error: 'فشل المحرك' })); }
    };

    const handleSelectIdea = async (idea: string) => {
        setMasterProject(s => ({ ...s, isGenerating: true, finalScript: null }));
        try {
            const script = await generateFinalContentScript(idea, 'reel');
            setMasterProject(s => ({ ...s, finalScript: script, isGenerating: false }));
        } catch (err) { setMasterProject(s => ({ ...s, isGenerating: false, error: 'فشل صياغة السكريبت' })); }
    };

    const handleTransform = async () => {
        if (!masterProject.rawInput.trim() || !userId) return;
        setMasterProject(s => ({ ...s, isGenerating: true, error: null, finalScript: null }));
        try {
            const transformed = await transformScriptToUGC(masterProject.rawInput);
            setMasterProject(s => ({ ...s, finalScript: transformed, isGenerating: false }));
        } catch (err) { setMasterProject(s => ({ ...s, isGenerating: false, error: 'فشل التحويل' })); }
    };

    const handleGenerateFlow = async () => {
        if (!masterProject.finalScript || genStage !== 'IDLE') return;
        setGenStage('FLOW');
        setVideoUrl(null);
        try {
            const url = await generateFlowVideo(masterProject.finalScript, "9:16", (msg) => setVideoStatus(msg));
            setVideoUrl(url);
            setVideoStatus("اكتمل الرندر!");
        } catch (err) { setVideoStatus("خطأ في الرندر"); setGenStage('IDLE'); }
    };

    const handleGenerateSocialPack = async () => {
        if (!masterProject.finalScript || !userId) return;
        setIsGeneratingExtra(true);
        try {
            const deducted = await deductCredits(userId, 10);
            if (deducted) {
                const posts = await generateSocialContentPack(masterProject.finalScript);
                setSocialPosts(posts);
                if (refreshCredits) refreshCredits();
            }
        } catch (e) { console.error(e); }
        setIsGeneratingExtra(false);
    };

    const handleGenerateReelsScript = async () => {
        if (!masterProject.finalScript || !userId) return;
        setIsGeneratingExtra(true);
        try {
            const deducted = await deductCredits(userId, 10);
            if (deducted) {
                const script = await generateReelsProductionScript(masterProject.finalScript);
                setReelsScript(script);
                if (refreshCredits) refreshCredits();
            }
        } catch (e) { console.error(e); }
        setIsGeneratingExtra(false);
    };

    const handleGenerateImagesFromStrategy = async () => {
        if (!masterProject.finalScript || !userId) return;
        setIsGeneratingExtra(true);
        setGeneratedImages([]);
        try {
            const deducted = await deductCredits(userId, 30);
            if (deducted) {
                const prompts = await generateImagePromptsFromStrategy(masterProject.finalScript);
                setImagePrompts(prompts);
                
                // Generate images one by one but update state immediately for gradual feel
                for (const p of prompts) {
                    try {
                        const res = await generateImage([], p, null, "1:1");
                        const url = `data:${res.mimeType};base64,${res.base64}`;
                        setGeneratedImages(prev => [...prev, url]);
                    } catch (err) {
                        console.error("Image gen failed", err);
                    }
                }
                if (refreshCredits) refreshCredits();
            }
        } catch (e) { console.error(e); }
        setIsGeneratingExtra(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPerformanceProject(s => ({
                    ...s,
                    referenceImage: {
                        base64: (reader.result as string).split(',')[1],
                        mimeType: file.type,
                        name: file.name
                    }
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto py-10 animate-in fade-in duration-700 text-right" dir="rtl">
            {/* Header & Mode Selector */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
                <div className="space-y-4">
                    <h1 className="text-5xl font-black text-white tracking-tighter italic">مصنع المحتوى الإعلاني <span className="text-[#FFD700]">🏭</span></h1>
                    <p className="text-slate-400 text-xl font-bold">المحرك المتكامل لصناعة الحملات والسكريبتات الإبداعية.</p>
                </div>
                
                <div className="bg-white/5 p-1.5 rounded-2xl border border-white/10 flex flex-wrap gap-2 justify-center">
                    <button onClick={() => setActiveMode('elite')} className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${activeMode === 'elite' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}>حملة بيعية كاملة (النخبة) 💎</button>
                    <button onClick={() => setActiveMode('guided')} className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${activeMode === 'guided' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}>سكريبت استراتيجي 🪄</button>
                    <button onClick={() => setActiveMode('machine')} className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${activeMode === 'machine' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}>أفكار فيرال 🚀</button>
                    <button onClick={() => setActiveMode('transformer')} className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${activeMode === 'transformer' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}>محول المحتوى البشري ✨</button>
                </div>
            </div>

            {/* --- ELITE MODE UI --- */}
            {activeMode === 'elite' && (
                <div className="space-y-10">
                    <div className="flex justify-between items-center">
                        <h2 className="text-3xl font-black text-white italic">وضع الحملة الكاملة <span className="text-[#FFD700]">💎</span></h2>
                        {performanceProject.result && (
                            <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex gap-1">
                                <button onClick={() => setActiveTab('intelligence')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${activeTab === 'intelligence' ? 'bg-[#FFD700] text-black' : 'text-slate-400'}`}>الذكاء</button>
                                <button onClick={() => setActiveTab('matrix')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${activeTab === 'matrix' ? 'bg-[#FFD700] text-black' : 'text-slate-400'}`}>الزوايا</button>
                                <button onClick={() => setActiveTab('launch_pack')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${activeTab === 'launch_pack' ? 'bg-[#FFD700] text-black' : 'text-slate-400'}`}>الإطلاق 🚀</button>
                                <button onClick={() => setActiveTab('visuals')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${activeTab === 'visuals' ? 'bg-[#FFD700] text-black' : 'text-slate-400'}`}>البصريات</button>
                                <button onClick={() => setActiveTab('profit')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${activeTab === 'profit' ? 'bg-[#FFD700] text-black' : 'text-slate-400'}`}>الأرباح 💰</button>
                                <button onClick={() => setActiveTab('simulation')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${activeTab === 'simulation' ? 'bg-[#FFD700] text-black' : 'text-slate-400'}`}>المحاكاة 📈</button>
                                {performanceProject.fullCampaign && (
                                    <button onClick={() => setActiveTab('full_campaign')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${activeTab === 'full_campaign' ? 'bg-[#FFD700] text-black' : 'text-slate-400'}`}>الحملة</button>
                                )}
                                <button onClick={() => setActiveTab('inputs')} className="px-3 py-1.5 rounded-lg text-[10px] font-black text-white/20 hover:text-white">تعديل</button>
                            </div>
                        )}
                    </div>

                    {activeTab === 'inputs' && (
                        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-12 space-y-8 shadow-2xl animate-in slide-in-from-bottom-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">السوق المستهدف</label>
                                    <select value={performanceProject.targetMarket} onChange={e => setPerformanceProject(s => ({ ...s, targetMarket: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold text-white outline-none focus:border-[#FFD700]">
                                        <option value="Egypt">مصر 🇪🇬</option>
                                        <option value="KSA">السعودية 🇸🇦</option>
                                        <option value="UAE">الإمارات 🇦🇪</option>
                                        <option value="Other">سوق آخر</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">هدف الحملة</label>
                                    <select value={performanceProject.campaignGoal} onChange={e => setPerformanceProject(s => ({ ...s, campaignGoal: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold text-white outline-none focus:border-[#FFD700]">
                                        <option value="Sales">مبيعات مباشرة (Sales)</option>
                                        <option value="Leads">تجميع بيانات (Leads)</option>
                                        <option value="AOV">زيادة متوسط الطلب (AOV)</option>
                                        <option value="Testing">اختبار زوايا (Testing)</option>
                                        <option value="Retargeting">إعادة استهداف (Retargeting)</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">سعر البيع</label>
                                    <input value={performanceProject.sellingPrice} onChange={e => setPerformanceProject(s => ({ ...s, sellingPrice: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold text-white outline-none focus:border-[#FFD700]" placeholder="مثال: 500 ج.م" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">اللهجة</label>
                                    <select value={performanceProject.dialect} onChange={e => setPerformanceProject(s => ({ ...s, dialect: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold text-white outline-none focus:border-[#FFD700]">
                                        <option value="Egyptian Arabic">عامية مصرية</option>
                                        <option value="Gulf Arabic">لهجة خليجية</option>
                                        <option value="MSA">لغة عربية فصحى</option>
                                        <option value="English">English</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">المنصة</label>
                                    <select value={performanceProject.platform} onChange={e => setPerformanceProject(s => ({ ...s, platform: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold text-white outline-none focus:border-[#FFD700]">
                                        <option value="Facebook">Facebook</option>
                                        <option value="Instagram">Instagram</option>
                                        <option value="TikTok">TikTok</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">نبرة البراند</label>
                                    <select value={performanceProject.brandTone} onChange={e => setPerformanceProject(s => ({ ...s, brandTone: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold text-white outline-none focus:border-[#FFD700]">
                                        <option value="Bold">جريئة (Bold)</option>
                                        <option value="Premium">راقية (Premium)</option>
                                        <option value="Friendly">ودودة (Friendly)</option>
                                        <option value="Aggressive">هجومية (Aggressive)</option>
                                        <option value="Luxury">فخمة (Luxury)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-3">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">وصف المنتج / الخدمة</label>
                                    <textarea 
                                        value={performanceProject.productDescription} 
                                        onChange={e => setPerformanceProject(s => ({ ...s, productDescription: e.target.value }))} 
                                        className="w-full h-48 bg-black/40 border border-white/10 rounded-3xl p-6 font-bold text-white outline-none focus:border-[#FFD700] shadow-inner resize-none" 
                                        placeholder="اوصف منتجك بالتفصيل، إيه المشكلة اللي بيحلها؟ ومين العميل المثالي؟" 
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">صورة مرجعية (اختياري)</label>
                                    <div className="relative h-48 group">
                                        <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                        <div className="w-full h-full bg-black/40 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 group-hover:border-[#FFD700] transition-all overflow-hidden">
                                            {performanceProject.referenceImage ? (
                                                <img src={`data:${performanceProject.referenceImage.mimeType};base64,${performanceProject.referenceImage.base64}`} className="w-full h-full object-cover" alt="Reference" />
                                            ) : (
                                                <>
                                                    <span className="text-3xl">🖼️</span>
                                                    <span className="text-xs font-black text-slate-500">ارفع صورة للمنتج</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleGenerateElite} 
                                disabled={performanceProject.isGenerating || !performanceProject.productDescription} 
                                className="w-full h-20 bg-[#FFD700] text-black font-black rounded-[2rem] text-xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4"
                            >
                                {performanceProject.isGenerating ? (
                                    <>
                                        <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                                        جاري تفعيل وضع النخبة (ELITE MODE)...
                                    </>
                                ) : `توليد باقة النخبة (40 نقطة)`}
                            </button>
                            {performanceProject.error && <p className="text-red-400 text-center font-bold">{performanceProject.error}</p>}
                        </div>
                    )}

                    {/* Elite Results Rendering */}
                    {performanceProject.result && (
                        <div className="animate-in fade-in">
                            {activeTab === 'intelligence' && (
                                <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 shadow-2xl">
                                    <h3 className="text-2xl font-black text-[#FFD700] mb-8 pr-4 border-r-4 border-[#FFD700]">الذكاء الاستراتيجي للمنتج</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {[
                                            { label: 'نوع المنتج', value: performanceProject.result.strategicIntelligence.productType, icon: '📦' },
                                            { label: 'مستوى المخاطرة', value: performanceProject.result.strategicIntelligence.riskLevel, icon: '⚠️' },
                                            { label: 'المحرك العاطفي', value: performanceProject.result.strategicIntelligence.emotionalDriver, icon: '❤️' },
                                            { label: 'نموذج العميل', value: performanceProject.result.strategicIntelligence.archetype, icon: '👤' },
                                            { label: 'المحفز النفسي', value: performanceProject.result.strategicIntelligence.psychologicalTrigger, icon: '🧠' },
                                            { label: 'أكبر اعتراض', value: performanceProject.result.strategicIntelligence.biggestObjection, icon: '🛑' },
                                        ].map((item, i) => (
                                            <div key={i} className="p-6 bg-black/40 border border-white/5 rounded-3xl space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                                                    <span>{item.icon}</span>
                                                </div>
                                                <p className="text-white font-bold text-lg">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'matrix' && (
                                <div className="space-y-8">
                                    <div className="bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-[2.5rem] p-8">
                                        <h4 className="text-sm font-black text-[#FFD700] uppercase tracking-widest mb-4">توصية المحرك الاستراتيجي</h4>
                                        <p className="text-white font-bold text-lg leading-relaxed">{performanceProject.result.creativeStrategyMatrix.recommendationReason}</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {performanceProject.result.creativeStrategyMatrix.angles.map((angle, i) => (
                                            <div key={i} className={`bg-white/5 border rounded-[2.5rem] p-8 space-y-6 transition-all relative ${angle.isRecommended ? 'border-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.1)]' : 'border-white/10'}`}>
                                                {angle.isRecommended && (
                                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FFD700] text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">START WITH THIS ANGLE</div>
                                                )}
                                                <div className="absolute -top-4 -right-4 w-10 h-10 bg-[#FFD700] text-black rounded-full flex items-center justify-center font-black shadow-lg">#{angle.rank}</div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black text-[#FFD700] bg-[#FFD700]/10 px-3 py-1 rounded-full uppercase tracking-widest">Angle {i+1}</span>
                                                    <span className="text-2xl">🎯</span>
                                                </div>
                                                <h4 className="text-xl font-black text-white">{angle.title}</h4>
                                                <div className="space-y-4 text-sm">
                                                    <div>
                                                        <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest mb-1">المحفز العاطفي</p>
                                                        <p className="text-slate-200 font-bold">{angle.trigger}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest mb-1">المبدأ النفسي</p>
                                                        <p className="text-slate-200 font-bold">{angle.principle}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest mb-1">لماذا سينجح؟</p>
                                                        <p className="text-slate-200 font-bold leading-relaxed">{angle.marketReason}</p>
                                                    </div>
                                                    <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                                        <p className="text-emerald-500 font-black uppercase text-[10px] tracking-widest mb-1">تحييد الاعتراض</p>
                                                        <p className="text-emerald-400 font-bold">{angle.objectionNeutralizer}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'launch_pack' && (
                                <div className="space-y-8">
                                    <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 shadow-2xl">
                                        <h3 className="text-2xl font-black text-[#FFD700] mb-8 pr-4 border-r-4 border-[#FFD700]">باقة الإطلاق الفورية (LAUNCH THIS NOW)</h3>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                            <div className="space-y-8">
                                                <div>
                                                    <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">خطافات توقف التمرير (Hooks)</h4>
                                                    <div className="space-y-3">
                                                        {performanceProject.result.launchPack.hooks.map((hook, i) => (
                                                            <div key={i} className="p-4 bg-black/40 border border-white/5 rounded-2xl font-black text-white text-sm">
                                                                {i+1}. "{hook}"
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">هيكل العرض (Offer)</h4>
                                                    <div className="p-6 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-3xl text-white font-bold text-lg">
                                                        {performanceProject.result.launchPack.offerStructure}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                                        <h4 className="text-[10px] font-black text-slate-500 uppercase mb-2">اقتراح Upsell</h4>
                                                        <p className="text-white font-bold text-xs">{performanceProject.result.launchPack.upsellSuggestion}</p>
                                                    </div>
                                                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                                        <h4 className="text-[10px] font-black text-slate-500 uppercase mb-2">نداء الإجراء (CTA)</h4>
                                                        <p className="text-white font-bold text-xs">{performanceProject.result.launchPack.cta}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-8">
                                                <div>
                                                    <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">النسخة الإعلانية (Ad Copy)</h4>
                                                    <div className="p-8 bg-black/40 rounded-3xl border border-white/5 text-slate-200 font-bold leading-relaxed whitespace-pre-wrap text-sm shadow-inner">
                                                        {performanceProject.result.launchPack.adCopy}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">سكريبت فيديو UGC</h4>
                                                    <div className="p-8 bg-black/40 rounded-3xl border border-white/5 text-slate-200 font-bold leading-relaxed whitespace-pre-wrap text-sm italic">
                                                        {performanceProject.result.launchPack.ugcScript}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'visuals' && (
                                <div className="space-y-8">
                                    <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 shadow-2xl">
                                        <h3 className="text-2xl font-black text-[#FFD700] mb-8 pr-4 border-r-4 border-[#FFD700]">محرك المطابقة البصرية</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                            {performanceProject.result.visualMatchingEngine.imageConcepts.map((concept, i) => (
                                                <div key={i} className="p-6 bg-black/40 border border-white/5 rounded-3xl space-y-4">
                                                    <h4 className="text-lg font-black text-white">مفهوم بصري #{i+1}</h4>
                                                    <p className="text-sm text-slate-200 leading-relaxed font-bold">{concept.description}</p>
                                                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-400">
                                                        <span>Angle: {concept.angle}</span>
                                                        <span>Emotion: {concept.emotion}</span>
                                                        <span>Lighting: {concept.lighting}</span>
                                                    </div>
                                                    <p className="text-xs text-[#FFD700] italic">"{concept.why}"</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-6 bg-black/40 border border-white/5 rounded-3xl mb-10">
                                            <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-2">مفهوم الصورة المصغرة (Thumbnail)</h4>
                                            <p className="text-white font-bold">{performanceProject.result.visualMatchingEngine.thumbnailConcept}</p>
                                        </div>
                                        <h3 className="text-2xl font-black text-[#FFD700] mb-8 pr-4 border-r-4 border-[#FFD700]">ستوريبورد الريلز (6 لقطات)</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {performanceProject.result.visualMatchingEngine.storyboard.map((frame, i) => (
                                                <div key={i} className="p-6 bg-black/40 border border-white/5 rounded-3xl space-y-3 relative">
                                                    <div className="absolute top-4 left-4 text-xs font-black text-[#FFD700]">#{frame.frame}</div>
                                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{frame.purpose}</p>
                                                    <p className="text-white font-bold text-sm leading-relaxed">{frame.scene}</p>
                                                    <div className="flex justify-between text-[10px] text-slate-400">
                                                        <span>{frame.shot}</span>
                                                        <span>{frame.movement}</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-300 italic">Overlay: "{frame.text}"</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'profit' && (
                                <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 shadow-2xl">
                                    <h3 className="text-2xl font-black text-[#FFD700] mb-8 pr-4 border-r-4 border-[#FFD700]">عقل الأرباح (Profit Brain)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 space-y-4">
                                            <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest">منطق تراكم القيمة</h4>
                                            <p className="text-white font-bold text-lg leading-relaxed">{performanceProject.result.profitBrain.valueStacking}</p>
                                        </div>
                                        <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 space-y-4">
                                            <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest">زيادة متوسط الطلب (AOV)</h4>
                                            <p className="text-white font-bold text-lg leading-relaxed">{performanceProject.result.profitBrain.aovIncrease}</p>
                                        </div>
                                        <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 space-y-4">
                                            <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest">الاستعجال والندرة</h4>
                                            <p className="text-white font-bold text-lg leading-relaxed">{performanceProject.result.profitBrain.scarcityUrgency}</p>
                                        </div>
                                        <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 space-y-4">
                                            <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest">عكس المخاطرة (Risk Reversal)</h4>
                                            <p className="text-white font-bold text-lg leading-relaxed">{performanceProject.result.profitBrain.riskReversal}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'simulation' && (
                                <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 shadow-2xl">
                                    <h3 className="text-2xl font-black text-[#FFD700] mb-8 pr-4 border-r-4 border-[#FFD700]">محاكاة الأداء المتوقع</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                        <div className="p-8 bg-black/40 rounded-3xl border border-white/5 text-center space-y-2">
                                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">قوة الخطاف (Hook)</h4>
                                            <p className={`text-3xl font-black ${
                                                performanceProject.result.performanceSimulation.hookStrength === 'High' ? 'text-emerald-500' :
                                                performanceProject.result.performanceSimulation.hookStrength === 'Medium' ? 'text-[#FFD700]' : 'text-red-500'
                                            }`}>{performanceProject.result.performanceSimulation.hookStrength}</p>
                                        </div>
                                        <div className="p-8 bg-black/40 rounded-3xl border border-white/5 text-center space-y-2">
                                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">ثقة التحويل</h4>
                                            <p className="text-4xl font-black text-white">{performanceProject.result.performanceSimulation.conversionConfidence}/10</p>
                                        </div>
                                        <div className="p-8 bg-black/40 rounded-3xl border border-white/5 text-center space-y-2">
                                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">مستوى المخاطرة</h4>
                                            <p className="text-xl font-black text-white">{performanceProject.result.performanceSimulation.riskLevel}</p>
                                        </div>
                                    </div>
                                    <div className="p-8 bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-[2.5rem]">
                                        <h4 className="text-sm font-black text-[#FFD700] uppercase tracking-widest mb-4">هيكل الاختبار المقترح</h4>
                                        <p className="text-white font-bold text-lg leading-relaxed">{performanceProject.result.performanceSimulation.testingStructure}</p>
                                    </div>
                                </div>
                            )}
                            {/* I'll include the full campaign generation button here too */}
                            {activeTab !== 'full_campaign' && !performanceProject.fullCampaign && (
                                <div className="mt-10 flex justify-center">
                                    <button 
                                        onClick={handleGenerateFullCampaign} 
                                        disabled={performanceProject.isGeneratingFull}
                                        className="bg-[#FFD700] text-black px-12 py-4 rounded-2xl text-lg font-black transition-all shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-4"
                                    >
                                        {performanceProject.isGeneratingFull ? (
                                            <>
                                                <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
                                                جاري بناء الحملة الكاملة...
                                            </>
                                        ) : '🚀 ولد حملتك الإعلانية الكاملة (50 نقطة)'}
                                    </button>
                                </div>
                            )}
                            
                            {/* Full Campaign View */}
                            {activeTab === 'full_campaign' && performanceProject.fullCampaign && (
                                <div className="space-y-12">
                                    {performanceProject.fullCampaign.adSets.map((set, i) => (
                                        <div key={i} className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
                                            <div className="p-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                                                <div className="space-y-2">
                                                    <span className="text-[10px] font-black text-[#FFD700] bg-[#FFD700]/10 px-3 py-1 rounded-full uppercase tracking-widest">Ad Set {i+1}</span>
                                                    <h3 className="text-3xl font-black text-white">{set.angle}</h3>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 lg:grid-cols-2">
                                                <div className="p-10 space-y-8 border-b lg:border-b-0 lg:border-l border-white/5">
                                                    <div className="space-y-4">
                                                        <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest">الصورة الإعلانية</h4>
                                                        {set.image ? (
                                                            <div className="aspect-square rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                                                                <img src={set.image} className="w-full h-full object-cover" alt="Ad Visual" />
                                                            </div>
                                                        ) : (
                                                            <div className="aspect-square rounded-[2rem] bg-black/40 border border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 font-bold gap-4">
                                                                <div className="w-8 h-8 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
                                                                <span className="text-xs uppercase tracking-widest">جاري التصميم...</span>
                                                            </div>
                                                        )}
                                                        <p className="text-xs text-slate-400 italic leading-relaxed">{set.visualPrompt}</p>
                                                    </div>
                                                </div>
                                                <div className="p-10 space-y-8">
                                                    <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest">ستوريبورد الفيديو</h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {set.storyboard.map((frame, fi) => (
                                                            <div key={fi} className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-2">
                                                                <span className="text-[10px] font-black text-[#FFD700]">Frame {frame.frame}</span>
                                                                <p className="text-xs text-white font-bold leading-relaxed">{frame.scene}</p>
                                                                <p className="text-[10px] text-slate-400 italic">"{frame.text}"</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* --- QUICK MODES UI (Master Factory) --- */}
            {(activeMode === 'guided' || activeMode === 'machine' || activeMode === 'transformer') && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in slide-in-from-bottom-4">
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 shadow-2xl space-y-8 min-h-[600px]">
                            <h3 className="text-xs font-black text-[#FFD700] uppercase tracking-[0.3em] pr-4 border-r-4 border-[#FFD700]">مركز التحكم</h3>
                            
                            {activeMode === 'guided' && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                                            <div key={i} className={`flex items-center gap-4 p-3 rounded-2xl transition-all ${masterProject.step === i ? 'bg-[#FFD700]/10 border border-[#FFD700]/30' : 'opacity-20 grayscale'}`}>
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${masterProject.step > i ? 'bg-emerald-500 text-white' : 'bg-[#FFD700] text-black'}`}>{masterProject.step > i ? '✓' : i}</div>
                                                <span className="text-[11px] font-black text-white">{STEPS_LABELS[i]}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeMode === 'machine' && (
                                <div className="space-y-6">
                                    <p className="text-xs text-slate-400 font-bold leading-relaxed">أدخل تفاصيل منتجك وسأقوم بتوليد 30 فكرة ريلز فيرال جاهزة للتصوير.</p>
                                    <textarea 
                                        value={masterProject.productInfo.product} 
                                        onChange={e => setMasterProject(s => ({ ...s, productInfo: { ...s.productInfo, product: e.target.value } }))}
                                        placeholder="اسم المنتج وميزاته الأساسية..." 
                                        className="w-full bg-black/40 border border-white/10 rounded-3xl p-6 font-bold text-white outline-none focus:border-[#FFD700] h-48 resize-none" 
                                    />
                                    <button onClick={handleGenerateViralIdeas} disabled={masterProject.isGenerating} className="w-full h-16 bg-white text-black font-black rounded-2xl hover:scale-105 transition-all shadow-xl">توليد 30 فكرة (5 نقاط)</button>
                                    
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 pt-4 border-t border-white/5">
                                        {masterProject.topicIdeas.map((idea, idx) => (
                                            <button key={idx} onClick={() => handleSelectIdea(idea)} className="w-full text-right p-4 bg-white/5 hover:bg-[#FFD700] rounded-xl text-[10px] font-bold text-slate-300 hover:text-black transition-all border border-transparent hover:border-white/20">{idx+1}. {idea}</button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeMode === 'transformer' && (
                                <div className="space-y-6">
                                    <p className="text-xs text-slate-400 font-bold leading-relaxed">أدخل السكريبت الإعلاني التقليدي، وسأحوله إلى سكريبت UGC بشري جذاب فوراً.</p>
                                    <textarea 
                                        value={masterProject.rawInput} 
                                        onChange={e => setMasterProject(s => ({ ...s, rawInput: e.target.value }))}
                                        placeholder="الصق النص هنا..." 
                                        className="w-full bg-black/40 border border-white/10 rounded-3xl p-6 font-bold text-white outline-none focus:border-[#FFD700] h-[450px] resize-none" 
                                    />
                                    <button onClick={handleTransform} disabled={masterProject.isGenerating} className="w-full h-16 bg-[#FFD700] text-black font-black rounded-2xl hover:bg-yellow-400 transition-all shadow-xl">تحويل لسكريبت بشري ✨</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-[3.5rem] p-8 md:p-12 min-h-[600px] flex flex-col shadow-2xl relative overflow-hidden">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-xl font-black text-[#FFD700] pr-4 border-r-4 border-[#FFD700]">سكريبت الإنتاج النهائي</h3>
                                <div className="flex gap-4">
                                    {masterProject.finalScript && <button onClick={() => navigator.clipboard.writeText(masterProject.finalScript!)} className="text-[10px] font-black text-white/30 hover:text-white">نسخ السكريبت 📋</button>}
                                    <button onClick={handleResetGuided} className="text-[10px] font-black text-red-500/50 hover:text-red-500">إعادة البدء 🔄</button>
                                </div>
                            </div>

                            {activeMode === 'guided' && !masterProject.finalScript && (
                                 <div ref={scrollRef} className="flex-grow space-y-6 overflow-y-auto mb-8 no-scrollbar max-h-[500px]">
                                     {masterProject.messages.map((m, i) => (
                                         <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                                             <div className={`max-w-[85%] p-6 rounded-[2rem] text-sm md:text-lg font-bold leading-relaxed ${m.role === 'user' ? 'bg-[#FFD700] text-black' : 'bg-white/5 border border-white/5 text-slate-300'}`}>{m.text}</div>
                                         </div>
                                     ))}
                                     {masterProject.isGenerating && <div className="text-[#FFD700] animate-pulse text-xs font-black">جاري المعالجة الذكية...</div>}
                                 </div>
                            )}

                            {masterProject.finalScript ? (
                                <div className="space-y-8 animate-in fade-in">
                                    <div className="p-10 bg-black/40 rounded-[2.5rem] border border-white/5 text-slate-100 font-bold text-xl leading-relaxed whitespace-pre-wrap shadow-inner">
                                        {masterProject.finalScript}
                                    </div>

                                    {/* Action Buttons for Content Factory */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <button 
                                            onClick={handleGenerateImagesFromStrategy}
                                            disabled={isGeneratingExtra}
                                            className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-[#FFD700] hover:text-black transition-all group"
                                        >
                                            <span className="text-2xl block mb-2">🖼️</span>
                                            <span className="font-black text-sm">توليد صور إعلانية</span>
                                        </button>
                                        <button 
                                            onClick={handleGenerateReelsScript}
                                            disabled={isGeneratingExtra}
                                            className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-[#FFD700] hover:text-black transition-all group"
                                        >
                                            <span className="text-2xl block mb-2">🎬</span>
                                            <span className="font-black text-sm">سكريبت فيديو ريلز</span>
                                        </button>
                                        <button 
                                            onClick={handleGenerateSocialPack}
                                            disabled={isGeneratingExtra}
                                            className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-[#FFD700] hover:text-black transition-all group"
                                        >
                                            <span className="text-2xl block mb-2">📱</span>
                                            <span className="font-black text-sm">9 بوستات سوشيال ميديا</span>
                                        </button>
                                    </div>

                                    {isGeneratingExtra && (
                                        <div className="flex items-center justify-center gap-4 text-[#FFD700] font-black animate-pulse">
                                            <div className="w-5 h-5 border-3 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
                                            جاري تشغيل مصنع المحتوى...
                                        </div>
                                    )}

                                    {/* Results Display */}
                                    {generatedImages.length > 0 && (
                                        <div className="space-y-4 pt-10 border-t border-white/5">
                                            <h4 className="text-xl font-black text-white italic">الصور الإعلانية المولدة 🖼️</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {generatedImages.map((img, i) => (
                                                    <div key={i} className="aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                                                        <img src={img} className="w-full h-full object-cover" alt="Generated" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {reelsScript && (
                                        <div className="space-y-4 pt-10 border-t border-white/5">
                                            <h4 className="text-xl font-black text-white italic">سكريبت الريلز الاحترافي 🎬</h4>
                                            <div className="p-8 bg-black/40 rounded-3xl border border-white/5 text-slate-200 font-bold leading-relaxed whitespace-pre-wrap">
                                                {reelsScript}
                                            </div>
                                        </div>
                                    )}

                                    {socialPosts.length > 0 && (
                                        <div className="space-y-4 pt-10 border-t border-white/5">
                                            <h4 className="text-xl font-black text-white italic">باقة الـ 9 بوستات 📱</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {socialPosts.map((post, i) => (
                                                    <div key={i} className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-4">
                                                        <span className="text-[10px] font-black text-[#FFD700]">بوست #{i+1}</span>
                                                        <div className="text-xs text-slate-300 font-bold leading-relaxed whitespace-pre-wrap">
                                                            {post}
                                                        </div>
                                                        <button onClick={() => navigator.clipboard.writeText(post)} className="w-full py-2 bg-white/5 text-slate-500 rounded-xl text-[10px] font-black hover:bg-[#FFD700] hover:text-black transition-all">نسخ 📋</button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-white/5">
                                        <div className="space-y-4">
                                             <h4 className="text-sm font-black text-[#FFD700] uppercase tracking-widest">إطلاق الـ Flow للإنتاج</h4>
                                             <button onClick={handleGenerateFlow} disabled={genStage !== 'IDLE'} className={`w-full py-8 rounded-[2.5rem] font-black text-xl transition-all shadow-2xl ${genStage !== 'IDLE' ? 'bg-slate-800 text-slate-400' : 'bg-[#FFD700] text-black hover:bg-yellow-400'}`}>
                                                {genStage === 'IDLE' ? '🎬 توليد فيديو ريلز (100 نقطة)' : videoStatus}
                                             </button>
                                        </div>
                                        <div className="aspect-[9/16] bg-black/60 rounded-[3rem] border border-white/10 overflow-hidden relative shadow-2xl flex items-center justify-center">
                                            {videoUrl ? <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover" /> : <p className="opacity-10 text-xs font-black uppercase tracking-widest">Vertical Preview</p>}
                                            {genStage === 'FLOW' && !videoUrl && <div className="absolute inset-0 bg-[#FFD700]/10 backdrop-blur-md flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div></div>}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                activeMode === 'guided' ? (
                                    <div className="mt-auto pt-6 flex gap-4">
                                        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleGuidedSend()} placeholder="أجب على المحرك هنا..." className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-6 py-5 font-bold text-white outline-none focus:border-[#FFD700] shadow-inner" />
                                        <button onClick={() => handleGuidedSend()} disabled={masterProject.isGenerating} className="w-16 h-16 bg-[#FFD700] text-black rounded-2xl flex items-center justify-center shadow-xl hover:bg-yellow-400 transition-all">
                                            <svg className="w-6 h-6 rotate-180" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex-grow flex flex-col items-center justify-center opacity-10 space-y-6">
                                        <div className="text-9xl">🪄</div>
                                        <p className="font-black text-2xl uppercase tracking-widest">Factory Ready for Input</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdContentFactory;
