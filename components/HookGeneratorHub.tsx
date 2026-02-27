import React, { useState } from 'react';
import { generateStandaloneHooks } from '../services/geminiService';
import { Sparkles, Copy, CheckCircle2, ChevronRight, AlertCircle, RefreshCw, Zap } from 'lucide-react';

interface HookTemplate {
    category: string;
    text: string;
    explanation: string;
}

export const HookGeneratorHub: React.FC = () => {
    const [productInfo, setProductInfo] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [hooks, setHooks] = useState<HookTemplate[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleGenerate = async () => {
        if (!productInfo.trim()) {
            setError('أدخل وصف المنتج أولاً');
            return;
        }

        try {
            setIsGenerating(true);
            setError(null);
            const res = await generateStandaloneHooks(productInfo);

            if (res && res.hooks && Array.isArray(res.hooks)) {
                setHooks(res.hooks);
            } else {
                throw new Error("تنسيق الاستجابة غير صحيح من الذكاء الاصطناعي");
            }
        } catch (e: any) {
            console.error(e);
            setError(e.message || 'حدث خطأ أثناء توليد الهوكات');
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const categories = Array.from(new Set(hooks.map(h => h.category)));

    const getCategoryColor = (cat: string) => {
        const map: any = {
            'Pain': 'text-red-400 bg-red-500/10 border-red-500/20',
            'Desire': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            'Mystery': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
            'Objection': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
            'Curiosity': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        };
        return map[cat] || 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 font-cairo" dir="rtl">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4 pt-12">
                    <div className="inline-flex items-center justify-center p-3 bg-purple-500/10 rounded-2xl mb-4">
                        <Zap className="w-8 h-8 text-purple-400" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                        استوديو خطافات الانتباه <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">(Hooks)</span>
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        أنتج عشرات الهوكات الإعلانية الجذابة لمنصات (تيك توك، فيسبوك، انستجرام) بضغطة زر.
                    </p>
                </div>

                {/* Input Section */}
                <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -z-10 animate-pulse"></div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">وصف المنتج أو تفاصيل العرض 🔗</label>
                            <textarea
                                value={productInfo}
                                onChange={e => setProductInfo(e.target.value)}
                                placeholder="مثال: سماعة بلوتوث رياضية ضد المية وبطارية بتعيش 12 ساعة بسعر 499 بدل 800 لفترة محدودة..."
                                className="w-full h-32 bg-black/50 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all resize-none text-lg"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-sm font-bold">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-black text-lg transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group mx-auto"
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw className="w-6 h-6 animate-spin" />
                                    <span>جاري اصطياد الأفكار...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                    <span>توليد الهوكات السحرية</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Output Section */}
                {hooks.length > 0 && !isGenerating && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <h2 className="text-2xl font-black flex items-center gap-3">
                            <span className="text-4xl">🎣</span>
                            حصيلة الصيد ({hooks.length} هوك)
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {categories.map(category => (
                                <div key={category} className="space-y-4">
                                    <div className="flex items-center gap-2 text-lg font-bold border-b border-white/10 pb-2">
                                        <span className={`px-3 py-1 rounded-lg text-sm border ${getCategoryColor(category)}`}>
                                            {category}
                                        </span>
                                        <span className="text-slate-300">
                                            {category === 'Pain' ? 'اللعب على الألم' :
                                                category === 'Desire' ? 'إثارة الرغبة' :
                                                    category === 'Mystery' ? 'صناعة الغموض' :
                                                        category === 'Objection' ? 'هدم الاعتراضات والتحدي' : category}
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        {hooks.filter(h => h.category === category).map((hook, idx) => (
                                            <div key={idx} className="bg-[#151515] hover:bg-[#1a1a1a] border border-white/5 hover:border-purple-500/30 rounded-2xl p-5 transition-all group relative">
                                                <div className="pl-10">
                                                    <p className="text-xl font-bold leading-relaxed text-white mb-3 bg-gradient-to-l from-white to-slate-300 bg-clip-text text-transparent">
                                                        "{hook.text}"
                                                    </p>
                                                    <p className="text-sm text-slate-500 flex items-start gap-2">
                                                        <ChevronRight className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                                                        <span>{hook.explanation}</span>
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => copyToClipboard(hook.text, idx)}
                                                    className={`absolute top-4 left-4 p-2 rounded-xl transition-all ${copiedIndex === idx ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-purple-500/20'}`}
                                                    title="نسخ الهوك"
                                                >
                                                    {copiedIndex === idx ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
