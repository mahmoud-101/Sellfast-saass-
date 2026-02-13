import React from 'react';
import { ProjectBase } from '../types';

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);
const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
    <div className="w-full max-w-7xl flex items-center border-b border-white/5">
      <div className="flex items-end -mb-px overflow-x-auto suggestions-scrollbar">
        {projects.map((project, index) => (
          <div
            key={project.id}
            onClick={() => onSelectTab(index)}
            className={`flex-shrink-0 cursor-pointer flex items-center gap-2 px-6 py-3 border-t border-l border-r rounded-t-xl transition-all duration-300 group relative ${
              index === activeProjectIndex
                ? 'border-white/10 bg-white/5 text-white'
                : 'border-transparent text-white/30 hover:bg-white/5 hover:text-white/60'
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-widest">{project.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(index);
              }}
              className="rounded-full p-1 -mr-1 text-white/10 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <XIcon />
            </button>
            {index === activeProjectIndex && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-accent)] shadow-[0_0_10px_var(--color-accent)]"></div>
            )}
          </div>
        ))}
        <button
          onClick={onAddTab}
          className="ml-2 p-3 text-white/20 hover:text-[var(--color-accent)] transition-colors"
        >
          <PlusIcon />
        </button>
      </div>
    </div>
  );
};

export default TabBar;