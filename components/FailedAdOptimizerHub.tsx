import React, { useState } from 'react';
import { AlertCircle, ArrowRight, BrainCircuit, CheckCircle2, Copy, Flame, MessageSquare, Sparkles, Target, Zap, Stethoscope, RefreshCw, Send } from 'lucide-react';
import { optimizeFailedAd } from '../services/geminiService';
import { deductCredits, CREDIT_COSTS } from '../lib/supabase';

interface AdVariation {
    strategy: string;
    hook: string;
    body: string;
    cta: string;
}

interface DiagnosisResult {
    diagnosis: string;
    severity: 'Critical' | 'Medium' | 'Low';
    rootCause: string;
    variations: AdVariation[];
}

interface FailedAdOptimizerHubProps {
    userId: string;
}

export const FailedAdOptimizerHub: React.FC<FailedAdOptimizerHubProps> = ({ userId }) => {
    const [adCopy, setAdCopy] = useState('');
    const [productContext, setProductContext] = useState('');
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [result, setResult] = useState<DiagnosisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleAnalyze = async () => {
        if (!adCopy.trim()) {
            setError('أدخل النص الإعلاني الفاشل أولاً');
            return;
        }

        setIsSynthesizing(true);
        setError(null);
        try {
            // Credit Deduction
            const success = await deductCredits(userId, CREDIT_COSTS.COPYWRITING);
            if (!success) {
                setError('عفواً، رصيدك غير كافٍ. يرجى شحن الرصيد للمتابعة.');
                setIsSynthesizing(false);
                return;
            }

            const res = await optimizeFailedAd(adCopy, productContext);
            if (res && res.diagnosis && Array.isArray(res.variations)) {
                setResult(res as DiagnosisResult);
            } else {
                throw new Error('فشل في تحليل الرد من الذكاء الاصطناعي');
            }
        } catch (e: any) {
            console.error(e);
            setError(e.message || 'حدث خطأ أثناء فحص الإعلان');
        } finally {
            setIsSynthesizing(false);
        }
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 font-cairo" dir="rtl">
            <div className="max-w-5xl mx-auto space-y-8 pt-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-3 bg-red-500/10 rounded-2xl mb-4">
                        <Stethoscope className="w-8 h-8 text-red-400" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                        مستشفى الإعلانات <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">الفاشلة</span>
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        إعلانك بيصرف ومبيجيبش مبيعات؟ دخله العمليات هنا والذكاء الاصطناعي هيشخص المشكلة ويكتبلك 3 نسخ منقذة للكسر!
                    </p>
                </div>

                {/* Input Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col h-full">
                        <label className="block text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                            <span className="text-xl">💔</span> الإعلان المريض (Copy)
                        </label>
                        <textarea
                            value={adCopy}
                            onChange={e => setAdCopy(e.target.value)}
                            placeholder="انسخ اعلانك اللي مش شغال هنا..."
                            className="w-full flex-grow min-h-[150px] bg-black/50 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all resize-none mb-4"
                        />
                    </div>

                    <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col h-full">
                        <label className="block text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                            <span className="text-xl">💡</span> سياق إضافي عن المنتج (اختياري)
                        </label>
                        <textarea
                            value={productContext}
                            onChange={e => setProductContext(e.target.value)}
                            placeholder="اكتب تفاصيل إضافية عن منتجك، سعره، ميزته التنافسية عشان الموديل يفهم أكتر..."
                            className="w-full flex-grow min-h-[150px] bg-black/50 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all resize-none mb-4"
                        />
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-sm font-bold animate-in fade-in">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="flex justify-center">
                    <button
                        onClick={handleAnalyze}
                        disabled={isSynthesizing}
                        className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-xl font-black text-lg transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 overflow-hidden relative group/btn"
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>

                        {isSynthesizing ? (
                            <>
                                <RefreshCw className="w-6 h-6 animate-spin" />
                                <span>جاري تشخيص الإعلان وإنعاشه...</span>
                            </>
                        ) : (
                            <>
                                <Send className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
                                <span>شخّص وعالج الإعلان فوراً 💉</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Output Section */}
                {result && !isSynthesizing && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Diagnosis */}
                        <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6 relative overflow-hidden">
                            <div className={`absolute top-0 right-0 w-2 h-full ${result.severity === 'Critical' ? 'bg-red-600' :
                                    result.severity === 'Medium' ? 'bg-orange-500' : 'bg-yellow-400'
                                }`}></div>

                            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                <h3 className="text-xl font-black text-red-400 flex items-center gap-2">
                                    <span>⚠️</span> تقرير التشخيص الطبي
                                </h3>
                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${result.severity === 'Critical' ? 'bg-red-600 text-white animate-pulse' :
                                        result.severity === 'Medium' ? 'bg-orange-500 text-white' : 'bg-yellow-400 text-black'
                                    }`}>
                                    {result.severity === 'Critical' ? 'حالة حرجة' :
                                        result.severity === 'Medium' ? 'حالة متوسطة' : 'حالة بسيطة'}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-1">السبب الجذري للمشكلة:</p>
                                    <p className="text-lg font-black text-white">{result.rootCause}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-1">التحليل الطبي المفصل:</p>
                                    <p className="text-md text-red-100/80 leading-relaxed font-semibold">
                                        {result.diagnosis}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Variations */}
                        <div className="space-y-6">
                            <h3 className="text-2xl font-black flex items-center gap-3">
                                <span className="text-4xl">💊</span>
                                الروشتة: 3 نسخ إعلانية مُعالجة
                            </h3>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {result.variations.map((variation, idx) => (
                                    <div key={idx} className="bg-[#151515] border border-white/5 hover:border-orange-500/30 rounded-3xl p-6 transition-all relative flex flex-col shadow-xl">
                                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-orange-400 to-red-600 rounded-full flex items-center justify-center font-black text-white text-sm shadow-lg border-2 border-[#151515]">
                                            {idx + 1}
                                        </div>

                                        <div className="mb-6">
                                            <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                                                استراتيجية: {variation.strategy}
                                            </span>
                                        </div>

                                        <div className="space-y-4 flex-grow">
                                            <div>
                                                <p className="text-[10px] text-slate-500 mb-1 font-bold tracking-widest uppercase">الجملة الافتتاحية (Hook)</p>
                                                <p className="text-lg font-black text-white leading-snug">{variation.hook}</p>
                                            </div>
                                            <div className="pt-2 border-t border-white/5">
                                                <p className="text-[10px] text-slate-500 mb-1 font-bold tracking-widest uppercase">جسم الإعلان (Body)</p>
                                                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{variation.body}</p>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-white/5">
                                            <p className="text-[10px] text-slate-500 mb-1 font-bold tracking-widest uppercase">الطلب (Call To Action)</p>
                                            <p className="text-sm font-bold text-emerald-400">{variation.cta}</p>
                                        </div>

                                        <button
                                            onClick={() => copyToClipboard(`الهوك: ${variation.hook}\n\nالإعلان: \n${variation.body}\n\nالطلب: ${variation.cta}`, idx)}
                                            className={`w-full mt-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${copiedIndex === idx ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'}`}
                                        >
                                            {copiedIndex === idx ? (
                                                <>
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    <span>تم نسخ الروشتة</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-5 h-5" />
                                                    <span>نسخ الإعلان بالكامل</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
