import React from 'react';
import { AIView } from '../types.ts';

interface HeaderProps {
  activeView: AIView;
  toggleMonitoring: () => void;
  isMonitoringOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ activeView, toggleMonitoring, isMonitoringOpen }) => {
  const titles: Record<AIView, string> = {
    [AIView.CHAT]: 'Reasoning & Search Grounding',
    [AIView.VISION]: 'AI Image Generation & Editing',
    [AIView.MOTION]: 'High Fidelity Video Generation',
    [AIView.VOICE]: 'Real-time Voice Conversation',
    [AIView.MAPS]: 'Geospatial Grounding'
  };

  return (
    <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-6 bg-[#0f0f0f] shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-white truncate max-w-[200px] md:max-w-none">{titles[activeView]}</h2>
        <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-blue-600/20 text-blue-500 text-[10px] uppercase tracking-wider font-bold border border-blue-600/30">
          Pro Mode
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleMonitoring}
          className={`p-2 rounded-lg transition-colors ${isMonitoringOpen ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`}
          title="Operation Logs"
        >
          <i className="fas fa-chart-line text-lg"></i>
        </button>
        <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center">
          <i className="fas fa-user text-neutral-400 text-sm"></i>
        </div>
      </div>
    </header>
  );
};

export default Header;