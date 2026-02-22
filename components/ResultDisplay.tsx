
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ImageFile } from '../types';

interface ResultDisplayProps {
  imageFile: ImageFile | null;
  isLoading: boolean;
  onEdit?: (prompt: string) => void;
  isEditing?: boolean;
}

const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

const ResultDisplay: React.FC<ResultDisplayProps> = ({ imageFile, isLoading, onEdit, isEditing }) => {
    const [isFullViewOpen, setIsFullViewOpen] = useState(false);

    const handleDownload = (res: '2k' | '4k') => {
        if (!imageFile) return;
        const link = document.createElement('a');
        link.download = `EbdaaPro-${res}.png`;
        link.href = `data:${imageFile.mimeType};base64,${imageFile.base64}`;
        link.click();
    };

    return (
        <div className="w-full flex flex-col gap-6 text-right">
            <div className="w-full aspect-square bg-black/20 backdrop-blur-3xl rounded-[2.5rem] flex items-center justify-center overflow-hidden relative border border-white/5 group shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
                {(isLoading || isEditing) && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
                        <div className="w-14 h-14 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-[10px] font-black text-[#FFD700] uppercase tracking-[0.3em] animate-pulse">رندرة المشهد الفائق...</p>
                    </div>
                )}
                {imageFile && !isLoading && !isEditing && (
                     <div className="w-full h-full relative group">
                        <img src={`data:${imageFile.mimeType};base64,${imageFile.base64}`} alt="Result" className="object-contain w-full h-full cursor-zoom-in transition-transform duration-1000 group-hover:scale-105" onClick={() => setIsFullViewOpen(true)} />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none flex items-center justify-center">
                            <span className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full text-[10px] font-black text-white border border-white/20 uppercase tracking-widest">عرض كامل</span>
                        </div>
                    </div>
                )}
                {!imageFile && !isLoading && (
                    <div className="flex flex-col items-center gap-4 opacity-10">
                        <span className="text-7xl">🎨</span>
                        <p className="font-black uppercase tracking-[0.4em] text-xs">Ready to Design</p>
                    </div>
                )}
            </div>

            {imageFile && !isLoading && !isEditing && (
                <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-bottom-2 duration-500">
                    <button onClick={() => handleDownload('4k')} className="h-16 bg-[#FFD700] text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-yellow-400 transition-all shadow-xl active:scale-95">
                        <DownloadIcon /> تحميل 4K (Ultra HD)
                    </button>
                </div>
            )}

            {isFullViewOpen && imageFile && createPortal(
                <div className="fixed inset-0 bg-black/98 backdrop-blur-2xl flex items-center justify-center z-[99999] p-4 animate-in fade-in duration-300 cursor-zoom-out" onClick={() => setIsFullViewOpen(false)}>
                    <img src={`data:${imageFile.mimeType};base64,${imageFile.base64}`} alt="Full View" className="max-w-full max-h-full object-contain shadow-2xl rounded-3xl" />
                    <button className="absolute top-10 right-10 w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white text-2xl hover:bg-white/10">✕</button>
                </div>, document.body
            )}
        </div>
    );
};

export default ResultDisplay;
