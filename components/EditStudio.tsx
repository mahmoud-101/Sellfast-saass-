
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { EditStudioProject, ImageFile, EditAdjustments, LocalText, GlobalLayer } from '../types';
import { resizeImage } from '../utils';

const ARABIC_FONTS = ['Cairo', 'Tajawal', 'Amiri', 'Reem Kufi', 'Lateef', 'Changa', 'Harmattan', 'Almarai'];
const ENGLISH_FONTS = ['Montserrat', 'Bebas Neue', 'Playfair Display', 'Oswald', 'Rubik', 'Inter', 'Poppins', 'Roboto'];

const LUTS = [
    { name: 'Original', filter: '' },
    { name: 'Warm Sun', filter: 'sepia(0.3) saturate(1.2) hue-rotate(-10deg)' },
    { name: 'Ice Cold', filter: 'saturate(0.8) hue-rotate(180deg) brightness(1.1)' },
    { name: 'Deep Cinematic', filter: 'contrast(1.3) saturate(0.8) brightness(0.9) hue-rotate(-5deg)' },
    { name: 'Black & White', filter: 'grayscale(1) contrast(1.1)' },
];

const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const TextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>;

const createNewText = (): LocalText => ({
    id: Math.random().toString(36).substr(2, 9),
    content: 'اكتب نصك هنا', fontSize: 40, color: '#3b82f6', fontFamily: 'Cairo', fontWeight: '900', x: 50, y: 50, isVisible: true, rotation: 0, letterSpacing: 0, lineHeight: 1.1, maxWidth: 80 
});

