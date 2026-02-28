import React, { useState } from 'react';
import { CampaignOrchestrator } from '../orchestrator/CampaignOrchestrator';
import { Target, Layers, ArrowRight, CheckCircle, Loader2, Sparkles, Wand2 } from 'lucide-react';

interface FunnelArchitectProps {
    dialect: string;
}

const FUNNEL_TYPES = [
    { id: 'webinar', label: 'خطة الويبنار (محاضرة بيع)', icon: '🎥', desc: 'بيع المنتجات الغالية عن طريق محاضرة مباشرة' },
    { id: 'quiz', label: 'خطة الاختبار (كويز)', icon: '📝', desc: 'افهم زبونك أكتر واجمع بياناته عن طريق أسئلة' },
    { id: 'challenge', label: 'خطة التحدي', icon: '🏆', desc: 'اكسب ثقة الناس عن طريق تحدي لمدة أسبوع' },
    { id: 'free_tool', label: 'خطة الهدية المجانية', icon: '🛠️', desc: 'اجذب الزباين عن طريق ملف أو أداة مجانية' },
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
                    Smart Sales Plan
                </div>
                <h1 className="text-3xl font-black text-white">خطة البيع العبقرية 🚀</h1>
                <p className="text-slate-400">رتب خطوات البيع من أول الإعلان لحد ما الفلوس تدخل جيبك</p>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {FUNNEL_TYPES.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => setFunnelType(type.id)}
                        className={`
                            relative flex flex-col items-center text-center p-6 rounded-[2rem] border transition-all duration-500 group/type
                            ${funnelType === type.id
                                ? 'bg-gradient-to-b from-blue-500/10 to-transparent border-blue-500/50 shadow-[0_10px_30px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20'
                                : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'}
                        `}
                    >
                        <span className={`text-4xl mb-3 transition-transform duration-500 ${funnelType === type.id ? 'scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'grayscale group-hover/type:grayscale-0'}`}>{type.icon}</span>
                        <span className={`text-xs font-black mb-1 ${funnelType === type.id ? 'text-blue-400' : 'text-slate-400'}`}>{type.label}</span>
                        <span className="text-[9px] text-slate-500 leading-tight hidden md:block">{type.desc}</span>

                        {funnelType === type.id && (
                            <div className="absolute -top-1 -right-1">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                </span>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-300 block">اشرح منتجك أو خدمتك بالتفصيل</label>
                    <textarea
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="مثال: كورس لتعليم التجارة الإلكترونية للمبتدئين..."
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
                            دقيقة وبجهز لك الخطة...
                        </>
                    ) : (
                        <>
                            <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            يلا وريني الخطة 🚀
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
                            <h2 className="text-xl font-bold text-white">ترتيب الخطوات اللي هتمشي عليها</h2>
                            <p className="text-xs text-slate-500">الخطة دي معمولة بدقة لجمهورك في السوق العربي</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-20 gap-10">
                        {/* Timeline Flow */}
                        <div className="lg:col-span-12 space-y-12 relative">
                            {/* Vertical Line */}
                            <div className="absolute right-[19px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-blue-500/50 via-blue-500/20 to-transparent hidden md:block"></div>

                            {Object.entries(result).map(([key, value]: [string, any], idx) => (
                                <div key={key} className="relative pr-0 md:pr-14 animate-in slide-in-from-right-10 duration-700" style={{ animationDelay: `${idx * 150}ms` }}>
                                    {/* Timeline Dot */}
                                    <div className="absolute right-0 top-6 w-10 h-10 rounded-full bg-[#050505] border-2 border-blue-500/50 flex items-center justify-center z-10 hidden md:flex shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                                        <span className="text-blue-400 text-xs font-black">{idx + 1}</span>
                                    </div>

                                    <div className="group relative">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-transparent rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                        <div className="relative bg-[#0a0a0e] border border-white/5 p-8 rounded-3xl group-hover:border-blue-500/30 transition-all duration-300">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                                    <span className="md:hidden w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-400">{idx + 1}</span>
                                                    {key.replace(/([A-Z])/g, ' $1')}
                                                </h3>
                                                <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-slate-500 border border-white/5">Step {idx + 1}</div>
                                            </div>
                                            <p className="text-base text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">{typeof value === 'string' ? value : JSON.stringify(value, null, 2)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Strategy Sidebar */}
                        <div className="lg:col-span-8 flex flex-col gap-6">
                            <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/5 border border-blue-500/20 p-8 rounded-[2.5rem] space-y-6 sticky top-8 glass">
                                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center text-3xl shadow-inner">💡</div>
                                <h3 className="text-xl font-black text-blue-400 flex items-center gap-2">
                                    نصيحة علشان تبيع أكتر
                                </h3>
                                <p className="text-base text-slate-300 leading-relaxed font-medium">
                                    النوع ده من الخطط بيعتمد أساساً على إنك تبني "هيبتك" (Authority) في مجالك.
                                    تأكد إن رسايل المتابعة (Follow-up) على الإيميل أو الواتساب متقلش عن 5 رسايل بتوضح فيها "ليه أنت؟" و "ليه دلوقتي؟".
                                </p>
                                <div className="pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-3 text-xs font-bold text-emerald-400">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        جاهز للاستخدام في إعلاناتك
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
