// ============================================
// Ebdaa v3 — Response Analyzer (محسّن)
// ============================================

import { GenerationResult, AdCard, CardStyle } from '../types/ad.types'
import { parseRobustJSON } from '../../../utils/safeJson'

// ─── Card Styles ──────────────────────────────────────────────────────────────
export const CARD_STYLES: Record<CardStyle, {
    bg: string; badge: string; button: string; border: string; glow: string;
}> = {
    pain: { bg: '#110808', badge: '#dc2626', button: '#ef4444', border: '#7f1d1d', glow: 'rgba(220,38,38,0.15)' },
    compare: { bg: '#080c14', badge: '#2563eb', button: '#3b82f6', border: '#1e3a8a', glow: 'rgba(37,99,235,0.15)' },
    bold: { bg: '#0c0814', badge: '#7c3aed', button: '#8b5cf6', border: '#4c1d95', glow: 'rgba(124,58,237,0.15)' },
    transform: { bg: '#08110c', badge: '#16a34a', button: '#22c55e', border: '#14532d', glow: 'rgba(22,163,74,0.15)' },
    urgency: { bg: '#110b08', badge: '#ea580c', button: '#f97316', border: '#7c2d12', glow: 'rgba(234,88,12,0.15)' },
    story: { bg: '#081414', badge: '#06b6d4', button: '#22d3ee', border: '#164e63', glow: 'rgba(6,182,212,0.15)' },
}

// ─── Style order (للتأكد من الترتيب الصحيح) ──────────────────────────────────
const EXPECTED_STYLES: CardStyle[] = ['pain', 'compare', 'bold', 'transform', 'urgency', 'story']
const EXPECTED_ANGLES: any[] = ['pain', 'proof', 'objection', 'urgency', 'story']

// ─── Parser ───────────────────────────────────────────────────────────────────
export function parseGeminiResponse(rawText: string): GenerationResult {
    const cleaned = rawText
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .replace(/[\u0000-\u001F\u007F]/g, (c) => c === '\n' || c === '\r' || c === '\t' ? c : '')
        .trim()

    let rawParsed: any;
    let parsed: GenerationResult & { ads: (AdCard & { imagePrompt?: string })[] }

    // Use centralized self-healing parser
    rawParsed = parseRobustJSON(cleaned, null);
    if (rawParsed === null) {
        throw new Error('الـ AI مارجعش JSON صح — حاول تاني');
    }

    // Handle case where Gemini returns an array directly
    if (Array.isArray(rawParsed)) {
        parsed = {
            ads: rawParsed.map((item: any) => ({
                ...item,
                // map "content" block to root properties
                primaryText: item.content?.primaryText || '—',
                headline: item.content?.headline || '—',
                hooks: item.content?.hooks || ['—', '—', '—'],
                adPost: item.content?.adPost || '—',
                imageStyleName: item.content?.imageStyleName || 'Smart Style',
                imageVariables: item.content?.imageVariables || {},
                imagePrompt: item.content?.imagePrompt || '',
                frameworkUsed: item.content?.frameworkUsed || 'AIDA',
                whyItWorks: item.content?.whyItWorks || 'مناسب لجذب انتباه العميل بسرعة.',
                format: item.content?.format || 'Single Image',
                placement: item.content?.placement || 'Feed',
                qualityScore: item.content?.qualityScore || 85,
            }))
        } as any;
    } else {
        parsed = rawParsed;
    }

    if (!parsed?.ads || typeof parsed.ads !== 'object') {
        throw new Error('الـ AI مارجعش إعلانات')
    }

    // Ensure ads is an array
    if (!Array.isArray(parsed.ads)) {
        parsed.ads = Object.values(parsed.ads).filter(item => typeof item === 'object' && item !== null) as any;
    }

    if (parsed.ads.length === 0) {
        throw new Error('الـ AI مارجعش إعلانات')
    }

    // نكمل الـ ads لـ 5 لو رجع أقل
    while (parsed.ads.length < 5) {
        const missing = EXPECTED_STYLES[parsed.ads.length]
        parsed.ads.push(createFallbackAd(missing, parsed.ads.length))
    }

    // نعالج كل ad
    parsed.ads = parsed.ads.slice(0, 5).map((ad, index) => {
        const style = EXPECTED_STYLES[index]
        const angle = EXPECTED_ANGLES[index] || 'pain'
        return {
            ...ad,
            id: `ad-${index + 1}`,
            style,
            // تأكد من الـ hooks
            hooks: Array.isArray(ad.hooks) && ad.hooks.length >= 3
                ? [ad.hooks[0], ad.hooks[1], ad.hooks[2]]
                : [ad.hooks?.[0] || '—', ad.hooks?.[1] || '—', ad.hooks?.[2] || '—'],
            // نقل imagePrompt للـ field الصح
            imageUrl: null,
            isLoading: true,
            // الـ imagePrompt بيتحفظ للـ generation
            imageStyleName: (ad as any).imageStyleName || 'Smart Style',
            imageVariables: (ad as any).imageVariables || {},
            imagePrompt: (ad as any).imagePrompt || buildFallbackImagePrompt(style),
            hookScore: typeof ad.hookScore === 'number' ? Math.min(100, Math.max(0, ad.hookScore)) : 60,
            ctaButton: ad.ctaButton || defaultCTA(style),
            frameworkUsed: (ad as any).frameworkUsed || 'AIDA',
            whyItWorks: (ad as any).whyItWorks || 'النموذج الكلاسيكي الأنسب للبداية.',
            format: (ad as any).format || 'Single Image',
            placement: (ad as any).placement || 'Feed',
            qualityScore: (ad as any).qualityScore || 85,
            angle: angle as any,
        }
    })

    // تأكد من وجود advancedAnalysis
    if (!parsed.advancedAnalysis) {
        parsed.advancedAnalysis = buildFallbackAnalysis(parsed.ads)
    }

    if (!parsed.advancedAnalysis.hooksAnalysis || parsed.advancedAnalysis.hooksAnalysis.length === 0) {
        parsed.advancedAnalysis.hooksAnalysis = parsed.ads.map((ad, i) => ({
            angle: ad.angle,
            score: ad.hookScore,
            tip: 'جرب تضيف رقم أو تفصيلة حقيقية من المنتج'
        }))
    }

    return parsed
}

