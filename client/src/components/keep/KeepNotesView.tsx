import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.js';
import { KeepNote } from '../../types/index.js';
import { 
  StickyNote, 
  Plus, 
  Pin, 
  Trash2, 
  Edit3, 
  Search, 
  Tag, 
  Palette,
  Check,
  Globe
} from 'lucide-react';
import { api } from '../../services/api.js';

const COLOR_OPTIONS = [
  { id: 'default', bg: 'bg-slate-900/80', border: 'border-slate-800' },
  { id: 'cyan', bg: 'bg-cyan-950/40', border: 'border-cyan-700/50' },
  { id: 'purple', bg: 'bg-purple-950/40', border: 'border-purple-700/50' },
  { id: 'amber', bg: 'bg-amber-950/40', border: 'border-amber-700/50' },
  { id: 'emerald', bg: 'bg-emerald-950/40', border: 'border-emerald-700/50' },
];

export const KeepNotesView: React.FC = () => {
  const { notes, refreshAll, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [selectedColor, setSelectedColor] = useState('default');
  const [tagsInput, setTagsInput] = useState('');

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const otherNotes = filteredNotes.filter(n => !n.isPinned);

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    try {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      await api.createNote({
        title: title.trim() || 'Untitled Memo',
        content: content.trim(),
        isPinned,
        color: selectedColor,
        tags,
        isArchived: false
      });
      showToast('Note saved!', 'success');
      setTitle('');
      setContent('');
      setIsPinned(false);
      setTagsInput('');
      setIsCreating(false);
      await refreshAll();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleTogglePin = async (note: KeepNote) => {
    try {
      await api.updateNote(note.id, { ...note, isPinned: !note.isPinned });
      showToast(note.isPinned ? 'Note unpinned' : 'Note pinned to top', 'info');
      await refreshAll();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteNote(id);
      showToast('Note deleted', 'info');
      await refreshAll();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <StickyNote className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Keep Notes & Scratchpad</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Capture ideas, checklists, and quick architecture memos.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(prev => !prev)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-amber-500 to-cyan-500 text-white hover:opacity-95 shadow-md transition-all self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? 'Close Note Creator' : 'Take a Note'}</span>
        </button>
      </div>

      {/* Note Creation Card */}
      {isCreating && (
        <form onSubmit={handleSaveNote} className="rounded-2xl bg-slate-900/80 border border-slate-700 p-5 space-y-3 glass-panel glow-cyan max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`p-1.5 rounded-lg transition-colors ${
                isPinned ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Pin note"
            >
              <Pin className="w-4 h-4" />
            </button>
          </div>

          <textarea
            rows={4}
            placeholder="Take a note, paste markdown, list tasks..."
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
          />

          <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
            <input
              type="text"
              placeholder="Tags (e.g. Ideas, Roadmap)"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none w-48"
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
        <input
          type="text"
          placeholder="Search notes and tags..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Pinned Section */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-amber-400">
            <Pin className="w-3.5 h-3.5" />
            <span>Pinned</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedNotes.map(note => (
              <NoteCard key={note.id} note={note} onTogglePin={handleTogglePin} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Other Notes Section */}
      <div className="space-y-3">
        {pinnedNotes.length > 0 && otherNotes.length > 0 && (
          <div className="text-xs font-mono uppercase tracking-wider text-slate-500">
            Others
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherNotes.map(note => (
            <NoteCard key={note.id} note={note} onTogglePin={handleTogglePin} onDelete={handleDelete} />
          ))}
        </div>

        {filteredNotes.length === 0 && (
          <div className="text-center py-12 text-xs text-slate-500 font-mono">
            No notes found. Create your first note above!
          </div>
        )}
      </div>
    </div>
  );
};

const NoteCard: React.FC<{ note: KeepNote; onTogglePin: (n: KeepNote) => void; onDelete: (id: string) => void }> = ({
  note,
  onTogglePin,
  onDelete
}) => {
  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800/90 p-4 space-y-3 glass-panel glass-panel-hover flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
            {note.title}
          </h4>
          <button
            onClick={() => onTogglePin(note)}
            className={`p-1 rounded transition-colors ${
              note.isPinned ? 'text-amber-400' : 'text-slate-600 hover:text-slate-300 opacity-0 group-hover:opacity-100'
            }`}
            title={note.isPinned ? 'Unpin' : 'Pin'}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed mt-2">
          {note.content}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
        <div className="flex flex-wrap gap-1">
          {note.tags?.map((t, idx) => (
            <span key={idx} className="px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800 text-[10px] font-mono">
              #{t}
            </span>
          ))}
        </div>

        <button
          onClick={() => onDelete(note.id)}
          className="p-1 text-slate-500 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete note"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
