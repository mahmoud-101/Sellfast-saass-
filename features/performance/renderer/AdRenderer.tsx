/**
 * AdRenderer.tsx
 * Dynamically selects the correct template for a given LayoutData,
 * renders it, and provides PNG export via html2canvas.
 * Lazy-loads templates. Memory-safe; cleans up object URLs.
 */

import React, { lazy, Suspense, useCallback, useRef } from 'react';
import type { LayoutData } from '../types';

// Lazy-load templates for code splitting
const ProblemSolutionTemplate = lazy(() => import('../templates/ProblemSolutionTemplate'));
const ComparisonTemplate = lazy(() => import('../templates/ComparisonTemplate'));
const BenefitsTemplate = lazy(() => import('../templates/BenefitsTemplate'));
const OfferTemplate = lazy(() => import('../templates/OfferTemplate'));

interface Props {
    layoutData: LayoutData;
    /** Called after export with the object URL. Caller must revoke it. */
    onExported?: (objectUrl: string) => void;
}

const TEMPLATE_FALLBACK = (
    <div className="flex items-center justify-center h-64 text-gray-500 text-sm animate-pulse">
        جاري تحميل القالب...
    </div>
);

const AdRenderer: React.FC<Props> = ({ layoutData, onExported }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const blobUrl = useRef<string | null>(null);

    const handleExport = useCallback(async () => {
        if (!containerRef.current) return;

        try {
            // Dynamically import html2canvas only when needed
            const { default: html2canvas } = await import('html2canvas');
            const canvas = await html2canvas(containerRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: null,
                logging: false,
            });

            // Revoke previous URL to prevent memory leaks
            if (blobUrl.current) {
                URL.revokeObjectURL(blobUrl.current);
                blobUrl.current = null;
            }

            canvas.toBlob(
                (blob) => {
                    if (!blob) return;
                    const url = URL.createObjectURL(blob);
                    blobUrl.current = url;
                    onExported?.(url);
                },
                'image/png',
                0.92
            );
        } catch (err) {
            console.error('[AdRenderer] Export failed:', err);
        }
    }, [onExported]);

    const renderTemplate = () => {
        switch (layoutData.layoutType) {
            case 'problem_solution':
                return <ProblemSolutionTemplate data={layoutData} />;
            case 'comparison':
                return <ComparisonTemplate data={layoutData} />;
            case 'benefits':
                return <BenefitsTemplate data={layoutData} />;
            case 'offer':
                return <OfferTemplate data={layoutData} />;
            default:
                return <OfferTemplate data={layoutData} />;
        }
    };

    return (
        <div className="flex flex-col gap-3">
            {/* Rendered Ad Creative */}
            <div ref={containerRef}>
                <Suspense fallback={TEMPLATE_FALLBACK}>
                    {renderTemplate()}
                </Suspense>
            </div>

            {/* Export Button */}
            <button
                onClick={handleExport}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
                <span>📥</span> تصدير كصورة PNG
            </button>
        </div>
    );
};

export default AdRenderer;
