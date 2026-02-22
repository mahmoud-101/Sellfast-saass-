
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { decodeAudioData } from '../utils';

// Manual Base64 Implementation
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const MicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 013 3v5a3 3 0 11-6 0V5a3 3 0 013-3z" /></svg>;

const LiveBrandTalk: React.FC = () => {
    const [isActive, setIsActive] = useState(false);
    const [status, setStatus] = useState('محادثة صوتية سريعة');
    
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const stopSession = () => {
        sessionPromiseRef.current?.then(session => session.close());
        streamRef.current?.getTracks().forEach(track => track.stop());
        inputAudioContextRef.current?.close();
        outputAudioContextRef.current?.close();
        for (const source of sourcesRef.current.values()) source.stop();
        sourcesRef.current.clear();
        setIsActive(false);
        setStatus('محادثة صوتية سريعة');
    };

    const startSession = async () => {
        try {
            setIsActive(true);
            setStatus('جاري الاتصال...');
            const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
            const ai = new GoogleGenAI({ apiKey });
            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            inputAudioContextRef.current = inputAudioContext;
            outputAudioContextRef.current = outputAudioContext;
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                callbacks: {
                    onopen: () => {
                        setStatus('تحدث الآن، أنا أسمعك');
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        scriptProcessor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            const l = inputData.length;
                            const int16 = new Int16Array(l);
                            for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
                            const pcmBlob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
                            sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        const base64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64) {
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64), outputAudioContext, 24000, 1);
                            const source = outputAudioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputAudioContext.destination);
                            source.addEventListener('ended', () => sourcesRef.current.delete(source));
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }
                        if (msg.serverContent?.interrupted) {
                            for (const source of sourcesRef.current.values()) source.stop();
                            sourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onclose: () => setIsActive(false),
                    onerror: () => { setIsActive(false); setStatus('خطأ في الاتصال'); }
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    systemInstruction: 'أنت مستشار تسويق خبير في Ebdaa Pro. ساعد المستخدم باحترافية وبلهجة مصرية ودودة.',
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }
                }
            });
            sessionPromiseRef.current = sessionPromise;
        } catch (err) { setIsActive(false); setStatus('عطل بالميكروفون'); }
    };

    return (
        <div className="fixed bottom-6 left-4 sm:bottom-8 sm:left-8 z-[100]">
            <div className={`glass-card rounded-full p-1.5 flex items-center gap-2 sm:gap-4 pr-4 sm:pr-6 transition-all duration-500 shadow-2xl flex-row-reverse ${isActive ? 'bg-[var(--color-accent)] ring-4 ring-[var(--color-accent)]/20' : 'hover:scale-105 border border-white/10'}`}>
                <button 
                    onClick={isActive ? stopSession : startSession}
                    className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-white text-[var(--color-accent)] animate-pulse' : 'bg-[var(--color-accent)] text-white shadow-lg'}`}
                >
                    {isActive ? <div className="w-3 h-3 bg-red-500 rounded-sm"></div> : <MicIcon />}
                </button>
                <div className="flex flex-col text-right">
                    <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white/70' : 'text-[var(--color-accent)]'}`}>Live Strategist</span>
                    <span className={`text-[10px] sm:text-xs font-bold whitespace-nowrap ${isActive ? 'text-white' : 'text-white/60'}`}>{status}</span>
                </div>
            </div>
        </div>
    );
};

export default LiveBrandTalk;
