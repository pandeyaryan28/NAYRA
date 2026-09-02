import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext.js';
import { 
  Bot, 
  Sparkles, 
  Send, 
  X, 
  CheckSquare, 
  Flame, 
  Calendar, 
  RefreshCw,
  User,
  Zap
} from 'lucide-react';
import { api } from '../../services/api.js';

interface Message {
  id: string;
  role: 'user' | 'nayra';
  text: string;
  actionTaken?: any;
  timestamp: string;
}

export const NayraChatModal: React.FC = () => {
  const { isNayraChatOpen, setIsNayraChatOpen, refreshAll, showToast } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-init',
      role: 'nayra',
      text: 'Greetings, Commander. I am Nayra, your AI command assistant. I am connected to your Tasks, Calendar, Pomodoro logs, and Nutrition engine. How can I serve you today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isNayraChatOpen) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [messages, isNayraChatOpen]);

  if (!isNayraChatOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const res = await api.chatWithNayra(text.trim());
      const nayraMsg: Message = {
        id: `nayra-${Date.now()}`,
        role: 'nayra',
        text: res.reply,
        actionTaken: res.actionTaken,
        timestamp: res.timestamp || new Date().toISOString()
      };
      setMessages(prev => [...prev, nayraMsg]);
      await refreshAll();
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'nayra',
          text: `Core communication error: ${err.message}`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const smartSuggestions = [
    "What's my briefing for today?",
    "I had 2 boiled eggs and whole wheat toast for breakfast",
    "Create task: Finalize product roadmap",
    "Sync Google Tasks and Calendar"
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl h-[650px] bg-[#0c121e] border border-cyan-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden glass-panel glow-cyan animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-600 to-purple-600 shadow-md">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white tracking-wide">Nayra Intelligence</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">Personal AI Command Assistant</p>
            </div>
          </div>

          <button
            onClick={() => setIsNayraChatOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map(msg => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-lg rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                    isUser
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none glass-panel'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Action Badge */}
                  {msg.actionTaken && (
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono space-y-1 mt-2">
                      <div className="text-cyan-400 font-semibold flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        Action Executed: {msg.actionTaken.type}
                      </div>
                      {msg.actionTaken.data && (
                        <div className="text-slate-400 truncate">
                          {msg.actionTaken.data.title || `${msg.actionTaken.data.totalCalories} kcal calculated`}
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`text-[10px] font-mono ${isUser ? 'text-cyan-100/70' : 'text-slate-500'} text-right`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>Nayra is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-6 py-2 bg-slate-900/40 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {smartSuggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(suggestion)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-[11px] text-slate-300 hover:text-cyan-300 whitespace-nowrap transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center gap-3">
          <input
            type="text"
            placeholder="Instruct Nayra: 'I had lunch: 2 rotis with paneer', 'create task...', etc."
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700/80 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            className="p-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:opacity-95 disabled:opacity-40 shadow-lg glow-cyan transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
