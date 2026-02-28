
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
    PRO_MODE: 50,
};

/**
 * جلب بيانات المستخدم أو إنشاؤه إذا لم يكن موجوداً
 * نقوم الآن بمزامنة البريد الإلكتروني أيضاً لتسهيل الإدارة 📧
 * مع دعم نظام التسجيل عبر روابط الإحالة (Referral)
 */
export const getUserProfile = async (userId: string, email?: string, referredBy?: string) => {
    if (!isSupabaseConfigured()) return { id: userId, credits: 50, is_demo: true };
    try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
        if (error) throw error;

        if (!data) {
            // توليد كود إحالة فريد للمستخدم الجديد
            const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

            // محاولة جلب ID الشخص الذي قام بالإحالة
            let referredById = null;
            if (referredBy) {
                const { data: refData } = await supabase.from('profiles').select('id').eq('referral_code', referredBy).maybeSingle();
                referredById = refData?.id;
            }

            const { data: newData, error: insertError } = await supabase
                .from('profiles')
                .insert([{
                    id: userId,
                    credits: 50,
                    user_points: 0,
                    user_rank: 'Media Buyer Beginner',
                    email: email,
                    referral_code: referralCode,
                    referred_by: referredById
                }])
                .select()
                .single();
            if (insertError) throw insertError;
            return newData;
        } else {
            // تحديث البيانات إذا كانت ناقصة (البريد الإلكتروني وكود الإحالة)
            const updates: any = {};
            if (email && data.email !== email) updates.email = email;
            if (!data.referral_code) {
                updates.referral_code = Math.random().toString(36).substring(2, 10).toUpperCase();
            }

            if (Object.keys(updates).length > 0) {
                await supabase.from('profiles').update(updates).eq('id', userId);
            }
        }

        return data;
    } catch (e) {
        console.error("Supabase Error:", e);
        return { id: userId, credits: 0, user_points: 0, user_rank: 'Media Buyer Beginner', error: true };
    }
};

/**
 * نظام الرتب والنقاط (Gamification Engine) 🏆
 */
export const USER_RANKS = {
    BEGINNER: 'Media Buyer Beginner',
    PROFESSIONAL: 'Media Buyer Professional',
    EXPERT: 'Media Buyer Expert',
    LEGEND: 'Media Buyer Legend'
};

export const awardPoints = async (userId: string, points: number, reason: string) => {
    if (!userId || !isSupabaseConfigured()) return;
    try {
        const { data: profile } = await supabase.from('profiles').select('user_points').eq('id', userId).single();
        const currentPoints = profile?.user_points || 0;
        const newPoints = currentPoints + points;

        // تحديد الرتبة الجديدة
        let newRank = USER_RANKS.BEGINNER;
        if (newPoints >= 5000) newRank = USER_RANKS.LEGEND;
        else if (newPoints >= 2000) newRank = USER_RANKS.EXPERT;
        else if (newPoints >= 500) newRank = USER_RANKS.PROFESSIONAL;

        await supabase.from('profiles').update({
            user_points: newPoints,
            user_rank: newRank
        }).eq('id', userId);

        await logAction(userId, 'POINTS_AWARDED', `${reason} (+${points} points)`);
    } catch (e) {
        console.error("Award Points Error:", e);
    }
};

/**
 * جلب بيانات الإحالة الخاصة بالمستخدم 🤝
 */
