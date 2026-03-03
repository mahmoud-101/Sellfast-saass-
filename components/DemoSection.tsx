import React, { useState } from 'react';

const SAMPLE_PRODUCT = 'كبسولات كيتو سليم';
const SAMPLE_MARKET = 'السوق المصري - سيدات ٢٥-٤٥';

const tabs = [
    { id: 'analysis', label: '🧠 تحليل المنتج' },
    { id: 'campaign', label: '🚀 الحملة الإعلانية' },
    { id: 'storyboard', label: '🎬 السيناريو المرئي' },
];

// ── Tab 1: Product Analysis ──────────────────────────────────────────────────
function AnalysisTab() {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0f1219] border border-orange-500/20 p-5 rounded-xl hover:border-orange-500/40 transition-colors">
                    <div className="flex items-center gap-2 mb-2"><span>👥</span><h4 className="text-orange-400 font-bold text-sm">الجمهور المستهدف</h4></div>
                    <p className="text-gray-300 text-sm leading-relaxed font-medium">سيدات بين ٢٥-٤٥ سنة يعانين من زيادة الوزن، مشغولات ومش قادرات يلتزمن بالرجيم. بيدورن على حل سريع وآمن بدون ما يغيّروا أكلهم بالكامل.</p>
                </div>
                <div className="bg-[#0f1219] border border-orange-500/20 p-5 rounded-xl hover:border-orange-500/40 transition-colors">
                    <div className="flex items-center gap-2 mb-2"><span>⚡</span><h4 className="text-orange-400 font-bold text-sm">نقطة البيع الفريدة (USP)</h4></div>
                    <p className="text-gray-300 text-sm leading-relaxed font-medium">الكبسولة الوحيدة في السوق المصري اللي بتقدر الجسم على حرق دهون البطن أثناء النوم — بدون رجيم قاسي أو رياضة يومية.</p>
                </div>
                <div className="bg-[#0f1219] border border-orange-500/20 p-5 rounded-xl hover:border-orange-500/40 transition-colors">
                    <div className="flex items-center gap-2 mb-2"><span>🏆</span><h4 className="text-orange-400 font-bold text-sm">التموضع التنافسي</h4></div>
                    <p className="text-gray-300 text-sm leading-relaxed font-medium">ليس منافساً للأدوية بل بديل طبيعي وآمن — مستخلصات طبيعية ١٠٠% مرخصة صحياً. يُوضع كـ"رفيق التخسيس الذكي" وليس حلاً سحرياً.</p>
                </div>
                <div className="bg-[#0f1219] border border-orange-500/20 p-5 rounded-xl hover:border-orange-500/40 transition-colors">
                    <div className="flex items-center gap-2 mb-2"><span>💰</span><h4 className="text-orange-400 font-bold text-sm">استراتيجية التسعير</h4></div>
                    <p className="text-gray-300 text-sm leading-relaxed font-medium">تسعير متوسط-مرتفع يعطي إحساساً بالجودة. عروض "٣ علبة بسعر ٢" لزيادة متوسط الطلب وتحسين هامش الربح.</p>
                </div>
            </div>
            <div className="bg-orange-950/20 border border-orange-500/40 p-5 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                <div className="flex items-center gap-2 mb-2"><span>🎣</span><h4 className="text-orange-400 font-bold text-sm">الجملة الافتتاحية المقترحة للإعلان (The Hook)</h4></div>
                <p className="text-white text-base font-black italic tracking-wide">"صحيتي الصبح لقيتِ هدومك واسعة؟! هو ده اللي بيحصل في اليوم السابع مع كيتو سليم"</p>
            </div>
        </div>
    );
}

// ── Tab 2: Campaign Copy ────────────────────────────────────────────────────
function CampaignTab() {
    return (
        <div className="space-y-4">
            <div className="bg-[#0f1219] border border-white/5 p-5 rounded-xl">
                <h4 className="text-orange-400 font-bold mb-3 flex items-center gap-2"><span>🎯</span> الزوايا البيعية (Angles)</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                    {['زاوية الخوف من الفوات', 'زاوية التحول الجسدي', 'زاوية الإثبات الاجتماعي'].map(a => (
                        <span key={a} className="bg-orange-500/10 border border-orange-500/30 text-orange-300 px-3 py-1.5 rounded-lg text-sm font-bold">{a}</span>
                    ))}
                </div>
            </div>

            <div className="bg-[#0f1219] border border-white/5 p-5 rounded-xl relative">
                <div className="absolute top-4 left-4 flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <h4 className="text-white font-bold mb-5 flex items-center gap-2"><span>📝</span> نص الإعلان الجاهز (Copy)</h4>
                <div className="bg-white/5 border border-white/5 rounded-xl p-5 text-slate-300 text-sm leading-relaxed font-medium whitespace-pre-line">
                    {`🔥 تعبتِ من الوزن الزائد والرجيم القاسي؟

كيتو سليم ✅ = كبسولة طبيعية بتعمل أثناء نومك، عشان تصحي تلاقي فرق حقيقي!

✔️ حرق الدهون من البطن والأرداف بدون مجهود جبار.
✔️ كبح الشهية طول اليوم بدون ما تحسي.
✔️ ١٠٠% مكونات طبيعية ومرخصة، آمنة تماماً.

٧٠٠+ ست مصرية حققت نتيجتها في أول ١٠ أيام وغيرت مقاساتها 🇪🇬👗

⚡ عرض خاص: ٣ علب بسعر ٢ — لفترة محدودة وأول 50 طلب فقط المتاحين!
اضغطي "تسوق الآن" واستلمي هديتك ✅`}
                </div>
            </div>
        </div>
    );
}

