import React, { useState } from 'react';

const SAMPLE_PRODUCT = 'كبسولات كيتو سليم';
const SAMPLE_MARKET = 'السوق المصري - سيدات ٢٥-٤٥';

const tabs = [
    { id: 'analysis', label: '🧠 تحليل المنتج', color: 'blue' },
    { id: 'campaign', label: '🚀 الحملة الإعلانية', color: 'purple' },
    { id: 'storyboard', label: '🎬 السيناريو المرئي', color: 'emerald' },
];

const colorMap: Record<string, { tab: string; badge: string; card: string; text: string }> = {
    blue: { tab: 'bg-blue-600', badge: 'bg-blue-900/30 border-blue-500/30 text-blue-400', card: 'border-blue-500/20 bg-blue-900/10', text: 'text-blue-400' },
    purple: { tab: 'bg-purple-600', badge: 'bg-purple-900/30 border-purple-500/30 text-purple-400', card: 'border-purple-500/20 bg-purple-900/10', text: 'text-purple-400' },
    emerald: { tab: 'bg-emerald-600', badge: 'bg-emerald-900/30 border-emerald-500/30 text-emerald-400', card: 'border-emerald-500/20 bg-emerald-900/10', text: 'text-emerald-400' },
};

// ── Tab 1: Product Analysis ──────────────────────────────────────────────────
function AnalysisTab() {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-purple-900/20 border border-purple-500/30 p-5 rounded-xl">
                    <div className="flex items-center gap-2 mb-2"><span>👥</span><h4 className="text-purple-400 font-bold text-sm">الجمهور المستهدف</h4></div>
                    <p className="text-gray-300 text-sm leading-relaxed">سيدات بين ٢٥-٤٥ سنة يعانين من زيادة الوزن، مشغولات ومش قادرات يلتزمن بالرجيم. بيدورن على حل سريع وآمن بدون ما يغيّروا أكلهم بالكامل.</p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/30 p-5 rounded-xl">
                    <div className="flex items-center gap-2 mb-2"><span>⚡</span><h4 className="text-yellow-400 font-bold text-sm">نقطة البيع الفريدة (USP)</h4></div>
                    <p className="text-gray-300 text-sm leading-relaxed">الكبسولة الوحيدة في السوق المصري اللي بتقدر الجسم على حرق دهون البطن أثناء النوم — بدون رجيم قاسي أو رياضة يومية.</p>
                </div>
                <div className="bg-blue-900/20 border border-blue-500/30 p-5 rounded-xl">
                    <div className="flex items-center gap-2 mb-2"><span>🏆</span><h4 className="text-blue-400 font-bold text-sm">التموضع التنافسي</h4></div>
                    <p className="text-gray-300 text-sm leading-relaxed">ليس منافساً للأدوية بل بديل طبيعي وآمن — مستخلصات طبيعية ١٠٠% مرخصة صحياً. يُوضع كـ"رفيق التخسيس الذكي" وليس حلاً سحرياً.</p>
                </div>
                <div className="bg-emerald-900/20 border border-emerald-500/30 p-5 rounded-xl">
                    <div className="flex items-center gap-2 mb-2"><span>💰</span><h4 className="text-emerald-400 font-bold text-sm">استراتيجية التسعير</h4></div>
                    <p className="text-gray-300 text-sm leading-relaxed">تسعير متوسط-مرتفع (٢٩٩-٣٩٩ج.م) يعطي إحساساً بالجودة. عروض "٣ علبة بسعر ٢" لزيادة متوسط الطلب وتحسين هامش الربح.</p>
                </div>
            </div>
            <div className="bg-orange-900/20 border border-orange-500/30 p-5 rounded-xl">
                <div className="flex items-center gap-2 mb-2"><span>🎣</span><h4 className="text-orange-400 font-bold text-sm">الجملة الافتتاحية المقترحة للإعلان</h4></div>
                <p className="text-gray-100 text-base font-semibold italic">"صحيتي الصبح لقيتِ هدومك واسعة؟! هو ده اللي بيحصل في اليوم ٧ مع كيتو سليم"</p>
            </div>
        </div>
    );
}

// ── Tab 2: Campaign Copy ────────────────────────────────────────────────────
function CampaignTab() {
    return (
        <div className="space-y-4">
            <div className="bg-gray-800 border border-gray-700 p-5 rounded-xl">
                <h4 className="text-purple-400 font-bold mb-3 flex items-center gap-2"><span>🎯</span> الزوايا البيعية</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                    {['زاوية الخوف من الفوات', 'زاوية التحول الجسدي', 'زاوية الإثبات الاجتماعي'].map(a => (
                        <span key={a} className="bg-purple-900/40 border border-purple-500/40 text-purple-300 px-3 py-1.5 rounded-lg text-sm">{a}</span>
                    ))}
                </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 p-5 rounded-xl">
                <h4 className="text-white font-bold mb-3 flex items-center gap-2"><span>📝</span> نص الإعلان الجاهز</h4>
                <div className="bg-gray-900 rounded-xl p-4 text-gray-200 text-sm leading-loose whitespace-pre-line">
                    {`🔥 تعبتِ من الوزن الزائد؟

كيتو سليم ✅ = كبسولة طبيعية بتعمل أثناء نومك

✔️ حرق الدهون من البطن والأرداف
✔️ كبح الشهية بدون ما تحسي
✔️ ١٠٠% مكونات طبيعية محلية

٧٠٠+ ست مصرية حققت نتيجتها في أول ١٠ أيام 🇪🇬

⚡ عرض خاص: ٣ علب بسعر ٢ — لفترة محدودة!
اضغطي "تسوق الآن" ✅`}
                </div>
            </div>
        </div>
    );
}

