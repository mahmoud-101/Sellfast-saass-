/**
 * Meta Server-Side Tracking (Conversions API) Foundation
 * This module prepares standard and custom events to be sent to Meta CAPI.
 * In a pure frontend environment, this prepares the encrypted payload to be 
 * relayed via an Edge Function or reverse proxy.
 */

// Basic browser fingerprinting for tracking fallback
const generateBrowserHash = async () => {
    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const screenRes = `${window.screen.width}x${window.screen.height}`;
    const rawData = `${userAgent}|${language}|${screenRes}`;

    const encoder = new TextEncoder();
    const data = encoder.encode(rawData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export interface UserDataParams {
    em?: string; // Hashed Email
    ph?: string; // Hashed Phone
    fn?: string; // Hashed First Name
    ln?: string; // Hashed Last Name
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string; // Click ID
    fbp?: string; // Browser ID
    external_id?: string;
}

export interface CustomDataParams {
    value?: number;
    currency?: string;
    content_name?: string;
    content_category?: string;
    content_ids?: string[];
    status?: string;
}

export interface MetaCAPIEvent {
    event_name: 'Purchase' | 'GenerateLead' | 'CompleteRegistration' | 'ViewContent' | 'Subscribe' | 'Custom';
    event_time: number;
    action_source: 'website' | 'system_generated' | 'app';
    user_data: UserDataParams;
    custom_data?: CustomDataParams;
    event_id: string; // Used for deduplication against pixel
}

/**
 * Prepares the payload for Meta CAPI.
 * Sends data to a Supabase Edge Function to protect the Meta Access Token.
 */
export const trackMetaServerSide = async (
    eventName: MetaCAPIEvent['event_name'],
    userData: Partial<UserDataParams>,
    customData?: CustomDataParams
) => {
    const browserHash = await generateBrowserHash();

    // Reconstruct User Data with automatic fallbacks
    const enrichedUserData: UserDataParams = {
        ...userData,
        client_user_agent: navigator.userAgent,
        external_id: userData.external_id || browserHash,
        fbc: getCookie('_fbc'),
        fbp: getCookie('_fbp'),
    };

    const eventPayload: MetaCAPIEvent = {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        user_data: enrichedUserData,
        custom_data: customData,
        event_id: `evt_${Date.now()}_${Math.floor(Math.random() * 1000)}` // Vital for dedup
    };

    console.info(`[SST] Preparing Meta CAPI Event: ${eventName}`, eventPayload);

    // Call Supabase Edge Function to proxy to Meta
    // Example:
    /*
    const { data, error } = await supabase.functions.invoke('meta-capi-relay', {
        body: { data: [eventPayload] }
    });
    */

    return eventPayload; // Returning for frontend validation/debugging
};

// Helper to extract cookies
function getCookie(name: string): string | undefined {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return undefined;
}
