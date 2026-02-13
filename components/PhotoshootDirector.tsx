
import React, { useCallback } from 'react';
import { ImageFile, ShotType, PhotoshootDirectorProject } from '../types';
import { resizeImage } from '../utils';
import { generateImage, editImage } from '../services/geminiService';
import { deductCredits, CREDIT_COSTS } from '../lib/supabase';
import ImageWorkspace from './ImageWorkspace';
import ShotTypeSelector from './ShotTypeSelector';
import ResultsGrid from './ResultsGrid';

interface PhotoshootDirectorProps {
  project: PhotoshootDirectorProject;
  setProject: React.Dispatch<React.SetStateAction<PhotoshootDirectorProject>>;
  userId?: string;
  refreshCredits?: () => void;
}

const PhotoshootDirector: React.FC<PhotoshootDirectorProps> = ({ project, setProject, userId, refreshCredits }) => {

    const onGenerate = useCallback(async () => {
    if (!project || project.productImages.length === 0 || project.selectedShotTypes.length === 0 || !userId) {
      setProject(s => ({ ...s, error: 'فضلاً ارفع صورة المنتج واختر نوعاً واحداً من اللقطات على الأقل.' }));
      return;
    }

    const totalCost = project.selectedShotTypes.length * CREDIT_COSTS.IMAGE_BASIC;
    setProject(s => ({ ...s, isGenerating: true, error: null }));

    const deducted = await deductCredits(userId, totalCost);
    if (!deducted) {
        setProject(s => ({ ...s, isGenerating: false, error: `رصيدك غير كافٍ. تحتاج إلى ${totalCost} نقطة لتوليد هذه اللقطات.` }));
        return;
    }

    setProject(s => ({
      ...s,
      results: s.selectedShotTypes.map(shotType => ({
        shotType,
        image: null,
        isLoading: true,
        error: null,
        editPrompt: '',
        isEditing: false,
      })),
    }));

    const generationPromises = project.selectedShotTypes.map(async (shotType) => {
      const textProtection = "STRICTLY PRESERVE all original text, labels, and branding on the product. DO NOT erase original writing. NO EXTRA generated text in the scene.";
      let prompt = `A high-resolution, professional photograph of the subject from the provided image. The desired shot is: '${shotType}'. The background should be clean, non-distracting, and complementary to the subject. ${textProtection}`;
      
      if (project.customStylePrompt) {
        prompt += ` Additional style requirements: ${project.customStylePrompt}`;
      }

      try {
        const image = await generateImage(project.productImages, prompt, null);
        return { status: 'fulfilled' as const, value: { shotType, image } };
      } catch (error: any) {
        return { status: 'rejected' as const, reason: { shotType, error } };
      }
    });

    const settledResults = await Promise.all(generationPromises);

    settledResults.forEach(result => {
      if (result.status === 'fulfilled') {
        const { shotType, image } = result.value;
        setProject(s => ({
          ...s,
          results: s.results.map(r => r.shotType === shotType ? { ...r, image, isLoading: false } : r),
        }));
      } else {
        const { shotType, error } = result.reason;
        setProject(s => ({
          ...s,
          results: s.results.map(r => r.shotType === shotType ? { ...r, error: error.message || 'Generation failed', isLoading: false } : r),
        }));
      }
    });
    
    setProject(s => ({ ...s, isGenerating: false }));
    if (refreshCredits) refreshCredits();
  }, [project, setProject, userId, refreshCredits]);

  const handleEditResult = async (index: number, prompt: string) => {
      const result = project.results[index];
      if (!result || !result.image || !userId) return;

      const deducted = await deductCredits(userId, CREDIT_COSTS.IMAGE_BASIC);
      if (!deducted) return;

      setProject(s => {
          const newResults = [...s.results];
          newResults[index] = { ...newResults[index], isEditing: true, error: null };
          return { ...s, results: newResults };
      });

      try {
          const updated = await editImage(result.image, prompt);
          setProject(s => {
              const newResults = [...s.results];
              newResults[index] = { ...newResults[index], image: updated, isEditing: false };
              return { ...s, results: newResults };
          });
          if (refreshCredits) refreshCredits();
      } catch (err) {
          setProject(s => {
              const newResults = [...s.results];
              newResults[index] = { ...newResults[index], isEditing: false, error: err instanceof Error ? err.message : 'Edit failed' };
              return { ...s, results: newResults };
          });
      }
  };

  const handleFileUpload = async (files: File[]) => {
    if (!files || files.length === 0) return;
    setProject(s => ({ ...s, isUploading: true, error: null }));
    const results = await Promise.all(files.map(file => {
      return new Promise<ImageFile | null>(async (resolve) => {
        try {
          const resizedFile = await resizeImage(file, 2048, 2048);
          const reader = new FileReader();
          reader.onloadend = () => resolve({ base64: (reader.result as string).split(',')[1], mimeType: resizedFile.type, name: resizedFile.name });
          reader.readAsDataURL(resizedFile);
        } catch (err) { resolve(null); }
      });
    }));
    const validImages = results.filter((img): img is ImageFile => img !== null);
    setProject(s => ({ ...s, productImages: [...s.productImages, ...validImages], isUploading: false }));
  };

  return (
    <main className="w-full flex flex-col gap-4 pt-4 pb-8 text-right">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-grow">
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="glass-card rounded-2xl p-4">
            <h3 className="text-lg font-bold text-white mb-4">1. ارفع صور المنتج</h3>
            <ImageWorkspace id="photoshoot-up" images={project.productImages} onImagesUpload={handleFileUpload} onImageRemove={(i) => setProject(s => ({ ...s, productImages: s.productImages.filter((_, idx) => idx !== i) }))} isUploading={project.isUploading} />
          </div>
          <ShotTypeSelector selected={project.selectedShotTypes} onChange={(selected) => setProject(s => ({ ...s, selectedShotTypes: selected }))} customStylePrompt={project.customStylePrompt} onCustomStylePromptChange={(prompt) => setProject(s => ({...s, customStylePrompt: prompt }))} />
          <div className="w-full px-4 py-2">
            <button onClick={onGenerate} disabled={project.isGenerating || project.isUploading || project.productImages.length === 0 || project.selectedShotTypes.length === 0} className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl transition-all disabled:opacity-30">
                {project.isGenerating ? 'جاري التصوير...' : `توليد ${project.selectedShotTypes.length} لقطات (${project.selectedShotTypes.length * 5} نقطة)`}
            </button>
            {project.error && <p className="text-red-400 text-center font-bold mt-2 text-xs">{project.error}</p>}
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex flex-col flex-grow glass-card rounded-2xl p-4">
              <h3 className="text-lg font-bold text-white mb-4">3. النتائج الاحترافية</h3>
              <ResultsGrid results={project.results} onEditResult={handleEditResult} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default PhotoshootDirector;
