import React from 'react';
import DemoSection from './DemoSection';

const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const LandingPage: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
    return (
        <div className="min-h-screen bg-[#060913] text-white overflow-x-hidden font-sans selection:bg-orange-500/30" dir="rtl">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-orange-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full"></div>
                {/* Subtle Grid overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay"></div>
            </div>

            {/* Navbar */}
            <nav className="relative z-50 w-full border-b border-white/5 bg-[#060913]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <span className="text-white font-black text-xl leading-none">إ</span>
                        </div>
                        <span className="font-black text-xl tracking-tight">إبداع <span className="text-orange-500">برو</span></span>
                    </div>
                    <button onClick={onGetStarted} className="text-sm font-bold bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-full transition-all border border-white/5">
                        جرب المنصة مجاناً
                    </button>
                </div>
            </nav>

            <main className="relative z-10 flex flex-col items-center">
                {/* Hero Section */}
                <section className="w-full max-w-7xl mx-auto px-6 pt-24 pb-32 text-center space-y-8 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-orange-500/20 to-red-500/20 blur-[100px] -z-10 rounded-[100%]"></div>

                    <div className="inline-flex items-center gap-3 px-5 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-xs font-bold text-orange-400 mx-auto animate-in fade-in slide-in-from-top-10 duration-1000">
                        <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_10px_#FA8231]"></span>
                        محرك الذكاء الاصطناعي الأول للـ Media Buyers في الوطن العربي
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black leading-[1.1] tracking-tighter animate-in fade-in zoom-in-95 duration-1000 delay-150">
                        وداعاً للـ Creative Block.<br className="hidden md:block" />
                        إعلانات تبيع.. <br className="md:hidden" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 relative italic">
                            في أقل من دقيقة ⚡
                        </span>
                    </h1>

                    <p className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        حوّل صورة منتجك لـ <span className="text-white font-bold">5 حملات إعلانية متكاملة</span> بصور احترافية، وكوبي بيلعب على سايكولوجي المشتري المصري، و Hook يوقف الـ Scroll غصب عنه.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5 justify-center pt-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
                        <button onClick={onGetStarted} className="group bg-gradient-to-r from-orange-500 to-red-600 text-white px-10 py-5 text-xl font-black rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-[0_15px_40px_-10px_rgba(234,88,12,0.5)] border border-orange-400/50">
                            🚀 ابدأ توليد إعلاناتك الآن <ArrowLeftIcon />
                        </button>
                    </div>

                    <div className="flex items-center justify-center gap-6 pt-10 text-sm font-bold text-slate-500 opacity-80 animate-in fade-in duration-1000 delay-700">
                        <div className="flex items-center gap-2"><CheckIcon /> <span>لا يتطلب خبرة بالتصميم</span></div>
                        <div className="flex items-center gap-2"><CheckIcon /> <span>نتائج مخصصة لمنتجك</span></div>
                        <div className="flex items-center gap-2"><CheckIcon /> <span>أسرع بـ 100x من المعتاد</span></div>
                    </div>
                </section>

                {/* Video/Dashboard Demo Preview */}
                <section className="w-full max-w-6xl mx-auto px-6 pb-32">
                    <div className="relative rounded-[2rem] p-2 bg-gradient-to-b from-white/10 to-transparent shadow-2xl overflow-hidden border border-white/10 group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 via-transparent to-purple-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <div className="bg-[#0f1219] rounded-[1.5rem] overflow-hidden relative z-10 aspect-video border border-black shadow-inner flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1618761714954-0b8cd0026356?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center before:absolute before:inset-0 before:bg-[#0f1219]/80 backdrop-blur-sm">
                            <div className="text-center z-20 space-y-6">
                                <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-md border border-orange-500/30 cursor-pointer hover:bg-orange-500/40 transition-colors hover:scale-110 active:scale-95" onClick={onGetStarted}>
                                    <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-orange-500 border-b-[12px] border-b-transparent ml-2"></div>
                                </div>
                                <h3 className="text-2xl font-black text-white">شاهد كيف يعمل النظام</h3>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="w-full bg-[#0a0d16] border-y border-white/5 py-32 relative">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full"></div>
                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="text-center space-y-4 mb-20">
                            <h2 className="text-4xl md:text-5xl font-black text-white">إمكانيات تتخطى توقعاتك 🔥</h2>
                            <p className="text-xl text-slate-400 max-w-2xl mx-auto">كل ما تحتاجه لإطلاق حملة إعلانية ناجحة، مبني ومجهز بأفضل ممارسات الـ Performance Marketing.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors shadow-xl">
                                <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner border border-blue-500/20">🎯</div>
                                <h3 className="text-2xl font-black text-white mb-3">5 زوايا بيعية مختلفة</h3>
                                <p className="text-slate-400 leading-relaxed font-medium">الذكاء الاصطناعي بيقرأ منتجك وبيطلعلك 5 إعلانات من زوايا مختلفة (الألم، المقارنة، الوعد الجريء، التحول، السرعة والندرة) عشان تتست براحتك.</p>
                            </div>

                            {/* Feature 2 */}
                            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors shadow-xl">
                                <div className="w-14 h-14 bg-orange-600/20 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner border border-orange-500/20">📸</div>
                                <h3 className="text-2xl font-black text-white mb-3">دمج احترافية الـ Photoshoot مع عفوية UGC</h3>
                                <p className="text-slate-400 leading-relaxed font-medium">الصور الناتجة بتدمج بين جودة التصوير التجاري واللمسة العفوية بتاعت الـ UGC عشان تبان طبيعية وماتبانش إنها إعلان مباشر فتزود الـ CTR.</p>
                            </div>

                            {/* Feature 3 */}
                            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors shadow-xl border-t-orange-500/30">
                                <div className="absolute top-0 right-8 -translate-y-1/2 bg-orange-500 text-black text-xs font-black px-3 py-1 rounded-full shadow-lg">جديد وقوي ⚡</div>
                                <div className="w-14 h-14 bg-purple-600/20 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner border border-purple-500/20">🎨</div>
                                <h3 className="text-2xl font-black text-white mb-3">نسخ الستايل (Style Match)</h3>
                                <p className="text-slate-400 leading-relaxed font-medium">عاجبك مود صورة معينة؟ ارفعها كـ Reference Image، والذكاء الاصطناعي هيفهم الإضاءة، والزاوية، والمود ويطبقه على إعلانات منتجك.</p>
                            </div>

                            {/* Feature 4 */}
                            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors shadow-xl">
                                <div className="w-14 h-14 bg-emerald-600/20 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner border border-emerald-500/20">📝</div>
                                <h3 className="text-2xl font-black text-white mb-3">كوبي بلهجة مصرية بتبيع</h3>
                                <p className="text-slate-400 leading-relaxed font-medium">بنستخدم أقوى معادلات الكتابة زي PAS و AIDA بس متفصلة على مقاس الشارع المصري والخليجي عشان العميل يحس إن الإعلان بيكلمه هو.</p>
                            </div>

                            {/* Feature 5 */}
                            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors shadow-xl">
                                <div className="w-14 h-14 bg-yellow-600/20 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner border border-yellow-500/20">🪝</div>
                                <h3 className="text-2xl font-black text-white mb-3">3 هوكات بديلة لكل إعلان</h3>
                                <p className="text-slate-400 leading-relaxed font-medium">عشان الـ Testing يكون صح، كل إعلان بيجيلك معاه 3 Hooks إضافيين (خطافات لفت انتباه) تقدر تبدل بينهم عشان توصل لأقل تكلفة للرسالة.</p>
                            </div>

                            {/* Feature 6 */}
                            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors shadow-xl flex flex-col items-center justify-center text-center cursor-pointer group" onClick={onGetStarted}>
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">✨</div>
                                <h3 className="text-xl font-black text-white mt-2">اكتشف المميزات بنفسك</h3>
                                <span className="text-orange-400 font-bold border-b border-orange-400/30 pb-0.5 mt-2">ابدأ التجربة المجانية &larr;</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Layer */}
                <section className="w-full max-w-5xl mx-auto px-6 py-32 text-center">
                    <h2 className="text-4xl font-black text-white mb-16">إزاي بتعمل إعلان بيكسر الدنيا في 3 خطوات؟ 🚀</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-orange-500/0 via-orange-500/50 to-orange-500/0 z-0"></div>

                        <div className="relative z-10 space-y-5">
                            <div className="w-20 h-20 bg-[#0f1219] border-2 border-orange-500/50 rounded-full flex items-center justify-center text-3xl font-black text-white mx-auto shadow-[0_0_20px_rgba(249,115,22,0.2)]">1</div>
                            <h3 className="text-xl font-bold text-white">ارفع منتجك</h3>
                            <p className="text-slate-400 text-sm">صورة للمنتج، اسم، وفايدته الأساسية. (وممكن صورة ريفرانس لو للستايل).</p>
                        </div>
                        <div className="relative z-10 space-y-5">
                            <div className="w-20 h-20 bg-[#0f1219] border-2 border-orange-500/50 rounded-full flex items-center justify-center text-3xl font-black text-white mx-auto shadow-[0_0_20px_rgba(249,115,22,0.2)]">2</div>
                            <h3 className="text-xl font-bold text-white">الذكاء الاصطناعي بيطبخ</h3>
                            <p className="text-slate-400 text-sm">في 30 ثانية، بيتم تحليل المنتج وبناء زوايا ومقاسات الكوبي والديزاين.</p>
                        </div>
                        <div className="relative z-10 space-y-5">
                            <div className="w-20 h-20 bg-[#0f1219] border-2 border-orange-500/50 rounded-full flex items-center justify-center text-3xl font-black text-white mx-auto shadow-[0_0_20px_rgba(249,115,22,0.2)]">3</div>
                            <h3 className="text-xl font-bold text-white">انسخ ونزّل الحملة</h3>
                            <p className="text-slate-400 text-sm">5 إعلانات بصورها، الهوكات، الكوبي جاهزين للـ Copy/Paste على مدير الإعلانات.</p>
                        </div>
                    </div>
                </section>

                {/* ── DEMO SECTION (Internal Interactive) ── */}
                <section className="w-full bg-[#0a0d16] border-y border-white/5">
                    <div className="w-full max-w-7xl mx-auto px-6 py-24">
                        <DemoSection onGetStarted={onGetStarted} />
                    </div>
                </section>

                {/* Bottom CTA */}
                <section className="w-full py-32 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0f1219] to-[#1a0f0a] z-0"></div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-orange-600/10 blur-[150px] z-0 rounded-full"></div>

                    <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-10">
                        <h2 className="text-5xl md:text-6xl font-black text-white leading-tight">جاهز تكبّر البزنس بتاعك<br />بأقل تكلفة للرسالة؟ 📉</h2>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto">أول تجربة مجانية لك الآن. صمم 5 إعلانات لمنتجك بصور احترافية وكوبي جاهز واستمتع بنسبة تحويل (Conversion Rate) عالية جداً.</p>

                        <button onClick={onGetStarted} className="bg-white text-black px-12 py-5 text-xl font-black rounded-2xl hover:bg-slate-200 active:scale-95 transition-all inline-flex items-center gap-3 shadow-2xl shadow-white/10">
                            🚀 جرب إبداع برو مجاناً
                        </button>
                    </div>
                </section>

                <div className="h-10"></div>
            </main>
        </div>
    );
};

export default LandingPage;
