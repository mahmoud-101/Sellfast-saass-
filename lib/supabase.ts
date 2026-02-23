
import { createClient } from '@supabase/supabase-js';

// قراءة البيانات من البيئة التي تم تمريرها عبر Vite (متوافقة مع AWS Amplify)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
    return supabaseUrl &&
        supabaseUrl.includes('supabase.co') &&
        supabaseAnonKey &&
        supabaseAnonKey !== 'placeholder-key';
};

// إنشاء العميل - سيستخدم رابط تجريبي إذا لم تتوفر البيانات لمنع انهيار الموقع
export const supabase = createClient(
    supabaseUrl || 'https://placeholder-project.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);

export const CREDIT_COSTS = {
    IMAGE_BASIC: 5,
    IMAGE_PRO: 10,
    COPYWRITING: 5,
    VOICE_OVER: 10,
    VIDEO_VEO: 100,
    POWER_PROD: 250,
    AD_VIDEO: 20,
    AI_EXPAND: 10,
};

/**
 * جلب بيانات المستخدم أو إنشاؤه إذا لم يكن موجوداً
 */
export const getUserProfile = async (userId: string) => {
    if (!isSupabaseConfigured()) return { id: userId, credits: 50, is_demo: true };
    try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
        if (error) throw error;
        if (!data) {
            const { data: newData, error: insertError } = await supabase.from('profiles').insert([{ id: userId, credits: 50 }]).select().single();
            if (insertError) throw insertError;
            return newData;
        }
        return data;
    } catch (e) {
        console.error("Supabase Error:", e);
        return { id: userId, credits: 0, error: true };
    }
};

export const getUserCredits = async (userId: string): Promise<number> => {
    if (!userId) return 0;
    const profile = await getUserProfile(userId);
    return profile?.credits ?? 0;
};

/**
 * خصم النقاط من رصيد المستخدم بعد التأكد من كفايته
 */
export const deductCredits = async (userId: string, amount: number): Promise<boolean> => {
    if (!userId || !isSupabaseConfigured()) return true; // وضع التجربة (Preview)
    try {
        const currentCredits = await getUserCredits(userId);
        if (currentCredits < amount) return false;

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ credits: currentCredits - amount })
            .eq('id', userId);

        if (updateError) throw updateError;

        // تسجيل العملية في سجل العمليات
        await logAction(userId, 'CREDIT_DEDUCTION', `خصم ${amount} نقطة لاستخدام خدمة AI`);

        return true;
    } catch (e) {
        console.error("Deduct Error:", e);
        return false;
    }
};

/**
 * وظائف الإدارة (Admin) للوحة التحكم
 */
export const getAdminUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    return data || [];
};

export const getAdminStats = async () => {
    const { data: users } = await supabase.from('profiles').select('credits');
    const totalUsers = users?.length || 0;
    const totalCredits = users?.reduce((acc, curr) => acc + (curr.credits || 0), 0) || 0;
    return { totalUsers, totalCredits, activeToday: Math.floor(totalUsers * 0.3) };
};

export const getAdminLogs = async () => {
    const { data } = await supabase.from('logs').select('*').order('created_at', { ascending: false }).limit(50);
    return data || [];
};

/**
 * تسجيل العمليات في قاعدة البيانات للتدقيق
 */
export const logAction = async (userId: string, type: string, description: string) => {
    if (!isSupabaseConfigured()) return;
    await supabase.from('logs').insert([{ user_id: userId, action_type: type, description }]);
};

import { uploadBase64ToS3 } from './aws';

/**
 * حفظ المخرجات المولدة (صور/فيديوهات) في سجل المستخدم
 */
export const saveGeneratedAsset = async (userId: string, type: string, result: any, config: any) => {
    if (!isSupabaseConfigured()) return;

    let finalUrl = result.image?.base64 || result.video_url || result.plan_content;

    // Use AWS S3 for direct uploads if it's base64 imagery to prevent massive DB logs
    if (result.image?.base64) {
        finalUrl = await uploadBase64ToS3(result.image.base64, result.image.mimeType || 'image/png');
    }

    await supabase.from('assets').insert([{
        user_id: userId,
        asset_type: type,
        url: finalUrl,
        config: config
    }]);
};

