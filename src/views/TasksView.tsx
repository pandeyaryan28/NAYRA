import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Check,
  Plus,
  Clock,
  Trash2,
  Calendar as CalendarIcon,
  ListPlus,
  ChevronRight,
  ChevronDown,
  CheckSquare,
  ArrowUpDown,
  X,
  Archive,
  RotateCcw,
  RefreshCw,
  Search,
  ListTodo,
  AlertCircle,
  Layers,
  Star,
  Tag,
  Hash,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useFocus } from '@/context/FocusContext';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Badge } from '@/components/common/Badge';
import { TaskItem, TaskPriority, TaskList } from '@/types';
import { formatSecondsToHoursMinutes, formatGoogleTasksDue, safeLocalStorageGet, safeLocalStorageSet } from '@/lib/utils';
import { isToday, isPast, isTomorrow, isThisWeek, parseISO } from 'date-fns';

export const TasksView: React.FC = () => {
  const navigate = useNavigate();
  const {
    tasks,
    taskLists,
    activeTaskListId,
    setActiveTaskListId,
    createTask,
    updateTask,
    toggleTaskComplete,
    archiveTask,
    unarchiveTask,
    archiveCompletedTasks,
    clearArchivedTasks,
    deleteTask,
    createTaskList,
    deleteTaskList,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    isSyncing,
    syncWithGoogle,
    reconnectAndSync,
    isGoogleTokenExpired,
    lastSyncTime,
  } = useData();

  const { selectTask, selectTasks, startTimer } = useFocus();
  const location = useLocation();
  const quickInputRef = useRef<HTMLInputElement>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    const handleFocusEvent = () => {
      quickInputRef.current?.focus();
    };
    window.addEventListener('nayra-focus-task-input', handleFocusEvent);
    if (location.search.includes('create=true')) {
      setTimeout(() => {
        quickInputRef.current?.focus();
      }, 100);
    }
    return () => {
      window.removeEventListener('nayra-focus-task-input', handleFocusEvent);
    };
  }, [location.search]);

  const toggleStar = (task: TaskItem) => {
    updateTask(task.id, { starred: !task.starred });
  };

  const handleSyncOrReconnect = async () => {
    if (isGoogleTokenExpired) {
      setIsReconnecting(true);
      try {
        await reconnectAndSync();
      } catch (err) {
        console.warn('Reconnect failed:', err);
      } finally {
        setIsReconnecting(false);
      }
    } else {
      await syncWithGoogle();
    }
  };

  // Filters & State
  const [filterMode, setFilterMode] = useState<'active' | 'archived' | 'all'>('active');
  const [sortBy, setSortBy] = useState<'order' | 'due' | 'priority' | 'title'>('order');
  const [groupBy, setGroupBy] = useState<'due' | 'priority' | 'none'>(() => {
    return safeLocalStorageGet<'due' | 'priority' | 'none'>('nayra_tasks_group_by', 'due');
  });

  const handleSetGroupBy = (val: 'due' | 'priority' | 'none') => {
    setGroupBy(val);
    safeLocalStorageSet('nayra_tasks_group_by', val);
  };

  const [densityMode, setDensityMode] = useState<'compact' | 'comfortable' | 'board'>(() => {
    return safeLocalStorageGet<'compact' | 'comfortable' | 'board'>('nayra_tasks_density_mode', 'compact');
  });

  const handleSetDensityMode = (mode: 'compact' | 'comfortable' | 'board') => {
    setDensityMode(mode);
    safeLocalStorageSet('nayra_tasks_density_mode', mode);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickDueDate, setQuickDueDate] = useState('');
  const [isNewListModalOpen, setIsNewListModalOpen] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  // Collapsible Archived accordion in active view
  const [isArchivedSectionOpen, setIsArchivedSectionOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  // Subtask UI state
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());
  const [inlineSubtaskInput, setInlineSubtaskInput] = useState<Record<string, string>>({});
  const [modalNewSubtask, setModalNewSubtask] = useState('');

  // Tag filter & Multi-task focus selection state
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [focusSelection, setFocusSelection] = useState<Set<string>>(new Set());

  // Edit Task Modal State
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editDue, setEditDue] = useState('');
  const [editPriority, setEditPriority] = useState<TaskPriority>('medium');
  const [editStarred, setEditStarred] = useState(false);
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');

  const currentEditingTask = useMemo(() => {
    return editingTask ? tasks.find((t) => t.id === editingTask.id) || editingTask : null;
  }, [editingTask, tasks]);

  // All unique tags extracted across all tasks with count
  const allUniqueTags = useMemo(() => {
    const map = new Map<string, number>();
    tasks.forEach((t) => {
      const uniqueTaskTags = new Set(
        t.tags?.map((tg) => tg.trim().toLowerCase()).filter(Boolean)
      );
      uniqueTaskTags.forEach((lower) => {
        map.set(lower, (map.get(lower) || 0) + 1);
      });
    });
    return Array.from(map.entries()).sort((a, b) => {
      const diff = b[1] - a[1];
      return diff !== 0 ? diff : a[0].localeCompare(b[0]);
    });
  }, [tasks]);

  const toggleFocusSelect = (taskId: string) => {
    setFocusSelection((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleStartMultiTaskFocus = () => {
    const selectedTasksList = tasks.filter((t) => focusSelection.has(t.id));
    if (selectedTasksList.length === 0) return;
    selectTasks(selectedTasksList);
    startTimer();
    navigate('/focus');
  };

  // Deduplicated task lists (guarantees zero duplicate "My Tasks" in sidebar)
  const uniqueTaskLists = useMemo(() => {
    const seenGtl = new Set<string>();
    const seenTitles = new Set<string>();
    const res: TaskList[] = [];

    for (const list of taskLists) {
      const norm = (list.title || '').trim().toLowerCase();
      if (norm === 'my tasks') {
        if (seenTitles.has('my tasks')) continue;
        seenTitles.add('my tasks');
        res.push(list);
        continue;
      }
      if (list.googleTaskListId && seenGtl.has(list.googleTaskListId)) continue;
      if (seenTitles.has(norm)) continue;

      if (list.googleTaskListId) seenGtl.add(list.googleTaskListId);
      seenTitles.add(norm);
      res.push(list);
    }
    return res;
  }, [taskLists]);

  // Active list lookup
  const activeList = useMemo(() => {
    if (activeTaskListId === 'all' || activeTaskListId === 'archived_view' || activeTaskListId === 'starred') return null;
    return uniqueTaskLists.find((l) => l.id === activeTaskListId) || uniqueTaskLists[0];
  }, [uniqueTaskLists, activeTaskListId]);

  // Total count of starred active tasks
  const totalStarredCount = useMemo(() => {
    return tasks.filter((t) => !t.archived && t.status !== 'completed' && Boolean(t.starred)).length;
  }, [tasks]);

  // Tasks belonging to active scope (with resilient matching for Google Tasks)
  const scopedTasks = useMemo(() => {
    if (activeTaskListId === 'all' || activeTaskListId === 'archived_view') {
      return tasks;
    }
    if (activeTaskListId === 'starred') {
      return tasks.filter((t) => Boolean(t.starred));
    }
    const targetList = activeList || uniqueTaskLists[0];
    return tasks.filter((t) => {
      if (t.taskListId === activeTaskListId) return true;
      if (targetList) {
        if (t.taskListId === targetList.id) return true;
        if (targetList.googleTaskListId && (t.taskListId === targetList.googleTaskListId || t.taskListId === `gtl_${targetList.googleTaskListId}`)) return true;
        if (targetList.isDefault && (t.taskListId === 'list_default' || t.taskListId === '@default' || t.taskListId === targetList.googleTaskListId || t.taskListId === `gtl_${targetList.googleTaskListId}`)) return true;
      }
      return false;
    });
  }, [tasks, activeTaskListId, activeList, uniqueTaskLists]);

  // Active (unarchived, not completed) tasks in scope
  const activeScopedTasks = useMemo(() => {
    return scopedTasks.filter((t) => !t.archived && t.status !== 'completed');
  }, [scopedTasks]);

  // Archived or completed tasks in scope
  const archivedScopedTasks = useMemo(() => {
    return scopedTasks.filter((t) => t.archived || t.status === 'completed');
  }, [scopedTasks]);

  // Completed tasks in scope that haven't been marked archived
  const completedUnarchivedCount = useMemo(() => {
    return scopedTasks.filter((t) => t.status === 'completed' && !t.archived).length;
  }, [scopedTasks]);

  // Filter & sort tasks for main list display
  const displayedTasks = useMemo(() => {
    let result = scopedTasks;

    if (activeTaskListId === 'archived_view') {
      result = result.filter((t) => t.archived || t.status === 'completed');
    } else if (filterMode === 'active') {
      result = result.filter((t) => !t.archived && t.status !== 'completed');
    } else if (filterMode === 'archived') {
      result = result.filter((t) => t.archived || t.status === 'completed');
    }

    if (selectedTag) {
      const lowerTag = selectedTag.toLowerCase();
      result = result.filter((t) => t.tags && t.tags.some((tg) => tg.toLowerCase() === lowerTag));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q)) ||
          (t.tags && t.tags.some((tg) => tg.toLowerCase().includes(q)))
      );
    }

    if (sortBy === 'due') {
      result = [...result].sort((a, b) => {
        if (!a.due) return 1;
        if (!b.due) return -1;
        return a.due.localeCompare(b.due);
      });
    } else if (sortBy === 'priority') {
      const priorityWeight: Record<TaskPriority, number> = { high: 3, medium: 2, low: 1 };
      result = [...result].sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
    } else if (sortBy === 'title') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [scopedTasks, activeTaskListId, filterMode, searchQuery, sortBy, selectedTag]);

  interface TaskGroup {
    id: string;
    title: string;
    icon: React.ReactNode;
    accentClass: string;
    tasks: TaskItem[];
  }

  const taskGroups = useMemo<TaskGroup[]>(() => {
    if (groupBy === 'none' || activeTaskListId === 'archived_view' || filterMode === 'archived') {
      return [];
    }

    const priorityWeight: Record<TaskPriority, number> = { high: 3, medium: 2, low: 1 };

    if (groupBy === 'due') {
      const overdue: TaskItem[] = [];
      const today: TaskItem[] = [];
      const tomorrow: TaskItem[] = [];
      const thisWeek: TaskItem[] = [];
      const later: TaskItem[] = [];
      const noDue: TaskItem[] = [];

      displayedTasks.forEach((t) => {
        if (!t.due) {
          noDue.push(t);
          return;
        }
        try {
          const parsed = parseISO(t.due);
          if (isPast(parsed) && !isToday(parsed)) {
            overdue.push(t);
          } else if (isToday(parsed)) {
            today.push(t);
          } else if (isTomorrow(parsed)) {
            tomorrow.push(t);
          } else if (isThisWeek(parsed, { weekStartsOn: 1 })) {
            thisWeek.push(t);
          } else {
            later.push(t);
          }
        } catch {
          noDue.push(t);
        }
      });

      const sortByPriorityThenTitle = (arr: TaskItem[]) =>
        [...arr].sort((a, b) => {
          const diff = priorityWeight[b.priority] - priorityWeight[a.priority];
          if (diff !== 0) return diff;
          return a.title.localeCompare(b.title);
        });

      const groups: TaskGroup[] = [
        {
          id: 'overdue',
          title: 'Past',
          icon: <AlertCircle className="h-4 w-4 text-rose-500" />,
          accentClass: 'text-rose-600 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60',
          tasks: sortByPriorityThenTitle(overdue),
        },
        {
          id: 'today',
          title: 'Today',
          icon: <CalendarIcon className="h-4 w-4 text-amber-500" />,
          accentClass: 'text-amber-700 dark:text-amber-400 bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60',
          tasks: sortByPriorityThenTitle(today),
        },
        {
          id: 'tomorrow',
          title: 'Tomorrow',
          icon: <Clock className="h-4 w-4 text-sky-500" />,
          accentClass: 'text-sky-700 dark:text-sky-400 bg-sky-50/70 dark:bg-sky-950/30 border-sky-200 dark:border-sky-900/60',
          tasks: sortByPriorityThenTitle(tomorrow),
        },
        {
          id: 'this_week',
          title: 'Upcoming This Week',
          icon: <CalendarIcon className="h-4 w-4 text-indigo-500" />,
          accentClass: 'text-indigo-700 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/60',
          tasks: sortByPriorityThenTitle(thisWeek),
        },
        {
          id: 'later',
          title: 'Later',
          icon: <CalendarIcon className="h-4 w-4 text-zinc-500" />,
          accentClass: 'text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800',
          tasks: sortByPriorityThenTitle(later),
        },
        {
          id: 'no_due',
          title: 'No Due Date',
          icon: <ListTodo className="h-4 w-4 text-zinc-400" />,
          accentClass: 'text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800',
          tasks: sortByPriorityThenTitle(noDue),
        },
      ];

      return groups.filter((g) => g.tasks.length > 0);
    }

    if (groupBy === 'priority') {
      const high: TaskItem[] = [];
      const medium: TaskItem[] = [];
      const low: TaskItem[] = [];

      displayedTasks.forEach((t) => {
        if (t.priority === 'high') high.push(t);
        else if (t.priority === 'low') low.push(t);
        else medium.push(t);
      });

      const sortByDueDate = (arr: TaskItem[]) =>
        [...arr].sort((a, b) => {
          if (!a.due) return 1;
          if (!b.due) return -1;
          return a.due.localeCompare(b.due);
        });

      const groups: TaskGroup[] = [
        {
          id: 'priority_high',
          title: 'High Priority & Critical',
          icon: <AlertCircle className="h-4 w-4 text-rose-500" />,
          accentClass: 'text-rose-700 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60',
          tasks: sortByDueDate(high),
        },
        {
          id: 'priority_medium',
          title: 'Medium Priority',
          icon: <Clock className="h-4 w-4 text-amber-500" />,
          accentClass: 'text-amber-700 dark:text-amber-400 bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60',
          tasks: sortByDueDate(medium),
        },
        {
          id: 'priority_low',
          title: 'Low Priority',
          icon: <Check className="h-4 w-4 text-zinc-400" />,
          accentClass: 'text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800',
          tasks: sortByDueDate(low),
        },
      ];

      return groups.filter((g) => g.tasks.length > 0);
    }

    return [];
  }, [groupBy, displayedTasks, activeTaskListId, filterMode]);

  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleInlineAddSubtask = (taskId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = inlineSubtaskInput[taskId]?.trim();
    if (!text) return;
    addSubtask(taskId, text);
    setInlineSubtaskInput((prev) => ({ ...prev, [taskId]: '' }));
  };

  const handleModalAddSubtask = () => {
    if (!editingTask || !modalNewSubtask.trim()) return;
    addSubtask(editingTask.id, modalNewSubtask.trim());
    setModalNewSubtask('');
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;

    const tagMatches = quickTaskTitle.match(/#([a-zA-Z0-9_\-]+)/g);
    const extractedTags = tagMatches ? tagMatches.map((m) => m.slice(1).toLowerCase()) : [];
    const cleanTitle = quickTaskTitle.replace(/#[a-zA-Z0-9_\-]+/g, '').trim();

    if (!cleanTitle && !quickTaskTitle.trim()) return;

    const targetListId =
      activeTaskListId === 'all' || activeTaskListId === 'archived_view' || activeTaskListId === 'starred'
        ? taskLists[0]?.id || 'list_default'
        : activeTaskListId;

    const initialTags = Array.from(
      new Set([
        ...extractedTags,
        ...(selectedTag ? [selectedTag.toLowerCase()] : []),
      ])
    );

    await createTask({
      title: (cleanTitle || quickTaskTitle).trim(),
      due: quickDueDate || undefined,
      taskListId: targetListId,
      priority: 'medium',
      tags: initialTags,
    });

    setQuickTaskTitle('');
    setQuickDueDate('');
  };

  const handleStartFocus = (task: TaskItem) => {
    selectTask(task);
    startTimer();
    navigate('/focus');
  };

  const openEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditNotes(task.notes || '');
    setEditDue(task.due || '');
    setEditPriority(task.priority);
    setEditStarred(Boolean(task.starred));
    setEditTags(task.tags ? [...task.tags] : []);
    setNewTagInput('');
    setModalNewSubtask('');
  };

  const handleAddEditTag = (tagToAdd?: string) => {
    const raw = tagToAdd !== undefined ? tagToAdd : newTagInput;
    const clean = raw.trim().replace(/^#/, '').toLowerCase();
    if (!clean) return;
    if (!editTags.includes(clean)) {
      setEditTags((prev) => [...prev, clean]);
    }
    setNewTagInput('');
  };

  const handleRemoveEditTag = (tagToRemove: string) => {
    setEditTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim()) return;

    await updateTask(editingTask.id, {
      title: editTitle.trim(),
      notes: editNotes.trim(),
      due: editDue || undefined,
      priority: editPriority,
      starred: editStarred,
      tags: editTags,
    });

    setEditingTask(null);
  };

  const handleCreateNewList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    const created = await createTaskList(newListTitle.trim());
    setNewListTitle('');
    setIsNewListModalOpen(false);
    if (created?.id) {
      setActiveTaskListId(created.id);
    }
  };

  // Helper to get total unarchived tasks across all lists
  const totalActiveTasksCount = useMemo(() => {
    return tasks.filter((t) => !t.archived && t.status !== 'completed').length;
  }, [tasks]);

  // Helper to get total archived tasks across all lists
  const totalArchivedTasksCount = useMemo(() => {
    return tasks.filter((t) => t.archived || t.status === 'completed').length;
  }, [tasks]);

  const renderTaskItem = (t: TaskItem) => {
    const isCompleted = t.status === 'completed';
    const isArchived = Boolean(t.archived);
    const isOverdue = t.due && isPast(parseISO(t.due)) && !isToday(parseISO(t.due)) && !isCompleted;
    const isDueToday = t.due && isToday(parseISO(t.due)) && !isCompleted;
    const isExpanded = expandedTaskIds.has(t.id);

    // Compact mode: sleek Google Tasks style row with circular checkbox & clean relative date chip
    if (densityMode === 'compact' || densityMode === 'board') {
      return (
        <div
          key={t.id}
          className={`group rounded-xl transition-all duration-150 task-item-enter ${
            isArchived || isCompleted
              ? 'opacity-70 border-b border-zinc-100 dark:border-zinc-800/60'
              : 'hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800/60 last:border-b-0'
          }`}
        >
          <div className="flex items-center justify-between py-2 px-3 min-h-[42px] gap-2">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Circular Checkbox (Google Tasks Style) */}
              <button
                onClick={() => toggleTaskComplete(t.id)}
                className={`h-5 w-5 rounded-[999px] border-2 flex items-center justify-center transition-all duration-150 active:scale-90 shrink-0 cursor-pointer group/chk ${
                  isCompleted
                    ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900'
                    : 'border-zinc-400 dark:border-zinc-500 hover:border-zinc-800 dark:hover:border-zinc-200 bg-transparent'
                }`}
                aria-label="Toggle complete"
              >
                {isCompleted ? (
                  <Check className="h-3 w-3 stroke-[3] task-checkbox-pop" />
                ) : (
                  <Check className="h-3 w-3 stroke-[2.5] text-zinc-400 dark:text-zinc-500 opacity-0 group-hover/chk:opacity-100 transition-opacity" />
                )}
              </button>

              {/* Task Title & Inline Tags */}
              <div
                className="min-w-0 flex-1 cursor-pointer flex flex-col justify-center"
                onClick={() => openEditModal(t)}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[14px] md:text-[15px] font-normal md:font-medium leading-snug transition-colors duration-150 ${
                      isCompleted
                        ? 'line-through text-zinc-400 dark:text-zinc-500'
                        : 'text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-300'
                    }`}
                  >
                    {t.title}
                  </span>

                  {/* Scope list badge when viewing all or archive */}
                  {(activeTaskListId === 'all' || activeTaskListId === 'archived_view' || activeTaskListId === 'starred') && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60">
                      {uniqueTaskLists.find((l) => l.id === t.taskListId)?.title || 'My Tasks'}
                    </span>
                  )}

                  {t.priority === 'high' && (
                    <Badge variant="danger" className="text-[10px] py-0 px-1.5">High</Badge>
                  )}

                  {isArchived && (
                    <Badge variant="outline" className="text-[9px] py-0 px-1 text-zinc-400">
                      Archived
                    </Badge>
                  )}
                </div>

                {/* Subtitle / Google Tasks Metadata Chips (Due Date, Subtasks, Focus) */}
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {t.due && (
                    <span
                      className={`text-[11px] font-medium px-2 py-0.2 rounded-md inline-flex items-center gap-1 ${
                        isOverdue
                          ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 font-semibold'
                          : isDueToday
                          ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-900/40 font-semibold'
                          : 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60'
                      }`}
                    >
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>{formatGoogleTasksDue(t.due)}</span>
                    </span>
                  )}

                  {t.totalFocusSeconds > 0 && (
                    <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.2 rounded-md">
                      <Clock className="h-2.5 w-2.5" />
                      {formatSecondsToHoursMinutes(t.totalFocusSeconds)}
                    </span>
                  )}

                  {/* Subtasks summary toggle */}
                  {t.subtasks && t.subtasks.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskExpanded(t.id);
                      }}
                      className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 px-1.5 py-0.2 rounded-md bg-zinc-100 dark:bg-zinc-800 transition-colors cursor-pointer border border-zinc-200/60 dark:border-zinc-700/60"
                    >
                      <CheckSquare className="h-2.5 w-2.5 text-zinc-400" />
                      <span>
                        {t.subtasks.filter((s) => s.completed).length}/{t.subtasks.length} subtasks
                      </span>
                      <ChevronDown
                        className={`h-2.5 w-2.5 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  )}

                  {/* Task Tags */}
                  {t.tags && t.tags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      {t.tags.map((tg) => (
                        <span
                          key={tg}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTag(selectedTag === tg.toLowerCase() ? null : tg.toLowerCase());
                          }}
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md border transition-colors cursor-pointer ${
                            selectedTag === tg.toLowerCase()
                              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-semibold'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700/80 hover:border-zinc-400'
                          }`}
                          title={`Filter by tag #${tg}`}
                        >
                          #{tg}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions: Star, Start Focus, Archive/Unarchive, Delete */}
            <div className="flex items-center gap-1 shrink-0 ml-2">
              {/* Star toggle button (Google Tasks feature) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStar(t);
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  t.starred
                    ? 'text-sky-500 dark:text-sky-400'
                    : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 opacity-0 group-hover:opacity-100'
                }`}
                title={t.starred ? 'Starred task' : 'Star task'}
              >
                <Star className={`h-4 w-4 ${t.starred ? 'fill-sky-500 dark:fill-sky-400' : ''}`} />
              </button>

              {!isCompleted && !isArchived && (
                <div className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={focusSelection.has(t.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleFocusSelect(t.id);
                    }}
                    className="h-3.5 w-3.5 rounded-sm border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-0 cursor-pointer"
                    title="Select for multi-task Pomodoro"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStartFocus(t)}
                    className="h-6 text-[10px] px-1.5 gap-1 text-zinc-700 dark:text-zinc-300 rounded-md"
                    title="Start Focus on this task"
                  >
                    <Clock className="h-2.5 w-2.5" />
                    <span>Focus</span>
                  </Button>
                </div>
              )}

              {isArchived || isCompleted ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => unarchiveTask(t.id)}
                  className="h-6 w-6 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  title="Restore / Unarchive task"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => archiveTask(t.id)}
                  className="h-6 w-6 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Archive task"
                >
                  <Archive className="h-3 w-3" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteTask(t.id)}
                className="h-6 w-6 text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete task"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Expanded Subtasks in Compact mode */}
          {isExpanded && (
            <div
              className="px-3 pb-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1.5 animate-slide-down bg-zinc-50/50 dark:bg-zinc-900/40"
              onClick={(e) => e.stopPropagation()}
            >
              {(t.subtasks || []).map((st) => (
                <div key={st.id} className="flex items-center justify-between text-xs py-0.5 group/st">
                  <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => toggleSubtask(t.id, st.id)}
                      className="h-3.5 w-3.5 rounded-sm border-zinc-300 dark:border-zinc-700"
                    />
                    <span className={`truncate ${st.completed ? 'line-through text-zinc-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                      {st.title}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => deleteSubtask(t.id, st.id)}
                    className="text-zinc-400 hover:text-rose-500 p-0.5 opacity-0 group/st:opacity-100 transition-opacity cursor-pointer"
                    title="Delete subtask"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              <form onSubmit={(e) => handleInlineAddSubtask(t.id, e)} className="flex items-center gap-1.5 pt-1">
                <input
                  type="text"
                  placeholder="Add subtask..."
                  value={inlineSubtaskInput[t.id] || ''}
                  onChange={(e) => setInlineSubtaskInput((prev) => ({ ...prev, [t.id]: e.target.value }))}
                  className="text-xs bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-1 flex-1 focus:outline-none"
                />
                <Button type="submit" variant="outline" size="sm" className="h-6 text-[10px] px-2">
                  Add
                </Button>
              </form>
            </div>
          )}
        </div>
      );
    }

    // Comfortable mode: spacious clay cards with notes preview
    return (
      <div
        key={t.id}
        className={`group flex items-start justify-between p-3.5 rounded-2xl border transition-all duration-200 task-item-enter ${
          isArchived || isCompleted
            ? 'border-zinc-200/60 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-900/30 opacity-75'
            : 'border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-[0_4px_12px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.95)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] hover:-translate-y-0.5'
        }`}
      >
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Circular Checkbox (Google Tasks Style) */}
          <button
            onClick={() => toggleTaskComplete(t.id)}
            className={`mt-0.5 h-5 w-5 rounded-[999px] border-2 flex items-center justify-center transition-all duration-150 active:scale-90 shrink-0 cursor-pointer group/chk ${
              isCompleted
                ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900'
                : 'border-zinc-400 dark:border-zinc-500 hover:border-zinc-800 dark:hover:border-zinc-200 bg-transparent'
            }`}
            aria-label="Toggle complete"
          >
            {isCompleted ? (
              <Check className="h-3 w-3 stroke-[3] task-checkbox-pop" />
            ) : (
              <Check className="h-3 w-3 stroke-[2.5] text-zinc-400 dark:text-zinc-500 opacity-0 group-hover/chk:opacity-100 transition-opacity" />
            )}
          </button>

          {/* Task Title & Details */}
          <div
            className="min-w-0 flex-1 cursor-pointer"
            onClick={() => openEditModal(t)}
          >
            <span
              className={`text-[15px] font-medium block truncate transition-colors duration-150 ${
                isCompleted
                  ? 'line-through text-zinc-400 dark:text-zinc-500'
                  : 'text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              {t.title}
            </span>
            {t.notes && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                {t.notes}
              </p>
            )}

            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {/* Scope list badge when viewing all or archive */}
              {(activeTaskListId === 'all' || activeTaskListId === 'archived_view' || activeTaskListId === 'starred') && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60">
                  {uniqueTaskLists.find((l) => l.id === t.taskListId)?.title || 'My Tasks'}
                </span>
              )}

              {t.due && (
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-md flex items-center gap-1.5 ${
                    isOverdue
                      ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 font-semibold'
                      : isDueToday
                      ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-900/40 font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60'
                  }`}
                >
                  <Clock className="h-3 w-3 shrink-0" />
                  <span>{formatGoogleTasksDue(t.due)}</span>
                </span>
              )}

              {t.totalFocusSeconds > 0 && (
                <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">
                  <Clock className="h-3 w-3" />
                  {formatSecondsToHoursMinutes(t.totalFocusSeconds)} ({t.pomodoroCount} pomodoros)
                </span>
              )}

              {t.priority === 'high' && (
                <Badge variant="danger">High</Badge>
              )}

              {isArchived && (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-zinc-400">
                  Archived
                </Badge>
              )}

              {/* Subtasks summary toggle */}
              {t.subtasks && t.subtasks.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTaskExpanded(t.id);
                  }}
                  className="flex items-center gap-1 text-[11px] font-mono text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 transition-colors cursor-pointer border border-zinc-200/60 dark:border-zinc-700/60"
                >
                  <CheckSquare className="h-3 w-3 text-zinc-400" />
                  <span>
                    {t.subtasks.filter((s) => s.completed).length}/{t.subtasks.length} subtasks
                  </span>
                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              )}

              {/* Task Tags */}
              {t.tags && t.tags.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {t.tags.map((tg) => (
                    <span
                      key={tg}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTag(selectedTag === tg.toLowerCase() ? null : tg.toLowerCase());
                      }}
                      className={`text-xs font-mono px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                        selectedTag === tg.toLowerCase()
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-semibold'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/80 hover:border-zinc-400'
                      }`}
                      title={`Filter by tag #${tg}`}
                    >
                      #{tg}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Expanded Subtasks View */}
            {isExpanded && (
              <div
                className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1.5 animate-slide-down"
                onClick={(e) => e.stopPropagation()}
              >
                {(t.subtasks || []).map((st) => (
                  <div key={st.id} className="flex items-center justify-between text-xs py-0.5 group/st">
                    <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => toggleSubtask(t.id, st.id)}
                        className="h-3.5 w-3.5 rounded-sm border-zinc-300 dark:border-zinc-700"
                      />
                      <span className={`truncate ${st.completed ? 'line-through text-zinc-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                        {st.title}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => deleteSubtask(t.id, st.id)}
                      className="text-zinc-400 hover:text-rose-500 p-0.5 opacity-0 group/st:opacity-100 transition-opacity cursor-pointer"
                      title="Delete subtask"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                <form onSubmit={(e) => handleInlineAddSubtask(t.id, e)} className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    placeholder="Add subtask..."
                    value={inlineSubtaskInput[t.id] || ''}
                    onChange={(e) => setInlineSubtaskInput((prev) => ({ ...prev, [t.id]: e.target.value }))}
                    className="text-xs bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-sm px-2 py-1 flex-1 focus:outline-none"
                  />
                  <Button type="submit" variant="outline" size="sm" className="h-6 text-[10px] px-2">
                    Add
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 ml-3">
          {/* Star toggle button (Google Tasks feature) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleStar(t);
            }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              t.starred
                ? 'text-sky-500 dark:text-sky-400'
                : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 opacity-0 group-hover:opacity-100'
            }`}
            title={t.starred ? 'Starred task' : 'Star task'}
          >
            <Star className={`h-4 w-4 ${t.starred ? 'fill-sky-500 dark:fill-sky-400' : ''}`} />
          </button>

          {!isCompleted && !isArchived && (
            <div className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={focusSelection.has(t.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleFocusSelect(t.id);
                }}
                className="h-4 w-4 rounded-sm border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-0 cursor-pointer"
                title="Select for multi-task Pomodoro"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStartFocus(t)}
                className="h-7 text-xs px-2 gap-1 text-zinc-700 dark:text-zinc-300"
                title="Start Focus on this task"
              >
                <Clock className="h-3 w-3" />
                <span>Focus</span>
              </Button>
            </div>
          )}

          {isArchived || isCompleted ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => unarchiveTask(t.id)}
              className="h-7 w-7 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              title="Restore / Unarchive task"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => archiveTask(t.id)}
              className="h-7 w-7 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Archive task"
            >
              <Archive className="h-3.5 w-3.5" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteTask(t.id)}
            className="h-7 w-7 text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete task"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full bg-white dark:bg-zinc-950 overflow-hidden select-none view-enter">
      {/* Left List Selector Sidebar */}
      {/* Left List Selector Sidebar */}
      <div className="w-64 border-r border-zinc-200 dark:border-zinc-800 p-3.5 flex flex-col space-y-3 bg-zinc-50/50 dark:bg-zinc-900/30 shrink-0">
        {/* All Tasks & Starred Navigation Items */}
        <div className="space-y-1">
          <button
            onClick={() => {
              setActiveTaskListId('all');
              setFilterMode('active');
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
              activeTaskListId === 'all'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs font-semibold'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <ListTodo className="h-4.5 w-4.5 shrink-0 text-zinc-500 dark:text-zinc-400" />
              <span className="truncate">All tasks</span>
            </div>
            {totalActiveTasksCount > 0 && (
              <span
                className={`text-xs font-mono px-2 py-0.5 rounded-md ${
                  activeTaskListId === 'all'
                    ? 'bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {totalActiveTasksCount}
              </span>
            )}
          </button>

          {/* Starred Tasks Item (Google Tasks) */}
          <button
            onClick={() => {
              setActiveTaskListId('starred');
              setFilterMode('active');
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
              activeTaskListId === 'starred'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs font-semibold'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <Star className="h-4.5 w-4.5 shrink-0 text-amber-500 fill-amber-500" />
              <span className="truncate">Starred</span>
            </div>
            {totalStarredCount > 0 && (
              <span
                className={`text-xs font-mono px-2 py-0.5 rounded-md ${
                  activeTaskListId === 'starred'
                    ? 'bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {totalStarredCount}
              </span>
            )}
          </button>
        </div>

        {/* Task Lists Section */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800/80 px-1">
          <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Lists
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsNewListModalOpen(true)}
            className="h-7 w-7 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg"
            title="Create new list"
          >
            <ListPlus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-1 overflow-y-auto flex-1">
          {uniqueTaskLists.map((list) => {
            const count = tasks.filter((t) => {
              if (t.archived || t.status === 'completed') return false;
              if (t.taskListId === list.id) return true;
              if (list.googleTaskListId && (t.taskListId === list.googleTaskListId || t.taskListId === `gtl_${list.googleTaskListId}`)) return true;
              if (list.isDefault && (t.taskListId === 'list_default' || t.taskListId === '@default' || t.taskListId === list.googleTaskListId || t.taskListId === `gtl_${list.googleTaskListId}`)) return true;
              return false;
            }).length;

            const isSelected = list.id === activeTaskListId;

            return (
              <button
                key={list.id}
                onClick={() => {
                  setActiveTaskListId(list.id);
                  if (activeTaskListId === 'archived_view') setFilterMode('active');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs font-semibold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <CheckSquare className="h-4 w-4 shrink-0 text-zinc-400" />
                  <span className="truncate">{list.title}</span>
                </div>
                {count > 0 && (
                  <span
                    className={`text-xs font-mono px-2 py-0.5 rounded-md ${
                      isSelected
                        ? 'bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Google Tasks style "+ Create new list" CTA */}
          <button
            type="button"
            onClick={() => setIsNewListModalOpen(true)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-xl transition-all cursor-pointer mt-1"
          >
            <Plus className="h-4 w-4 shrink-0 text-zinc-500" />
            <span>Create new list</span>
          </button>
        </div>

        {/* Tags Section In Sidebar */}
        {allUniqueTags.length > 0 && (
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 space-y-1">
            <div className="flex items-center justify-between px-3 py-1 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              <span>Tags</span>
              {selectedTag && (
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className="text-[10px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 font-normal normal-case cursor-pointer"
                >
                  Clear filter
                </button>
              )}
            </div>
            <div className="space-y-0.5 max-h-36 overflow-y-auto">
              {allUniqueTags.map(([tag, count]) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(isSelected ? null : tag)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs font-semibold'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-zinc-400 font-mono">#</span>
                      <span className="truncate">{tag}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                        isSelected
                          ? 'bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800'
                          : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Archived Section In Sidebar */}
        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 space-y-1">
          <button
            onClick={() => {
              setActiveTaskListId('archived_view');
              setFilterMode('archived');
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
              activeTaskListId === 'archived_view'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs font-semibold'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <Archive className="h-4.5 w-4.5 shrink-0 text-zinc-500" />
              <span className="truncate">Archived Tasks</span>
            </div>
            {totalArchivedTasksCount > 0 && (
              <span
                className={`text-xs font-mono px-2 py-0.5 rounded-md ${
                  activeTaskListId === 'archived_view'
                    ? 'bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {totalArchivedTasksCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Task List Area with Scoped Zoom-Out & Expanded Canvas Width */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-4 md:p-6 w-full max-w-6xl xl:max-w-7xl 2xl:max-w-full mx-auto space-y-4 tasks-zoomout-container">
        {/* List Header & Top Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {activeTaskListId === 'all'
                  ? 'All Tasks'
                  : activeTaskListId === 'starred'
                  ? 'Starred Tasks'
                  : activeTaskListId === 'archived_view'
                  ? 'Archived Tasks'
                  : activeList?.title || 'My Tasks'}
              </h2>

              {/* Sync / Reconnect Button */}
              <Button
                variant={isGoogleTokenExpired ? 'outline' : 'ghost'}
                size="sm"
                onClick={handleSyncOrReconnect}
                disabled={isSyncing || isReconnecting}
                className={`h-7 text-xs gap-1.5 px-2 rounded-md ${
                  isGoogleTokenExpired
                    ? 'text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
                title={
                  isGoogleTokenExpired
                    ? 'Google session expired (1-hour token limit). Click to reconnect.'
                    : lastSyncTime
                    ? `Last synced ${lastSyncTime.toLocaleTimeString()}`
                    : 'Sync with Google Tasks'
                }
              >
                {isGoogleTokenExpired ? (
                  <AlertCircle className={`h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 ${isReconnecting ? 'animate-spin' : ''}`} />
                ) : (
                  <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-sky-500' : ''}`} />
                )}
                <span className="hidden sm:inline">
                  {isReconnecting ? 'Reconnecting...' : isGoogleTokenExpired ? 'Reconnect' : isSyncing ? 'Syncing...' : 'Sync'}
                </span>
              </Button>

              {/* Delete Custom List */}
              {activeList && !activeList.isDefault && activeTaskListId !== 'all' && activeTaskListId !== 'archived_view' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTaskList(activeList.id)}
                  className="h-7 text-xs text-rose-500 hover:text-rose-600 gap-1 px-2"
                  title="Delete current task list"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Delete List</span>
                </Button>
              )}
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {activeTaskListId === 'archived_view'
                ? 'Completed tasks are safely archived here for clean, focused productivity.'
                : 'Google Tasks synchronized with automatic archiving for completed tasks.'}
            </p>
          </div>

          {/* Header Action Buttons & Archive Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Archive All Completed Button (if completed unarchived tasks exist) */}
            {completedUnarchivedCount > 0 && activeTaskListId !== 'archived_view' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => archiveCompletedTasks(activeTaskListId)}
                className="h-8 text-xs gap-1.5 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                title="Archive completed tasks to clean up your view"
              >
                <Archive className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" />
                <span>Archive Completed ({completedUnarchivedCount})</span>
              </Button>
            )}

            {/* Clear All Archived Button (in archived view) */}
            {activeTaskListId === 'archived_view' && archivedScopedTasks.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearArchivedTasks(activeTaskListId)}
                className="h-8 text-xs text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1.5"
                title="Permanently remove all archived tasks"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear All Archived</span>
              </Button>
            )}

            {/* Density Selector: Compact | Comfortable | Board */}
            <div className="flex items-center rounded-md border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-50 dark:bg-zinc-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
              {(['compact', 'comfortable', 'board'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleSetDensityMode(mode)}
                  className={`px-2 py-1 text-xs font-medium rounded-sm capitalize transition-all duration-150 ${
                    densityMode === mode
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  }`}
                  title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} density mode`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            {/* Group By Selector */}
            <div className="flex items-center gap-1 text-xs text-zinc-500 border border-zinc-200 dark:border-zinc-800 rounded-md px-2 py-1 bg-zinc-50 dark:bg-zinc-900">
              <Layers className="h-3.5 w-3.5 text-zinc-400" />
              <select
                value={groupBy}
                onChange={(e) => handleSetGroupBy(e.target.value as any)}
                className="bg-transparent text-xs font-medium text-zinc-700 dark:text-zinc-300 border-0 focus:outline-none cursor-pointer"
              >
                <option value="due">Group: Due Date</option>
                <option value="priority">Group: Priority</option>
                <option value="none">Group: Flat List</option>
              </select>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1 text-xs text-zinc-500 border border-zinc-200 dark:border-zinc-800 rounded-md px-2 py-1 bg-zinc-50 dark:bg-zinc-900">
              <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-medium text-zinc-700 dark:text-zinc-300 border-0 focus:outline-none cursor-pointer"
              >
                <option value="order">Order: Default</option>
                <option value="due">Sort: Due Date</option>
                <option value="priority">Sort: Priority</option>
                <option value="title">Sort: Title</option>
              </select>
            </div>

            {/* Filter Mode Buttons (when not in full archived_view) */}
            {activeTaskListId !== 'archived_view' && (
              <div className="flex items-center rounded-md border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-50 dark:bg-zinc-900">
                {(['active', 'archived', 'all'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFilterMode(mode)}
                    className={`px-3 py-1 text-xs font-medium rounded-sm capitalize transition-all duration-150 ${
                      filterMode === mode
                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Google Session Expiration Reconnect Alert */}
        {isGoogleTokenExpired && (
          <div className="rounded-md border border-amber-300 dark:border-amber-800/80 bg-amber-50/80 dark:bg-amber-950/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs view-enter">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold text-amber-900 dark:text-amber-200">
                  Google Tasks Session Expired
                </div>
                <p className="text-amber-700 dark:text-amber-300 mt-0.5">
                  Google OAuth tokens expire after 1 hour. Reconnect your Google account to resume 2-way synchronization of your tasks.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSyncOrReconnect}
              disabled={isReconnecting || isSyncing}
              className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-600 dark:hover:bg-amber-500 font-medium rounded-md"
            >
              {isReconnecting ? 'Reconnecting...' : 'Reconnect & Sync'}
            </Button>
          </div>
        )}

        {/* Search & Quick Add Section */}
        {activeTaskListId !== 'archived_view' && (
          <div className="space-y-2.5">
            {/* Instant Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-8 rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.04)] dark:shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.4)] focus:outline-none focus:ring-2 focus:ring-zinc-400/30 transition-all duration-150"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Inline Quick Add Task (Google Tasks Style) */}
            <form
              onSubmit={handleQuickAdd}
              className="flex items-center gap-2.5 p-2 rounded-xl border border-zinc-300/80 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 shadow-sm focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-500 transition-all duration-150"
            >
              <div className="flex items-center justify-center h-6 w-6 rounded-md bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 ml-1 shrink-0">
                <Plus className="h-4 w-4 stroke-[2.5]" />
              </div>
              <input
                ref={quickInputRef}
                type="text"
                placeholder="Add a task (press Enter to save)..."
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                className="flex-1 bg-transparent text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none px-1"
              />
              <input
                type="date"
                value={quickDueDate}
                onChange={(e) => setQuickDueDate(e.target.value)}
                className="text-xs font-mono text-zinc-500 bg-transparent border-0 focus:outline-none pr-2 cursor-pointer"
              />
              <Button type="submit" variant="primary" size="sm" className="h-7 px-3.5 text-xs font-semibold rounded-lg">
                Add
              </Button>
            </form>
          </div>
        )}

        {/* Active Tag Filter Indicator */}
        {selectedTag && (
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                Filtered by tag:
              </span>
              <span className="font-mono px-2 py-0.5 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold">
                #{selectedTag}
              </span>
              <span className="text-zinc-500 font-mono">
                ({displayedTasks.length} {displayedTasks.length === 1 ? 'task' : 'tasks'})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className="flex items-center gap-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer text-xs"
            >
              <X className="h-3.5 w-3.5" />
              <span>Clear Filter</span>
            </button>
          </div>
        )}

        {/* Multi-Task Focus Launch Banner */}
        {focusSelection.size > 0 && (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md border border-zinc-700 dark:border-zinc-300 animate-slide-down">
            <div className="flex items-center gap-2 text-xs font-medium">
              <Clock className="h-4 w-4" />
              <span>{focusSelection.size} {focusSelection.size === 1 ? 'task' : 'tasks'} selected for Pomodoro</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartMultiTaskFocus}
                className="h-7 text-xs px-3 bg-white text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-white"
              >
                Start Multi-Task Focus
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFocusSelection(new Set())}
                className="h-7 text-xs px-2 text-zinc-300 dark:text-zinc-600 hover:text-white dark:hover:text-black"
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Task Items List (Google Tasks Central Sheet) */}
        <div className={`space-y-4 ${densityMode !== 'board' ? 'bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 md:p-6 shadow-sm' : ''}`}>
          {displayedTasks.length === 0 ? (
            <div className="py-16 text-center text-xs text-zinc-400 animate-fade-in">
              {searchQuery
                ? 'No tasks match your search filter.'
                : activeTaskListId === 'starred'
                ? 'No starred tasks found. Star tasks to highlight your top priorities.'
                : activeTaskListId === 'archived_view'
                ? 'No archived tasks yet. Completed tasks will appear here.'
                : filterMode === 'archived'
                ? 'No archived tasks in this list.'
                : 'No active tasks found. Enjoy your clear schedule!'}
            </div>
          ) : densityMode === 'board' ? (
            taskGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 items-start animate-fade-in">
                {taskGroups.map((group) => (
                  <div
                    key={group.id}
                    className="clay-surface p-3.5 rounded-2xl flex flex-col gap-2 min-w-0"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
                      <div className="flex items-center gap-1.5 min-w-0 font-semibold text-xs text-zinc-800 dark:text-zinc-200">
                        {group.icon}
                        <span className="truncate">{group.title}</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60">
                        {group.tasks.length}
                      </span>
                    </div>
                    <div className="space-y-1.5 mt-1 overflow-y-auto max-h-[70vh]">
                      {group.tasks.map(renderTaskItem)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-start animate-fade-in">
                {displayedTasks.map(renderTaskItem)}
              </div>
            )
          ) : taskGroups.length > 0 ? (
            <div className="space-y-6">
              {taskGroups.map((group) => {
                const isCollapsed = collapsedGroups.has(group.id);
                return (
                  <div key={group.id} className="space-y-2">
                    <button
                      type="button"
                      onClick={() => toggleGroupCollapse(group.id)}
                      className="flex items-center gap-2 w-full text-left py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        {group.icon}
                        <span className={`truncate ${
                          group.id === 'overdue' ? 'text-rose-500 dark:text-rose-400 font-bold' :
                          group.id === 'today' ? 'text-sky-500 dark:text-sky-400 font-bold' :
                          group.id === 'tomorrow' ? 'text-indigo-500 dark:text-indigo-400 font-bold' : ''
                        }`}>{group.title}</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60">
                        {group.tasks.length}
                      </span>
                      <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800 ml-2" />
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${
                          isCollapsed ? '-rotate-90' : ''
                        }`}
                      />
                    </button>

                    {!isCollapsed && (
                      <div className={`animate-slide-down ${densityMode === 'compact' ? 'space-y-0' : 'space-y-2'}`}>
                        {group.tasks.map(renderTaskItem)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={densityMode === 'compact' ? 'space-y-0' : 'space-y-2'}>
              {displayedTasks.map(renderTaskItem)}
            </div>
          )}
        </div>

        {/* Collapsible Archived Accordion in Active View */}
        {filterMode === 'active' && archivedScopedTasks.length > 0 && activeTaskListId !== 'archived_view' && (
          <div className="pt-4 mt-6 border-t border-zinc-200 dark:border-zinc-800/80 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsArchivedSectionOpen(!isArchivedSectionOpen)}
                className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group cursor-pointer"
              >
                <ChevronRight
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isArchivedSectionOpen ? 'rotate-90 text-zinc-900 dark:text-zinc-100' : ''
                  }`}
                />
                <span>Archived Tasks</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {archivedScopedTasks.length}
                </span>
              </button>

              {isArchivedSectionOpen && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearArchivedTasks(activeTaskListId)}
                  className="h-7 text-xs text-rose-500 hover:text-rose-600 gap-1 px-2"
                  title="Clear all archived tasks from this list"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Clear Archive</span>
                </Button>
              )}
            </div>

            {isArchivedSectionOpen && (
              <div className="space-y-2 pt-1 animate-slide-down">
                {archivedScopedTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-zinc-200/50 dark:border-zinc-800/40 bg-zinc-50/60 dark:bg-zinc-900/30 opacity-80 hover:opacity-100 transition-opacity"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => unarchiveTask(t.id)}
                        className="h-4 w-4 rounded-sm border bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900 flex items-center justify-center shrink-0"
                        title="Click to restore / unarchive"
                      >
                        <Check className="h-3 w-3 stroke-[3]" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-medium line-through text-zinc-400 dark:text-zinc-500 block truncate">
                          {t.title}
                        </span>
                        {t.archivedAt && (
                          <span className="text-[10px] text-zinc-400 font-mono">
                            Archived {new Date(t.archivedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => unarchiveTask(t.id)}
                        className="h-7 text-xs px-2 gap-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                        title="Restore task"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Restore</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTask(t.id)}
                        className="h-7 w-7 text-zinc-400 hover:text-rose-500"
                        title="Delete permanently"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Task Modal */}
      <Modal
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        title="Edit Task Details"
        description="Update task notes, schedule, or priority."
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input
            label="Task Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
            autoFocus
          />

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Notes
            </label>
            <textarea
              rows={3}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Add details, background context, or links..."
              className="w-full rounded-md border border-zinc-300/80 dark:border-zinc-700/80 bg-white dark:bg-zinc-950 p-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_5px_0_rgba(0,0,0,0.45)] focus:outline-none focus:ring-2 focus:ring-zinc-400/30 dark:focus:ring-zinc-600/30 transition-all duration-150"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Subtasks ({currentEditingTask?.subtasks?.length || 0})
            </label>
            <div className="space-y-1.5 border border-zinc-200 dark:border-zinc-800 rounded-md p-2.5 bg-zinc-50/50 dark:bg-zinc-900/50">
              {currentEditingTask?.subtasks && currentEditingTask.subtasks.length > 0 ? (
                currentEditingTask.subtasks.map((st) => (
                  <div key={st.id} className="flex items-center justify-between text-xs py-0.5">
                    <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => currentEditingTask && toggleSubtask(currentEditingTask.id, st.id)}
                        className="h-3.5 w-3.5 rounded-sm border-zinc-300 dark:border-zinc-700"
                      />
                      <span className={st.completed ? 'line-through text-zinc-400' : 'text-zinc-800 dark:text-zinc-200'}>
                        {st.title}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => currentEditingTask && deleteSubtask(currentEditingTask.id, st.id)}
                      className="text-zinc-400 hover:text-rose-500 p-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-zinc-400 py-1">No subtasks added yet.</div>
              )}

              <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                <input
                  type="text"
                  placeholder="New subtask title..."
                  value={modalNewSubtask}
                  onChange={(e) => setModalNewSubtask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleModalAddSubtask();
                    }
                  }}
                  className="text-xs bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-sm px-2 py-1 flex-1 focus:outline-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleModalAddSubtask}
                  className="h-7 text-xs px-2"
                >
                  Add Subtask
                </Button>
              </div>
            </div>
          </div>

          {/* Tags Management */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Tags ({editTags.length})
            </label>
            <div className="space-y-2 border border-zinc-200 dark:border-zinc-800 rounded-md p-2.5 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                {editTags.map((tg) => (
                  <span
                    key={tg}
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
                  >
                    <span>#{tg}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEditTag(tg)}
                      className="text-zinc-400 hover:text-rose-500 p-0.5 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {editTags.length === 0 && (
                  <span className="text-[11px] text-zinc-400 py-0.5">No tags assigned yet.</span>
                )}
              </div>

              <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                <input
                  type="text"
                  placeholder="New tag (e.g. backend, deepwork)..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddEditTag();
                    }
                  }}
                  className="text-xs bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-sm px-2 py-1 flex-1 focus:outline-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddEditTag()}
                  className="h-7 text-xs px-2"
                >
                  Add Tag
                </Button>
              </div>

              {allUniqueTags.filter(([t]) => !editTags.includes(t)).length > 0 && (
                <div className="pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
                  <span className="text-[10px] text-zinc-400 block mb-1">Suggested from existing tasks:</span>
                  <div className="flex flex-wrap gap-1">
                    {allUniqueTags
                      .filter(([t]) => !editTags.includes(t))
                      .slice(0, 8)
                      .map(([t]) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handleAddEditTag(t)}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                        >
                          + #{t}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Due Date"
              type="date"
              value={editDue}
              onChange={(e) => setEditDue(e.target.value)}
            />
            <Select
              label="Priority"
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
            />
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={editStarred}
                onChange={(e) => setEditStarred(e.target.checked)}
                className="h-4 w-4 rounded-sm border-zinc-300 dark:border-zinc-700 text-sky-600 focus:ring-sky-500"
              />
              <span className="flex items-center gap-1.5">
                <Star className={`h-3.5 w-3.5 ${editStarred ? 'text-amber-500 fill-amber-500' : 'text-zinc-400'}`} />
                <span>Mark as Starred (highlight in Starred view)</span>
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingTask(null)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* New Task List Modal */}
      <Modal
        isOpen={isNewListModalOpen}
        onClose={() => setIsNewListModalOpen(false)}
        title="Create New Task List"
        description="Organize tasks into distinct domains or projects."
      >
        <form onSubmit={handleCreateNewList} className="space-y-4">
          <Input
            label="List Name"
            placeholder="e.g., Engineering Objectives"
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            required
            autoFocus
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewListModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create List
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
