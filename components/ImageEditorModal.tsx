import React, { useState, useRef, useCallback } from 'react';
import { ImageFile, LocalText } from '../types';

const ARABIC_FONTS = ['Cairo', 'Tajawal', 'Amiri', 'Reem Kufi', 'Lateef', 'Changa', 'Harmattan', 'Almarai'];
const ENGLISH_FONTS = ['Montserrat', 'Bebas Neue', 'Playfair Display', 'Oswald', 'Rubik', 'Inter', 'Poppins', 'Roboto'];

const LUTS = [
    { name: 'Original', filter: '' },
    { name: 'Warm Sun', filter: 'sepia(0.3) saturate(1.2) hue-rotate(-10deg)' },
    { name: 'Ice Cold', filter: 'saturate(0.8) hue-rotate(180deg) brightness(1.1)' },
    { name: 'Deep Cinematic', filter: 'contrast(1.3) saturate(0.8) brightness(0.9) hue-rotate(-5deg)' },
    { name: 'Black & White', filter: 'grayscale(1) contrast(1.1)' },
    { name: 'Vibrant', filter: 'saturate(1.5) contrast(1.1)' },
];

const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const TextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;

const createNewText = (): LocalText => ({
    id: Math.random().toString(36).substr(2, 9),
    content: 'اكتب نصك هنا', fontSize: 60, color: '#ffffff', fontFamily: 'Cairo', fontWeight: '900', x: 50, y: 50, isVisible: true, rotation: 0, letterSpacing: 0, lineHeight: 1.1, maxWidth: 80
});

interface Props {
    image: ImageFile | null;
    onClose: () => void;
    onSave?: (editedImage: ImageFile) => void;
}