export const getReferralStats = async (userId: string) => {
    if (!isSupabaseConfigured()) return { code: '', count: 0, earned: 0 };
    try {
        const { data: profile } = await supabase.from('profiles').select('referral_code').eq('id', userId).single();
        const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('referred_by', userId);

        // جلب إجمالي النقاط المكتسبة من الإحالات (من السجلات)
        const { data: logs } = await supabase.from('logs').select('description').eq('user_id', userId).eq('action_type', 'REFERRAL_BONUS');
        const earned = logs?.length ? logs.length * 100 : 0; // 100 نقطة لكل إحالة ناجحة

        return {
            code: profile?.referral_code || '',
            count: count || 0,
            earned: earned
        };
    } catch (e) {
        console.error("Referral Stats Error:", e);
        return { code: '', count: 0, earned: 0 };
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
    if (!isSupabaseConfigured()) return { totalUsers: 0, totalCredits: 0, activeToday: 0 };
    const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { data: creditsData } = await supabase.from('profiles').select('credits');
    const totalCredits = creditsData?.reduce((sum, u) => sum + (u.credits || 0), 0) || 0;

    return {
        totalUsers: totalUsers || 0,
        totalCredits,
        activeToday: Math.floor((totalUsers || 0) * 0.3) // Synthetic activity for UI polish
    };
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

    // 4. مكافأة الشخص الذي قام بالإحالة (Referral Bonus) 💎
    // نكافئ المحيل بـ 100 نقطة عند أول عملية شحن للمحال
    const { data: userProfile } = await supabase.from('profiles').select('referred_by').eq('id', request.user_id).single();
    if (userProfile?.referred_by) {
        // نتحقق إذا كان هذا أول شحن للمستخدم
        const { count } = await supabase.from('payment_requests').select('*', { count: 'exact', head: true }).eq('user_id', request.user_id).eq('status', 'approved');

        if (count === 1) { // هذه هي العملية الأولى الناجحة
            const { data: referrer } = await supabase.from('profiles').select('credits').eq('id', userProfile.referred_by).single();
            if (referrer) {
                await supabase.from('profiles').update({ credits: referrer.credits + 100 }).eq('id', userProfile.referred_by);
                await logAction(userProfile.referred_by, 'REFERRAL_BONUS', `مكافأة 100 نقطة لدعوة مستخدم جديد قام بالشحن`);
            }
        }
    }
};

/**
 * وظائف الإحصائيات المالية المتقدمة للمدير 💰
 */
export const getAdminFinanceStats = async () => {
    if (!isSupabaseConfigured()) return { totalRevenue: 0, monthlyRevenue: 0, estimatedProfit: 0 };

    try {
        // 1. جلب كل المدفوعات المعتمدة
        const { data: approvedPayments, error } = await supabase
            .from('payment_requests')
            .select('amount')
            .eq('status', 'approved');

        if (error) throw error;

        const totalRevenue = approvedPayments?.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0) || 0;

        // 2. جلب مدفوعات الشهر الحالي
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: monthlyPayments } = await supabase
            .from('payment_requests')
            .select('amount')
            .eq('status', 'approved')
            .gte('created_at', startOfMonth.toISOString());

        const monthlyRevenue = monthlyPayments?.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0) || 0;

        // 3. حساب الربح الصافي التقديري (بعد خصم تكاليف الـ API - تقدير 15%)
        const estimatedProfit = totalRevenue * 0.85;

        return { totalRevenue, monthlyRevenue, estimatedProfit };
    } catch (e) {
        console.error("Finance Stats Error:", e);
        return { totalRevenue: 0, monthlyRevenue: 0, estimatedProfit: 0 };
    }
};

/**
 * جلب سجل المدفوعات الكامل (طلبات معلقة + تاريخ سابق) 📜
 */
export const getAdminPaymentHistory = async () => {
    if (!isSupabaseConfigured()) return [];
    try {
        const { data, error } = await supabase
            .from('payment_requests')
            .select('*, profiles(email)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error("Payment History Error:", e);
        return [];
    }
};

/**
 * تحليل استخدام الأدوات البرمجية 📊
 */
export const getAdminUsageAnalytics = async () => {
    if (!isSupabaseConfigured()) return [];
    try {
        // نستخدم سجل العمليات لاستنتاج الأدوات الأكثر استخداماً
        const { data: logs } = await supabase
            .from('logs')
            .select('action_type')
            .in('action_type', ['PRO_MODE', 'COPYWRITING', 'IMAGE_PRO', 'MARKET_ANALYSIS']);

        const counts: { [key: string]: number } = {
            'PRO_MODE': 0,
            'COPYWRITING': 0,
            'IMAGE_PRO': 0,
            'MARKET_ANALYSIS': 0
        };

        logs?.forEach(l => {
            if (counts[l.action_type] !== undefined) {
                counts[l.action_type]++;
            }
        });

        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    } catch (e) {
        console.error("Usage Analytics Error:", e);
        return [];
    }
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

// ==========================================
// 🏆 Campaign Storage (Fix 5: Database Storage)
// ==========================================

export interface SavedCampaign {
    id?: string;
    user_id: string;
    product_name: string;
    campaign_goal: string;
    selected_angle: string;

    // Structured Data
    reels_script?: string;
    shots?: any[];
    ugc_script?: string;
    performance_ads?: any[];
    viral_hooks?: any[];
    sales_angles?: any[];
    photoshoot_brief?: any;

    // Versioning & Meta
    version?: number;
    status?: 'draft' | 'final' | 'active';
    parent_id?: string;
    original_analysis?: any; // To store the Market Intelligence results

    created_at?: string;
}

/**
 * Saves a completed campaign to Supabase so the user can access it later.
 */
export const saveCampaign = async (campaign: Omit<SavedCampaign, 'id' | 'created_at'>): Promise<SavedCampaign | null> => {
    if (!isSupabaseConfigured()) {
        console.warn('[Supabase] Not configured - campaign save skipped');
        return null;
    }
    try {
        const { data, error } = await supabase
            .from('campaigns')
            .insert([campaign])
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch (e) {
        console.error('[Supabase] saveCampaign error:', e);
        return null;
    }
};

/**
 * Fetches all campaigns for a user, ordered newest first.
 */
export const getCampaigns = async (userId: string): Promise<SavedCampaign[]> => {
    if (!isSupabaseConfigured()) return [];
    try {
        const { data, error } = await supabase
            .from('campaigns')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error('[Supabase] getCampaigns error:', e);
        return [];
    }
};

/**
 * Deletes a campaign by ID.
 */
export const deleteCampaign = async (campaignId: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) return false;
    try {
        const { error } = await supabase.from('campaigns').delete().eq('id', campaignId);
        if (error) throw error;
        return true;
    } catch (e) {
        console.error('[Supabase] deleteCampaign error:', e);
        return false;
    }
};
