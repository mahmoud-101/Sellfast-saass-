// ============================================
// Ebdaa v3 — Prompt Engine ULTRA
// متخصص: ملابس + بيوتي + منتجات منزلية
// نظام 2 Calls: Enrichment → Generation
// ============================================

import { ProductFormData } from '../types/ad.types'
import { DYNAMIC_STYLES } from '../../../lib/dynamicTemplates'
import { AD_FRAMEWORKS, SWIPE_FILE, HOOK_LIBRARY, CTA_LIBRARY } from '../../../lib/adFrameworks'

// ─── قواعد اللغة العامة ───────────────────────────────────────────────────────
function getLanguageRules(dialect?: 'eg' | 'sa'): string {
  const isGulf = dialect === 'sa';
  const dialectInstruction = isGulf
    ? "✅ اكتب بالعامية السعودية أو الخليجية زي ما الناس بتكتب في السوشيال ميديا (استخدم كلمات مثل: الحين، واجد، باجر، كفو، أبشر)"
    : "✅ اكتب بالعامية المصرية زي ما الناس بتكتب في واتساب (استخدم كلمات مثل: دلوقتي، كتير، بكرة، جامد)";

  return `
══════════════════════════════════
قواعد اللغة — ممنوع تخالفها:
══════════════════════════════════
❌ ممنوع الفصحى خالص — حتى كلمة واحدة
❌ ممنوع: رائع / مميز / استثنائي / فريد / عالي الجودة / نقدم لكم / منتجنا
❌ ممنوع الـ headline يزيد عن 6 كلمات
❌ ممنوع أي إعلانين يبدأوا بنفس الكلمة
❌ ممنوع الكلام العام اللي ينفع لأي منتج تاني

${dialectInstruction}
✅ كل جملة لازم تخدم البيع مباشرة — مفيش كلام زيادة
✅ استخدم أرقام وتفاصيل حقيقية من بيانات المنتج
✅ كل إعلان ليه صوت وشخصية مختلفة تماماً
✅ الـ primaryText يبدأ بجملة تخلي الواحد يوقف إصبعه فوراً
`;
}

const DYNAMIC_TEMPLATES_INSTRUCTION = `
══════════════════════════════════
القوالب الديناميكية للصور (Dynamic Templates):
══════════════════════════════════
هذه هي القوالب المتاحة لإنشاء الصور:
${JSON.stringify(DYNAMIC_STYLES.map(s => ({ id: s.id, name: s.styleName, prompt: s.dynamicPrompt })), null, 2)}

مهمتك في حقل imagePrompt:
1. اختر أنسب قالب من القوالب بالأعلى بناءً على المنتج.
2. قم بتعبئة جميع المتغيرات المطلوبة في القالب المختار بكلمات إبداعية.
3. استبدل الأقواس المربعة واسم المتغير بالقيمة المطلوبة مباشرة، مثال: بدل [Color_Theme] ضع red.
4. أرجع النص النهائي للقالب المختار بعد تعبئته بالكامل كقيمة الـ imagePrompt.
`

const AD_STRATEGY_FRAMEWORKS = `
══════════════════════════════════════════════════════
قوالب كتابة الإعلانات الاحترافية (Copywriting Frameworks):
══════════════════════════════════════════════════════
استخدم هذه الهياكل لبناء محتوى الإعلان:

${AD_FRAMEWORKS.map(f => `${f.name}:
- الهيكل: ${f.structure}
- متى تستخدمه: ${f.bestFor.join(', ')}
- مثال: ${f.example}`).join('\n\n')}

══════════════════════════════════════════════════════
أمثلة من الـ Swipe File (نماذج ناجحة حقيقية):
══════════════════════════════════════════════════════
استلهم من هذه النماذج الناجحة:

${JSON.stringify(SWIPE_FILE, null, 2)}

══════════════════════════════════════════════════════
مكتبة الهوكات والـ CTA (Hooks & CTAs):
══════════════════════════════════════════════════════
- هوكات الفيديو: ${HOOK_LIBRARY.video.map(h => h.text).join(' | ')}
- هوكات النص: ${HOOK_LIBRARY.text.map(h => h.text).join(' | ')}
- نداءات الفعل (CTA): ${CTA_LIBRARY.map(c => c.text).join(' | ')}
`

