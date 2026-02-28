import React from 'react';
import { ShieldCheck, TrendingUp, Zap, Share2, Award, Gem } from 'lucide-react';

interface ViralResultCardProps {
    data: {
        productName: string;
        hookStrength: string;
        conversionConfidence: number;
        estimatedRoas: string;
        rankEarned?: string;
    };
}

export const ViralResultCard: React.FC<ViralResultCardProps> = ({ data }) => {
    return (
        <div className="relative w-full max-w-sm mx-auto overflow-hidden rounded-[2.5rem] bg-[#050505] border border-yellow-500/20 shadow-2xl shadow-yellow-500/5 group">
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/5 via-transparent to-blue-500/5 opacity-50" />

            {/* Top Shine */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />

            {/* Pattern Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fbbf24 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            <div className="relative p-8 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                            <Zap className="w-4 h-4 text-black fill-current" />
                        </div>
                        <span className="text-xs font-black text-yellow-500 uppercase tracking-widest">Performance Report</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-full border border-white/10">
                        <ShieldCheck className="w-3 h-3 text-green-400" />
                        <span className="text-[8px] font-bold text-slate-400 uppercase">AI Verified</span>
                    </div>
                </div>

                {/* Product Name */}
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white leading-tight line-clamp-2">{data.productName}</h3>
                    <div className="flex items-center gap-2">
                        <div className="h-0.5 w-8 bg-yellow-500" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Optimized for Conversion</span>
                    </div>
                </div>

                {/* Main Stats Area */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Hook Strength</span>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span className="text-lg font-black text-white">{data.hookStrength}</span>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Est. ROAS</span>
                        <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-yellow-500" />
                            <span className="text-lg font-black text-white">{data.estimatedRoas}x</span>
                        </div>
                    </div>
                </div>

                {/* Confidence Bar */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                        <span className="text-slate-400 tracking-wider">Conversion Confidence</span>
                        <span className="text-yellow-500">{(data.conversionConfidence * 10).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                        <div
                            className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-[0_0_10px_rgba(251,191,36,0.5)] transition-all duration-1000"
                            style={{ width: `${data.conversionConfidence * 10}%` }}
                        />
                    </div>
                </div>

                {/* Footer / Rank */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                            <Gem className="w-5 h-5 text-blue-400 animate-pulse" />
                        </div>
                        <div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase block leading-none">Status</span>
                            <span className="text-xs font-black text-white uppercase">{data.rankEarned || 'Media Buyer Beginner'}</span>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-yellow-400 hover:scale-105 transition-all">
                        <Share2 className="w-3 h-3" />
                        Share
                    </button>
                </div>
            </div>

            {/* Bottom Glow */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl" />
        </div>
    );
};
