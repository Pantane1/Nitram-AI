
import React, { useState, useCallback } from 'react';
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

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-gray-100 overflow-hidden">
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
