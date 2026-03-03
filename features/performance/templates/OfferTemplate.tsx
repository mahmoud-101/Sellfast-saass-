/**
 * OfferTemplate.tsx — for "bold_claim" and "urgency" angles
 * RTL-compatible, mobile-first, pure presentation component.
 */

import React from 'react';
import type { LayoutData } from '../types';

interface Props {
    data: LayoutData;
}

const OfferTemplate: React.FC<Props> = ({ data }) => {
    const accent = data.accentColor ?? '#F59E0B';

    return (
        <div
            dir="rtl"
            className="flex flex-col gap-5 rounded-3xl overflow-hidden relative min-h-[340px] select-none"
            style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1700 100%)' }}
        >
            {/* Top gradient bar */}
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />

            <div className="flex flex-col gap-5 p-7 flex-1">
                {/* Glow badge */}
                {data.badge && (
                    <div className="flex justify-start">
                        <span
                            className="text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full text-black"
                            style={{ background: accent, boxShadow: `0 0 15px ${accent}80` }}
                        >
                            {data.badge}
                        </span>
                    </div>
                )}

                {/* Main Headline */}
                <p
                    className="text-2xl font-black leading-snug text-white break-words max-w-prose"
                    style={{ textShadow: `0 0 30px ${accent}60` }}
                >
                    {data.headline}
                </p>

                {/* Bullet Points */}
                <div className="grid grid-cols-1 gap-2">
                    {data.bullets.map((b, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2.5 border"
                            style={{ borderColor: `${accent}20` }}
                        >
                            <span className="text-base shrink-0">{data.iconSet?.[i % (data.iconSet?.length ?? 1)] ?? '✅'}</span>
                            <p className="text-sm text-slate-200 leading-relaxed">{b}</p>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <button
                    className="mt-auto w-full py-4 rounded-2xl font-black text-base text-black transition-all hover:brightness-110 active:scale-95"
                    style={{
                        background: `linear-gradient(90deg, ${accent}, ${accent}cc)`,
                        boxShadow: `0 0 25px ${accent}50`,
                    }}
                >
                    {data.cta}
                </button>
            </div>

            {/* Bottom gradient bar */}
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
        </div>
    );
};

export default OfferTemplate;
