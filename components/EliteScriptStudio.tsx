
import React, { useState, useEffect, useRef } from 'react';
import { EliteScriptProject } from '../types';
import { createEliteAdChat, generateFlowVideo } from '../services/geminiService';
import { Chat } from '@google/genai';

const STEPS_LABELS: { [key: number]: string } = {
    1: 'الهوية', 2: 'المنتج', 3: 'التحول', 4: 'القوة', 5: 'الزمن', 6: 'الألم', 7: 'الإغلاق', 8: 'المعاينة', 9: 'السكريبت'
};

const STEP_OPTIONS: { [key: number]: string[] } = {
    1: ['أنا صاحب متجر إلكتروني طموح 🛒', 'أنا كوتش / مدرب أقدم دورات 🎓', 'أنا صاحب وكالة تسويق احترافية 📈', 'أنا خبير عقارات في السوق الخليجي 🏗️', 'أنا صانع محتوى UGC متخصص 📱'],
    2: ['أبيع منتجاً مادياً (شحن وتوصيل) 📦', 'أقدم دورة تدريبية أونلاين مسجلة 💻', 'أبيع خدمة استشارية B2B 🤝', 'أروج لبرنامج / تطبيق موبايل جديد 🚀', 'أبيع وحدات سكنية / عقارات استثمارية 🏠'],
    3: ['أحقق زيادة مبيعات بنسبة 300% 💰', 'أوفر على العميل 20 ساعة أسبوعياً ⏱️', 'أبني علامة تجارية قوية وموثوقة 💎', 'أجلب عملاء محتملين مهتمين جداً 🎯', 'أمنح العميل راحة بال تامة بضمان ✅'],
    4: ['منتجي مدعوم بالذكاء الاصطناعي 🤖', 'واجهة بسيطة جداً لأي مستخدم ✨', 'ضمان استرجاع أموال لمدة 30 يوم 🛡️', 'شحن مجاني وسريع لباب البيت 🚚', 'دعم فني بشري متاح 24/7 ☎️'],
    5: ['سيلاحظ العميل نتائج فورية ⚡', 'النتائج تظهر خلال 24 ساعة فقط 🔥', 'خلال أول أسبوع من الاستخدام 🗓️', 'تغيير جذري في أول 30 يوم 🌟'],
    6: ['العملاء يعانون من صعوبة الوصول للجمهور 😫', 'ضياع ميزانية الإعلانات بدون مبيعات 💸', 'الإرهاق من العمل اليدوي المتكرر 😩', 'المنافسة الشرسة التي تخطف العملاء 🥊', 'عدم وجود وقت كافي لتوسيع البيزنس ⌛'],
    7: ['اطلب العرض الحصري الآن 🛍️', 'سجل مجاناً في الدورة اليوم 📝', 'احجز استشارتك المجانية فوراً 📅', 'حمل دليلك المجاني الآن 📥', 'استخدم كود الخصم (PRO) 🎟️'],
    8: ['الجمهور مثالي، ابدأ صياغة السكريبت 🚀', 'أريد تعديل بعض التفاصيل 🔄']
};

interface Props {
    project: EliteScriptProject;
    setProject: any;
    onBridgeToVideo: (script: string) => void;
}

