import React from 'react';
import { Rocket, Sparkles, Target, Zap, ArrowLeft, ArrowRight } from 'lucide-react';

interface GettingStartedWizardProps {
    onSelectPath: (view: string) => void;
    onClose: () => void;
}

const GettingStartedWizard: React.FC<GettingStartedWizardProps> = ({ onSelectPath, onClose }) => {
    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-4xl glass-card rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl flex flex-col md:flex-row">
                {/* Visual Side */}
                <div className="md:w-1/3 bg-gradient-to-br from-purple-600 to-indigo-900 p-10 flex flex-col justify-between text-white border-r border-white/10">
                    <div>
                        <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-4xl mb-6 border border-white/20 shadow-xl">
                            🚀
                        </div>
                        <h2 className="text-3xl font-black mb-4 tracking-tighter uppercase italic">ابدأ رحلتك بجنون!</h2>
                        <p className="text-purple-200 text-sm font-bold leading-relaxed">إبداع برو مش مجرد أدوات، ده "شريك نجاح" بيفكر معاك.</p>
                    </div>
                    <div className="text-[10px] uppercase font-black tracking-widest opacity-50">
                        Built for visionaries & entrepreneurs
                    </div>
                </div>

                {/* Path Selection Side */}
                <div className="flex-1 p-10 md:p-14 bg-black/40 space-y-10 text-right" dir="rtl">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-black text-white">إنت هنا النهاردة علشان إيه؟</h3>
                        <p className="text-slate-400 font-bold">اختار المسار المناسب لهدفك دلوقتي ونوجهك لأقوى أداة:</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {/* Path 1: Ads */}
                        <button
                            onClick={() => { onSelectPath('pro_mode'); onClose(); }}
                            className="group p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all flex items-center justify-between text-right"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                    🔥
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-white">عايز مبيعات سريعة (إعلانات ممولة)</h4>
                                    <p className="text-xs text-slate-500 font-bold mt-1">هنطلع لك 5 إعلانات كاملة (صور ونصوص واستهداف) بضغطة زر.</p>
                                </div>
                            </div>
                            <ArrowLeft className="text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>

                        {/* Path 2: Organic */}
                        <button
                            onClick={() => { onSelectPath('organic_studio'); onClose(); }}
                            className="group p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all flex items-center justify-between text-right"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                    🌿
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-white">عايز براند قوي (انتشار مجاني)</h4>
                                    <p className="text-xs text-slate-500 font-bold mt-1">استراتيجية "محتوى فيروسي" وبوستات وسكريبتات ريلز بتشد الناس.</p>
                                </div>
                            </div>
                            <ArrowLeft className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>

                        {/* Path 3: UGC */}
                        <button
                            onClick={() => { onSelectPath('ugc_studio'); onClose(); }}
                            className="group p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all flex items-center justify-between text-right"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                    📸
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-white">عايز أصور منتجاتي باحترافية</h4>
                                    <p className="text-xs text-slate-500 font-bold mt-1">هنحول صور منتجك العادية لصور دعائية عالمية في ثواني.</p>
                                </div>
                            </div>
                            <ArrowLeft className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>

                    <div className="flex justify-between items-center pt-6 border-t border-white/5">
                        <button onClick={onClose} className="text-sm font-black text-slate-500 hover:text-white transition-colors">مش دلوقتي، محتاج استكشف لوحدي</button>
                        <div className="flex gap-1">
                            {[1, 2, 3].map(i => <div key={i} className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-purple-500' : 'bg-white/10'}`}></div>)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GettingStartedWizard;
