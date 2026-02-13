
import React, { useEffect, useState } from 'react';
import { getAdminUsers, getAdminStats, getAdminLogs } from '../lib/supabase';

const AdminDashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalUsers: 0, totalCredits: 0, activeToday: 0 });
    const [logs, setLogs] = useState<any[]>([]);

    const refreshData = async () => {
        setLoading(true);
        try {
            const [usersData, statsData, logsData] = await Promise.all([
                getAdminUsers(),
                getAdminStats(),
                getAdminLogs()
            ]);
            setUsers(usersData);
            setStats(statsData);
            setLogs(logsData);
        } catch (error) {
            console.error("Failed to load real-time admin data:", error);
        } finally {
            setLoading(false);
        }
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
            {/* Deployment Guide for Owner */}
            <div className="glass-card p-8 rounded-[2.5rem] border-2 border-dashed border-emerald-500/30 bg-emerald-500/5 text-right">
                <div className="flex items-center justify-end gap-3 mb-4">
                    <h2 className="text-2xl font-black text-emerald-400">دليل الرفع المجاني (خاص بك كمالك) 🚀</h2>
                    <span className="text-2xl">🌍</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div className="space-y-2 p-4 bg-black/20 rounded-2xl">
                        <span className="font-black text-emerald-500">1. جهز الكود</span>
                        <p className="text-white/60">قم بإنشاء مستودع (Repository) جديد على GitHub وارفع الملفات إليه.</p>
                    </div>
                    <div className="space-y-2 p-4 bg-black/20 rounded-2xl">
                        <span className="font-black text-emerald-500">2. Netlify / Vercel</span>
                        <p className="text-white/60">اربط حسابك بالـ GitHub واختر المستودع. سيتم البناء تلقائياً.</p>
                    </div>
                    <div className="space-y-2 p-4 bg-black/20 rounded-2xl">
                        <span className="font-black text-emerald-500">3. المتغيرات السرية</span>
                        <p className="text-white/60">في إعدادات الاستضافة (Env Vars)، أضف API_KEY و SUPABASE_URL ليعمل النظام.</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="text-right">
                    <h1 className="text-4xl font-black text-white tracking-tighter">إحصائيات إبداع برو الحية</h1>
                    <p className="text-white/40 text-sm mt-1">إدارة المستخدمين والعمليات من قاعدة البيانات.</p>
                </div>
                <button onClick={refreshData} className="px-6 py-2 bg-[var(--color-accent)] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg">تحديث البيانات</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6 rounded-[2rem] text-right">
                    <span className="text-[10px] font-black text-white/30 uppercase">إجمالي المستخدمين</span>
                    <p className="text-3xl font-black text-white">{stats.totalUsers}</p>
                </div>
                <div className="glass-card p-6 rounded-[2rem] text-right">
                    <span className="text-[10px] font-black text-white/30 uppercase">الأرباح التقديرية</span>
                    <p className="text-3xl font-black text-emerald-400">{stats.totalUsers * 450} ج.م</p>
                </div>
                <div className="glass-card p-6 rounded-[2rem] text-right">
                    <span className="text-[10px] font-black text-white/30 uppercase">النقاط الفعالة</span>
                    <p className="text-3xl font-black text-indigo-400">{stats.totalCredits}</p>
                </div>
                <div className="glass-card p-6 rounded-[2rem] text-right">
                    <span className="text-[10px] font-black text-white/30 uppercase">نشاط اليوم</span>
                    <p className="text-3xl font-black text-white">{stats.activeToday}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card rounded-[2.5rem] p-8 text-right overflow-x-auto">
                    <h3 className="text-xl font-black text-white mb-6">قائمة المشتركين</h3>
                    <table className="w-full text-right text-xs">
                        <thead className="text-white/30 uppercase">
                            <tr>
                                <th className="pb-4">المستخدم</th>
                                <th className="pb-4">الرصيد</th>
                                <th className="pb-4">تاريخ التسجيل</th>
                            </tr>
                        </thead>
                        <tbody className="text-white/80">
                            {users.map((u, i) => (
                                <tr key={i} className="border-t border-white/5">
                                    <td className="py-4 font-bold">{u.email || u.id}</td>
                                    <td className="py-4 text-emerald-400 font-black">{u.credits}</td>
                                    <td className="py-4 opacity-40">{new Date(u.created_at).toLocaleDateString('ar-EG')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="glass-card rounded-[2.5rem] p-8 text-right">
                    <h3 className="text-xl font-black text-white mb-6">آخر العمليات</h3>
                    <div className="space-y-4">
                        {logs.map((l, i) => (
                            <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[10px] text-[var(--color-accent)] font-black uppercase">{l.action_type}</p>
                                <p className="text-xs font-bold text-white/70 mt-1">{l.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
