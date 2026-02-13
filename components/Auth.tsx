
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const LOGO_IMAGE_URL = "https://i.ibb.co/MDrpHPzS/Artboard-1.png";

const Auth: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState<{type: 'error' | 'success', text: string} | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) {
            setMessage({ type: 'error', text: 'خطأ: قاعدة البيانات غير مهيأة بشكل صحيح.' });
            return;
        }

        setLoading(true);
        setMessage(null);
        
        try {
            if (isSignUp) {
                // نرسل المستخدم دائماً إلى الصفحة الرئيسية للموقع بعد التأكيد
                const redirectUrl = window.location.origin;
                
                const { error } = await supabase.auth.signUp({ 
                    email, 
                    password,
                    options: {
                        emailRedirectTo: redirectUrl
                    }
                });
                if (error) throw error;
                setMessage({ 
                    type: 'success', 
                    text: 'تفقد بريدك الإلكتروني الآن! أرسلنا لك رابطاً لتفعيل الحساب. (ابحث في الـ Spam إذا لم تجده).' 
                });
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (error: any) {
            let errorText = error.message;
            if (errorText.includes('Invalid login credentials')) errorText = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
            if (errorText.includes('User already registered')) errorText = 'هذا البريد مسجل مسبقاً، حاول تسجيل الدخول.';
            if (errorText.includes('Password should be')) errorText = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.';
            if (errorText.includes('Email not confirmed')) errorText = 'يرجى تأكيد بريدك الإلكتروني أولاً عبر الرابط المرسل إليك.';
            
            setMessage({ type: 'error', text: errorText });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        if (!supabase) return;
        try {
            const { error } = await supabase.auth.signInWithOAuth({ 
                provider: 'google',
                options: { redirectTo: window.location.origin }
            });
            if (error) throw error;
        } catch (error: any) {
            setMessage({ type: 'error', text: 'فشل تسجيل الدخول بجوجل، يرجى المحاولة لاحقاً.' });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#08080e] font-tajawal">
            <div className="glass-card w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border border-white/5 animate-in fade-in zoom-in duration-500">
                <div className="flex flex-col items-center mb-10">
                    <img src={LOGO_IMAGE_URL} alt="Ebdaa Pro" className="h-20 w-auto mb-6 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]" />
                    <h1 className="text-3xl font-black text-white">إبداع <span className="text-[var(--color-accent)]">برو</span></h1>
                    <p className="text-white/40 text-sm mt-2 font-bold">بوابة المبدعين والمسوقين الأذكياء</p>
                </div>

                <form onSubmit={handleAuth} className="space-y-5">
                    <div className="space-y-2 text-right">
                        <label className="text-[11px] font-black text-white/60 uppercase tracking-widest mr-1">البريد الإلكتروني</label>
                        <input 
                            type="email" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none transition-all text-right placeholder:text-white/10" 
                            placeholder="name@company.com"
                        />
                    </div>
                    <div className="space-y-2 text-right">
                        <label className="text-[11px] font-black text-white/60 uppercase tracking-widest mr-1">كلمة المرور</label>
                        <input 
                            type="password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none transition-all text-right placeholder:text-white/10" 
                            placeholder="••••••••"
                        />
                    </div>

                    {message && (
                        <div className={`p-4 rounded-2xl text-[11px] font-bold text-center animate-in fade-in slide-in-from-top-2 border leading-relaxed ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                            {message.text}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white font-black rounded-2xl shadow-xl shadow-[var(--color-accent)]/20 transition-all disabled:opacity-50 active:scale-95 text-lg"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>جاري المعالجة...</span>
                            </div>
                        ) : (isSignUp ? 'ابدأ رحلة الإبداع' : 'دخول المنصة')}
                    </button>
                </form>

                <div className="mt-8 space-y-5">
                    <div className="relative flex items-center justify-center">
                        <div className="flex-grow border-t border-white/5"></div>
                        <span className="px-4 text-[10px] text-white/20 font-black uppercase">أو الدخول السريع</span>
                        <div className="flex-grow border-t border-white/5"></div>
                    </div>

                    <button 
                        onClick={handleGoogleLogin}
                        className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        الدخول عبر جوجل
                    </button>

                    <div className="text-center pt-4">
                        <button 
                            onClick={() => setIsSignUp(!isSignUp)} 
                            className="text-sm font-bold text-white/40 hover:text-[var(--color-accent)] transition-colors"
                        >
                            {isSignUp ? 'لديك حساب؟ سجل دخولك' : 'ليس لديك حساب؟ اشترك الآن مجاناً'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
