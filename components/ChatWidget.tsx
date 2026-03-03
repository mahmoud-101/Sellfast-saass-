
import React, { useState } from 'react';
import { askGemini } from '../services/geminiService';

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<{role: 'user' | 'bot', text: string}[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) return;
        const userMsg = message;
        setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
        setMessage('');
        setIsLoading(true);

        try {
            const botResponse = await askGemini(
                userMsg, 
                "أنت المساعد الذكي لمنصة إبداع برو (Ebdaa Pro). أجب على استفسارات المستخدمين حول التسويق، التصوير، وإنتاج المحتوى بلهجة مصرية محببة ومهنية."
            );
            setChatHistory(prev => [...prev, { role: 'bot', text: botResponse }]);
        } catch (e: any) {
            setChatHistory(prev => [...prev, { role: 'bot', text: e.message || 'عذراً، حدث خطأ في الاتصال بالمحرك.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-[250]">
            {isOpen ? (
                <div className="w-[calc(100vw-32px)] sm:w-96 h-[450px] sm:h-[500px] glass-card rounded-[2rem] flex flex-col shadow-2xl border border-white/10 overflow-hidden bg-black/90 backdrop-blur-xl">
                    <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center text-black text-xs">✨</div>
                            <span className="font-black text-xs sm:text-sm text-white">مساعد إبداع برو</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-2">✕</button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 suggestions-scrollbar">
                        {chatHistory.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] sm:text-xs font-bold ${msg.role === 'user' ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-slate-300 border border-white/5'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && <div className="text-[10px] text-[#FFD700] animate-pulse text-center font-bold">جاري التفكير...</div>}
                    </div>

                    <div className="p-3 sm:p-4 border-t border-white/5 flex gap-2 bg-white/5">
                        <input 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="اسألني أي شيء..."
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-[11px] sm:text-xs focus:outline-none focus:border-[#FFD700] text-right font-bold text-white"
                        />
                        <button onClick={handleSend} className="p-2 bg-[#FFD700] rounded-xl text-black shadow-lg shadow-[#FFD700]/20">
                            <svg className="w-4 h-4 rotate-180" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
                        </button>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FFD700] text-black shadow-2xl flex items-center justify-center hover:scale-110 transition-all border-4 border-black"
                >
                    <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                </button>
            )}
        </div>
    );
};

export default ChatWidget;
