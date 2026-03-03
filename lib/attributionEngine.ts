/**
 * UTM & Attribution Engine
 * Auto-generates smart tracking URLs for all generated campaigns,
 * ensuring high fidelity attribution when cookies drop.
 */

export interface CampaignContext {
    campaignName: string;
    productName: string;
    placement?: string; // e.g., 'feed', 'reels', 'stories'
    adFormat?: string; // e.g., 'static', 'video', 'carousel'
    angleName?: string; // e.g., 'pain_agitation', 'social_proof'
    dcoHash?: string; // Unique Dynamic Creative Hash
}

export class AttributionEngine {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    }

    /**
     * Builds a tracking URL with standardized UTMs
     * designed specifically for Performance Marketing tracking tools
     * like Triple Whale, Hros, or native Ads Managers.
     */
    public buildTrackingUrl(context: CampaignContext): string {
        const url = new URL(this.baseUrl);

        // Sanitize strings for URL
        const sanitize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '_');

        // Standard UTMs
        url.searchParams.append('utm_source', 'sellfast_ai');
        url.searchParams.append('utm_medium', sanitize(context.placement || 'automated_ad'));
        url.searchParams.append('utm_campaign', sanitize(`${context.campaignName}_${context.productName}`));

        // Advanced Custom Tracking Params (for precise DCO tracking)
        if (context.angleName) {
            url.searchParams.append('utm_content', sanitize(context.angleName));
        }

        if (context.adFormat) {
            url.searchParams.append('utm_term', sanitize(context.adFormat));
        }

        // Granular DCO hash to track exact asset combination
        if (context.dcoHash) {
            url.searchParams.append('sf_dco', context.dcoHash);
        }

        // Add dynamically injected URL placeholders for Meta/Google
        // Notice: These remain as placeholders so the ad network fills them on click
        url.searchParams.append('ad_id', '{{ad.id}}');
        url.searchParams.append('adset_id', '{{adset.id}}');
        url.searchParams.append('campaign_id', '{{campaign.id}}');

        return url.toString();
    }

    /**
     * Helper to generate a unique hash for a DCO variant
     * Useful when generating hundreds of ad variations.
     */
    public static generateDCOHash(angle: string, visual: string, copy: string): string {
        // A simple, fast string hash for the frontend
        const combined = `${angle}_${visual}_${copy}`;
        let hash = 0;
        for (let i = 0; i < combined.length; i++) {
            const char = combined.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return `sf_${Math.abs(hash).toString(16)}`; // Return hex string
    }
}
