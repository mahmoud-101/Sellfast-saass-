import React, { useRef, useCallback, useState } from 'react';
import type { AdCard, Platform, AudienceSegment } from '../types';
import { PLATFORM_SPECS, calculateSafeLayout } from '../engine/PlatformAdaptationEngine';
import { SEGMENT_STYLES } from '../engine/AudienceSegmenter';

interface Props {
    variant: AdCard;
    productImageSrc: string; // data URL or object URL
    platform?: Platform;
    segment?: AudienceSegment;
    onExported?: (objectUrl: string) => void;
}

const AdCreativeCanvas: React.FC<Props> = ({
    variant,
    productImageSrc,
    platform = 'facebook_feed',
    segment,
    onExported
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const blobRef = useRef<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [exportReady, setExportReady] = useState(false);

    const platformSpec = PLATFORM_SPECS[platform];
    const safeLayout = calculateSafeLayout(platform);

    // Determine visual style based on segment or fallback to variant style
    const segmentStyle = segment ? SEGMENT_STYLES[segment.colorScheme] : null;
    const gradient = segmentStyle?.gradient || 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.9) 100%)';
    const accentColor = segmentStyle?.accent || '#FFD700';

    const handleExport = useCallback(async () => {
        if (!containerRef.current || isExporting) return;
        setIsExporting(true);
        setExportReady(false);

        try {
            const { default: html2canvas } = await import('html2canvas');
            const canvas = await html2canvas(containerRef.current, {
                scale: 2.0, // Reduced from 2.5 for memory safety on mobile
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#000000',
                logging: false,
                width: platformSpec.dimensions.width,
                height: platformSpec.dimensions.height,
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
                0.90
            );
        } catch (err) {
            console.error('[AdCreativeCanvas] Export error:', err);
            setIsExporting(false);
        }
    }, [isExporting, onExported, platformSpec]);

    const aspectActive = platformSpec.dimensions.width / platformSpec.dimensions.height;

    return (
        <div className="flex flex-col gap-3">
            {/* ── Creative Preview ── */}
            <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-black" style={{ aspectRatio: aspectActive }}>

                {/* This div is what html2canvas captures */}
                <div
                    ref={containerRef}
                    dir="rtl"
                    className="relative overflow-hidden mx-auto"
                    style={{
                        width: platformSpec.dimensions.width,
                        height: platformSpec.dimensions.height,
                        transform: 'scale(var(--preview-scale, 1))',
                        transformOrigin: 'top center'
                    }}
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
                        style={{ background: gradient }}
                    />

                    {/* ── Safe Zone Guided Layer ── */}
                    <div
                        className="absolute inset-0 flex flex-col p-8"
                        style={{
                            paddingTop: `${safeLayout.topOffset}%`,
                            paddingBottom: `${safeLayout.bottomOffset}%`,
                            paddingLeft: `${safeLayout.leftOffset}%`,
                            paddingRight: `${safeLayout.rightOffset}%`,
                            justifyContent: platformSpec.textPosition === 'top' ? 'flex-start' : platformSpec.textPosition === 'center' ? 'center' : 'flex-end',
                            gap: '1.5rem'
                        }}
                    >
                        {/* ── Brand Layout ── */}

                        {/* Main Hook */}
                        <p
                            className="text-white font-black leading-tight text-right tracking-tight"
                            style={{
                                fontSize: `${28 * platformSpec.fontScale}px`,
                                textShadow: '0 4px 16px rgba(0,0,0,0.95)',
                            }}
                        >
                            {segment?.headlinePrefix || ''}{variant.headline}
                        </p>

                        {/* Bullets */}
                        <div className="flex flex-col gap-3">
                            {variant.hooks.map((h, i) => (
                                <div key={i} className="flex items-center justify-end gap-3 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 self-end">
                                    <p
                                        className="text-white font-bold"
                                        style={{ fontSize: `${14 * platformSpec.fontScale}px` }}
                                    >
                                        {h}
                                    </p>
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: accentColor }}>
                                        <span className="text-black text-[10px] font-black">✓</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CTA Section */}
                        <div className="mt-4">
                            {platformSpec.ctaStyle === 'swipe_up' ? (
                                <div className="flex flex-col items-center gap-2 animate-bounce">
                                    <div className="w-6 h-6 border-t-4 border-l-4 border-white rotate-45 mb-[-10px]" />
                                    <span className="text-white font-black text-xl uppercase tracking-widest" style={{ textShadow: '0 0 10px rgba(0,0,0,0.5)' }}>اسحب للأعلى</span>
                                </div>
                            ) : (
                                <div
                                    className="flex items-center justify-center rounded-2xl py-4 shadow-xl border-b-4 border-black/20 active:translate-y-1 transition-transform"
                                    style={{
                                        background: accentColor,
                                        boxShadow: `0 8px 30px ${accentColor}40`,
                                    }}
                                >
                                    <p className="text-black font-black text-center" style={{ fontSize: `${18 * platformSpec.fontScale}px` }}>
                                        {variant.ctaButton}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Performance Watermark - Only in preview */}
                    <div className="absolute top-4 left-4 bg-emerald-500/90 text-black text-[10px] font-black px-2 py-1 rounded shadow-lg uppercase tracking-tighter">
                        PRO Performance Output
                    </div>
                </div>
            </div>

            {/* ── Export Controls ── */}
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="py-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 bg-white text-black hover:bg-white/90"
                >
                    {isExporting ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : 'تصدير PNG'}
                </button>
                <a
                    href="#"
                    className="py-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 bg-emerald-500 text-black hover:bg-emerald-400"
                >
                    مشاركة
                </a>
            </div>
        </div>
    );
};

export default AdCreativeCanvas;
