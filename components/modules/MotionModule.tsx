import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GeminiService } from '../../services/geminiService.ts';

interface MotionModuleProps {
  addLog: (method: string, status: 'pending' | 'success' | 'error', duration?: number) => void;
}

const PROGRESS_MESSAGES = [
  "Dreaming of pixels...",
  "Synthesizing motion frames...",
  "Applying temporal textures...",
  "Calculating light transport...",
  "Smoothly interpolating keyframes...",
  "Refining final render details...",
  "Almost there, polishing the result..."
];

const MotionModule: React.FC<MotionModuleProps> = ({ addLog }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [loading, setLoading] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const gemini = useMemo(() => new GeminiService(), []);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setStatusIndex((prev) => (prev + 1) % PROGRESS_MESSAGES.length);
      }, 8000);
    } else {
      setStatusIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setError(null);
    const startTime = Date.now();
    addLog('veo.generateVideo', 'pending');

    try {
      const url = await gemini.generateVideo(prompt, aspectRatio);
      setResult(url);
      addLog('veo.generateVideo', 'success', Date.now() - startTime);
    } catch (err: any) {
      console.error(err);
      addLog('veo.generateVideo', 'error');
      if (GeminiService.isPermissionError(err)) {
        setError("Permission Denied: Ensure your connected API Key is from a paid project with Veo access.");
      } else {
        setError("Rendering failed. Please check your connection and prompt complexity.");
      }
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

  return (
    <div className="h-full flex gap-6 p-6 overflow-hidden">
      <div className="w-80 flex flex-col gap-6 shrink-0">
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Video Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A cinematic drone shot of a futuristic neon city..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 h-40 focus:outline-none focus:border-blue-600 resize-none text-sm leading-relaxed"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Aspect Ratio</label>
          <div className="grid grid-cols-2 gap-2">
            {[ { id: '16:9', label: '16:9' }, { id: '9:16', label: '9:16' } ].map((opt) => (
              <button 
                key={opt.id}
                onClick={() => setAspectRatio(opt.id as any)}
                className={`py-3 rounded-xl border transition-all text-sm font-medium ${aspectRatio === opt.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 mt-auto">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed animate-in fade-in slide-in-from-bottom-2">
              <i className="fas fa-circle-exclamation mr-2"></i>
              {error}
            </div>
          )}
          <button 
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 disabled:opacity-50 hover:bg-blue-500 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Rendering...
              </>
            ) : 'Create Motion Asset'}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-neutral-900 rounded-2xl border border-neutral-800 flex items-center justify-center relative overflow-hidden group">
        {loading ? (
          <div className="text-center space-y-6 animate-in fade-in duration-500">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-blue-600/20 border-t-blue-600 animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-video text-blue-500 animate-pulse"></i>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-white tracking-tight">{PROGRESS_MESSAGES[statusIndex]}</p>
              <p className="text-xs text-neutral-500">Generative video usually takes 2-4 minutes</p>
            </div>
          </div>
        ) : result ? (
          <div className="relative w-full h-full flex items-center justify-center p-8">
            <video src={result} controls autoPlay loop className="max-w-full max-h-full rounded-xl shadow-2xl border border-neutral-700" />
            <button 
              onClick={handleDownload}
              className="absolute top-12 right-12 bg-blue-600 p-4 rounded-full text-white shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
            >
              <i className="fas fa-download text-xl"></i>
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
      </div>
    </div>
  );
};

export default MotionModule;