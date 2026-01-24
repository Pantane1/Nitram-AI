import React, { useState, useCallback, useEffect } from 'react';
import { AIView, OperationLog } from './types.ts';
import Sidebar from './components/Sidebar.tsx';
import Header from './components/Header.tsx';
import ChatModule from './components/modules/ChatModule.tsx';
import VisionModule from './components/modules/VisionModule.tsx';
import MotionModule from './components/modules/MotionModule.tsx';
import VoiceModule from './components/modules/VoiceModule.tsx';
import MapsModule from './components/modules/MapsModule.tsx';
import MonitoringPanel from './components/MonitoringPanel.tsx';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AIView>(AIView.CHAT);
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMonitoringOpen, setIsMonitoringOpen] = useState(false);
  const [isKeyMissing, setIsKeyMissing] = useState(false);

  useEffect(() => {
    // Check if API_KEY exists in process.env
    if (!process.env.API_KEY) {
      setIsKeyMissing(true);
    }
  }, []);
  
  const addLog = useCallback((method: string, status: 'pending' | 'success' | 'error', duration?: number) => {
    const newLog: OperationLog = {
      id: Math.random().toString(36).substring(7),
      method,
      status,
      timestamp: Date.now(),
      duration
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  }, []);

  if (isKeyMissing) {
    return (
      <div className="flex h-screen bg-[#0a0a0a] items-center justify-center p-6 text-center">
        <div className="max-w-xl space-y-8 animate-in fade-in zoom-in duration-700">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-blue-600/20">
            <i className="fas fa-bolt text-4xl text-white"></i>
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight text-white">Nitram Suite Required Setup</h1>
            <p className="text-neutral-400 text-lg">
              The application could not detect your <code className="bg-neutral-800 px-2 py-1 rounded text-blue-400">API_KEY</code>. 
              AI operations are currently paused to prevent runtime crashes.
            </p>
          </div>
          <div className="grid gap-4 text-left bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
            <h3 className="font-bold text-white flex items-center gap-2">
              <i className="fas fa-circle-info text-blue-500"></i>
              How to fix this:
            </h3>
            <ol className="list-decimal list-inside space-y-3 text-sm text-neutral-400">
              <li>Open your <strong>Vercel Project Dashboard</strong></li>
              <li>Navigate to <strong>Settings → Environment Variables</strong></li>
              <li>Add <code className="text-white">API_KEY</code> as the key</li>
              <li>Paste your <strong>Gemini API Key</strong> as the value</li>
              <li><strong>Redeploy</strong> your application</li>
            </ol>
          </div>
          <p className="text-xs text-neutral-600">
            Once configured, Nitram will automatically initialize all multi-modal modules.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-gray-100 overflow-hidden relative">
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        isOpen={isSidebarOpen} 
        toggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <main className="flex-1 flex flex-col min-w-0 bg-[#0f0f0f] border-x border-neutral-800">
        <Header 
          activeView={activeView} 
          toggleMonitoring={() => setIsMonitoringOpen(!isMonitoringOpen)}
          isMonitoringOpen={isMonitoringOpen}
        />
        
        <div className="flex-1 relative overflow-hidden">
          {activeView === AIView.CHAT && <ChatModule addLog={addLog} />}
          {activeView === AIView.VISION && <VisionModule addLog={addLog} />}
          {activeView === AIView.MOTION && <MotionModule addLog={addLog} />}
          {activeView === AIView.VOICE && <VoiceModule addLog={addLog} />}
          {activeView === AIView.MAPS && <MapsModule addLog={addLog} />}
        </div>
      </main>

      {isMonitoringOpen && (
        <MonitoringPanel logs={logs} onClose={() => setIsMonitoringOpen(false)} />
      )}
    </div>
  );
};

export default App;