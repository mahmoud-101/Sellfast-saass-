
import React, { useState, useEffect } from 'react';

const LiveVisitors: React.FC = () => {
    const [count, setCount] = useState(142);

    useEffect(() => {
        const interval = setInterval(() => {
            const change = Math.floor(Math.random() * 5) - 2;
            setCount(prev => Math.max(120, prev + change));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full backdrop-blur-md">
            <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter">
                {count} منتج متصل الآن
            </span>
        </div>
    );
};

export default LiveVisitors;
