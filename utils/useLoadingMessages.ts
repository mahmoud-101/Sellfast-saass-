import { useState, useEffect, useRef } from 'react';

/**
 * A hook that cycles through a list of contextual loading messages
 * to give the user a sense of what the AI is doing in the background.
 */
export function useLoadingMessages(messages: string[], intervalMs = 2500) {
    const [index, setIndex] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const start = () => {
        setIndex(0);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setIndex(prev => (prev + 1) % messages.length);
        }, intervalMs);
    };

    const stop = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    useEffect(() => {
        return () => stop(); // cleanup on unmount
    }, []);

    return { message: messages[index], start, stop };
}

// Pre-defined message packs for each hub
export const marketIntelligenceMessages = [
    '🧠 جاري تحليل السوق المستهدف...',
    '🔍 رصد التريندات والكلمات المفتاحية...',
    '📊 مقارنة المنافسين في السوق...',
    '🌐 استشعار نبض السوق الحالي...',
    '🎯 بناء خريطة الفجوات والفرص...',
    '📈 تجميع تقرير الاستراتيجية...',
];

export const campaignBuilderMessages = [
    '✍️ إعداد الزوايا البيعية الحادة...',
    '🎯 تحليل نقاط ألم العميل المستهدف...',
    '💡 اختيار المحرك البيعي الأمثل...',
    '🧪 اختبار زوايا الـ Hook المختلفة...',
    '📝 كتابة نص الإعلان بالعامية...',
    '🚀 صياغة عرض القيمة النهائي...',
];

export const creativeStudioMessages = [
    '🎬 تحليل الزاوية الإبداعية...',
    '🎞️ رسم المشاهد الستة للفيديو...',
    '🎤 كتابة الحوارات والتعليق الصوتي...',
    '📐 تحديد زوايا الكاميرا والإضاءة...',
    '🌟 إضافة عناصر التأثير والإقناع...',
    '✅ مراجعة الستوري بورد النهائي...',
];
