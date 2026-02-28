import React, { useState } from 'react';
import { CampaignOrchestrator } from '../orchestrator/CampaignOrchestrator';
import { Target, Layers, ArrowRight, CheckCircle, Loader2, Sparkles, Wand2 } from 'lucide-react';

interface FunnelArchitectProps {
    dialect: string;
}

const FUNNEL_TYPES = [
    { id: 'webinar', label: 'Webinar Funnel (قمع الويبنار)', icon: '🎥', desc: 'بيع المنتجات عالية القيمة عبر لقاء مباشر' },
    { id: 'quiz', label: 'Quiz Funnel (قمع الاختبارات)', icon: '📝', desc: 'تجميع بيانات العملاء عبر اختبار تفاعلي' },
    { id: 'challenge', label: 'Challenge Funnel (قمع التحديات)', icon: '🏆', desc: 'بناء الثقة عبر تحدي لمدة 5-7 أيام' },
    { id: 'free_tool', label: 'Free Tool Funnel (قمع الأداة المجانية)', icon: '🛠️', desc: 'جذب العملاء عبر أداة أو ملف تحميل مجاني' },
] as const;

export const FunnelArchitect: React.FC<FunnelArchitectProps> = ({ dialect }) => {
    const [productName, setProductName] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [funnelType, setFunnelType] = useState<typeof FUNNEL_TYPES[number]['id']>('webinar');
    const [result, setResult] = useState<any>(null);

    const handleGenerate = async () => {
        if (!productName) return;
        setIsGenerating(true);
        try {
            const data = await CampaignOrchestrator.generateSpecializedFunnel(productName, funnelType, dialect);
            setResult(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-6">
            <header className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-blue-400 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    Advanced Funnel Architect
                </div>
                <h1 className="text-3xl font-black text-white">مهندس الأقماع البيعية الذكي 🚀</h1>
                <p className="text-slate-400">صمم مسار رحلة العميل بالكامل من الإعلان وحتى البيع النهائي بضغطة زر واحدة</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {FUNNEL_TYPES.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => setFunnelType(type.id)}
                        className={`
                            relative flex flex-col items-center text-center p-4 rounded-2xl border transition-all duration-300
                            ${funnelType === type.id
                                ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700'}
                        `}
                    >
                        <span className="text-3xl mb-3">{type.icon}</span>
                        <span className="text-sm font-bold text-white mb-1">{type.label}</span>
                        <span className="text-[10px] text-slate-500 line-clamp-2">{type.desc}</span>

                        {funnelType === type.id && (
                            <div className="absolute top-2 right-2">
                                <CheckCircle className="w-4 h-4 text-blue-500 fill-current" />
                            </div>
                        )}
                    </button>
                ))}
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-300 block">وصف المنتج أو الخدمة</label>
                    <textarea
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="مثال: كورس تدريبي لتعليم التجارة الإلكترونية للمبتدئين..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all h-24 resize-none"
                    />
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !productName}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            جاري هندسة المسار...
                        </>
                    ) : (
                        <>
                            <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            ابأ الهندسة الآن
                        </>
                    )}
                </button>
            </div>

            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Layers className="w-5 h-5 text-black" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">المسار الهندسي المقترح</h2>
                            <p className="text-xs text-slate-500">تم تخطيط المسار بناءً على استراتيجيات السوق العربي</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Stages */}
                        <div className="space-y-4">
                            {Object.entries(result).map(([key, value]: [string, any], idx) => (
                                <div key={key} className="bg-slate-950 border border-slate-900 p-5 rounded-2xl space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400">{idx + 1}</span>
                                            <h3 className="text-sm font-black text-white uppercase">{key.replace(/([A-Z])/g, ' $1')}</h3>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-700" />
                                    </div>
                                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{typeof value === 'string' ? value : JSON.stringify(value, null, 2)}</p>
                                </div>
                            ))}
                        </div>

                        {/* Visual Preview / Tips */}
                        <div className="space-y-6">
                            <div className="bg-blue-600/5 border border-blue-500/20 p-6 rounded-3xl space-y-4">
                                <h3 className="text-sm font-black text-blue-400 flex items-center gap-2">
                                    <Target className="w-4 h-4" />
                                    نصيحة الخبير لهذا المسار
                                </h3>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    هذا النوع من الأقماع يعتمد بشكل أساسي على بناء "السلطة" (Authority) في مجالك.
                                    تأكد أن سيكوينز الإيميلات/واتساب (Follow-up) لا يقل عن 5 رسائل تشرح فيها "لماذا أنت" و"لماذا الآن".
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
