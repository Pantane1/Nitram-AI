
import React from 'react';
import { OperationLog } from '../types';

interface MonitoringPanelProps {
  logs: OperationLog[];
  onClose: () => void;
}

const MonitoringPanel: React.FC<MonitoringPanelProps> = ({ logs, onClose }) => {
  return (
    <div className="w-80 border-l border-neutral-800 bg-[#0a0a0a] flex flex-col h-full animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <i className="fas fa-pulse text-blue-500"></i>
          Operations Log
        </h3>
        <button onClick={onClose} className="text-neutral-500 hover:text-white">
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <i className="fas fa-terminal mb-3 text-2xl block"></i>
            <p className="text-sm">No operations recorded</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 space-y-1">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono text-blue-400">{log.method}</span>
                <span className={`text-[10px] px-1.5 rounded uppercase font-bold ${
                  log.status === 'success' ? 'bg-green-500/20 text-green-500' : 
                  log.status === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {log.status}
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-neutral-500">
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                {log.duration && <span>{log.duration}ms</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MonitoringPanel;
