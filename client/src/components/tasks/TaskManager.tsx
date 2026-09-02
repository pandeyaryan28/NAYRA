import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.js';
import type { Task, Priority } from '../../types/index.js';
import { TaskKanban } from './TaskKanban.js';
import { TaskModal } from './TaskModal.js';
import { 
  CheckSquare, 
  Plus, 
  RefreshCw, 
  Search, 
  Check, 
  Clock, 
  Edit3, 
  Trash2,
  Columns3,
  List
} from 'lucide-react';
import { api } from '../../services/api.js';

export const TaskManager: React.FC = () => {
  const { tasks, isSyncing, syncGoogleTasks, refreshAll, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [inlineTitle, setInlineTitle] = useState('');
  const [inlinePriority, setInlinePriority] = useState<Priority>('medium');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filteredTasks = tasks.filter(task => {
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
        dueDate: new Date().toISOString().split('T')[0]
      });
      setInlineTitle('');
      showToast('Task added', 'success');
      await refreshAll();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      const isCompleted = task.status === 'completed';
      await api.updateTask(task.id, {
        ...task,
        status: isCompleted ? 'todo' : 'completed',
        completedAt: !isCompleted ? new Date().toISOString() : undefined
      });
      showToast(isCompleted ? 'Active' : 'Completed', 'info');
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

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Tasks</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            2-way synced with Google Tasks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Kanban Board"
            >
              <Columns3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={syncGoogleTasks}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Quick Add Bar */}
      <form onSubmit={handleQuickAdd} className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
        <Plus className="w-4 h-4 text-zinc-400 ml-2 shrink-0" />
        <input
          type="text"
          placeholder="Add a new task and press Enter..."
          value={inlineTitle}
          onChange={e => setInlineTitle(e.target.value)}
          className="w-full bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
        />
        <select
          value={inlinePriority}
          onChange={e => setInlinePriority(e.target.value as Priority)}
          className="text-xs bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 focus:outline-none"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <button
          type="submit"
          disabled={!inlineTitle.trim()}
          className="px-3 py-1 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer shrink-0"
        >
          Add
        </button>
      </form>

      {/* Filters Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 shadow-2xs"
          />
        </div>

        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none shadow-2xs"
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* View Display */}
      {viewMode === 'kanban' ? (
        <TaskKanban tasks={filteredTasks} onEditTask={t => { setEditingTask(t); setIsModalOpen(true); }} />
      ) : (
        <div className="rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800/60 shadow-2xs overflow-hidden">
          {filteredTasks.map(task => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleComplete(task)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                    task.status === 'completed'
                      ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900'
                      : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-zinc-300 text-transparent'
                  }`}
                >
                  <Check className="w-3 h-3" />
                </button>

                <div>
                  <span className={`text-xs font-medium ${task.status === 'completed' ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                    {task.title}
                  </span>
                  {task.notes && (
                    <div className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate max-w-md mt-0.5">
                      {task.notes}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {task.dueDate && (
                  <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {task.dueDate}
                  </span>
                )}

                <span className={`w-2 h-2 rounded-full ${
                  task.priority === 'urgent' ? 'bg-red-500' :
                  task.priority === 'high' ? 'bg-amber-500' :
                  'bg-zinc-300 dark:bg-zinc-700'
                }`} title={`Priority: ${task.priority}`}></span>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditingTask(task); setIsModalOpen(true); }}
                    className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded cursor-pointer"
                    title="Edit task"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-1 text-zinc-400 hover:text-red-500 rounded cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredTasks.length === 0 && (
            <div className="text-center py-12 text-xs text-zinc-400 dark:text-zinc-500">
              No tasks found.
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
