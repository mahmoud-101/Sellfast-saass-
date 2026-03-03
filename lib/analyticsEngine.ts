import { supabase } from './supabase';

export type AnalyticEventName =
    | 'user_signed_in'
    | 'ad_generation_started'
    | 'ad_generation_completed'
    | 'ad_generation_failed'
    | 'credits_deducted'
    | 'credits_purchased'
    | 'page_view'
    | 'custom_action';

export interface AnalyticEvent {
    eventName: AnalyticEventName;
    userId?: string;
    payload?: any;
    timestamp?: string;
}

class AnalyticsEngine {
    private channel = supabase.channel('public:analytics');
    private active = false;

    constructor() {
        this.init();
    }

    private init() {
        this.channel
            .on('broadcast', { event: 'track' }, (payload) => {
                // In a real app, this might just log, or send to a real analytics backend
                console.log('[AnalyticsEngine] Received Broadcast:', payload);
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    this.active = true;
                    console.log('[AnalyticsEngine] Connected to Realtime Analytics');
                }
            });
    }

    public async track(event: AnalyticEvent) {
        const fullEvent = {
            ...event,
            timestamp: new Date().toISOString(),
            sessionId: this.getSessionId()
        };

        // 1. Console Logging (for development visibility)
        console.info(`[📊 Analytics] ${fullEvent.eventName}`, fullEvent.payload || '');

        // 2. Broadcast via Supabase Realtime (for live dashboards)
        if (this.active) {
            this.channel.send({
                type: 'broadcast',
                event: 'track',
                payload: fullEvent
            });
        }

        // 3. (Optional) Persist to a database table if needed
        // await supabase.from('analytics_logs').insert(fullEvent);
    }

    private getSessionId() {
        let sid = sessionStorage.getItem('sellfast_sid');
        if (!sid) {
            sid = 'sess_' + Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem('sellfast_sid', sid);
        }
        return sid;
    }
}

export const analytics = new AnalyticsEngine();
