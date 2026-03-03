import React, { useState } from 'react';
import { OrganicStudioProject } from '../types';
import { askGemini } from '../services/geminiService';
import { parseRobustJSON } from '../utils/safeJson';
import { Sparkles, MessageSquare, Video, Lightbulb, Send, Copy, CheckCircle2, Share2 } from 'lucide-react';

interface OrganicViralStudioProps {
    project: OrganicStudioProject;
    setProject: React.Dispatch<React.SetStateAction<OrganicStudioProject>>;
    userId: string;
    onSendToDesign?: (content: string) => void;
}

const OrganicViralStudio: React.FC<OrganicViralStudioProps> = ({ project, setProject, userId, onSendToDesign }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [copiedIdx, setCopiedIdx] = useState<string | null>(null);
    const [reasoningMsg, setReasoningMsg] = useState('جاري تحليل المحتوى...');

    const reasoningMessages = [
        'جاري تحليل الفئة المستهدفة...',
        'البحث عن أفضل الخطافات (Hooks) للتريند...',
        'كتابة سكريبتات بأسلوب القصص المؤثرة...',
        'تجهيز أفكار تفاعلية لزيادة الوصول الأورجانيك...',
        'تنسيق الخطة النهائية لبراندك...'
    ];

    const handleGenerate = async () => {
        if (!project.description || !project.targetAudience) return;
        setIsGenerating(true);
        setProject(p => ({ ...p, progress: 10, isGenerating: true }));

        // Cycle reasoning messages
        let msgIdx = 0;
        const interval = setInterval(() => {
            setReasoningMsg(reasoningMessages[msgIdx % reasoningMessages.length]);
            msgIdx++;
        }, 3000);

        try {
            const prompt = `
            You are a World-Class Viral Content Strategist. 
            Create an organic viral content pack for:
            - Business/Product: ${project.description}
            - Target Audience: ${project.targetAudience}
            - Tone: ${project.tone}
            - Language: Arabic (Egyptian Dialect Preferred for social)
            
            Output MUST be JSON:
            {
                "strategy": "A brief 2-sentence viral strategy for this niche",
                "posts": [
                    {"hook": "Headline", "body": "Caption text", "tags": "#tags"}
                ],
                "reels": [
                    {"title": "Reel Topic", "script": "Step by step script", "tone": "Educational/POV"}
                ],
                "ideas": ["Idea 1", "Idea 2", "Idea 3", "Idea 4", "Idea 5"]
            }
            Generate 5 posts, 2 reel scripts, and 10 engagement ideas.
            `;

            setProject(p => ({ ...p, progress: 40 }));
            const aiText = await askGemini(prompt, "Viral Content Strategist");
            const data = parseRobustJSON(aiText, { strategy: '', posts: [], reels: [], ideas: [] });

            setProject(p => ({
                ...p,
                progress: 100,
                isGenerating: false,
                result: data
            }));
        } catch (e) {
            console.error(e);
            setProject(p => ({ ...p, isGenerating: false, error: 'حدث خطأ في توليد المحتوى. حاول مرة أخرى.' }));
        } finally {
            setIsGenerating(false);
            // @ts-ignore
            if (typeof interval !== 'undefined') clearInterval(interval);
        }
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedIdx(id);
        setTimeout(() => setCopiedIdx(null), 2000);
    };

    if (project.result) {
        return (
            <div className="w-full max-w-6xl mx-auto py-10 space-y-12 animate-in fade-in slide-in-from-bottom-5 text-right" dir="rtl">
                {/* Header Section */}
                <div className="relative group/header overflow-hidden rounded-[3rem] p-10 border border-emerald-500/20 bg-black shadow-4xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-50 group-hover/header:opacity-70 transition-opacity duration-700"></div>
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div>
                            <h2 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
                                <span className="animate-bounce">🌿</span> استراتيجيتك للفيرال جاهزة!
                            </h2>
                            <p className="text-emerald-400 font-bold text-lg leading-relaxed max-w-2xl">{project.result.strategy}</p>
                        </div>
                        <button
                            onClick={() => setProject(p => ({ ...p, result: null, progress: 0 }))}
                            className="px-8 py-4 bg-emerald-500 text-black font-black rounded-2xl hover:bg-emerald-400 hover:scale-105 transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap"
                        >
                            خطة جديدة 🔄
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Posts Section */}
                    <div className="lg:col-span-12 xl:col-span-8 space-y-6">
                        <div className="flex items-center gap-3 pr-4 border-r-4 border-emerald-500">
                            <MessageSquare className="text-emerald-500" />
                            <h3 className="text-2xl font-black text-white">بوستات فيسبوك وإنستجرام</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(project.result.posts || []).map((post: any, i: number) => (
                                <div key={i} className="glass-card p-8 rounded-[2.5rem] border border-white/5 bg-white/5 space-y-4 relative group">
                                    <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleCopy(`${post.hook}\n\n${post.body}\n\n${post.tags}`, `post-${i}`)}
                                            className="p-3 bg-emerald-500 text-black rounded-xl hover:scale-110 transition-transform"
                                        >
                                            {copiedIdx === `post-${i}` ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                        </button>
                                        <button
                                            onClick={() => onSendToDesign?.(`${post.hook}: ${post.body}`)}
                                            className="p-3 bg-white/20 text-white rounded-xl hover:bg-emerald-500 hover:text-black transition-all flex items-center gap-2 mt-2 group/btn"
                                            title="إرسال إلى استوديو التصميم"
                                        >
                                            <Sparkles size={16} />
                                            <span className="text-[10px] font-black hidden group-hover/btn:block">تصميم بالذكاء ✨</span>
                                        </button>
                                    </div>
                                    <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full uppercase">بوست {i + 1}</span>
                                    <h4 className="text-lg font-black text-white leading-tight">{post.hook}</h4>
                                    <p className="text-sm text-slate-400 font-medium leading-relaxed line-clamp-6">{post.body}</p>
                                    <p className="text-emerald-500/60 text-[10px] font-bold">{post.tags}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reels Section */}
                    <div className="lg:col-span-12 xl:col-span-4 space-y-6">
                        <div className="flex items-center gap-3 pr-4 border-r-4 border-blue-500">
                            <Video className="text-blue-500" />
                            <h3 className="text-2xl font-black text-white">سكريبتات ريلز (Viral)</h3>
                        </div>
                        <div className="space-y-6">
                            {(project.result.reels || []).map((reel: any, i: number) => (
                                <div key={i} className="glass-card p-8 rounded-[2.5rem] border border-blue-500/10 bg-blue-500/5 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full">سكريبت {i + 1}</span>
                                        <button onClick={() => handleCopy(reel.script, `reel-${i}`)} className="text-blue-400 text-xs font-bold hover:text-white">
                                            {copiedIdx === `reel-${i}` ? 'تم النسخ!' : 'نسخ السكريبت'}
                                        </button>
                                    </div>
                                    <h4 className="text-md font-black text-white">🎬 {reel.title}</h4>
                                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                        <p className="text-[11px] text-slate-300 font-medium leading-relaxed whitespace-pre-line">{reel.script}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Ideas Section */}
                        <div className="mt-12 space-y-6">
                            <div className="flex items-center gap-3 pr-4 border-r-4 border-yellow-500">
                                <Lightbulb className="text-yellow-500" />
                                <h3 className="text-2xl font-black text-white">أفكار تفاعلية (Engagement)</h3>
                            </div>
                            <div className="glass-card p-6 rounded-[2.5rem] border border-yellow-500/10 bg-yellow-500/5 group">
                                <ul className="space-y-4">
                                    {(project.result.ideas || []).map((idea: any, i: number) => (
                                        <li key={i} className="flex items-start gap-3 border-b border-white/5 pb-3 last:border-0">
                                            <span className="text-yellow-500 font-black mt-1">✦</span>
                                            <span className="text-xs text-slate-300 font-bold leading-relaxed">{idea}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <main className="w-full py-10 animate-in fade-in duration-700 text-right" dir="rtl">
            <div className="max-w-5xl mx-auto space-y-12">
                <div className="space-y-4 text-center">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-6 py-2 rounded-full border border-emerald-500/20 mb-4 animate-pulse">
                        <Sparkles size={16} />
                        <span className="text-xs font-black uppercase tracking-widest">تحديث الأورجانيك الجديد</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight">Organic Viral Studio 🌿</h1>
                    <p className="text-slate-400 text-lg md:text-2xl font-bold max-w-2xl mx-auto">اصنع محتوى ينتشر طبيعياً بدون سنت واحد إعلانات. قصص، تعليم، وتفاعل حقيقي.</p>
                </div>

                <div className="glass-card rounded-[4rem] p-10 md:p-16 border border-white/10 shadow-2xl space-y-12 bg-black/40 backdrop-blur-3xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left Side: Inputs */}
                        <div className="space-y-10">
                            <div className="space-y-6">
                                <label className="text-sm font-black text-emerald-400 uppercase tracking-widest flex items-center gap-3">
                                    <Send size={18} />
                                    <span>ما هو نشاطك أو منتجك؟</span>
                                </label>
                                <textarea
                                    value={project.description}
                                    onChange={e => setProject(p => ({ ...p, description: e.target.value }))}
                                    placeholder="مثلاً: متجر لبيع الملابس المستدامة للعناية بالبيئة..."
                                    className="w-full h-40 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 font-bold text-white outline-none focus:border-emerald-500 shadow-inner resize-none text-lg leading-relaxed placeholder:text-slate-600 transition-all"
                                />
                            </div>

                            <div className="space-y-6">
                                <label className="text-sm font-black text-emerald-400 uppercase tracking-widest flex items-center gap-3">
                                    <Sparkles size={18} />
                                    <span>نبرة الصوت (Tone)</span>
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: 'storytelling', label: 'قصصي ومؤثر', icon: '📖' },
                                        { id: 'educational', label: 'تعليمي ومعلم', icon: '🧠' },
                                        { id: 'humorous', label: 'كوميدي وتريند', icon: '🤣' },
                                        { id: 'controversial', label: 'مثير للجدل', icon: '🔥' }
                                    ].map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => setProject(p => ({ ...p, tone: t.id }))}
                                            className={`p-5 rounded-3xl font-black text-sm border-2 transition-all flex flex-col items-center gap-2 ${project.tone === t.id ? 'bg-emerald-500 border-emerald-500 text-black shadow-[0_10px_30px_rgba(16,185,129,0.3)]' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'}`}
                                        >
                                            <span className="text-2xl">{t.icon}</span>
                                            <span>{t.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Audience */}
                        <div className="space-y-10">
                            <div className="space-y-6">
                                <label className="text-sm font-black text-emerald-400 uppercase tracking-widest flex items-center gap-3">
                                    <Share2 size={18} />
                                    <span>مين جمهورك المستهدف؟</span>
                                </label>
                                <textarea
                                    value={project.targetAudience}
                                    onChange={e => setProject(p => ({ ...p, targetAudience: e.target.value }))}
                                    placeholder="مثلاً: بنات من 20 لـ 35 مهتمين بالموضة والبيئة في القاهرة..."
                                    className="w-full h-40 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 font-bold text-white outline-none focus:border-emerald-500 shadow-inner resize-none text-lg leading-relaxed placeholder:text-slate-600 transition-all"
                                />
                            </div>

                            <div className="p-8 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/10 space-y-4">
                                <h4 className="text-emerald-400 font-black flex items-center gap-2">
                                    <Lightbulb size={18} />
                                    <span>ليه تختار الأورجانيك؟</span>
                                </h4>
                                <p className="text-xs text-slate-400 font-bold leading-relaxed">المحتوى الأورجانيك بيبني "ثقة" حقيقية مع الناس. الإعلانات بتجيب بيع، بس الأورجانيك بيجيب "عملاء دائمين" ومعجبين ببراندك.</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !project.description || !project.targetAudience}
                        className="w-full h-24 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-black font-black rounded-[2.5rem] text-2xl md:text-3xl shadow-[0_20px_60px_rgba(16,185,129,0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-6 group overflow-hidden relative border border-white/20"
                    >
                        <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                        <span className="relative z-10">
                            {isGenerating ? (
                                <div className="flex flex-col items-center">
                                    <span className="text-xl animate-pulse font-black uppercase tracking-widest">{reasoningMsg}</span>
                                    <div className="w-64 h-1.5 bg-black/20 rounded-full mt-3 overflow-hidden">
                                        <div className="h-full bg-black transition-all duration-700 ease-out" style={{ width: `${project.progress}%` }}></div>
                                    </div>
                                </div>
                            ) : (
                                <>توليد الخطة الفيروسية 🚀</>
                            )}
                        </span>
                    </button>
                </div>
            </div>
        </main>
    );
};

export default OrganicViralStudio;
