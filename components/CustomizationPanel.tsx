
import React, { useState, useRef, useEffect } from 'react';
import { CustomizationOptions } from '../types';
import { LIGHTING_STYLES, CAMERA_PERSPECTIVES } from '../constants';

interface CustomizationPanelProps {
  options: CustomizationOptions;
  setOptions: (options: CustomizationOptions) => void;
}

interface CustomSelectProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ label, icon, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find(opt => opt.value === value)?.label || value;

  return (
    <div className="flex-1 flex flex-col gap-2 relative" ref={containerRef}>
       <label 
            className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2 whitespace-nowrap cursor-pointer hover:text-[#FFD700] transition-colors"
            onClick={() => setIsOpen(!isOpen)}
        >
            {icon}
            {label}
        </label>
        <div className="relative w-full">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full text-right bg-black/40 border rounded-2xl px-5 py-4 outline-none transition-all text-xs font-black flex items-center justify-between shadow-sm
                ${isOpen 
                    ? 'border-[#FFD700] ring-4 ring-[#FFD700]/10 bg-black/60' 
                    : 'border-white/10 hover:border-[#FFD700]/50 text-white'
                }`}
            >
                <span className="truncate">{selectedLabel}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-[#FFD700] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-black/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-200 origin-top p-2 no-scrollbar">
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                            }}
                            className={`px-4 py-3 text-xs font-bold cursor-pointer transition-all rounded-xl mb-1 last:mb-0
                                ${opt.value === value 
                                    ? 'text-black bg-[#FFD700]' 
                                    : 'text-slate-400 hover:bg-white/5 hover:text-[#FFD700]'
                                }`}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({ options, setOptions }) => {
  return (
    <div className="bg-white/5 rounded-3xl p-6 border border-white/5 shadow-sm relative z-20">
      <div className="flex flex-col sm:flex-row gap-6">
        <CustomSelect
            label="Lighting Mode"
            icon={<span className="text-[#FFD700]">☀️</span>}
            value={options.lightingStyle}
            options={LIGHTING_STYLES}
            onChange={(val) => setOptions({ ...options, lightingStyle: val as any })}
        />
        <CustomSelect
            label="Camera Perspective"
            icon={<span className="text-[#FFD700]">🎥</span>}
            value={options.cameraPerspective}
            options={CAMERA_PERSPECTIVES}
            onChange={(val) => setOptions({ ...options, cameraPerspective: val as any })}
        />
      </div>
    </div>
  );
};

export default CustomizationPanel;