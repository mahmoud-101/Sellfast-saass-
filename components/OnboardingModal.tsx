import React, { useState, useEffect } from 'react';

const ONBOARDING_KEY = 'ebdaa_onboarding_done';

interface OnboardingModalProps {
    onClose: () => void;
}

const steps = [
    {
        icon: '🧠',
        color: 'from-blue-500 to-emerald-500',
        borderColor: 'border-blue-500/30',
        bgColor: 'bg-blue-900/20',
        number: '١',
        title: 'مركز ذكاء السوق',
        subtitle: 'الخطوة الأولى',
        description: 'أدخل اسم منتجك ووصفه والسوق المستهدف. الذكاء الاصطناعي سيحلل المنتج ويكشف عن:',
        bullets: ['👥 الجمهور المثالي للمنتج', '⚡ نقطة البيع الفريدة (USP)', '🎯 الزوايا البيعية الأقوى'],
    },
    {
        icon: '🚀',
        color: 'from-purple-500 to-pink-500',
        borderColor: 'border-purple-500/30',
        bgColor: 'bg-purple-900/20',
        number: '٢',
        title: 'مصنع الحملات الإعلانية',
        subtitle: 'الخطوة الثانية',
        description: 'اختر هدف حملتك (مبيعات أو انتشار) والنظام سيولد لك تلقائياً:',
        bullets: ['📝 نصوص إعلانية جاهزة', '📅 خطة محتوى 7 أيام', '🎣 جمل Hook جذابة'],
    },
    {
        icon: '🎬',
        color: 'from-emerald-500 to-cyan-500',
        borderColor: 'border-emerald-500/30',
        bgColor: 'bg-emerald-900/20',
        number: '٣',
        title: 'الاستوديو الإبداعي المرئي',
        subtitle: 'الخطوة الثالثة',
        description: 'النظام يُحوّل الزاوية البيعية المختارة إلى سيناريو فيديو احترافي:',
        bullets: ['🎞️ 6 مشاهد مفصّلة جاهزة للتصوير', '🎭 حوارات بالعامية العربية', '💾 حفظ الحملة في مكتبتك'],
    },
];

export default function OnboardingModal({ onClose }: OnboardingModalProps) {
    const [step, setStep] = useState(0);
    const [exiting, setExiting] = useState(false);

    const handleClose = () => {
        setExiting(true);
        setTimeout(() => {
            localStorage.setItem(ONBOARDING_KEY, 'true');
            onClose();
        }, 300);
    };

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            handleClose();
        }
    };

    const current = steps[step];

    return (
        <div
            dir="rtl"
            className={`fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-300 ${exiting ? 'opacity-0' : 'opacity-100'}`}
        >
            <div className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-3xl shadow-2xl overflow-hidden">

                {/* Progress bar */}
                <div className="flex gap-1 p-4 pb-0">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? `bg-gradient-to-r ${current.color}` : 'bg-gray-700'}`}
                        />
                    ))}
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    {/* Icon + header */}
                    <div className={`${current.bgColor} border ${current.borderColor} rounded-2xl p-6 text-center`}>
                        <div className="text-6xl mb-3">{current.icon}</div>
                        <div className="text-xs text-gray-400 mb-1">{current.subtitle}</div>
                        <h2 className={`text-2xl font-black bg-gradient-to-r ${current.color} bg-clip-text text-transparent`}>
                            {current.title}
                        </h2>
                    </div>

                    {/* Description */}
                    <div>
                        <p className="text-gray-300 text-sm leading-relaxed mb-4">{current.description}</p>
                        <ul className="space-y-2">
                            {current.bullets.map((b, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm">
                                    <span className="text-base">{b.split(' ')[0]}</span>
                                    <span className="text-gray-200">{b.split(' ').slice(1).join(' ')}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-2">
                        <button
                            onClick={handleClose}
                            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
                        >
                            تخطّى الشرح
                        </button>
                        <div className="flex items-center gap-3">
                            <span className="text-gray-500 text-sm">{step + 1} / {steps.length}</span>
                            <button
                                onClick={handleNext}
                                className={`bg-gradient-to-r ${current.color} text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity`}
                            >
                                {step < steps.length - 1 ? 'التالي ←' : '🚀 ابدأ الآن!'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/** Call this to check if we should show onboarding */
export function shouldShowOnboarding(): boolean {
    return localStorage.getItem(ONBOARDING_KEY) !== 'true';
}
