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
        <div className="flex flex-col gap-8 animate-in fade-in duration-300 pb-20 max-w-7xl mx-auto p-4" dir="rtl">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900/40 to-black border border-purple-500/20 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full"></div>

                <div className="relative z-10 flex gap-6 items-center">
                    <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                        🤖
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">الوضع الاحترافي <span className="text-purple-400">Pro Mode</span></h1>
                        <p className="text-slate-400 text-sm">6 عملاء ذكاء اصطناعي (Agents) يعملون معاً لتحليل وبناء إعلانك من الصفر.</p>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left/Main Column: Input Form */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-[#0f1219] border border-white/5 rounded-3xl p-6 shadow-xl">
                        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><span>📦</span> بيانات المنتج</h2>

                        <div className="space-y-4">
                            {/* Image Upload */}
                            <div>
                                <label className="text-xs text-slate-400 font-bold mb-1 block">صورة المنتج الحقيقية</label>
                                <div className="flex items-center gap-4">
                                    <div className={`w-24 h-24 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors ${productImage ? 'border-purple-500/50' : 'border-white/20 hover:border-white/40'}`}>
                                        {productImage ? (
                                            <img src={productImage} alt="Product" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-2xl opacity-50">📸</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500/10 file:text-purple-400 hover:file:bg-purple-500/20"
                                        />
                                        <p className="text-[10px] text-slate-500 mt-2">عشان Agent 5 يبني فوقها التصميم</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-slate-400 font-bold mb-1 block">اسم المنتج</label>
                                <input
                                    type="text"
                                    value={productForm.name}
                                    onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500/60 transition-colors"
                                    placeholder="مثال: سماعة ايربودز برو"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 font-bold mb-1 block">السعر (اختياري)</label>
                                <input
                                    type="text"
                                    value={productForm.price}
                                    onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500/60 transition-colors"
                                    placeholder="مثال: 499 جنيه بدلاً من 800"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 font-bold mb-1 block">شرح وتفاصيل المنتج</label>
                                <textarea
                                    value={productForm.description}
                                    onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                                    className="w-full h-32 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500/60 transition-colors resize-none"
                                    placeholder="اكتب كل مميزات المنتج هنا..."
                                />
                            </div>

                            <button
                                onClick={startPipeline}
                                disabled={pipeline.status !== 'idle' && pipeline.status !== 'completed' && pipeline.status !== 'error'}
                                className="w-full mt-4 bg-purple-600 hover:bg-purple-500 text-white px-6 py-4 rounded-xl font-black text-lg transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {pipeline.status === 'idle' || pipeline.status === 'completed' || pipeline.status === 'error' ? (
                                    <><span>🚀</span> إطلاق فريق العمل (Start Pipeline)</>
                                ) : (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>جاري العمل...</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Pipeline Status Indicator */}
                    <div className="bg-[#0f1219] border border-white/5 rounded-3xl p-6 shadow-xl">
                        <h2 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-widest text-center">حالة العملاء الستة (Agents)</h2>
                        <div className="space-y-3">
                            <StatusRow label="1. Market Analyzer" status={pipeline.status === 'idle' ? 'pending' : (['analyzing'].includes(pipeline.status) ? 'active' : 'done')} />
                            <StatusRow label="2. Angle Strategist" status={['idle', 'analyzing'].includes(pipeline.status) ? 'pending' : (['strategizing'].includes(pipeline.status) ? 'active' : 'done')} />
                            <StatusRow label="3. Hook Writer" status={['idle', 'analyzing', 'strategizing'].includes(pipeline.status) ? 'pending' : (['hooking'].includes(pipeline.status) ? 'active' : 'done')} />
                            <StatusRow label="4. Direct Copywriter" status={['idle', 'analyzing', 'strategizing', 'hooking'].includes(pipeline.status) ? 'pending' : (['copywriting'].includes(pipeline.status) ? 'active' : 'done')} />
                            <StatusRow label="5. Visual Director & Validator" status={['idle', 'analyzing', 'strategizing', 'hooking', 'copywriting'].includes(pipeline.status) ? 'pending' : (['visualizing'].includes(pipeline.status) ? 'active' : 'done')} />
                            <StatusRow label="6. Objection Handler" status={['idle', 'analyzing', 'strategizing', 'hooking', 'copywriting', 'visualizing'].includes(pipeline.status) ? 'pending' : (['objections'].includes(pipeline.status) ? 'active' : 'done')} />
                        </div>
                    </div>
                </div>

                {/* Right Column: Output & Results */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    {pipeline.error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-bold">
                            ⚠️ {pipeline.error}
                        </div>
                    )}

                    {/* Show Market Analysis */}
                    {pipeline.marketAnalysis && (
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-3xl p-6 animate-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-blue-400 font-black mb-4 flex items-center gap-2"><span>📊</span> Agent 1: Market Analysis</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <InsightBox label="الجمهور المستهدف" value={pipeline.marketAnalysis.targetAudience} />
                                <InsightBox label="الرغبة العميقة" value={pipeline.marketAnalysis.coreDesire} />
                                <InsightBox label="الألم الأكبر" value={pipeline.marketAnalysis.biggestPain} />
                            </div>
                        </div>
                    )}

                    {/* Show Generated Ads */}
                    {pipeline.finalAds.length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-purple-400 font-black text-xl flex items-center gap-2"><span>🔥</span> الإعلانات النهائية (Angles)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pipeline.finalAds.map((ad, idx) => (
                                    <div key={idx} className="bg-[#151923] border border-white/5 rounded-3xl overflow-hidden shadow-2xl hover:border-purple-500/30 transition-colors flex flex-col">

                                        <div className="p-4 bg-purple-500/10 border-b border-purple-500/10">
                                            <p className="text-[10px] text-purple-400 font-black uppercase mb-1">Angle {idx + 1}: {ad.angle.id}</p>
                                            <h4 className="text-white font-bold text-sm">{ad.angle.title}</h4>
                                        </div>

                                        <div className="p-5 flex-1 flex flex-col gap-4">
                                            <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                                                <p className="text-[10px] text-slate-500 mb-2">🔥 أفضل هوك</p>
                                                <p className="text-sm font-bold text-orange-400 leading-relaxed">{ad.hooks[0]}</p>
                                            </div>

                                            <div className="flex-1">
                                                <p className="text-[10px] text-slate-500 mb-2">📝 محتوى الإعلان</p>
                                                <p className="text-xs text-slate-300 leading-loose line-clamp-4 whitespace-pre-wrap">{ad.copy.adBody}</p>
                                            </div>

                                            <div className="bg-blue-500/5 rounded-xl border border-blue-500/10 mt-auto overflow-hidden flex flex-col">
                                                <div className="p-3 pb-2 flex items-center justify-between">
                                                    <p className="text-[10px] text-blue-400 font-bold flex items-center gap-1"><span>🎨</span> تصميم تم توليده بالذكاء الاصطناعي</p>
                                                    <span className="text-[9px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">جاهز للتحميل</span>
                                                </div>
                                                {ad.visual.generatedImageUrl ? (
                                                    <div className="w-full aspect-[4/5] bg-black/50 relative group overflow-hidden">
                                                        <img src={ad.visual.generatedImageUrl} alt="Generated Ad Image" className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 group-hover:scale-105" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const link = document.createElement('a');
                                                                    link.href = ad.visual.generatedImageUrl!;
                                                                    link.download = `ad_creative_${idx + 1}.png`;
                                                                    link.click();
                                                                }}
                                                                className="bg-white text-black px-4 py-2 rounded-xl text-xs font-bold hover:scale-105 transition-transform"
                                                            >
                                                                تحميل الصورة ⬇️
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-full aspect-[4/5] bg-black/50 flex flex-col items-center justify-center p-4 text-center gap-3 border-t border-white/5">
                                                        <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin"></div>
                                                        <p className="text-[10px] text-slate-400">جاري المعالجة...</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-3 bg-white/5 mx-4 mb-4 rounded-xl">
                                            <p className="text-xs text-center text-emerald-400 font-bold">{ad.copy.callToAction}</p>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Show Objection Handling */}
                    {pipeline.objections.length > 0 && (
                        <div className="bg-orange-500/5 border border-orange-500/20 rounded-3xl p-6 mt-4 animate-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-orange-400 font-black mb-4 flex items-center gap-2"><span>🛡️</span> Agent 6: Objection Handling (الأسئلة الشائعة)</h3>
                            <div className="space-y-3">
                                {pipeline.objections.map((obj, idx) => (
                                    <div key={idx} className="bg-black/40 rounded-xl p-4 border border-white/5">
                                        <p className="text-sm font-bold text-white mb-2"><span className="text-red-400">العميل:</span> {obj.objection}</p>
                                        <p className="text-sm text-slate-300"><span className="text-emerald-400">الرد:</span> {obj.rebuttal}</p>
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
// Helpers
// ============================================================================

const StatusRow = ({ label, status }: { label: string, status: 'pending' | 'active' | 'done' }) => {
    return (
        <div className="flex items-center justify-between bg-black/30 rounded-lg px-4 py-2.5 border border-white/5">
            <span className={`text-xs font-bold ${status === 'active' ? 'text-white' : 'text-slate-500'} ${status === 'done' ? 'text-emerald-400' : ''}`}>{label}</span>
            {status === 'pending' && <span className="text-[10px] text-slate-600">Pending...</span>}
            {status === 'active' && <div className="w-3 h-3 bg-purple-500 rounded-full animate-ping"></div>}
            {status === 'done' && <span className="text-emerald-400">✓</span>}
        </div>
    );
}

const InsightBox = ({ label, value }: { label: string, value: string }) => (
    <div className="bg-black/30 rounded-xl p-3 border border-white/5">
        <p className="text-[10px] text-slate-500 mb-1">{label}</p>
        <p className="text-xs font-bold text-slate-200">{value}</p>
    </div>
);

export default ProModeDashboard;
