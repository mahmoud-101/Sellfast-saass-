import React, { Suspense, lazy } from 'react';

// Lazy-load Performance Engine Panel
const PerformancePanel = lazy(() => import('../performance/PerformancePanel'));

export default function CampaignBuilderHub({
    setView,
    userId,
    performanceProject, setPerformanceProject,
    powerProject, setPowerProject,
    planProject, setPlanProject,
    bridgeToVideo, bridgeToPhotoshoot
}: any) {
    return (
        <div className="w-full animate-in fade-in duration-500" dir="rtl">
            <div className="max-w-6xl mx-auto">
                <Suspense fallback={
                    <div className="flex items-center justify-center h-64 text-orange-400 text-lg font-bold animate-pulse gap-3 bg-gray-900 border border-white/5 rounded-3xl">
                        <div className="w-6 h-6 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
                        جاري تحميل محرك الإعلانات الفائق...
                    </div>
                }>
                    <PerformancePanel />
                </Suspense>
            </div>
        </div>
    );
}
