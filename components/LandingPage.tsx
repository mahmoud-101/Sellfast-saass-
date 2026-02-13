
import React from 'react';

const LOGO_IMAGE_URL = "https://i.ibb.co/MDrpHPzS/Artboard-1.png";

const LandingPage: React.FC<{onGetStarted: () => void}> = ({ onGetStarted }) => {
    return (
        <div className="min-h-screen bg-[#08080e] text-white overflow-x-hidden font-tajawal">
            {/* Header */}
            <nav className="fixed top-0 w-full z-[100] backdrop-blur-md bg-black/20 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={LOGO_IMAGE_URL} alt="Ebdaa Pro" className="h-10 w-auto" />
                        <span className="text-2xl font-black">إبداع <span className="text-[var(--color-accent)]">برو</span></span>
                    </div>
                    <button 
                        onClick={onGetStarted}
                        className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] px-8 py-3 rounded-xl font-black transition-all text-sm shadow-xl shadow-[var(--color-accent)]/20"
                    >
                        دخول المنصة
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-6 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-[var(--color-accent)]/10 blur-[120px] rounded-full -z-10"></div>
                <div className="max-w-5xl mx-auto text-center space-y-8">
                    <div className="inline-flex px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-accent)] mb-4">
                        مستقبل الإنتاج الإعلاني بالذكاء الاصطناعي
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black leading-tight tracking-tighter">
                        أكبر استوديو <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-purple-400">ذكاء اصطناعي</span> متكامل في الوطن العربي
                    </h1>
                    <p className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
                        وفر آلاف الجنيهات وشهور الانتظار. أنت الآن تمتلك مصوراً محترفاً، خبيراً تسويقياً، ومخرجاً سينمائياً في مكان واحد.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 pt-6">
                        <button onClick={onGetStarted} className="px-12 py-5 bg-white text-black text-lg font-black rounded-2xl hover:scale-105 transition-all">ابدأ تجربتك المجانية الآن</button>
                        <a href="https://wa.me/201090624823" target="_blank" className="px-12 py-5 bg-white/5 border border-white/10 text-lg font-black rounded-2xl hover:bg-white/10 transition-all">تواصل مع الدعم</a>
                    </div>
                </div>
            </section>

            {/* Target Audience Section */}
            <section className="py-24 px-6 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-12">
                            <div className="space-y-4">
                                <h2 className="text-4xl font-black">لمن هذه المنصة؟</h2>
                                <p className="text-white/40 leading-relaxed">صُممت إبداع برو لخدمة المحترفين الذين يبحثون عن الجودة والسرعة.</p>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="flex gap-6 p-6 glass-card rounded-3xl border-emerald-500/20 bg-emerald-500/5">
                                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shrink-0">✅</div>
                                    <div>
                                        <h3 className="text-xl font-black mb-2 text-emerald-400">أصحاب المتاجر الإلكترونية</h3>
                                        <p className="text-sm text-white/50">توليد صور منتجات احترافية وفيديوهات إعلانية تزيد من مبيعاتك فوراً.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 p-6 glass-card rounded-3xl border-indigo-500/20 bg-indigo-500/5">
                                    <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shrink-0">✅</div>
                                    <div>
                                        <h3 className="text-xl font-black mb-2 text-indigo-400">الوكالات الإعلانية والـ Freelancers</h3>
                                        <p className="text-sm text-white/50">قدم لعملائك هوية بصرية كاملة وخطط محتوى في دقائق بدل الأسابيع.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 p-6 glass-card rounded-3xl border-purple-500/20 bg-purple-500/5">
                                    <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center shrink-0">✅</div>
                                    <div>
                                        <h3 className="text-xl font-black mb-2 text-purple-400">صناع المحتوى والمسوقين</h3>
                                        <p className="text-sm text-white/50">كتابة نصوص إعلانية وتوليد ريلز سينمائية تكسر خوارزميات السوشيال ميديا.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-12">
                            <div className="space-y-4">
                                <h2 className="text-4xl font-black">ليست لمن؟</h2>
                                <p className="text-white/40 leading-relaxed">المنصة ليست للعبث، هي أداة أعمال قوية جداً.</p>
                            </div>
                            
                            <div className="space-y-6 opacity-60">
                                <div className="flex gap-6 p-6 border border-red-500/20 rounded-3xl bg-red-500/5">
                                    <div className="w-12 h-12 bg-red-500/20 border border-red-500/40 rounded-2xl flex items-center justify-center shrink-0 text-red-500">❌</div>
                                    <div>
                                        <h3 className="text-xl font-black mb-2 text-red-400">الباحثين عن التسلية المجانية</h3>
                                        <p className="text-sm text-white/50">إبداع برو هي محرك إنتاج احترافي موجه لنمو الأعمال الحقيقية.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 p-6 border border-red-500/20 rounded-3xl bg-red-500/5">
                                    <div className="w-12 h-12 bg-red-500/20 border border-red-500/40 rounded-2xl flex items-center justify-center shrink-0 text-red-500">❌</div>
                                    <div>
                                        <h3 className="text-xl font-black mb-2 text-red-400">من لا يقدر قيمة الوقت</h3>
                                        <p className="text-sm text-white/50">إذا كنت تفضل قضاء ساعات في التصوير التقليدي، فهذه الأداة قد تكون متطورة جداً لك.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto text-center mb-20 space-y-4">
                    <h2 className="text-5xl font-black">مميزات بلا حدود</h2>
                    <p className="text-white/40 text-lg">كل ما تحتاجه لبراند ناجح في مكان واحد</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { title: "إنتاج شامل (Power)", desc: "حلل منتجك، صمم صورته، واكتب خطة نشره بضغطة زر.", icon: "⚡" },
                        { title: "موديلز افتراضيين", desc: "ضع منتجك في يد عارضين أزياء عرب وعالميين دون جلسات تصوير.", icon: "📸" },
                        { title: "ريلز سينمائي", desc: "توليد فيديوهات إعلانية واقعية بمحرك Veo 3.1 العالمي.", icon: "🎬" },
                        { title: "محتوى UGC", desc: "صناعة صور تبدو وكأنها التقطت بكاميرا عميل لزيادة الثقة.", icon: "🤳" },
                        { title: "هوية بصرية", desc: "بناء دليل هوية كامل وألوان وموك آب لشعارك في ثوانٍ.", icon: "🏷️" },
                        { title: "كاتب نصوص ذكي", desc: "نصوص تبيع وتركز على سيكولوجية العميل باللهجة المفضلة.", icon: "✍️" },
                    ].map((f, i) => (
                        <div key={i} className="glass-card p-10 rounded-[2.5rem] border border-white/5 hover:border-[var(--color-accent)]/30 transition-all group">
                            <div className="text-4xl mb-6 group-hover:scale-110 transition-transform block">{f.icon}</div>
                            <h3 className="text-2xl font-black mb-3">{f.title}</h3>
                            <p className="text-white/40 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto glass-card rounded-[4rem] p-16 text-center bg-gradient-to-br from-[var(--color-accent)]/20 to-purple-500/10 border border-[var(--color-accent)]/30">
                    <h2 className="text-5xl font-black mb-8">هل أنت جاهز لتغيير شكل أعمالك؟</h2>
                    <button onClick={onGetStarted} className="px-16 py-6 bg-white text-black text-xl font-black rounded-3xl shadow-2xl hover:scale-105 transition-all">ابدأ الآن - رصيد تجريبي متاح</button>
                </div>
            </section>

            {/* WhatsApp Support Button */}
            <a 
                href="https://wa.me/201090624823" 
                target="_blank"
                className="fixed bottom-10 right-10 z-[200] w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 hover:scale-110 transition-all group"
            >
                <div className="absolute right-full mr-4 bg-white text-black px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">دعم فني واتساب</div>
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.012 2c-5.508 0-9.987 4.479-9.987 9.988 0 1.757.455 3.409 1.251 4.849l-1.332 4.86 4.975-1.304c1.404.757 2.997 1.189 4.693 1.189 5.508 0 9.988-4.479 9.988-9.988 0-5.508-4.48-9.988-9.988-9.988zm6.541 14.156c-.285.802-1.454 1.459-2.003 1.558-.49.088-1.127.159-1.808-.159-2.883-1.343-4.706-4.321-4.851-4.512-.144-.191-1.171-1.554-1.171-2.96 0-1.406.738-2.097 1-2.39.262-.293.571-.366.762-.366.191 0 .381.001.547.009.176.009.414-.066.649.492.235.558.802 1.956.872 2.1.07.144.117.311.023.498-.094.187-.141.311-.282.47-.141.159-.297.355-.424.476-.141.134-.288.28-.124.558.164.278.728 1.199 1.562 1.933.1.088.192.13.284.13.111 0 .216-.051.31-.137.288-.266.63-.687.9-.993.271-.306.495-.257.778-.152.282.105 1.79.845 2.097.998.307.153.511.228.586.356.075.127.075.736-.21 1.538z"/>
                </svg>
            </a>
        </div>
    );
};

export default LandingPage;