const ImageEditorModal: React.FC<Props> = ({ image, onClose, onSave }) => {
    const [texts, setTexts] = useState<LocalText[]>([]);
    const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
    const [activeLut, setActiveLut] = useState(LUTS[0].name);

    const [draggingId, setDraggingId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const activeLutObj = LUTS.find(l => l.name === activeLut);
    const filterStyle = { filter: activeLutObj?.filter || '' };
    const selectedText = texts.find(t => t.id === selectedTextId) || null;

    const addText = () => {
        const newText = createNewText();
        setTexts([...texts, newText]);
        setSelectedTextId(newText.id);
    };

    const updateText = (id: string, updates: Partial<LocalText>) => {
        setTexts(texts.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    const exportImage = async () => {
        if (!image) return;

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const imgElement = new Image();
            imgElement.crossOrigin = "anonymous";
            imgElement.src = `data:${image.mimeType};base64,${image.base64}`;

            await new Promise((resolve, reject) => {
                imgElement.onload = resolve;
                imgElement.onerror = reject;
            });

            canvas.width = imgElement.width;
            canvas.height = imgElement.height;

            // Draw original image with LUT
            ctx.filter = activeLutObj?.filter || 'none';
            ctx.drawImage(imgElement, 0, 0);
            ctx.filter = 'none';

            // Draw text
            texts.forEach(text => {
                if (!text.isVisible) return;

                ctx.save();
                // Positioning
                const xPos = (text.x / 100) * canvas.width;
                const yPos = (text.y / 100) * canvas.height;

                ctx.translate(xPos, yPos);
                ctx.rotate((text.rotation * Math.PI) / 180);

                // Styling
                ctx.fillStyle = text.color;
                // Scale font size based on canvas vs typical screen height (assuming screen height is roughly 800 for the preview)
                const scaleFactor = canvas.height / 800; // rough approximation
                const scaledFontSize = text.fontSize * scaleFactor;

                ctx.font = `${text.fontWeight} ${scaledFontSize}px ${text.fontFamily}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 20;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 2;

                // Wrap text manually is complex, here we just split by \n
                const lines = text.content.split('\n');
                lines.forEach((line, i) => {
                    ctx.fillText(line, 0, i * (scaledFontSize * text.lineHeight));
                });

                ctx.restore();
            });

            const dataUrl = canvas.toDataURL(image.mimeType);
            const newBase64 = dataUrl.split(',')[1];

            if (onSave) {
                onSave({ ...image, base64: newBase64 });
            } else {
                // Default download behavior if onSave isn't provided
                const a = document.createElement('a');
                a.href = dataUrl;
                a.download = `edited_${image.name || 'image.webp'}`;
                a.click();
            }

            onClose();

        } catch (e) {
            console.error("Failed to export image", e);
            alert("فشل تصدير الصورة");
        }
    };

    if (!image) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300" dir="rtl">
            <div className="absolute top-6 right-6 flex gap-4">
                <button onClick={exportImage} className="px-6 py-3 bg-[#FFD700] text-black font-black rounded-2xl flex items-center shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:scale-105 transition-all">
                    <DownloadIcon /> تصدير وحفظ
                </button>
                <button onClick={onClose} className="px-6 py-3 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all">
                    إلغاء
                </button>
            </div>

            <div className="w-full h-full max-w-[95vw] max-h-[90vh] mt-16 flex flex-col lg:flex-row gap-8">
                {/* Editor Panel */}
                <div className="w-full lg:w-[400px] flex-shrink-0 bg-white/5 rounded-[2.5rem] p-8 shadow-2xl border border-white/10 overflow-y-auto no-scrollbar">
                    <h2 className="text-sm font-black text-[#FFD700] uppercase tracking-widest mb-8 flex items-center gap-3">
                        <div className="w-2 h-2 bg-[#FFD700] rounded-full"></div> التعديل الإبداعي الشامل
                    </h2>

                    <div className="space-y-8">
                        {/* LUT Panel */}
                        <div className="space-y-4 pb-6 border-b border-white/5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">فلاتر الألوان والمزاج</label>
                            <div className="grid grid-cols-2 gap-3">
                                {LUTS.map(l => (
                                    <button
                                        key={l.name}
                                        onClick={() => setActiveLut(l.name)}
                                        className={`p-3 rounded-xl text-xs font-bold transition-all border ${activeLut === l.name ? 'bg-[#FFD700]/20 border-[#FFD700] text-[#FFD700]' : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'}`}
                                    >
                                        {l.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Texts Panel */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-black text-[#FFD700] uppercase tracking-widest flex items-center gap-2"><TextIcon /> النصوص</h3>
                                <button onClick={addText} className="w-8 h-8 bg-[#FFD700] text-black rounded-lg shadow-lg flex items-center justify-center active:scale-90 transition-all"><PlusIcon /></button>
                            </div>

                            <div className="flex flex-col gap-2">
                                {texts.map((txt, i) => (
                                    <div
                                        key={txt.id}
                                        onClick={() => setSelectedTextId(txt.id)}
                                        className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer border transition-all ${selectedTextId === txt.id ? 'bg-[#FFD700]/10 border-[#FFD700]/30' : 'bg-white/5 border-transparent'}`}
                                    >
                                        <span className="text-xs font-bold text-white truncate px-2">{txt.content || `نص ${i + 1}`}</span>
                                        <button onClick={(e) => { e.stopPropagation(); setTexts(texts.filter(t => t.id !== txt.id)); }} className="text-red-400 hover:text-red-600 p-1 transition-colors"><TrashIcon /></button>
                                    </div>
                                ))}
                            </div>

                            {selectedText && (
                                <div className="space-y-6 p-6 bg-black/40 rounded-[2rem] border border-white/10 mt-4">
                                    <textarea value={selectedText.content} onChange={(e) => updateText(selectedText.id, { content: e.target.value })} className="w-full h-24 bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white focus:border-[#FFD700] outline-none resize-none" placeholder="اكتب النص هنا..." />

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase">الخط (Font)</label>
                                            <select value={selectedText.fontFamily} onChange={(e) => updateText(selectedText.id, { fontFamily: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl text-[11px] p-3 text-white outline-none">
                                                <optgroup label="خطوط عربية">{ARABIC_FONTS.map(f => <option key={f} value={f}>{f}</option>)}</optgroup>
                                                <optgroup label="English Fonts">{ENGLISH_FONTS.map(f => <option key={f} value={f}>{f}</option>)}</optgroup>
                                            </select>
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="flex-grow space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase">اللون</label>
                                                <input type="color" value={selectedText.color} onChange={(e) => updateText(selectedText.id, { color: e.target.value })} className="w-full h-10 bg-black/40 border border-white/10 cursor-pointer rounded-xl overflow-hidden p-1" />
                                            </div>
                                            <div className="flex-grow space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase">الحجم ({selectedText.fontSize})</label>
                                                <input type="range" min="10" max="300" value={selectedText.fontSize} onChange={(e) => updateText(selectedText.id, { fontSize: parseInt(e.target.value) })} className="w-full h-2 bg-white/10 appearance-none rounded-full accent-[#FFD700] cursor-pointer" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 flex items-center justify-center bg-black/50 rounded-[2.5rem] border border-white/5 relative overflow-hidden group p-4">
                    <div
                        ref={containerRef}
                        className="relative touch-none select-none max-w-full max-h-full aspect-auto shadow-2xl rounded-2xl overflow-hidden"
                        style={{ display: 'inline-block' }}
                    >
                        <img
                            src={`data:${image.mimeType};base64,${image.base64}`}
                            style={filterStyle}
                            className="max-w-full max-h-full object-contain pointer-events-none"
                            alt="Editor Workspace"
                        />

                        {texts.map(text => (
                            text.isVisible && (
                                <div
                                    key={text.id}
                                    style={{
                                        position: 'absolute', left: `${text.x}%`, top: `${text.y}%`,
                                        transform: `translate(-50%, -50%) rotate(${text.rotation}deg)`,
                                        color: text.color, fontSize: `${text.fontSize}px`,
                                        fontFamily: text.fontFamily, fontWeight: text.fontWeight,
                                        textAlign: 'center', textShadow: '0 2px 20px rgba(0,0,0,0.5)', zIndex: 10,
                                        width: `${text.maxWidth}%`, lineHeight: `${text.lineHeight}`, wordWrap: 'break-word',
                                        whiteSpace: 'pre-wrap'
                                    }}
                                    onPointerDown={(e) => {
                                        e.stopPropagation(); setSelectedTextId(text.id); setDraggingId(text.id); (e.target as HTMLElement).setPointerCapture(e.pointerId);
                                    }}
                                    onPointerMove={(e) => {
                                        if (draggingId !== text.id) return;
                                        if (!containerRef.current) return;
                                        const rect = containerRef.current.getBoundingClientRect();
                                        const x = ((e.clientX - rect.left) / rect.width) * 100;
                                        const y = ((e.clientY - rect.top) / rect.height) * 100;
                                        updateText(text.id, { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
                                    }}
                                    onPointerUp={() => setDraggingId(null)}
                                    className={`cursor-move p-2 border ${selectedTextId === text.id ? 'border-dashed border-[#FFD700] bg-[#FFD700]/10' : 'border-transparent'}`}
                                >
                                    {text.content}
                                </div>
                            )
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageEditorModal;
