
import React, { useState, useEffect } from 'react';

const TOOLS = [
    { icon: '🎬', name: 'مولّد السكريبت الفيرال', desc: 'UGC بالعامية المصرية يحرق المنافسين' },
    { icon: '🧠', name: 'محرك الأداء الإعلاني', desc: '9 زوايا إعلانية + لانش باك جاهز للرفع' },
    { icon: '📸', name: 'استوديو التصوير الذكي', desc: 'صور موبايل → تصوير سينمائي احترافي بـ 4K' },
    { icon: '✍️', name: 'مصنع الهوكس', desc: '10 هوكس يوقفون التمرير في 3 ثواني' },
    { icon: '📆', name: 'خطة المحتوى الذكية', desc: '9 منشورات متنوعة جاهزة للنشر الفوري' },
    { icon: '🎙️', name: 'مولّد التعليق الصوتي', desc: 'صوت احترافي بالعامية المصرية أو الخليجية' },
    { icon: '📊', name: 'محلّل الترندز العربية', desc: 'أسخن الترندز دلوقتي + أفكار محتوى فوري' },
    { icon: '🖼️', name: 'مولّد الصور الإعلانية', desc: 'صور إعلانية فوتوريالستيك بضغطة واحدة' },
];

const STATS = [
    { val: '+500K', label: 'صورة تم توليدها' },
    { val: '12,000+', label: 'علامة تجارية استخدمتنا' },
    { val: '3 ثواني', label: 'متوسط وقت التنفيذ' },
    { val: '4K UHD', label: 'جودة الإخراج' },
];

const TESTIMONIALS = [
    { name: 'أحمد سعيد', role: 'مدير تسويق - القاهرة', text: 'وفّرت 3 أيام في خطة المحتوى! الهوكس اللي بتطلعها أحسن من اللي كنا بنشتريه بـ 5000 جنيه.' },
    { name: 'فاطمة الراشد', role: 'صاحبة براند - الرياض', text: 'جرّبت كل الأدوات.. مفيش حاجة بتكلّم بالعربي الصح زي دي. حرفياً بتكلّمك كأنها ابن البلد.' },
    { name: 'كريم المنسي', role: 'ميديا باير - دبي', text: 'الـ Performance Studio وحدها أقوى من فريق كامل. الروا على الإعلانات ارتفع 40% الشهر الأول.' },
];

