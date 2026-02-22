
import React, { useState } from 'react';
import { MarketingStudioProject } from '../types';
import { generateMarketingAnalysis } from '../services/geminiService';

interface Props {
    project: MarketingStudioProject;
    setProject: React.Dispatch<React.SetStateAction<MarketingStudioProject>>;
    onBridgeToPlan: (context: string) => void;
}

// Parse markdown sections into cards
const parseResultSections = (text: string) => {
    const sections: { icon: string; title: string; content: string }[] = [];
    const iconMap: Record<string, string> = {
        'الجمهور': '🎯', 'رسائل': '💥', 'ميزة': '🏆', 'قنوات': '📱',
        'خطة': '📆', 'توصية': '💰', 'استراتيج': '📊', 'تنافسية': '⚔️',
    };
    const lines = text.split('\n');
    let current: { icon: string; title: string; content: string } | null = null;
    for (const line of lines) {
        if (line.startsWith('## ') || line.startsWith('# ')) {
            if (current) sections.push(current);
            const title = line.replace(/^#+\s*/, '').replace(/[🎯💥🏆📱📆💰📊⚔️]/g, '').trim();
            const icon = Object.entries(iconMap).find(([k]) => title.includes(k))?.[1] || '📋';
            current = { icon, title, content: '' };
        } else if (current) {
            current.content += line + '\n';
        }
    }
    if (current) sections.push(current);
    return sections.filter(s => s.content.trim());
};

const MarketingStudio: React.FC<Props> = ({ project, setProject, onBridgeToPlan }) => {
    const [copied, setCopied] = useState(false);

    const onGenerate = async () => {
        if (project.brandType === 'new' && (!project.brandName || !project.specialty)) {
            setProject(s => ({ ...s, error: 'من فضلك أدخل اسم البراند والتخصص' }));
            return;
        }
        if (project.brandType === 'existing' && !project.websiteLink) {
            setProject(s => ({ ...s, error: 'من فضلك أدخل رابط الموقع' }));
            return;
        }
        setProject(s => ({ ...s, isGenerating: true, error: null, result: null }));
        try {
            const data = project.brandType === 'new'
                ? { type: project.brandType, name: project.brandName, specialty: project.specialty, brief: project.brief }
                : { type: project.brandType, link: project.websiteLink };
            const strategy = await generateMarketingAnalysis(data as any, project.language);
            setProject(s => ({ ...s, result: strategy, isGenerating: false }));
        } catch (err) {
            setProject(s => ({ ...s, isGenerating: false, error: 'فشل التحليل، حاول مرة أخرى' }));
        }
    };

    const sections = project.result ? parseResultSections(project.result) : [];

    return (
        <main className="w-full flex flex-col gap-8 pt-4 pb-12 animate-in fade-in duration-700 text-right" dir="rtl">

            {/* Input Panel */}
            <div className="bg-white/5 rounded-[2.5rem] p-8 shadow-xl border border-white/5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-4xl font-black text-white tracking-tighter">استراتيجية النمو <span className="text-[#FFD700]">⚡</span></h2>
                        <p className="text-slate-400 font-bold mt-1">تحليل تسويقي شامل وخطة نمو قابلة للتنفيذ فوراً</p>
                    </div>
                    {project.result && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => { navigator.clipboard.writeText(project.result || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                                className="px-6 py-3 bg-white/10 text-white rounded-2xl font-black text-xs hover:bg-white/20 transition-all"
                            >{copied ? '✅ تم النسخ' : '📋 نسخ الكل'}</button>
                            <button
                                onClick={() => onBridgeToPlan(project.result || '')}
                                className="bg-[#FFD700] text-black px-6 py-3 rounded-2xl font-black text-xs shadow-glow hover:scale-105 transition-all"
                            >🗓️ بناء خطة المحتوى</button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-5 space-y-5">
                        {/* Brand type toggle */}
                        <div className="flex p-1 bg-black/40 rounded-2xl border border-white/10">
                            <button onClick={() => setProject(s => ({ ...s, brandType: 'new' }))} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${project.brandType === 'new' ? 'bg-[#FFD700] text-black shadow-md' : 'text-slate-400 hover:text-white'}`}>براند جديد ✨</button>
                            <button onClick={() => setProject(s => ({ ...s, brandType: 'existing' }))} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${project.brandType === 'existing' ? 'bg-[#FFD700] text-black shadow-md' : 'text-slate-400 hover:text-white'}`}>براند قائم 🏢</button>
                        </div>

                        {project.brandType === 'new' ? (
                            <div className="space-y-4">
                                <input value={project.brandName} onChange={e => setProject(s => ({ ...s, brandName: e.target.value }))} placeholder="اسم البراند" className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold outline-none text-white focus:border-[#FFD700] placeholder:text-slate-600" />
                                <input value={project.specialty} onChange={e => setProject(s => ({ ...s, specialty: e.target.value }))} placeholder="التخصص أو المجال (مثال: مستحضرات تجميل، ملابس رجالي...)" className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold outline-none text-white focus:border-[#FFD700] placeholder:text-slate-600" />
                                <textarea value={project.brief} onChange={e => setProject(s => ({ ...s, brief: e.target.value }))} rows={4} placeholder="وصف مختصر للمشروع، الجمهور المستهدف، أو أي معلومات إضافية مفيدة..." className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold outline-none resize-none text-white focus:border-[#FFD700] placeholder:text-slate-600" />
                            </div>
                        ) : (
                            <input value={project.websiteLink} onChange={e => setProject(s => ({ ...s, websiteLink: e.target.value }))} placeholder="https://yourstore.com" className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold outline-none text-white focus:border-[#FFD700] placeholder:text-slate-600" />
                        )}

                        <button onClick={onGenerate} disabled={project.isGenerating} className="w-full bg-[#FFD700] hover:bg-yellow-400 text-black font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                            {project.isGenerating ? (
                                <><div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin"></div> جاري التحليل الاستراتيجي...</>
                            ) : '🚀 توليد استراتيجية النمو'}
                        </button>
                        {project.error && <p className="text-red-400 text-center font-bold text-sm bg-red-500/10 rounded-2xl p-4">{project.error}</p>}
                    </div>

                    {/* Results */}
                    <div className="lg:col-span-7">
                        {project.isGenerating && (
                            <div className="h-[400px] flex flex-col items-center justify-center gap-6 bg-black/20 rounded-[2rem] border border-white/5">
                                <div className="w-16 h-16 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-[#FFD700] font-black text-sm animate-pulse">يحلل المحرك السوق ويبني استراتيجيتك...</p>
                            </div>
                        )}

                        {!project.isGenerating && sections.length > 0 && (
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                {sections.map((sec, i) => (
                                    <div key={i} className="bg-black/40 border border-white/5 rounded-[2rem] p-6 hover:border-[#FFD700]/20 transition-all">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-2xl">{sec.icon}</span>
                                            <h4 className="text-sm font-black text-[#FFD700]">{sec.title}</h4>
                                        </div>
                                        <div className="text-sm text-slate-300 font-bold leading-relaxed whitespace-pre-line">{sec.content.trim()}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!project.isGenerating && !project.result && (
                            <div className="h-[400px] flex flex-col items-center justify-center gap-4 opacity-20">
                                <div className="text-7xl">📈</div>
                                <p className="font-black text-sm uppercase tracking-widest text-white">استراتيجيتك هنا</p>
                            </div>
                        )}

                        {/* Fallback: raw text if no sections parsed */}
                        {!project.isGenerating && project.result && sections.length === 0 && (
                            <div className="bg-black/40 border border-white/10 rounded-3xl p-8 overflow-y-auto max-h-[600px] text-right">
                                <div className="text-slate-200 font-bold text-sm whitespace-pre-wrap leading-relaxed">{project.result}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default MarketingStudio;