// ─── Validation ───────────────────────────────────────────────────────────────
export function isValidResult(result: GenerationResult): boolean {
    if (!result.ads || result.ads.length !== 5) return false

    return result.ads.every((ad: AdCard) =>
        ad.headline?.trim() &&
        ad.primaryText?.trim() &&
        Array.isArray(ad.hooks) && ad.hooks.length === 3 &&
        ad.adPost?.trim() &&
        ad.ctaButton?.trim() &&
        EXPECTED_STYLES.includes(ad.style)
    )
}

// ─── Hook Score Label ─────────────────────────────────────────────────────────
export function getHookScoreLabel(score: number): string {
    if (score >= 80) return '🔥 قوي جداً'
    if (score >= 65) return '✅ كويس'
    if (score >= 50) return '⚠️ محتاج تحسين'
    return '❌ ضعيف'
}

export function getHookScoreColor(score: number): string {
    if (score >= 80) return '#10B981'
    if (score >= 65) return '#F59E0B'
    if (score >= 50) return '#F97316'
    return '#EF4444'
}

// ─── Duplicate Check ──────────────────────────────────────────────────────────
export function hasDuplicateTexts(ads: AdCard[]): boolean {
    const starts = ads.map(ad => (ad.primaryText || '').trim().slice(0, 20).toLowerCase())
    return new Set(starts).size !== starts.length
}

export function getDuplicateWarning(ads: AdCard[]): string | null {
    if (hasDuplicateTexts(ads)) {
        return '⚠️ بعض الإعلانات بيبدأوا بنفس الأسلوب — فكر في إعادة التوليد'
    }
    return null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function defaultCTA(style: CardStyle): string {
    const ctas: Record<CardStyle, string> = {
        pain: 'اطلب دلوقتي',
        compare: 'اعرف الفرق',
        bold: 'جرب وشوف',
        transform: 'غيّر حياتك',
        urgency: 'الحق قبل ما يخلص',
        story: 'اقرأ الحكاية',
    }
    return ctas[style]
}

function buildFallbackImagePrompt(style: CardStyle): string {
    const prompts: Record<CardStyle, string> = {
        pain: 'Frustrated person looking at product problem, dark moody lighting, Egyptian market, commercial photography, photorealistic, 8K',
        compare: 'Split composition before/after comparison, clean visual contrast, Egyptian setting, commercial photography, photorealistic, 8K',
        bold: 'Confident Egyptian person, dramatic lighting, bold hero product shot, commercial photography, photorealistic, 8K',
        transform: 'Happy glowing Egyptian person, warm golden lighting, genuine smile, transformation visible, commercial photography, photorealistic, 8K',
        urgency: 'Limited stock display, warm urgent lighting, few remaining products, Egyptian shopping context, commercial photography, photorealistic, 8K',
        story: 'Candid lifestyle shot of person storytelling, authentic Egyptian home environment, warm natural lighting, high-end commercial photography, 8K',
    }
    return prompts[style]
}

function createFallbackAd(style: CardStyle, index: number): AdCard & { imagePrompt: string } {
    return {
        id: `ad-${index + 1}`,
        angle: 'تأثير_الألم' as any,
        style,
        badgeLabel: '—',
        badgeEmoji: '📢',
        primaryText: '—',
        headline: '—',
        description: '—',
        hooks: ['—', '—', '—'],
        adPost: '—',
        ctaButton: defaultCTA(style),
        hookScore: 50,
        imageUrl: null,
        isLoading: false,
        imagePrompt: buildFallbackImagePrompt(style),
        imageStyleName: '',
        frameworkUsed: 'AIDA',
        whyItWorks: 'النموذج الكلاسيكي الأنسب للبداية.',
    }
}

function buildFallbackAnalysis(ads: AdCard[]) {
    return {
        market: 'السوق المصري',
        priceSegment: 'متوسط',
        awareness: 'جمهور بارد',
        usp: 'غير محدد',
        hooksAnalysis: ads.map(ad => ({
            angle: ad.angle,
            score: ad.hookScore,
            tip: 'أضف تفاصيل أكتر عن المنتج للحصول على نتائج أفضل',
        }))
    }
}
