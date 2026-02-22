
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { VoiceOverStudioProject, AudioFile } from '../types';
import { generateSpeech } from '../services/geminiService';
import { VOICES } from '../constants';
import { decodeBase64, decodeAudioData, pcmToWavBlob } from '../utils';
import { deductCredits, CREDIT_COSTS } from '../lib/supabase';

const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 002.3-1.269V4.11A1.5 1.5 0 006.3 2.84z" /></svg>;
const PauseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" /></svg>;

const VoiceOverStudio: React.FC<{
  project: VoiceOverStudioProject;
  setProject: React.Dispatch<React.SetStateAction<VoiceOverStudioProject>>;
  userId?: string;
  refreshCredits?: () => void;
}> = ({ project, setProject, userId, refreshCredits }) => {

    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    useEffect(() => {
        if (!audioContextRef.current && typeof window !== 'undefined') {
            // التردد القياسي لـ Gemini TTS هو 24000
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        return () => { audioSourceRef.current?.stop(); };
    }, []);

    const handleGenerate = async () => {
        if (!project.text.trim() || !userId) return;

        setProject(s => ({ ...s, isLoading: true, error: null, generatedAudio: null }));
        try {
            const audio = await generateSpeech(project.text, project.styleInstructions, project.selectedVoice);
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
        } catch (err: any) {
            setProject(s => ({ ...s, isLoading: false, error: 'فشل توليد الصوت: تأكد من اتصال الإنترنت' }));
        }
    };

    const playAudio = useCallback(async (audioFile: AudioFile) => {
        if (!audioContextRef.current || !audioFile.base64) return;
        audioSourceRef.current?.stop();
        setProject(s => ({ ...s, isPlaying: true }));

        const pcmBytes = decodeBase64(audioFile.base64);
        // التحويل من PCM 16-bit خام إلى AudioBuffer بتردد 24k
        const audioBuffer = await decodeAudioData(pcmBytes, audioContextRef.current, 24000, 1);
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.start();
        source.onended = () => setProject(s => ({ ...s, isPlaying: false }));
        audioSourceRef.current = source;
    }, [setProject]);

    return (
        <main className="w-full max-w-5xl mx-auto flex flex-col gap-6 pt-4 pb-12 text-right">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card rounded-[2.5rem] p-8 space-y-6">
                    <h2 className="text-2xl font-black text-white">استوديو التعليق الصوتي AI</h2>
                    <textarea 
                        value={project.text} onChange={e => setProject(s => ({...s, text: e.target.value}))}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white min-h-[150px] outline-none focus:border-[#FFD700] font-tajawal"
                        placeholder="اكتب النص الذي تريد تحويله لصوت..."
                    />
                    <div className="grid grid-cols-2 gap-4">
                        {VOICES.map(v => (
                            <button 
                                key={v.value} onClick={() => setProject(s => ({...s, selectedVoice: v.value}))}
                                className={`p-4 rounded-xl border-2 transition-all text-right ${project.selectedVoice === v.value ? 'bg-[#FFD700]/20 border-[#FFD700] text-white' : 'bg-white/5 border-white/5 text-white/40'}`}
                            >
                                <p className="font-bold">{v.label}</p>
                                <p className="text-[10px] opacity-60">{v.desc}</p>
                            </button>
                        ))}
                    </div>
                    <button onClick={handleGenerate} disabled={project.isLoading || !project.text} className="w-full h-16 bg-white text-black font-black rounded-2xl hover:scale-[0.98] transition-all">
                        {project.isLoading ? 'جاري الرندرة الصوتية...' : `توليد الصوت (${CREDIT_COSTS.VOICE_OVER} نقاط)`}
                    </button>
                    {project.error && <p className="text-red-400 text-center font-bold text-xs">{project.error}</p>}
                </div>

                <div className="glass-card rounded-[2.5rem] p-8">
                    <h3 className="text-xl font-black text-white mb-6">النتائج والأرشيف</h3>
                    {project.generatedAudio ? (
                        <div className="p-6 bg-white/5 rounded-2xl flex items-center justify-between mb-8">
                            <button onClick={() => project.isPlaying ? audioSourceRef.current?.stop() : playAudio(project.generatedAudio!)} className="w-16 h-16 rounded-full bg-[#FFD700] text-black flex items-center justify-center hover:scale-105 transition-all shadow-xl">
                                {project.isPlaying ? <PauseIcon /> : <PlayIcon />}
                            </button>
                            <div className="text-right">
                                <p className="font-bold text-white">الملف الصوتي جاهز</p>
                                <button onClick={() => {
                                    const pcm = decodeBase64(project.generatedAudio!.base64);
                                    decodeAudioData(pcm, audioContextRef.current!, 24000, 1).then(buf => {
                                        const blob = pcmToWavBlob(buf.getChannelData(0), 24000, 1);
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a'); a.href = url; a.download = 'ebdaa-voice.wav'; a.click();
                                    });
                                }} className="text-[#FFD700] text-xs font-black mt-2 underline">تحميل بصيغة WAV</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-20">
                            <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 013 3v5a3 3 0 11-6 0V5a3 3 0 013-3z"/></svg>
                            <p className="font-bold">سيظهر الصوت المولد هنا</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default VoiceOverStudio;
