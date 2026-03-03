
import React, { useCallback } from 'react';
import { ImageFile, ShotType, PhotoshootDirectorProject, PhotoshootResult } from '../types';
import { resizeImage } from '../utils';
import { compressImageFile } from '../utils/imageCompressor';
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

  const handleUpdateResult = (index: number, updated: Partial<PhotoshootResult>) => {
    setProject(s => ({
      ...s,
      results: s.results.map((res, i) => i === index ? { ...res, ...updated } : res)
    }));
  };

  const onGenerate = useCallback(async () => {
    if (!project || project.productImages.length === 0 || project.selectedShotTypes.length === 0 || !userId) {
      if (userId !== 'guest') {
        setProject(s => ({ ...s, error: 'ارفع صورة المنتج واختر نوعاً واحداً من اللقطات على الأقل.' }));
        return;
      }
    }

    const totalCost = project.selectedShotTypes.length * CREDIT_COSTS.IMAGE_BASIC;
    setProject(s => ({ ...s, isGenerating: true, error: null }));

    const deducted = await deductCredits(userId, totalCost);
    if (!deducted) {
      setProject(s => ({ ...s, isGenerating: false, error: `رصيد غير كافٍ.` }));
      return;
    }

    // تهيئة النتائج
    setProject(s => ({
      ...s,
      results: s.selectedShotTypes.map(shotType => ({
        shotType,
        image: null,
        isLoading: true,
        error: null,
        isEditing: false,
      })),
    }));

    // تنفيذ التوليد بشكل متسلسل لتجنب تجاوز حدود المعدل (Rate Limits)
    for (let i = 0; i < project.selectedShotTypes.length; i++) {
      const shotType = project.selectedShotTypes[i];
      const textProtection = "STRICTLY PRESERVE all original branding, logos, and text from the product image. NO EXTRA text.";
      let prompt = `MASTER PROMPT: Professional product photo of the item in Image 1.
      SHOT TYPE: ${shotType}.
      STYLE: High-end commercial photography, photorealistic, 8k, hyperrealistic, sharp focus, detailed texture, studio lighting, editorial quality.
      ${textProtection}`;
      if (project.customStylePrompt) prompt += ` ADDITIONAL STYLE: ${project.customStylePrompt}`;

      try {
        // إضافة تأخير بسيط بين الطلبات (1.5 ثانية)
        if (i > 0) await new Promise(resolve => setTimeout(resolve, 1500));

        const image = await generateImage(project.productImages, prompt, null);
        setProject(s => ({
          ...s,
          results: s.results.map(r => r.shotType === shotType ? { ...r, image, isLoading: false } : r)
        }));
      } catch (error: any) {
        setProject(s => ({
          ...s,
          results: s.results.map(r => r.shotType === shotType ? { ...r, error: 'تجاوزت حد جوجل المجاني، حاول مرة أخرى لاحقاً.', isLoading: false } : r)
        }));
      }
    }

    setProject(s => ({ ...s, isGenerating: false }));
    if (refreshCredits) refreshCredits();
  }, [project, setProject, userId, refreshCredits]);

  return (
    <main className="w-full flex flex-col gap-10 pt-4 pb-12 animate-in fade-in duration-500 text-right" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/5 rounded-[2rem] p-8 border border-white/10 shadow-sm">
            <h3 className="text-lg font-black text-white mb-6">1. ارفع صورة المنتج</h3>
            <ImageWorkspace id="ps-up" title="ارفع صورة واضحة" images={project.productImages} onImagesUpload={async (f) => {
              if (!f || f.length === 0) return;
              try {
                const compressed = await compressImageFile(f[0]);
                setProject(s => ({ ...s, productImages: [...s.productImages, { base64: compressed.base64, mimeType: compressed.mimeType, name: f[0].name }] }));
              } catch {
                const r = new FileReader();
                r.onload = () => setProject(s => ({ ...s, productImages: [...s.productImages, { base64: (r.result as string).split(',')[1], mimeType: f[0].type, name: f[0].name }] }));
                r.readAsDataURL(f[0]);
              }
            }} onImageRemove={(i) => setProject(s => ({ ...s, productImages: s.productImages.filter((_, idx) => idx !== i) }))} isUploading={false} />
          </div>

          <ShotTypeSelector selected={project.selectedShotTypes} onChange={(selected) => setProject(s => ({ ...s, selectedShotTypes: selected }))} customStylePrompt={project.customStylePrompt} onCustomStylePromptChange={(prompt) => setProject(s => ({ ...s, customStylePrompt: prompt }))} />

          <button onClick={onGenerate} disabled={project.isGenerating || project.productImages.length === 0 || project.selectedShotTypes.length === 0} className="w-full h-20 bg-[#FFD700] text-black font-black rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-30 hover:bg-yellow-400">
            {project.isGenerating ? 'جاري الرندرة المتسلسلة...' : `بدء التصوير (${project.selectedShotTypes.length * 5} نقطة)`}
          </button>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white/5 rounded-[2.5rem] p-10 border border-white/10 min-h-[600px] shadow-sm">
            <div className="flex items-center gap-3 mb-10 flex-row-reverse border-b border-white/5 pb-6">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-[#FFD700]">📸</div>
              <h3 className="text-2xl font-black text-white">معرض النتائج الاحترافية</h3>
            </div>
            <ResultsGrid results={project.results} onUpdateResult={handleUpdateResult} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default PhotoshootDirector;
