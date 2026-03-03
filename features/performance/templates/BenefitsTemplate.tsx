/**
 * BenefitsTemplate.tsx — for "transformation" angles
 * RTL-compatible, mobile-first, pure presentation component.
 */

import React from 'react';
import type { LayoutData } from '../types';

interface Props {
    data: LayoutData;
}

const BenefitsTemplate: React.FC<Props> = ({ data }) => {
    const accent = data.accentColor ?? '#10B981';
    const icons = data.iconSet ?? ['✅', '⚡', '🎯', '💎'];

    return (
        <div
            dir="rtl"
            className="flex flex-col gap-5 rounded-3xl overflow-hidden bg-gradient-to-br from-gray-950 to-gray-900 border border-white/5 p-7 min-h-[340px] select-none relative"
        >
            {data.badge && (
                <span
                    className="absolute top-4 left-4 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full text-black"
                    style={{ background: accent }}
                >
                    {data.badge}
                </span>
            )}

            {/* Headline with highlight */}
            <p className="text-xl font-black leading-snug text-white break-words max-w-prose">
                {data.highlightWord ? (
                    <>
                        {data.headline.split(data.highlightWord).map((part, i, arr) => (
                            <React.Fragment key={i}>
                                {part}
                                {i < arr.length - 1 && (
                                    <span style={{ color: accent }}>{data.highlightWord}</span>
                                )}
                            </React.Fragment>
                        ))}
                    </>
                ) : (
                    data.headline
                )}
            </p>

            {/* Benefits list */}
            <div className="flex flex-col gap-3">
                {data.bullets.map((b, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <span className="text-lg shrink-0">{icons[i % icons.length]}</span>
                        <p className="text-sm text-slate-200 leading-relaxed">{b}</p>
                    </div>
                ))}
            </div>

            {/* Progress bar accent */}
            <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all"
                    style={{ width: '75%', background: accent }}
                />
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

export default BenefitsTemplate;
