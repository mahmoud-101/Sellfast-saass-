import React, { useState, useEffect, useCallback } from 'react';
import { 
  AppView, 
  PowerStudioProject, 
  UGCStudioProject, 
  VoiceOverStudioProject, 
  PromptStudioProject,
  VideoStudioProject,
  CampaignStudioProject,
  ControllerStudioProject,
  BrandingStudioProject,
  ProjectBase,
  ImageFile
} from './types';
import { supabase, getUserCredits } from './lib/supabase';
import UGCStudio from './components/UGCStudio';
import VoiceOverStudio from './components/VoiceOverStudio';
import PromptStudio from './components/PromptStudio';
import VideoStudio from './components/VideoStudio';
import ThemeSwitcher from './components/ThemeSwitcher';
import CreditsDisplay from './components/CreditsDisplay';
import TabBar from './components/TabBar';

// Initial States
const initialUGC: UGCStudioProject = {
    id: 'demo-ugc', name: 'UGC Studio', productImages: [], selectedScenarios: [], results: [],
    isGenerating: false, error: null
};

const initialVoice: VoiceOverStudioProject = {
    id: 'demo-voice', name: 'Voice Studio', text: '', styleInstructions: '', selectedVoice: 'ar-SA-Standard-A',
    voiceGenderFilter: 'All', generatedAudio: null, history: [], isLoading: false, isPlaying: false,
    previewLoadingVoice: null, previewPlayingVoice: null, error: null
};

const initialPrompt: PromptStudioProject = {
    id: 'demo-prompt', name: 'Prompt Studio', images: [], instructions: '', generatedPrompt: null,
    history: [], isLoading: false, isUploading: false, error: null
};

const initialVideo: VideoStudioProject = { // Note: VideoStudio uses internal state mostly, this is a placeholder if we expand
    id: 'demo-video', name: 'Video Studio', prompt: '', isGenerating: false, videoUrl: null,
    progress: 0, statusText: '', error: null
};

const App = () => {
  const [view, setView] = useState<AppView>('suite_view');
  const [user, setUser] = useState({ id: 'demo-user', email: 'demo@ebdaapro.com' });
  const [credits, setCredits] = useState(999);
  const [theme, setTheme] = useState('dark');
  
  // Project State
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [projects, setProjects] = useState<ProjectBase[]>([
    { id: 'p1', name: 'UGC Studio' },
    { id: 'p2', name: 'Voice Studio' },
    { id: 'p3', name: 'Prompt Studio' },
    { id: 'p4', name: 'Video Studio' }
  ]);

  // Detailed Project States
  const [ugcProject, setUGCProject] = useState<UGCStudioProject>(initialUGC);
  const [voiceProject, setVoiceProject] = useState<VoiceOverStudioProject>(initialVoice);
  const [promptProject, setPromptProject] = useState<PromptStudioProject>(initialPrompt);

  const refreshCredits = async () => {
    if (user?.id) {
        const c = await getUserCredits(user.id);
        if (c !== null) setCredits(c);
    }
  };

  useEffect(() => {
    refreshCredits();
    // Refresh credits every 30 seconds
    const interval = setInterval(refreshCredits, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const renderActiveStudio = () => {
      const activeProject = projects[activeProjectIndex];
      
      switch (activeProject.name) {
          case 'UGC Studio':
              return <UGCStudio project={ugcProject} setProject={setUGCProject} userId={user.id} refreshCredits={refreshCredits} />;
          case 'Voice Studio':
              return <VoiceOverStudio project={voiceProject} setProject={setVoiceProject} userId={user.id} refreshCredits={refreshCredits} />;
          case 'Prompt Studio':
              return <PromptStudio project={promptProject} setProject={setPromptProject} />;
          case 'Video Studio':
              return <VideoStudio userId={user.id} refreshCredits={refreshCredits} />;
          default:
              return <div className="text-white text-center p-20">Select a studio to begin</div>;
      }
  };

  const handleAddTab = () => {
      // Logic to add new tabs could go here
      alert("New project creation would go here in full version");
  };

  const handleCloseTab = (index: number) => {
      if (projects.length <= 1) return;
      const newProjects = projects.filter((_, i) => i !== index);
      setProjects(newProjects);
      if (activeProjectIndex >= index && activeProjectIndex > 0) {
          setActiveProjectIndex(activeProjectIndex - 1);
      }
  };

  return (
    <div className={`min-h-screen bg-[rgb(var(--color-background-base-rgb))] text-[var(--color-text-base)] ${theme} font-tajawal`}>
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20">EB</div>
                <h1 className="text-xl font-bold tracking-tight text-white hidden sm:block">Ebdaa Pro <span className="opacity-50 font-normal">Intelligence</span></h1>
            </div>
            
            <div className="flex items-center gap-4">
                <CreditsDisplay credits={credits} />
                <ThemeSwitcher theme={theme} setTheme={setTheme} />
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white/10 shadow-xl"></div>
            </div>
        </header>

        {/* Main Content */}
        <div className="pt-24 px-4 pb-20 max-w-7xl mx-auto flex flex-col items-center">
            <TabBar 
                projects={projects} 
                activeProjectIndex={activeProjectIndex} 
                onSelectTab={setActiveProjectIndex}
                onAddTab={handleAddTab}
                onCloseTab={handleCloseTab}
            />
            
            <div className="w-full mt-6 animate-in slide-in-from-bottom-5 duration-500">
                {renderActiveStudio()}
            </div>
        </div>
    </div>
  );
};

export default App;
