import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext.js';
import { 
  Bot, 
  Send, 
  X, 
  User, 
  Terminal, 
  CornerDownLeft,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api.js';

interface Message {
  id: string;
  role: 'user' | 'nayra';
  text: string;
  actionTaken?: any;
  timestamp: string;
}

const createMessageId = (prefix: string) => `${prefix}-${Date.now()}`;

export const AssistantDrawer: React.FC = () => {
  const { isAssistantOpen, setIsAssistantOpen, refreshAll } = useApp();
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'm-init',
      role: 'nayra',
      text: 'Good day, Commander. I am Nayra, your personal command engine. I can schedule calendar events, prioritize tasks, log nutrition calories, and track focus blocks.',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAssistantOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 100);
    }
  }, [messages, isAssistantOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAssistantOpen) {
        setIsAssistantOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAssistantOpen, setIsAssistantOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: createMessageId('usr'),
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
        id: createMessageId('nayra'),
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
          id: createMessageId('err'),
          role: 'nayra',
          text: `Command execution error: ${err.message}`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const suggestions = [
    "Today's executive briefing",
    "Add task: Review Q3 financials",
    "Logged 2 eggs and whole wheat toast for breakfast",
    "Sync Google Tasks and Calendar"
  ];

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        onClick={() => setIsAssistantOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity duration-200 ${
          isAssistantOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Slide-over panel */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-white dark:bg-[#121216] border-l border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col transition-transform duration-200 ease-out ${
          isAssistantOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center font-bold text-xs shadow-2xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 tracking-tight">
                  NAYRA ASSISTANT
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                  READY
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md text-slate-500 dark:text-zinc-400 shadow-2xs">
              Esc
            </kbd>
            <button
              onClick={() => setIsAssistantOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Close Assistant (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          {messages.map(msg => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200/60 dark:border-zinc-700/60">
                    <Terminal className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-lg p-3 leading-relaxed shadow-2xs ${
                    isUser
                      ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-normal'
                      : 'bg-slate-50 dark:bg-zinc-800/80 text-slate-800 dark:text-zinc-100 border border-slate-200/80 dark:border-zinc-700/60'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {msg.actionTaken && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-zinc-700/60 text-[10px] font-mono flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{msg.actionTaken.type || 'Executed command'}</span>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-zinc-500 font-mono py-1">
              <Terminal className="w-3.5 h-3.5 animate-spin text-indigo-500" />
              <span>Processing command...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-slate-50/50 dark:bg-zinc-900/30">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s)}
              className="px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200/80 dark:border-zinc-700 text-[11px] text-slate-600 dark:text-zinc-300 whitespace-nowrap transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Command Input Bar */}
        <form 
          onSubmit={e => { e.preventDefault(); handleSend(); }} 
          className="p-3 border-t border-slate-200 dark:border-zinc-800 flex items-center gap-2 bg-white dark:bg-[#121216]"
        >
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              placeholder="Give a command or ask a question..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="w-full pl-3 pr-8 py-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-zinc-600 font-sans"
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:opacity-90 disabled:opacity-30 transition-opacity cursor-pointer disabled:cursor-not-allowed"
              title="Submit command"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="px-4 py-1.5 border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/40 dark:bg-zinc-900/40 flex items-center justify-between text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
          <span className="flex items-center gap-1">
            <CornerDownLeft className="w-2.5 h-2.5" /> Enter to send
          </span>
          <span>Cmd + J to toggle</span>
        </div>
      </aside>
    </>
  );
};
