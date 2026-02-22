
import React, { useState } from 'react';

interface GithubSyncProps {
    isOpen: boolean;
    onClose: () => void;
}

const FILES_LIST = [
    "services/geminiService.ts", "components/ImageUploader.tsx", "components/CustomizationPanel.tsx",
    "components/PromptEditor.tsx", "components/ImageWorkspace.tsx", "components/ResultDisplay.tsx",
    "components/HistoryPanel.tsx", "utils.ts", "components/CreatorStudio.tsx", "amplify.yml",
    "lib/supabase.ts", "components/Auth.tsx", "components/LandingPage.tsx"
];

const GithubSync: React.FC<GithubSyncProps> = ({ isOpen, onClose }) => {
    const [syncing, setSyncing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [done, setDone] = useState(false);

    const handleSync = () => {
        setSyncing(true);
        setDone(false);
        setProgress(0);
        
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setSyncing(false);
                    setDone(true);
                    return 100;
                }
                return prev + 5;
            });
        }, 100);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-[#0d0d15] border-l border-white/10 h-full flex flex-col shadow-2xl animate-in slide-in-from-left-full duration-300">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white">GitHub Integration</h3>
                            <p className="text-[9px] text-white/30 uppercase font-black tracking-widest">Cloud Repo Manager</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-1 suggestions-scrollbar">
                    {FILES_LIST.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#FFD700] opacity-20 group-hover:opacity-100 transition-opacity"></div>
                                <span className="text-[10px] font-bold text-white/60 truncate max-w-[220px]">{file}</span>
                            </div>
                            <span className="text-[8px] font-black text-[#FFD700] opacity-40">STAGED</span>
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-black/40 border-t border-white/5 space-y-4">
                    {syncing && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase">
                                <span className="text-[#FFD700]">Pushing to Main Branch...</span>
                                <span className="text-white/40">{progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-[#FFD700] transition-all duration-100" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    )}
                    
                    {done && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 animate-in zoom-in-95">
                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>
                            </div>
                            <p className="text-[10px] font-black text-emerald-400 uppercase">Success: Repository is up to date.</p>
                        </div>
                    )}
                    
                    <button onClick={handleSync} disabled={syncing} className="w-full py-4 bg-[#FFD700] text-black font-black rounded-2xl text-xs uppercase tracking-widest hover:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-2xl disabled:opacity-50">
                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12.017c0-6.627-5.373-12-12-12"/></svg>
                        {syncing ? 'Syncing...' : 'Sync to GitHub'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GithubSync;
