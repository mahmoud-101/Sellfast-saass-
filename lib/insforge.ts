
import { ENV } from '../utils/env';

const INSFORGE_URL = ENV.INSFORGE_BASE_URL;
const INSFORGE_KEY = ENV.INSFORGE_API_KEY;

/**
 * 🛠️ Lightweight Fetch-based InsForge Client
 * PostgREST & Auth compatible to mirror Supabase syntax.
 */
class InsForgeClient {
    private baseUrl: string;
    private apiKey: string;
    public auth: InsForgeAuth;

    constructor(baseUrl: string, apiKey: string) {
        this.baseUrl = baseUrl?.replace(/\/$/, '') || '';
        this.apiKey = apiKey;
        this.auth = new InsForgeAuth(this.baseUrl, this.apiKey);
    }

    from(table: string) {
        return new QueryBuilder(this.baseUrl, this.apiKey, table);
    }
}

class InsForgeAuth {
    private baseUrl: string;
    private apiKey: string;
    private listeners: ((event: string, session: any) => void)[] = [];

    constructor(baseUrl: string, apiKey: string) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    async getSession() {
        const sessionStr = localStorage.getItem('insforge-auth-token');
        const session = sessionStr ? JSON.parse(sessionStr) : null;
        return { data: { session }, error: null };
    }

    onAuthStateChange(callback: (event: string, session: any) => void) {
        this.listeners.push(callback);
        this.getSession().then(({ data: { session } }) => callback('INITIAL_SESSION', session));
        return {
            data: {
                subscription: {
                    unsubscribe: () => {
                        this.listeners = this.listeners.filter(l => l !== callback);
                    }
                }
            }
        };
    }

    async signInWithPassword({ email, password }: any) {
        try {
            const res = await fetch(`${this.baseUrl}/auth/v1/token?grant_type=password`, {
                method: 'POST',
                headers: { 'apikey': this.apiKey, 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) return { data: null, error: data };
            localStorage.setItem('insforge-auth-token', JSON.stringify(data));
            this.listeners.forEach(l => l('SIGNED_IN', data));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    async signUp({ email, password, options }: any) {
        try {
            const res = await fetch(`${this.baseUrl}/auth/v1/signup`, {
                method: 'POST',
                headers: { 'apikey': this.apiKey, 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, data: options?.data })
            });
            const data = await res.json();
            if (!res.ok) return { data: null, error: data };
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    async signInWithOAuth({ provider, options }: any) {
        // Redirect to InsForge OAuth endpoint
        const redirectTo = options?.redirectTo || window.location.origin;
        window.location.href = `${this.baseUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(redirectTo)}`;
        return { data: null, error: null };
    }

    async signOut() {
        localStorage.removeItem('insforge-auth-token');
        this.listeners.forEach(l => l('SIGNED_OUT', null));
        return { error: null };
    }

    // Add more auth methods as needed (signIn, signUp)
}

class QueryBuilder {
    private url: string;
    private apiKey: string;
    private table: string;
    private method: string = 'GET';
    private body: any = null;
    private filters: string[] = [];
    private selectQuery: string = '*';

    constructor(baseUrl: string, apiKey: string, table: string) {
        this.url = baseUrl;
        this.apiKey = apiKey;
        this.table = table;
    }

    select(query: string = '*') {
        this.selectQuery = query;
        this.method = 'GET';
        return this;
    }

    insert(data: any | any[]) {
        this.method = 'POST';
        this.body = data;
        return this;
    }

    update(data: any) {
        this.method = 'PATCH';
        this.body = data;
        return this;
    }

    upsert(data: any | any[]) {
        this.method = 'POST';
        this.body = data;
        return this;
    }

    delete() {
        this.method = 'DELETE';
        return this;
    }

    eq(column: string, value: any) {
        this.filters.push(`${column}=eq.${value}`);
        return this;
    }

    in(column: string, values: any[]) {
        this.filters.push(`${column}=in.(${values.join(',')})`);
        return this;
    }

    order(column: string, options?: { ascending: boolean }) {
        this.filters.push(`order=${column}.${options?.ascending === false ? 'desc' : 'asc'}`);
        return this;
    }

    limit(n: number) {
        this.filters.push(`limit=${n}`);
        return this;
    }

    async single() {
        const result = await this.execute();
        return { data: Array.isArray(result.data) ? result.data[0] : result.data, error: result.error };
    }

    async maybeSingle() {
        return this.single();
    }

    private async execute() {
        try {
            if (!this.url) return { data: null, error: { message: 'InsForge URL not configured' } };

            let fullUrl = `${this.url}/rest/v1/${this.table}?select=${this.selectQuery}`;
            if (this.filters.length > 0) {
                fullUrl += `&${this.filters.join('&')}`;
            }

            const headers: Record<string, string> = {
                'apikey': this.apiKey,
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            };

            if (this.method === 'POST' || this.method === 'PATCH') {
                headers['Prefer'] = 'return=representation';
            }

            const response = await fetch(fullUrl, {
                method: this.method,
                headers,
                body: this.body ? JSON.stringify(this.body) : null
            });

            if (!response.ok) {
                const errorText = await response.text();
                return { data: null, error: { message: errorText, status: response.status } };
            }

            const data = await response.json();
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: { message: error.message } };
        }
    }

    // Default thenable for await
    async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
        const result = await this.execute();
        if (onfulfilled) return onfulfilled(result);
        return result;
    }
}

export const insforge = new InsForgeClient(INSFORGE_URL, INSFORGE_KEY);

export const isInsForgeConfigured = () => {
    return !!(INSFORGE_URL && INSFORGE_KEY);
};

