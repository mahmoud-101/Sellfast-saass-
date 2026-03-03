import React, { useState, useEffect } from 'react';

const STEPS = [
    { title: 'جاري تحليل السوق والمنتج...', duration: 2000 },
    { title: 'جاري كتابة الهوكات الفعّالة...', duration: 2500 },
    { title: 'جاري بناء زوايا البيع...', duration: 2000 },
    { title: 'جاري تصميم الصور المدمجة...', duration: 2500 },
    { title: 'جاري التجميع النهائي...', duration: 1500 },
];

export const PerformanceLoadingState: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        let timer: NodeJS.Timeout;

        const advanceStep = (stepIndex: number) => {
            if (stepIndex >= STEPS.length - 1) return;
            timer = setTimeout(() => {
                setCurrentStep(stepIndex + 1);
                advanceStep(stepIndex + 1);
            }, STEPS[stepIndex].duration);
        };

        advanceStep(0);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="w-full max-w-2xl mx-auto bg-black/40 border border-orange-500/20 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl animate-in fade-in zoom-in-95 duration-500" dir="rtl">
            <div className="w-20 h-20 mb-6 relative">
                <div className="absolute inset-0 border-4 border-orange-500/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-3xl animate-pulse">🔥</div>
            </div>

            <h3 className="text-2xl font-black text-white mb-2">لحظات ويجهز مصنع الإعلانات...</h3>
            <p className="text-sm text-slate-400 mb-8">نعتمد على تحليل الأداء وصياغة الإعلانات بالسوق المصري.</p>

            <div className="w-full space-y-4 text-right">
                {STEPS.map((step, index) => {
                    const isActive = index === currentStep;
                    const isPassed = index < currentStep;

                    return (
                        <div key={index} className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 font-bold text-sm ${isPassed ? 'bg-emerald-500 text-black' :
                                    isActive ? 'bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.5)] scale-110' :
                                        'bg-white/5 text-slate-500'
                                }`}>
                                {isPassed ? '✓' : index + 1}
                            </div>
                            <div className="flex-1">
                                <p className={`font-bold transition-all duration-300 ${isPassed ? 'text-slate-300' :
                                        isActive ? 'text-orange-400 text-lg' :
                                            'text-slate-600'
                                    }`}>
                                    {step.title}
                                </p>
                                {isActive && (
                                    <div className="w-full h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
                                        <div className="h-full bg-orange-500 rounded-full animate-progress" style={{ width: '100%', animationDuration: `${step.duration}ms`, animationTimingFunction: 'linear' }}></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes progress {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
                .animate-progress { animation-name: progress; }
            `}} />
        </div>
    );
};
