
import React, { useState } from 'react';
import { ImageFile } from '../types';
import { generateImage, askGemini, animateImageToVideo } from '../services/geminiService';
import { resizeImage } from '../utils';
import ImageWorkspace from './ImageWorkspace';

const PERSONAS = [
    { id: 'saudi', label: 'شاب خليجي', prompt: 'Young modern Saudi man in Riyadh setting.' },
    { id: 'egy', label: 'فتاة مصرية', prompt: 'Egyptian modern woman in bright urban setting.' },
    { id: 'global', label: 'موديل عالمي', prompt: 'Luxury fashion model in studio background.' }
];

const VIDEO_TYPES = [
    { id: 'unboxing', label: 'فتح صندوق (Unboxing)', prompt: 'Candid iPhone footage of unboxing product, hands visible.' },
    { id: 'lifestyle', label: 'نمط حياة (Lifestyle)', prompt: 'Person using the product naturally in real life environment.' },
    { id: 'ad', label: 'إعلان سينمائي (Cinema Ad)', prompt: 'Professional cinematic movement around the product.' }
];

const VideoProductionStudio: React.FC<{ userId: string; refreshCredits: () => void }> = ({ userId, refreshCredits }) => {
    const [images, setImages] = useState<ImageFile[]>([]);
    const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0]);
    const [selectedType, setSelectedType] = useState(VIDEO_TYPES[0]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<{ image: ImageFile, videoUrl?: string, script: string } | null>(null);

    const handleGenerate = async () => {
        if (!images.length) return;
        setIsGenerating(true);
        try {
            // 1. Generate Script
            const script = await askGemini(`Create a 15s viral reel script for this product with ${selectedPersona.label} doing a ${selectedType.label}. Tone: High energy.`, "Expert Content Creator");

            // 2. Generate Key Visual (Persona + Product)
            const visualPrompt = `${selectedType.prompt} featuring ${selectedPersona.prompt}. High-end commercial quality. Preserve product branding.`;
            const image = await generateImage(images, visualPrompt, null, "9:16");

            // 3. Simulated/Optional Animation (If Veo is active in logic)
            setResult({ image, script });
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="w-full py-10 animate-in fade-in duration-500 text-right" dir="rtl">
            <div className="max-w-6xl mx-auto space-y-12">
                <div className="space-y-4">
                    <h1 className="text-5xl font-black text-white tracking-tighter">استوديو الفيديوهات والريلز 🎬</h1>
                    <p className="text-slate-400 text-xl font-bold">كل أدوات الموديلز والـ UGC والتحريك في محطة واحدة.</p>
                </div>

                <div className="bg-white/5 rounded-[3.5rem] p-10 md:p-14 border border-white/10 shadow-2xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Settings */}
                        <div className="space-y-10">
                            <div className="space-y-6">
                                <label className="text-sm font-black text-[#FFD700] uppercase tracking-widest pr-4 border-r-4 border-[#FFD700]">1. اختار الموديل (Persona)</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {PERSONAS.map(p => (
                                        <button key={p.id} onClick={() => setSelectedPersona(p)} className={`py-4 rounded-2xl font-black text-[10px] border-2 transition-all ${selectedPersona.id === p.id ? 'bg-[#FFD700] border-[#FFD700] text-black' : 'bg-white/5 border-white/5 text-slate-500'}`}>{p.label}</button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="text-sm font-black text-[#FFD700] uppercase tracking-widest pr-4 border-r-4 border-[#FFD700]">2. نوع المحتوى (Content Type)</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {VIDEO_TYPES.map(t => (
                                        <button key={t.id} onClick={() => setSelectedType(t)} className={`px-6 py-4 rounded-2xl font-black text-xs border-2 text-right transition-all ${selectedType.id === t.id ? 'bg-white text-black border-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-500'}`}>{t.label}</button>
                                    ))}
                                </div>
                            </div>

                            <button onClick={handleGenerate} disabled={isGenerating || !images.length} className="w-full h-20 bg-[#FFD700] text-black font-black rounded-3xl text-2xl shadow-xl transition-all active:scale-95 disabled:opacity-30">
                                {isGenerating ? 'جاري الرندرة الذكية...' : 'توليد الفيديو والسكريبت'}
                            </button>
                        </div>

                        {/* Uploads */}
                        <div className="space-y-6">
                            <label className="text-sm font-black text-[#FFD700] uppercase tracking-widest pr-4 border-r-4 border-[#FFD700]">3. ارفع صور المنتج</label>
                            <div className="aspect-square">
                                <ImageWorkspace
                                    id="vid-up"
                                    images={images}
                                    onImagesUpload={async f => {
                                        const r = await resizeImage(f[0], 1024, 1024);
                                        const reader = new FileReader();
                                        reader.onload = () => setImages(prev => [...prev, { base64: (reader.result as string || '').split(',')[1] || '', mimeType: r.type, name: r.name }]);
                                        reader.readAsDataURL(r);
                                    }}
                                    onImageRemove={(i) => setImages(prev => prev.filter((_, idx) => idx !== i))}
                                    isUploading={false}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {result && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-5">
                        <div className="aspect-[9/16] bg-black/40 rounded-[3rem] overflow-hidden border border-white/10 relative group">
                            <img src={`data:${result.image.mimeType};base64,${result.image.base64}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="px-8 py-3 bg-white text-black rounded-full font-black text-xs">تحميل 4K 📥</button>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-[#FFD700]/10 border border-[#FFD700]/20 p-8 rounded-[3rem] space-y-4">
                                <h3 className="text-xl font-black text-[#FFD700]">سكريبت الريلز (Reel Script) 📝</h3>
                                <p className="text-slate-200 font-bold leading-relaxed whitespace-pre-wrap">{result.script}</p>
                            </div>
                            <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10">
                                <h3 className="text-lg font-black text-white mb-4">نصيحة المخرج 🎬</h3>
                                <p className="text-slate-400 text-sm font-bold">استخدم موسيقى تريند تناسب مود "الـ {selectedType.label}" لتحقيق أعلى وصول على تيك توك وانستجرام.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoProductionStudio;
