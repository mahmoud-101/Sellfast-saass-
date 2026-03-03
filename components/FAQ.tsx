
import React, { useState } from 'react';
import { 
    CREDIT_STRUCTURE, 
    VOICES, 
    LIGHTING_STYLES, 
    CAMERA_PERSPECTIVES
} from '../constants';

const FAQ: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<'faq' | 'credits' | 'specs'>('faq');
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const FAQ_DATA = [
        { q: "كيف يتم ضمان جودة الصور؟", a: "نستخدم محرك Gemini 2.5 Flash Image المطور مع تقنيات EBDAA PRO التي تضمن الحفاظ على شعار منتجك وتفاصيله بنسبة 100% دون تشويه." },
        { q: "هل الصور ملكي قانونياً؟", a: "نعم، بمجرد توليد الصورة عبر حسابك، فأنت تمتلك حقوق الاستخدام التجاري الكاملة لها في كافة المنصات الإعلانية." },
        { q: "كيف يمكنني شحن النقاط؟", a: "يمكنك الشحن عبر فودافون كاش أو إنستا باي (InstaPay) من داخل مصر، أو عبر الموزعين المعتمدين خارج مصر." }
    ];

    return (
        <div className="w-full max-w-5xl mx-auto py-10 animate-in fade-in duration-500 text-right">
            <div className="max-w-5xl mx-auto mb-8 flex justify-end">
                <button onClick={onBack} className="px-6 py-2 bg-white/5 text-slate-400 rounded-xl font-bold hover:text-white transition-all">رجوع</button>
            </div>
            <div className="text-center mb-12 space-y-4">
                <h1 className="text-5xl font-black text-white tracking-tighter">مركز المساعدة والبيانات</h1>
                <p className="text-white/40 text-lg">دليلك الشامل لاستخدام Ebdaa Pro وفهم إمكانيات المحرك</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex justify-center mb-10">
                <div className="bg-white/5 p-1.5 rounded-2xl border border-white/10 flex gap-2">
                    <button onClick={() => setActiveTab('faq')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'faq' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-white/40 hover:text-white'}`}>الأسئلة الشائعة</button>
                    <button onClick={() => setActiveTab('credits')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'credits' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-white/40 hover:text-white'}`}>تكاليف الخدمات</button>
                    <button onClick={() => setActiveTab('specs')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'specs' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-white/40 hover:text-white'}`}>المواصفات الفنية</button>
                </div>
            </div>

            {activeTab === 'faq' && (
                <div className="space-y-4 max-w-3xl mx-auto">
                    {FAQ_DATA.map((item, i) => (
                        <div key={i} className={`glass-card rounded-[2rem] overflow-hidden border transition-all ${activeIndex === i ? 'border-[#FFD700]/30 bg-yellow-500/5' : 'border-white/5'}`}>
                            <button onClick={() => setActiveIndex(activeIndex === i ? null : i)} className="w-full p-8 text-right flex items-center justify-between flex-row-reverse">
                                <span className={`text-lg font-black ${activeIndex === i ? 'text-[#FFD700]' : 'text-white/80'}`}>{item.q}</span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${activeIndex === i ? 'rotate-180 bg-[#FFD700] border-none shadow-lg' : 'border-white/10'}`}>
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
                                </div>
                            </button>
                            <div className={`px-8 transition-all duration-300 ${activeIndex === i ? 'max-h-96 pb-8 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <p className="text-white/60 leading-relaxed text-sm font-medium">{item.a}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'credits' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
                    {CREDIT_STRUCTURE.map(item => (
                        <div key={item.key} className="glass-card p-6 rounded-[2.5rem] border border-white/5 flex flex-col items-center gap-4 text-center">
                            <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-3xl">{item.icon}</div>
                            <h3 className="font-black text-white">{item.label}</h3>
                            <div className="px-4 py-1.5 bg-yellow-500/10 text-[#FFD700] rounded-full text-xs font-black">
                                التكلفة: {item.cost} نقطة
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'specs' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4">
                    <div className="glass-card p-8 rounded-[3rem] border border-white/5 space-y-8">
                        <section>
                            <h3 className="text-[#FFD700] font-black text-xs uppercase tracking-widest mb-4">أنماط الإضاءة المدعومة</h3>
                            <div className="flex flex-wrap gap-2 justify-end">
                                {LIGHTING_STYLES.map(s => <span key={s.value} className="px-3 py-1.5 bg-white/5 rounded-xl text-[10px] font-bold text-white/60">{s.label}</span>)}
                            </div>
                        </section>
                        <section>
                            <h3 className="text-[#FFD700] font-black text-xs uppercase tracking-widest mb-4">زوايا الكاميرا المتاحة</h3>
                            <div className="flex flex-wrap gap-2 justify-end">
                                {CAMERA_PERSPECTIVES.map(s => <span key={s.value} className="px-3 py-1.5 bg-white/5 rounded-xl text-[10px] font-bold text-white/60">{s.label}</span>)}
                            </div>
                        </section>
                    </div>
                    <div className="glass-card p-8 rounded-[3rem] border border-white/5 space-y-8">
                        <section>
                            <h3 className="text-emerald-400 font-black text-xs uppercase tracking-widest mb-4">محرك الأصوات (Voices)</h3>
                            <div className="space-y-3">
                                {VOICES.map(v => (
                                    <div key={v.value} className="flex items-center justify-between p-3 bg-black/20 rounded-2xl flex-row-reverse">
                                        <div className="text-right">
                                            <p className="text-xs font-black text-white">{v.label}</p>
                                            <p className="text-[10px] text-white/30">{v.desc}</p>
                                        </div>
                                        <span className="text-[9px] px-2 py-0.5 bg-white/5 rounded-md text-white/40">{v.gender === 'Male' ? 'ذكر' : 'أنثى'}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FAQ;
