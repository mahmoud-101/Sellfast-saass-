
import React, { useState } from 'react';
import { MarketingStudioProject } from '../types';
import { generateMarketingAnalysis } from '../services/geminiService';
import { saveGeneratedAsset } from '../lib/supabase';

const MarketingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const LOGO_IMAGE_URL = "https://i.ibb.co/MDrpHPzS/Artboard-1.png";

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

interface Props {
    project: MarketingStudioProject;
    setProject: React.Dispatch<React.SetStateAction<MarketingStudioProject>>;
    onBridgeToPlan: (context: string) => void;
    userId: string;
}

const MarketingStudio: React.FC<Props> = ({ project, setProject, onBridgeToPlan, userId }) => {
    const [copied, setCopied] = useState(false);

    const onGenerate = async () => {
        if (project.brandType === 'new' && (!project.brandName || !project.specialty)) {
            setProject(s => ({ ...s, error: 'Please enter brand name and specialty' }));
            return;
        }
        if (project.brandType === 'existing' && !project.websiteLink) {
            setProject(s => ({ ...s, error: 'Please enter a website link' }));
            return;
        }

        setProject(s => ({ ...s, isGenerating: true, error: null, result: null }));
        try {
            const data = project.brandType === 'new'
                ? { type: project.brandType, name: project.brandName, specialty: project.specialty, brief: project.brief }
                : { type: project.brandType, link: project.websiteLink };

            const strategy = await generateMarketingAnalysis(data as any, project.language);

            await saveGeneratedAsset(userId, 'MARKETING_PLAN', { plan_content: strategy }, data);

            setProject(s => ({ ...s, result: strategy, isGenerating: false }));
        } catch (err) {
            setProject(s => ({ ...s, isGenerating: false, error: 'Strategy generation failed. Please try again.' }));
        }
    };

    return (
        <main className="w-full flex flex-col gap-8 pt-4 pb-12 animate-in fade-in duration-700">
            <div className="bg-white/5 rounded-[2.5rem] p-8 shadow-xl border border-white/5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <h2 className="text-3xl font-black text-white tracking-tighter flex items-center">
                        <MarketingIcon /> استراتيجية النمو السريع
                    </h2>
                    {project.result && (
                        <button onClick={() => onBridgeToPlan(project.result || '')} className="bg-[#FFD700] text-black px-8 py-3 rounded-2xl font-black text-xs shadow-glow hover:scale-105 transition-all animate-in zoom-in">
                            🗓️ بناء خطة المحتوى بناءً على التحليل
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-5 space-y-6">
                        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
                            <button onClick={() => setProject(s => ({ ...s, brandType: 'new' }))} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${project.brandType === 'new' ? 'bg-[#FFD700] text-black shadow-md' : 'text-slate-400'}`}>براند جديد</button>
                            <button onClick={() => setProject(s => ({ ...s, brandType: 'existing' }))} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${project.brandType === 'existing' ? 'bg-[#FFD700] text-black shadow-md' : 'text-slate-400'}`}>براند قائم</button>
                        </div>
                        {project.brandType === 'new' ? (
                            <div className="space-y-4 text-right">
                                <input value={project.brandName} onChange={e => setProject(s => ({ ...s, brandName: e.target.value }))} placeholder="اسم البراند" className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold outline-none text-white focus:border-[#FFD700]" />
                                <input value={project.specialty} onChange={e => setProject(s => ({ ...s, specialty: e.target.value }))} placeholder="التخصص" className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold outline-none text-white focus:border-[#FFD700]" />
                                <textarea value={project.brief} onChange={e => setProject(s => ({ ...s, brief: e.target.value }))} rows={4} placeholder="وصف المشروع..." className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold outline-none resize-none text-white focus:border-[#FFD700]" />
                            </div>
                        ) : (
                            <input value={project.websiteLink} onChange={e => setProject(s => ({ ...s, websiteLink: e.target.value }))} placeholder="https://website.com" className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold outline-none text-white focus:border-[#FFD700]" />
                        )}
                        <button onClick={onGenerate} disabled={project.isGenerating} className="w-full bg-[#FFD700] hover:bg-yellow-400 text-black font-black py-5 rounded-2xl shadow-xl transition-all">
                            {project.isGenerating ? 'جاري التحليل...' : 'توليد الاستراتيجية الذكية'}
                        </button>
                    </div>
                    <div className="lg:col-span-7 bg-black/40 border border-white/10 rounded-3xl p-8 overflow-y-auto max-h-[500px] text-right" dir="rtl">
                        {project.result ? (
                            <div className="prose prose-invert max-w-none text-slate-200 font-medium whitespace-pre-wrap">{project.result}</div>
                        ) : (
                            <div className="h-full flex items-center justify-center opacity-20 flex-col gap-4">
                                <div className="text-6xl">🎯</div>
                                <p className="font-black text-xs uppercase tracking-widest text-white">Strategy Ready</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default MarketingStudio;
