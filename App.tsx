
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
  StoryboardStudioProject
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
import UGCStudio from './components/UGCStudio';
import AdminDashboard from './components/AdminDashboard';
import { ContentLibrary } from './components/ContentLibrary';
import StoryboardStudio from './components/StoryboardStudio';

const LOGO_IMAGE_URL = "https://i.ibb.co/MDrpHPzS/Artboard-1.png";

export default function App() {
  const [view, setView] = useState<AppView>('landing');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeScriptContext, setActiveScriptContext] = useState('');
  const [session, setSession] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
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

  const bridgeToPlan = (context: string) => { setPlanStudio(prev => ({ ...prev, prompt: context })); setView('plan_studio'); };
  const bridgeToVideo = (script: string) => { setActiveScriptContext(script); setView('video_studio'); };
  const bridgeToPhotoshoot = (context: string) => { setPhotoshootProject(prev => ({ ...prev, customStylePrompt: context })); setView('photoshoot'); };

  const hubs = [
    {
      id: 'hub_generate',
      title: 'مصنع المبيعات والمحتوى',
      level: '1',
      desc: 'المصنع المتكامل لصناعة الحملات، السكريبتات، والمحتوى اليومي لتحقيق مبيعات أسرع.',
      icon: '🏭',
      color: 'from-yellow-400 to-yellow-600',
      tools: [
        { id: 'performance_studio', label: 'مصنع الحملات المتكاملة', icon: '🚀' },
        { id: 'daily_pack', label: 'باقة المحتوى اليومي', icon: '📅' },
        { id: 'power', label: 'مُولّد الإعلانات السريعة', icon: '⚡' },
        { id: 'ads_studio', label: 'استوديو الإعلانات', icon: '📢' }
      ]
    },
    {
      id: 'hub_visuals',
      title: 'صناعة المحتوى البصري',
      level: '2',
      desc: 'تحويل الأفكار لجلسات تصوير، ومقاطع، ومحتوى يظهر بشكل احترافي.',
      icon: '📸',
      color: 'from-yellow-500 to-yellow-700',
      tools: [
        { id: 'photoshoot', label: 'جلسات تصوير احترافية', icon: '📸' },
        { id: 'storyboard_studio', label: 'مخرج الريلز والإعلانات', icon: '🎬' },
        { id: 'video_studio', label: 'استوديو تصميم الفيديوهات', icon: '🎥' },
        { id: 'ugc_studio', label: 'صناعة محتوى الـ UGC', icon: '🤩' }
      ]
    },
    {
      id: 'hub_scale',
      title: 'استراتيجيات النمو المستمر',
      level: '3',
      desc: 'رسم استراتيجية النمو، تحليل المنافسين، وركوب التريندات لزيادة الأرباح.',
      icon: '🚀',
      color: 'from-yellow-600 to-yellow-800',
      tools: [
        { id: 'strategy_engine', label: 'استراتيجية النمو السريع', icon: '🎯' },
        { id: 'plan_studio', label: 'خطة المحتوى الذكية', icon: '🗓️' },
        { id: 'trend_engine', label: 'محرك التريندات', icon: '🔥' }
      ]
    },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-black text-white font-sans overflow-x-hidden selection:bg-yellow-500/30">
      <nav className="sticky top-0 z-[100] w-full backdrop-blur-xl bg-black/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { setView('dashboard'); setIsMenuOpen(false); }}>
            <img src={LOGO_IMAGE_URL} alt="Ebdaa Pro" className="h-10 w-auto group-hover:scale-110 transition-transform" />
            <span className="text-xl font-black text-white tracking-tighter uppercase">إبداع <span className="text-[#FFD700]">برو</span></span>
          </div>

          {view !== 'landing' && userId && (
            <>
              <div className="hidden md:flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
                <button onClick={() => { setView('dashboard'); setActiveScriptContext(''); }} className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all ${view === 'dashboard' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}>🏠 الرئيسية</button>
                <button onClick={() => setView('brand_kit')} className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all ${view === 'brand_kit' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}>🎨 هويتي</button>
                <button onClick={() => setView('content_library')} className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all ${view === 'content_library' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}>📚 مكتبتي</button>
                <button onClick={() => setView('admin')} className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all ${view === 'admin' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}>⚙️ الإدارة</button>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-white hover:text-[#FFD700] transition-colors"
              >
                <span className="text-2xl">{isMenuOpen ? '✕' : '☰'}</span>
              </button>
            </>
          )}

          {view !== 'landing' && userId && (
            <div className="hidden md:flex items-center gap-4">
              <button onClick={() => setIsPricingOpen(true)} className="bg-[#FFD700] text-black px-6 py-2.5 rounded-xl text-[11px] font-black shadow-xl hover:scale-105 transition-all">شحن رصيد</button>
              <button onClick={() => supabase.auth.signOut()} className="bg-white/5 text-white/40 px-4 py-2.5 rounded-xl text-[11px] font-black hover:bg-red-500/10 hover:text-red-500 transition-all">خروج</button>
            </div>
          )}
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && view !== 'landing' && userId && (
          <div className="md:hidden bg-black/95 border-b border-white/5 p-6 animate-in slide-in-from-top duration-300">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => { setView('dashboard'); setIsMenuOpen(false); setActiveScriptContext(''); }}
                className={`w-full p-4 rounded-2xl text-right font-black ${view === 'dashboard' ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-white'}`}
              >
                🏠 الرئيسية
              </button>
              <button
                onClick={() => { setView('brand_kit'); setIsMenuOpen(false); }}
                className={`w-full p-4 rounded-2xl text-right font-black ${view === 'brand_kit' ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-white'}`}
              >
                🎨 هويتي
              </button>
              <button
                onClick={() => { setView('content_library'); setIsMenuOpen(false); }}
                className={`w-full p-4 rounded-2xl text-right font-black ${view === 'content_library' ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-white'}`}
              >
                📚 مكتبتي
              </button>
              <button
                onClick={() => { setView('admin'); setIsMenuOpen(false); }}
                className={`w-full p-4 rounded-2xl text-right font-black ${view === 'admin' ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-white'}`}
              >
                ⚙️ الإدارة
              </button>
              <button
                onClick={() => { setIsPricingOpen(true); setIsMenuOpen(false); }}
                className="w-full p-4 bg-[#FFD700] text-black rounded-2xl text-right font-black"
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

      <div className="w-full max-w-7xl flex-grow p-6 z-10">
        {view === 'landing' && <LandingPage onGetStarted={() => setView('dashboard')} />}

        {view !== 'landing' && !userId && <Auth onGuestLogin={() => setIsGuest(true)} />}

        {view === 'dashboard' && userId && (
          <div className="py-12 md:py-20 space-y-16 animate-in fade-in duration-700 text-right" dir="rtl">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-8xl font-black text-white tracking-tighter leading-tight italic">لوحة التحكّم <span className="text-[#FFD700]">.</span></h1>
              <p className="text-slate-500 text-lg md:text-2xl font-bold">مرحباً بك في مستقبل الإنتاج. اختر المستوى المطلوب لتبدأ.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hubs.map((hub) => (
                <div key={hub.id} className="group relative flex flex-col bg-white/5 border border-white/10 rounded-[3.5rem] overflow-hidden transition-all hover:border-white/20 hover:-translate-y-2 shadow-2xl">
                  <div className={`h-40 bg-gradient-to-br ${hub.color} p-10 flex items-center justify-between`}>
                    <div className="text-7xl opacity-40 group-hover:scale-110 transition-transform">{hub.icon}</div>
                    <div className="text-right">
                      <span className="text-white/40 font-black text-xs uppercase tracking-widest block mb-1">Level {hub.level}</span>
                      <h2 className="text-3xl font-black text-white">{hub.title}</h2>
                    </div>
                  </div>

                  <div className="p-10 flex-grow flex flex-col justify-between space-y-8">
                    <p className="text-slate-400 font-bold leading-relaxed">{hub.desc}</p>

                    <div className="space-y-3">
                      {hub.tools.map(tool => (
                        <button
                          key={tool.id}
                          onClick={() => setView(tool.id as AppView)}
                          className="w-full group/btn flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white hover:text-black transition-all font-black text-sm"
                        >
                          <span className="group-hover/btn:-translate-x-1 transition-transform">←</span>
                          <div className="flex items-center gap-3">
                            <span>{tool.label}</span>
                            <span className="text-xl">{tool.icon}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'performance_studio' && userId && (
          <AdContentFactory
            performanceProject={performanceProject}
            setPerformanceProject={setPerformanceProject}
            masterProject={masterFactory}
            setMasterProject={setMasterFactory}
            userId={userId}
            refreshCredits={() => { }}
            onBridgeToVideo={bridgeToVideo}
          />
        )}
        {view === 'photoshoot' && userId && <PhotoshootDirector project={photoshootProject} setProject={setPhotoshootProject} userId={userId} />}
        {view === 'strategy_engine' && userId && <MarketingStudio project={marketingProject} setProject={setMarketingProject} onBridgeToPlan={bridgeToPlan} userId={userId} />}
        {view === 'video_studio' && userId && <VideoStudio userId={userId} refreshCredits={() => { }} initialScript={activeScriptContext} />}
        {view === 'plan_studio' && userId && <PlanStudio project={planStudio} setProject={setPlanStudio} onBridgeToPhotoshoot={bridgeToPhotoshoot} userId={userId} />}
        {view === 'storyboard_studio' && userId && <StoryboardStudio project={storyboardProject} setProject={setStoryboardProject} onAutoGenerateVideo={(id, prompt) => bridgeToVideo(prompt || '')} userId={userId} />}
        {view === 'brand_kit' && userId && <BrandKitManager userId={userId} onBack={() => setView('dashboard')} />}
        {view === 'faq' && userId && <FAQ onBack={() => setView('dashboard')} />}
        {view === 'privacy_policy' && userId && <LegalPages type="privacy" onBack={() => setView('dashboard')} />}
        {view === 'terms_of_service' && userId && <LegalPages type="terms" onBack={() => setView('dashboard')} />}
        {view === 'ads_studio' && userId && <AdsStudio userId={userId} refreshCredits={() => { }} />}
        {view === 'daily_pack' && userId && <DailyPackStudio project={dailyPack} setProject={setDailyPack} userId={userId} />}
        {view === 'trend_engine' && userId && <TrendEngine project={trendEngine} setProject={setTrendEngine} userId={userId} refreshCredits={() => { }} />}
        {view === 'power' && userId && <PowerStudio project={powerStudio} setProject={setPowerStudio} userId={userId} refreshCredits={() => { }} />}
        {view === 'ugc_studio' && userId && <UGCStudio project={ugcProject} setProject={setUgcProject} userId={userId} refreshCredits={() => { }} />}
        {view === 'content_library' && userId && <ContentLibrary userId={userId} />}
        {view === 'admin' && userId && <AdminDashboard />}
      </div>

      <Footer onNavigate={setView} onOpenPricing={() => setIsPricingOpen(true)} />
      <ChatWidget />
      <WhatsAppButton />
      {isPricingOpen && userId && <PricingModal userId={userId} onClose={() => setIsPricingOpen(false)} />}
    </div>
  );
}
