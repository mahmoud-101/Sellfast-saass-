
import React from 'react';
import { AppView } from '../types';

const LOGO_IMAGE_URL = "https://i.ibb.co/MDrpHPzS/Artboard-1.png";

interface FooterProps {
    onNavigate: (view: AppView) => void;
    onOpenPricing: () => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenPricing }) => {
    return (
        <footer className="w-full mt-20 border-t border-white/5 bg-black/40 backdrop-blur-3xl py-20 px-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full -z-10"></div>
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 text-right">
                    
                    {/* Brand Info */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-end gap-3 mb-4">
                            <span className="text-3xl font-black text-white tracking-tighter">إبداع <span className="text-indigo-500">برو</span></span>
                            <img src={LOGO_IMAGE_URL} alt="Ebdaa Pro" className="h-10 w-auto" />
                        </div>
                        <p className="text-white/40 text-xs leading-relaxed font-bold max-w-xs">
                            المنصة العربية الرائدة في تحويل خيالك التجاري إلى واقع بصري وفيديوهات سينمائية باستخدام أحدث تقنيات الذكاء الاصطناعي في العالم.
                        </p>
                        <div className="flex justify-end gap-3 grayscale opacity-30 hover:opacity-100 transition-all pt-4">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" className="h-4 w-auto" alt="Stripe" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4 w-auto" alt="PayPal" />
                        </div>
                    </div>

                    {/* Studios */}
                    <div>
                        <h4 className="text-white font-black mb-8 uppercase tracking-[0.2em] text-[10px] text-indigo-400">الاستوديوهات الإبداعية</h4>
                        <ul className="space-y-4 text-white/50 text-sm font-black">
                            {/* Fix: Updated onNavigate calls to use valid AppView suite IDs instead of invalid strings */}
                            <li><button onClick={() => onNavigate('power')} className="hover:text-white transition-colors">⚡ الإنتاج الشامل (Power)</button></li>
                            <li><button onClick={() => onNavigate('av_media')} className="hover:text-white transition-colors">🎬 ريلز سينمائي (Veo)</button></li>
                            <li><button onClick={() => onNavigate('photography')} className="hover:text-white transition-colors">🤳 محتوى العملاء (UGC)</button></li>
                            <li><button onClick={() => onNavigate('design')} className="hover:text-white transition-colors">🏷️ الهوية البصرية</button></li>
                            <li><button onClick={() => onNavigate('photography')} className="hover:text-white transition-colors">🎨 استوديو المبدعين</button></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-white font-black mb-8 uppercase tracking-[0.2em] text-[10px] text-indigo-400">الموارد والنمو</h4>
                        <ul className="space-y-4 text-white/50 text-sm font-black">
                            <li><button onClick={onOpenPricing} className="text-emerald-400 hover:text-emerald-300 transition-colors">💰 باقات الشحن والأسعار</button></li>
                            <li><button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors">❓ مركز المساعدة والـ FAQ</button></li>
                            <li><a href="https://wa.me/201090624823" target="_blank" className="hover:text-white transition-colors">📱 الدعم الفني المباشر</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">📖 دليل كتابة الـ Prompts</a></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-white font-black mb-8 uppercase tracking-[0.2em] text-[10px] text-indigo-400">القانون والخصوصية</h4>
                        <ul className="space-y-4 text-white/50 text-sm font-black">
                            <li><button onClick={() => onNavigate('privacy_policy')} className="hover:text-white transition-colors">🔒 سياسة خصوصية البيانات</button></li>
                            <li><button onClick={() => onNavigate('terms_of_service')} className="hover:text-white transition-colors">⚖️ شروط الاستخدام التجاري</button></li>
                            <li><button onClick={() => onNavigate('admin_dashboard')} className="text-indigo-500/50 hover:text-indigo-500 text-[10px]">🛡️ بوابة الإدارة (خاص بالمالك)</button></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Ebdaa Pro Intelligent Systems © 2025</p>
                    <div className="flex gap-6">
                         <a href="#" className="text-white/20 hover:text-white transition-all"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
                         <a href="#" className="text-white/20 hover:text-white transition-all"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