const EliteScriptStudio: React.FC<Props> = ({ project, setProject, onBridgeToVideo }) => {
    const [input, setInput] = useState('');
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [genStage, setGenStage] = useState<'IDLE' | 'FLOW' | 'LAPS' | 'WHISK'>('IDLE');
    const [videoStatus, setVideoStatus] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const chat = createEliteAdChat(project.currentMode);
        setChatSession(chat);
        const startChat = async () => {
            setProject((s: any) => ({ ...s, isGenerating: true }));
            try {
                const response = await chat.sendMessage({ message: "Hello, let's build an elite ad." });
                setProject((s: any) => ({ ...s, messages: [{ role: 'bot', text: response.text || '' }], isGenerating: false, step: 1 }));
            } catch (e) { setProject((s: any) => ({ ...s, isGenerating: false, error: 'فشل بدء المحرك' })); }
        };
        startChat();
    }, [project.currentMode]);

    useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [project.messages]);

    const handleSend = async (customText?: string) => {
        const textToSend = customText || input;
        if (!textToSend.trim() || !chatSession || project.isGenerating) return;
        setInput('');
        setProject((s: any) => ({ ...s, messages: [...s.messages, { role: 'user', text: textToSend }], isGenerating: true }));
        try {
            const response = await chatSession.sendMessage({ message: textToSend });
            setProject((s: any) => ({ ...s, messages: [...s.messages, { role: 'bot', text: response.text || '' }], isGenerating: false, step: s.step + 1 }));
        } catch (err) { setProject((s: any) => ({ ...s, isGenerating: false, error: "فشل الاتصال." })); }
    };

    const handleSelectKey = async () => {
        if ((window as any).aistudio?.openSelectKey) {
            await (window as any).aistudio.openSelectKey();
            return true;
        }
        return false;
    };

    const handleGenerateVideo = async () => {
        const lastMsg = project.messages[project.messages.length - 1];
        if (!lastMsg || lastMsg.role !== 'bot' || genStage !== 'IDLE') return;

        // التحقق من وجود مفتاح API
        const hasKey = await (window as any).aistudio?.hasSelectedApiKey?.() || false;
        if (!hasKey && !process.env.API_KEY) {
            const selected = await handleSelectKey();
            if (!selected) return;
        }

        setGenStage('FLOW');
        setVideoUrl(null);
        
        try {
            const url = await generateFlowVideo(lastMsg.text, "9:16", (msg) => {
                setVideoStatus(msg);
                if (msg.includes("رندرة")) setGenStage('LAPS');
                if (msg.includes("الظلال")) setGenStage('WHISK');
            });
            setVideoUrl(url);
            setVideoStatus("اكتمل الإنتاج بنجاح!");
        } catch (err: any) {
            if (err.message === "API_KEY_NOT_FOUND") {
                setVideoStatus("خطأ: المشروع غير موجود. يرجى اختيار مفتاح صالح.");
                await handleSelectKey();
            } else {
                setVideoStatus("خطأ: " + err.message);
            }
            setGenStage('IDLE');
        } finally {
            if (videoUrl) setGenStage('IDLE');
        }
    };

    const currentOptions = STEP_OPTIONS[project.step] || [];

    return (
        <div className="w-full max-w-7xl mx-auto py-6 md:py-10 animate-in fade-in duration-700 text-right px-4 font-tajawal" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl md:text-5xl font-black text-white italic">Elite Production Studio <span className="text-[#FFD700]">✨</span></h1>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Powered by Google Flow (Veo 3.1)</p>
                </div>
                <div className="flex gap-4">
                    {project.step >= 9 && (
                        <button onClick={() => onBridgeToVideo(project.messages[project.messages.length-1].text)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-[10px] font-black transition-all shadow-glow flex items-center gap-2 animate-pulse">
                            🚀 نقل إلى استوديو الموديلز
                        </button>
                    )}
                    <div className="bg-white/5 p-1 rounded-2xl border border-white/10 flex gap-1">
                        {['CLASSIC', 'FUNNY', 'UGC'].map(m => (
                            <button key={m} onClick={() => setProject((s: any) => ({ ...s, currentMode: m, messages: [], step: 1 }))} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${project.currentMode === m ? 'bg-[#FFD700] text-black shadow-lg' : 'text-slate-400'}`}>{m}</button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto lg:h-[880px]">
                <div className="lg:col-span-3 bg-black/40 border border-white/5 rounded-[3rem] p-6 flex flex-col gap-4 relative overflow-hidden">
                    <h3 className="text-[10px] font-black text-[#FFD700] uppercase tracking-widest text-center border-b border-white/5 pb-4">مراحل المحرك الذكي</h3>
                    <div className="space-y-2 relative z-10">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                            <div key={i} className={`flex items-center gap-4 p-3 rounded-2xl transition-all duration-500 ${project.step === i ? 'bg-[#FFD700]/10 border border-[#FFD700]/30' : 'opacity-20 grayscale'}`}>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${project.step > i ? 'bg-emerald-500 text-white' : project.step === i ? 'bg-[#FFD700] text-black shadow-glow' : 'bg-white/5 text-white'}`}>{project.step > i ? '✓' : i}</div>
                                <span className="text-[11px] font-black text-white">{STEPS_LABELS[i]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-9 flex flex-col gap-6">
                    <div className="flex-grow bg-black/40 border border-white/10 rounded-[3.5rem] flex flex-col overflow-hidden shadow-2xl relative">
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 no-scrollbar">
                            {project.messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[90%] md:max-w-[85%] p-6 md:p-10 rounded-[2.5rem] text-sm md:text-xl font-bold leading-relaxed shadow-2xl transition-all animate-in ${msg.role === 'user' ? 'bg-[#FFD700] text-black slide-in-from-left-4' : 'bg-white/5 border border-white/10 text-slate-100 slide-in-from-right-4'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            
                            {project.step >= 9 && (
                                <div className="flex flex-col items-center gap-10 py-10">
                                    {!videoUrl ? (
                                        <div className="w-full max-w-2xl space-y-6">
                                            <button onClick={handleGenerateVideo} disabled={genStage !== 'IDLE'} className={`w-full group relative px-16 py-10 rounded-[2.5rem] font-black text-2xl text-white transition-all overflow-hidden shadow-2xl ${genStage !== 'IDLE' ? 'bg-slate-800' : 'bg-[#FFD700] text-black hover:bg-yellow-400 hover:scale-[1.02] active:scale-95'}`}>
                                                {genStage === 'IDLE' ? <span className="flex items-center justify-center gap-4">🎬 إطلاق محرك الـ Flow للإنتاج</span> : <div className="flex flex-col items-center gap-4"><div className="flex gap-2"><div className={`w-3 h-3 rounded-full ${genStage === 'FLOW' ? 'bg-yellow-400 animate-ping' : 'bg-yellow-900'}`}></div><div className={`w-3 h-3 rounded-full ${genStage === 'LAPS' ? 'bg-yellow-400 animate-ping' : 'bg-yellow-900'}`}></div><div className={`w-3 h-3 rounded-full ${genStage === 'WHISK' ? 'bg-emerald-400 animate-ping' : 'bg-emerald-900'}`}></div></div><span className="text-sm tracking-widest">{videoStatus}</span></div>}
                                                <div className="absolute bottom-0 left-0 h-1 bg-black/20 transition-all duration-1000" style={{ width: genStage === 'FLOW' ? '33%' : genStage === 'LAPS' ? '66%' : genStage === 'WHISK' ? '90%' : '0%' }}></div>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-full max-w-lg aspect-[9/16] bg-black rounded-[4rem] overflow-hidden shadow-[0_0_100px_rgba(99,102,241,0.3)] border-8 border-white/5 relative group">
                                            <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-4 md:p-10 bg-black/60 border-t border-white/5 backdrop-blur-3xl">
                            {currentOptions.length > 0 && !project.isGenerating && (
                                <div className="mb-10 animate-in slide-in-from-bottom-4">
                                     <p className="text-[10px] font-black text-[#FFD700] uppercase tracking-widest mb-4 flex items-center gap-2"><span className="w-4 h-px bg-[#FFD700]"></span> استعارة قالب جاهز (Flow Template)</p>
                                     <div className="flex flex-wrap gap-3">
                                        {currentOptions.map((opt, i) => (
                                            <button key={i} onClick={() => handleSend(opt)} className="px-6 py-4 bg-white/5 hover:bg-[#FFD700] border border-white/10 hover:border-[#FFD700] rounded-2xl text-[11px] md:text-xs font-black text-white hover:text-black transition-all transform hover:scale-105 active:scale-95 shadow-lg group">{opt}</button>
                                        ))}
                                     </div>
                                </div>
                            )}

                            <div className="flex gap-4 items-center">
                                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="أو أضف تفاصيلك المخصصة هنا..." className="flex-grow bg-white/5 border border-white/10 rounded-3xl px-8 py-6 font-bold text-white outline-none focus:border-[#FFD700] transition-all text-sm md:text-lg shadow-inner" />
                                <button onClick={() => handleSend()} disabled={project.isGenerating} className="w-16 h-16 md:w-20 md:h-20 bg-white text-black rounded-3xl flex items-center justify-center shadow-glow-white hover:bg-[#FFD700] transition-all active:scale-90 disabled:opacity-20 group">
                                    <svg className="w-6 h-6 md:w-8 md:h-8 rotate-180 transform group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EliteScriptStudio;
