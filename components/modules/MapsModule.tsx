
import React, { useState, useRef } from 'react';
import { GeminiService } from '../../services/geminiService.ts';

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
      let coords: { lat: number, lng: number } | undefined;
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
        coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch (e) {
        console.warn("Location access denied");
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
          placeholder="Explore places nearby..."
          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-600 text-sm"
        />
        <button onClick={handleSearch} disabled={loading} className="px-8 bg-blue-600 text-white rounded-xl font-bold">
          {loading ? 'Locating...' : 'Locate'}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {result && (
          <div className="space-y-4">
            <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800">
              <p className="text-sm text-neutral-300">{result.text}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.sources.map((s, i) => (
                <a key={i} href={s.uri} target="_blank" className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 hover:border-blue-600 truncate text-sm">
                  {s.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapsModule;
