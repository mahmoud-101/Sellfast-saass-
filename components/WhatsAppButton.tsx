
import React from 'react';

const WhatsAppButton: React.FC = () => {
    return (
        <a 
            href="https://wa.me/201090624823" 
            target="_blank" 
            rel="noopener noreferrer"
            className="fixed bottom-24 right-8 z-[200] group flex items-center gap-3"
        >
            <div className="bg-white text-black px-4 py-2 rounded-2xl text-xs font-black shadow-2xl opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 pointer-events-none">
                دعم فني مباشر
            </div>
            <div className="w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(37,211,102,0.4)] hover:scale-110 active:scale-95 transition-all">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.012 2c-5.508 0-9.987 4.479-9.987 9.988 0 1.757.455 3.409 1.251 4.849l-1.332 4.86 4.975-1.304c1.404.757 2.997 1.189 4.693 1.189 5.508 0 9.988-4.479 9.988-9.988 0-5.508-4.48-9.988-9.988-9.988zm6.541 14.156c-.285.802-1.454 1.459-2.003 1.558-.49.088-1.127.159-1.808-.159-2.883-1.343-4.706-4.321-4.851-4.512-.144-.191-1.171-1.554-1.171-2.96 0-1.406.738-2.097 1-2.39.262-.293.571-.366.762-.366.191 0 .381.001.547.009.176.009.414-.066.649.492.235.558.802 1.956.872 2.1.07.144.117.311.023.498-.094.187-.141.311-.282.47-.141.159-.297.355-.424.476-.141.134-.288.28-.124.558.164.278.728 1.199 1.562 1.933.1.088.192.13.284.13.111 0 .216-.051.31-.137.288-.266.63-.687.9-.993.271-.306.495-.257.778-.152.282.105 1.79.845 2.097.998.307.153.511.228.586.356.075.127.075.736-.21 1.538z"/>
                </svg>
            </div>
        </a>
    );
};

export default WhatsAppButton;
