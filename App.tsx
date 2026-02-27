
import React, { useState, useEffect } from 'react';
import {
  AppView,
  MasterFactoryProject,
  BrandKit,
  PlanStudioProject,
  PhotoshootDirectorProject,
  MarketingStudioProject,
  DailyPackProject,
  TrendEngineProject,
  PowerStudioProject,
  UGCStudioProject,
  PerformanceStudioProject,
  EliteScriptProject,
  StoryboardStudioProject,
  VoiceOverStudioProject
} from './types';
import { supabase } from './lib/supabase';

// Components
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import BrandKitManager from './components/BrandKitManager';
import PhotoshootDirector from './components/PhotoshootDirector';
import VideoStudio from './components/VideoStudio';
import PlanStudio from './components/PlanStudio';
import MarketingStudio from './components/MarketingStudio';
import AdContentFactory from './components/AdContentFactory';
import PricingModal from './components/PricingModal';
import ChatWidget from './components/ChatWidget';
import WhatsAppButton from './components/WhatsAppButton';
import Footer from './components/Footer';
import FAQ from './components/FAQ';
import LegalPages from './components/LegalPages';
import AdsStudio from './components/AdsStudio';
import DailyPackStudio from './components/DailyPackStudio';
import TrendEngine from './components/TrendEngine';
import PowerStudio from './components/PowerStudio';
import { UGCStudio } from './components/UGCStudio';
import AdminDashboard from './components/AdminDashboard';
import { ContentLibrary } from './components/ContentLibrary';
import StoryboardStudio from './components/StoryboardStudio';
import VoiceOverStudio from './components/VoiceOverStudio';
import ImageEditorModal from './components/ImageEditorModal';
import DynamicAdsStudio from './components/DynamicAdsStudio';
import { ImageFile, DynamicAdsStudioProject } from './types';

import { ProductIntelligenceProvider } from './context/ProductIntelligenceContext';
import MarketIntelligenceHub from './features/hubs/MarketIntelligenceHub';
import CampaignBuilderHub from './features/hubs/CampaignBuilderHub';
import CreativeStudioHub from './features/hubs/CreativeStudioHub';
import LaunchBriefHub from './features/hubs/LaunchBriefHub';
import ProductionFactoryHub from './features/hubs/ProductionFactoryHub';
import ProModeDashboard from './features/promode/ProModeDashboard';
import OnboardingModal, { shouldShowOnboarding } from './components/OnboardingModal';

const LOGO_IMAGE_URL = "https://i.ibb.co/MDrpHPzS/Artboard-1.png";

