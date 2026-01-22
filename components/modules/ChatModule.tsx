
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../../types';
import { GeminiService } from '../../services/geminiService';

interface ChatModuleProps {
  addLog: (method: string, status: 'pending' | 'success' | 'error', duration?: number) => void;
}

const ChatModule: React.FC<ChatModuleProps> = ({ addLog }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hello! I am Nitram. I can help you with complex reasoning and live searching. What is on your mind today?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const gemini = useRef(new GeminiService());

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
    const currentHistory = [...messages];
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    
    const startTime = Date.now();
    addLog('gemini.chatWithGrounding', 'pending');

    try {
      const result = await gemini.current.chatWithGrounding(input, currentHistory);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.text,
        sources: result.sources,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, assistantMsg]);
      addLog('gemini.chatWithGrounding', 'success', Date.now() - startTime);
    } catch (error) {
      console.error(error);
      addLog('gemini.chatWithGrounding', 'error');
      setMessages(prev => [...prev, {
        id: 'err',
        role: 'assistant',
        content: 'I encountered an issue while searching. Please try again in a moment.',
        timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full px-6">
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-600' : 'bg-neutral-800 border border-neutral-700'}`}>
              <i className={`fas ${msg.role === 'user' ? 'fa-user' : 'fa-bolt'} text-xs`}></i>
            </div>
            <div className={`max-w-[85%] space-y-3 ${msg.role === 'user' ? 'items-end text-right' : ''}`}>
              <div className={`px-5 py-3 rounded-2xl shadow-sm border ${msg.role === 'user' ? 'bg-blue-600 border-blue-500 text-white rounded-tr-none' : 'bg-neutral-900 border-neutral-800 text-neutral-200 rounded-tl-none'}`}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {msg.sources.map((src, i) => (
                    <a 
                      key={i} 
                      href={src.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-full text-neutral-400 hover:text-blue-400 hover:border-blue-500 transition-all flex items-center gap-2 group"
                    >
                      <i className="fas fa-arrow-up-right-from-square text-[8px] opacity-50 group-hover:opacity-100"></i>
                      {src.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4 items-center">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center">
               <i className="fas fa-bolt text-blue-500 text-xs animate-pulse"></i>
            </div>
            <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search the web or reason with Nitram..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-6 py-4.5 pr-16 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 transition-all text-sm shadow-xl"
          />
          <button 
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-blue-600 text-white rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-blue-500 transition-all shadow-lg active:scale-95"
          >
            <i className="fas fa-arrow-up text-sm"></i>
          </button>
        </form>
        <p className="text-[10px] text-neutral-600 text-center mt-4 tracking-wider uppercase font-medium">
          Multi-Modal Engine: Gemini 3 Pro
        </p>
      </div>
    </div>
  );
};

export default ChatModule;
