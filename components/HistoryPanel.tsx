
import React, { useState } from 'react';
import { ImageFile, HistoryItem } from '../types';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (image: ImageFile) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect }) => {
  return (
    <div className="glass-card rounded-[2.5rem] p-6 flex flex-col gap-6 border border-white/5 shadow-2xl">
      <div className="flex justify-between items-center flex-row-reverse">
        <h2 className="text-sm font-black text-white/40 uppercase tracking-[0.2em]">الأرشيف الإبداعي</h2>
        <span className="text-[10px] font-bold text-[#FFD700] bg-[#FFD700]/10 px-3 py-1 rounded-full">{history.length} عمل</span>
      </div>
      
      {history.length === 0 ? (
        <div className="py-20 text-center space-y-4 opacity-20">
            <div className="text-4xl">📁</div>
            <p className="text-xs font-bold uppercase tracking-widest">سجل الصور فارغ</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 suggestions-scrollbar">
          {history.map((item, index) => (
            <div
              key={index}
              onClick={() => onSelect(item.image)}
              className="aspect-square rounded-2xl overflow-hidden group relative cursor-pointer border border-white/5 hover:border-[#FFD700]/50 transition-all duration-500"
            >
              <img
                src={`data:${item.image.mimeType};base64,${item.image.base64}`}
                alt="History"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.5] group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                 <p className="text-white text-[8px] font-black uppercase tracking-widest line-clamp-2 leading-relaxed">
                    {item.prompt}
                 </p>
              </div>
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[7px] font-black text-white/40 border border-white/10 uppercase">HD</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;
