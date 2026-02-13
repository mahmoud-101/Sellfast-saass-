
import { LightingStyle, CameraPerspective, AspectRatio, ControllerSlider } from './types';

// تكاليف الخدمات (Credits) - موحدة مع قاعدة البيانات
export const CREDIT_STRUCTURE = [
    { key: 'IMAGE_BASIC', label: 'صورة احترافية بسيطة', cost: 5, icon: '🖼️' },
    { key: 'IMAGE_PRO', label: 'صورة موديل / معقدة', cost: 10, icon: '📸' },
    { key: 'COPYWRITING', label: 'كتابة محتوى إعلاني', cost: 5, icon: '✍️' },
    { key: 'VOICE_OVER', label: 'تعليق صوتي (TTS)', cost: 10, icon: '🎙️' },
    { key: 'VIDEO_VEO', label: 'فيديو سينمائي (Veo)', cost: 100, icon: '🎬' },
    { key: 'POWER_PROD', label: 'الإنتاج الشامل (حملة)', cost: 250, icon: '⚡' },
    { key: 'AI_EXPAND', label: 'توسيع خلفية بالذكاء', cost: 10, icon: '↔️' },
];

export const LIGHTING_STYLES: { value: LightingStyle; label: string }[] = [
  { value: 'Natural Light', label: 'إضاءة طبيعية (شمس)' },
  { value: 'Studio Light', label: 'إضاءة استوديو احترافية' },
  { value: 'Golden Hour', label: 'الساعة الذهبية (غروب)' },
  { value: 'Blue Hour', label: 'الساعة الزرقاء (فجر)' },
  { value: 'Cinematic', label: 'إضاءة سينمائية درامية' },
  { value: 'Dramatic', label: 'إضاءة ظلال قوية' },
];

export const CAMERA_PERSPECTIVES: { value: CameraPerspective; label: string }[] = [
  { value: 'Front View', label: 'عرض أمامي مستقيم' },
  { value: 'Top View', label: 'من الأعلى (Flat Lay)' },
  { value: 'Side View', label: 'عرض جانبي' },
  { value: '45° Angle', label: 'زاوية 45 درجة (مجسم)' },
  { value: 'Close-up', label: 'لقطة قريبة جداً' },
  { value: 'Macro Shot', label: 'ماكرو (تفاصيل دقيقة)' },
];

export const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
  { value: '16:9', label: 'عرضي (يوتيوب/إعلان)' },
  { value: '9:16', label: 'طولي (ريلز/تيك توك)' },
  { value: '4:3', label: 'كلاسيكي (قديم)' },
  { value: '3:4', label: 'طولي احترافي' },
  { value: '1:1', label: 'مربع (إنستجرام)' },
];

/* Fix: Added MAX_SHOT_SELECTION constant and SHOT_TYPES export for compatibility with photoshoot components */
export const MAX_SHOT_SELECTION = 6;

export const SHOT_TYPES_GROUPS = [
  {
    category: 'زوايا التصوير',
    types: ['زووم قريب', 'لقطة متوسطة', 'لقطة كاملة', 'زاوية علوية', 'زاوية منخفضة', 'زاوية مائلة', 'تصوير تفاصيل']
  },
  {
    category: 'المنتج في وضع الاستخدام',
    types: ['نمط حياة', 'حركة ديناميكية', 'يد تمسك المنتج', 'على مكتب عمل', 'أثناء نشاط رياضي', 'Unboxing']
  },
  {
    category: 'البيئة والنمط',
    types: ['رخام عصري', 'رمال شاطئ', 'غابة خضراء', 'استوديو مينيماليست', 'إضاءة نيون', 'خلفية مخملية']
  }
];

export const SHOT_TYPES = SHOT_TYPES_GROUPS;

export const VOICES = [
  { value: 'Kore', label: 'كوري', desc: 'احترافي وواضح جداً', gender: 'Female' },
  { value: 'Puck', label: 'بوك', desc: 'طاقة عالية وشبابي', gender: 'Male' },
  { value: 'Charon', label: 'شارون', desc: 'عميق وفخم (وثائقي)', gender: 'Male' },
  { value: 'Fenrir', label: 'فنرير', desc: 'دافئ وسردي', gender: 'Male' },
  { value: 'Zephyr', label: 'زفير', desc: 'هادئ ومريح للأعصاب', gender: 'Male' },
];

export const INFLUENCER_PERSONAS = [
    { id: 'saudi_male', label: 'شاب سعودي مودرن' },
    { id: 'egy_female', label: 'فتاة مصرية عملية' },
    { id: 'global_model', label: 'موديل عالمي (فاشن)' },
    { id: 'family_home', label: 'أم في منزل عصري' }
];

export const TARGET_MARKETS = ['مصر', 'السعودية', 'الإمارات', 'الخليج العربي', 'عالمي'];
export const DIALECTS = ['لهجة مصرية', 'لهجة سعودية', 'فصحى بسيطة', 'لهجة شامية', 'الإنجليزية'];

export const CONTROLLER_SLIDERS: ControllerSlider[] = [
    { id: 'smile', label: 'ابتسامة', value: 0, min: -1, max: 1, step: 0.1, category: 'Face' },
    { id: 'age', label: 'العمر', value: 0, min: -1, max: 1, step: 0.1, category: 'Face' },
    { id: 'skin_smooth', label: 'تنعيم البشرة', value: 0, min: 0, max: 1, step: 0.1, category: 'Retouch' },
    { id: 'brightness', label: 'الإضاءة', value: 0, min: -1, max: 1, step: 0.1, category: 'Retouch' },
];
