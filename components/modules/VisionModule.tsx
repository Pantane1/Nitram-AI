import React, { useState, useMemo } from 'react';
import { GeminiService } from '../../services/geminiService.ts';

interface VisionModuleProps {
  addLog: (method: string, status: 'pending' | 'success' | 'error', duration?: number) => void;
}

const VisionModule: React.FC<VisionModuleProps> = ({ addLog }) => {
  const [prompt, setPrompt] = useState('');
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  const gemini = useMemo(() => new GeminiService(), []);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setResult(null);
    const startTime = Date.now();
    addLog(`gemini.generateImage (${isPro ? 'Pro' : 'Fast'})`, 'pending');

    try {
      const url = await gemini.generateImage(prompt, isPro);
      setResult(url);
      addLog(`gemini.generateImage (${isPro ? 'Pro' : 'Fast'})`, 'success', Date.now() - startTime);
    } catch (error) {
      console.error(error);
      addLog('gemini.generateImage', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = `nitram-gen-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex gap-6 p-6 overflow-hidden">
      <div className="w-80 flex flex-col gap-6 shrink-0">
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A futuristic cybernetic tiger in a neon rainforest..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 h-40 focus:outline-none focus:border-blue-600 resize-none text-sm leading-relaxed"
          />
        </div>

        <div className="space-y-4">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Settings</label>
          <div className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
            <span className="text-sm text-neutral-300">High Quality (Pro)</span>
            <button 
              onClick={() => setIsPro(!isPro)}
              className={`w-12 h-6 rounded-full transition-colors relative ${isPro ? 'bg-blue-600' : 'bg-neutral-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isPro ? 'left-7' : 'left-1'}`}></div>
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
                <i className="fas fa-spinner fa-spin"></i>
                Generating...
              </span>
            ) : 'Generate Image'}
          </button>

          {result && (
            <button 
              onClick={handleDownload}
              className="w-full py-4 bg-neutral-800 text-white rounded-xl font-bold text-sm border border-neutral-700 hover:bg-neutral-700 transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-download"></i>
              Download Image
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 bg-neutral-900 rounded-2xl border border-neutral-800 flex items-center justify-center relative overflow-hidden">
        {result ? (
          <div className="w-full h-full p-8 flex items-center justify-center group relative">
             <img src={result} alt="Generated" className="max-w-full max-h-full rounded-lg shadow-2xl border border-neutral-700 transition-transform duration-500 group-hover:scale-[1.02]" />
             <button 
               onClick={handleDownload}
               className="absolute top-12 right-12 bg-blue-600 p-3 rounded-full text-white shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
               title="Download Image"
             >
               <i className="fas fa-download text-lg"></i>
             </button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-neutral-800 flex items-center justify-center mx-auto border border-neutral-700">
              <i className="fas fa-image text-3xl text-neutral-600"></i>
            </div>
            <p className="text-neutral-500 text-sm">Visual creation will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisionModule;