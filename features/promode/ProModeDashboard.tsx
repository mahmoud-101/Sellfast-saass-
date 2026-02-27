import React, { useState } from 'react';
import {
    agentMarketAnalyzer,
    agentAngleStrategist,
    agentHookWriter,
    agentCopywriter,
    agentVisualDirector,
    agentResultValidator,
    agentObjectionHandler,
    generateImage,
    AgentProductData
} from '../../services/geminiService';
import {
    AgentMarketAnalysis,
    AgentAngle,
    AgentAdCopy,
    AgentVisual,
    AgentObjection,
    FinalProModeAd
} from '../performance/types';

// ============================================================================
// Types & State
// ============================================================================

type PipelineStatus = 'idle' | 'analyzing' | 'strategizing' | 'hooking' | 'copywriting' | 'visualizing' | 'objections' | 'completed' | 'error';

interface ProModeState {
    status: PipelineStatus;
    marketAnalysis: AgentMarketAnalysis | null;
    angles: AgentAngle[];
    finalAds: FinalProModeAd[];
    objections: AgentObjection[];
    error: string | null;
}

const INITIAL_STATE: ProModeState = {
    status: 'idle',
    marketAnalysis: null,
    angles: [],
    finalAds: [],
    objections: [],
    error: null
};

// ============================================================================
// Main Dashboard Component
// ============================================================================

