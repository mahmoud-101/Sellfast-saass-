/**
 * Ad Frameworks & Swipe File Library
 * Comprehensive collection of high-converting copywriting frameworks and real-world examples.
 */

export interface AdFramework {
    id: string;
    name: string;
    description: string;
    structure: string;
    bestFor: string[];
    example: string;
}

export const AD_FRAMEWORKS: AdFramework[] = [
    {
        id: 'AIDA',
        name: 'AIDA (Attention, Interest, Desire, Action)',
        description: 'The classic marketing framework to guide customers through the buying journey.',
        bestFor: ['Product Ads', 'Offers', 'E-commerce'],
        structure: 'Attention -> Interest -> Desire -> Action',
        example: `
📢 Attention: بشرتك باهتة ومرهقة ومهما جربتي منتجات مفيش نتيجة؟
💡 Interest: السبب إن 90% من المنتجات بتعالج الأعراض مش المشكلة الحقيقية. سيروم فيتامين C المركز بتركيبة 20% بيشتغل على 3 طبقات من البشرة.
✨ Desire: خلال 14 يوم هتلاحظي: بشرة مشرقة، اختفاء البقع الداكنة، ونضارة تدوم.
🛒 Action: اطلبي الآن واستمتعي بخصم 30% - العرض لأول 100 طلب فقط!
        `
    },
    {
        id: 'PAS',
        name: 'PAS (Problem, Agitate, Solution)',
        description: 'Focuses on the customer\'s pain point and agitates it before presenting the solution.',
        bestFor: ['Services', 'Courses', 'Problem-solving products'],
        structure: 'Problem -> Agitate -> Solution',
        example: `
🛑 Problem: بتصرف على إعلانات فيسبوك وما بتشوف نتائج؟
🔥 Agitate: كل يوم بتروح فلوسك وأنت مش فاهم ليه الإعلان فشل. بتجرب استهداف جديد... نفس النتيجة. بتغير الصورة... برضو مفيش.
✅ Solution: كورس "ميديا باير محترف" هيعلمك تقرأ الأرقام صح، تبني استهداف ذكي، وتحول ميزانية صغيرة لمبيعات كبيرة.
        `
    },
    {
        id: 'BAB',
        name: 'BAB (Before, After, Bridge)',
        description: 'Shows the transformation from a painful current state to an ideal future state.',
        bestFor: ['Transformation services', 'Fitness', 'Software'],
        structure: 'Before -> After -> Bridge',
        example: `
🌑 Before: بتحاول تنزل وزنك من سنين ومللت من الدايت اللي بيفشل.
☀️ After: نزلت 12 كيلو في 3 شهور، بتاكل أكل لذيذ، وثقتك في نفسك رجعت.
🌉 Bridge: تطبيق FitArab بيصمملك برنامج غذائي شخصي وتمارين على حسب مستواك. جربه مجاناً!
        `
    },
    {
        id: '4Ps',
        name: '4Ps (Promise, Picture, Proof, Push)',
        description: 'Makes a big promise, paints a picture of the result, provides proof, and pushes for the sale.',
        bestFor: ['High-ticket products', 'Professional services', 'B2B'],
        structure: 'Promise -> Picture -> Proof -> Push',
        example: `
💎 Promise: نضاعف مبيعاتك أونلاين خلال 90 يوم أو نرجعلك فلوسك.
📸 Picture: تخيل تصحى الصبح وتلاقي 15 طلب جديد دخلوا وإعلاناتك بتحقق x5 ROAS.
📊 Proof: زودنا مبيعات "متجر X" من 50K لـ 200K في شهرين.
🚀 Push: احجز استشارة مجانية اليوم (باقي 3 أماكن هذا الشهر).
        `
    },
    {
        id: 'PASTOR',
        name: 'PASTOR (Problem, Amplify, Story, Transformation, Offer, Response)',
        description: 'A comprehensive framework for long-form sales copy and video scripts.',
        bestFor: ['Long-form ads', 'Video scripts', 'Expensive courses'],
        structure: 'Problem -> Amplify -> Story -> Transformation -> Offer -> Response',
        example: `
🔴 Problem: عايز تفتح متجر إلكتروني بس مش عارف تبدأ منين.
📖 Story: أنا كنت زيك بالظبط، وظيفة بمرتب ثابت وفشلت مرتين لحد ما حقق متجري التالت 47 ألف ريال في شهر.
🎁 Offer: كورس "المتجر الذهبي" يشمل 47 درس فيديو، قوالب جاهزة، ومتابعة شخصية.
        `
    },
    {
        id: 'HSO',
        name: 'Hook-Story-Offer',
        description: 'Ideal for short-form video (Reels, TikTok) and UGC content.',
        bestFor: ['UGC', 'TikTok', 'Instagram Reels'],
        structure: 'Hook (3 sec) -> Story (15-30 sec) -> Offer (5-10 sec)',
        example: `
🪝 Hook: "أنا كنت بشرب 3 كوب قهوة في اليوم ولسه تعبان..."
📖 Story: "لحد ما جربت قهوة [البراند] المختصة، كوب واحد الصبح بيكفيني طول اليوم وتركيزي اتضاعف."
🎁 Offer: "جربها بنفسك - أول كيس بخصم 40% الرابط في البايو."
        `
    }
];

