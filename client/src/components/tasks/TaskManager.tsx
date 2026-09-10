import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.js';
import type { Task, Priority } from '../../types/index.js';
import { TaskKanban } from './TaskKanban.js';
import { TaskModal } from './TaskModal.js';
import { 
  Plus, 
  RefreshCw, 
  Search, 
  Check, 
  Clock, 
  Edit3, 
  Trash2,
  Columns3,
  List,
  Archive,
  RotateCcw,
  CheckCircle2,
  Inbox
} from 'lucide-react';
import { api } from '../../services/api.js';

export const TaskManager: React.FC = () => {
  const { tasks, isSyncing, syncGoogleTasks, refreshAll, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [inlineTitle, setInlineTitle] = useState('');
  const [inlinePriority, setInlinePriority] = useState<Priority>('medium');
  const [inlineDueDate, setInlineDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Separate active tasks vs archived/completed tasks
  const activeTasksList = tasks.filter(t => !t.archived && t.status !== 'completed');
  const archivedTasksList = tasks.filter(t => t.archived || t.status === 'completed');

  // Apply search & priority filter to the currently active view tab
  const currentPool = activeTab === 'active' ? activeTasksList : archivedTasksList;
  const filteredTasks = currentPool.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineTitle.trim()) return;

    try {
      await api.createTask({
        title: inlineTitle.trim(),
        status: 'todo',
        priority: inlinePriority,
        dueDate: inlineDueDate || new Date().toISOString().split('T')[0],
        archived: false
      });
      setInlineTitle('');
      showToast('Task added', 'success');
      await refreshAll();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Checking an active task automatically marks it completed AND archived
  const handleCompleteAndArchive = async (task: Task) => {
    try {
      await api.updateTask(task.id, {
        ...task,
        status: 'completed',
        archived: true,
        completedAt: new Date().toISOString()
      });
      showToast(`Task completed & archived: "${task.title}"`, 'success');
      await refreshAll();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  // Restoring an archived task moves it back to active (status: 'todo', archived: false)
  const handleRestoreTask = async (task: Task) => {
    try {
      await api.updateTask(task.id, {
        ...task,
        status: 'todo',
        archived: false,
        completedAt: undefined
      });
      showToast(`Restored to active: "${task.title}"`, 'info');
      await refreshAll();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteTask(id);
      showToast('Task deleted', 'info');
      await refreshAll();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleClearAllArchived = async () => {
    if (archivedTasksList.length === 0) return;
    if (!window.confirm(`Delete all ${archivedTasksList.length} archived tasks permanently?`)) return;

    try {
      for (const t of archivedTasksList) {
        await api.deleteTask(t.id);
      }
      showToast('Cleared all archived tasks', 'info');
      await refreshAll();
    } catch (e: any) {
      showToast(e.message || 'Error clearing archived tasks', 'error');
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6 transition-colors duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-zinc-100">Tasks</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Manage your daily commitments • 2-way synced with Google Tasks
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Switcher: List vs Kanban (only for active tasks) */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs font-medium'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs font-medium'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
              title="Kanban Board"
            >
              <Columns3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={syncGoogleTasks}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Tabs: Active vs Archived */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Active Tasks</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'active'
                ? 'bg-slate-800 text-slate-200 dark:bg-zinc-200 dark:text-zinc-800'
                : 'bg-slate-200/70 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
            }`}>
              {activeTasksList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('archived')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'archived'
                ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archived</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'archived'
                ? 'bg-slate-800 text-slate-200 dark:bg-zinc-200 dark:text-zinc-800'
                : 'bg-slate-200/70 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
            }`}>
              {archivedTasksList.length}
            </span>
          </button>
        </div>

        {activeTab === 'archived' && archivedTasksList.length > 0 && (
          <button
            onClick={handleClearAllArchived}
            className="text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer font-medium"
          >
            Clear All Archived
          </button>
        )}
      </div>

      {/* Quick Add Bar (only in active view) */}
      {activeTab === 'active' && (
        <form onSubmit={handleQuickAdd} className="flex flex-col sm:flex-row items-center gap-2 p-2 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center gap-2 w-full flex-1">
            <Plus className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
            <input
              type="text"
              placeholder="Add a new task and press Enter..."
              value={inlineTitle}
              onChange={e => setInlineTitle(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none px-2"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <input
              type="date"
              value={inlineDueDate}
              onChange={e => setInlineDueDate(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700/80 rounded-lg px-2 py-1 focus:outline-none font-mono"
            />
            <select
              value={inlinePriority}
              onChange={e => setInlinePriority(e.target.value as Priority)}
              className="text-xs bg-slate-50 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700/80 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <button
              type="submit"
              disabled={!inlineTitle.trim()}
              className="px-3 py-1 rounded-lg bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer shrink-0 shadow-2xs"
            >
              Add
            </button>
          </div>
        </form>
      )}

      {/* Filters Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'active' ? 'Search active tasks...' : 'Search archived tasks...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-slate-400 dark:focus:border-zinc-600 shadow-2xs"
          />
        </div>

        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="text-xs bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none shadow-2xs cursor-pointer"
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* View Display */}
      {viewMode === 'kanban' && activeTab === 'active' ? (
        <TaskKanban tasks={filteredTasks} onEditTask={t => { setEditingTask(t); setIsModalOpen(true); }} />
      ) : (
        <div className="rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 divide-y divide-slate-100 dark:divide-zinc-800/60 shadow-2xs overflow-hidden">
          {filteredTasks.map(task => {
            const isDoneOrArchived = task.archived || task.status === 'completed';
            return (
              <div
                key={task.id}
                className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Completion checkmark */}
                  {activeTab === 'active' ? (
                    <button
                      onClick={() => handleCompleteAndArchive(task)}
                      className="w-4 h-4 rounded border border-slate-300 dark:border-zinc-700 hover:border-slate-900 dark:hover:border-zinc-300 text-transparent hover:text-slate-900 dark:hover:text-zinc-100 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      title="Mark complete & archive"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}

                  <div className="min-w-0">
                    <span className={`text-xs font-medium block truncate ${
                      isDoneOrArchived ? 'line-through text-slate-400 dark:text-zinc-500' : 'text-slate-900 dark:text-zinc-100'
                    }`}>
                      {task.title}
                    </span>
                    {task.notes && (
                      <div className="text-[11px] text-slate-400 dark:text-zinc-500 truncate max-w-md mt-0.5">
                        {task.notes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-4">
                  {task.dueDate && (
                    <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {task.dueDate}
                    </span>
                  )}

                  <span className={`w-2 h-2 rounded-full ${
                    task.priority === 'urgent' ? 'bg-red-500' :
                    task.priority === 'high' ? 'bg-amber-500' :
                    task.priority === 'low' ? 'bg-emerald-500' :
                    'bg-slate-300 dark:bg-zinc-700'
                  }`} title={`Priority: ${task.priority}`}></span>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {activeTab === 'archived' ? (
                      <button
                        onClick={() => handleRestoreTask(task)}
                        className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded cursor-pointer"
                        title="Restore to Active Tasks"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => { setEditingTask(task); setIsModalOpen(true); }}
                        className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-zinc-100 rounded cursor-pointer"
                        title="Edit task"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredTasks.length === 0 && (
            <div className="text-center py-12 text-xs text-slate-400 dark:text-zinc-500 space-y-1">
              <p className="font-medium text-slate-600 dark:text-zinc-400">
                {activeTab === 'active' ? 'No active tasks' : 'No archived tasks'}
              </p>
              <p className="text-[11px]">
                {activeTab === 'active' 
                  ? 'All tasks completed! Add a new task above to get started.' 
                  : 'Completed tasks will be archived here automatically.'}
              </p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <TaskModal
          task={editingTask}
          onClose={() => setIsModalOpen(false)}
          onSaved={refreshAll}
        />
      )}
    </div>
  );
};