// ── Tab 3: Storyboard ────────────────────────────────────────────────────────
function StoryboardTab() {
    const scenes = [
        { n: '١', icon: '😫', label: 'Hook — المشهد الافتتاحي (0-3 ثواني)', desc: 'بنت بتقف قدام المرايا صبح، بتشد هدومها وبتشوف البطن. نظرة إحباط واضحة.', dialogue: '"ليه كل ما أصحى الوزن في نفس المكان؟!"' },
        { n: '٢', icon: '💊', label: 'عرض الحل (Problem/Solution)', desc: 'يد تمسك علبة كيتو سليم الأنيقة. زووم على الكبسولات الطبيعية. خلفية بيضاء نظيفة.', dialogue: '"الحل مش الحرمان.. الحل في كبسولة بتشتغل أثناء نومك."' },
        { n: '٣', icon: '✅', label: 'الإثبات الاجتماعي (Social Proof)', desc: 'شاشة موبايل بتعرض تقييمات ٥ نجوم. صور Before/After سريعة وحقيقية لعميلات.', dialogue: '"اكتر من ٧٠٠ ست مصرية شافت نتيجة مبهرة في أول ١٠ أيام بس."' },
        { n: '٤', icon: '🛒', label: 'الدعوة للتصرف (Urgency & CTA)', desc: 'العرض الخاص على الشاشة بلون برتقالي جذاب. أصابع تضغط "تسوق الآن".', dialogue: '"اطلبي دلوقتي — عرض ٣ علب بسعر ٢، الكمية محدودة جداً!"' },
    ];
    return (
        <div className="space-y-3">
            {scenes.map(s => (
                <div key={s.n} className="flex gap-4 bg-[#0f1219] border border-white/5 hover:border-orange-500/20 transition-colors p-5 rounded-xl">
                    <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-center justify-center text-orange-400 font-black text-lg shrink-0 shadow-inner">{s.n}</div>
                    <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{s.icon}</span>
                            <h4 className="text-orange-400 font-bold text-sm tracking-wide">{s.label}</h4>
                        </div>
                        <p className="text-slate-400 text-sm mb-3 leading-relaxed font-medium">{s.desc}</p>
                        <p className="text-white text-sm font-bold bg-white/5 px-3 py-2 rounded-lg inline-block border border-white/5">💬 {s.dialogue}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Main Demo Section ────────────────────────────────────────────────────────
export default function DemoSection({ onGetStarted }: { onGetStarted: () => void }) {
    const [activeTab, setActiveTab] = useState('analysis');

    return (
        <div dir="rtl" className="space-y-12">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="inline-block px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(249,115,22,0.15)] mb-4">
                    اكتشف قوة الذكاء الاصطناعي
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter">
                    شاهد مخرجاتك قبل أن تبدأ
                </h2>
                <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto mt-2">
                    أدخل معلومات منتجك، وسيقوم نظامنا بتحليل السوق وصياغة رسالة إعلانية احترافية في ثوانٍ معدودة.
                </p>
            </div>

            {/* Sample product badge */}
            <div className="flex justify-center">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm shadow-xl backdrop-blur-md">
                    <span className="text-slate-400 font-bold">مثال لمنتج:</span>
                    <span className="text-white font-black text-base">{SAMPLE_PRODUCT}</span>
                    <span className="text-white/20">|</span>
                    <span className="text-slate-400 font-bold">{SAMPLE_MARKET}</span>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex flex-wrap gap-3 justify-center">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 rounded-2xl font-black text-sm transition-all duration-300 ${activeTab === tab.id
                            ? 'bg-orange-500 text-white shadow-[0_5px_20px_rgba(249,115,22,0.4)] scale-105'
                            : 'bg-white/5 text-slate-400 hover:text-white border border-white/10 hover:bg-white/10'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-[#0a0d16] border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden transition-all duration-500 min-h-[400px]">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[80px] rounded-full pointer-events-none"></div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-black mb-6 relative z-10">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                    مخرج حقيقي من محرك إبداع برو
                </div>

                <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'analysis' && <AnalysisTab />}
                    {activeTab === 'campaign' && <CampaignTab />}
                    {activeTab === 'storyboard' && <StoryboardTab />}
                </div>
            </div>

            {/* CTA */}
            <div className="text-center pt-8">
                <p className="text-slate-400 font-medium mb-6">هذا فقط البداية. منتجك سيحصل على هذه التفاصيل بدقة متناهية.</p>
                <button
                    onClick={onGetStarted}
                    className="bg-white hover:bg-slate-200 text-black px-12 py-5 rounded-2xl font-black text-xl transition-all shadow-[0_10px_30px_-5px_rgba(255,255,255,0.2)] active:scale-95 inline-flex flex-col items-center justify-center border border-white/20"
                >
                    <span className="flex items-center gap-2">احصل على إعلاناتك في دقيقة ⚡</span>
                </button>
            </div>
        </div>
    );
}
