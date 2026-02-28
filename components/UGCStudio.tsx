import React, { useState } from 'react';
import { Upload, ImageIcon, Wand2, Download, ImagePlus, RefreshCw, ImagePlus as ImagePlusIcon } from 'lucide-react';
import { generateImage } from '../services/geminiService';
import ImageEditorModal from './ImageEditorModal';
import { deductCredits, CREDIT_COSTS } from '../lib/supabase';

interface ImageFile {
    file?: File;
    base64: string;
    mimeType: string;
    name: string;
}

interface ShotConfig {
    id: string;
    title: string;
    promptText: string;
    description: string;
}

const SHOT_TYPES: ShotConfig[] = [
    {
        id: 'ugc_hand',
        title: 'استخدام يومي (UGC)',
        description: 'صورة عفوية للمنتج في اليد كأنه تصوير موبايل',
        promptText: 'UGC style, authentic mobile phone photo, holding the product naturally in hand, blurred background, casual everyday environment, natural lighting, photorealistic',
    },
    {
        id: 'lifestyle_street',
        title: 'لايف ستايل (شارع)',
        description: 'صورة للمنتج في بيئة خارجية طبيعية',
        promptText: 'Streetwear lifestyle shot, product placed in an urban or outdoor setting, shallow depth of field, warm sunlight, highly detailed, editorial photography',
    },
    {
        id: 'studio_premium',
        title: 'تصوير استوديو (احترافي)',
        description: 'لقطة احترافية بخلفية أنيقة وإضاءة درامية',
        promptText: 'High-end commercial studio photography, dramatic cinematic lighting, sleek elegant background, sharp focus, 8k resolution, macro details',
    },
    {
        id: 'flatlay_aesthetic',
        title: 'تصوير مسطح (Flatlay)',
        description: 'تصوير من الأعلى مع إكسسوارات متناسقة',
        promptText: 'Aesthetic flatlay photography from top-down angle, product surrounded by complementary lifestyle props, soft diffused lighting, Instagram aesthetic, clean composition',
    }
];

interface UGCStudioProps {
    userId: string; // Added userId prop
}

