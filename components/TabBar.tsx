
import React from 'react';
import { ProjectBase } from '../types';

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);
const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface TabBarProps {
  projects: ProjectBase[];
  activeProjectIndex: number;
  onSelectTab: (index: number) => void;
  onAddTab: () => void;
  onCloseTab: (index: number) => void;
}

const TabBar: React.FC<TabBarProps> = ({ projects, activeProjectIndex, onSelectTab, onAddTab, onCloseTab }) => {
  return (
    <div className="w-full flex items-center gap-3 mb-6 overflow-x-auto no-scrollbar py-2" dir="rtl">
        <button
          onClick={onAddTab}
          className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center shadow-lg hover:bg-[#FFD700] hover:text-black transition-all active:scale-95"
          title="مشروع جديد"
        >
          <PlusIcon />
        </button>

        <div className="flex items-center gap-3">
            {projects.map((project, index) => (
                <div
                    key={project.id}
                    onClick={() => onSelectTab(index)}
                    className={`flex-shrink-0 cursor-pointer flex items-center gap-4 px-6 py-3 rounded-2xl border transition-all duration-300 group relative ${
                    index === activeProjectIndex
                        ? 'border-[#FFD700] bg-[#FFD700] text-black shadow-[0_0_20px_rgba(255,215,0,0.3)]'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                    }`}
                >
                    <span className="text-[11px] font-black uppercase tracking-widest whitespace-nowrap">{project.name}</span>
                    <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onCloseTab(index);
                    }}
                    className="rounded-lg p-1.5 text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                        <XIcon />
                    </button>
                </div>
            ))}
        </div>
    </div>
  );
};

export default TabBar;