const LandingPage: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
    const [activeTestimonial, setActiveTestimonial] = useState(0);
    const [visibleTools, setVisibleTools] = useState(4);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveTestimonial(prev => (prev + 1) % TESTIMONIALS.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white overflow-x-hidden font-sans selection:bg-yellow-500/30" dir="rtl">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-yellow-600/6 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-yellow-600/4 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-white/[0.01] blur-[80px] rounded-full" />
            </div>

            {/* Hero */}
            <section className="relative pt-28 pb-40 px-6 z-10">
                <div className="max-w-6xl mx-auto text-center space-y-10">
                    <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-[11px] font-black uppercase tracking-[0.3em] text-[#FFD700] animate-in fade-in slide-in-from-top-4 duration-700">
                        <span className="w-2 h-2 bg-[#FFD700] rounded-full animate-ping inline-block" />
                        أول منصة AI عربية لإنتاج المحتوى الإعلاني
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black leading-[0.9] tracking-tighter animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        سيطر على السوق{' '}
                        <br />
                        <span className="italic text-[#FFD700]">بمحتوى يبيع</span>
                        <br />
                        فعلاً.
                    </h1>

                    <p className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        هوكس. سكريبتات. صور. فيديوهات. خطط. كل حاجة بالعربي.<br />
                        <span className="text-white font-bold">ابدأ دلوقتي — من غير ما تستأذن حد.</span>
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 animate-in fade-in zoom-in-95 duration-1000 delay-300">
                        <button
                            onClick={onGetStarted}
                            className="group bg-[#FFD700] text-black px-12 py-5 text-lg font-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_20px_60px_rgba(255,215,0,0.25)] flex items-center justify-center gap-3"
                        >
                            ابدأ مجاناً دلوقتي
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-180 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <button
                            onClick={onGetStarted}
                            className="px-12 py-5 text-lg font-black rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-all"
                        >
                            شوف كيف بيشتغل ←
                        </button>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 border-y border-white/5 bg-white/[0.02] backdrop-blur-xl relative z-10">
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
                    {STATS.map((s, i) => (
                        <div key={i} className="space-y-2 group">
                            <div className="text-4xl md:text-5xl font-black tracking-tighter group-hover:text-[#FFD700] transition-colors duration-300">{s.val}</div>
                            <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tools Grid */}
            <section className="py-32 px-6 relative z-10">
                <div className="max-w-6xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
                            كل الأدوات اللي محتاجها
                            <br />
                            <span className="text-[#FFD700] italic">في مكان واحد</span>
                        </h2>
                        <p className="text-slate-500 text-lg font-bold">مش محتاج تشتري 5 اشتراكات. كل حاجة هنا.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {TOOLS.slice(0, visibleTools).map((tool, idx) => (
                            <div
                                key={idx}
                                onClick={onGetStarted}
                                className="group p-7 rounded-[2rem] bg-white/[0.03] border border-white/8 hover:bg-white/[0.07] hover:border-yellow-500/30 transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                                style={{ animationDelay: `${idx * 80}ms` }}
                            >
                                <div className="text-4xl mb-4">{tool.icon}</div>
                                <h3 className="text-base font-black text-white mb-2">{tool.name}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">{tool.desc}</p>
                            </div>
                        ))}
                    </div>

                    {visibleTools < TOOLS.length && (
                        <div className="text-center">
                            <button
                                onClick={() => setVisibleTools(TOOLS.length)}
                                className="px-8 py-3 border border-white/10 rounded-full text-sm font-bold text-white/60 hover:text-white hover:border-white/30 transition-all"
                            >
                                شوف باقي الأدوات ({TOOLS.length - visibleTools} أدوات)
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* 3 Tiers */}
            <section className="py-24 px-6 bg-white/[0.02] border-y border-white/5 relative z-10">
                <div className="max-w-5xl mx-auto space-y-16">
                    <div className="text-center space-y-3">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter">نظام المستويات الثلاثة</h2>
                        <p className="text-slate-500 text-lg">رحلة متكاملة من الفكرة للسيطرة على السوق.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: '✍️', num: '01', t: 'ولّد المحتوى', d: 'سكريبتات فيرال، هوكس محرقة، كوبي إعلاني يبيع — بالعامية المصرية أو الخليجية.', color: 'border-yellow-500/20 hover:border-yellow-500/40' },
                            { icon: '🎨', num: '02', t: 'اصنع البيزوال', d: 'صوّر منتجك سينمائياً، صمّم إعلان، صنع فيديو — كل ده من صورة موبايل عادية.', color: 'border-blue-500/20 hover:border-blue-500/40' },
                            { icon: '🚀', num: '03', t: 'وسّع النطاق', d: 'خطة محتوى 9 أيام، تحليل المنافسين، جدولة ذكية — كل حاجة جاهزة للتنفيذ الفوري.', color: 'border-green-500/20 hover:border-green-500/40' },
                        ].map((item, idx) => (
                            <div key={idx} className={`group p-10 rounded-[2.5rem] bg-white/[0.03] border ${item.color} hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-3`}>
                                <div className="flex items-start justify-between mb-8">
                                    <div className="text-5xl">{item.icon}</div>
                                    <span className="text-[11px] font-black text-white/20 tracking-widest">{item.num}</span>
                                </div>
                                <h3 className="text-2xl font-black mb-4 text-white">{item.t}</h3>
                                <p className="text-slate-500 text-base leading-relaxed group-hover:text-slate-400 transition-colors">{item.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 px-6 relative z-10">
                <div className="max-w-3xl mx-auto text-center space-y-12">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter">بيقولوا إيه عننا</h2>
                    <div className="relative min-h-[160px]">
                        {TESTIMONIALS.map((t, i) => (
                            <div
                                key={i}
                                className={`absolute inset-0 transition-all duration-500 ${i === activeTestimonial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                            >
                                <div className="bg-white/[0.04] border border-white/8 rounded-3xl p-8 space-y-4">
                                    <p className="text-lg font-bold text-white leading-relaxed">"{t.text}"</p>
                                    <div>
                                        <div className="font-black text-[#FFD700]">{t.name}</div>
                                        <div className="text-sm text-slate-500">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center gap-2">
                        {TESTIMONIALS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveTestimonial(i)}
                                className={`w-2 h-2 rounded-full transition-all ${i === activeTestimonial ? 'bg-[#FFD700] w-6' : 'bg-white/20'}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-32 px-6 relative z-10">
                <div className="max-w-3xl mx-auto text-center space-y-10">
                    <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-tight">
                        المنافسون بدأوا.
                        <br />
                        <span className="text-[#FFD700] italic">انت لسّه فين؟</span>
                    </h2>
                    <button
                        onClick={onGetStarted}
                        className="group bg-[#FFD700] text-black px-16 py-6 text-xl font-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_30px_80px_rgba(255,215,0,0.3)]"
                    >
                        ابدأ مجاناً — مفيش بطاقة بنكية
                    </button>
                    <p className="text-slate-600 text-sm">انضم لـ 12,000+ صاحب بيزنس بيستخدم المنصة</p>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
