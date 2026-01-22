
import React, { useState, useRef, useEffect } from 'react';
import { GeminiService, decodeBase64, encodeBase64, decodeAudioData } from '../../services/geminiService';

interface VoiceModuleProps {
  addLog: (method: string, status: 'pending' | 'success' | 'error', duration?: number) => void;
}

const VoiceModule: React.FC<VoiceModuleProps> = ({ addLog }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [transcriptionHistory, setTranscriptionHistory] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const gemini = useRef(new GeminiService());
  const sessionRef = useRef<any>(null);
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
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
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

      sessionRef.current = await gemini.current.connectLive({
        onopen: () => {
          const source = inputCtxRef.current!.createMediaStreamSource(stream);
          const scriptProcessor = inputCtxRef.current!.createScriptProcessor(4096, 1, 1);
          
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
            
            if (sessionRef.current) {
              sessionRef.current.sendRealtimeInput({
                media: {
                  data: encodeBase64(new Uint8Array(int16.buffer)),
                  mimeType: 'audio/pcm;rate=16000'
                }
              });
            }
          };

          source.connect(scriptProcessor);
          scriptProcessor.connect(inputCtxRef.current!.destination);
        },
        onmessage: async (msg: any) => {
          // Handle Audio
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

          // Handle Transcriptions
          if (msg.serverContent?.inputTranscription) {
            inputTranscriptionBuffer.current += msg.serverContent.inputTranscription.text;
            setCurrentTranscript(`You: ${inputTranscriptionBuffer.current}`);
          }
          if (msg.serverContent?.outputTranscription) {
            outputTranscriptionBuffer.current += msg.serverContent.outputTranscription.text;
            setCurrentTranscript(`Nitram: ${outputTranscriptionBuffer.current}`);
          }

          if (msg.serverContent?.turnComplete) {
            if (inputTranscriptionBuffer.current) {
              setTranscriptionHistory(prev => [...prev, { role: 'user', text: inputTranscriptionBuffer.current }]);
            }
            if (outputTranscriptionBuffer.current) {
              setTranscriptionHistory(prev => [...prev, { role: 'model', text: outputTranscriptionBuffer.current }]);
            }
            inputTranscriptionBuffer.current = '';
            outputTranscriptionBuffer.current = '';
            setCurrentTranscript('');
          }

          if (msg.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
            outputTranscriptionBuffer.current += " [Interrupted]";
          }
        },
        onerror: (e: any) => {
          console.error(e);
          addLog('gemini.liveSession', 'error');
          stopSession();
        },
        onclose: () => setIsActive(false)
      });
    } catch (err) {
      console.error(err);
      addLog('gemini.liveSession', 'error');
      setIsActive(false);
    }
  };

  useEffect(() => {
    return () => {
      if (isActive) stopSession();
    };
  }, []);

  return (
    <div className="h-full flex flex-col items-center p-6 space-y-8 overflow-hidden">
      <div className="flex-1 w-full max-w-2xl bg-neutral-900/30 border border-neutral-800 rounded-3xl p-6 flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2">
          {transcriptionHistory.length === 0 && !currentTranscript && (
            <div className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-4">
              <i className="fas fa-waveform text-5xl"></i>
              <p className="text-sm">Conversation history will appear here</p>
            </div>
          )}
          {transcriptionHistory.map((item, i) => (
            <div key={i} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${item.role === 'user' ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-300'}`}>
                {item.text}
              </div>
            </div>
          ))}
          {currentTranscript && (
            <div className="flex justify-start animate-pulse">
              <div className="max-w-[80%] px-4 py-2 rounded-2xl text-sm bg-neutral-800/50 text-blue-400 italic">
                {currentTranscript}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center space-y-6 shrink-0">
        <div className="relative">
          {isActive && (
            <div className="absolute inset-0">
              <div className="absolute inset-0 border-2 border-blue-500 rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-0 border-2 border-blue-400 rounded-full animate-ping opacity-10 [animation-delay:0.5s]"></div>
            </div>
          )}
          
          <button 
            onClick={isActive ? stopSession : startSession}
            className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl shadow-2xl transition-all relative z-10 ${
              isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            <i className={`fas ${isActive ? 'fa-stop' : 'fa-microphone'} text-white`}></i>
          </button>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-bold">{isActive ? 'Nitram is Listening...' : 'Tap to Start Sync'}</h3>
          <p className="text-neutral-500 text-xs mt-1">Real-time voice powered by Gemini 2.5 Native Audio</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceModule;
