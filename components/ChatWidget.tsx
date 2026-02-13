
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

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
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: userMsg,
                config: {
                    systemInstruction: "أنت المساعد الذكي لمنصة إبداع برو (Ebdaa Pro). أجب على استفسارات المستخدمين حول التسويق، التصوير، وإنتاج المحتوى بلهجة مصرية محببة ومهنية."
                }
            });
            setChatHistory(prev => [...prev, { role: 'bot', text: response.text || 'عذراً، حاول مرة أخرى' }]);
        } catch (e) {
            setChatHistory(prev => [...prev, { role: 'bot', text: 'حدث خطأ في الاتصال بالمحرك.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[250]">
            {isOpen ? (
                <div className="w-80 sm:w-96 h-[500px] glass-card rounded-[2rem] flex flex-col shadow-2xl border border-white/10 animate-in slide-in-from-bottom-5">
                    <div className="p-5 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white">✨</div>
                            <span className="font-black text-sm">مساعد إبداع برو</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white">✕</button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 suggestions-scrollbar">
                        {chatHistory.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium ${msg.role === 'user' ? 'bg-[var(--color-accent)] text-white' : 'bg-white/5 text-white/80'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && <div className="text-[10px] text-white/20 animate-pulse">جاري التفكير...</div>}
                    </div>

                    <div className="p-4 border-t border-white/5 flex gap-2">
                        <input 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="اسألني أي شيء..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[var(--color-accent)]"
                        />
                        <button onClick={handleSend} className="p-2 bg-[var(--color-accent)] rounded-xl text-white">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
                        </button>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 rounded-full bg-[var(--color-accent)] text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-all border-4 border-white/10"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                </button>
            )}
        </div>
    );
};

export default ChatWidget;
