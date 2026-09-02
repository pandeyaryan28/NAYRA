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
    notes,
    calendarEvents
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
  const filteredEvents = calendarEvents.filter(e => e.title.toLowerCase().includes(query.toLowerCase())).slice(0, 3);

  const handleSelect = (action: () => void) => {
    action();
    setIsCommandPaletteOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-start justify-center pt-24 p-4">
      <div 
        className="w-full max-w-xl bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden glass-panel glow-cyan animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Input Header */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800">
          <Search className="w-5 h-5 text-cyan-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, search tasks, notes, or talk to Nayra..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
          />
          <button 
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 text-slate-500 hover:text-slate-300 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Results */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* Quick Actions */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 px-2 mb-1.5">
              Quick Commands
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleSelect(() => setActiveTab('tasks'))}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800/80 hover:text-cyan-300 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="w-4 h-4 text-cyan-400" />
                  <span>Create New Task in Nayra</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400" />
              </button>

              <button
                onClick={() => handleSelect(() => setActiveTab('pomodoro'))}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800/80 hover:text-purple-300 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Timer className="w-4 h-4 text-purple-400" />
                  <span>Start 25m Pomodoro Focus Session</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-purple-400" />
              </button>

              <button
                onClick={() => handleSelect(() => setActiveTab('nutrition'))}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800/80 hover:text-emerald-300 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-emerald-400" />
                  <span>Log Nutrition & Meal (Antigravity AI)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400" />
              </button>

              <button
                onClick={() => handleSelect(() => { syncGoogleTasks(); syncGoogleCalendar(); })}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800/80 hover:text-cyan-300 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <RefreshCw className="w-4 h-4 text-cyan-400" />
                  <span>Sync Google Tasks & Calendar Now</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400" />
              </button>

              <button
                onClick={() => handleSelect(() => setIsNayraChatOpen(true))}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800/80 hover:text-purple-300 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>Ask Nayra Assistant / Command Interpreter</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-purple-400" />
              </button>
            </div>
          </div>

          {/* Search Hits in Tasks */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 px-2 mb-1.5">
                Tasks
              </div>
              <div className="space-y-1">
                {filteredTasks.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleSelect(() => setActiveTab('tasks'))}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800/80 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckSquare className="w-4 h-4 text-cyan-400" />
                      <span className="truncate">{t.title}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {t.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Hits in Notes */}
          {filteredNotes.length > 0 && (
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 px-2 mb-1.5">
                Keep Notes
              </div>
              <div className="space-y-1">
                {filteredNotes.map(n => (
                  <button
                    key={n.id}
                    onClick={() => handleSelect(() => setActiveTab('keep'))}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800/80 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <StickyNote className="w-4 h-4 text-amber-400" />
                      <span className="truncate">{n.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Navigate with arrow keys</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
