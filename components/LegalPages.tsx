
import React from 'react';

export const PrivacyPolicy: React.FC = () => (
    <div className="glass-card rounded-[3rem] p-12 text-right max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-5">
        <h1 className="text-4xl font-black text-white mb-8 border-r-8 border-[var(--color-accent)] pr-6">سياسة الخصوصية</h1>
        <div className="space-y-6 text-white/70 leading-relaxed">
            <p>في "إبداع برو"، نلتزم بحماية بياناتك وخصوصيتك بأقصى معايير الأمان الرقمي.</p>
            <h3 className="text-xl font-bold text-white mt-8">1. البيانات التي نجمعها</h3>
            <p>نحن نجمع فقط البيانات الضرورية لتقديم الخدمة، مثل البريد الإلكتروني لتسجيل الدخول، والصور التي تقوم برفعها للمعالجة عبر الذكاء الاصطناعي.</p>
            <h3 className="text-xl font-bold text-white">2. كيف نستخدم الصور؟</h3>
            <p>تُستخدم الصور المرفوعة حصرياً لتوليد المحتوى الإبداعي الخاص بك. لا يتم استخدام صور منتجاتك في تدريب نماذج الذكاء الاصطناعي العامة، وتظل ملكيتك الفكرية محفوظة بالكامل.</p>
            <h3 className="text-xl font-bold text-white">3. مشاركة البيانات</h3>
            <p>لا نقوم ببيع بياناتك لأي طرف ثالث. يتم معالجة العمليات الحسابية عبر محركات Google Cloud و Supabase المؤمنة عالمياً.</p>
        </div>
    </div>
);

export const TermsOfService: React.FC = () => (
    <div className="glass-card rounded-[3rem] p-12 text-right max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-5">
        <h1 className="text-4xl font-black text-white mb-8 border-r-8 border-[var(--color-accent)] pr-6">شروط الاستخدام</h1>
        <div className="space-y-6 text-white/70 leading-relaxed">
            <p>باستخدامك لمنصة "إبداع برو"، أنت توافق على الالتزام بالشروط التالية:</p>
            <h3 className="text-xl font-bold text-white mt-8">1. نظام الرصيد (Credits)</h3>
            <p>تعتمد المنصة نظام النقاط. كل عملية توليد تستهلك عدداً محدداً من النقاط. الرصيد المشحون غير قابل للاسترداد نقدياً ولكن يمكن استخدامه في أي وقت داخل المنصة.</p>
            <h3 className="text-xl font-bold text-white">2. حقوق الملكية</h3>
            <p>أنت تمتلك حقوق الاستخدام التجاري الكاملة للمخرجات (الصور والفيديوهات) التي يتم توليدها عبر المنصة.</p>
            <h3 className="text-xl font-bold text-white">3. الاستخدام العادل</h3>
            <p>يُمنع استخدام المنصة لتوليد محتوى غير لائق، مخالف للقانون، أو ينتهك خصوصية الآخرين. نحتفظ بالحق في إيقاف أي حساب يخالف هذه المعايير.</p>
        </div>
    </div>
);
