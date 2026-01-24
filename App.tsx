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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Check if we have an environment key already
      if (process.env.API_KEY && process.env.API_KEY !== "") {
        setIsReady(true);
        return;
      }

      // Check if user has already selected a key via aistudio
      // @ts-ignore
      if (window.aistudio?.hasSelectedApiKey) {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (hasKey) {
          setIsReady(true);
          return;
        }
      }
      
      // If neither, we stay in not-ready state to show the setup screen
      setIsReady(false);
    };
    checkAuth();
  }, []);

  const handleOpenKeySelector = async () => {
    // @ts-ignore
    if (window.aistudio?.openSelectKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      // Assume success as per race condition rules in guidelines
      setIsReady(true);
    } else {
      // Development fallback
      console.warn("aistudio.openSelectKey not found. Is this running in the correct environment?");
      setIsReady(true); 
    }
  };

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

  if (!isReady) {
    return (
      <div className="flex h-screen bg-[#0a0a0a] items-center justify-center p-6 text-center">
        <div className="max-w-xl space-y-10 animate-in fade-in zoom-in duration-1000">
          <div className="space-y-6">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-blue-600/40 relative">
               <div className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20"></div>
               <i className="fas fa-bolt text-4xl text-white relative z-10"></i>
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight text-white">Nitram AI Suite</h1>
              <p className="text-neutral-500 text-lg font-medium">Professional Multimodal Workspace</p>
            </div>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 p-8 rounded-3xl space-y-6 backdrop-blur-sm">
            <p className="text-neutral-300">
              To access high-performance Gemini 3 Pro and Veo models, please connect your API key from a paid GCP project.
            </p>
            
            <button 
              onClick={handleOpenKeySelector}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-3"
            >
              <i className="fas fa-key"></i>
              Connect API Key
            </button>

            <div className="pt-4 border-t border-neutral-800/50">
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
              >
                <i className="fas fa-external-link-alt text-[10px]"></i>
                Learn about Gemini API billing and paid projects
              </a>
            </div>
          </div>

          <div className="flex justify-center gap-8 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
             <i className="fas fa-brain text-xl"></i>
             <i className="fas fa-eye text-xl"></i>
             <i className="fas fa-microphone text-xl"></i>
             <i className="fas fa-video text-xl"></i>
          </div>
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