const ANGLE_FORMULAS = `
══════════════════════════════════════════════════════
الزوايا الخمسة الإجبارية (Mandatory 5 Angles):
══════════════════════════════════════════════════════
يجب عليك توليد إعلان واحد لكل زاوية من الزوايا التالية:

1. إعلان الألم (Pain Point):
   - الهيكل: ابدأ بالمشكلة -> وصف الألم بتفاصيل -> المنتج كحل.
   - الـ Hook: "تعبت من [مشكلة محددة]؟" أو وصف سيناريو مؤلم.

2. إعلان الإثبات الاجتماعي (Social Proof):
   - الهيكل: نتيجة حقيقية/رقم -> أسلوب شهادة (Testimonial) -> التحول من X إلى Y.
   - الـ Hook: "[اسم شخص] حقق [نتيجة] في [فترة قصيرة]".

3. إعلان كسر الاعتراضات (Objection Handler):
   - الهيكل: الاعتراف بالاعتراض (غالي/مش هينفع) -> كسر الاعتراض بمنطق -> ضمان/دليل.
   - الـ Hook: "عارف إنك فاكر إن [الاعتراض]... بس الحقيقة [الكسر]".

4. إعلان الإلحاح (FOMO/Urgency):
   - الهيكل: عنصر الندرة/الوقت -> ماذا سيخسر العميل -> CTA عاجل.
   - الـ Hook: "باقي [رقم] قطع بس" أو "العرض بينتهي بعد [وقت]".

5. إعلان القصة (Story/Narrative):
   - الهيكل: قصة قصيرة (3-4 سطور) عن شخص حقيقي -> مشكلة -> حل -> نتيجة.
   - الـ Hook: "قبل 6 شهور كنت [وضع قديم]... النهاردة أنا [وضع جديد]".

توجيهات إضافية:
- كل إعلان يجب أن يتبع واحد من الفريم ووركس (Frameworks) المذكورة أعلاه.
- الالتزام التام بالـ Pattern Hooks المذكورة لكل زاوية.
- حدد الـ Format (Carousel/Single Image/Video) والـ Placement (Feed/Stories/Reels) الأنسب لكل زاوية.
- أعطِ تقييماً (Quality Score) من 1-10 لقوة كل زاوية.

══════════════════════════════════════════════════════
قواعد التسعير والتحسين (Scaling & Pricing Rules):
══════════════════════════════════════════════════════
1. التسعير النفسي (Psychological Pricing):
   - إذا كان الجمهور في مصر: يجب أن ينتهي السعر دائماً بالرقم 7 (مثال: 497، 97، 1497).
   - إذا كان الجمهور في الخليج: يجب أن ينتهي السعر دائماً بالرقم 9 (مثال: 149، 999، 949).
2. التوقيت (Timing Strategy):
   - اقترح أفضل وقت للنشر بناءً على الدولة (مصر: 8-10 مساءً | السعودية: 9-11 مساءً).
3. إدارة الكومنتات (Comment Management):
   - أضف نصيحة سريعة لزيادة الثقة عبر الكومنتات (Social Proof).
`

const JSON_TEMPLATE = `
[
  {
    "angle": "اسم الزاوية بالإنجليزي (pain, compare, bold, transform, offer)",
    "content": {
      "primaryText": "[البوست كامل مكتوب زي ما الـ Formula طالبة بالظبط — فقرات مفصولة]",
      "headline": "[العنوان القصير — ما يزدش عن 6 كلمات]",
      "hooks": [
        "[Hook 1]",
        "[Hook 2]",
        "[Hook 3]"
      ],
      "adPost": "[البوست بصيغة قابلة للنسخ واللصق فوراً — مع إيموجيز موزعة بذكاء]",
      "imageStyleName": "[Choose the exact English name of the style you picked from DYNAMIC_TEMPLATES_INSTRUCTION]",
      "imageVariables": {
        "Variable_Name_1": "Your highly creative short English description for this variable",
        "Variable_Name_2": "Your highly creative short English description for this variable"
      },
      "imagePrompt": "[Detailed English prompt for AI image generator based on the filled template]",
      "frameworkUsed": "The name of the framework used (e.g. AIDA, PAS, BAB)",
      "whyItWorks": "A short Arabic sentence explaining why this framework fits this product/angle",
      "format": "Suggested format (e.g. Carousel, Single Image, Video)",
      "placement": "Suggested placement (e.g. Feed, Stories, Reels)",
      "qualityScore": "Predicted quality score (1-10) for this specific ad angle"
    }
  }
  // كرر هذا لـ 5 زوايا مختلفة
]
`

