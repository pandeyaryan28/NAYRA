import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext.js';
import { 
  Search, 
  CheckSquare, 
  Calendar, 
  Timer, 
  Flame, 
  StickyNote, 
  Bot, 
  RefreshCw, 
  Plus, 
  X,
  ArrowRight
} from 'lucide-react';

export const QuickCommandPalette: React.FC = () => {
  const { 
    isCommandPaletteOpen, 
    setIsCommandPaletteOpen, 
    setActiveTab, 
    syncGoogleTasks, 
    syncGoogleCalendar,
    setIsNayraChatOpen,
    tasks,
    notes
  } = useApp();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(query.toLowerCase())).slice(0, 3);
  const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(query.toLowerCase()) || n.content.toLowerCase().includes(query.toLowerCase())).slice(0, 3);

  const handleSelect = (action: () => void) => {
    action();
    setIsCommandPaletteOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-start justify-center pt-24 p-4">
      <div 
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
          <Search className="w-4 h-4 text-zinc-400 mr-2.5" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
          />
          <button 
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2 py-1">
              Actions
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => handleSelect(() => setActiveTab('tasks'))}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Tasks & Projects</span>
                </div>
                <ArrowRight className="w-3 h-3 text-zinc-400" />
              </button>

              <button
                onClick={() => handleSelect(() => setActiveTab('pomodoro'))}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Timer className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Pomodoro Timer</span>
                </div>
                <ArrowRight className="w-3 h-3 text-zinc-400" />
              </button>

              <button
                onClick={() => handleSelect(() => setActiveTab('nutrition'))}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Nutrition & Calories</span>
                </div>
                <ArrowRight className="w-3 h-3 text-zinc-400" />
              </button>

              <button
                onClick={() => handleSelect(() => { syncGoogleTasks(); syncGoogleCalendar(); })}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Sync Google Ecosystem</span>
                </div>
                <ArrowRight className="w-3 h-3 text-zinc-400" />
              </button>

              <button
                onClick={() => handleSelect(() => setIsNayraChatOpen(true))}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Bot className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Ask Nayra AI</span>
                </div>
                <ArrowRight className="w-3 h-3 text-zinc-400" />
              </button>
            </div>
          </div>

          {filteredTasks.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2 py-1">
                Tasks
              </div>
              <div className="space-y-0.5">
                {filteredTasks.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleSelect(() => setActiveTab('tasks'))}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <span className="truncate">{t.title}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{t.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
          <span>ESC to close</span>
          <span>Tab to navigate</span>
        </div>
      </div>
    </div>
  );
};
