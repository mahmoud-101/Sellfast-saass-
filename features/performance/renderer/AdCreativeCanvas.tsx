/**
 * AdCreativeCanvas.tsx
 * Composites a product image + performance ad copy into
 * a publish-ready visual ad creative. Exports as PNG.
 * RTL-compatible. Mobile-first. Memory-safe.
 */

import React, { useRef, useCallback, useState } from 'react';
import type { AdCard } from '../types/ad.types';

interface Props {
    variant: AdCard;
    productImageSrc: string; // data URL or object URL
    onExported?: (objectUrl: string) => void;
}

// ─── Layout configs keyed by angle ────────────────────────────────────────────
const ANGLE_CONFIG: Record<string, {
    gradient: string;
    badgeColor: string;
    badgeText: string;
    textPosition: 'top' | 'bottom';
}> = {
    pain: { gradient: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(180,20,20,0.6) 100%)', badgeColor: '#EF4444', badgeText: '⚠️ مشكلة حقيقية', textPosition: 'bottom' },
    compare: { gradient: 'linear-gradient(180deg, rgba(10,40,100,0.85) 0%, rgba(0,0,0,0.7) 100%)', badgeColor: '#3B82F6', badgeText: '⚡ الفرق واضح', textPosition: 'bottom' },
    bold: { gradient: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(120,80,0,0.8) 100%)', badgeColor: '#F59E0B', badgeText: '🔥 ضمان النتيجة', textPosition: 'bottom' },
    transform: { gradient: 'linear-gradient(180deg, rgba(0,60,40,0.8) 0%, rgba(0,0,0,0.75) 100%)', badgeColor: '#10B981', badgeText: '✨ التحول الحقيقي', textPosition: 'bottom' },
    urgency: { gradient: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(150,50,0,0.9) 100%)', badgeColor: '#F97316', badgeText: '⏰ عرض محدود', textPosition: 'bottom' },
};

const AdCreativeCanvas: React.FC<Props> = ({ variant, productImageSrc, onExported }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const blobRef = useRef<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [exportReady, setExportReady] = useState(false);

    const config = ANGLE_CONFIG[variant.style] ?? ANGLE_CONFIG.bold;
    const accentColor = config.badgeColor;

    const handleExport = useCallback(async () => {
        if (!containerRef.current || isExporting) return;
        setIsExporting(true);
        setExportReady(false);

        try {
            const { default: html2canvas } = await import('html2canvas');
            const canvas = await html2canvas(containerRef.current, {
                scale: 2.5,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#000000',
                logging: false,
            });

            if (blobRef.current) {
                URL.revokeObjectURL(blobRef.current);
                blobRef.current = null;
            }

            canvas.toBlob(
                (blob) => {
                    if (!blob) { setIsExporting(false); return; }
                    const url = URL.createObjectURL(blob);
                    blobRef.current = url;
                    onExported?.(url);
                    setExportReady(true);
                    setIsExporting(false);
                },
                'image/png',
                0.95
            );
        } catch (err) {
            console.error('[AdCreativeCanvas] Export error:', err);
            setIsExporting(false);
        }
    }, [isExporting, onExported]);

    return (
        <div className="flex flex-col gap-3">
            {/* ── Creative Preview ── */}
            <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '1 / 1' }}>

                {/* This div is what html2canvas captures */}
                <div
                    ref={containerRef}
                    dir="rtl"
                    className="relative w-full h-full overflow-hidden"
                    style={{ aspectRatio: '1 / 1', minHeight: 320 }}
                >
                    {/* Product Image */}
                    <img
                        src={productImageSrc}
                        alt="product"
                        crossOrigin="anonymous"
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Gradient Overlay */}
                    <div
                        className="absolute inset-0"
                        style={{ background: config.gradient }}
                    />

                    {/* ── Text Layer ── */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6 gap-3">

                        {/* Badge */}
                        <div className="flex justify-end">
                            <span
                                className="text-xs font-black px-3 py-1 rounded-full text-black shadow-lg"
                                style={{ background: accentColor }}
                            >
                                {config.badgeText}
                            </span>
                        </div>

                        {/* Main Hook */}
                        <p
                            className="text-white font-black leading-snug text-right"
                            style={{
                                fontSize: 'clamp(16px, 4.5vw, 22px)',
                                textShadow: '0 2px 12px rgba(0,0,0,0.9)',
                            }}
                        >
                            {variant.headline}
                        </p>

                        {/* Bullets (top 2 only) */}
                        <div className="flex flex-col gap-1.5">
                            {variant.hooks.slice(0, 2).map((h, i) => (
                                <div key={i} className="flex items-center justify-end gap-2">
                                    <p
                                        className="text-white/90 text-right font-semibold"
                                        style={{
                                            fontSize: 'clamp(11px, 2.8vw, 13px)',
                                            textShadow: '0 1px 8px rgba(0,0,0,0.9)',
                                        }}
                                    >
                                        {h}
                                    </p>
                                    <span
                                        className="text-xs w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-black font-black"
                                        style={{ background: accentColor }}
                                    >
                                        ✓
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* CTA Bar */}
                        <div
                            className="flex items-center justify-center rounded-xl py-3 mt-1 shadow-lg"
                            style={{
                                background: accentColor,
                                boxShadow: `0 4px 20px ${accentColor}80`,
                            }}
                        >
                            <p className="text-black font-black text-center" style={{ fontSize: 'clamp(13px, 3.5vw, 16px)' }}>
                                {variant.ctaButton}
                            </p>
                        </div>
                    </div>

                    {/* Score watermark */}
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
                        <p className="text-white text-[10px] font-black">{variant.hookScore}% قوة الهوك</p>
                    </div>
                </div>
            </div>

            {/* ── Export Button ── */}
            <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full py-3 rounded-xl font-black text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: isExporting ? '#374151' : 'linear-gradient(90deg, #10B981, #059669)', color: '#000' }}
            >
                {isExporting ? (
                    <>
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        جاري التصدير...
                    </>
                ) : exportReady ? (
                    '✅ جاهز للتحميل — اضغط مرة أخرى للتحديث'
                ) : (
                    '📥 تصدير الكريتف كصورة PNG'
                )}
            </button>
        </div>
    );
};

export default AdCreativeCanvas;
