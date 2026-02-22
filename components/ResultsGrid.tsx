
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { PhotoshootResult, ImageFile } from '../types';
import { editImage } from '../services/geminiService';

const ImageResult: React.FC<{ 
    result: PhotoshootResult;
    onUpdate: (updated: Partial<PhotoshootResult>) => void;
}> = ({ result, onUpdate }) => {
    const [isFullViewOpen, setIsFullViewOpen] = useState(false);
    const [editPrompt, setEditPrompt] = useState('');

    const handleApplyEdit = async () => {
        if (!editPrompt.trim() || !result.image) return;
        onUpdate({ isEditing: true, error: null });
        try {
            const newImg = await editImage(result.image, editPrompt);
            onUpdate({ image: newImg, isEditing: false });
            setEditPrompt('');
        } catch (err) {
            onUpdate({ isEditing: false, error: 'فشل التعديل' });
        }
    };

    return (
        <div className="flex flex-col gap-4 animate-in zoom-in-95 duration-500 group/card">
            <h4 className="text-[10px] font-black text-center text-slate-400 uppercase tracking-widest truncate">{result.shotType}</h4>
            
            <div className="relative w-full aspect-square bg-black/40 rounded-[2.5rem] overflow-hidden border border-white/5 group-hover/card:border-[#FFD700]/30 transition-all shadow-sm">
                {(result.isLoading || result.isEditing) ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 bg-black/80 backdrop-blur-sm">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#FFD700]"></div>
                        <span className="text-[9px] font-black text-[#FFD700] animate-pulse">جاري الرندرة...</span>
                    </div>
                ) : result.image ? (
                    <img 
                        src={`data:${result.image.mimeType};base64,${result.image.base64}`} 
                        alt={result.shotType} 
                        className="object-cover w-full h-full cursor-zoom-in transition-transform duration-700 group-hover/card:scale-105"
                        onClick={() => setIsFullViewOpen(true)}
                    />
                ) : (
                    <div className="p-4 text-center h-full flex items-center justify-center text-red-400 font-bold text-[10px]">{result.error}</div>
                )}
            </div>

            {result.image && !result.isLoading && !result.isEditing && (
                <div className="space-y-2">
                    <div className="relative group/edit">
                            <input 
                                value={editPrompt} 
                                onChange={e => setEditPrompt(e.target.value)} 
                                placeholder="اطلب تعديل على الصورة..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-bold text-white focus:border-[#FFD700] outline-none transition-all pr-12"
                                onKeyDown={e => e.key === 'Enter' && handleApplyEdit()}
                            />
                            <button onClick={handleApplyEdit} disabled={!editPrompt.trim()} className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-[#FFD700] text-black rounded-lg text-[9px] font-black hover:bg-yellow-400 transition-all disabled:opacity-0">تطبيق</button>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => { const link = document.createElement('a'); link.href = `data:${result.image!.mimeType};base64,${result.image!.base64}`; link.download = `Result.png`; link.click(); }} className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black hover:bg-black transition-all">تحميل 4K</button>
                        <button onClick={() => setIsFullViewOpen(true)} className="flex-1 bg-white border border-slate-200 text-slate-900 py-3 rounded-xl text-[10px] font-black hover:bg-slate-50 transition-all">عرض كامل</button>
                    </div>
                </div>
            )}

            {isFullViewOpen && result.image && createPortal(
                <div className="fixed inset-0 bg-white/95 backdrop-blur-xl flex items-center justify-center z-[99999] p-6 animate-in fade-in cursor-zoom-out" onClick={() => setIsFullViewOpen(false)}>
                    <img src={`data:${result.image.mimeType};base64,${result.image.base64}`} className="max-w-full max-h-full object-contain shadow-2xl rounded-3xl" />
                    <button className="absolute top-10 right-10 w-14 h-14 bg-slate-100 text-slate-900 rounded-full flex items-center justify-center font-black shadow-xl">✕</button>
                </div>, document.body
            )}
        </div>
    );
};

const ResultsGrid: React.FC<{
  results: PhotoshootResult[];
  onUpdateResult: (index: number, updated: Partial<PhotoshootResult>) => void;
}> = ({ results, onUpdateResult }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
      {results.map((result, idx) => (
        <ImageResult key={idx} result={result} onUpdate={(upd) => onUpdateResult(idx, upd)} />
      ))}
    </div>
  );
};

export default ResultsGrid;
