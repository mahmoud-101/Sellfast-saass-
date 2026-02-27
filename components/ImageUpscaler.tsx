import React, { useState } from 'react';
import { Sparkles, X, Download, Wand2, Zap } from 'lucide-react';
import { generateImage } from '../services/geminiService';
import { deductCredits } from '../lib/supabase';

interface ImageUpscalerProps {
    imageUrl: string;
    onClose: () => void;
    userId: string;
}

const ImageUpscaler: React.FC<ImageUpscalerProps> = ({ imageUrl, onClose, userId }) => {
    const [isUpscaling, setIsUpscaling] = useState(false);
    const [upscaledUrl, setUpscaledUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'preview' | 'result'>('preview');

    const handleUpscale = async () => {
        setIsUpscaling(true);
        setError(null);

        try {
            // 1. Deduct Credits (High cost for high res)
            const success = await deductCredits(userId, 15);
            if (!success) {
                setError('رصيدك لا يكفي لعملية التحسين (15 نقطة)');
                setIsUpscaling(false);
                return;
            }

            // 2. Prepare Image for Gemini
            const imgFile = {
                base64: imageUrl.includes('base64,') ? imageUrl.split('base64,')[1] : imageUrl,
                mimeType: imageUrl.startsWith('data:') ? imageUrl.split(';')[0].split(':')[1] : 'image/png',
                name: 'original.png'
            };

            // 3. Generate Enhanced Image
            const upscalePrompt = "Enhance this image to 4K resolution, extremely sharp details, cinematic lighting, realistic textures, masterpiece quality, remove any blur, high contrast, studio quality professional photography.";

            const result = await generateImage([imgFile], upscalePrompt);
            setUpscaledUrl(`data:${result.mimeType};base64,${result.base64}`);
            setStep('result');
        } catch (e: any) {
            console.error(e);
            setError('حدث خطأ أثناء فحص الصورة وتحسينها. حاول مرة أخرى.');
        } finally {
            setIsUpscaling(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="relative w-full max-w-5xl glass-card rounded-[3rem] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(168,85,247,0.2)]">
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-2xl">
                            <Wand2 className="text-white" />
                        </div>
                        <div className="text-right" dir="rtl">
                            <h2 className="text-2xl font-black text-white">مُحسن الصور الذكي (Upscaler)</h2>
                            <p className="text-xs text-slate-400 font-bold">تحويل الصورة لجودة 4K وضبط التفاصيل السينمائية</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-colors">
                        <X className="text-white/40" />
                    </button>
                </div>

                <div className="p-8 md:p-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        {/* Comparison Area */}
                        <div className="relative group rounded-[2.5rem] overflow-hidden border border-white/10 shadow-3xl aspect-[4/5] bg-black/40">
                            {step === 'preview' ? (
                                <>
                                    <img src={imageUrl} alt="Original" className="w-full h-full object-cover blur-[2px] opacity-60" />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10">
                                        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 animate-pulse border border-white/10">
                                            <Sparkles className="text-purple-400" size={32} />
                                        </div>
                                        <h3 className="text-xl font-black text-white mb-2">الصورة جاهزة للتحسين</h3>
                                        <p className="text-xs text-slate-400 font-bold">سيعمل الذكاء الاصطناعي على إعادة رسم التفاصيل بدقة متناهية</p>
                                    </div>
                                </>
                            ) : (
                                <img src={upscaledUrl!} alt="Upscaled" className="w-full h-full object-cover animate-in zoom-in-95 duration-1000" />
                            )}

                            {isUpscaling && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-6">
                                    <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                                    <p className="text-white font-black animate-pulse">جاري سحب نقاط الرؤية وإعادة الرسم...</p>
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="space-y-8 text-right" dir="rtl">
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black text-white">لماذا تحسن صورتك؟</h3>
                                <div className="space-y-4">
                                    <FeatureItem icon="🎯" text="إزالة التشويش والبيكسل نهائياً" />
                                    <FeatureItem icon="✨" text="ضبط الإضاءة السينمائية (Cinematic Lighting)" />
                                    <FeatureItem icon="📸" text="جعل ملامح المنتج تبدو احترافية 100%" />
                                    <FeatureItem icon="📐" text="جاهزة للطباعة أو النشر بدقة 4K" />
                                </div>
                            </div>

                            <div className="p-6 rounded-3xl bg-purple-500/5 border border-purple-500/10">
                                <p className="text-xs text-slate-400 font-bold leading-relaxed">تستهلك هذه العملية 15 نقطة نظراً لاستخدام محركات معالجة رسومية ثقيلة لضمان أعلى جودة ممكنة.</p>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs font-bold animate-shake">
                                    {error}
                                </div>
                            )}

                            {step === 'preview' ? (
                                <button
                                    onClick={handleUpscale}
                                    disabled={isUpscaling}
                                    className="w-full py-6 bg-purple-600 hover:bg-purple-500 text-white font-black text-xl rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    <Zap size={20} />
                                    ابدأ التحسين الآن (15 نقطة)
                                </button>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = upscaledUrl!;
                                            link.download = 'EBDAA_PRO_4K.png';
                                            link.click();
                                        }}
                                        className="w-full py-6 bg-emerald-500 text-black font-black text-xl rounded-2xl shadow-lg transition-all hover:bg-emerald-400 flex items-center justify-center gap-3"
                                    >
                                        <Download size={20} />
                                        تحميل الصورة بدقة 4K
                                    </button>
                                    <button onClick={onClose} className="text-slate-500 font-bold hover:text-white transition-colors">إغلاق النافذة</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeatureItem = ({ icon, text }: { icon: string, text: string }) => (
    <div className="flex items-center gap-4 group">
        <span className="text-xl group-hover:scale-125 transition-transform">{icon}</span>
        <span className="text-sm border-b border-white/5 pb-2 flex-1 font-bold text-slate-300">{text}</span>
    </div>
);

export default ImageUpscaler;
