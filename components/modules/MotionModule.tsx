
import React, { useState, useRef, useEffect } from 'react';
import { GeminiService } from '../../services/geminiService';

interface MotionModuleProps {
  addLog: (method: string, status: 'pending' | 'success' | 'error', duration?: number) => void;
}

const MotionModule: React.FC<MotionModuleProps> = ({ addLog }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const gemini = useRef(GeminiService.refresh());

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      const ok = await window.aistudio.hasSelectedApiKey();
      setHasKey(ok);
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    setHasKey(true);
    gemini.current = GeminiService.refresh();
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setResult(null);
    const startTime = Date.now();
    addLog('veo.generateVideo', 'pending');

    try {
      const url = await gemini.current.generateVideo(prompt, aspectRatio);
      setResult(url);
      addLog('veo.generateVideo', 'success', Date.now() - startTime);
    } catch (error: any) {
      console.error(error);
      if (error?.message?.includes('Requested entity was not found')) {
        setHasKey(false);
      }
      addLog('veo.generateVideo', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = `nitram-motion-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!hasKey) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-blue-600/10 flex items-center justify-center mx-auto border border-blue-600/30">
            <i className="fas fa-key text-3xl text-blue-500"></i>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Veo API Key Required</h3>
            <p className="text-neutral-400 text-sm">Video generation requires a specialized API key from a paid GCP project. Please select or provide your key to continue.</p>
          </div>
          <div className="flex flex-col gap-3">
             <button 
               onClick={handleSelectKey}
               className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all"
             >
               Select API Key
             </button>
             <a 
               href="https://ai.google.dev/gemini-api/docs/billing" 
               target="_blank" 
               className="text-xs text-neutral-500 hover:text-blue-400 underline"
             >
               Learn about billing requirements
             </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex gap-6 p-6 overflow-hidden">
      <div className="w-80 flex flex-col gap-6 shrink-0">
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Video Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A drone shot of a snowy mountain peak at sunset..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 h-40 focus:outline-none focus:border-blue-600 resize-none text-sm leading-relaxed"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Aspect Ratio</label>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setAspectRatio('16:9')}
              className={`py-3 rounded-xl border transition-all text-sm font-medium ${aspectRatio === '16:9' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'}`}
            >
              16:9 Landscape
            </button>
            <button 
              onClick={() => setAspectRatio('9:16')}
              className={`py-3 rounded-xl border transition-all text-sm font-medium ${aspectRatio === '9:16' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'}`}
            >
              9:16 Portrait
            </button>
          </div>
        </div>

        <div className="space-y-3 mt-auto">
          <button 
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 disabled:opacity-50 hover:bg-blue-500 transition-all active:scale-95"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-circle-notch fa-spin"></i>
                Rendering Video...
              </span>
            ) : 'Create Motion Asset'}
          </button>

          {result && (
            <button 
              onClick={handleDownload}
              className="w-full py-4 bg-neutral-800 text-white rounded-xl font-bold text-sm border border-neutral-700 hover:bg-neutral-700 transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-download"></i>
              Download Video
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 bg-neutral-900 rounded-2xl border border-neutral-800 flex items-center justify-center relative overflow-hidden group">
        {result ? (
          <div className="w-full h-full flex items-center justify-center relative">
            <video 
              src={result} 
              controls 
              autoPlay 
              loop 
              className="max-w-full max-h-full rounded-lg shadow-2xl border border-neutral-700"
            />
            
            <button 
               onClick={handleDownload}
               className="absolute top-12 right-12 bg-blue-600 p-3 rounded-full text-white shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 z-20"
               title="Download Video"
             >
               <i className="fas fa-download text-lg"></i>
             </button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-neutral-800 flex items-center justify-center mx-auto border border-neutral-700">
              <i className="fas fa-clapperboard text-3xl text-neutral-600"></i>
            </div>
            <p className="text-neutral-500 text-sm">Motion output will appear here</p>
          </div>
        )}
        
        {loading && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center">
            <div className="text-center space-y-6 max-w-xs px-6">
              <div className="flex justify-center gap-1.5">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-white uppercase tracking-widest">Generating Video</p>
                <p className="text-xs text-neutral-400">Nitram is dreaming up your cinematic scene. This typically takes 30-60 seconds.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MotionModule;