export const HOOK_LIBRARY = {
    video: [
        { type: 'Question', text: 'ليه إعلاناتك مش بتجيب نتيجة؟' },
        { type: 'Shock', text: 'صرفت 50,000 على إعلانات وخسرت كل حاجة' },
        { type: 'Command', text: 'وقف كل إعلاناتك الآن!' },
        { type: 'Curiosity', text: 'الحاجة دي غيرت شغلي تماماً...' },
        { type: 'Result', text: 'من 0 لـ 100K في 30 يوم' },
        { type: 'Comparison', text: "أنا مش مصدق إني كنت بدفع [ضعف السعر] في [البديل]" },
        { type: 'Relatable', text: "POV: أنت [سيناريو relatable]" }
    ],
    text: [
        { type: 'Negation', text: 'مش كل حاجة غالية حلوة... بس دي أه ✅' },
        { type: 'Confession', text: 'هعترفلكم بحاجة محرجة...' },
        { type: 'Number', text: '3 حاجات اتمنى حد قالهملي قبل ما أبدأ' },
        { type: 'Comparison', text: 'أنا vs أنا بعد ما استخدمت [المنتج]' },
        { type: 'Mystery', text: 'السر اللي محدش بيقوله عن [موضوع]' },
        { type: 'Pain', text: 'أنت بتخسر فلوس عشان [سبب]' }
    ]
};

export const CTA_LIBRARY = [
    { type: 'Direct', text: 'اطلب الآن / سجل مجاناً' },
    { type: 'Urgency', text: 'العرض ينتهي الليلة - اطلب قبل فوات الأوان' },
    { type: 'Easy', text: 'اكتب كلمة "عايز" في الكومنتات وهنبعتلك التفاصيل' },
    { type: 'Risk-Free', text: 'جرب 14 يوم مجاناً - بدون بطاقة ائتمان' },
    { type: 'Social', text: 'انضم لـ 5000+ شخص بدأوا رحلتهم' },
    { type: 'WhatsApp', text: 'ابعتلنا على الواتساب 📲' }
];

