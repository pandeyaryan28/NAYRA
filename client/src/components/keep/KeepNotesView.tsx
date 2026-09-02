import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.js';
import type { KeepNote } from '../../types/index.js';
import { 
  StickyNote, 
  Plus, 
  Pin, 
  Trash2, 
  Search 
} from 'lucide-react';
import { api } from '../../services/api.js';

export const KeepNotesView: React.FC = () => {
  const { notes, refreshAll, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const otherNotes = filteredNotes.filter(n => !n.isPinned);

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    try {
      await api.createNote({
        title: title.trim() || 'Untitled Note',
        content: content.trim(),
        isPinned: false,
        isArchived: false
      });
      showToast('Note saved', 'success');
      setTitle('');
      setContent('');
      setIsCreating(false);
      await refreshAll();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleTogglePin = async (note: KeepNote) => {
    try {
      await api.updateNote(note.id, { ...note, isPinned: !note.isPinned });
      showToast(note.isPinned ? 'Unpinned' : 'Pinned', 'info');
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
    <div className="p-8 max-w-6xl mx-auto space-y-6 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Notes & Memos</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Minimalist scratchpad for thoughts, ideas, and directives.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isCreating ? 'Close' : 'New Note'}</span>
        </button>
      </div>

      {/* Note Creator Form */}
      {isCreating && (
        <form onSubmit={handleSaveNote} className="p-5 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
          />
          <textarea
            rows={3}
            placeholder="Take a note..."
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full bg-transparent text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none resize-none leading-relaxed"
          />
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
            >
              Save Note
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none shadow-2xs"
        />
      </div>

      {/* Pinned Section */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
            Pinned
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedNotes.map(note => (
              <NoteCard key={note.id} note={note} onTogglePin={handleTogglePin} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Other Notes */}
      <div className="space-y-3">
        {pinnedNotes.length > 0 && otherNotes.length > 0 && (
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
            All Notes
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherNotes.map(note => (
            <NoteCard key={note.id} note={note} onTogglePin={handleTogglePin} onDelete={handleDelete} />
          ))}
        </div>

        {filteredNotes.length === 0 && (
          <div className="text-center py-12 text-xs text-zinc-400 dark:text-zinc-500">
            No notes found.
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
    <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between space-y-3 group">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            {note.title}
          </h4>
          <button
            onClick={() => onTogglePin(note)}
            className={`p-1 rounded transition-colors cursor-pointer ${
              note.isPinned ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100'
            }`}
            title={note.isPinned ? 'Unpin' : 'Pin'}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 whitespace-pre-wrap leading-relaxed">
          {note.content}
        </p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-[10px] text-zinc-400">
        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
        <button
          onClick={() => onDelete(note.id)}
          className="p-1 text-zinc-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          title="Delete"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
