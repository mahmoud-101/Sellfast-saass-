import React from 'react';
import { ProjectBase } from '../types';

interface TabBarProps {
  projects: ProjectBase[];
  activeProjectIndex: number;
  onSelectTab: (index: number) => void;
  onAddTab: () => void;
  onCloseTab: (index: number) => void;
}

const TabBar: React.FC<TabBarProps> = ({ projects, activeProjectIndex, onSelectTab, onAddTab, onCloseTab }) => {
  return (
    <div className="w-full max-w-5xl mx-auto mb-8 relative z-20">
      <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-2 px-2 scrollbar-hide">
        {projects.map((project, index) => (
          <div
            key={project.id}
            onClick={() => onSelectTab(index)}
            className={`
              relative group flex items-center gap-3 px-6 py-3 rounded-2xl cursor-pointer transition-all duration-500 border backdrop-blur-md
              ${index === activeProjectIndex
                ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.3)] translate-y-[-2px]'
                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 hover:translate-y-[-2px]'}
            `}
          >
            {/* Active Indicator Line */}
            {index === activeProjectIndex && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-full blur-[2px]"></div>
            )}

            <span className={`text-sm font-bold whitespace-nowrap transition-colors duration-300 ${index === activeProjectIndex ? 'text-white' : 'text-white/60 group-hover:text-white/90'}`}>
              {project.name}
            </span>

            {/* Close Button */}
            {projects.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(index);
                }}
                className={`w-5 h-5 flex items-center justify-center rounded-full transition-all duration-300 ${index === activeProjectIndex
                    ? 'bg-white/10 text-white/60 hover:bg-red-500/80 hover:text-white'
                    : 'bg-transparent text-white/20 opacity-0 group-hover:opacity-100 hover:bg-red-500/50 hover:text-white'
                  }`}
              >
                ×
              </button>
            )}
          </div>
        ))}

        {/* Add New Tab Button */}
        <button
          onClick={onAddTab}
          className="w-12 h-12 flex items-center justify-center rounded-2xl border border-dashed border-white/20 text-white/40 hover:text-white hover:border-white/60 hover:bg-white/5 transition-all shrink-0 hover:rotate-90 duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          title="New Project"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>
    </div>
  );
};

export default TabBar;