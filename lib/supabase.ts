
import { createClient } from '@supabase/supabase-js';

// توحيد جلب متغيرات البيئة لضمان العمل في كل البيئات (Vite, Netlify, process)
const getEnv = (key: string) => {
    if (typeof window !== 'undefined' && (window as any).process?.env?.[key]) return (window as any).process.env[key];
    if (typeof process !== 'undefined' && process.env?.[key]) return process.env[key];
    return '';
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

// التحقق من الإعدادات قبل إنشاء العميل لمنع runtime errors
const isConfigured = supabaseUrl && supabaseAnonKey && supabaseUrl.includes('supabase.co');

export const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true // ضروري جداً لتأكيد الإيميل
        }
    })
    : null;

export const CREDIT_COSTS = {
    IMAGE_BASIC: 5,
    IMAGE_PRO: 10,
    COPYWRITING: 5,
    VOICE_OVER: 10,
    VIDEO_VEO: 100,
    POWER_PROD: 250,
    AI_EXPAND: 10
};

const ADMIN_EMAIL = 'telmahmoud4@gmail.com';

/**
 * جلب الرصيد مع معالجة حالة "أول دخول" للمستخدم وحالة "الآدمن"
 */
export const getUserCredits = async (userId: string): Promise<number> => {
    if (!supabase || userId === 'dev-user') return 9999;

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email === ADMIN_EMAIL) return 999999;

        const { data, error } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                const { data: newData } = await supabase
                    .from('profiles')
                    .insert({ id: userId, credits: 10 })
                    .select()
                    .single();
                return newData?.credits || 10;
            }
            return 0;
        }
        return data?.credits ?? 0;
    } catch (e) {
        return 0;
    }
};

export const deductCredits = async (userId: string, amount: number): Promise<boolean> => {
    if (!supabase || userId === 'dev-user') return true;

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email === ADMIN_EMAIL) return true;

        const { data: profile } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', userId)
            .single();

        if (!profile || profile.credits < amount) return false;

        const { error } = await supabase
            .from('profiles')
            .update({ credits: profile.credits - amount })
            .eq('id', userId);

        return !error;
    } catch (e) {
        return false;
    }
};

export const getAdminUsers = async () => {
    if (!supabase) return [];
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    return data || [];
};

export const getAdminLogs = async () => {
    if (!supabase) return [];
    const { data } = await supabase.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(20);
    return data || [];
};

export const getAdminStats = async () => {
    if (!supabase) return { totalUsers: 0, totalCredits: 0, activeToday: 0 };
    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { data } = await supabase.from('profiles').select('credits');
    const totalCredits = data?.reduce((s, i) => s + (i.credits || 0), 0) || 0;
    return { totalUsers: count || 0, totalCredits, activeToday: Math.floor((count || 0) * 0.1) };
};
// ... existing code ...

export interface SavedProject {
    id: string;
    user_id: string;
    name: string; // Project Name (e.g. "My UGC Campaign")
    studio: string; // Studio Type (e.g. "UGC Studio")
    data: any; // The full JSON state
    created_at: string;
    updated_at: string;
}

/**
 * حفظ مشروع (إنشاء جديد أو تحديث موجود)
 */
export const saveProject = async (userId: string, studio: string, data: any, name: string = 'Untitled Project') => {
    if (!supabase) return null;

    // Check if project already has an ID in the data, if so update it
    const projectId = data.id && data.id.length > 10 ? data.id : undefined; // simple check to avoid 'demo-...' ids if we want real uuids

    // For now, we will use the 'id' from the data as the primary key if it's a valid UUID, otherwise let Supabase generate one
    // But since our app uses 'demo-' IDs initially, we need a strategy.
    // Strategy: If ID starts with 'demo-', treat as new insert. If UUID, update.

    try {
        const isDemo = data.id?.startsWith('demo');

        if (isDemo) {
            const { data: newProj, error } = await supabase
                .from('projects')
                .insert({
                    user_id: userId,
                    studio: studio,
                    name: name,
                    data: data
                })
                .select()
                .single();

            if (error) throw error;
            return newProj;
        } else {
            const { data: updatedProj, error } = await supabase
                .from('projects')
                .update({
                    data: data,
                    name: name,
                    updated_at: new Date().toISOString()
                })
                .eq('id', data.id)
                .select()
                .single();

            if (error) throw error;
            return updatedProj;
        }
    } catch (e) {
        console.error("Error saving project:", e);
        return null;
    }
};

/**
 * تحميل مشاريع المستخدم
 */
export const loadProjects = async (userId: string) => {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error("Error loading projects:", error);
        return [];
    }
    return data;
};

/**
 * حذف مشروع
 */
export const deleteProject = async (projectId: string) => {
    if (!supabase) return false;
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    return !error;
};
