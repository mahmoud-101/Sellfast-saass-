
import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOGO_IMAGE_URL = "https://i.ibb.co/MDrpHPzS/Artboard-1.png";

interface AuthProps {
    onGuestLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onGuestLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState<{type: 'error' | 'success' | 'info' | 'warning', text: string} | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isSupabaseConfigured()) {
            setMessage({ 
                type: 'warning', 
                text: '⚠️ تنبيه: يجب ربط Supabase لتفعيل الحسابات الحقيقية. اضغط على "دخول كضيف" بالأسفل لتجربة الموقع الآن.' 
            });
            return;
        }

        setLoading(true);
        setMessage(null);
        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ 
                    email, 
                    password,
                    options: { emailRedirectTo: window.location.origin }
                });
                if (error) throw error;
                setMessage({ type: 'success', text: 'تم إنشاء الحساب! تفقد بريدك الإلكتروني لتفعيله قبل الدخول.' });
            } else {
                const { error } = await supabase.auth.signInWithPassword({ 
                    email, 
                    password 
                });
                if (error) throw error;
            }
        } catch (error: any) {
            let msg = 'خطأ في العملية: ' + error.message;
            if (error.message.includes('Invalid login credentials')) msg = 'بيانات الدخول غير صحيحة';
            if (error.message.includes('Email not confirmed')) msg = 'يرجى تأكيد بريدك الإلكتروني أولاً';
            setMessage({ type: 'error', text: msg });
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthLogin = async (provider: 'github' | 'google') => {
        if (!isSupabaseConfigured()) {
            setMessage({ type: 'warning', text: 'الدخول الاجتماعي يتطلب تهيئة Supabase.' });
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: { redirectTo: window.location.origin }
            });
            if (error) throw error;
        } catch (error: any) {
            setMessage({ type: 'error', text: `فشل الاتصال بـ ${provider}` });
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-black font-tajawal text-right" dir="rtl">
            <div className="glass-card w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border border-white/5 relative overflow-hidden bg-black/40 backdrop-blur-3xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-30"></div>
                
                <div className="flex flex-col items-center mb-8">
                    <img src={LOGO_IMAGE_URL} alt="Ebdaa Pro" className="h-16 w-auto mb-4" />
                    <h1 className="text-3xl font-black text-white">إبداع <span className="text-[#FFD700]">برو</span></h1>
                    <p className="text-slate-400 text-[10px] mt-1 font-black uppercase tracking-widest">المحرك الاستراتيجي الفائق</p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#FFD700] transition-all text-right text-sm shadow-inner" placeholder="البريد الإلكتروني" />
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#FFD700] transition-all text-right text-sm shadow-inner" placeholder="كلمة المرور" />
                    
                    {message && (
                        <div className={`p-4 rounded-xl text-[10px] font-black text-center border animate-in zoom-in-95 ${
                            message.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 
                            message.type === 'warning' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="w-full py-5 bg-[#FFD700] text-black font-black rounded-2xl transition-all shadow-xl shadow-[#FFD700]/20 active:scale-[0.98]">
                        {loading ? 'جاري التحقق...' : (isSignUp ? 'إنشاء حساب جديد' : 'دخول المنصة')}
                    </button>
                </form>

                <div className="mt-6 space-y-4">
                    <div className="relative flex items-center justify-center py-2">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                        <span className="relative px-4 bg-black text-[9px] font-black text-slate-500 uppercase tracking-widest">أو جرب الموقع الآن</span>
                    </div>

                    <button 
                        onClick={onGuestLogin}
                        className="w-full py-4 bg-white text-black hover:bg-[#FFD700] font-black rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span>دخول سريع كضيف (Preview Mode)</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                    </button>

                    <div className="pt-4 text-center">
                        <button onClick={() => setIsSignUp(!isSignUp)} className="text-[10px] font-black text-slate-500 hover:text-[#FFD700] transition-all uppercase tracking-tighter">
                            {isSignUp ? 'لديك حساب بالفعل؟ سجل دخولك' : 'مستخدم جديد؟ اشترك مجاناً'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
