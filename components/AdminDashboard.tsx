
import React, { useEffect, useState } from 'react';
import { getAdminUsers, getAdminStats, getAdminLogs, getPendingPayments, approvePayment, supabase } from '../lib/supabase';

const AdminDashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalUsers: 0, totalCredits: 0, activeToday: 0 });
    const [logs, setLogs] = useState<any[]>([]);
    const [pendingPayments, setPendingPayments] = useState<any[]>([]);

    const refreshData = async () => {
        setLoading(true);
        try {
            const [usersData, statsData, logsData, paymentsData] = await Promise.all([
                getAdminUsers(),
                getAdminStats(),
                getAdminLogs(),
                getPendingPayments()
            ]);
            setUsers(usersData);
            setStats(statsData);
            setLogs(logsData);
            setPendingPayments(paymentsData);
        } catch (error) {
            console.error("Failed to load real-time admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprovePayment = async (requestId: string) => {
        if (!confirm("هل أنت متأكد من استلام المبلغ وتفعيل النقاط؟")) return;
        try {
            await approvePayment(requestId, 'admin'); // 'admin' as placeholder for current user id
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

    if (loading) {
        return (
            <div className="w-full h-96 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white/40 font-bold animate-pulse">جاري جلب البيانات من السحابة...</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="text-right">
                    <h1 className="text-4xl font-black text-white tracking-tighter">إحصائيات إبداع برو الحية</h1>
                    <p className="text-white/40 text-sm mt-1 font-bold uppercase tracking-widest">إدارة المستخدمين والعمليات من قاعدة البيانات.</p>
                </div>
                <button onClick={refreshData} className="px-6 py-2 bg-[#FFD700] text-black text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:scale-105 transition-all">تحديث البيانات</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6 rounded-[2rem] text-right border border-white/5">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">إجمالي المستخدمين</span>
                    <p className="text-3xl font-black text-white">{stats.totalUsers}</p>
                </div>
                <div className="glass-card p-6 rounded-[2rem] text-right border border-white/5">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">النقاط الفعالة بالسوق</span>
                    <p className="text-3xl font-black text-[#FFD700]">{stats.totalCredits}</p>
                </div>
                <div className="glass-card p-6 rounded-[2rem] text-right border border-white/5">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">طلبات الشحن المعلقة</span>
                    <p className="text-3xl font-black text-orange-400">{pendingPayments.length}</p>
                </div>
                <div className="glass-card p-6 rounded-[2rem] text-right border border-white/5">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">حالة الخوادم</span>
                    <p className="text-xl font-black text-emerald-500 flex items-center justify-end gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span> ONLINE</p>
                </div>
            </div>

            {pendingPayments.length > 0 && (
                <div className="glass-card rounded-[2.5rem] p-8 text-right border border-orange-500/20 bg-orange-500/5 animate-in slide-in-from-top-4">
                    <h3 className="text-xl font-black text-white mb-6 flex items-center justify-end gap-2">
                        طلبات شحن معلقة (تحتاج مراجعة) <span className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pendingPayments.map((p, i) => (
                            <div key={i} className="p-6 bg-black/40 rounded-3xl border border-white/10 space-y-4">
                                <div className="flex justify-between items-start flex-row-reverse">
                                    <div className="text-right">
                                        <p className="text-xs font-black text-white/40 uppercase">المستخدم</p>
                                        <p className="text-sm font-bold text-white truncate max-w-[150px]">{p.user_id}</p>
                                    </div>
                                    <div className="bg-[#FFD700] text-black px-3 py-1 rounded-lg font-black text-xs">
                                        {p.credits} نقطة
                                    </div>
                                </div>
                                <div className="flex justify-between items-center flex-row-reverse">
                                    <p className="text-2xl font-black text-emerald-400">{p.amount} ج.م</p>
                                    <button 
                                        onClick={() => handleApprovePayment(p.id)}
                                        className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase hover:bg-emerald-600 transition-all"
                                    >
                                        تأكيد الاستلام ✅
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card rounded-[2.5rem] p-8 text-right overflow-x-auto border border-white/5">
                    <h3 className="text-xl font-black text-white mb-6">قائمة المشتركين الحالية</h3>
                    <table className="w-full text-right text-xs">
                        <thead className="text-white/30 uppercase border-b border-white/5">
                            <tr>
                                <th className="pb-4">المستخدم (ID/Email)</th>
                                <th className="pb-4">الرصيد المتاح</th>
                                <th className="pb-4">تاريخ الانضمام</th>
                                <th className="pb-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="text-white/80">
                            {users.map((u, i) => (
                                <tr key={i} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-4 font-bold max-w-[200px] truncate">{u.email || u.id}</td>
                                    <td className="py-4 text-emerald-400 font-black text-lg">{u.credits}</td>
                                    <td className="py-4 opacity-40 font-bold">{new Date(u.created_at).toLocaleDateString('ar-EG')}</td>
                                    <td className="py-4">
                                        <button onClick={() => handleAddCredits(u.id, u.credits)} className="bg-[#FFD700]/20 text-[#FFD700] px-3 py-1 rounded-lg font-black hover:bg-[#FFD700] hover:text-black transition-all">+ شحن</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="glass-card rounded-[2.5rem] p-8 text-right border border-white/5">
                    <h3 className="text-xl font-black text-white mb-6">سجل العمليات الأخير</h3>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto suggestions-scrollbar pr-2">
                        {logs.map((l, i) => (
                            <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 group">
                                <div className="flex justify-between items-center mb-1 flex-row-reverse">
                                    <span className="text-[8px] font-black text-[#FFD700] uppercase px-2 py-0.5 bg-[#FFD700]/10 rounded-md">{l.action_type}</span>
                                    <span className="text-[7px] text-white/20 font-mono">{new Date(l.created_at).toLocaleTimeString('ar-EG')}</span>
                                </div>
                                <p className="text-[10px] font-bold text-white/60 leading-relaxed">{l.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