// ── Tab 3: Storyboard ────────────────────────────────────────────────────────
function StoryboardTab() {
    const scenes = [
        { n: '١', icon: '😫', label: 'Hook — المشهد الافتتاحي', desc: 'بنت بتقف قدام المرايا صبح، بتشد هدومها وبتشوف البطن. نظرة إحباط واضحة.', dialogue: '"ليه كل ما أصحى الوزن في نفس المكان؟!"' },
        { n: '٢', icon: '💊', label: 'عرض الحل', desc: 'يد تمسك علبة كيتو سليم الأنيقة. زووم على الكبسولات الطبيعية. خلفية بيضاء نظيفة.', dialogue: '"الحل موجود! كيتو سليم — كبسولة طبيعية بتشتغل أثناء نومك."' },
        { n: '٣', icon: '✅', label: 'الإثبات الاجتماعي', desc: 'شاشة موبايل بتعرض تقييمات ٥ نجوم. صور Before/After حقيقية لعميلات.', dialogue: '"٧٠٠+ ست مصرية شافت نتيجة في أول ١٠ أيام."' },
        { n: '٤', icon: '🛒', label: 'الدعوة للتصرف', desc: 'العرض الخاص على الشاشة مع عداد تنازلي. أصابع تضغط "اطلبي دلوقتي".', dialogue: '"اطلبي دلوقتي — ٣ علب بسعر ٢ لحد ما العرض ينتهي!"' },
    ];
    return (
        <div className="space-y-3">
            {scenes.map(s => (
                <div key={s.n} className="flex gap-4 bg-gray-800 border border-gray-700 p-4 rounded-xl">
                    <div className="w-10 h-10 bg-emerald-600/20 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400 font-black text-sm shrink-0">{s.n}</div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-base">{s.icon}</span>
                            <h4 className="text-emerald-400 font-bold text-sm">{s.label}</h4>
                        </div>
                        <p className="text-gray-400 text-xs mb-2 leading-relaxed">{s.desc}</p>
                        <p className="text-gray-100 text-sm italic">"{s.dialogue}"</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Main Demo Section ────────────────────────────────────────────────────────
export default function DemoSection({ onGetStarted }: { onGetStarted: () => void }) {
    const [activeTab, setActiveTab] = useState('analysis');
    const current = tabs.find(t => t.id === activeTab)!;
    const c = colorMap[current.color];

    return (
        <div dir="rtl" className="space-y-10">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="inline-block px-4 py-1 bg-[#FFD700]/20 text-[#FFD700] rounded-full text-xs font-black uppercase tracking-widest">
                    شاهد المخرجات قبل الاشتراك
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                    هكذا يبدو العمل مع إبداع برو
                </h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    أدخل بياناتك ← الذكاء الاصطناعي يبني لك هذا كله في أقل من دقيقة
                </p>
            </div>

            {/* Sample product badge */}
            <div className="flex justify-center">
                <div className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 text-sm">
                    <span className="text-gray-400">المنتج التجريبي:</span>
                    <span className="text-white font-bold">{SAMPLE_PRODUCT}</span>
                    <span className="text-gray-500">|</span>
                    <span className="text-gray-400">{SAMPLE_MARKET}</span>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex flex-wrap gap-3 justify-center">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id
                                ? `${colorMap[tab.color].tab} text-white shadow-lg`
                                : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-gray-900 border border-gray-700 rounded-3xl p-6 md:p-8 animate-in fade-in duration-300">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold mb-5 ${c.badge}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
                    مخرج حقيقي من الذكاء الاصطناعي لـ {SAMPLE_PRODUCT}
                </div>
                {activeTab === 'analysis' && <AnalysisTab />}
                {activeTab === 'campaign' && <CampaignTab />}
                {activeTab === 'storyboard' && <StoryboardTab />}
            </div>

            {/* CTA */}
            <div className="text-center space-y-4">
                <p className="text-gray-400">هذا مجرد مثال — منتجك سيحصل على تحليل مخصص تماماً له</p>
                <button
                    onClick={onGetStarted}
                    className="bg-[#FFD700] text-black px-10 py-4 rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_-5px_rgba(255,215,0,0.4)]"
                >
                    🚀 جرّب الآن مجاناً
                </button>
            </div>
        </div>
    );
}
