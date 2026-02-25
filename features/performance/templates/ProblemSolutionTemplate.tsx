/**
 * ProblemSolutionTemplate.tsx — for "pain" angles
 * RTL-compatible, mobile-first, pure presentation component.
 */

import React from 'react';
import type { LayoutData } from '../types';

interface Props {
    data: LayoutData;
}

const ProblemSolutionTemplate: React.FC<Props> = ({ data }) => {
    const accent = data.accentColor ?? '#EF4444';
    return (
        <div
            dir="rtl"
            className="relative flex flex-col gap-5 rounded-3xl overflow-hidden bg-gradient-to-br from-gray-950 to-gray-900 border border-white/5 p-7 min-h-[340px] select-none"
        >
            {/* Badge */}
            {data.badge && (
                <span
                    className="absolute top-4 left-4 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
                    style={{ background: accent, color: '#000' }}
                >
                    {data.badge}
                </span>
            )}

            {/* Problem side */}
            <div className="flex flex-col gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-red-400">
                    {data.iconSet?.[0]} المشكلة
                </span>
                <p
                    className="text-lg font-black leading-snug text-white break-words max-w-prose"
                    style={{ textShadow: `0 0 20px ${accent}40` }}
                >
                    {data.headline}
                </p>
            </div>

            {/* Arrow divider */}
            <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xl opacity-60">{data.iconSet?.[1] ?? '➡️'}</span>
                <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Solution bullets */}
            <div className="flex flex-col gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">
                    {data.iconSet?.[2]} الحل
                </span>
                {data.bullets.map((b, i) => (
                    <p key={i} className="text-sm text-slate-300 leading-relaxed">
                        {b}
                    </p>
                ))}
            </div>

            {/* CTA */}
            <button
                className="mt-auto w-full py-3 rounded-xl font-black text-sm text-black transition-all hover:brightness-110 active:scale-95"
                style={{ background: accent }}
            >
                {data.cta}
            </button>
        </div>
    );
};

export default ProblemSolutionTemplate;
