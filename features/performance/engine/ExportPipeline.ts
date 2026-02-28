/**
 * ExportPipeline.ts
 * Manages bulk exports, naming conventions, and 3rd party ad manager metadata.
 * Part of the "Diamond Ad Factory" core engine.
 */

import type { Platform } from '../types';

export interface AdExportData {
    headline: string;
    description: string;
    cta: string;
    imageUrl: string;
    campaignName: string;
    audienceSegment: string;
    platform: Platform;

    // Internal Registry Indices
    hIdx: number;
    dIdx: number;
    iIdx: number;
    cIdx: number;
}

/**
 * Standard Naming Convention:
 * Campaign_[Brand]_[Objective]_[Date]
 * Ad_H[#]_D[#]_I[#]_C[#]_[Platform]
 */
export function generateProfessionalAdName(data: AdExportData): string {
    const { hIdx, dIdx, iIdx, cIdx, platform } = data;
    const platformCode = platform.split('_').map(word => word[0].toUpperCase()).join('');
    return `Ad_H${hIdx}_D${dIdx}_I${iIdx}_C${cIdx}_${platformCode}`;
}

/**
 * Generates a Meta Ads Manager compatible CSV string.
 * Allows bulk upload of dozens of ads at once.
 */
export function generateMetaCSV(ads: AdExportData[]): string {
    const headers = [
        'Campaign Name',
        'Ad Set Name',
        'Ad Name',
        'Headline',
        'Description',
        'Call to Action',
        'Image File Name',
        'Link URL'
    ].join(',');

    const rows = ads.map((ad, i) => {
        const adName = generateProfessionalAdName(ad);
        const fileName = `${adName.toLowerCase()}.png`;

        // Ensure commas in text are escaped for CSV
        const cleanHeadline = `"${ad.headline.replace(/"/g, '""')}"`;
        const cleanDescription = `"${ad.description.replace(/"/g, '""')}"`;

        return [
            `Campaign_${ad.campaignName}`,
            `AdSet_${ad.audienceSegment}`,
            adName,
            cleanHeadline,
            cleanDescription,
            ad.cta,
            fileName,
            'https://yourlandingpage.com' // Placeholder
        ].join(',');
    });

    return [headers, ...rows].join('\n');
}

/**
 * Generates Google Ads Editor Format metadata.
 */
export function generateGoogleAdsCSV(ads: AdExportData[]): string {
    const headers = [
        'Campaign',
        'Ad Group',
        'Headline 1',
        'Headline 2',
        'Description 1',
        'Description 2',
        'Final URL'
    ].join(',');

    const rows = ads.map(ad => {
        // Google often requires split headlines/descriptions
        const h1 = ad.headline.slice(0, 30);
        const h2 = ad.headline.length > 30 ? ad.headline.slice(30, 60) : 'اطلب الآن';

        return [
            ad.campaignName,
            ad.audienceSegment,
            `"${h1}"`,
            `"${h2}"`,
            `"${ad.description.slice(0, 90)}"`,
            `"${ad.description.length > 90 ? ad.description.slice(90, 180) : ''}"`,
            'https://yourlandingpage.com'
        ].join(',');
    });

    return [headers, ...rows].join('\n');
}

/**
 * Mocks the ZIP creation logic.
 * In a real environment, this would use a library like JSZip.
 */
export function triggerZipDownload(fileNames: string[]) {
    console.log(`[ExportPipeline] Bundling ${fileNames.length} files into ZIP...`);
    // Mock: alert user or return status
    return true;
}
