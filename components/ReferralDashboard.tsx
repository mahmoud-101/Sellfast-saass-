
import React, { useState, useEffect } from 'react';
import { getReferralStats } from '../lib/supabase';
import { Share2, Copy, Users, Zap, CheckCircle2, Gift } from 'lucide-react';

interface ReferralDashboardProps {
    userId: string;
}

const ReferralDashboard: React.FC<ReferralDashboardProps> = ({ userId }) => {
    const [stats, setStats] = useState({ code: '', count: 0, earned: 0 });
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const loadStats = async () => {
            const data = await getReferralStats(userId);
            setStats(data);
            setLoading(false);
        };
        loadStats();
    }, [userId]);

    const referralLink = `${window.location.origin}?ref=${stats.code}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="w-full h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Card */}
            <div className="glass-card p-8 md:p-12 rounded-[3rem] border border-[#FFD700]/20 bg-gradient-to-br from-[#FFD700]/5 to-transparent relative overflow-hidden group">
                <Gift className="absolute -left-4 -bottom-4 text-[#FFD700]/10 group-hover:scale-125 transition-transform" size={160} />
                <div className="relative z-10 text-right">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter">شارك الإبداع واربح نقاط مجانية! 🎁</h2>
                    <p className="text-white/60 text-lg font-bold mb-8">ادعُ أصدقاءك وانضم لرحلة النجاح. ستحصل على <span className="text-[#FFD700]">100 نقطة</span> فور قيام صديقك بأول عملية شحن.</p>

                    <div className="flex flex-col md:flex-row-reverse items-center gap-4 bg-black/40 p-4 rounded-3xl border border-white/10">
                        <div className="flex-grow text-center md:text-right">
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">رابط الإحالة الخاص بك</span>
                            <p className="text-sm font-mono text-white/80 truncate dir-ltr">{referralLink}</p>
                        </div>
                        <button
                            onClick={handleCopy}
                            className={`w-full md:w-auto px-8 py-4 rounded-2xl font-black text-sm uppercase transition-all flex items-center justify-center gap-2 ${copied ? 'bg-emerald-500 text-white' : 'bg-[#FFD700] text-black hover:scale-105'}`}
                        >
                            {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                            {copied ? 'تم النسخ!' : 'نسخ الرابط'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-8 rounded-[2.5rem] text-right border border-white/5 bg-white/5 relative overflow-hidden group">
                    <Users className="absolute -left-2 -bottom-2 text-white/5 group-hover:scale-110 transition-transform" size={80} />
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">الأصدقاء الذين انضموا</span>
                    <p className="text-4xl font-black text-white mt-2">{stats.count} <span className="text-sm opacity-30 font-bold">شخص</span></p>
                </div>
                <div className="glass-card p-8 rounded-[2.5rem] text-right border border-white/5 bg-white/5 relative overflow-hidden group">
                    <Zap className="absolute -left-2 -bottom-2 text-[#FFD700]/5 group-hover:scale-110 transition-transform" size={80} />
                    <span className="text-[10px] font-black text-[#FFD700] uppercase tracking-widest">إجمالي النقاط المكتسبة</span>
                    <p className="text-4xl font-black text-white mt-2">{stats.earned} <span className="text-sm opacity-30 font-bold">نقطة</span></p>
                </div>
            </div>

            {/* Steps Section */}
            <div className="glass-card p-10 rounded-[3rem] border border-white/5 text-right">
                <h3 className="text-xl font-black text-white mb-8">كيف يعمل نظام الإحالة؟ ⚡</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#FFD700] border border-white/10 font-black text-xl mr-auto ml-0">1</div>
                        <h4 className="font-black text-white">انسخ رابطك</h4>
                        <p className="text-white/40 text-xs font-bold leading-relaxed">شارك رابط الإحالة الخاص بك مع أصدقائك أو عبر منصات التواصل الاجتماعي.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#FFD700] border border-white/10 font-black text-xl mr-auto ml-0">2</div>
                        <h4 className="font-black text-white">صديقك يسجل بـ 50 نقطة</h4>
                        <p className="text-white/40 text-xs font-bold leading-relaxed">يحصل صديقك فوراً على 50 نقطة مجانية ليبدأ تجربة كافة أدوات الذكاء الاصطناعي.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-400 border border-white/10 font-black text-xl mr-auto ml-0">3</div>
                        <h4 className="font-black text-white">اربح 100 نقطة</h4>
                        <p className="text-white/40 text-xs font-bold leading-relaxed">عندما يشحن صديقك أي باقة لأول مرة، ستحصل تلقائياً على 100 نقطة في رصيدك كهدية.</p>
                    </div>
                </div>
            </div>

            {/* Social Share Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
                <button
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('انضم إليّ في إبداع برو واستخدم أقوى أدوات الذكاء الاصطناعي لإعلاناتك! سجل من هنا واحصل على 50 نقطة مجاناً: ' + referralLink)}`)}
                    className="px-6 py-3 bg-[#25D366] text-white rounded-full font-black text-xs flex items-center gap-2 hover:scale-105 transition-all"
                >
                    <Share2 size={16} /> مشاركة عبر واتساب
                </button>
                <button
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`)}
                    className="px-6 py-3 bg-[#1877F2] text-white rounded-full font-black text-xs flex items-center gap-2 hover:scale-105 transition-all"
                >
                    <Share2 size={16} /> مشاركة عبر فيسبوك
                </button>
            </div>
        </div>
    );
};

export default ReferralDashboard;
