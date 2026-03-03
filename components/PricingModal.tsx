
import React, { useState } from 'react';
import { createPaymentRequest } from '../lib/supabase';

interface PricingModalProps {
    onClose: () => void;
    userId: string;
}

const PricingModal: React.FC<PricingModalProps> = ({ onClose, userId }) => {
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isYearly, setIsYearly] = useState(false);

    const plans = [
        {
            id: 'starter',
            name: 'Starter',
            nameAr: 'المبتدئ',
            monthlyPrice: 0,
            yearlyPrice: 0,
            isFree: true,
            color: 'border-white/10',
            bg: 'bg-white/[0.03]',
            icon: '🚀',
            features: [
                '5 عمليات توليد شهرياً',
                '3 أدوات أساسية فقط',
                'علامة مائية على الصور',
                'دعم فني بالبريد',
            ],
            limits: { generations: 5, images: 2, tools: 3 },
        },
        {
            id: 'pro',
            name: 'Pro',
            nameAr: 'الاحترافي',
            monthlyPrice: 59,
            yearlyPrice: 590,
            popular: true,
            color: 'border-[#FFD700]/50',
            bg: 'bg-gradient-to-b from-[#FFD700]/10 to-[#FFD700]/[0.02]',
            icon: '⚡',
            features: [
                'توليد نصوص غير محدود',
                '100 صورة AI شهرياً',
                'كل الـ 66 أداة متاحة',
                '13 قالب بصري ديناميكي',
                '6 Copywriting Frameworks',
                '5 زوايا إعلانية لكل منتج',
                'مولد هوكات وسكريبتات',
                'خطة محتوى 7 أيام',
                'تحليل سوق بالذكاء الاصطناعي',
                'دعم واتساب أولوية',
            ],
            limits: { generations: -1, images: 100, tools: 66 },
        },
        {
            id: 'agency',
            name: 'Agency',
            nameAr: 'الوكالات',
            monthlyPrice: 149,
            yearlyPrice: 1490,
            color: 'border-emerald-500/40',
            bg: 'bg-gradient-to-b from-emerald-500/10 to-emerald-500/[0.02]',
            icon: '🏢',
            features: [
                'كل مميزات Pro +',
                '500 صورة AI شهرياً',
                'حتى 5 أعضاء فريق',
                'رخصة تجارية (White Label)',
                'بدون علامة مائية',
                'سرعة معالجة Turbo',
                'تقارير أداء متقدمة',
                'أولوية في الدعم الفني',
            ],
            limits: { generations: -1, images: 500, tools: 66 },
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            nameAr: 'المؤسسات',
            monthlyPrice: 299,
            yearlyPrice: 2990,
            color: 'border-purple-500/40',
            bg: 'bg-gradient-to-b from-purple-500/10 to-purple-500/[0.02]',
            icon: '👑',
            features: [
                'كل مميزات Agency +',
                'صور غير محدودة',
                'أعضاء فريق غير محدود',
                'API Access كامل',
                'مدير حساب مخصص',
                'تدريب فردي على المنصة',
                'ميزات حصرية مبكرة',
                'SLA ودعم 24/7',
            ],
            limits: { generations: -1, images: -1, tools: 66 },
        },
    ];

    const getPrice = (plan: any) => {
        if (plan.isFree) return 0;
        return isYearly ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;
    };

    const getSavings = (plan: any) => {
        if (plan.isFree) return 0;
        return Math.round(((plan.monthlyPrice * 12 - plan.yearlyPrice) / (plan.monthlyPrice * 12)) * 100);
    };

    const handlePaymentClick = async () => {
        if (!selectedPlan || !userId) return;
        setIsSubmitting(true);
        try {
            await createPaymentRequest(userId, selectedPlan);
            const price = isYearly ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice;
            const period = isYearly ? 'سنوي' : 'شهري';
            const whatsappUrl = `https://wa.me/201090624823?text=${encodeURIComponent(
                `مرحباً، أريد الاشتراك في باقة ${selectedPlan.name} (${selectedPlan.nameAr}) - $${price} ${period}\nرقم تعريفي: ${userId}`
            )}`;
            window.open(whatsappUrl, '_blank');
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-300 overflow-y-auto" dir="rtl">
            <div className="glass-card w-full max-w-6xl rounded-[3rem] p-6 md:p-10 border border-white/10 shadow-[0_0_150px_rgba(255,215,0,0.1)] relative my-8">
                <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white transition-all p-2 bg-white/5 rounded-full z-10 hover:bg-white/10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {/* Header */}
                <div className="text-center mb-10 space-y-4">
                    <div className="inline-block px-4 py-1.5 bg-[#FFD700]/20 text-[#FFD700] rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
                        66+ أداة AI في مكان واحد
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
                        منصة واحدة بدل فريق كامل
                    </h2>
                    <p className="text-white/40 font-medium text-lg max-w-2xl mx-auto">
                        وفّر أكثر من $3,000 شهرياً مقارنة بتوظيف كوبي رايتر ومصمم ومصور ومخطط محتوى
                    </p>
                </div>

                {/* Monthly/Yearly Toggle */}
                <div className="flex items-center justify-center gap-4 mb-10">
                    <span className={`text-sm font-bold transition-colors ${!isYearly ? 'text-white' : 'text-white/40'}`}>شهري</span>
                    <button
                        onClick={() => setIsYearly(!isYearly)}
                        className={`relative w-16 h-8 rounded-full transition-all duration-300 ${isYearly ? 'bg-[#FFD700]' : 'bg-white/20'}`}
                    >
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300 ${isYearly ? 'right-1' : 'right-[calc(100%-1.75rem)]'}`}></div>
                    </button>
                    <span className={`text-sm font-bold transition-colors ${isYearly ? 'text-white' : 'text-white/40'}`}>
                        سنوي <span className="text-emerald-400 text-xs font-black">وفّر شهرين!</span>
                    </span>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            onClick={() => !plan.isFree && setSelectedPlan(plan)}
                            className={`relative flex flex-col p-6 rounded-[2rem] border transition-all duration-500 cursor-pointer hover:scale-[1.02] ${plan.color} ${plan.bg} ${plan.popular ? 'ring-2 ring-[#FFD700]/40 shadow-[0_0_40px_rgba(255,215,0,0.15)]' : ''
                                } ${selectedPlan?.id === plan.id ? 'ring-2 ring-white shadow-[0_0_30px_rgba(255,255,255,0.1)]' : ''}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FFD700] text-black px-5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xl">
                                    الأكثر شعبية 🔥
                                </div>
                            )}

                            <div className="text-center space-y-3 mb-6">
                                <div className="text-3xl">{plan.icon}</div>
                                <h3 className="text-lg font-black text-white">{plan.nameAr}</h3>
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{plan.name}</p>

                                <div className="flex items-baseline justify-center gap-1">
                                    {plan.isFree ? (
                                        <span className="text-4xl font-black text-white">مجاني</span>
                                    ) : (
                                        <>
                                            <span className="text-4xl font-black text-white">${getPrice(plan)}</span>
                                            <span className="text-sm text-white/30 font-bold">/شهر</span>
                                        </>
                                    )}
                                </div>

                                {isYearly && !plan.isFree && (
                                    <div className="text-emerald-400 text-xs font-black">
                                        وفّر {getSavings(plan)}% — ${plan.yearlyPrice}/سنة
                                    </div>
                                )}
                            </div>

                            <ul className="space-y-3 mb-6 flex-grow border-t border-white/5 pt-5">
                                {plan.features.map((f, idx) => (
                                    <li key={idx} className="flex items-start gap-2.5 text-[11px] text-white/60 font-bold justify-end leading-relaxed">
                                        <span className="flex-1 text-right">{f}</span>
                                        <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={(e) => { e.stopPropagation(); plan.isFree ? null : setSelectedPlan(plan); }}
                                className={`w-full py-4 rounded-[1.2rem] text-center font-black text-sm transition-all shadow-lg ${plan.isFree
                                        ? 'bg-white/10 text-white/60 cursor-default'
                                        : plan.popular
                                            ? 'bg-[#FFD700] text-black hover:bg-yellow-400 shadow-[#FFD700]/20'
                                            : selectedPlan?.id === plan.id
                                                ? 'bg-white text-black'
                                                : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                            >
                                {plan.isFree ? 'الباقة الحالية' : selectedPlan?.id === plan.id ? '✓ تم الاختيار' : 'اختر هذه الباقة'}
                            </button>
                        </div>
                    ))}
                </div>

                {/* ROI Section */}
                <div className="bg-white/[0.03] rounded-[2.5rem] p-6 md:p-8 border border-white/5 mb-8">
                    <h3 className="text-xl font-black text-white text-center mb-6">لماذا $59 هي أفضل صفقة لعملك؟ 📊</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-5 bg-red-500/5 border border-red-500/10 rounded-2xl">
                            <p className="text-red-400 text-xs font-black mb-2 uppercase">كوبي رايتر فريلانسر</p>
                            <p className="text-2xl font-black text-white line-through decoration-red-500/50">$500+</p>
                            <p className="text-white/30 text-[10px] font-bold mt-1">شهرياً</p>
                        </div>
                        <div className="text-center p-5 bg-red-500/5 border border-red-500/10 rounded-2xl">
                            <p className="text-red-400 text-xs font-black mb-2 uppercase">مصمم + مصور منتجات</p>
                            <p className="text-2xl font-black text-white line-through decoration-red-500/50">$1,500+</p>
                            <p className="text-white/30 text-[10px] font-bold mt-1">شهرياً</p>
                        </div>
                        <div className="text-center p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                            <p className="text-emerald-400 text-xs font-black mb-2 uppercase">إبداع برو = كل ده</p>
                            <p className="text-2xl font-black text-[#FFD700]">$59</p>
                            <p className="text-emerald-400/60 text-[10px] font-bold mt-1">وفّر 97% 🔥</p>
                        </div>
                    </div>
                </div>

                {/* Payment Section */}
                <div className="bg-white/[0.03] rounded-[2.5rem] p-6 md:p-8 border border-white/5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div className="space-y-6 text-right">
                            <div>
                                <h3 className="text-xl font-black text-white mb-2">طريقة الاشتراك ⚡</h3>
                                <p className="text-white/40 text-sm font-medium">اختر الباقة وتواصل معنا على الواتساب لتفعيل اشتراكك فوراً.</p>
                            </div>
                            <div className="flex flex-wrap gap-3 justify-end">
                                <div className="px-5 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Wise / PayPal</p>
                                        <p className="text-sm font-black text-white">تحويل بنكي دولي</p>
                                    </div>
                                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-xl">💸</div>
                                </div>
                                <div className="px-5 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">فودافون كاش</p>
                                        <p className="text-sm font-black text-white">01090624823</p>
                                    </div>
                                    <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-xl">📱</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <div className="text-center p-5 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-2xl w-full">
                                <p className="text-white/60 text-xs font-black mb-1 uppercase">الباقة المختارة</p>
                                <h4 className="text-white font-bold text-xl">
                                    {selectedPlan ? `${selectedPlan.nameAr} — $${isYearly ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice}${isYearly ? '/سنة' : '/شهر'}` : 'اختر باقة للبدء'}
                                </h4>
                            </div>
                            <button
                                onClick={handlePaymentClick}
                                disabled={!selectedPlan || isSubmitting}
                                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 text-white w-full py-5 rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 shadow-2xl transition-all hover:scale-[1.02] active:scale-95"
                            >
                                {isSubmitting ? 'جاري تسجيل الطلب...' : 'اشترك الآن عبر واتساب'}
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.012 2c-5.508 0-9.987 4.479-9.987 9.988 0 1.757.455 3.409 1.251 4.849l-1.332 4.86 4.975-1.304c1.404.757 2.997 1.189 4.693 1.189 5.508 0 9.988-4.479 9.988-9.988 0-5.508-4.48-9.988-9.988-9.988zm6.541 14.156c-.285.802-1.454 1.459-2.003 1.558-.49.088-1.127.159-1.808-.159-2.883-1.343-4.706-4.321-4.851-4.512-.144-.191-1.171-1.554-1.171-2.96 0-1.406.738-2.097 1-2.39.262-.293.571-.366.762-.366.191 0 .381.001.547.009.176.009.414-.066.649.492.235.558.802 1.956.872 2.1.07.144.117.311.023.498-.094.187-.141.311-.282.47-.141.159-.297.355-.424.476-.141.134-.288.28-.124.558.164.278.728 1.199 1.562 1.933.1.088.192.13.284.13.111 0 .216-.051.31-.137.288-.266.63-.687.9-.993.271-.306.495-.257.778-.152.282.105 1.79.845 2.097.998.307.153.511.228.586.356.075.127.075.736-.21 1.538z" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* What's Included */}
                <div className="mt-8 bg-white/[0.03] rounded-[2.5rem] p-6 md:p-8 border border-white/5">
                    <h3 className="text-xl font-black text-white text-center mb-6">كل ده في اشتراك واحد 🎁</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { icon: '📝', label: '6 Copywriting Frameworks', sub: 'AIDA, PAS, BAB, 4Ps...' },
                            { icon: '🎨', label: '13 Dynamic Visual Template', sub: 'Before/After, Lifestyle...' },
                            { icon: '🎯', label: '5 Ad Angles Per Product', sub: 'Pain, Social Proof, FOMO...' },
                            { icon: '🪝', label: '13+ Hook Pattern', sub: 'Video + Text Hooks' },
                            { icon: '📸', label: 'AI Product Photography', sub: '8 Scene Presets' },
                            { icon: '📅', label: '7-Day Content Calendar', sub: 'Automated Planning' },
                            { icon: '🎬', label: 'Video Storyboards', sub: 'Scene-by-Scene Scripts' },
                            { icon: '📊', label: 'Market Analysis AI', sub: 'Audience + Competitors' },
                        ].map((item, i) => (
                            <div key={i} className="text-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-colors">
                                <div className="text-2xl mb-2">{item.icon}</div>
                                <p className="text-white text-[11px] font-black leading-tight">{item.label}</p>
                                <p className="text-white/30 text-[9px] font-bold mt-1">{item.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs font-black text-white/20 uppercase tracking-[0.3em]">Ebdaa Pro © 2025 — Powered by AI</p>
                </div>
            </div>
        </div>
    );
};

export default PricingModal;
