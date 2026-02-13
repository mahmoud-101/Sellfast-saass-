
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { deductCredits, CREDIT_COSTS } from '../lib/supabase';

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const VideoStudio: React.FC<{ userId?: string; refreshCredits?: () => void }> = ({ userId, refreshCredits }) => {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('');

    const handleGenerateVideo = async () => {
        if (!prompt.trim() || !userId) return;

        setIsGenerating(true);
        setVideoUrl(null);
        setProgress(5);
        setStatusText('جاري التحقق من الرصيد والاتصال بالمحرك...');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // محاولة البدء - Veo 3.1 Fast
            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: `High-end cinematic commercial: ${prompt}. 4k, professional lighting.`,
                config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
            });

            setStatusText('جاري المعالجة الإبداعية (قد تستغرق دقيقة)...');
            setProgress(20);

            // دورة الانتظار (Polling) حتى يكتمل الفيديو
            while (!operation.done) {
                await new Promise(res => setTimeout(res, 8000));
                operation = await ai.operations.getVideosOperation({ operation });
                setProgress(prev => Math.min(prev + 7, 95));
            }

            // الخصم فقط بعد التأكد من نجاح التوليد
            const deducted = await deductCredits(userId, CREDIT_COSTS.VIDEO_VEO);
            
            if (deducted) {
                const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
                // جلب الفيديو عبر الرابط مع إلحاق المفتاح للتأكد من الصلاحية
                const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                const blob = await response.blob();
                setVideoUrl(URL.createObjectURL(blob));
                setProgress(100);
                setStatusText('تم الإنتاج بنجاح!');
                if (refreshCredits) refreshCredits();
            } else {
                setStatusText('رصيدك غير كافٍ لإتمام عملية التصدير.');
            }
        } catch (err: any) {
            console.error(err);
            setStatusText(err.message?.includes('404') ? 'حدث خطأ في الاتصال بالمحرك' : 'فشل التوليد: تأكد من شحن رصيدك');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <main className="w-full flex flex-col gap-8 pt-4 pb-12 animate-in fade-in duration-700">
            <div className="glass-card rounded-[3rem] p-10 shadow-2xl relative border border-white/5 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -z-10"></div>
                <div className="flex flex-col lg:flex-row gap-12 items-center">
                    <div className="lg:w-1/2 space-y-6 text-right">
                        <div className="inline-flex px-4 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest gap-2 flex-row-reverse items-center">
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
                            Standalone Video Engine (100 Credits)
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">الإخراج <span className="text-indigo-500">السينمائي الذكي</span></h2>
                        <textarea 
                            value={prompt} onChange={(e) => setPrompt(e.target.value)}
                            placeholder="صف لقطة الفيديو التي تتخيلها..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-lg font-bold text-white focus:border-indigo-500 outline-none min-h-[150px] resize-none text-right font-tajawal"
                        />
                        <button 
                            onClick={handleGenerateVideo} disabled={isGenerating || !prompt.trim()}
                            className="w-full h-20 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white rounded-2xl font-black text-xl flex items-center justify-center gap-4 transition-all"
                        >
                            {isGenerating ? (
                                <div className="flex flex-col items-center">
                                    <span className="text-sm">{statusText}</span>
                                    <div className="w-64 h-1 bg-white/10 rounded-full mt-2 overflow-hidden"><div className="h-full bg-white transition-all duration-500" style={{ width: `${progress}%` }}></div></div>
                                </div>
                            ) : (<><PlayIcon /> توليد فيديو إعلاني (100 نقطة)</>)}
                        </button>
                    </div>
                    <div className="lg:w-1/2 w-full aspect-video bg-black/60 rounded-[2.5rem] border border-white/10 flex items-center justify-center overflow-hidden">
                        {videoUrl ? (
                            <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center gap-4 opacity-10">
                                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                                <span className="font-black uppercase tracking-[0.3em]">Screen Preview</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default VideoStudio;
