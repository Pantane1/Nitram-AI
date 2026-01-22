
import React, { useState, useRef, useEffect } from 'react';
import { GeminiService, decodeBase64, encodeBase64, decodeAudioData } from '../../services/geminiService.ts';

interface VoiceModuleProps {
  addLog: (method: string, status: 'pending' | 'success' | 'error', duration?: number) => void;
}

const VoiceModule: React.FC<VoiceModuleProps> = ({ addLog }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [transcriptionHistory, setTranscriptionHistory] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  
  const geminiRef = useRef(new GeminiService());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const scrollRef = useRef<HTMLDivElement>(null);

  const inputTranscriptionBuffer = useRef('');
  const outputTranscriptionBuffer = useRef('');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptionHistory, currentTranscript]);

  const stopSession = () => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close());
      sessionPromiseRef.current = null;
    }
    if (inputCtxRef.current) inputCtxRef.current.close();
    if (outputCtxRef.current) outputCtxRef.current.close();
    setIsActive(false);
    addLog('gemini.liveSession', 'success');
  };

  const startSession = async () => {
    setIsActive(true);
    addLog('gemini.liveSession', 'pending');
    setTranscriptionHistory([]);

    try {
      inputCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const outputNode = outputCtxRef.current.createGain();
      outputNode.connect(outputCtxRef.current.destination);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const callbacks = {
        onopen: () => {
          const source = inputCtxRef.current!.createMediaStreamSource(stream);
          const scriptProcessor = inputCtxRef.current!.createScriptProcessor(4096, 1, 1);
          
          scriptProcessor.onaudioprocess = (e: any) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
            
            const pcmBlob = {
              data: encodeBase64(new Uint8Array(int16.buffer)),
              mimeType: 'audio/pcm;rate=16000'
            };

            if (sessionPromiseRef.current) {
              sessionPromiseRef.current.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            }
          };

          source.connect(scriptProcessor);
          scriptProcessor.connect(inputCtxRef.current!.destination);
        },
        onmessage: async (msg: any) => {
          const audioBase64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioBase64) {
            const ctx = outputCtxRef.current!;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            const buffer = await decodeAudioData(decodeBase64(audioBase64), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(outputNode);
            source.addEventListener('ended', () => sourcesRef.current.delete(source));
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
          }

          if (msg.serverContent?.inputTranscription) {
            inputTranscriptionBuffer.current += msg.serverContent.inputTranscription.text;
            setCurrentTranscript(`You: ${inputTranscriptionBuffer.current}`);
          }
          if (msg.serverContent?.outputTranscription) {
            outputTranscriptionBuffer.current += msg.serverContent.outputTranscription.text;
            setCurrentTranscript(`Nitram: ${outputTranscriptionBuffer.current}`);
          }

          if (msg.serverContent?.turnComplete) {
            setTranscriptionHistory(prev => [
              ...prev, 
              { role: 'user', text: inputTranscriptionBuffer.current || '...' },
              { role: 'model', text: outputTranscriptionBuffer.current || '...' }
            ]);
            inputTranscriptionBuffer.current = '';
            outputTranscriptionBuffer.current = '';
            setCurrentTranscript('');
          }

          if (msg.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onerror: (e: any) => {
          console.error("Session Error:", e);
          addLog('gemini.liveSession', 'error');
          stopSession();
        },
        onclose: () => setIsActive(false)
      };

      sessionPromiseRef.current = geminiRef.current.connectLive(callbacks);
    } catch (err) {
      console.error("Start Session Error:", err);
      addLog('gemini.liveSession', 'error');
      setIsActive(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center p-6 space-y-8 overflow-hidden">
      <div className="flex-1 w-full max-w-2xl bg-neutral-900/40 border border-neutral-800 rounded-3xl p-6 flex flex-col shadow-inner">
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {transcriptionHistory.length === 0 && !currentTranscript && (
            <div className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-4">
              <i className="fas fa-waveform text-5xl animate-pulse"></i>
              <p className="text-sm font-medium">Ready for real-time sync</p>
            </div>
          )}
          {transcriptionHistory.map((item, i) => (
            <div key={i} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${item.role === 'user' ? 'bg-blue-600 text-white shadow-lg' : 'bg-neutral-800 text-neutral-300 border border-neutral-700'}`}>
                {item.text}
              </div>
            </div>
          ))}
          {currentTranscript && (
            <div className="flex justify-start">
              <div className="max-w-[85%] px-4 py-2.5 rounded-2xl text-sm bg-neutral-800/40 text-blue-400 italic border border-blue-900/20">
                {currentTranscript}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center space-y-6 shrink-0">
        <button 
          onClick={isActive ? stopSession : startSession}
          className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl shadow-2xl transition-all relative z-10 ${
            isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-500'
          }`}
        >
          <i className={`fas ${isActive ? 'fa-stop' : 'fa-microphone'} text-white`}></i>
        </button>
        <div className="text-center">
          <h3 className="text-lg font-bold">{isActive ? 'Nitram Syncing...' : 'Start Voice Sync'}</h3>
        </div>
      </div>
    </div>
  );
};

export default VoiceModule;
