
import React from 'react';

const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const LandingPage: React.FC<{onGetStarted: () => void}> = ({ onGetStarted }) => {
    return (
        <div className="min-h-screen bg-black text-white overflow-x-hidden font-sans selection:bg-yellow-500/30" dir="rtl">
            {/* Background Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-yellow-600/5 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-600/5 blur-[120px] rounded-full animate-pulse"></div>
            </div>

            {/* Hero Section */}
            <section className="relative pt-32 pb-48 px-6 z-10">
                <div className="max-w-7xl mx-auto text-center space-y-12">
                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-[#FFD700] animate-in fade-in slide-in-from-top-4 duration-700">
                        <span className="w-2 h-2 bg-[#FFD700] rounded-full animate-ping"></span>
                        مستقبل الإنتاج الإبداعي وصل
                    </div>

                    <h1 className="text-6xl md:text-[120px] font-black leading-[0.9] tracking-tighter animate-in fade-in slide-in-from-bottom-8 duration-1000 uppercase">
                        All-in-One <br />
                        <span className="italic text-[#FFD700]">Image & Video</span> <br />
                        Studio
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        One Subscription for All AI Visual Tools. <br />
                        حول أفكارك إلى حملات إعلانية، صور منتجات سينمائية، وفيديوهات ريلز احترافية في ثوانٍ.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center pt-10 animate-in fade-in zoom-in-95 duration-1000 delay-300">
                        <button onClick={onGetStarted} className="group bg-[#FFD700] text-black px-14 py-6 text-xl font-black rounded-full hover:scale-105 active:scale-95 transition-all flex items-center gap-4 shadow-[0_20px_50px_rgba(255,215,0,0.2)]">
                            ابدأ مجاناً اليوم <ArrowLeftIcon />
                        </button>
                    </div>
                </div>
            </section>

            {/* Proof Section */}
            <section className="py-24 border-y border-white/5 bg-black/40 backdrop-blur-xl relative z-10">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                    {[
                        { label: "صور تم توليدها", val: "+500K" },
                        { label: "علامة تجارية", val: "12,000" },
                        { label: "دقة الرندرة", val: "4K UHD" },
                        { label: "سرعة التنفيذ", val: "3 SEC" }
                    ].map((s, i) => (
                        <div key={i} className="space-y-2 group">
                            <div className="text-5xl font-black text-white tracking-tighter group-hover:text-[#FFD700] transition-colors">{s.val}</div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Visual Service Grid */}
            <section className="py-40 px-6 relative z-10">
                <div className="max-w-7xl mx-auto space-y-24">
                    <div className="text-center space-y-4">
                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight italic">نظام المستويات الثلاثة</h2>
                        <p className="text-slate-500 text-xl font-bold">رحلة متكاملة من الفكرة إلى السيطرة على السوق.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            { i: "🟣", t: "Generate Ad", d: "صياغة السكريبتات البيعية، الخطافات الإعلانية، وأفكار الـ UGC التي لا تُقاوم.", color: "border-yellow-500/20" },
                            { i: "🔵", t: "Create Visuals", d: "مركز التصوير والتحريك.. حول صور موبايلك لمشاهد سينمائية وفيديوهات موديلز 4K.", color: "border-yellow-500/20" },
                            { i: "🟢", t: "Scale Content", d: "بناء استراتيجية النمو، تحليل المنافسين، وجدولة محتواك لأسابيع قادمة.", color: "border-yellow-500/20" }
                        ].map((item, idx) => (
                            <div key={idx} className={`group p-12 rounded-[3rem] bg-white/5 border ${item.color} hover:bg-white/10 transition-all hover:-translate-y-4 relative overflow-hidden shadow-2xl`}>
                                <div className="text-6xl mb-10">{item.i}</div>
                                <h3 className="text-3xl font-black mb-4 text-white italic uppercase tracking-tighter">{item.t}</h3>
                                <p className="text-slate-400 text-lg font-medium leading-relaxed">{item.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