export const getGeneratedAssets = async (userId: string) => {
    if (!isSupabaseConfigured()) return [];
    const { data } = await supabase.from('assets').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return data || [];
};

export const deleteGeneratedAsset = async (id: string, userId: string) => {
    if (!isSupabaseConfigured()) return;
    await supabase.from('assets').delete().eq('id', id).eq('user_id', userId);
};

/**
 * وظائف إدارة الهوية البصرية (Brand Kits)
 */
export const saveBrandKit = async (userId: string, brandData: any) => {
    if (!isSupabaseConfigured()) return;
    const { data, error } = await supabase.from('brand_kits').upsert([{
        ...brandData,
        user_id: userId,
        updated_at: new Date().toISOString()
    }]).select().single();
    if (error) throw error;
    return data;
};

export const getUserBrandKits = async (userId: string) => {
    if (!isSupabaseConfigured()) return [];
    const { data } = await supabase.from('brand_kits').select('*').eq('user_id', userId).order('updated_at', { ascending: false });
    return data || [];
};

export const deleteBrandKit = async (id: string) => {
    if (!isSupabaseConfigured()) return;
    await supabase.from('brand_kits').delete().eq('id', id);
};

/**
 * وظائف إدارة طلبات الدفع (Payment Requests)
 * تتيح للمدير مراجعة التحويلات وتفعيل النقاط بضغطة زر
 */
export const createPaymentRequest = async (userId: string, planData: any) => {
    if (!isSupabaseConfigured()) return;
    const { data, error } = await supabase.from('payment_requests').insert([{
        user_id: userId,
        plan_id: planData.id,
        amount: planData.price,
        credits: planData.credits,
        status: 'pending',
        created_at: new Date().toISOString()
    }]).select().single();
    if (error) throw error;

    await logAction(userId, 'PAYMENT_REQUEST', `طلب شحن باقة ${planData.name} بقيمة ${planData.price} ج.م`);
    return data;
};

export const getPendingPayments = async () => {
    if (!isSupabaseConfigured()) return [];
    const { data } = await supabase.from('payment_requests').select('*, profiles(id, credits)').eq('status', 'pending').order('created_at', { ascending: false });
    return data || [];
};

export const approvePayment = async (requestId: string, adminId: string) => {
    if (!isSupabaseConfigured()) return;

    // 1. جلب بيانات الطلب
    const { data: request } = await supabase.from('payment_requests').select('*').eq('id', requestId).single();
    if (!request) return;

    // 2. تحديث رصيد المستخدم
    const { data: profile } = await supabase.from('profiles').select('credits').eq('id', request.user_id).single();
    const newCredits = (profile?.credits || 0) + parseInt(request.credits);

    await supabase.from('profiles').update({ credits: newCredits }).eq('id', request.user_id);

    // 3. تحديث حالة الطلب
    await supabase.from('payment_requests').update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: adminId
    }).eq('id', requestId);

    await logAction(request.user_id, 'PAYMENT_APPROVED', `تمت الموافقة على شحن ${request.credits} نقطة`);
};

/**
 * وظائف إدارة المشاريع (Projects)
 */
export const createProject = async (userId: string, name: string, description: string = '') => {
    if (!isSupabaseConfigured()) return;
    const { data, error } = await supabase.from('projects').insert([{
        user_id: userId,
        name,
        description,
        created_at: new Date().toISOString()
    }]).select().single();
    if (error) throw error;
    return data;
};

export const getUserProjects = async (userId: string) => {
    if (!isSupabaseConfigured()) return [];
    const { data } = await supabase.from('projects').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return data || [];
};

/**
 * وظائف إدارة مهام الفيديو (Jobs)
 */
export const createVideoJob = async (userId: string, jobData: any) => {
    const { data, error } = await supabase.from('video_jobs').insert([{ ...jobData, user_id: userId }]).select().single();
    if (error) throw error;
    return data;
};

export const updateVideoJob = async (jobId: string, updates: any) => {
    await supabase.from('video_jobs').update(updates).eq('id', jobId);
};

export const getUserVideoJobs = async (userId: string) => {
    const { data } = await supabase.from('video_jobs').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return data || [];
};
