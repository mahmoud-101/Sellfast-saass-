
import React, { useState } from 'react';
import { ContentCalendarProject, ImageFile, CalendarDay } from '../types';
import { resizeImage } from '../utils';
import { generateContentCalendar30Days, generateImage } from '../services/geminiService';
import ImageWorkspace from './ImageWorkspace';
import { saveGeneratedAsset } from '../lib/supabase';
import { Calendar, LayoutGrid, List, Sparkles, ShoppingBag, Video, MessageSquare, ChevronRight, ChevronLeft } from 'lucide-react';

const TARGET_MARKETS = ['مصر', 'السعودية', 'الإمارات', 'الخليج العربي', 'عالمي'];
const DIALECTS = ['لهجة مصرية', 'لهجة سعودية', 'فصحى بسيطة', 'لهجة شامية', 'الإنجليزية'];

interface Props {
    project: ContentCalendarProject;
    setProject: React.Dispatch<React.SetStateAction<ContentCalendarProject>>;
    onBridgeToPhotoshoot: (context: string) => void;
    userId: string;
}

const ContentCalendarHub: React.FC<Props> = ({ project, setProject, onBridgeToPhotoshoot, userId }) => {
    const [sallaUrl, setSallaUrl] = useState('');
    const [isScraping, setIsScraping] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

    const handleScrapeSalla = async () => {
        if (!sallaUrl.trim()) return;
        setIsScraping(true);
        try {
            const res = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: sallaUrl })
            });
            const data = await res.json();

            if (res.ok) {
                const injectedText = `[Product Name]: ${data.title}\n[Description]: ${data.description}\n[Price]: ${data.price}`;
                setProject(s => ({ ...s, prompt: injectedText + '\n\n' + s.prompt }));

                if (data.image) {
                    try {
                        const imgRes = await fetch(data.image);
                        const blob = await imgRes.blob();
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const b64 = (reader.result as string).split(',')[1];
                            setProject(s => ({ ...s, productImages: [...s.productImages, { base64: b64, mimeType: blob.type, name: 'scraped.jpg' }] }));
                        };
                        reader.readAsDataURL(blob);
                    } catch (e) {
                        console.error("Failed to fetch image cross-origin", e);
                    }
                }
            } else {
                alert("Failed to extract product: " + data.error);
            }
        } catch (e: any) {
            alert("Error linking product: " + e.message);
        } finally {
            setIsScraping(false);
            setSallaUrl('');
        }
    };

    const handleFileUpload = async (files: File[]) => {
        if (!files.length) return;
        setProject(s => ({ ...s, isUploading: true }));
        try {
            const uploaded = await Promise.all(files.map(async file => {
                const resized = await resizeImage(file, 1024, 1024);
                const reader = new FileReader();
                return new Promise<ImageFile>(res => {
                    reader.onloadend = () => res({ base64: (reader.result as string).split(',')[1], mimeType: resized.type, name: resized.name });
                    reader.readAsDataURL(resized);
                });
            }));
            setProject(s => ({ ...s, productImages: [...s.productImages, ...uploaded], isUploading: false }));
        } catch (err) { setProject(s => ({ ...s, isUploading: false })); }
    };

    const onCreateCalendar = async () => {
        if (!project.prompt.trim()) return;
        setProject(s => ({ ...s, isGenerating: true, error: null, days: [] }));
        try {
            const plan = await generateContentCalendar30Days(project.productImages, project.prompt, project.targetMarket, project.dialect);

            // Map the API results to our CalendarDay structure
            const days: CalendarDay[] = plan.map((p: any) => ({
                ...p,
                image: null,
                isLoading: true,
                error: null
            }));

            await saveGeneratedAsset(userId, 'CONTENT_CALENDAR_30', { calendar_content: JSON.stringify(plan) }, { prompt: project.prompt, market: project.targetMarket });

            setProject(s => ({ ...s, days, isGenerating: false }));

            // Background step: Generate actual images for some key posts (to avoid massive parallel cost/latency, we generate sequentially or on demand)
            // For now, let's start generating the first 5 images as a preview
            const previewLimit = 5;
            for (let i = 0; i < Math.min(days.length, previewLimit); i++) {
                const day = days[i];
                try {
                    const scenePrompt = `High-end social media creative for ${project.targetMarket}. Context: ${day.visualPrompt}. Tone: Modern, Luxury, Aesthetic. Commercial photography.`;
                    const img = await generateImage(project.productImages, scenePrompt, null, "1:1");
                    setProject(s => ({
                        ...s,
                        days: s.days.map(d => d.id === day.id ? { ...d, image: img, isLoading: false } : d)
                    }));
                } catch (e) {
                    setProject(s => ({
                        ...s,
                        days: s.days.map(d => d.id === day.id ? { ...d, isLoading: false, error: 'فشل التوليد' } : d)
                    }));
                }
            }

            // Set the rest to not loading if we are only previewing (or you can generate all sequentially)
            setProject(s => ({
                ...s,
                days: s.days.map((d, i) => i >= previewLimit ? { ...d, isLoading: false } : d)
            }));

        } catch (err) { setProject(s => ({ ...s, isGenerating: false, error: "فشل إنشاء التقويم" })); }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'product': return <ShoppingBag className="w-4 h-4 text-orange-400" />;
            case 'viral': return <Sparkles className="w-4 h-4 text-emerald-400" />;
            case 'engagement': return <MessageSquare className="w-4 h-4 text-blue-400" />;
            case 'video': return <Video className="w-4 h-4 text-purple-400" />;
            default: return <Calendar className="w-4 h-4 text-slate-400" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'product': return 'بيع مباشر';
            case 'viral': return 'فيرال/تعليمي';
            case 'engagement': return 'تفاعل';
            case 'video': return 'سكريبت فيديو';
            default: return 'محتوى';
        }
    };

    return (
        <main className="w-full py-10 animate-in fade-in duration-700 text-right" dir="rtl">
            <div className="max-w-7xl mx-auto space-y-12 px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-400 px-4 py-1.5 rounded-full border border-orange-500/20 mb-2">
                            <Calendar size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest"> content strategy 3.0</span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter">تقويم المحتوى الذكي 🗓️✨</h1>
                        <p className="text-slate-400 text-lg font-bold">خطة محتوى هجينة (بيع + فيرال) لـ 30 يوم قادم بضغطة واحدة.</p>
                    </div>
                    {project.days.length > 0 && (
                        <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/10">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:text-white'}`}
                            >
                                <LayoutGrid size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:text-white'}`}
                            >
                                <List size={20} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Input Card */}
                {!project.days.length && (
                    <div className="bg-white/5 rounded-[3.5rem] p-8 md:p-12 border border-white/10 shadow-3xl backdrop-blur-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 blur-[120px] rounded-full -mr-48 -mt-48 transition-opacity group-hover:opacity-100 opacity-50"></div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
                            <div className="lg:col-span-4">
                                <ImageWorkspace
                                    id="calendar-up"
                                    title="صور منتجاتك"
                                    images={project.productImages}
                                    onImagesUpload={handleFileUpload}
                                    onImageRemove={(i) => setProject(s => ({ ...s, productImages: s.productImages.filter((_, idx) => idx !== i) }))}
                                    isUploading={project.isUploading}
                                />
                            </div>
                            <div className="lg:col-span-8 flex flex-col gap-6">
                                <div className="flex flex-col sm:flex-row gap-3 bg-black/40 border border-white/5 rounded-3xl p-3 shadow-inner">
                                    <input
                                        type="text"
                                        value={sallaUrl}
                                        onChange={(e) => setSallaUrl(e.target.value)}
                                        placeholder="🔗 رابط متجرك (سلة، زد، أمازون...)"
                                        className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-orange-500/50 transition-all"
                                    />
                                    <button
                                        onClick={handleScrapeSalla}
                                        disabled={isScraping || !sallaUrl.trim()}
                                        className="bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-black px-8 py-4 rounded-2xl font-black text-sm transition-all disabled:opacity-30 flex items-center gap-2 justify-center"
                                    >
                                        {isScraping ? 'جاري السحب...' : <><Sparkles size={16} /> سحب ذكي</>}
                                    </button>
                                </div>

                                <textarea
                                    value={project.prompt}
                                    onChange={(e) => setProject(s => ({ ...s, prompt: e.target.value }))}
                                    placeholder="اوصف البراند بتاعك وهدفك إيه الشهر ده؟ (مثلاً: زيادة مبيعات شنط الجلد، بناء ثقة، إلخ...)"
                                    className="w-full bg-black/20 border border-white/5 rounded-[2rem] p-8 text-xl font-bold text-white outline-none focus:border-orange-500/30 min-h-[180px] resize-none shadow-inner"
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase pr-2">سوقك المستهدف</label>
                                        <select value={project.targetMarket} onChange={(e) => setProject(s => ({ ...s, targetMarket: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-orange-500/30">{TARGET_MARKETS.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase pr-2">اللهجة</label>
                                        <select value={project.dialect} onChange={(e) => setProject(s => ({ ...s, dialect: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-orange-500/30">{DIALECTS.map(d => <option key={d} value={d}>{d}</option>)}</select>
                                    </div>
                                </div>

                                <button
                                    onClick={onCreateCalendar}
                                    disabled={project.isGenerating || !project.prompt.trim()}
                                    className="w-full bg-gradient-to-r from-orange-600 to-orange-400 text-black font-black py-6 rounded-2xl text-2xl shadow-[0_20px_40px_rgba(249,115,22,0.2)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                                >
                                    {project.isGenerating ? 'جاري تصميم الخطة الكاملة...' : 'توليد تقويم الـ 30 يوم 🚀'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Calendar View */}
                {project.days.length > 0 && (
                    <div className="space-y-10 animate-in slide-in-from-bottom-5 duration-700">
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {project.days.map((day, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedDay(day)}
                                        className="bg-white/5 rounded-3xl p-5 border border-white/5 hover:border-orange-500/40 hover:bg-white/10 transition-all cursor-pointer group relative overflow-hidden flex flex-col gap-3 min-h-[180px]"
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="text-[10px] font-black text-slate-500 uppercase">Day {idx + 1}</span>
                                            {getTypeIcon(day.type)}
                                        </div>
                                        <h4 className="text-sm font-black text-white line-clamp-2 leading-tight">{day.title}</h4>
                                        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
                                            <span className="text-[9px] font-bold text-slate-500">{getTypeLabel(day.type)}</span>
                                            <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-orange-500" />
                                        </div>
                                        {day.image && (
                                            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <img src={`data:${day.image.mimeType};base64,${day.image.base64}`} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {project.days.map((day, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedDay(day)}
                                        className="bg-white/5 rounded-2xl p-6 border border-white/5 flex items-center gap-6 hover:bg-white/10 transition-all cursor-pointer group"
                                    >
                                        <div className="w-16 h-16 rounded-xl bg-black/40 flex flex-col items-center justify-center border border-white/5 shrink-0">
                                            <span className="text-[10px] font-black text-slate-500 uppercase leading-none">Day</span>
                                            <span className="text-xl font-black text-white">{idx + 1}</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                {getTypeIcon(day.type)}
                                                <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest">{getTypeLabel(day.type)}</span>
                                            </div>
                                            <h4 className="text-lg font-black text-white">{day.title}</h4>
                                        </div>
                                        <div className="p-3 rounded-xl bg-white/5 group-hover:bg-orange-500 group-hover:text-black transition-all">
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-center pt-10">
                            <button
                                onClick={() => setProject(s => ({ ...s, days: [] }))}
                                className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 font-black hover:text-white transition-all hover:bg-white/10"
                            >
                                إنشاء تقويم جديد 🔄
                            </button>
                        </div>
                    </div>
                )}

                {/* Detail Modal / Overlay */}
                {selectedDay && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedDay(null)}></div>
                        <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-4xl relative z-10 flex flex-col md:flex-row max-h-[90vh]">
                            <div className="w-full md:w-1/2 bg-black relative aspect-square md:aspect-auto">
                                {selectedDay.image ? (
                                    <img src={`data:${selectedDay.image.mimeType};base64,${selectedDay.image.base64}`} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-white/5 animate-pulse">
                                        {selectedDay.isLoading ? (
                                            <>
                                                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-orange-500 font-black text-xs">جاري تخيل المشهد...</span>
                                            </>
                                        ) : (
                                            <span className="text-slate-600 font-black text-xs">اضغط لتوليد الصورة</span>
                                        )}
                                    </div>
                                )}
                                <div className="absolute top-6 left-6 flex flex-col gap-2">
                                    <span className="px-4 py-1.5 bg-black/60 backdrop-blur-md text-white rounded-full text-[10px] font-black border border-white/10">Day {project.days.indexOf(selectedDay) + 1}</span>
                                    <div className="px-4 py-1.5 bg-orange-500 text-black rounded-full text-[10px] font-black flex items-center gap-2">
                                        {getTypeIcon(selectedDay.type)}
                                        {getTypeLabel(selectedDay.type)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 p-8 md:p-12 overflow-y-auto space-y-8 custom-scrollbar">
                                <div className="space-y-4">
                                    <h3 className="text-3xl font-black text-white leading-tight">{selectedDay.title}</h3>
                                    <p className="text-lg text-slate-300 leading-relaxed font-bold italic line-height-relaxed">"{selectedDay.caption}"</p>
                                </div>

                                {selectedDay.script && (
                                    <div className="space-y-4 p-6 bg-purple-500/5 border border-purple-500/20 rounded-3xl">
                                        <h5 className="text-purple-400 font-black flex items-center gap-2">
                                            <Video size={16} /> سكريبت الفيديو
                                        </h5>
                                        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-medium">{selectedDay.script}</p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">تفاصيل المشهد البصري</h5>
                                    <p className="text-xs text-slate-400 font-bold leading-relaxed">✨ {selectedDay.visualPrompt}</p>
                                </div>

                                <div className="flex flex-col gap-3 pt-4">
                                    <button
                                        onClick={() => onBridgeToPhotoshoot(selectedDay.visualPrompt)}
                                        className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black hover:bg-orange-500 hover:text-black transition-all flex items-center justify-center gap-2 group"
                                    >
                                        📸 تصوير المنتج لهذا البوست
                                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <button
                                        onClick={() => window.dispatchEvent(new CustomEvent('openImageEditor', { detail: selectedDay.image }))}
                                        disabled={!selectedDay.image}
                                        className="w-full py-4 bg-orange-500 text-black rounded-2xl font-black shadow-lg hover:scale-[1.02] transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                                    >
                                        ✏️ تعديل وإضافة نصوص
                                    </button>
                                    <button
                                        onClick={() => setSelectedDay(null)}
                                        className="w-full py-4 text-slate-500 font-black hover:text-white transition-all text-sm"
                                    >
                                        إغلاق
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default ContentCalendarHub;