export const SWIPE_FILE = {
    ecommerce: [
        {
            title: 'Fashion/Clothing Ad (Story)',
            copy: `البنات بتسألني على الفستان ده في كل مناسبة برروحها 👗 أنا مش بتكلم عن فستان عادي، أنا بتكلم عن اللبس اللي كل ما تلبسيه الكومنتات بتنهال عليكي. القماش شيفون مستورد والتصميم اتعمل من مصمم خاص والسعر... أقل من اللي متخيلاه. المفاجأة: لو طلبتي النهاردة الشحن ببلاش 🎁`,
            whyItWorks: 'Social proof ("البنات بتسألني"), sensory details (shiffon), risk reversal (free shipping).'
        },
        {
            title: 'Skin Care Ad (PAS)',
            copy: `توقفي عن شراء منتجات عشوائية لبشرتك! 🛑 المشكلة إنك بتستخدمي منتجات مش مناسبة لنوع بشرتك. الحل؟ تحليل بشرة مجاني + روتين مخصص ليكي.`,
            whyItWorks: 'Starts with a command, identifies a core problem, offers free value first.'
        }
    ],
    education: [
        {
            title: 'Courses/Ads Advanced (Curiosity)',
            copy: `3 حاجات اتعلمتهم بعد ما صرفت 200,000 جنيه على إعلانات فيسبوك 💸 الحاجة الأولى: الإعلان مش هو اللي بيبيع، الأوفر هو اللي بيبيع. الحاجة التانية: 80% من ميزانيتك لازم تروح على إعلان واحد بس. الحاجة التالتة: الاستهداف مات والـ Creative هو الاستهداف الجديد. تعلم كل ده في 3 ساعات بس.`,
            whyItWorks: 'High numbers for authority, curiosity gap, unique insights.'
        }
    ],
    saas: [
        {
            title: 'SaaS/Software (Efficiency)',
            copy: `بطلت أعمل إعلانات بإيدي ✋ كنت بقضي 4 ساعات كل يوم في التصميم والكتابة والتحليل. دلوقتي؟ 15 دقيقة. مش عشان بقيت أشطر، عشان لقيت أداة بتعمل الشغل ده بدالي. جربها ببلاش لمدة 7 أيام ولو مش عجبتك مش هتدفع حاجة.`,
            whyItWorks: 'Before/After transformation, specific time metrics, zero risk trial.'
        }
    ],
    local: [
        {
            title: 'Restaurant/Food (Native)',
            copy: `أصحابي فاكرين إني بطبخ الأكل ده في البيت 🥘 الحقيقة؟ باطلبه من [اسم المطعم]. كل أسبوع بينزلوا menu جديد والأكل بيوصل سخن في أقل من 30 دقيقة. وتوصيل ببلاش لو فوق 100 ريال. 🚀`,
            whyItWorks: 'Sounds like a personal post, low friction, strong delivery promise.'
        }
    ],
    gcc_specific: [
        {
            title: 'Perfume/Luxury (Social Validation)',
            copy: `كل البنات في المكتب سألوني وش ريحتك 🌸 والله ما توقعت إن عطر بـ 150 ريال يسوي هالتأثير. أول يوم 3 كومبليمنتات والثبات 12 ساعة. الحين عليه خصم 40% لمدة 48 ساعة بس. اطلبه قبل يخلص العرض.`,
            whyItWorks: 'Pure GCC dialect, social validation, specific localized pricing and urgency.'
        }
    ],
    ugc: [
        {
            title: 'UGC Style (Reaction)',
            copy: `[فيديو] المحتوى: أنا مش مصدق إني كنت بدفع [ضعف السعر] في [البديل]. شوفوا... أنا اشتريت [المنتج] من أسبوعين وكنت شاكك بس بعد ما جربته النتيجة فرق سما وأرض. لو لسه بتستخدم [البديل]... حرام عليك.`,
            whyItWorks: 'High contrast, authentic reaction, direct competitor call-out.'
        }
    ],
    agency: [
        {
            title: 'Marketing Agency (4Ps)',
            copy: `عميلنا كان بيصرف 10,000 ريال ويحقق 15,000. بعد شهرين معانا: الـ 10,000 بقت 87,000 ريال مبيعات 📈 مش سحر، دي داتا واستراتيجية.`,
            whyItWorks: 'Uses concrete numbers, explains the "how" to build trust, has strong scarcity.'
        }
    ]
};
