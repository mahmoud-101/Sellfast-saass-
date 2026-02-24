import React from 'react';
import DemoSection from './DemoSection';

const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const LandingPage: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
    return (
        <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden font-sans selection:bg-[#FFD700]/30" dir="rtl">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#FFD700] opacity-[0.03] blur-[150px] rounded-full"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#FFD700] opacity-[0.02] blur-[150px] rounded-full"></div>
                {/* Subtle Grid overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            </div>

            <main className="relative z-10 flex flex-col items-center">

                {/* Hero Section */}
                <section className="w-full max-w-7xl mx-auto px-6 pt-32 pb-40 text-center space-y-10">
                    <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-[#FFD700] mx-auto animate-in fade-in slide-in-from-top-10 duration-1000">
                        <span className="w-2 h-2 bg-[#FFD700] rounded-full animate-pulse shadow-[0_0_10px_#FFD700]"></span>
                        وكالتك التسويقية الكاملة بالذكاء الاصطناعي
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black leading-[1.1] tracking-tighter animate-in fade-in zoom-in-95 duration-1000 delay-150">
                        أسرع وأذكى طريقة لإنشاء <br />
                        <span className="text-[#FFD700] relative italic">
                            المحتوى الإعلاني
                            <svg className="absolute w-full h-4 -bottom-2 left-0 text-[#FFD700]/30" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="4" fill="transparent" /></svg>
                        </span>
                    </h1>

                    <p className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        نمي أعمالك في دقائق معدودة بدلاً من أسابيع. انضم إلى أكثر من ١٠,٠٠٠+ مسوق ناجح وقم بتسريع مبيعاتك بنقرة زر.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5 justify-center pt-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
                        <button onClick={onGetStarted} className="group bg-[#FFD700] text-black px-12 py-5 text-xl font-black rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_15px_40px_-10px_rgba(255,215,0,0.4)]">
                            دعنا نبدأ مجاناً الآن <ArrowLeftIcon />
                        </button>
                    </div>
                </section>

                {/* Features Hub (Glassmorphism Grid) */}
                <section className="w-full max-w-7xl mx-auto px-6 py-20">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">أدواتنا الذهبية</h2>
                        <p className="text-xl text-slate-400 font-medium">مجموعة متكاملة للسيطرة على السوق</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: "🗓️", title: "خطة المحتوى", desc: "جدولة ذكية وشاملة لمحتواك عبر جميع المنصات بضغطة زر واحدة." },
                            { icon: "🚀", title: "مصنع المبيعات", desc: "تحويل العملاء المحتملين إلى مشترين دائمين عبر استراتيجيات مجربة." },
                            { icon: "🎬", title: "صناعة الفيديوهات", desc: "إنتاج فيديوهات احترافية تجذب الانتباه دون الحاجة لخبرة في المونتاج." }
                        ].map((feature, i) => (
                            <div key={i} className="group flex flex-col p-10 bg-white/5 border border-white/5 hover:border-[#FFD700]/30 rounded-[2.5rem] backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 shadow-2xl hover:shadow-[#FFD700]/10">
                                <div className="text-5xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 origin-center">{feature.icon}</div>
                                <h3 className="text-2xl font-black text-white mb-3">{feature.title}</h3>
                                <p className="text-slate-400 font-medium leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Social Proof Stats */}
                <section className="w-full border-y border-white/5 bg-black/50 py-20 mt-20 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
                        {[
                            { val: "+10,000", label: "مسوق محترف" },
                            { val: "3 Seconds", label: "سرعة التنفيذ" },
                            { val: "4K UHD", label: "جودة الفيديوهات" },
                            { val: "+500K", label: "محتوى تم إنشاؤه" }
                        ].map((stat, idx) => (
                            <div key={idx} className="space-y-3 p-6 rounded-3xl hover:bg-white/5 transition-colors">
                                <div className="text-4xl md:text-5xl font-black text-[#FFD700] tracking-tighter">{stat.val}</div>
                                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── DEMO SECTION ── */}
                <section className="w-full max-w-7xl mx-auto px-6 py-24">
                    <DemoSection onGetStarted={onGetStarted} />
                </section>

                <div className="h-32"></div>
            </main>
        </div>
    );
};

export default LandingPage;