export function UGCStudio({ userId }: UGCStudioProps) { // Updated component signature
    const [productImage, setProductImage] = useState<ImageFile | null>(null);
    const [referenceImage, setReferenceImage] = useState<ImageFile | null>(null);
    const [productDesc, setProductDesc] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedShots, setGeneratedShots] = useState<{ config: ShotConfig; image: ImageFile | null; loading: boolean }[]>([]);
    const [error, setError] = useState<string | null>(null); // Added error state

    // Editor State
    const [editingImage, setEditingImage] = useState<ImageFile | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isReference: boolean = false) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                const imgData = {
                    file,
                    base64: base64String.split(',')[1],
                    mimeType: file.type,
                    name: file.name
                };
                if (isReference) {
                    setReferenceImage(imgData);
                } else {
                    setProductImage(imgData);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateAll = async () => {
        if (!productImage || !productDesc) {
            setError('الرجاء رفع صورة المنتج وإدخال وصف المنتج.');
            return;
        }

        setIsGenerating(true);
        setError(null); // Clear previous errors

        // Credit Deduction
        try {
            if (userId !== 'guest') {
                const success = await deductCredits(userId, CREDIT_COSTS.IMAGE_PRO); // Deduct credits
                if (!success) {
                    setError('عفواً، رصيدك غير كافٍ. يرجى شحن الرصيد للمتابعة.');
                    setIsGenerating(false);
                    return;
                }
            }
        } catch (deductionError) {
            console.error("Credit deduction failed:", deductionError);
            setError('حدث خطأ أثناء خصم الرصيد. الرجاء المحاولة مرة أخرى.');
            setIsGenerating(false);
            return;
        }

        // Initialize placeholders
        const initialStates = SHOT_TYPES.map(config => ({ config, image: null, loading: true }));
        setGeneratedShots(initialStates);

        // Generate in parallel
        await Promise.allSettled(
            SHOT_TYPES.map(async (config, index) => {
                try {
                    const finalPrompt = `${config.promptText}. Product Context: ${productDesc}. Place the exact provided product seamlessly into this new scene.Ensure materials and branding match.`;
                    const styleImages = referenceImage ? [referenceImage] : null;

                    const resultImg = await generateImage([productImage], finalPrompt, styleImages, "1:1");

                    setGeneratedShots(prev => {
                        const next = [...prev];
                        next[index] = { ...next[index], image: resultImg, loading: false };
                        return next;
                    });
                } catch (error) {
                    console.error(`Failed to generate ${config.title}: `, error);
                    setGeneratedShots(prev => {
                        const next = [...prev];
                        next[index] = { ...next[index], loading: false };
                        return next;
                    });
                }
            })
        );
        setIsGenerating(false);
    };

    const downloadImage = (base64Url: string, fileName: string) => {
        const link = document.createElement('a');
        link.href = base64Url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto" dir="rtl">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <ImageIcon className="w-8 h-8 text-indigo-600" />
                        استوديو التصوير و الـ UGC
                    </h2>
                    <p className="text-gray-500 mt-2 text-lg">
                        ارفع صورة منتجك، وانسخ لقطات احترافية أو صور عفوية تناسب جميع الإعلانات بضغطة زر.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Inputs Column */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="p-6 border-0 shadow-xl bg-white/80 backdrop-blur-xl ring-1 ring-gray-100 rounded-3xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Upload className="w-5 h-5 text-indigo-500" />
                            المدخلات الأساسية
                        </h3>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    صورة المنتج (أساسي) <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-2xl hover:border-indigo-500 transition-colors bg-gray-50/50">
                                    <div className="space-y-1 text-center">
                                        {productImage ? (
                                            <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200">
                                                <img src={`data:${productImage.mimeType};base64,${productImage.base64}`} alt="Product" className="w-full h-full object-contain bg-white" />
                                                <button onClick={() => setProductImage(null)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600">
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                <div className="flex text-sm text-gray-600 justify-center">
                                                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                                        <span>ارفع صورة منتجك</span>
                                                        <input type="file" className="sr-only" accept="image/*" onChange={(e) => handleImageUpload(e, false)} />
                                                    </label>
                                                </div>
                                                <p className="text-xs text-gray-500">PNG, JPG, WEBP بخلفية بيضاء أو شفافة</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    صورة ريفرانس (اختياري)
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-2xl hover:border-indigo-500 transition-colors bg-gray-50/50">
                                    <div className="space-y-1 text-center">
                                        {referenceImage ? (
                                            <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200">
                                                <img src={`data:${referenceImage.mimeType};base64,${referenceImage.base64}`} alt="Reference" className="w-full h-full object-contain bg-white" />
                                                <button onClick={() => setReferenceImage(null)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600">
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <ImagePlus className="mx-auto h-8 w-8 text-gray-400" />
                                                <div className="flex text-sm text-gray-600 justify-center mt-2">
                                                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                                        <span>ارفع ستايل تريد تقليده</span>
                                                        <input type="file" className="sr-only" accept="image/*" onChange={(e) => handleImageUpload(e, true)} />
                                                    </label>
                                                </div>
                                                <p className="text-xs text-gray-500 leading-tight mt-1">
                                                    استخدم هذه الميزة لنسخ جو عام أو إضاءة من صورة أخرى
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    وصف المنتج <span className="text-red-500">*</span>
                                </label>
                                <input
                                    placeholder="مثال: هودي أسود كاجوال مقاس كبير..."
                                    className="w-full rounded-xl border-gray-200 h-12 px-4 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border"
                                    value={productDesc}
                                    onChange={(e) => setProductDesc(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleGenerateAll}
                                disabled={!productImage || !productDesc || isGenerating}
                                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative group/btn"
                            >
                                {/* Shimmer Effect */}
                                <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>

                                {isGenerating ? (
                                    <>
                                        <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                                        جاري التقاط الصور...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="mr-2 h-5 w-5 group-hover/btn:rotate-12 transition-transform" />
                                        ابدأ جلسة التصوير الكبرى
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Output Gallery */}
                <div className="lg:col-span-2">
                    {generatedShots.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {generatedShots.map((shot, idx) => (
                                <div key={idx} className="overflow-hidden border-0 shadow-lg group bg-white rounded-2xl">
                                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                        <div>
                                            <h4 className="font-bold text-gray-900">{shot.config.title}</h4>
                                            <p className="text-xs text-gray-500 mt-1">{shot.config.description}</p>
                                        </div>
                                    </div>

                                    <div className="relative aspect-square bg-gray-100">
                                        {shot.loading ? (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
                                                <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin mb-3" />
                                                <span className="text-sm text-gray-500 animate-pulse">جاري المونتاج...</span>
                                            </div>
                                        ) : shot.image ? (
                                            <>
                                                <img
                                                    src={`data:${shot.image.mimeType};base64,${shot.image.base64}`}
                                                    alt={shot.config.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                                                    <button
                                                        onClick={() => setEditingImage(shot.image)}
                                                        className="font-bold bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-md flex items-center text-sm"
                                                    >
                                                        <Wand2 className="w-4 h-4 mr-2" />
                                                        تعديل وتصميم
                                                    </button>
                                                    <button
                                                        onClick={() => downloadImage(`data:${shot.image?.mimeType};base64,${shot.image?.base64}`, `${shot.config.id}_result.png`)}
                                                        className="font-bold bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md flex items-center text-sm"
                                                    >
                                                        <Download className="w-4 h-4 mr-2" />
                                                        تحميل
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center bg-red-50 text-red-500 text-sm p-4 text-center">
                                                فشل توليد هذه اللقطة، حاول مجدداً لاحقاً.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                            <ImageIcon className="w-16 h-16 text-gray-300 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">استوديو التصوير جاهز</h3>
                            <p className="text-gray-500 max-w-md">
                                قم بإدخال صورة منتجك وإضافة أي صورة ريفرانس تريدنا أن نقلد جوها العام، وسنقوم بتوليد 4 لقطات متميزة من بينها لقطات الـ UGC وتصوير الاستوديو.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Global Image Editor Modal */}
            {editingImage && (
                <ImageEditorModal
                    image={editingImage}
                    onClose={() => setEditingImage(null)}
                />
            )}
        </div>
    );
}