const ProModeDashboard: React.FC = () => {
    const [pipeline, setPipeline] = useState<ProModeState>(INITIAL_STATE);
    const [productImage, setProductImage] = useState<string | null>(null);
    const [productForm, setProductForm] = useState<AgentProductData>({
        name: '',
        description: '',
        price: ''
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setProductImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const startPipeline = async () => {
        if (!productForm.name || !productForm.description || !productImage) {
            setPipeline(prev => ({ ...prev, error: 'يرجى إدخال اسم ووصف المنتج وصورة المنتج للبدء' }));
            return;
        }

        try {
            // Reset and start
            setPipeline({ ...INITIAL_STATE, status: 'analyzing' });

            // 1. Agent Market Analyzer
            const marketData = await agentMarketAnalyzer(productForm);
            setPipeline(prev => ({ ...prev, status: 'strategizing', marketAnalysis: marketData }));

            // 2. Agent Angle Strategist
            const anglesData: AgentAngle[] = await agentAngleStrategist(productForm, marketData);
            setPipeline(prev => ({ ...prev, status: 'hooking', angles: anglesData }));

            // 3. Parallel Processing for Hooks, Copy, and Visuals (Per Angle)
            setPipeline(prev => ({ ...prev, status: 'hooking' }));

            const generatedAds: FinalProModeAd[] = [];

            // For MVP speed previously it was 3, but user requested 5 distinct images.
            const topAngles = anglesData.slice(0, 5);
            const preliminaryAds: FinalProModeAd[] = [];

            // Step 3a: Generate Hooks, Copy, and Initial Visual Prompts
            for (const angle of topAngles) {
                const hooks = await agentHookWriter(productForm, angle);
                const bestHook = hooks[0] || '';
                const copyData = await agentCopywriter(productForm, angle, bestHook);
                const visualData = await agentVisualDirector(productForm, angle);

                preliminaryAds.push({
                    angle,
                    hooks,
                    copy: copyData,
                    visual: visualData
                });
            }

            // Step 3b: Agent 7 (Result Validator) - Ensure absolute visual diversity
            setPipeline(prev => ({ ...prev, status: 'visualizing' }));
            const rawVisuals = preliminaryAds.map(ad => ad.visual);
            let validatedVisuals = rawVisuals;
            try {
                validatedVisuals = await agentResultValidator(rawVisuals);
            } catch (validationErr) {
                console.warn("Validation agent failed, using raw visuals", validationErr);
            }

            // Step 3c: Actually Generate the Images based on Validated Prompts
            const imgFile = {
                base64: productImage.includes('base64,') ? productImage.split('base64,')[1] : productImage,
                mimeType: productImage.startsWith('data:') ? productImage.split(';')[0].split(':')[1] : 'image/png',
                name: 'product.png'
            };

            for (let i = 0; i < preliminaryAds.length; i++) {
                const ad = preliminaryAds[i];
                const finalVisual = validatedVisuals[i] || ad.visual;
                ad.visual = finalVisual;

                try {
                    const aiImage = await generateImage([imgFile], finalVisual.imagePrompt);
                    ad.visual.generatedImageUrl = `data:${aiImage.mimeType};base64,${aiImage.base64}`;
                } catch (imgError) {
                    console.error("🖼️ AI Image generation error:", imgError);
                    ad.visual.generatedImageUrl = productImage; // Fallback
                }

                generatedAds.push(ad);
            }

            setPipeline(prev => ({ ...prev, status: 'objections', finalAds: generatedAds }));

            // 6. Agent Objection Handler (Analyzing the first ad as a sample)
            const sampleCopy = generatedAds[0]?.copy.adBody || '';
            const objectionsData = await agentObjectionHandler(productForm, sampleCopy);

            // Finalize
            setPipeline(prev => ({
                ...prev,
                status: 'completed',
                objections: objectionsData
            }));

        } catch (error: any) {
            console.error(error);
            setPipeline(prev => ({ ...prev, status: 'error', error: error.message || 'حدث خطأ في المصنع' }));
        }
    };

    return (
        <div className="flex flex-col gap-10 animate-in fade-in duration-500 pb-32 max-w-[1600px] mx-auto p-4 md:p-8" dir="rtl">
            {/* Header: Cinematic Command Center Style */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-[#050505] border border-white/10 p-10 rounded-[2rem] shadow-3xl overflow-hidden glass">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between text-center md:text-right">
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-5xl shadow-[0_0_50px_rgba(168,85,247,0.5)] animate-pulse">
                                🤖
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tighter uppercase italic">الوضع الاحترافي <span className="text-purple-500">PRO MODE</span></h1>
                                <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                                    6 عملاء ذكاء اصطناعي (Agents) يعملون في تناغم استراتيجي لبناء إمبراطوريتك الإعلانية من الصفر.
                                </p>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className={`px-6 py-3 rounded-2xl border font-black text-sm uppercase tracking-widest ${pipeline.status === 'completed' ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' :
                            pipeline.status === 'error' ? 'border-red-500/50 bg-red-500/10 text-red-500' :
                                pipeline.status === 'idle' ? 'border-purple-500/50 bg-purple-500/10 text-purple-400' :
                                    'border-blue-500/50 bg-blue-500/10 text-blue-400 animate-pulse'
                            }`}>
                            STATUS: {pipeline.status.toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid: Split Screen Command Center */}
            <div className="grid grid-cols-1 xl:grid-cols-20 gap-10">

                {/* Left/Control Column: Input Form (8/20) */}
                <div className="xl:col-span-6 flex flex-col gap-8">
                    <div className="bg-[#0a0a0e] border border-white/5 rounded-[2.5rem] p-8 shadow-3xl glass sticky top-8">
                        <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                            <span className="p-2 bg-purple-500/20 rounded-xl">📦</span> قمرة القيادة
                        </h2>

                        <div className="space-y-6">
                            {/* Image Upload: More prominent */}
                            <div className="group/upload">
                                <label className="text-xs text-slate-500 font-black mb-2 block uppercase tracking-tighter">1. البصمة البصرية (صورة المنتج)</label>
                                <div className="relative">
                                    <div className={`w-full aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all duration-500 ${productImage ? 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.2)]' : 'border-white/10 hover:border-purple-500/50 bg-white/5'}`}>
                                        {productImage ? (
                                            <img src={productImage} alt="Product" className="w-full h-full object-cover scale-105 group-hover/upload:scale-100 transition-transform duration-700" />
                                        ) : (
                                            <div className="text-center group-hover/upload:scale-110 transition-transform duration-500">
                                                <span className="text-5xl mb-4 block opacity-50">📸</span>
                                                <p className="text-sm font-bold text-slate-400">اسحب صورة المنتج هنا</p>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                    />
                                    {productImage && (
                                        <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center justify-between z-30 animate-in slide-in-from-bottom-2">
                                            <p className="text-[10px] font-bold text-purple-400">✅ تم تحميل الصور بنجاح</p>
                                            <button onClick={() => setProductImage(null)} className="text-[10px] text-red-400 hover:text-red-300 transition-colors uppercase font-black">إعادة تحميل</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-slate-500 font-black mb-2 block uppercase tracking-tighter">2. الهوية الرقمية</label>
                                    <input
                                        type="text"
                                        value={productForm.name}
                                        onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/60 focus:bg-white/10 transition-all font-bold"
                                        placeholder="اسم المنتج (مثال: برفيوم ليل القاهرة)"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 font-black mb-2 block uppercase tracking-tighter">3. القيمة المالية</label>
                                    <input
                                        type="text"
                                        value={productForm.price}
                                        onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/60 focus:bg-white/10 transition-all font-bold"
                                        placeholder="السعر بالكامل أو الخصم"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 font-black mb-2 block uppercase tracking-tighter">4. الحمض النووي للمنتج (الشرح)</label>
                                    <textarea
                                        value={productForm.description}
                                        onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                                        className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/60 focus:bg-white/10 transition-all resize-none font-medium leading-relaxed"
                                        placeholder="صِف عظمة هذا المنتج وفوائده السحرية..."
                                    />
                                </div>
                            </div>

                            <button
                                onClick={startPipeline}
                                disabled={pipeline.status !== 'idle' && pipeline.status !== 'completed' && pipeline.status !== 'error'}
                                className="w-full mt-6 bg-purple-600 hover:bg-purple-500 text-white px-8 py-6 rounded-[2rem] font-black text-2xl transition-all shadow-[0_20px_40px_rgba(168,85,247,0.3)] hover:shadow-[0_25px_50px_rgba(168,85,247,0.5)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-4 overflow-hidden relative group/btn"
                            >
                                <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]"></div>

                                {pipeline.status === 'idle' || pipeline.status === 'completed' || pipeline.status === 'error' ? (
                                    <>
                                        <span className="text-3xl">☄️</span>
                                        <span>إطلاق المصنع الذكي</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>المصنع في قمة طاقته...</span>
                                    </>
                                )}
                            </button>

                            {pipeline.error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-5 rounded-2xl text-sm font-bold flex items-center gap-3 animate-bounce">
                                    <span className="text-xl">⚠️</span> {pipeline.error}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Output & Mega Previews (14/20) */}
                <div className="xl:col-span-14 flex flex-col gap-10">

                    {/* Intelligence Briefing: Market Analysis (Sleeker style) */}
                    {pipeline.marketAnalysis && (
                        <div className="bg-[#0f1219] border border-blue-500/20 rounded-[3rem] p-10 relative overflow-hidden glass animate-in slide-in-from-top-10 duration-700">
                            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full"></div>
                            <h3 className="text-3xl font-black text-blue-400 mb-8 flex items-center gap-4">
                                <span className="p-3 bg-blue-500/20 rounded-2xl">📊</span> موجز الاستخبارات التسويقية (Agent 1)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                                <InsightBox label="الجمهور المستهدف" value={pipeline.marketAnalysis.targetAudience} icon="👥" />
                                <InsightBox label="الرغبة العميقة" value={pipeline.marketAnalysis.coreDesire} icon="💎" />
                                <InsightBox label="الألم الأكبر" value={pipeline.marketAnalysis.biggestPain} icon="⚡" />
                            </div>
                        </div>
                    )}

                    {/* The Theater: Ad Previews - HUGE Cards */}
                    {pipeline.finalAds.length > 0 && (
                        <div className="space-y-12">
                            <div className="flex items-center justify-between px-4">
                                <h3 className="text-4xl font-black text-white flex items-center gap-4">
                                    <span className="text-5xl">🔥</span> معرض الأداء العالي
                                </h3>
                                <div className="text-slate-500 font-bold uppercase tracking-widest text-xs px-4 py-2 bg-white/5 rounded-full border border-white/10">
                                    5 Master Angles Generated
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {pipeline.finalAds.map((ad, idx) => (
                                    <div key={idx} className="group/card relative animate-in slide-in-from-bottom-10 duration-1000" style={{ animationDelay: `${idx * 200}ms` }}>
                                        {/* Glowing edge effect */}
                                        <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-500/50 to-indigo-500/50 rounded-[3rem] blur opacity-0 group-hover/card:opacity-100 transition duration-500"></div>

                                        <div className="relative bg-[#10131d] border border-white/10 rounded-[3rem] overflow-hidden shadow-4xl h-full flex flex-col transition-all duration-500 group-hover/card:translate-y-[-10px] group-hover/card:shadow-[0_30px_60px_rgba(0,0,0,0.8)]">

                                            {/* Angle Badge */}
                                            <div className="absolute top-6 right-6 z-30 flex items-center gap-2">
                                                <div className="px-5 py-2.5 bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl text-xs font-black text-purple-400 uppercase tracking-widest shadow-2xl">
                                                    Angle {idx + 1}
                                                </div>
                                            </div>

                                            {/* Visual Section: MASSIVE IMAGE */}
                                            <div className="relative aspect-[4/5] overflow-hidden bg-black/40">
                                                {ad.visual.generatedImageUrl ? (
                                                    <>
                                                        <img src={ad.visual.generatedImageUrl} alt="Generated Ad Image" className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover/card:scale-110" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>

                                                        <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                                                            <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 px-4 py-2 rounded-2xl">
                                                                <p className="text-[10px] font-black text-emerald-400 uppercase">Visual Style</p>
                                                                <p className="text-xs font-bold text-white uppercase italic">{ad.visual.selectedStyleName} PRO</p>
                                                            </div>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const link = document.createElement('a');
                                                                    link.href = ad.visual.generatedImageUrl!;
                                                                    link.download = `PRO_AD_${idx + 1}.png`;
                                                                    link.click();
                                                                }}
                                                                className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-3xl hover:bg-purple-500 hover:text-white transition-all hover:scale-110 active:scale-90"
                                                                title="Download Image"
                                                            >
                                                                <Download className="w-7 h-7" />
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center gap-6">
                                                        <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-purple-500 animate-spin"></div>
                                                        <div className="space-y-2">
                                                            <p className="text-xl font-black text-white italic tracking-tighter uppercase">Visualizing Assets...</p>
                                                            <p className="text-sm text-slate-500 font-bold">Agent 5 is painting the masterpiece</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content Section */}
                                            <div className="p-8 md:p-10 flex flex-col gap-8 flex-1">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-0.5 w-10 bg-orange-500"></div>
                                                        <p className="text-xs font-black text-orange-500 uppercase tracking-widest">Headline Hook</p>
                                                    </div>
                                                    <h4 className="text-2xl md:text-3xl font-black text-white leading-tight leading-tighter tracking-tight italic">
                                                        {ad.hooks[0]}
                                                    </h4>
                                                </div>

                                                <div className="space-y-4 flex-1">
                                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Marketing Copy</p>
                                                    <p className="text-lg text-slate-300 leading-relaxed font-medium line-clamp-6 bg-gradient-to-b from-slate-100 to-slate-400 bg-clip-text text-transparent">
                                                        {ad.copy.adBody}
                                                    </p>
                                                </div>

                                                <div className="bg-purple-500/10 border border-purple-500/20 p-6 rounded-[2rem] flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-[10px] text-purple-400 font-black uppercase mb-1">Conversion CTA</p>
                                                        <p className="text-xl font-black text-white italic">{ad.copy.callToAction}</p>
                                                    </div>
                                                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-xl shadow-lg shadow-purple-500/20 rotate-12">
                                                        💰
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Post-Mission Debrief: Objection Handling */}
                    {pipeline.objections.length > 0 && (
                        <div className="bg-[#050505] border border-orange-500/20 rounded-[3rem] p-12 mt-8 glass animate-in fade-in duration-1000">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                                <div>
                                    <h3 className="text-4xl font-black text-orange-400 mb-2 flex items-center gap-4">
                                        <span className="p-3 bg-orange-500/20 rounded-2xl">🛡️</span> درع الاعتراضات (Agent 6)
                                    </h3>
                                    <p className="text-slate-400 font-bold">توقع مخاوف العميل واهزمها قبل أن تظهر.</p>
                                </div>
                                <div className="text-5xl opacity-20">🥷</div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {pipeline.objections.map((obj, idx) => (
                                    <div key={idx} className="group/obj relative">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl blur opacity-0 group-hover/obj:opacity-20 transition duration-500"></div>
                                        <div className="relative bg-white/5 border border-white/5 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300">
                                            <div className="flex gap-6">
                                                <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                                                    <AlertCircle className="w-7 h-7 text-red-400" />
                                                </div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-xs font-black text-red-500 uppercase tracking-widest mb-1">خوف العميل (Objection)</p>
                                                        <p className="text-xl font-bold text-white">{obj.objection}</p>
                                                    </div>
                                                    <div className="h-0.5 w-12 bg-white/10"></div>
                                                    <div>
                                                        <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-1">الرد الساحق (The Kill)</p>
                                                        <p className="text-lg text-slate-300 font-medium leading-relaxed">{obj.rebuttal}</p>
                                                    </div>
                                                </div>
                                            </div>
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

// ============================================================================
// Enhanced Helpers
// ============================================================================

const InsightBox = ({ label, value, icon }: { label: string, value: string, icon: string }) => (
    <div className="group/insight relative">
        <div className="absolute -inset-0.5 bg-blue-500/20 rounded-3xl blur opacity-0 group-hover/insight:opacity-100 transition duration-500"></div>
        <div className="relative bg-black/40 rounded-3xl p-6 border border-white/5 hover:border-blue-500/40 transition-all duration-300 h-full">
            <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">{label}</p>
                <span className="text-xl grayscale group-hover/insight:grayscale-0 transition-all">{icon}</span>
            </div>
            <p className="text-lg font-black text-slate-100 leading-tight italic tracking-tight">{value}</p>
        </div>
    </div>
);

const Download = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const AlertCircle = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export default ProModeDashboard;
