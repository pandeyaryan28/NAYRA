import React from 'react';
import { useApp } from '../../context/AppContext.js';
import { Sparkles, Bot } from 'lucide-react';

export const NayraOrb: React.FC = () => {
  const { isNayraChatOpen, setIsNayraChatOpen } = useApp();

  if (isNayraChatOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={() => setIsNayraChatOpen(true)}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500 via-sky-500 to-purple-600 shadow-2xl hover:scale-105 transition-all duration-300 glow-cyan animate-pulse-ring cursor-pointer"
        title="Open Nayra AI Assistant"
      >
        <div className="absolute inset-0.5 rounded-full bg-[#090d16] flex items-center justify-center group-hover:bg-opacity-80 transition-all">
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-cyan-400 group-hover:text-purple-300 transition-colors" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
        </div>
      </button>
    </div>
  );
};
