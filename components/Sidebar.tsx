import React from 'react';
import { AIView } from '../types.ts';

interface SidebarProps {
  activeView: AIView;
  onViewChange: (view: AIView) => void;
  isOpen: boolean;
  toggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, isOpen, toggle }) => {
  const menuItems = [
    { id: AIView.CHAT, icon: 'fa-comments', label: 'Chat Grounding' },
    { id: AIView.VISION, icon: 'fa-wand-sparkles', label: 'Vision Lab' },
    { id: AIView.MOTION, icon: 'fa-video', label: 'Motion Studio' },
    { id: AIView.VOICE, icon: 'fa-microphone-lines', label: 'Voice Sync' },
    { id: AIView.MAPS, icon: 'fa-map-location-dot', label: 'Geo Finder' },
  ];

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-[#0a0a0a] flex flex-col border-r border-neutral-800 shrink-0`}>
      <div className="p-6 flex items-center gap-3">
        {/* Updated to rounded-full to match the circle logo in the request */}
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
          <i className="fas fa-bolt text-white text-xs"></i>
        </div>
        {isOpen && <span className="font-bold text-lg tracking-tight">Nitram</span>}
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
              activeView === item.id 
                ? 'bg-blue-600/10 text-blue-500 font-medium' 
                : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
            }`}
          >
            <i className={`fas ${item.icon} text-lg w-6 shrink-0`}></i>
            {isOpen && <span className="truncate">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-neutral-800">
        <button 
          onClick={toggle}
          className="w-full flex items-center gap-4 px-4 py-3 text-neutral-500 hover:text-white transition-colors"
        >
          <i className={`fas ${isOpen ? 'fa-angles-left' : 'fa-angles-right'} text-lg w-6 shrink-0`}></i>
          {isOpen && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;