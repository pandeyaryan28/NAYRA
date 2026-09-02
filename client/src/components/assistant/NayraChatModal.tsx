import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext.js';
import { 
  Bot, 
  Send, 
  X, 
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
  const { isNayraChatOpen, setIsNayraChatOpen, refreshAll } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-init',
      role: 'nayra',
      text: 'Good day, Aryan. I am Nayra. I manage your Tasks, Calendar, Focus logs, and Calorie calculations. What would you like to do?',
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
          text: `Error: ${err.message}`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const suggestions = [
    "Today's briefing",
    "I had 2 boiled eggs and toast for breakfast",
    "Add task: Review Q3 roadmap",
    "Sync Google Tasks and Calendar"
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl h-[560px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center text-xs font-bold font-mono">
              N
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">Nayra AI</h3>
            </div>
          </div>

          <button
            onClick={() => setIsNayraChatOpen(false)}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 text-xs">
          {messages.map(msg => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-md rounded-xl p-3 leading-relaxed ${
                    isUser
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {msg.actionTaken && (
                    <div className="mt-2 pt-1.5 border-t border-zinc-200/50 dark:border-zinc-700/50 text-[10px] font-mono flex items-center gap-1 opacity-80">
                      <Zap className="w-3 h-3" />
                      <span>{msg.actionTaken.type}</span>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-6 h-6 rounded bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-800 dark:text-zinc-200 shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Bot className="w-3.5 h-3.5 animate-spin" />
              <span>Thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-5 py-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s)}
              className="px-2.5 py-1 rounded-md bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200/80 dark:border-zinc-700/80 text-[11px] text-zinc-600 dark:text-zinc-300 whitespace-nowrap transition-colors cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="p-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="Instruct Nayra..."
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            className="p-2 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
