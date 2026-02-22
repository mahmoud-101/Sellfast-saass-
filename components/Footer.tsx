
import React from 'react';
import { AppView } from '../types';

const LOGO_IMAGE_URL = "https://i.ibb.co/MDrpHPzS/Artboard-1.png";

interface FooterProps {
    onNavigate: (view: AppView) => void;
    onOpenPricing: () => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenPricing }) => {
    return (
        <footer className="w-full mt-32 border-t border-white/5 bg-black py-24 px-10 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-yellow-600/5 rounded-full blur-[100px] opacity-50"></div>
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 text-right" dir="rtl">
                    
                    <div className="space-y-8">
                        <div className="flex items-center justify-start gap-3">
                            <img src={LOGO_IMAGE_URL} alt="Ebdaa Pro" className="h-10 w-auto" />
                            <span className="text-3xl font-black text-white tracking-tighter uppercase">إبداع <span className="text-[#FFD700]">برو</span></span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed font-medium">
                            المنصة العربية الرائدة التي تجمع كافة أدوات الذكاء الاصطناعي في مكان واحد لمساعدة الميديا بايرز وأصحاب المتاجر على النمو.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-[#FFD700] font-black mb-8 uppercase tracking-widest text-[10px]">الوصول السريع</h4>
                        <ul className="space-y-5 text-slate-400 text-sm font-bold">
                            <li><button onClick={() => onNavigate('suite_view')} className="hover:text-[#FFD700] transition-colors">لوحة المحطات الإبداعية</button></li>
                            <li><button onClick={() => onNavigate('power')} className="hover:text-[#FFD700] transition-colors">المركز الاستراتيجي</button></li>
                            <li><button onClick={() => onNavigate('ads_studio')} className="hover:text-[#FFD700] transition-colors">استوديو الإعلانات</button></li>
                            <li><button onClick={() => onNavigate('photoshoot')} className="hover:text-[#FFD700] transition-colors">مركز التصوير</button></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[#FFD700] font-black mb-8 uppercase tracking-widest text-[10px]">الموارد</h4>
                        <ul className="space-y-5 text-slate-400 text-sm font-bold">
                            <li><button onClick={onOpenPricing} className="text-yellow-500 hover:text-yellow-400 transition-colors">💰 شحن رصيد النقاط</button></li>
                            <li><button onClick={() => onNavigate('faq')} className="hover:text-[#FFD700] transition-colors">مركز المساعدة</button></li>
                            <li><a href="https://wa.me/201090624823" target="_blank" className="hover:text-[#FFD700] transition-colors">الدعم الفني المباشر</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[#FFD700] font-black mb-8 uppercase tracking-widest text-[10px]">قانوني</h4>
                        <ul className="space-y-5 text-slate-400 text-sm font-bold">
                            <li><button onClick={() => onNavigate('privacy_policy')} className="hover:text-[#FFD700] transition-colors">سياسة الخصوصية</button></li>
                            <li><button onClick={() => onNavigate('terms_of_service')} className="hover:text-[#FFD700] transition-colors">شروط الاستخدام</button></li>
                        </ul>
                    </div>
                </div>
                
                <div className="mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
                    <p>Ebdaa Pro Intelligence © 2025</p>
                    <div className="flex items-center gap-2">Built for growth <div className="w-1 h-1 bg-[#FFD700] rounded-full"></div> Cairo, Egypt</div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
