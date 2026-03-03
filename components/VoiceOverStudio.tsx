import React, { useCallback, useRef, useEffect, useState } from 'react';
import { VoiceOverStudioProject, AudioFile } from '../types';
import { generateSpeech } from '../services/geminiService';
import { VOICES } from '../constants';
import { decodeBase64, decodeAudioData, pcmToWavBlob } from '../utils';
import { deductCredits, CREDIT_COSTS } from '../lib/supabase';

const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 002.3-1.269V4.11A1.5 1.5 0 006.3 2.84z" /></svg>;
const PauseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;

const TONE_OPTIONS = [
    { label: 'طبيعي وحيوي', value: 'طبيعي جداً كأنها محادثة يوتيوب عفوية' },
    { label: 'إعلاني حماسي', value: 'إعلاني سريع وحماسي للفت الانتباه فوراً' },
    { label: 'هادئ ومريح', value: 'نبرة هادئة ومريحة وموثوقة' },
    { label: 'وثائقي فخم', value: 'نبرة سرد قصصي وثائقي فخمة' },
    { label: 'شاب روش/تريند', value: 'لهجة شبابية عفوية جداً لتيك توك' }
];

const VoiceOverStudio: React.FC<{
    project: VoiceOverStudioProject;
    setProject: React.Dispatch<React.SetStateAction<VoiceOverStudioProject>>;
    userId?: string;
    refreshCredits?: () => void;
}> = ({ project, setProject, userId, refreshCredits }) => {

    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const [playingIndex, setPlayingIndex] = useState<number | null>(null);

    useEffect(() => {
        if (!audioContextRef.current && typeof window !== 'undefined') {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        return () => { audioSourceRef.current?.stop(); };
    }, []);

    const handleGenerate = async () => {
        if (!project.text.trim() || !userId) return;

        setProject(s => ({ ...s, isLoading: true, error: null }));
        try {
            const audio = await generateSpeech(project.text, project.styleInstructions || 'تحدث بوضوح', project.selectedVoice);
            if (audio) {
                const deducted = await deductCredits(userId, CREDIT_COSTS.VOICE_OVER);
                if (deducted) {
                    setProject(s => ({
                        ...s, isLoading: false, generatedAudio: audio,
                        history: [{ audio, text: project.text, style: project.styleInstructions, voice: project.selectedVoice }, ...s.history]
                    }));
                    if (refreshCredits) refreshCredits();
                } else {
                    setProject(s => ({ ...s, isLoading: false, error: 'رصيدك غير كافٍ (تحتاج 10 نقاط)' }));
                }
            } else {
                setProject(s => ({ ...s, isLoading: false, error: 'فشل التوليد، حاول نصاً أطول قليلاً' }));
            }
        } catch (err: any) {
            setProject(s => ({ ...s, isLoading: false, error: 'فشل توليد الصوت: تأكد من اتصال الإنترنت أو صحة النص.' }));
        }
    };

    const downloadAudio = (audioBase64: string, name: string = 'ebdaa-voice') => {
        if (!audioContextRef.current) return;
        const pcm = decodeBase64(audioBase64);
        decodeAudioData(pcm, audioContextRef.current, 24000, 1).then(buf => {
            const blob = pcmToWavBlob(buf.getChannelData(0), 24000, 1);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `${name}.wav`; a.click();
        });
    };

    const playAudio = useCallback(async (audioBase64: string, index: number | null = null) => {
        if (!audioContextRef.current || !audioBase64) return;
        audioSourceRef.current?.stop();

        if (index === playingIndex && index !== null) {
            setPlayingIndex(null);
            setProject(s => ({ ...s, isPlaying: false }));
            return;
        }

        if (index === null) setProject(s => ({ ...s, isPlaying: true }));
        setPlayingIndex(index);

        const pcmBytes = decodeBase64(audioBase64);
        const audioBuffer = await decodeAudioData(pcmBytes, audioContextRef.current, 24000, 1);

        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.start();

        source.onended = () => {
            setPlayingIndex(null);
            setProject(s => ({ ...s, isPlaying: false }));
        };
        audioSourceRef.current = source;
    }, [setProject, playingIndex]);

    return (
        <main className="w-full max-w-6xl mx-auto flex flex-col gap-6 pt-4 pb-20 text-right animate-in fade-in duration-700" dir="rtl">
            <div className="flex flex-col gap-4 text-center items-center py-6">
                <h1 className="text-4xl font-black text-white tracking-tighter">استوديو الصوت الاحترافي 🎙️</h1>
                <p className="text-slate-400 font-bold max-w-xl">استنسخ أصوات ذكاء اصطناعي بلهجات عربية ومشاعر إنسانية كاملة بضغطة زر لدعم حملاتك وفيديوهاتك.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="bg-white/5 rounded-[2.5rem] p-10 shadow-2xl border border-white/10 space-y-8">
                        <textarea
                            value={project.text} onChange={e => setProject(s => ({ ...s, text: e.target.value }))}
                            className="w-full bg-black/40 border border-white/10 shadow-inner rounded-[2rem] p-8 text-xl font-bold text-white min-h-[200px] outline-none focus:border-[#FFD700] resize-none"
                            placeholder="اكتب السكريبت أو النص الإعلاني هنا لتسجيله..."
                        />

                        <div className="flex flex-col gap-4">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">اختر نبرة الأداء</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {TONE_OPTIONS.map(tone => (
                                    <button
                                        key={tone.label}
                                        onClick={() => setProject(s => ({ ...s, styleInstructions: tone.value }))}
                                        className={`p-4 rounded-xl border-2 transition-all font-bold text-sm ${project.styleInstructions === tone.value ? 'bg-[#FFD700] text-black border-[#FFD700]' : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'}`}
                                    >
                                        {tone.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">اختر المعلق الصوتي</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {VOICES.map(v => (
                                    <button
                                        key={v.value} onClick={() => setProject(s => ({ ...s, selectedVoice: v.value }))}
                                        className={`p-6 rounded-2xl border-4 transition-all flex flex-col items-center justify-center gap-2 ${project.selectedVoice === v.value ? 'bg-[#FFD700]/10 border-[#FFD700]' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg ${project.selectedVoice === v.value ? 'bg-[#FFD700] text-black' : 'bg-black text-white'}`}>👤</div>
                                        <p className={`font-black tracking-tight ${project.selectedVoice === v.value ? 'text-[#FFD700]' : 'text-white'}`}>{v.label}</p>
                                        <p className="text-[10px] text-slate-400 font-bold">{v.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={handleGenerate} disabled={project.isLoading || !project.text} className="w-full h-20 bg-[#FFD700] text-black text-xl font-black rounded-2xl hover:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(255,215,0,0.3)]">
                            {project.isLoading ? 'جاري التسجيل الصوتي والهندسة...' : `بدء التسجيل الآن (${CREDIT_COSTS.VOICE_OVER} نقاط)`}
                        </button>
                        {project.error && <p className="text-red-400 text-center font-bold text-sm">{project.error}</p>}
                    </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/10 flex flex-col h-full max-h-[85vh]">
                        <h3 className="text-lg font-black text-white mb-6">المكتبة الصوتية 🎧</h3>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">
                            {project.history.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full opacity-30 gap-4 mt-20">
                                    <span className="text-5xl">📼</span>
                                    <p className="font-bold">سيظهر أرشيف تسجيلاتك هنا.</p>
                                </div>
                            ) : (
                                project.history.map((h, i) => (
                                    <div key={i} className={`p-5 rounded-2xl border transition-all ${playingIndex === i ? 'bg-[#FFD700]/10 border-[#FFD700]/30' : 'bg-black/40 border-white/5'} flex flex-col gap-4`}>
                                        <p className="text-xs text-white/80 line-clamp-2 leading-relaxed font-bold">{h.text}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-2 text-[10px] items-center">
                                                <span className="bg-[#FFD700]/20 text-[#FFD700] px-2 py-1 rounded-md font-black">{VOICES.find(v => v.value === h.voice)?.label}</span>
                                            </div>
                                            <div className="flex gap-3">
                                                <button onClick={() => downloadAudio(h.audio.base64, `ebdaa_VO_${i}`)} className="text-slate-400 hover:text-[#FFD700] transition-colors">
                                                    <DownloadIcon />
                                                </button>
                                                <button onClick={() => playAudio(h.audio.base64, i)} className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${playingIndex === i ? 'bg-red-500 text-white' : 'bg-[#FFD700] text-black'}`}>
                                                    {playingIndex === i ? <PauseIcon /> : <PlayIcon />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default VoiceOverStudio;
