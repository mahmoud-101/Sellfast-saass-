import React, { useEffect, useState } from 'react';
import {
    getAdminUsers,
    getAdminStats,
    getAdminLogs,
    getPendingPayments,
    approvePayment,
    getAdminFinanceStats,
    getAdminPaymentHistory,
    getAdminUsageAnalytics,
    supabase
} from '../lib/supabase';
import { Search, Users, CreditCard, BarChart3, LayoutDashboard, CheckCircle2, Clock, ShieldCheck, TrendingUp, DollarSign } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'payments' | 'analytics'>('overview');
    const [searchTerm, setSearchTerm] = useState('');

    // Data State
    const [users, setUsers] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalUsers: 0, totalCredits: 0, activeToday: 0 });
    const [logs, setLogs] = useState<any[]>([]);
    const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
    const [usageAnalytics, setUsageAnalytics] = useState<any[]>([]);
    const [finance, setFinance] = useState({ totalRevenue: 0, monthlyRevenue: 0, estimatedProfit: 0 });

    const refreshData = async () => {
        setLoading(true);
        try {
            const [usersData, statsData, logsData, historyData, analyticsData, financeData] = await Promise.all([
                getAdminUsers(),
                getAdminStats(),
                getAdminLogs(),
                getAdminPaymentHistory(),
                getAdminUsageAnalytics(),
                getAdminFinanceStats()
            ]);
            setUsers(usersData);
            setStats(statsData);
            setLogs(logsData);
            setPaymentHistory(historyData);
            setUsageAnalytics(analyticsData);
            setFinance(financeData);
        } catch (error) {
            console.error("Failed to load admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprovePayment = async (requestId: string) => {
        if (!confirm("هل أنت متأكد من استلام المبلغ وتفعيل النقاط؟")) return;
        try {
            await approvePayment(requestId, 'admin_user');
            refreshData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddCredits = async (userId: string, current: number) => {
        const amount = prompt("أدخل عدد النقاط التي تريد إضافتها لهذا المستخدم:");
        if (!amount || isNaN(parseInt(amount))) return;

        const newTotal = current + parseInt(amount);
        const { error } = await supabase.from('profiles').update({ credits: newTotal }).eq('id', userId);
        if (!error) refreshData();
    };

    useEffect(() => {
        refreshData();
    }, []);

    const filteredUsers = users.filter(u =>
        (u.email || u.id).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pendingPayments = paymentHistory.filter(p => p.status === 'pending');

    if (loading) {
        return (
            <div className="w-full h-96 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white/40 font-bold animate-pulse font-inter">جاري مزامنة مركز القيادة...</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="text-right">
                    <div className="flex items-center justify-end gap-3 mb-1">
                        <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest flex items-center gap-1">
                            <ShieldCheck size={12} /> Root Admin Access
                        </span>
                        <h1 className="text-4xl font-black text-white tracking-tighter">مركز قيادة إبداع برو</h1>
                    </div>
                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest">الإدارة الشاملة للاشتراكات، الأرصدة، وتحليلات النمو.</p>
                </div>
                <button onClick={refreshData} className="px-8 py-3 bg-[#FFD700] text-black text-xs font-black uppercase tracking-widest rounded-2xl shadow-[0_0_30px_-5px_rgba(255,215,0,0.3)] hover:scale-105 transition-all active:scale-95">
                    تحديث البيانات الحية
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-row-reverse items-center gap-2 bg-white/5 p-2 rounded-[2rem] border border-white/5 self-end md:self-center overflow-x-auto no-scrollbar max-w-full">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-8 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2 flex-row-reverse ${activeTab === 'overview' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                    <LayoutDashboard size={16} /> نظرة عامة
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-8 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2 flex-row-reverse ${activeTab === 'users' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                    <Users size={16} /> إدارة المستخدمين
                </button>
                <button
                    onClick={() => setActiveTab('payments')}
                    className={`px-8 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2 flex-row-reverse ${activeTab === 'payments' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                    <div className="relative">
                        <CreditCard size={16} />
                        {pendingPayments.length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-black"></span>}
                    </div>
                    الاشتراكات والمدفوعات
                </button>
                <button
                    onClick={() => setActiveTab('analytics')}
                    className={`px-8 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2 flex-row-reverse ${activeTab === 'analytics' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                    <BarChart3 size={16} /> تحليلات الأداء
                </button>
            </div>

            {/* TAB CONTENT: OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="glass-card p-8 rounded-[2.5rem] text-right border border-white/5 bg-gradient-to-br from-emerald-500/5 to-transparent relative overflow-hidden group">
                            <TrendingUp className="absolute -left-4 -bottom-4 text-emerald-500/10 group-hover:scale-125 transition-transform" size={120} />
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center justify-end gap-1">إجمالي الإيرادات <DollarSign size={10} /></span>
                            <p className="text-4xl font-black text-white mt-2">{finance.totalRevenue.toLocaleString()} <span className="text-sm opacity-30">ج.م</span></p>
                        </div>
                        <div className="glass-card p-8 rounded-[2.5rem] text-right border border-white/5 bg-gradient-to-br from-[#FFD700]/5 to-transparent relative overflow-hidden group">
                            <CheckCircle2 className="absolute -left-4 -bottom-4 text-[#FFD700]/10 group-hover:scale-125 transition-transform" size={120} />
                            <span className="text-[10px] font-black text-[#FFD700] uppercase tracking-widest">صافي الربح التقديري</span>
                            <p className="text-4xl font-black text-white mt-2">{finance.estimatedProfit.toLocaleString()} <span className="text-sm opacity-30">ج.م</span></p>
                        </div>
                        <div className="glass-card p-8 rounded-[2.5rem] text-right border border-white/5 relative overflow-hidden group">
                            <Clock className="absolute -left-4 -bottom-4 text-white/5 group-hover:scale-125 transition-transform" size={120} />
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">إيرادات الشهر الحالي</span>
                            <p className="text-4xl font-black text-white mt-2">{finance.monthlyRevenue.toLocaleString()} <span className="text-sm opacity-30">ج.م</span></p>
                        </div>
                        <div className="glass-card p-8 rounded-[2.5rem] text-right border border-white/5 relative overflow-hidden group">
                            <Users className="absolute -left-4 -bottom-4 text-white/5 group-hover:scale-125 transition-transform" size={120} />
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">إجمالي مستخدمي المنصة</span>
                            <p className="text-4xl font-black text-white mt-2">{stats.totalUsers}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Pending Actions Quick List */}
                        <div className="glass-card rounded-[2.5rem] p-8 text-right border border-white/5">
                            <div className="flex items-center justify-between mb-8 flex-row-reverse">
                                <h3 className="text-xl font-black text-white flex items-center gap-2 flex-row-reverse">
                                    أحدث طلبات الشحن <span className="bg-orange-500 w-2 h-2 rounded-full animate-pulse"></span>
                                </h3>
                                <button onClick={() => setActiveTab('payments')} className="text-xs font-black text-[#FFD700] hover:underline">عرض الكل</button>
                            </div>

                            {pendingPayments.length === 0 ? (
                                <div className="py-12 flex flex-col items-center gap-3 opacity-20">
                                    <CheckCircle2 size={40} />
                                    <p className="font-bold text-sm">لا توجد طلبات معلقة حالياً</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pendingPayments.slice(0, 3).map((p, i) => (
                                        <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between flex-row-reverse">
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-white mb-1 truncate max-w-[150px]">{p.profiles?.email || 'مستخدم مجهول'}</p>
                                                <p className="text-[10px] font-black text-white/30 uppercase">{new Date(p.created_at).toLocaleDateString('ar-EG')}</p>
                                            </div>
                                            <div className="flex items-center gap-4 flex-row-reverse">
                                                <div className="text-right">
                                                    <p className="text-lg font-black text-emerald-400">{p.amount} ج.م</p>
                                                    <p className="text-[8px] font-black text-[#FFD700] uppercase tracking-tighter">{p.credits} نقطة</p>
                                                </div>
                                                <button
                                                    onClick={() => handleApprovePayment(p.id)}
                                                    className="w-10 h-10 flex items-center justify-center bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent Activity Log */}
                        <div className="glass-card rounded-[2.5rem] p-8 text-right border border-white/5 flex flex-col">
                            <h3 className="text-xl font-black text-white mb-8">سجل العمليات الأخير</h3>
                            <div className="space-y-4 overflow-y-auto pr-2 max-h-[350px] custom-scrollbar flex-grow">
                                {logs.map((l, i) => (
                                    <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex justify-between items-center mb-1 flex-row-reverse text-[8px]">
                                            <span className={`font-black uppercase px-2 py-0.5 rounded-md ${l.action_type === 'CREDIT_DEDUCTION' ? 'bg-red-500/10 text-red-400' :
                                                    l.action_type === 'PAYMENT_REQUEST' ? 'bg-orange-500/10 text-orange-400' :
                                                        'bg-[#FFD700]/10 text-[#FFD700]'
                                                }`}>
                                                {l.action_type}
                                            </span>
                                            <span className="text-white/20 font-mono italic">{new Date(l.created_at).toLocaleTimeString('ar-EG')}</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-white/60 leading-relaxed text-right">{l.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: USERS */}
            {activeTab === 'users' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="glass-card rounded-[2.5rem] p-8 text-right border border-white/5">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 flex-row-reverse">
                            <h3 className="text-xl font-black text-white">إدارة المشتركين</h3>
                            <div className="relative w-full md:w-96">
                                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                <input
                                    type="text"
                                    placeholder="ابحث عن مستخدم (ID أو بريد إلكتروني)..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pr-12 pl-4 text-white text-sm font-bold focus:outline-none focus:border-[#FFD700] transition-colors text-right"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs">
                                <thead className="text-white/30 uppercase border-b border-white/5">
                                    <tr>
                                        <th className="pb-4 pr-4">تفاصيل المستخدم</th>
                                        <th className="pb-4">الرصيد الحالي</th>
                                        <th className="pb-4">تاريخ التسجيل</th>
                                        <th className="pb-4 pl-4 text-left">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="text-white/80">
                                    {filteredUsers.map((u, i) => (
                                        <tr key={i} className="border-t border-white/5 hover:bg-white/5 transition-colors group">
                                            <td className="py-5 pr-4">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-white group-hover:text-[#FFD700] transition-colors">{u.email || 'مستخدم بدون بريد'}</span>
                                                    <span className="text-[8px] font-mono text-white/20 uppercase mt-1">{u.id}</span>
                                                </div>
                                            </td>
                                            <td className="py-5">
                                                <div className="flex items-center gap-2 flex-row-reverse">
                                                    <span className="text-lg font-black text-emerald-400">{u.credits}</span>
                                                    <span className="text-[10px] font-black text-white/20">نقطة</span>
                                                </div>
                                            </td>
                                            <td className="py-5 opacity-40 font-bold">
                                                {new Date(u.created_at).toLocaleDateString('ar-EG')}
                                            </td>
                                            <td className="py-5 pl-4 text-left">
                                                <button
                                                    onClick={() => handleAddCredits(u.id, u.credits)}
                                                    className="bg-[#FFD700]/20 text-[#FFD700] px-4 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-[#FFD700] hover:text-black transition-all"
                                                >
                                                    + إضافة رصيد
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredUsers.length === 0 && (
                                <div className="py-20 text-center opacity-20">
                                    <p className="font-bold">لم يتم العثور على مستخدمين يطابقون بحثك</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: PAYMENTS */}
            {activeTab === 'payments' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="glass-card rounded-[2.5rem] p-8 text-right border border-white/5">
                        <h3 className="text-xl font-black text-white mb-8">سجل المعاملات المالية</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs">
                                <thead className="text-white/30 uppercase border-b border-white/5">
                                    <tr>
                                        <th className="pb-4 pr-4">رقم المعاملة والبريد</th>
                                        <th className="pb-4 font-black">المبلغ</th>
                                        <th className="pb-4 font-black">النقاط</th>
                                        <th className="pb-4 font-black">التاريخ</th>
                                        <th className="pb-4 font-black">الحالة</th>
                                        <th className="pb-4 pl-4 text-left">الإجراء</th>
                                    </tr>
                                </thead>
                                <tbody className="text-white/80">
                                    {paymentHistory.map((p, i) => (
                                        <tr key={i} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-5 pr-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white/80">{p.profiles?.email || 'Unknown User'}</span>
                                                    <span className="text-[8px] font-mono text-white/20 lowercase mt-0.5">ID: {p.id.slice(0, 8)}...</span>
                                                </div>
                                            </td>
                                            <td className="py-5 font-black text-emerald-400 text-sm">{p.amount} ج.م</td>
                                            <td className="py-5 font-black text-white">{p.credits}</td>
                                            <td className="py-5 opacity-40 font-bold">{new Date(p.created_at).toLocaleDateString('ar-EG')}</td>
                                            <td className="py-5">
                                                <span className={`px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest border ${p.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                        p.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                            'bg-red-500/10 text-red-400 border-red-500/20'
                                                    }`}>
                                                    {p.status === 'approved' ? 'مقبول' : p.status === 'pending' ? 'معلق' : 'مرفوض'}
                                                </span>
                                            </td>
                                            <td className="py-5 pl-4 text-left">
                                                {p.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleApprovePayment(p.id)}
                                                        className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/10 flex items-center gap-2"
                                                    >
                                                        <CheckCircle2 size={12} /> تفعيل
                                                    </button>
                                                )}
                                                {p.status === 'approved' && (
                                                    <span className="text-[10px] font-black text-white/20 italic">اكتمل التفعيل ✓</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {paymentHistory.length === 0 && (
                                <div className="py-20 text-center opacity-20">
                                    <p className="font-bold text-lg">لا توجد سجلات مالية حتى الآن</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: ANALYTICS */}
            {activeTab === 'analytics' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Tool Usage Breakdown */}
                        <div className="glass-card rounded-[2.5rem] p-8 text-right border border-white/5">
                            <h3 className="text-xl font-black text-white mb-10">تحليل استخدام الأدوات الإبداعية 🎨</h3>
                            <div className="space-y-8">
                                {usageAnalytics.map((item, i) => {
                                    const maxVal = Math.max(...usageAnalytics.map(a => a.value), 1);
                                    const percentage = (item.value / maxVal) * 100;
                                    return (
                                        <div key={i} className="space-y-2">
                                            <div className="flex justify-between items-center flex-row-reverse">
                                                <span className="text-xs font-black text-white">{
                                                    item.name === 'PRO_MODE' ? 'الوضع الاحترافي (Pro Mode)' :
                                                        item.name === 'COPYWRITING' ? 'مولد الإعلانات (Hooks)' :
                                                            item.name === 'IMAGE_PRO' ? 'تصوير المنتج (UGC Studio)' :
                                                                item.name === 'MARKET_ANALYSIS' ? 'تحليل السوق' : item.name
                                                }</span>
                                                <span className="text-xs font-mono font-black text-[#FFD700] bg-[#FFD700]/5 px-3 py-1 rounded-lg">{item.value} طلب</span>
                                            </div>
                                            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                                                <div
                                                    className="h-full bg-gradient-to-r from-[#FFD700]/40 to-[#FFD700] rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {usageAnalytics.length === 0 && (
                                    <div className="py-20 text-center opacity-20">
                                        <p className="font-bold">سيتم عرض البيانات هنا بعد بدء المستخدمين في تجربة الأدوات</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Market Sentiment Summary */}
                        <div className="glass-card rounded-[2.5rem] p-8 text-right border border-white/5 bg-gradient-to-br from-[#FFD700]/5 to-transparent flex flex-col items-center justify-center gap-6">
                            <div className="w-24 h-24 rounded-full border-4 border-[#FFD700] border-t-transparent animate-spin p-2 transition-all">
                                <div className="w-full h-full rounded-full border-4 border-white/20"></div>
                            </div>
                            <div className="text-center">
                                <h4 className="text-2xl font-black text-white mb-2">المنصة في حالة نمو مستمر 🚀</h4>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                    أدوات الذكاء الاصطناعي تعمل بكفاءة عالية.<br />
                                    معدل رضا المستخدمين (افتراضي): 98.4%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
