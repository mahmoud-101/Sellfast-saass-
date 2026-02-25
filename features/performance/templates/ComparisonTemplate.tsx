/**
 * ComparisonTemplate.tsx — for "comparison" angles
 * RTL-compatible, mobile-first, pure presentation component.
 */

import React from 'react';
import type { LayoutData } from '../types';

interface Props {
    data: LayoutData;
}

const ComparisonTemplate: React.FC<Props> = ({ data }) => {
    const accent = data.accentColor ?? '#3B82F6';
    const left = data.comparison?.leftLabel ?? '❌ القديم';
    const right = data.comparison?.rightLabel ?? '✅ الجديد';

    return (
        <div
            dir="rtl"
            className="flex flex-col gap-5 rounded-3xl overflow-hidden bg-gradient-to-br from-gray-950 to-gray-900 border border-white/5 p-7 min-h-[340px] select-none relative"
        >
            {data.badge && (
                <span
                    className="absolute top-4 left-4 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
                    style={{ background: accent, color: '#fff' }}
                >
                    {data.badge}
                </span>
            )}

            {/* Headline */}
            <p className="text-lg font-black leading-snug text-white break-words max-w-prose">
                {data.headline}
            </p>

            {/* Comparison Grid */}
            <div className="grid grid-cols-2 gap-3">
                {/* Left — old/bad */}
                <div className="bg-red-950/40 border border-red-500/20 rounded-2xl p-4 flex flex-col gap-2">
                    <span className="text-[11px] font-black uppercase tracking-widest text-red-400">{left}</span>
                    <ul className="flex flex-col gap-1">
                        {data.bullets.slice(0, 2).map((b, i) => (
                            <li key={i} className="text-xs text-red-300 line-through opacity-70">
                                {b.replace('✅', '')}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Right — new/good */}
                <div
                    className="rounded-2xl p-4 flex flex-col gap-2 border"
                    style={{ background: `${accent}18`, borderColor: `${accent}40` }}
                >
                    <span
                        className="text-[11px] font-black uppercase tracking-widest"
                        style={{ color: accent }}
                    >
                        {right}
                    </span>
                    <ul className="flex flex-col gap-1">
                        {data.bullets.map((b, i) => (
                            <li key={i} className="text-xs text-white font-semibold">
                                {b}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* CTA */}
            <button
                className="mt-auto w-full py-3 rounded-xl font-black text-sm text-white transition-all hover:brightness-110 active:scale-95"
                style={{ background: accent }}
            >
                {data.cta}
            </button>
        </div>
    );
};

export default ComparisonTemplate;
