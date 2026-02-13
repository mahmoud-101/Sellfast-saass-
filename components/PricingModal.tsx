
import React, { useState } from 'react';

interface PricingModalProps {
    onClose: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ onClose }) => {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

    const plans = [
        { 
            id: 'starter',
            name: 'باقة المبتدئ (Starter)', 
            price: '450', 
            credits: '500', 
            color: 'border-white/10', 
            bg: 'bg-white/5', 
            features: ['500 نقطة ذكاء اصطناعي', 'توليد صور 2K', 'دعم فني عبر البريد', 'صلاحية لمدة سنة'] 
        },
        { 
            id: 'pro',
            name: 'باقة المحترفين (Pro)', 
            price: '1200', 
            credits: '1500', 
            color: 'border-indigo-500/50', 
            bg: 'bg-indigo-500/10', 
            popular: true, 
            features: ['1500 نقطة (توفير 150 ج.م)', 'توليد صور 4K وسوبر UGC', 'أولوية في طابور المعالجة', 'دعم فني واتساب مباشر'] 
        },
        { 
            id: 'business',
            name: 'باقة الشركات (Business)', 
            price: '3500', 
            credits: '5000', 
            color: 'border-emerald-500/40', 
            bg: 'bg-emerald-500/5', 
            features: ['5000 نقطة (توفير 1000 ج.م)', 'وصول لمحرك الفيديو Veo', 'تصدير تقارير PDF احترافية', 'مدير حساب مخصص'] 
        },
        { 
            id: 'enterprise',
            name: 'باقة الوكالات (Enterprise)', 
            price: '7200', 
            credits: '12000', 
            color: 'border-purple-500/40', 
            bg: 'bg-purple-500/5', 
            features: ['12,000 نقطة (أفضل قيمة)', 'لوحة تحكم لإدارة الفريق', 'أعلى سرعة رندرة فيديوهات', 'رخصة تجارية شاملة'] 
        },
    ];

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-300 overflow-y-auto">
            <div className="glass-card w-full max-w-6xl rounded-[4rem] p-8 md:p-14 border border-white/10 shadow-[0_0_150px_rgba(99,102,241,0.15)] relative my-8">
                <button onClick={onClose} className="absolute top-10 right-10 text-white/40 hover:text-white transition-all p-3 bg-white/5 rounded-full z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="text-center mb-16 space-y-4">
                    <div className="inline-block px-4 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4">Commercial Licenses 2025</div>
                    <h2 className="text-6xl font-black text-white tracking-tighter">اختر محرك نموك</h2>
                    <p className="text-white/40 font-medium text-xl">اشحن رصيد نقاطك الآن واستخدم كافة أدوات الذكاء الاصطناعي</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {plans.map((plan, i) => (
                        <div key={i} className={`relative flex flex-col p-8 rounded-[3rem] border transition-all duration-500 hover:scale-[1.03] ${plan.color} ${plan.bg} ${plan.popular ? 'ring-4 ring-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.3)]' : ''}`}>
                            {plan.popular && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl animate-bounce">الأكثر شهرة 🔥</div>
                            )}
                            <div className="text-right space-y-4 mb-8">
                                <h3 className="text-xl font-black text-white leading-tight min-h-[50px]">{plan.name}</h3>
                                <div className="flex flex-col">
                                    <span className="text-5xl font-black text-white">{plan.price} <span className="text-sm text-white/30 font-bold">ج.م</span></span>
                                </div>
                                <div className="py-2.5 px-5 bg-white/5 rounded-2xl inline-block text-indigo-400 font-black text-sm border border-white/5">
                                    {plan.credits} نقطة (Credit)
                                </div>
                            </div>
                            <ul className="space-y-4 mb-10 flex-grow border-t border-white/5 pt-8">
                                {plan.features.map((f, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-[12px] text-white/60 font-bold justify-end leading-relaxed">
                                        {f} <span className="text-emerald-500 mt-1">✔</span>
                                    </li>
                                ))}
                            </ul>
                            <button 
                                onClick={() => setSelectedPlan(plan.name)}
                                className={`w-full py-5 rounded-[1.5rem] text-center font-black text-sm transition-all shadow-2xl ${plan.popular ? 'bg-indigo-500 text-white hover:bg-indigo-600' : 'bg-white text-black hover:bg-gray-100'}`}
                            >
                                اشحن الآن
                            </button>
                        </div>
                    ))}
                </div>

                {/* Billing Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center bg-white/5 rounded-[3.5rem] p-10 border border-white/5">
                    <div className="space-y-8 text-right">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white">وسائل الدفع المتاحة (داخل مصر)</h3>
                            <p className="text-white/40 text-sm font-medium">اختر الوسيلة الأنسب لك، وبعد التحويل أرسل صورة الإيصال لتفعيل النقاط فوراً.</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 justify-end">
                            <div className="px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-4 group transition-all cursor-pointer">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">فودافون كاش</p>
                                    <p className="text-xl font-black text-white tracking-widest">01090624823</p>
                                </div>
                                <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-red-500/20">📱</div>
                            </div>
                            <div className="px-6 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center gap-4 group transition-all cursor-pointer">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">معرف InstaPay</p>
                                    <p className="text-xl font-black text-white">ebdaapro@instapay</p>
                                </div>
                                <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20">💸</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-6">
                        <div className="text-center p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl w-full">
                            <p className="text-white/60 text-sm font-black mb-2 uppercase">تأكيد العملية</p>
                            <h4 className="text-white font-bold">{selectedPlan ? `تم اختيار: ${selectedPlan}` : 'لم يتم اختيار باقة بعد'}</h4>
                        </div>
                        <a 
                            href={`https://wa.me/201090624823?text=مرحباً، أريد شحن رصيد ${selectedPlan || 'باقة Pro'} في إبداع برو`} 
                            target="_blank"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white w-full py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 shadow-2xl transition-all hover:scale-105 active:scale-95"
                        >
                            تأكيد التحويل عبر الواتساب
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12.012 2c-5.508 0-9.987 4.479-9.987 9.988 0 1.757.455 3.409 1.251 4.849l-1.332 4.86 4.975-1.304c1.404.757 2.997 1.189 4.693 1.189 5.508 0 9.988-4.479 9.988-9.988 0-5.508-4.48-9.988-9.988-9.988zm6.541 14.156c-.285.802-1.454 1.459-2.003 1.558-.49.088-1.127.159-1.808-.159-2.883-1.343-4.706-4.321-4.851-4.512-.144-.191-1.171-1.554-1.171-2.96 0-1.406.738-2.097 1-2.39.262-.293.571-.366.762-.366.191 0 .381.001.547.009.176.009.414-.066.649.492.235.558.802 1.956.872 2.1.07.144.117.311.023.498-.094.187-.141.311-.282.47-.141.159-.297.355-.424.476-.141.134-.288.28-.124.558.164.278.728 1.199 1.562 1.933.1.088.192.13.284.13.111 0 .216-.051.31-.137.288-.266.63-.687.9-.993.271-.306.495-.257.778-.152.282.105 1.79.845 2.097.998.307.153.511.228.586.356.075.127.075.736-.21 1.538z"/></svg>
                        </a>
                    </div>
                </div>

                <div className="mt-16 text-center border-t border-white/5 pt-12">
                    <p className="text-xs font-black text-white/20 uppercase tracking-[0.5em]">Ebdaa Pro Intelligent Financial Systems © 2025</p>
                </div>
            </div>
        </div>
    );
};

export default PricingModal;
