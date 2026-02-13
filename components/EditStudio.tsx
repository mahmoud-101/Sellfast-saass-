
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
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const TextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>;

const createNewText = (): LocalText => ({
    id: Math.random().toString(36).substr(2, 9),
    content: 'نص جديد', fontSize: 40, color: '#ffffff', fontFamily: 'Cairo', fontWeight: '700', x: 50, y: 50, isVisible: true, rotation: 0, letterSpacing: 0, lineHeight: 1.1, maxWidth: 80 
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
    const [customFonts, setCustomFonts] = useState<string[]>([]);
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
    const filterStyle = { filter: `${activeLut?.filter || ''} contrast(${1 + (project.adjustments.sharpness / 100 - 1) * 0.2}) brightness(${1 + (project.adjustments.sharpness / 100 - 1) * 0.05})` };
    const selectedLayer = project.globalLayers.find(l => l.id === selectedLayerId);
    const activeSlotTexts = activeSlotIdx !== null ? (project.localTexts[activeSlotIdx] || []) : [];
    const selectedText = activeSlotTexts.find(t => t.id === selectedTextId) || null;

    return (
        <main className="w-full flex flex-col lg:flex-row gap-6 sm:gap-10 pt-4 pb-20 animate-in fade-in duration-500 items-start">
            
            {/* Control Sidebar - Fixed height on desktop, flow on mobile */}
            <div className="w-full lg:w-[380px] lg:order-2 flex-shrink-0">
                <div className="glass-card rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 shadow-2xl border border-white/5 lg:sticky lg:top-24 max-h-none lg:max-h-[85vh] overflow-y-auto suggestions-scrollbar">
                    <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-5 flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 bg-[var(--color-accent)] rounded-full"></div> Studio Controls
                    </h2>
                    
                    <div className="space-y-6">
                        <div className="space-y-4 pb-4 border-b border-white/5">
                            <label className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center cursor-pointer transition-all gap-2.5 active:scale-95">
                                <PlusIcon />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Add Photos</span>
                                <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => handleUpload(Array.from(e.target.files || []))} />
                            </label>
                            
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Color Grade</label>
                                <select 
                                    value={project.adjustments.lut}
                                    onChange={(e) => setProject(s => ({ ...s, adjustments: { ...s.adjustments, lut: e.target.value } }))}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl text-[11px] font-bold p-3 text-white focus:outline-none"
                                >
                                    {LUTS.map(l => <option key={l.name} value={l.name}>{l.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="flex justify-between items-center">
                                <h3 className="text-[10px] font-black text-[var(--color-accent)] uppercase tracking-widest flex items-center gap-2"><TextIcon /> Typography</h3>
                                {activeSlotIdx !== null && (
                                    <button onClick={() => addTextToSlot(activeSlotIdx)} className="p-1.5 bg-[var(--color-accent)]/20 text-[var(--color-accent)] rounded-lg border border-[var(--color-accent)]/20 active:scale-90 transition-all"><PlusIcon /></button>
                                )}
                            </div>
                            
                            {activeSlotIdx !== null ? (
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto suggestions-scrollbar">
                                        {activeSlotTexts.map((txt, i) => (
                                            <div 
                                                key={txt.id} 
                                                onClick={() => setSelectedTextId(txt.id)}
                                                className={`flex items-center justify-between p-2 rounded-xl cursor-pointer border transition-all ${selectedTextId === txt.id ? 'bg-[rgba(var(--color-accent-rgb),0.15)] border-[var(--color-accent)]/50' : 'bg-white/5 border-transparent'}`}
                                            >
                                                <span className="text-[10px] font-bold text-white/70 truncate px-2">{txt.content || `Layer ${i+1}`}</span>
                                                <button onClick={(e) => { e.stopPropagation(); setProject(s => ({...s, localTexts: {...s.localTexts, [activeSlotIdx]: (s.localTexts[activeSlotIdx]||[]).filter(t=>t.id!==txt.id)}})); }} className="text-white/20 hover:text-red-500 p-1"><TrashIcon /></button>
                                            </div>
                                        ))}
                                    </div>

                                    {selectedText && (
                                        <div className="space-y-4 p-4 bg-black/40 rounded-2xl border border-white/5">
                                            <textarea value={selectedText.content} onChange={(e) => updateSlotText(activeSlotIdx, selectedText.id, { content: e.target.value })} className="w-full h-16 bg-black/40 border border-white/10 rounded-xl p-3 text-[11px] text-white focus:outline-none resize-none" placeholder="Write here..." />
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Font</label>
                                                    <select value={selectedText.fontFamily} onChange={(e) => updateSlotText(activeSlotIdx, selectedText.id, { fontFamily: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg text-[10px] p-2 text-white outline-none">
                                                        {customFonts.map(f => <option key={f} value={f}>{f}</option>)}
                                                        <optgroup label="Arabic" className="bg-gray-900">{ARABIC_FONTS.map(f => <option key={f} value={f}>{f}</option>)}</optgroup>
                                                        <optgroup label="English" className="bg-gray-900">{ENGLISH_FONTS.map(f => <option key={f} value={f}>{f}</option>)}</optgroup>
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Color</label>
                                                    <input type="color" value={selectedText.color} onChange={(e) => updateSlotText(activeSlotIdx, selectedText.id, { color: e.target.value })} className="w-full h-8 bg-transparent border-none cursor-pointer rounded-lg overflow-hidden" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Size ({selectedText.fontSize}px)</label>
                                                    <input type="range" min="10" max="200" value={selectedText.fontSize} onChange={(e) => updateSlotText(activeSlotIdx, selectedText.id, { fontSize: parseInt(e.target.value) })} className="w-full h-1 bg-white/10 appearance-none rounded-full accent-[var(--color-accent)]" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Width ({selectedText.maxWidth}%)</label>
                                                    <input type="range" min="10" max="100" value={selectedText.maxWidth} onChange={(e) => updateSlotText(activeSlotIdx, selectedText.id, { maxWidth: parseInt(e.target.value) })} className="w-full h-1 bg-white/10 appearance-none rounded-full accent-[var(--color-accent)]" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-8 border border-white/5 border-dashed rounded-3xl bg-black/20 text-center">
                                    <p className="text-[10px] text-white/20 font-bold uppercase">Select a photo below to start</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Dynamic Results Grid - Flex columns, 1 on mobile */}
            <div className="flex-grow lg:order-1 min-w-0 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    {project.baseImages.map((img, idx) => (
                        <div key={idx} className="flex flex-col gap-4 sm:gap-5 animate-in fade-in duration-700">
                            <div className="flex justify-between items-center px-2">
                                <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em]">Slide 0{idx + 1}</span>
                                <button onClick={() => setProject(s => ({ ...s, baseImages: s.baseImages.filter((_, i) => i !== idx) }))} className="p-2 text-white/20 hover:text-red-500"><TrashIcon /></button>
                            </div>

                            <div 
                                ref={el => { containerRefs.current[idx] = el; }}
                                onClick={() => setActiveSlotIdx(idx)}
                                className={`glass-card rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden relative bg-black/40 shadow-2xl border-2 transition-all duration-500 cursor-pointer w-full ${activeSlotIdx === idx ? 'border-[var(--color-accent)] ring-4 ring-[var(--color-accent)]/10' : 'border-white/5'}`}
                            >
                                <div className="w-full relative touch-none">
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
                                                    textAlign: 'center', textShadow: '0 2px 10px rgba(0,0,0,0.5)', zIndex: 10,
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
                                                className={`cursor-move select-none p-1 border border-transparent ${selectedTextId === text.id ? 'border-dashed border-[var(--color-accent)]' : ''}`}
                                            >
                                                {text.content}
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Placeholder for adding more photos */}
                    <label className="flex flex-col gap-5 cursor-pointer group animate-in fade-in duration-700 min-h-[300px]">
                        <div className="w-full aspect-square glass-card rounded-[1.5rem] sm:rounded-[2rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center p-8 sm:p-12 gap-5 opacity-40 group-hover:opacity-100 transition-all duration-500 bg-black/20">
                            <PlusIcon />
                            <span className="text-[11px] font-black uppercase tracking-[0.4em]">Add Photo</span>
                            <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => handleUpload(Array.from(e.target.files || []))} />
                        </div>
                    </label>
                </div>
            </div>
        </main>
    );
};

export default EditStudio;
