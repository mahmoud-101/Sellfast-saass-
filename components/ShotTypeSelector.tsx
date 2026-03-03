
import React from 'react';
import { SHOT_TYPES, MAX_SHOT_SELECTION } from '../constants';
import { ShotType } from '../types';

const ShotTypeButton: React.FC<{
  type: ShotType,
  isSelected: boolean,
  onClick: () => void,
}> = ({ type, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-center text-[11px] font-black px-2 py-3.5 rounded-xl transition-all duration-300 border-2 ${
        isSelected
          ? 'bg-[#FFD700] text-black border-[#FFD700] shadow-lg shadow-[#FFD700]/20'
          : 'bg-black/40 border-white/10 text-slate-400 hover:border-[#FFD700]/50 hover:text-[#FFD700]'
      }`}
    >
      {type}
    </button>
  );
};

// Define the missing props interface for ShotTypeSelector
interface ShotTypeSelectorProps {
  selected: ShotType[];
  onChange: (selected: ShotType[]) => void;
  customStylePrompt: string;
  onCustomStylePromptChange: (prompt: string) => void;
}

const ShotTypeSelector: React.FC<ShotTypeSelectorProps> = ({ selected, onChange, customStylePrompt, onCustomStylePromptChange }) => {

  const handleToggle = (type: ShotType) => {
    const isSelected = selected.includes(type);
    if (isSelected) {
      onChange(selected.filter(t => t !== type));
    } else {
      if (selected.length < MAX_SHOT_SELECTION) {
        onChange([...selected, type]);
      }
    }
  };

  return (
    <div className="bg-white/5 rounded-[2rem] p-6 border border-white/5 shadow-sm">
      <div className="flex justify-between items-center mb-6 flex-row-reverse">
        <h3 className="text-lg font-black text-white tracking-tight">2. اختار زوايا التصوير</h3>
        <span className={`text-[10px] font-black px-3 py-1 rounded-full ${selected.length === MAX_SHOT_SELECTION ? 'bg-orange-500/20 text-orange-400' : 'bg-[#FFD700]/20 text-[#FFD700]'}`}>
           ({selected.length}/{MAX_SHOT_SELECTION}) لقطات
        </span>
      </div>

      <div className="space-y-8">
        {SHOT_TYPES.map(section => (
            <div key={section.category} className="text-right">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 pr-2 border-r-2 border-[#FFD700]">{section.category}</h4>
                <div className="grid grid-cols-2 gap-2.5">
                    {section.types.map(type => (
                        <ShotTypeButton
                            key={type}
                            type={type}
                            isSelected={selected.includes(type)}
                            onClick={() => handleToggle(type)}
                        />
                    ))}
                </div>
            </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-white/5">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pr-2 border-r-2 border-[#FFD700] text-right">وصف إضافي (اختياري)</h4>
        <textarea
            value={customStylePrompt}
            onChange={(e) => onCustomStylePromptChange(e.target.value)}
            rows={3}
            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white focus:border-[#FFD700] outline-none resize-none text-right shadow-inner"
            placeholder="مثال: إضاءة نهارية ناعمة، ألوان دافئة، تفاصيل واضحة..."
        />
      </div>
    </div>
  );
};

export default ShotTypeSelector;
