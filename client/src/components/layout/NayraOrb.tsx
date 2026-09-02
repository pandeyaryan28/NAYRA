import React from 'react';
import { useApp } from '../../context/AppContext.js';
import { Sparkles } from 'lucide-react';

export const NayraOrb: React.FC = () => {
  const { isNayraChatOpen, setIsNayraChatOpen } = useApp();

  if (isNayraChatOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-30">
      <button
        onClick={() => setIsNayraChatOpen(true)}
        className="flex items-center justify-center w-11 h-11 rounded-full bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md hover:scale-105 transition-all duration-150 cursor-pointer"
        title="Open Nayra AI Assistant"
      >
        <Sparkles className="w-4 h-4" />
      </button>
    </div>
  );
};
