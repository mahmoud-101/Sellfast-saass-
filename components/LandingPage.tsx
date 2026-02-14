
import React from 'react';

const LOGO_IMAGE_URL = "https://i.ibb.co/MDrpHPzS/Artboard-1.png";

const LandingPage: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
    return (
        <div className="min-h-screen relative overflow-x-hidden font-tajawal selection:bg-purple-500/30">
            {/* Dynamic Background */}
            <div className="aurora-bg"></div>

            {/* Header */}
            <nav className="fixed top-0 w-full z-[100] backdrop-blur-xl bg-black/10 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="relative">
                            <div className="absolute inset-0 bg-purple-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <img src={LOGO_IMAGE_URL} alt="Ebdaa Pro" className="h-12 w-auto relative z-10" />
                        </div>
                        <span className="text-3xl font-black tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-200 transition-all">
                            إبداع <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">برو</span>
                        </span>
                    </div>
                    <button
                        onClick={onGetStarted}
                        className="btn-shiny px-8 py-3 rounded-2xl font-bold text-sm shadow-lg tracking-wide hover:shadow-purple-500/20"
                    >
                        دخول المنصة
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-48 pb-32 px-6 relative z-10">
                <div className="max-w-6xl mx-auto text-center space-y-10">
                    <div className="animate-float">
                        <div className="inline-flex px-6 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-xs font-bold uppercase tracking-[0.3em] text-purple-300 shadow-xl shadow-purple-900/20 mb-8">
                            ✨ مستقبلك الإبداعي يبدأ هنا
                        </div>
                    </div>

                    <h1 className="text-7xl md:text-9xl font-black leading-[0.9] tracking-tighter mix-blend-overlay opacity-50 absolute top-20 left-1/2 -translate-x-1/2 w-full pointer-events-none select-none">
                        CREATIVE
                    </h1>

                    <h1 className="text-6xl md:text-8xl font-black leading-tight tracking-tighter relative z-10 drop-shadow-2xl">
                        امتلك <span className="text-gradient">قوة الذكاء الاصطناعي</span><br /> في استوديو واحد
                    </h1>

                    <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto leading-relaxed font-light">
                        منصة واحدة تجمع لك المصور، المصمم، والمسوق المحترف. <br />
                        <span className="text-purple-300 font-medium">وفر الوقت، ضاعف الإنتاجية، وأبهر عملاءك.</span>
                    </p>

                    <div className="flex flex-wrap justify-center gap-6 pt-8">
                        <button onClick={onGetStarted} className="btn-shiny px-12 py-6 text-xl font-bold rounded-2xl min-w-[200px] hover:scale-105 transition-transform">
                            ابدأ الآن مجاناً 🚀
                        </button>
                        <a href="https://wa.me/201090624823" target="_blank" className="px-12 py-6 glass-card-premium text-white text-xl font-bold rounded-2xl hover:bg-white/5 transition-all min-w-[200px] flex items-center justify-center gap-3 group">
                            <span>تواصل معنا</span>
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Grid with Floating Cards */}
            <section className="py-24 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { title: "Power Studio", desc: "تحليل شامل للمنتجات، تصميم صور، وكتابة خطط محتوى في ثوانٍ.", icon: "⚡", color: "from-yellow-400 to-orange-500" },
                            { title: "Virtual Models", desc: "موديلز ذكاء اصطناعي سعوديين، مصريين، وعالميين لعرض منتجاتك.", icon: "👗", color: "from-pink-400 to-rose-500" },
                            { title: "AI Cinema", desc: "إنتاج فيديوهات إعلانية سينمائية (Reels) تجذب الانتباه.", icon: "🎬", color: "from-cyan-400 to-blue-500" },
                            { title: "UGC Creator", desc: "صور عفوية بكاميرا 'جوال' لزيادة المصداقية والثقة.", icon: "🤳", color: "from-green-400 to-emerald-500" },
                            { title: "Brand Identity", desc: "هوية بصرية كاملة، لوجو، وموك-آب احترافي بضغطة زر.", icon: "🎨", color: "from-purple-400 to-indigo-500" },
                            { title: "Smart Copy", desc: "كتابة نصوص إعلانية (Copywriting) تفهم سيكولوجية العميل.", icon: "✍️", color: "from-red-400 to-pink-500" },
                        ].map((f, i) => (
                            <div key={i} className={`glass-card-premium p-8 rounded-[2rem] group hover:-translate-y-2 transition-transform duration-300 cursor-default ${i % 2 === 0 ? 'animate-float' : 'animate-float-delayed'}`}>
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                    {f.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-white">{f.title}</h3>
                                <p className="text-white/50 leading-relaxed text-sm">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats / Trust Section */}
            <section className="py-20 border-y border-white/5 bg-black/20 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-sm font-bold uppercase tracking-widest text-white/30 mb-10">يثق بنا رواد الأعمال في الشرق الأوسط</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Mock Logos - Replace with SVGs if needed or keep text for elegance */}
                        <span className="text-2xl font-black text-white tracking-tighter">NIKE</span>
                        <span className="text-2xl font-black text-white tracking-tighter">ADIDAS</span>
                        <span className="text-2xl font-black text-white tracking-tighter">AMAZON</span>
                        <span className="text-2xl font-black text-white tracking-tighter">NOON</span>
                        <span className="text-2xl font-black text-white tracking-tighter">SALLA</span>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 text-center relative z-10">
                <p className="text-white/20 text-sm font-medium">
                    © 2025 Ebdaa Pro. Designed for the Future.
                </p>
            </footer>

            {/* WhatsApp Floating Button - Enhanced */}
            <a
                href="https://wa.me/201090624823"
                target="_blank"
                className="fixed bottom-8 right-8 z-[200] group"
            >
                <div className="absolute inset-0 bg-green-500 blur-xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse"></div>
                <div className="relative w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer border border-green-400/50">
                    <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
                        <path d="M12.012 2c-5.508 0-9.987 4.479-9.987 9.988 0 1.757.455 3.409 1.251 4.849l-1.332 4.86 4.975-1.304c1.404.757 2.997 1.189 4.693 1.189 5.508 0 9.988-4.479 9.988-9.988 0-5.508-4.48-9.988-9.988-9.988zm6.541 14.156c-.285.802-1.454 1.459-2.003 1.558-.49.088-1.127.159-1.808-.159-2.883-1.343-4.706-4.321-4.851-4.512-.144-.191-1.171-1.554-1.171-2.96 0-1.406.738-2.097 1-2.39.262-.293.571-.366.762-.366.191 0 .381.001.547.009.176.009.414-.066.649.492.235.558.802 1.956.872 2.1.07.144.117.311.023.498-.094.187-.141.311-.282.47-.141.159-.297.355-.424.476-.141.134-.288.28-.124.558.164.278.728 1.199 1.562 1.933.1.088.192.13.284.13.111 0 .216-.051.31-.137.288-.266.63-.687.9-.993.271-.306.495-.257.778-.152.282.105 1.79.845 2.097.998.307.153.511.228.586.356.075.127.075.736-.21 1.538z" />
                    </svg>
                </div>
                <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-black px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 shadow-xl">
                    تواصل مع الدعم الفني
                </div>
            </a>
        </div>
    );
};

export default LandingPage;