const EditStudio: React.FC<{
    project: EditStudioProject;
    setProject: React.Dispatch<React.SetStateAction<EditStudioProject>>;
}> = ({ project, setProject }) => {

    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [draggingSlot, setDraggingSlot] = useState<number | null>(null);
    const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
    const [activeSlotIdx, setActiveSlotIdx] = useState<number | null>(null);
    const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
    const containerRefs = useRef<(HTMLDivElement | null)[]>([]);

    const addTextToSlot = useCallback((slotIdx: number) => {
        const newText = createNewText();
        setProject(s => ({ ...s, localTexts: { ...s.localTexts, [slotIdx]: [...(s.localTexts[slotIdx] || []), newText] } }));
        setSelectedTextId(newText.id);
        setActiveSlotIdx(slotIdx);
    }, [setProject]);

    const updateSlotText = (slotIdx: number, textId: string, updates: Partial<LocalText>) => {
        setProject(s => {
            const texts = s.localTexts[slotIdx] || [];
            const updated = texts.map(t => t.id === textId ? { ...t, ...updates } : t);
            return { ...s, localTexts: { ...s.localTexts, [slotIdx]: updated } };
        });
    };

    const handleUpload = async (files: File[]) => {
        if (!files || files.length === 0) return;
        setProject(s => ({ ...s, isUploading: true }));
        try {
            const uploaded = await Promise.all(files.map(async file => {
                const resized = await resizeImage(file, 2048, 2048);
                const reader = new FileReader();
                return new Promise<ImageFile>(res => {
                    reader.onloadend = () => res({ base64: (reader.result as string).split(',')[1], mimeType: resized.type, name: resized.name });
                    reader.readAsDataURL(resized);
                });
            }));
            setProject(s => ({
                ...s,
                baseImages: [...s.baseImages, ...uploaded],
                isUploading: false
            }));
        } catch (err) { setProject(s => ({ ...s, isUploading: false })); }
    };

    const activeLut = LUTS.find(l => l.name === project.adjustments.lut);
    const filterStyle = { filter: `${activeLut?.filter || ''} contrast(${1 + (project.adjustments.sharpness / 100 - 1) * 0.2})` };
    const activeSlotTexts = activeSlotIdx !== null ? (project.localTexts[activeSlotIdx] || []) : [];
    const selectedText = activeSlotTexts.find(t => t.id === selectedTextId) || null;

    return (
        <main className="w-full flex flex-col lg:flex-row gap-10 pt-4 pb-20 animate-in fade-in duration-500 items-start text-right" dir="rtl">
            
            <div className="w-full lg:w-[400px] flex-shrink-0">
                <div className="bg-white/5 rounded-[2.5rem] p-8 shadow-2xl border border-white/5 lg:sticky lg:top-28 max-h-[85vh] overflow-y-auto no-scrollbar">
                    <h2 className="text-xs font-black text-[#FFD700] uppercase tracking-widest mb-8 flex items-center gap-3">
                        <div className="w-2 h-2 bg-[#FFD700] rounded-full"></div> لوحة التحكم الإبداعية
                    </h2>
                    
                    <div className="space-y-10">
                        <div className="space-y-6 pb-8 border-b border-white/5">
                            <label className="w-full h-14 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center cursor-pointer transition-all gap-3 active:scale-95">
                                <PlusIcon />
                                <span className="text-xs font-black text-slate-300 uppercase">إضافة صور للتعديل</span>
                                <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => handleUpload(Array.from(e.target.files || []))} />
                            </label>
                            
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">تأثير الألوان (LUT)</label>
                                <select 
                                    value={project.adjustments.lut}
                                    onChange={(e) => setProject(s => ({ ...s, adjustments: { ...s.adjustments, lut: e.target.value } }))}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl text-xs font-bold p-4 text-white focus:border-[#FFD700] outline-none"
                                >
                                    {LUTS.map(l => <option key={l.name} value={l.name}>{l.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-black text-[#FFD700] uppercase tracking-widest flex items-center gap-2"><TextIcon /> النصوص والخطوط</h3>
                                {activeSlotIdx !== null && (
                                    <button onClick={() => addTextToSlot(activeSlotIdx)} className="w-8 h-8 bg-[#FFD700] text-black rounded-lg shadow-lg shadow-[#FFD700]/20 flex items-center justify-center active:scale-90 transition-all"><PlusIcon /></button>
                                )}
                            </div>
                            
                            {activeSlotIdx !== null ? (
                                <div className="space-y-6">
                                    <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1 no-scrollbar">
                                        {activeSlotTexts.map((txt, i) => (
                                            <div 
                                                key={txt.id} 
                                                onClick={() => setSelectedTextId(txt.id)}
                                                className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer border transition-all ${selectedTextId === txt.id ? 'bg-[#FFD700]/10 border-[#FFD700]/30' : 'bg-white/5 border-transparent'}`}
                                            >
                                                <span className="text-xs font-bold text-white truncate px-2">{txt.content || `نص جديد ${i+1}`}</span>
                                                <button onClick={(e) => { e.stopPropagation(); setProject(s => ({...s, localTexts: {...s.localTexts, [activeSlotIdx]: (s.localTexts[activeSlotIdx]||[]).filter(t=>t.id!==txt.id)}})); }} className="text-red-400 hover:text-red-600 p-1 transition-colors"><TrashIcon /></button>
                                            </div>
                                        ))}
                                    </div>

                                    {selectedText && (
                                        <div className="space-y-6 p-6 bg-black/40 rounded-[2rem] border border-white/10">
                                            <textarea value={selectedText.content} onChange={(e) => updateSlotText(activeSlotIdx, selectedText.id, { content: e.target.value })} className="w-full h-24 bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white focus:border-[#FFD700] outline-none resize-none shadow-inner" placeholder="اكتب النص هنا..." />
                                            
                                            <div className="grid grid-cols-1 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase">الخط (Font)</label>
                                                    <select value={selectedText.fontFamily} onChange={(e) => updateSlotText(activeSlotIdx, selectedText.id, { fontFamily: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl text-[11px] p-3 text-white outline-none">
                                                        <optgroup label="خطوط عربية">{ARABIC_FONTS.map(f => <option key={f} value={f}>{f}</option>)}</optgroup>
                                                        <optgroup label="English Fonts">{ENGLISH_FONTS.map(f => <option key={f} value={f}>{f}</option>)}</optgroup>
                                                    </select>
                                                </div>
                                                
                                                <div className="flex gap-4">
                                                    <div className="flex-grow space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase">اللون</label>
                                                        <input type="color" value={selectedText.color} onChange={(e) => updateSlotText(activeSlotIdx, selectedText.id, { color: e.target.value })} className="w-full h-10 bg-black/40 border border-white/10 cursor-pointer rounded-xl overflow-hidden p-1" />
                                                    </div>
                                                    <div className="flex-grow space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase">حجم الخط ({selectedText.fontSize})</label>
                                                        <input type="range" min="10" max="300" value={selectedText.fontSize} onChange={(e) => updateSlotText(activeSlotIdx, selectedText.id, { fontSize: parseInt(e.target.value) })} className="w-full h-2 bg-white/10 appearance-none rounded-full accent-[#FFD700] cursor-pointer" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-12 border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/5 text-center">
                                    <p className="text-xs text-slate-500 font-black uppercase tracking-widest">اضغط على صورة من المعرض لبدء الكتابة عليها</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-grow min-w-0 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {project.baseImages.map((img, idx) => (
                        <div key={idx} className="flex flex-col gap-4 animate-in fade-in duration-700">
                            <div className="flex justify-between items-center px-4">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">الصورة 0{idx + 1}</span>
                                <button onClick={() => setProject(s => ({ ...s, baseImages: s.baseImages.filter((_, i) => i !== idx) }))} className="text-slate-500 hover:text-red-500 transition-colors"><TrashIcon /></button>
                            </div>

                            <div 
                                ref={el => { containerRefs.current[idx] = el; }}
                                onClick={() => setActiveSlotIdx(idx)}
                                className={`bg-black rounded-[3rem] overflow-hidden relative shadow-2xl border-4 transition-all duration-500 cursor-pointer w-full ${activeSlotIdx === idx ? 'border-[#FFD700] scale-[1.02]' : 'border-white/5 hover:border-white/20'}`}
                            >
                                <div className="w-full relative touch-none select-none">
                                    <img src={`data:${img.mimeType};base64,${img.base64}`} className="w-full h-auto block pointer-events-none" style={filterStyle} />
                                    {(project.localTexts[idx] || []).map(text => (
                                        text.isVisible && (
                                            <div 
                                                key={text.id}
                                                style={{
                                                    position: 'absolute', left: `${text.x}%`, top: `${text.y}%`,
                                                    transform: `translate(-50%, -50%) rotate(${text.rotation}deg)`,
                                                    color: text.color, fontSize: `${text.fontSize}px`,
                                                    fontFamily: text.fontFamily, fontWeight: text.fontWeight,
                                                    textAlign: 'center', textShadow: '0 2px 20px rgba(0,0,0,0.5)', zIndex: 10,
                                                    width: `${text.maxWidth}%`, lineHeight: `${text.lineHeight}`, wordWrap: 'break-word'
                                                }}
                                                onPointerDown={(e) => { 
                                                    e.stopPropagation(); setSelectedTextId(text.id); setDraggingId(text.id); setDraggingSlot(idx); setActiveSlotIdx(idx); (e.target as HTMLElement).setPointerCapture(e.pointerId); 
                                                }}
                                                onPointerMove={(e) => {
                                                    if (draggingId !== text.id || draggingSlot !== idx) return;
                                                    const rect = containerRefs.current[idx]!.getBoundingClientRect();
                                                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                                                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                                                    updateSlotText(idx, text.id, { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
                                                }}
                                                onPointerUp={() => { setDraggingId(null); setDraggingSlot(null); }}
                                                className={`cursor-move p-2 border ${selectedTextId === text.id ? 'border-dashed border-[#FFD700] bg-[#FFD700]/5' : 'border-transparent'}`}
                                            >
                                                {text.content}
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <label className="flex flex-col gap-5 cursor-pointer group animate-in fade-in duration-700 min-h-[400px]">
                        <div className="w-full h-full bg-white/5 rounded-[3rem] border-4 border-dashed border-white/5 flex flex-col items-center justify-center p-12 gap-6 opacity-60 group-hover:opacity-100 group-hover:border-white/20 group-hover:bg-white/10 transition-all duration-500 shadow-sm">
                            <div className="w-20 h-20 bg-black/40 rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🖼️</div>
                            <span className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">إضافة صورة جديدة</span>
                            <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => handleUpload(Array.from(e.target.files || []))} />
                        </div>
                    </label>
                </div>
            </div>
        </main>
    );
};

export default EditStudio;