export interface EnrichmentResult {
  targetGender: string;
  ageRange: string;
  lifestyle: string;
  topPains: string[];
  competitorWeakness: string;
  suggestedTone: string;
  bestAngle: string;
  uniqueInsight: string;
  categoryInsights: string;
  visualStyle: string;
}

export function buildEnrichmentPrompt(data: ProductFormData): string {
  return `
  أنت الآن خبير استراتيجي في التسويق وباحث ديموغرافي محترف للسوق المصري والخليجي.
  حلل هذا المنتج واستخرج أقوى الزوايا البيعية ورؤى الجمهور الدقيقة.

  وصف المنتج:
  ${data.productDescription}

  السعر:
  ${data.price}

  أخرج النتيجة بصيغة JSON فقط:
{
  "targetGender": "لمن هذا بالضبط؟ (رجال/نساء/الكل)",
  "ageRange": "أكثر فئة عمرية محتملة (مثال: 25-35)",
  "lifestyle": "صف حياتهم اليومية في 5 كلمات",
  "topPains": ["ألم نفسي عميق 1", "ألم سطحي 2", "ألم ثانوي 3"],
  "competitorWeakness": "ما الذي يفعله هذا المنتج وتفشل فيه المنتجات الأخرى؟",
  "suggestedTone": "نبرة الصوت المثالية للإعلان (مثال: تحدي، تعاطف، مباشر)",
  "bestAngle": "أكثر زاوية مربحة للتركيز عليها (مثال: مكانة، خوف، راحة)",
  "uniqueInsight": "رؤية واحدة عن هذا المشتري يغفل عنها المسوقون",
  "categoryInsights": "حقيقة عن هذا السوق (مثال: مشترو العناية بالبشرة متشككون)",
  "visualStyle": "نوع الصورة الدقيق الذي يوقف التمرير (Scroll)"
}
`;
}

export function buildAdPrompt(data: ProductFormData, enrichment?: EnrichmentResult): string {
  const enrichmentData = enrichment ? `
معلومات تحليل الجمهور (استخدمها لكتابة كلام مقنع):
- الفئة المستهدفة: ${enrichment.targetGender} (${enrichment.ageRange})
- نمط الحياة: ${enrichment.lifestyle}
- أعمق الآلام: ${enrichment.topPains.join('، ')}
- النبرة المطلوبة: ${enrichment.suggestedTone}
- الزاوية الأهم: ${enrichment.bestAngle}
- ملاحظة خفية عن الجمهور: ${enrichment.uniqueInsight}
` : '';

  return `
أنت الآن "إبداع برو v3" — أقوى صانع إعلانات Performance / Direct Response في الشرق الأوسط.
شغلتك مش إنك تكتب كلام منمق، شغلتك إنك تكتب كلام "يبيع" بالعامية المصرية الأصيلة.

بناءً على معلومات المنتج الآتية، قم بتوليد 5 إعلانات كاملة ومختلفة تماماً (زاوية لكل إعلان).

معلومات المنتج:
الوصف والألم والفوائد (تفاصيل المنتج): ${data.productDescription}
السعر: ${data.price}

${enrichmentData}

${getLanguageRules(data.dialect)}

${DYNAMIC_TEMPLATES_INSTRUCTION}

${AD_STRATEGY_FRAMEWORKS}

${ANGLE_FORMULAS}

المطلوب:
أريد الرد بصيغة JSON array فقط لا غير (بدون أي مقدمات أو شروحات).
التنسيق المطلوب للـ JSON:
${JSON_TEMPLATE}
`;
}
