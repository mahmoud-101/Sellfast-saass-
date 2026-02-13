import React from 'react';

interface CreditsDisplayProps {
    credits: number;
}

const CreditsDisplay: React.FC<CreditsDisplayProps> = ({ credits }) => {
    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <span className="text-[10px] font-bold text-white">C</span>
            </div>
            <div className="flex flex-col">
                <span className="text-xs text-white/50 font-medium leading-none mb-0.5">Credits</span>
                <span className="text-sm font-bold text-white leading-none">{credits.toLocaleString()}</span>
            </div>
        </div>
    );
};

export default CreditsDisplay;
