
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
      id: 'step_1',
      title: 'التأسيس والتحليل',
      level: 'الخطوة 1',
      desc: 'دراسة السوق، تحليل المنافسين، ورصد التريندات لبناء أساس صلب.',
      icon: '🔍',
      color: 'from-blue-600 to-blue-900',
      tools: [
        { id: 'strategy_engine', label: 'استراتيجية النمو السريع', icon: '🎯' },
        { id: 'trend_engine', label: 'محرك التريندات', icon: '🔥' }
      ]
    },
    {
      id: 'step_2',
      title: 'التخطيط الاستراتيجي',
      level: 'الخطوة 2',
      desc: 'بناء خطة محتوى متكاملة وموزعة لـ 30 يوماً تغطي جميع المنصات.',
      icon: '🗓️',
      color: 'from-purple-600 to-purple-900',
      tools: [
        { id: 'plan_studio', label: 'خطة المحتوى الذكية', icon: '📝' }
      ]
    },
    {
      id: 'step_3',
      title: 'مصنع الإنتاج النصي',
      level: 'الخطوة 3',
      desc: 'كتابة الإعلانات والسكريبتات القوية (Hooks & Copy) التي تبيع فعلاً.',
      icon: '✍️',
      color: 'from-orange-500 to-red-800',
      tools: [
        { id: 'performance_studio', label: 'مصنع الحملات المتكاملة', icon: '🚀' },
        { id: 'power', label: 'مُولّد الإعلانات السريعة', icon: '⚡' },
        { id: 'daily_pack', label: 'باقة المحتوى اليومي', icon: '📅' },
        { id: 'ugc_studio', label: 'صناعة محتوى الـ UGC', icon: '🤩' }
      ]
    },
    {
      id: 'step_4',
      title: 'الإخراج البصري',
      level: 'الخطوة 4',
      desc: 'تحويل السكريبتات إلى صور إعلانية وفيديوهات جاهزة للنشر مباشرة.',
      icon: '🎬',
      color: 'from-yellow-400 to-amber-600',
      tools: [
        { id: 'photoshoot', label: 'جلسات تصوير احترافية', icon: '📸' },
        { id: 'storyboard_studio', label: 'مخرج الريلز والإعلانات', icon: '🎬' },
        { id: 'video_studio', label: 'استوديو تصميم الفيديوهات', icon: '🎥' }
      ]
    }
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
            <div className="space-y-6 text-center max-w-4xl mx-auto mb-20 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-full text-sm font-black tracking-widest uppercase mb-4 shadow-lg shadow-yellow-500/5">
                رحلة الإنتاج المتكاملة
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight italic">
                مصنع المحتوى <span className="text-transparent bg-clip-text bg-gradient-to-l from-yellow-300 to-yellow-600">الذكي</span>
              </h1>
              <p className="text-slate-400 text-lg md:text-xl font-bold leading-relaxed max-w-2xl mx-auto">
                مسار عمل من 4 خطوات دقيقة، يأخذك من مجرد فكرة غامضة إلى منظومة إعلانية فيرال تكتسح المبيعات.
              </p>
            </div>

            <div className="relative max-w-5xl mx-auto mt-20 mb-32" dir="rtl">
              {/* Central Timeline Line */}
              <div className="hidden lg:block absolute top-[5%] bottom-[5%] left-1/2 w-[2px] bg-gradient-to-b from-blue-600 via-purple-600 to-amber-500 transform -translate-x-1/2 z-0 opacity-40"></div>
              <div className="hidden lg:block absolute top-[5%] bottom-[5%] left-1/2 w-[12px] bg-gradient-to-b from-blue-600 via-purple-600 to-amber-500 transform -translate-x-1/2 z-0 blur-xl opacity-20"></div>

              <div className="space-y-12 lg:space-y-16 relative z-10">
                {hubs.map((hub, index) => (
                  <div key={hub.id} className={`flex flex-col lg:flex-row items-center justify-between ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''} relative`}>

                    {/* Timeline Node */}
                    <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-2xl bg-black border border-white/10 z-20 items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-500 rotate-45 overflow-hidden">
                      <div className={`w-full h-full bg-gradient-to-br ${hub.color} opacity-20 absolute`}></div>
                      <div className="-rotate-45 text-3xl drop-shadow-lg">{hub.icon}</div>
                    </div>

                    {/* Empty Space for the other side */}
                    <div className="hidden lg:block w-[45%]"></div>

                    {/* Card Content */}
                    <div className="w-full lg:w-[45%] group relative bg-[#131313]/90 backdrop-blur-xl border border-white/5 hover:border-white/10 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-[0_0_50px_rgba(255,255,255,0.03)] hover:-translate-y-2">
                      {/* Large Watermark Number */}
                      <div className="absolute -left-6 -top-12 text-[180px] font-black text-white/[0.015] select-none pointer-events-none group-hover:text-white/[0.03] transition-colors duration-700">{index + 1}</div>

                      {/* Gradient Top Line */}
                      <div className={`h-2 w-full bg-gradient-to-r ${hub.color}`}></div>

                      <div className="p-8 md:p-10 relative z-10">
                        <div className="flex items-center gap-5 mb-6">
                          <div className="lg:hidden w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl border border-white/10 shrink-0 shadow-inner">
                            {hub.icon}
                          </div>
                          <div>
                            <span className={`bg-clip-text text-transparent bg-gradient-to-l ${hub.color} font-black text-xs md:text-sm uppercase tracking-[0.2em] block mb-2 drop-shadow-sm`}>{hub.level}</span>
                            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">{hub.title}</h2>
                          </div>
                        </div>

                        <p className="text-slate-400/90 font-medium leading-relaxed mb-10 text-sm md:text-base">{hub.desc}</p>

                        <div className="space-y-3">
                          {hub.tools.map(tool => (
                            <button
                              key={tool.id}
                              onClick={() => setView(tool.id as AppView)}
                              className="w-full group/btn flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white hover:text-black transition-all duration-500 font-black text-sm md:text-base overflow-hidden relative shadow-sm"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000"></div>
                              <span className="group-hover/btn:-translate-x-2 transition-transform opacity-30 group-hover/btn:opacity-100">←</span>
                              <div className="flex items-center gap-3 relative z-10">
                                <span>{tool.label}</span>
                                <span className="text-xl bg-white/5 w-10 h-10 flex items-center justify-center rounded-xl group-hover/btn:bg-black/10 transition-colors drop-shadow-sm">{tool.icon}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
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
