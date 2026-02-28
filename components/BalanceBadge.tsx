import React, { useState, useEffect } from 'react';
import { supabase, getUserCredits } from '../lib/supabase';
import { Coins, Zap } from 'lucide-react';

interface BalanceBadgeProps {
    userId: string;
}

export const BalanceBadge: React.FC<BalanceBadgeProps> = ({ userId }) => {
    const [credits, setCredits] = useState<number | null>(null);
    const [points, setPoints] = useState<number>(0);
    const [rank, setRank] = useState<string>('Media Buyer Beginner');
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (!userId) return;

        // Initial fetch
        const fetchUserData = async () => {
            const { data } = await supabase.from('profiles').select('credits, user_points, user_rank').eq('id', userId).single();
            if (data) {
                setCredits(data.credits);
                setPoints(data.user_points || 0);
                setRank(data.user_rank || 'Media Buyer Beginner');
            }
        };

        fetchUserData();

        // Subscribe to changes in the profiles table
        const channel = supabase
            .channel('profile-changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${userId}`,
                },
                (payload) => {
                    if (payload.new) {
                        if (typeof payload.new.credits === 'number' && payload.new.credits !== credits) {
                            setCredits(payload.new.credits);
                            setIsAnimating(true);
                            setTimeout(() => setIsAnimating(false), 1000);
                        }
                        if (typeof payload.new.user_points === 'number') {
                            setPoints(payload.new.user_points);
                        }
                        if (payload.new.user_rank) {
                            setRank(payload.new.user_rank);
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, credits]);

    if (credits === null) return null;

    return (
        <div className="flex items-center gap-3">
            {/* Rank Badge */}
            <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                <span className="text-[11px] font-black text-slate-300 whitespace-nowrap">{rank}</span>
                <div className="h-3 w-px bg-slate-800 mx-1" />
                <span className="text-[11px] font-bold text-blue-400">{points} pts</span>
            </div>

            {/* Credits Badge */}
            <div className={`
                relative flex items-center gap-2 bg-gradient-to-r from-orange-500/10 to-transparent 
                border border-orange-500/20 px-4 py-2 rounded-2xl transition-all duration-500
                ${isAnimating ? 'scale-110 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]' : ''}
            `}>
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                    <Coins className="w-3.5 h-3.5 text-black fill-current" />
                </div>

                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-orange-500 uppercase leading-none mb-0.5">الرصيد</span>
                    <div className="flex items-center gap-1">
                        <span className="text-sm font-black text-white leading-none">{credits}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase leading-none">نقطة</span>
                    </div>
                </div>

                {isAnimating && (
                    <div className="absolute -top-1 -right-1">
                        <Zap className="w-4 h-4 text-orange-400 animate-bounce fill-current" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default BalanceBadge;
