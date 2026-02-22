
import React, { useEffect, useCallback, useState } from 'react';
import { CreatorStudioProject, ImageFile } from '../types';
import { generateImage, enhancePrompt } from '../services/geminiService';
import { resizeImage } from '../utils';
import { deductCredits, CREDIT_COSTS, saveGeneratedAsset } from '../lib/supabase';
import CustomizationPanel from './CustomizationPanel';
import ImageWorkspace from './ImageWorkspace';
import PromptEditor from './PromptEditor';
import HistoryPanel from './HistoryPanel';
import ResultDisplay from './ResultDisplay';

interface CreatorStudioProps {
  project: CreatorStudioProject;
  setProject: React.Dispatch<React.SetStateAction<CreatorStudioProject>>;
  userId?: string;
  refreshCredits?: () => void;
}

const MagicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 11-2 0V6H3a1 1 0 110-2h1V3a1 1 0 011-1zm12 10a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1zM10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm0 14a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM4.156 5.156a1 1 0 011.414-1.414l.707.707a1 1 0 01-1.414 1.414l-.707-.707zm11.314 11.314a1 1 0 011.414-1.414l.707.707a1 1 0 01-1.414 1.414l-.707-.707zm-8.485 2.122a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 011.414-1.414l.707.707zM15.844 5.156a1 1 0 011.414 1.414l-.707-.707a1 1 0 01-1.414-1.414l.707-.707z" clipRule="evenodd" />
    </svg>
);

const CreatorStudio: React.FC<CreatorStudioProps> = ({ project, setProject, userId, refreshCredits }) => {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleMagicEnhance = async () => {
    if (!project.prompt) return;
    setIsEnhancing(true);
    try {
        const proPrompt = await enhancePrompt(project.prompt);
        setProject(p => ({ ...p, prompt: proPrompt }));
    } catch (err: any) {
        setProject(p => ({ ...p, error: "فشل تحسين الوصف" }));
    } finally {
        setIsEnhancing(false);
    }
  };
  
  const handleGenerate = useCallback(async () => {
    if (!project.prompt || !userId) return;

    setProject(p => ({ ...p, isLoading: true, error: null }));
    try {
      const deducted = await deductCredits(userId, CREDIT_COSTS.IMAGE_PRO);
      
      if (deducted) {
        const result = await generateImage(project.productImages, project.prompt, project.styleImages);
        
        await saveGeneratedAsset(userId, 'CREATOR_IMAGE', { 
            image: result, 
            prompt: project.prompt 
        }, { 
            lighting: project.options.lightingStyle, 
            angle: project.options.cameraPerspective 
        });

        setProject(p => ({ 
            ...p, 
            generatedImage: result, 
            history: [{ image: result, prompt: project.prompt }, ...p.history] 
        }));
        
        if (refreshCredits) refreshCredits();
      } else {
        setProject(p => ({ ...p, error: 'عذراً، رصيدك غير كافٍ (تحتاج 10 نقاط).' }));
      }
    } catch (err: any) {
        setProject(p => ({ ...p, error: "حدث خطأ أثناء الرندرة: " + err.message }));
    } finally {
      setProject(p => ({ ...p, isLoading: false }));
    }
  }, [project, userId, refreshCredits, setProject]);

  const handleFileUpload = (target: 'product' | 'style') => async (files: File[]) => {
      if (!files.length) return;
      setProject(p => ({ ...p, uploadingTarget: target, error: null }));
      try {
          const resized = await resizeImage(files[0], 1024, 1024);
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64 = (reader.result as string).split(',')[1];
              const imgObj = { base64, mimeType: resized.type, name: resized.name };
              setProject(p => ({ ...p, [target === 'product' ? 'productImages' : 'styleImages']: [imgObj], uploadingTarget: null }));
          };
          reader.readAsDataURL(resized);
      } catch { 
          setProject(p => ({ ...p, uploadingTarget: null, error: "فشل رفع الصورة" })); 
      }
  };

  return (
    <main className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10 pt-4 pb-12 items-start text-right" dir="rtl">
        <div className="flex flex-col gap-8 animate-in slide-in-from-right-5 duration-500">
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 shadow-sm">
                    <h3 className="text-[10px] font-black text-[#FFD700] uppercase text-center mb-4 tracking-[0.2em]">صورة المنتج</h3>
                    <ImageWorkspace id="cr-prod" images={project.productImages} onImagesUpload={handleFileUpload('product')} onImageRemove={() => setProject(p => ({ ...p, productImages: [] }))} isUploading={project.uploadingTarget === 'product'} />
                </div>
                <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 shadow-sm">
                    <h3 className="text-[10px] font-black text-yellow-500 uppercase text-center mb-4 tracking-[0.2em]">النمط المرجعي</h3>
                    <ImageWorkspace id="cr-style" title="Style" images={project.styleImages} onImagesUpload={handleFileUpload('style')} onImageRemove={() => setProject(p => ({ ...p, styleImages: [] }))} isUploading={project.uploadingTarget === 'style'} />
                </div>
            </div>

            <CustomizationPanel options={project.options} setOptions={(opt) => setProject(p => ({ ...p, options: opt }))} />

            <div className="relative">
                <PromptEditor
                    prompt={project.prompt}
                    setPrompt={(val) => setProject(p => ({ ...p, prompt: val, isPromptAutoGenerated: false }))}
                    isAutoGenerated={project.isPromptAutoGenerated}
                    onResetPrompt={() => setProject(p => ({ ...p, isPromptAutoGenerated: !p.isPromptAutoGenerated }))}
                    onApplyVisionMode={() => {}} // المنطق الآن داخلي في PromptEditor
                />
                <button 
                    onClick={handleMagicEnhance}
                    disabled={isEnhancing || !project.prompt}
                    className="absolute bottom-6 left-6 flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black rounded-2xl shadow-2xl transition-all active:scale-95 disabled:opacity-50"
                >
                    {isEnhancing ? <div className="w-3 h-3 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : <MagicIcon />}
                    تحسين احترافي
                </button>
            </div>

            <button onClick={handleGenerate} disabled={project.isLoading || !project.prompt} className="w-full h-24 bg-[#FFD700] hover:bg-yellow-400 text-black font-black py-5 rounded-[2.5rem] text-xl shadow-[0_20px_50px_rgba(255,215,0,0.2)] transition-all active:scale-95">
                {project.isLoading ? 'جاري الرندرة الفائقة...' : `توليد المشهد الإبداعي (10 نقاط)`}
            </button>
            
            {project.error && (
                <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-[1.5rem]">
                    <p className="text-red-400 text-center font-bold text-xs">{project.error}</p>
                </div>
            )}
        </div>

        <div className="flex flex-col gap-10 animate-in slide-in-from-left-5 duration-500">
             <div className="bg-black/40 rounded-[3rem] p-8 min-h-[500px] border border-white/5 shadow-inner relative overflow-hidden flex items-center justify-center">
                <ResultDisplay imageFile={project.generatedImage} isLoading={project.isLoading} />
             </div>
            <HistoryPanel history={project.history} onSelect={(img) => setProject(p => ({ ...p, generatedImage: img }))} />
        </div>
    </main>
  );
};

export default CreatorStudio;
