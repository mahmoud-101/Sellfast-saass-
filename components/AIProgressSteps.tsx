import React, { useState, useEffect } from 'react';

export interface ProgressStep {
    label: string;
    icon: string;
    durationMs: number; // approx time for this step
}

interface AIProgressStepsProps {
    steps: ProgressStep[];
    isActive: boolean;
    accentColor?: string; // tailwind color like 'blue' | 'purple' | 'emerald'
    message?: string;     // animated loading message from useLoadingMessages
}

export const MARKET_STEPS: ProgressStep[] = [
    { label: 'جمع بيانات المنتج', icon: '📦', durationMs: 2500 },
    { label: 'تحليل الجمهور المستهدف', icon: '👥', durationMs: 5000 },
    { label: 'اكتشاف نقاط البيع الفريدة', icon: '⚡', durationMs: 5000 },
    { label: 'بناء الزوايا البيعية', icon: '🎯', durationMs: 5000 },
    { label: 'رصد تريندات السوق', icon: '🔥', durationMs: 5000 },
];

export const CAMPAIGN_STEPS: ProgressStep[] = [
    { label: 'تحليل هدف الحملة', icon: '🎯', durationMs: 3000 },
    { label: 'صياغة نقاط الجذب (Hooks)', icon: '🎣', durationMs: 5000 },
    { label: 'كتابة النصوص الإعلانية', icon: '✍️', durationMs: 6000 },
    { label: 'ترتيب خطة المحتوى', icon: '📅', durationMs: 5000 },
];

export const CREATIVE_STEPS: ProgressStep[] = [
    { label: 'تحليل الزاوية البيعية', icon: '🔍', durationMs: 3000 },
    { label: 'تصميم المشاهد البصرية', icon: '🎞️', durationMs: 6000 },
    { label: 'كتابة الحوارات بالعامية', icon: '💬', durationMs: 5000 },
    { label: 'إنهاء السيناريو النهائي', icon: '✅', durationMs: 5000 },
];

export default function AIProgressSteps({
    steps,
    isActive,
    accentColor = 'blue',
    message,
}: AIProgressStepsProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    useEffect(() => {
        if (!isActive) {
            setCurrentStep(0);
            setCompletedSteps([]);
            return;
        }

        let stepIdx = 0;
        let timer: ReturnType<typeof setTimeout>;

        const advance = () => {
            if (stepIdx < steps.length) {
                setCurrentStep(stepIdx);
                const current = stepIdx;
                timer = setTimeout(() => {
                    setCompletedSteps(prev => [...prev, current]);
                    stepIdx++;
                    advance();
                }, steps[current]?.durationMs || 4000);
            }
        };

        advance();
        return () => clearTimeout(timer);
    }, [isActive]);

    const colorMap: Record<string, { ring: string; bg: string; text: string; bar: string }> = {
        blue: { ring: 'ring-blue-500', bg: 'bg-blue-500/20', text: 'text-blue-400', bar: 'bg-blue-500' },
        purple: { ring: 'ring-purple-500', bg: 'bg-purple-500/20', text: 'text-purple-400', bar: 'bg-purple-500' },
        emerald: { ring: 'ring-emerald-500', bg: 'bg-emerald-500/20', text: 'text-emerald-400', bar: 'bg-emerald-500' },
        orange: { ring: 'ring-orange-500', bg: 'bg-orange-500/20', text: 'text-orange-400', bar: 'bg-orange-500' },
    };
    const c = colorMap[accentColor] || colorMap.blue;

    const progress = Math.round(((completedSteps.length) / steps.length) * 100);

    if (!isActive) return null;

    return (
        <div className="space-y-4 w-full">
            {/* Progress bar */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${c.bar} rounded-full transition-all duration-700`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <span className={`text-xs font-bold ${c.text} w-10 text-left`}>{progress}%</span>
            </div>

            {/* Steps list */}
            <div className="space-y-2">
                {steps.map((step, idx) => {
                    const isDone = completedSteps.includes(idx);
                    const isNow = idx === currentStep && !isDone;
                    return (
                        <div
                            key={idx}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300
                                ${isDone ? 'opacity-50' : isNow ? `${c.bg} ring-1 ${c.ring}` : 'opacity-30'}`}
                        >
                            <div className="text-base w-6 text-center">
                                {isDone ? '✅' : isNow ? (
                                    <span className="inline-block animate-spin text-xs">⟳</span>
                                ) : step.icon}
                            </div>
                            <span className={`text-sm font-bold ${isNow ? c.text : 'text-gray-400'}`}>
                                {step.label}
                            </span>
                            {isNow && (
                                <div className="ml-auto flex gap-1">
                                    {[0, 1, 2].map(i => (
                                        <span
                                            key={i}
                                            className={`w-1.5 h-1.5 rounded-full ${c.bar} animate-bounce`}
                                            style={{ animationDelay: `${i * 0.15}s` }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Animated message */}
            {message && (
                <p className={`text-xs ${c.text} animate-pulse text-center pt-1`}>{message}</p>
            )}
        </div>
    );
}
