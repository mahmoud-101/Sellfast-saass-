
import React, { useEffect, useState } from 'react';
import { BrandKit } from '../types';
import ImageWorkspace from './ImageWorkspace';
import { saveBrandKit, getUserBrandKits, deleteBrandKit } from '../lib/supabase';

interface BrandKitManagerProps {
    userId: string;
    onBack: () => void;
}

const BrandKitManager: React.FC<BrandKitManagerProps> = ({ userId, onBack }) => {
    const [kits, setKits] = useState<any[]>([]);
    const [activeKit, setActiveKit] = useState<BrandKit>({ brandName: '', industry: '', logo: null, colors: ['#FFD700', '#000000'] });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadKits();
    }, [userId]);

    const loadKits = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const data = await getUserBrandKits(userId);
            setKits(data);
            if (data.length > 0) setActiveKit(data[0]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!userId || !activeKit.brandName) return;
        setIsSaving(true);
        try {
            await saveBrandKit(userId, activeKit);
            await loadKits();
            alert("تم حفظ الهوية بنجاح ✨");
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذه الهوية؟")) return;
        try {
            await deleteBrandKit(id);
            await loadKits();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="w-full h-96 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white/40 font-bold animate-pulse">جاري جلب هوياتك...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto py-10 animate-in fade-in duration-500 text-right" dir="rtl">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter">هوية براندك (Brand Kit)</h2>
                    <p className="text-slate-400 font-bold mt-2">ظبط اللوجو والألوان مرة واحدة، واحنا هنطبقها على كل شغلك.</p>
                </div>
                <button onClick={onBack} className="px-6 py-2 bg-white/5 text-slate-400 rounded-xl font-bold hover:text-white">رجوع للرئيسية</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Sidebar: List of Kits */}
                <div className="lg:col-span-3 space-y-4">
                    <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">هوياتك المحفوظة</h3>
                    <div className="space-y-2">
                        {kits.map((k, i) => (
                            <div key={i} className={`group p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${activeKit.brandName === k.brandName ? 'bg-[#FFD700] border-[#FFD700] text-black' : 'bg-white/5 border-white/5 text-white hover:bg-white/10'}`} onClick={() => setActiveKit(k)}>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(k.id); }} className={`opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500 hover:text-white transition-all ${activeKit.brandName === k.brandName ? 'text-black/40' : 'text-white/20'}`}>✕</button>
                                <span className="font-bold truncate text-sm">{k.brandName}</span>
                            </div>
                        ))}
                        <button onClick={() => setActiveKit({ brandName: '', industry: '', logo: null, colors: ['#FFD700', '#000000'] })} className="w-full p-4 rounded-2xl border border-dashed border-white/10 text-white/40 hover:text-[#FFD700] hover:border-[#FFD700] transition-all text-sm font-bold">+ إضافة هوية جديدة</button>
                    </div>
                </div>

                {/* Main Editor */}
                <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                        <h3 className="text-xl font-black text-[#FFD700] pr-4 border-r-4 border-[#FFD700]">لوجو البراند</h3>
                        <div className="aspect-square">
                            <ImageWorkspace 
                                id="brand-logo" 
                                images={activeKit.logo ? [activeKit.logo] : []} 
                                onImagesUpload={(files) => {
                                    const reader = new FileReader();
                                    reader.onload = () => setActiveKit(k => ({ ...k, logo: { base64: (reader.result as string).split(',')[1], mimeType: files[0].type, name: files[0].name } }));
                                    reader.readAsDataURL(files[0]);
                                }} 
                                onImageRemove={() => setActiveKit(k => ({ ...k, logo: null }))} 
                                isUploading={false} 
                                title="ارفع اللوجو PNG"
                            />
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-8">
                        <h3 className="text-xl font-black text-[#FFD700] pr-4 border-r-4 border-[#FFD700]">بيانات البراند</h3>
                        <div className="space-y-4">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">اسم البراند</label>
                            <input 
                                value={activeKit.brandName}
                                onChange={e => setActiveKit(k => ({ ...k, brandName: e.target.value }))}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold text-white outline-none focus:border-[#FFD700] shadow-inner"
                                placeholder="مثال: متجر أناقة"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">المجال / التخصص</label>
                            <input 
                                value={activeKit.industry}
                                onChange={e => setActiveKit(k => ({ ...k, industry: e.target.value }))}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold text-white outline-none focus:border-[#FFD700] shadow-inner"
                                placeholder="مثال: العطور والجمال"
                            />
                        </div>
                        <button onClick={handleSave} disabled={isSaving || !activeKit.brandName} className="w-full h-16 bg-[#FFD700] text-black font-black rounded-2xl shadow-xl hover:bg-yellow-400 transition-all disabled:opacity-30">
                            {isSaving ? 'جاري الحفظ...' : 'حفظ الهوية ✨'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandKitManager;