export default function App() {
  const [view, setView] = useState<AppView>('landing');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeScriptContext, setActiveScriptContext] = useState('');
  const [globalEditingImage, setGlobalEditingImage] = useState<ImageFile | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Global Image Editor Listener
    const handleOpenEditor = (e: Event) => {
      const customEvent = e as CustomEvent<ImageFile>;
      setGlobalEditingImage(customEvent.detail);
    };
    window.addEventListener('openImageEditor', handleOpenEditor);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('openImageEditor', handleOpenEditor);
    };
  }, []);

  const userId = session?.user?.id || (isGuest ? 'guest' : null);

  const [brandKit, setBrandKit] = useState<BrandKit>({
    logo: null, colors: ['#FFD700', '#000000'], brandName: '', industry: ''
  });

  const [masterFactory, setMasterFactory] = useState<MasterFactoryProject>({
    id: 'factory-1', name: 'Creative Factory', activeMode: 'guided', messages: [], step: 1, currentTone: 'CLASSIC', productInfo: { product: '', target: '', goals: '' }, topicIdeas: [], rawInput: '', finalScript: null, isGenerating: false, error: null
  });

  const [photoshootProject, setPhotoshootProject] = useState<PhotoshootDirectorProject>({
    id: 'ps-1', name: 'جلسة تصوير', productImages: [], selectedShotTypes: [], customStylePrompt: '', isGenerating: false, error: null, results: []
  });

  const [marketingProject, setMarketingProject] = useState<MarketingStudioProject>({
    id: 'mkt-1', name: 'استراتيجية النمو', brandType: 'new', brandName: '', specialty: '', brief: '', websiteLink: '', language: 'ar', isGenerating: false, result: null, error: null
  });

  const [planStudio, setPlanStudio] = useState<PlanStudioProject>({ id: 'plan-v1', name: 'خطة المحتوى', productImages: [], prompt: '', targetMarket: 'السعودية', dialect: 'لهجة سعودية', ideas: [], categoryAnalysis: null, isGeneratingPlan: false, isAnalyzingCategory: false, isUploading: false, error: null });

  const [ugcProject, setUgcProject] = useState<UGCStudioProject>({
    id: 'ugc-1', name: 'UGC Content', productImages: [], selectedScenarios: [], isUploading: false, isGenerating: false, results: [], error: null
  });

  const [performanceProject, setPerformanceProject] = useState<PerformanceStudioProject>({
    id: 'perf-1',
    name: 'Performance Pack',
    targetMarket: 'Egypt',
    campaignGoal: 'Sales',
    dialect: 'Egyptian Arabic',
    platform: 'Facebook',
    productDescription: '',
    sellingPrice: '',
    brandTone: 'Bold',
    referenceImage: null,
    isGenerating: false,
    isGeneratingFull: false,
    result: null,
    fullCampaign: null,
    error: null
  });

  const [dailyPack, setDailyPack] = useState<DailyPackProject>({
    id: 'dp-1', name: 'Daily Pack', productImages: [], description: '', tone: 'عفوي وجذاب', isGenerating: false, progress: 0, result: null
  });

  const [trendEngine, setTrendEngine] = useState<TrendEngineProject>({
    id: 'trend-1', name: 'Trend Engine', region: 'مصر', niche: '', isGenerating: false, error: null, results: []
  });

  const [powerStudio, setPowerStudio] = useState<PowerStudioProject>({
    id: 'power-1', name: 'Power Studio', brandName: '', productCategory: '', productDescription: '', productImages: [], goal: '', targetMarket: 'مصر', dialect: 'لهجة مصرية', isGenerating: false, progress: 0, currentStep: '', result: null, error: null
  });

  const [storyboardProject, setStoryboardProject] = useState<StoryboardStudioProject>({
    id: 'story-1', name: 'Storyboard Studio', subjectImages: [], customInstructions: '', isUploading: false, isGeneratingPlan: false, error: null, scenes: [], gridImage: null, aspectRatio: '9:16'
  });

  const [voiceOverProject, setVoiceOverProject] = useState<VoiceOverStudioProject>({
    id: 'vo-1', name: 'استوديو التعليق الصوتي', text: '', styleInstructions: '', selectedVoice: 'shaker', isLoading: false, isPlaying: false, error: null, generatedAudio: null, history: []
  });

  const [dynamicAdsProject, setDynamicAdsProject] = useState<DynamicAdsStudioProject>({
    id: 'dyn-1', name: 'قوالب ديناميكية', productImages: [], selectedStyleId: null, variableValues: {}, isGenerating: false, isUploading: false, error: null, results: [], autoFillDescription: '', isAutoFilling: false
  });

  const bridgeToPlan = (context: string) => { setPlanStudio(prev => ({ ...prev, prompt: context })); setView('plan_studio'); };
  const bridgeToVideo = (script: string) => { setActiveScriptContext(script); setView('video_studio'); };
  const bridgeToPhotoshoot = (context: string) => { setPhotoshootProject(prev => ({ ...prev, customStylePrompt: context })); setView('photoshoot'); };

  const hubs = [
    {
      id: 'campaign_builder_hub',
      title: 'محرك الإعلانات الفائق',
      level: '⚡ الأداء العالي',
      desc: 'حوّل منتجك إلى 5 إعلانات أداء جاهزين للاختبار بضغطة زر واحدة.',
      icon: '🔥',
      color: 'from-orange-500 to-red-600',
      tools: [
        { id: 'campaign_builder_hub', label: '🚀 طلع إعلاناتي دلوقتي', icon: '⚡' }
      ]
    }
  ];

  // Show onboarding for first-time users when they log in
  useEffect(() => {
    if (userId && shouldShowOnboarding()) {
      setShowOnboarding(true);
    }
  }, [userId]);

  // If the user is on the dashboard, we actually want to push them directly into the Pro Mode flow
  useEffect(() => {
    if (view === 'dashboard' || view === 'campaign_builder_hub') {
      setView('pro_mode');
    }
  }, [view]);

  return (
    <ProductIntelligenceProvider>
      <div className="min-h-screen w-full flex flex-col items-center bg-black text-white font-sans overflow-x-hidden selection:bg-orange-500/30">
        {/* Onboarding overlay — shows once for first-time users */}
        {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}

        <nav className="sticky top-0 z-[100] w-full backdrop-blur-xl bg-black/80 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { setView('campaign_builder_hub'); setIsMenuOpen(false); }}>
              <img src={LOGO_IMAGE_URL} alt="Ebdaa Pro" className="h-10 w-auto group-hover:scale-110 transition-transform" />
              <span className="text-xl font-black text-white tracking-tighter uppercase">إبداع <span className="text-orange-500">برو</span></span>
            </div>

            {view !== 'landing' && userId && (
              <>
                <div className="hidden md:flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
                  <button onClick={() => setView('pro_mode')} className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all flex items-center gap-1 ${view === 'pro_mode' ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10'}`}>🤖 الوضع الاحترافي (Pro Mode)</button>
                  <button onClick={() => setView('ugc_studio')} className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all ${view === 'ugc_studio' ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'text-slate-400 hover:text-white'}`}>📸 التصوير و UGC</button>
                  <button onClick={() => setView('brand_kit')} className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all ${view === 'brand_kit' ? 'bg-orange-500 text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}>🎨 هويتي</button>
                  <button onClick={() => setView('content_library')} className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all ${view === 'content_library' ? 'bg-orange-500 text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}>📚 الإعلانات المحفوظة</button>
                  <button onClick={() => setView('admin')} className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all ${view === 'admin' ? 'bg-orange-500 text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}>⚙️ الإدارة</button>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2 text-white hover:text-orange-500 transition-colors"
                >
                  <span className="text-2xl">{isMenuOpen ? '✕' : '☰'}</span>
                </button>
              </>
            )}

            {view !== 'landing' && userId && (
              <div className="hidden md:flex items-center gap-4">
                <button onClick={() => setIsPricingOpen(true)} className="bg-orange-500 text-black px-6 py-2.5 rounded-xl text-[11px] font-black shadow-xl hover:scale-105 transition-all">شحن رصيد</button>
                <button onClick={() => supabase.auth.signOut()} className="bg-white/5 text-white/40 px-4 py-2.5 rounded-xl text-[11px] font-black hover:bg-red-500/10 hover:text-red-500 transition-all">خروج</button>
              </div>
            )}
          </div>

          {/* Mobile Menu Overlay */}
          {isMenuOpen && view !== 'landing' && userId && (
            <div className="md:hidden bg-black/95 border-b border-white/5 p-6 animate-in slide-in-from-top duration-300">
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => { setView('pro_mode'); setIsMenuOpen(false); }}
                  className={`w-full p-4 rounded-2xl text-right font-black flex items-center justify-between ${view === 'pro_mode' ? 'bg-purple-600 text-white' : 'bg-purple-900/10 text-purple-400 border border-purple-500/20'}`}
                >
                  <span>🤖 الوضع الاحترافي (Pro Mode)</span>
                  <span className="text-[10px] bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">جديد</span>
                </button>
                <button
                  onClick={() => { setView('brand_kit'); setIsMenuOpen(false); }}
                  className={`w-full p-4 rounded-2xl text-right font-black ${view === 'brand_kit' ? 'bg-orange-500 text-black' : 'bg-white/5 text-white'}`}
                >
                  🎨 هويتي
                </button>
                <button
                  onClick={() => { setView('ugc_studio'); setIsMenuOpen(false); }}
                  className={`w-full p-4 rounded-2xl text-right font-black ${view === 'ugc_studio' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-white'}`}
                >
                  📸 التصوير و الـ UGC
                </button>
                <button
                  onClick={() => { setView('content_library'); setIsMenuOpen(false); }}
                  className={`w-full p-4 rounded-2xl text-right font-black ${view === 'content_library' ? 'bg-orange-500 text-black' : 'bg-white/5 text-white'}`}
                >
                  📚 الإعلانات المحفوظة
                </button>
                <button
                  onClick={() => { setView('admin'); setIsMenuOpen(false); }}
                  className={`w-full p-4 rounded-2xl text-right font-black ${view === 'admin' ? 'bg-orange-500 text-black' : 'bg-white/5 text-white'}`}
                >
                  ⚙️ الإدارة
                </button>
                <button
                  onClick={() => { setIsPricingOpen(true); setIsMenuOpen(false); }}
                  className="w-full p-4 bg-orange-500 text-black rounded-2xl text-right font-black"
                >
                  💰 شحن رصيد
                </button>
                <button
                  onClick={() => { supabase.auth.signOut(); setIsMenuOpen(false); }}
                  className="w-full p-4 bg-red-500/10 text-red-500 rounded-2xl text-right font-black"
                >
                  🚪 تسجيل الخروج
                </button>
              </div>
            </div>
          )}
        </nav>

        <div className="w-full max-w-7xl flex-grow p-6 z-10 pt-10">
          {view === 'landing' && <LandingPage onGetStarted={() => { setView('pro_mode'); setIsGuest(true); }} />}

          {view !== 'landing' && !userId && <Auth onGuestLogin={() => setIsGuest(true)} />}

          {/* Core App Flow -> Immediately renders the Performance Panel via CampaignBuilderHub */}
          {view === 'campaign_builder_hub' && userId && (
            <CampaignBuilderHub
              setView={setView}
              userId={userId}
              performanceProject={performanceProject} setPerformanceProject={setPerformanceProject}
              powerProject={powerStudio} setPowerProject={setPowerStudio}
              planProject={planStudio} setPlanProject={setPlanStudio}
              bridgeToVideo={bridgeToVideo} bridgeToPhotoshoot={bridgeToPhotoshoot}
            />
          )}

          {/* Keep legacy routes available but hidden from main navigation */}
          {view === 'brand_kit' && userId && <BrandKitManager userId={userId} onBack={() => setView('pro_mode')} />}
          {view === 'faq' && userId && <FAQ onBack={() => setView('pro_mode')} />}
          {view === 'privacy_policy' && userId && <LegalPages type="privacy" onBack={() => setView('pro_mode')} />}
          {view === 'terms_of_service' && userId && <LegalPages type="terms" onBack={() => setView('pro_mode')} />}
          {view === 'content_library' && userId && <ContentLibrary userId={userId} />}
          {view === 'admin' && userId && <AdminDashboard />}
          {view === 'dynamic_ads' && userId && <DynamicAdsStudio project={dynamicAdsProject} setProject={setDynamicAdsProject} userId={userId} />}
          {view === 'ugc_studio' && userId && <UGCStudio />}
          {view === 'pro_mode' && userId && <ProModeDashboard />}
        </div>

        <Footer onNavigate={setView} onOpenPricing={() => setIsPricingOpen(true)} />
        <ChatWidget />
        <WhatsAppButton />
        {isPricingOpen && userId && <PricingModal userId={userId} onClose={() => setIsPricingOpen(false)} />}
        {globalEditingImage && <ImageEditorModal image={globalEditingImage} onClose={() => setGlobalEditingImage(null)} />}
      </div>
    </ProductIntelligenceProvider>
  );
}
