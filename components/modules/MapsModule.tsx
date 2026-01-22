
import React, { useState, useRef } from 'react';
import { GeminiService } from '../../services/geminiService';

interface MapsModuleProps {
  addLog: (method: string, status: 'pending' | 'success' | 'error', duration?: number) => void;
}

const MapsModule: React.FC<MapsModuleProps> = ({ addLog }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string, sources: any[] } | null>(null);
  const gemini = useRef(new GeminiService());

  const handleSearch = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    const startTime = Date.now();
    addLog('gemini.mapsGrounding', 'pending');

    try {
      // Get geolocation if possible
      let coords: { lat: number, lng: number } | undefined;
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
        coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch (e) {
        console.warn("Location access denied, falling back to general search");
      }

      const res = await gemini.current.getMapGrounding(query, coords?.lat, coords?.lng);
      setResult(res);
      addLog('gemini.mapsGrounding', 'success', Date.now() - startTime);
    } catch (error) {
      console.error(error);
      addLog('gemini.mapsGrounding', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-5xl mx-auto w-full space-y-6">
      <div className="flex gap-3">
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Find the best coffee shops in downtown Tokyo..."
          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-600 text-sm"
        />
        <button 
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="px-8 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-500 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-location-arrow"></i>}
          Locate
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6">
        {result ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
              <p className="text-sm leading-relaxed text-neutral-200 whitespace-pre-wrap">{result.text}</p>
            </div>
            
            {result.sources.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.sources.map((src, i) => (
                  <a 
                    key={i} 
                    href={src.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-blue-600 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center group-hover:bg-blue-600/10 group-hover:text-blue-500 transition-colors">
                        <i className="fas fa-map-pin"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{src.title}</p>
                        <p className="text-[10px] text-neutral-500 truncate">View on Maps/Web</p>
                      </div>
                      <i className="fas fa-arrow-up-right-from-square text-neutral-600 text-xs"></i>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center opacity-40">
            <div className="text-center space-y-4">
              <i className="fas fa-earth-americas text-6xl text-neutral-700"></i>
              <p className="text-sm">Search for places, restaurants, or geographical info</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapsModule;
