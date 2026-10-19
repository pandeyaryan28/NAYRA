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
  SlidersHorizontal,
  Folder,
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
import { isToday, isPast, isTomorrow, isThisWeek, parseISO, format, addDays, isAfter, startOfDay } from 'date-fns';
import { HStack, VStack, Spacer, Divider } from '@/components/swiftui/SwiftUIStack';

export function isTaskInList(task: TaskItem, list: TaskList, allLists?: TaskList[]): boolean {
  if (!task || !list) return false;

  const isListDefault =
    list.isDefault ||
    list.id === 'list_default' ||
    (list.title || '').trim().toLowerCase() === 'my tasks';

  const taskListTitle = (task.taskListName || '').trim().toLowerCase();
  const targetListTitle = (list.title || '').trim().toLowerCase();

  // Helper: check if task explicitly matches a list by exact ID or Google Task List ID
  const matchesListById = (t: TaskItem, l: TaskList): boolean => {
    if (!t.taskListId) return false;
    if (t.taskListId === l.id) return true;
    if (l.googleTaskListId && l.googleTaskListId !== '@default' && l.googleTaskListId !== 'list_default') {
      if (
        t.taskListId === l.googleTaskListId ||
        t.taskListId === `gtl_${l.googleTaskListId}` ||
        t.taskListId.replace('gtl_', '') === l.googleTaskListId
      ) {
        return true;
      }
    }
    return false;
  };

  // 1. Direct ID match on custom list: absolute precedence
  const isCustomList = !isListDefault;
  if (isCustomList && matchesListById(task, list)) {
    return true;
  }

  // 2. If the task's taskListId belongs to another custom list, it CANNOT belong to this list
  if (allLists && allLists.length > 0) {
    const belongsToAnotherCustomList = allLists.some(
      (other) =>
        other.id !== list.id &&
        !(other.isDefault || other.id === 'list_default' || (other.title || '').trim().toLowerCase() === 'my tasks') &&
        matchesListById(task, other)
    );
    if (belongsToAnotherCustomList) {
      return false;
    }
  }

  // 3. Fallback: If task carries a taskListName naming a known custom list (e.g. recovering corrupted list_default tasks)
  if (taskListTitle && taskListTitle !== 'my tasks') {
    if (allLists && allLists.some((other) => (other.title || '').trim().toLowerCase() === taskListTitle)) {
      return targetListTitle === taskListTitle;
    }
  }

  // 4. Default list resolution
  if (isListDefault) {
    if (!task.taskListId || task.taskListId === 'list_default' || task.taskListId === '@default') {
      return true;
    }
    if (matchesListById(task, list)) {
      return true;
    }
  }

  return false;
}

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
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // Collapsible sections
  const [isCompletedSectionOpen, setIsCompletedSectionOpen] = useState(true);
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
      if (!t || !Array.isArray(t.tags)) return;
      const uniqueTaskTags = new Set(
        t.tags
          .filter((tg): tg is string => typeof tg === 'string' && tg.trim().length > 0)
          .map((tg) => tg.trim().toLowerCase())
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

  // Deduplicated task lists
  // Deduplicated task lists (guaranteeing My Tasks is placed first at the top)
  const uniqueTaskLists = useMemo(() => {
    const seenGtl = new Set<string>();
    const seenTitles = new Set<string>();
    const res: TaskList[] = [];

    // Find default "My Tasks" list first
    const defaultList =
      taskLists.find(
        (l) =>
          (l.title || '').trim().toLowerCase() === 'my tasks' ||
          l.id === 'list_default' ||
          l.googleTaskListId === '@default'
      ) ||
      taskLists.find(
        (l) => l.isDefault && (l.title || '').trim().toLowerCase() === 'my tasks'
      );
    if (defaultList) {
      res.push({
        ...defaultList,
        id: defaultList.id || 'list_default',
        title: defaultList.title || 'My Tasks',
        isDefault: true,
      });
      seenTitles.add('my tasks');
      if (defaultList.googleTaskListId && defaultList.googleTaskListId !== '@default') {
        seenGtl.add(defaultList.googleTaskListId);
      }
    }

    for (const list of taskLists) {
      const norm = (list.title || '').trim().toLowerCase();
      if (norm === 'my tasks' || list.id === 'list_default' || list.googleTaskListId === '@default') {
        continue;
      }
      if (list.googleTaskListId && seenGtl.has(list.googleTaskListId)) continue;
      if (res.some((r) => r.id === list.id)) continue;
      if (!list.googleTaskListId && seenTitles.has(norm)) continue;

      if (list.googleTaskListId) seenGtl.add(list.googleTaskListId);
      seenTitles.add(norm);
      res.push({
        ...list,
        isDefault: false,
      });
    }

    // If no default list existed, prepend a synthetic My Tasks
    if (!res.some((l) => l.isDefault)) {
      res.unshift({
        id: 'list_default',
        googleTaskListId: '@default',
        title: 'My Tasks',
        isDefault: true,
        updatedAt: new Date().toISOString(),
      });
    }

    return res;
  }, [taskLists]);

  // Active list lookup
  const activeList = useMemo(() => {
    if (
      activeTaskListId === 'all' ||
      activeTaskListId === 'archived_view' ||
      activeTaskListId === 'starred' ||
      activeTaskListId === 'today' ||
      activeTaskListId === 'upcoming'
    )
      return null;

    const matched =
      uniqueTaskLists.find((l) => l.id === activeTaskListId) ||
      uniqueTaskLists.find(
        (l) => l.googleTaskListId && (activeTaskListId === l.googleTaskListId || activeTaskListId === `gtl_${l.googleTaskListId}`)
      );

    if (matched) return matched;

    // Only default to My Tasks if activeTaskListId specifically points to default or is empty
    if (!activeTaskListId || activeTaskListId === 'list_default' || activeTaskListId === '@default') {
      return uniqueTaskLists.find((l) => l.isDefault) || uniqueTaskLists[0] || null;
    }

    return null;
  }, [uniqueTaskLists, activeTaskListId]);

  // Total count of starred active tasks
  const totalStarredCount = useMemo(() => {
    return tasks.filter((t) => !t.archived && t.status !== 'completed' && !t.completed && Boolean(t.starred)).length;
  }, [tasks]);

  // In Apple Reminders, Today includes active tasks due today AND overdue/past tasks
  const todayTasksCount = useMemo(() => {
    return tasks.filter((t) => {
      if (t.archived || t.status === 'completed' || t.completed || !t.due) return false;
      try {
        const parsed = parseISO(t.due);
        return !isAfter(startOfDay(parsed), startOfDay(new Date()));
      } catch {
        return false;
      }
    }).length;
  }, [tasks]);

  // Scheduled / Upcoming tasks (tomorrow and future)
  const upcomingTasksCount = useMemo(() => {
    return tasks.filter((t) => {
      if (t.archived || t.status === 'completed' || t.completed || !t.due) return false;
      try {
        const parsed = parseISO(t.due);
        return isAfter(startOfDay(parsed), startOfDay(new Date()));
      } catch {
        return false;
      }
    }).length;
  }, [tasks]);

  // Tasks belonging to active scope
  const scopedTasks = useMemo(() => {
    if (activeTaskListId === 'all' || activeTaskListId === 'archived_view') {
      return tasks;
    }
    if (activeTaskListId === 'starred') {
      return tasks.filter((t) => Boolean(t.starred));
    }
    if (activeTaskListId === 'today') {
      return tasks.filter((t) => {
        if (!t.due) return false;
        try {
          const parsed = parseISO(t.due);
          return !isAfter(startOfDay(parsed), startOfDay(new Date()));
        } catch {
          return false;
        }
      });
    }
    if (activeTaskListId === 'upcoming') {
      return tasks.filter((t) => {
        if (!t.due) return false;
        try {
          const parsed = parseISO(t.due);
          return isAfter(startOfDay(parsed), startOfDay(new Date()));
        } catch {
          return false;
        }
      });
    }

    const targetList =
      activeList ||
      uniqueTaskLists.find((l) => l.id === activeTaskListId) ||
      uniqueTaskLists.find(
        (l) => l.googleTaskListId && (activeTaskListId === l.googleTaskListId || activeTaskListId === `gtl_${l.googleTaskListId}`)
      );

    if (!targetList) {
      if (!activeTaskListId || activeTaskListId === 'list_default' || activeTaskListId === '@default') {
        const def = uniqueTaskLists.find((l) => l.isDefault) || uniqueTaskLists[0];
        if (!def) return tasks;
        return tasks.filter((t) => isTaskInList(t, def, uniqueTaskLists));
      }
      return tasks.filter((t) => {
        if (t.taskListId === activeTaskListId) return true;
        if (activeTaskListId.startsWith('gtl_') && t.taskListId === activeTaskListId.replace('gtl_', '')) return true;
        if (!activeTaskListId.startsWith('gtl_') && t.taskListId === `gtl_${activeTaskListId}`) return true;
        return false;
      });
    }

    return tasks.filter((t) => isTaskInList(t, targetList, uniqueTaskLists));
  }, [tasks, activeTaskListId, activeList, uniqueTaskLists]);

  // Active (unarchived, not completed) tasks in scope
  const activeScopedTasks = useMemo(() => {
    return scopedTasks.filter((t) => !t.archived && t.status !== 'completed' && !t.completed);
  }, [scopedTasks]);

  // Completed but unarchived tasks in scope
  const completedScopedTasks = useMemo(() => {
    return scopedTasks.filter((t) => !t.archived && (t.status === 'completed' || Boolean(t.completed)));
  }, [scopedTasks]);

  // Archived tasks in scope
  const archivedScopedTasks = useMemo(() => {
    return scopedTasks.filter((t) => Boolean(t.archived));
  }, [scopedTasks]);

  // Completed tasks in scope that haven't been marked archived
  const completedUnarchivedCount = useMemo(() => {
    return completedScopedTasks.length;
  }, [completedScopedTasks]);

  // Helper to get total unarchived tasks across all lists
  const totalActiveTasksCount = useMemo(() => {
    return tasks.filter((t) => !t.archived && t.status !== 'completed' && !t.completed).length;
  }, [tasks]);

  // Helper to get total archived tasks across all lists
  const totalArchivedTasksCount = useMemo(() => {
    return tasks.filter((t) => Boolean(t.archived)).length;
  }, [tasks]);

  // Filter & sort tasks for main list display
  const displayedTasks = useMemo(() => {
    let result = scopedTasks;

    if (activeTaskListId === 'archived_view') {
      result = result.filter((t) => Boolean(t.archived));
    } else if (filterMode === 'active') {
      result = result.filter((t) => !t.archived && t.status !== 'completed' && !t.completed);
    } else if (filterMode === 'archived') {
      result = result.filter((t) => Boolean(t.archived));
    }

    if (selectedTag) {
      const lowerTag = selectedTag.toLowerCase();
      result = result.filter((t) => Array.isArray(t.tags) && t.tags.some((tg) => typeof tg === 'string' && tg.toLowerCase() === lowerTag));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          ((t.title || '').toLowerCase().includes(q)) ||
          ((t.notes || '').toLowerCase().includes(q)) ||
          (Array.isArray(t.tags) && t.tags.some((tg) => typeof tg === 'string' && tg.toLowerCase().includes(q)))
      );
    }

    if (sortBy === 'due') {
      result = [...result].sort((a, b) => {
        if (!a.due) return 1;
        if (!b.due) return -1;
        return (a.due || '').localeCompare(b.due || '');
      });
    } else if (sortBy === 'priority') {
      const priorityWeight: Record<TaskPriority, number> = { high: 3, medium: 2, low: 1 };
      result = [...result].sort((a, b) => (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2));
    } else if (sortBy === 'title') {
      result = [...result].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
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
          const diff = (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2);
          if (diff !== 0) return diff;
          return (a.title || '').localeCompare(b.title || '');
        });

      const groups: TaskGroup[] = [
        {
          id: 'overdue',
          title: 'Past',
          icon: <AlertCircle className="h-3.5 w-3.5 text-rose-500" />,
          accentClass: 'text-rose-500 font-semibold',
          tasks: sortByPriorityThenTitle(overdue),
        },
        {
          id: 'today',
          title: 'Today',
          icon: <CalendarIcon className="h-3.5 w-3.5 text-[#007AFF]" />,
          accentClass: 'text-[#007AFF] font-semibold',
          tasks: sortByPriorityThenTitle(today),
        },
        {
          id: 'tomorrow',
          title: 'Tomorrow',
          icon: <Clock className="h-3.5 w-3.5 text-[#5856D6]" />,
          accentClass: 'text-[#5856D6] font-semibold',
          tasks: sortByPriorityThenTitle(tomorrow),
        },
        {
          id: 'this_week',
          title: 'Upcoming This Week',
          icon: <CalendarIcon className="h-3.5 w-3.5 text-[#FF9500]" />,
          accentClass: 'text-[#FF9500] font-semibold',
          tasks: sortByPriorityThenTitle(thisWeek),
        },
        {
          id: 'later',
          title: 'Later',
          icon: <CalendarIcon className="h-3.5 w-3.5 text-zinc-400" />,
          accentClass: 'text-zinc-500 dark:text-zinc-400',
          tasks: sortByPriorityThenTitle(later),
        },
        {
          id: 'no_due',
          title: 'No Due Date',
          icon: <ListTodo className="h-3.5 w-3.5 text-zinc-400" />,
          accentClass: 'text-zinc-500 dark:text-zinc-400',
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
          return (a.due || '').localeCompare(b.due || '');
        });

      const groups: TaskGroup[] = [
        {
          id: 'priority_high',
          title: 'High Priority',
          icon: <AlertCircle className="h-3.5 w-3.5 text-rose-500" />,
          accentClass: 'text-rose-500 font-semibold',
          tasks: sortByDueDate(high),
        },
        {
          id: 'priority_medium',
          title: 'Medium Priority',
          icon: <Clock className="h-3.5 w-3.5 text-amber-500" />,
          accentClass: 'text-amber-500 font-semibold',
          tasks: sortByDueDate(medium),
        },
        {
          id: 'priority_low',
          title: 'Low Priority',
          icon: <Check className="h-3.5 w-3.5 text-zinc-400" />,
          accentClass: 'text-zinc-400',
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

    const defaultList = uniqueTaskLists.find((l) => l.isDefault) || uniqueTaskLists[0];
    const defaultListId = defaultList?.id || 'list_default';
    const targetListId =
      activeTaskListId === 'all' ||
      activeTaskListId === 'archived_view' ||
      activeTaskListId === 'starred' ||
      activeTaskListId === 'today' ||
      activeTaskListId === 'upcoming'
        ? defaultListId
        : (activeList?.id || activeTaskListId);

    const initialTags = Array.from(
      new Set([
        ...extractedTags,
        ...(selectedTag ? [selectedTag.toLowerCase()] : []),
      ])
    );

    // If adding while in Starred view, ensure new task is starred so it is immediately visible
    const isStarred = activeTaskListId === 'starred';

    // If adding while in Today or Upcoming view without explicit date, default appropriately so it is immediately visible
    let resolvedDue = quickDueDate || undefined;
    if (!resolvedDue) {
      if (activeTaskListId === 'today') {
        resolvedDue = format(new Date(), 'yyyy-MM-dd');
      } else if (activeTaskListId === 'upcoming') {
        resolvedDue = format(addDays(new Date(), 1), 'yyyy-MM-dd');
      }
    }

    const targetList = uniqueTaskLists.find((l) => l.id === targetListId);
    await createTask({
      title: (cleanTitle || quickTaskTitle).trim(),
      due: resolvedDue,
      taskListId: targetListId,
      taskListName: targetList?.title || (targetListId === defaultListId ? defaultList?.title : undefined),
      priority: 'medium',
      starred: isStarred,
      tags: initialTags,
    });

    setQuickTaskTitle('');
    setQuickDueDate('');

    // If user was filtering by archived only, switch back to active so the new task is visible
    if (filterMode === 'archived') {
      setFilterMode('active');
    }
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

  // Header Title
  const headerTitle = useMemo(() => {
    if (activeTaskListId === 'all') return 'All Tasks';
    if (activeTaskListId === 'starred') return 'Starred Tasks';
    if (activeTaskListId === 'today') return 'Today';
    if (activeTaskListId === 'upcoming') return 'Upcoming';
    if (activeTaskListId === 'archived_view') return 'Archived Tasks';
    if (activeList?.title) return activeList.title;
    const taskWithName = tasks.find(
      (t) =>
        (t.taskListId === activeTaskListId ||
          (activeTaskListId.startsWith('gtl_') && t.taskListId === activeTaskListId.replace('gtl_', '')) ||
          (!activeTaskListId.startsWith('gtl_') && t.taskListId === `gtl_${activeTaskListId}`)) &&
        t.taskListName
    );
    if (taskWithName?.taskListName) return taskWithName.taskListName;
    return 'My Tasks';
  }, [activeTaskListId, activeList, tasks]);

  // Render a task item across density modes
  const renderTaskItem = (t: TaskItem) => {
    const isCompleted = t.status === 'completed' || Boolean(t.completed);
    const isArchived = Boolean(t.archived);
    const isOverdue = t.due && isPast(parseISO(t.due)) && !isToday(parseISO(t.due)) && !isCompleted;
    const isDueToday = t.due && isToday(parseISO(t.due)) && !isCompleted;
    const isExpanded = expandedTaskIds.has(t.id);

    // Compact Mode: Apple Inset Row with hairline divider
    if (densityMode === 'compact') {
      return (
        <div
          key={t.id}
          className={`group py-2.5 px-3 border-b border-zinc-100 dark:border-white/[0.05] last:border-0 transition-colors duration-150 task-item-enter swiftui-row ${
            isArchived || isCompleted ? 'opacity-60' : ''
          }`}
        >
          <HStack alignment="center" spacing={3} className="w-full justify-between">
            <HStack alignment="center" spacing={3} className="min-w-0 flex-1">
              {/* Apple circular spring checkbox */}
              <button
                onClick={() => toggleTaskComplete(t.id)}
                className={`apple-checkbox rounded-[999px] ${isCompleted ? 'checked' : ''}`}
                aria-label="Toggle complete"
              >
                {isCompleted && (
                  <Check className="h-2.5 w-2.5 stroke-[3.5] text-white apple-check-spring" />
                )}
              </button>

              {/* Title & Metadata */}
              <div
                className="min-w-0 flex-1 cursor-pointer"
                onClick={() => openEditModal(t)}
              >
                <HStack alignment="center" spacing={2} wrap>
                  <span
                    className={`text-[13px] font-medium transition-colors ${
                      isCompleted
                        ? 'line-through text-zinc-400 dark:text-zinc-500'
                        : 'text-zinc-900 dark:text-zinc-100 group-hover:text-[#007AFF] dark:group-hover:text-[#0A84FF]'
                    }`}
                  >
                    {t.title}
                  </span>

                  {/* Due Date Tag */}
                  {t.due && (
                    <span
                      className={`text-[11px] font-medium px-1.5 py-0.2 rounded-md flex items-center gap-1 shrink-0 ${
                        isOverdue
                          ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 font-semibold'
                          : isDueToday
                          ? 'text-[#007AFF] dark:text-[#0A84FF] bg-blue-50 dark:bg-blue-950/40 font-semibold'
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      <Clock className="h-2.5 w-2.5 shrink-0" />
                      <span>{formatGoogleTasksDue(t.due)}</span>
                    </span>
                  )}

                  {/* Priority Tag */}
                  {t.priority === 'high' && (
                    <Badge variant="danger" className="text-[10px] py-0 px-1.5">
                      High
                    </Badge>
                  )}

                  {/* Focus duration badge */}
                  {t.totalFocusSeconds > 0 && (
                    <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {formatSecondsToHoursMinutes(t.totalFocusSeconds)}
                    </span>
                  )}

                  {/* Subtasks summary */}
                  {t.subtasks && t.subtasks.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskExpanded(t.id);
                      }}
                      className="flex items-center gap-1 text-[11px] font-mono text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 px-1.5 py-0.2 rounded-md bg-zinc-100 dark:bg-white/[0.06] transition-colors cursor-pointer swiftui-press"
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

                  {/* Tags */}
                  {t.tags?.map((tg) => (
                    <span
                      key={tg}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTag(selectedTag === tg.toLowerCase() ? null : tg.toLowerCase());
                      }}
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md transition-colors cursor-pointer ${
                        selectedTag === tg.toLowerCase()
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold'
                          : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      #{tg}
                    </span>
                  ))}
                </HStack>
              </div>
            </HStack>

            {/* Quick Actions (Hover Reveal for Zero Clutter) */}
            <HStack alignment="center" spacing={1} className="shrink-0">
              {/* Star toggle button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStar(t);
                }}
                className={`p-1 rounded-lg transition-all duration-150 swiftui-press cursor-pointer ${
                  t.starred
                    ? 'text-[#FF9F0A]'
                    : 'text-zinc-400 hover:text-[#FF9F0A] opacity-0 group-hover:opacity-100'
                }`}
                title={t.starred ? 'Starred task' : 'Star task'}
              >
                <Star className={`h-3.5 w-3.5 ${t.starred ? 'fill-[#FF9F0A] text-[#FF9F0A]' : ''}`} />
              </button>

              {!isCompleted && !isArchived && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                    className="h-5 text-[10px] px-1.5 gap-1 text-zinc-700 dark:text-zinc-300 swiftui-press rounded-md border-zinc-200 dark:border-zinc-700"
                    title="Start Focus on this task"
                  >
                    <Clock className="h-2.5 w-2.5 text-[#007AFF]" />
                    <span>Focus</span>
                  </Button>
                </div>
              )}

              {isArchived || isCompleted ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => unarchiveTask(t.id)}
                  className="h-6 w-6 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors swiftui-press"
                  title="Restore / Unarchive task"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => archiveTask(t.id)}
                  className="h-6 w-6 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity swiftui-press"
                  title="Archive task"
                >
                  <Archive className="h-3 w-3" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteTask(t.id)}
                className="h-6 w-6 text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity swiftui-press"
                title="Delete task"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </HStack>
          </HStack>

          {/* Expanded Subtasks Tree (SwiftUI Spring) */}
          {isExpanded && (
            <div
              className="mt-2 ml-7 pl-3 border-l-2 border-zinc-200 dark:border-zinc-800 space-y-1.5 animate-slide-down"
              onClick={(e) => e.stopPropagation()}
            >
              {(t.subtasks || []).map((st) => (
                <div key={st.id} className="flex items-center justify-between text-xs py-0.5 group/st">
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleSubtask(t.id, st.id)}
                      className={`h-4 w-4 rounded-[999px] border flex items-center justify-center transition-all ${
                        st.completed
                          ? 'bg-[#007AFF] border-[#007AFF] text-white'
                          : 'border-zinc-400 dark:border-zinc-600 hover:border-[#007AFF]'
                      }`}
                    >
                      {st.completed && <Check className="h-2 w-2 stroke-[3.5]" />}
                    </button>
                    <span
                      className={`truncate text-xs ${
                        st.completed ? 'line-through text-zinc-400' : 'text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
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
                  className="text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-md px-2.5 py-0.5 flex-1 focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
                />
                <Button type="submit" variant="outline" size="sm" className="h-5 text-[10px] px-2 rounded-md swiftui-press">
                  Add
                </Button>
              </form>
            </div>
          )}
        </div>
      );
    }

    // Comfortable Mode: Elegant Apple Reminders Card
    return (
      <div
        key={t.id}
        className={`group p-3.5 rounded-2xl border transition-all duration-200 task-item-enter swiftui-press ${
          isArchived || isCompleted
            ? 'border-black/[0.05] dark:border-white/[0.04] bg-white/40 dark:bg-white/[0.02] opacity-70 backdrop-blur-sm'
            : 'liquid-glass-card liquid-glass-interactive'
        }`}
      >
        <HStack alignment="top" spacing={3} className="w-full justify-between">
          <HStack alignment="top" spacing={3} className="min-w-0 flex-1">
            {/* Circular Checkbox (Apple style) */}
            <button
              onClick={() => toggleTaskComplete(t.id)}
              className={`apple-checkbox mt-0.5 rounded-[999px] ${isCompleted ? 'checked' : ''}`}
              aria-label="Toggle complete"
            >
              {isCompleted && (
                <Check className="h-2.5 w-2.5 stroke-[3.5] text-white apple-check-spring" />
              )}
            </button>

            {/* Task Title & Details */}
            <VStack
              alignment="leading"
              spacing={1}
              className="min-w-0 flex-1 cursor-pointer"
              onClick={() => openEditModal(t)}
            >
            <span
              className={`text-[14px] font-medium block truncate transition-colors ${
                isCompleted
                  ? 'line-through text-zinc-400 dark:text-zinc-500'
                  : 'text-zinc-900 dark:text-zinc-100 group-hover:text-[#007AFF] dark:group-hover:text-[#0A84FF]'
              }`}
            >
              {t.title}
            </span>
            {t.notes && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                {t.notes}
              </p>
            )}

            <HStack alignment="center" spacing={2} wrap className="mt-1.5">
              {(activeTaskListId === 'all' ||
                activeTaskListId === 'archived_view' ||
                activeTaskListId === 'starred' ||
                activeTaskListId === 'today' ||
                activeTaskListId === 'upcoming') && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-zinc-100 dark:bg-white/[0.06] text-zinc-500 dark:text-zinc-400 border border-zinc-200/50 dark:border-white/[0.05]">
                  {uniqueTaskLists.find((l) => isTaskInList(t, l, uniqueTaskLists))?.title || t.taskListName || 'My Tasks'}
                </span>
              )}

              {t.due && (
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-md flex items-center gap-1.5 ${
                    isOverdue
                      ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 font-semibold'
                      : isDueToday
                      ? 'text-[#007AFF] dark:text-[#0A84FF] bg-blue-50 dark:bg-blue-950/40 font-semibold'
                      : 'text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-white/[0.06]'
                  }`}
                >
                  <Clock className="h-3 w-3 shrink-0" />
                  <span>{formatGoogleTasksDue(t.due)}</span>
                </span>
              )}

              {t.totalFocusSeconds > 0 && (
                <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
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
                  className="flex items-center gap-1 text-[11px] font-mono text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-white/[0.06] transition-colors cursor-pointer swiftui-press"
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
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white font-semibold'
                          : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 border-transparent hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                      title={`Filter by tag #${tg}`}
                    >
                      #{tg}
                    </span>
                  ))}
                </div>
              )}
            </HStack>

            {/* Expanded Subtasks View */}
            {isExpanded && (
              <div
                className="mt-3 ml-2 pl-3 border-l-2 border-zinc-200 dark:border-zinc-800 space-y-1.5 animate-slide-down"
                onClick={(e) => e.stopPropagation()}
              >
                {(t.subtasks || []).map((st) => (
                  <div key={st.id} className="flex items-center justify-between text-xs py-0.5 group/st">
                    <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleSubtask(t.id, st.id)}
                        className={`h-4 w-4 rounded-[999px] border flex items-center justify-center transition-all ${
                          st.completed
                            ? 'bg-[#007AFF] border-[#007AFF] text-white'
                            : 'border-zinc-400 dark:border-zinc-600 hover:border-[#007AFF]'
                        }`}
                      >
                        {st.completed && <Check className="h-2 w-2 stroke-[3.5]" />}
                      </button>
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
                  <Button type="submit" variant="outline" size="sm" className="h-6 text-[10px] px-2 rounded-md swiftui-press">
                    Add
                  </Button>
                </form>
              </div>
            )}
          </VStack>
        </HStack>

        {/* Actions (Smooth Fade on Hover) */}
        <HStack alignment="center" spacing={1} className="shrink-0 ml-3">
          {/* Star toggle button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleStar(t);
            }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer swiftui-press ${
              t.starred
                ? 'text-[#FF9F0A]'
                : 'text-zinc-400 hover:text-[#FF9F0A] opacity-0 group-hover:opacity-100'
            }`}
            title={t.starred ? 'Starred task' : 'Star task'}
          >
            <Star className={`h-4 w-4 ${t.starred ? 'fill-[#FF9F0A] text-[#FF9F0A]' : ''}`} />
          </button>

          {!isCompleted && !isArchived && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                className="h-6 text-xs px-2 gap-1 text-zinc-700 dark:text-zinc-300 rounded-lg swiftui-press border-zinc-200 dark:border-zinc-700"
                title="Start Focus on this task"
              >
                <Clock className="h-3 w-3 text-[#007AFF]" />
                <span>Focus</span>
              </Button>
            </div>
          )}

          {isArchived || isCompleted ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => unarchiveTask(t.id)}
              className="h-7 w-7 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors swiftui-press"
              title="Restore / Unarchive task"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => archiveTask(t.id)}
              className="h-7 w-7 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity swiftui-press"
              title="Archive task"
            >
              <Archive className="h-3.5 w-3.5" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteTask(t.id)}
            className="h-7 w-7 text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity swiftui-press"
            title="Delete task"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </HStack>
      </HStack>
    </div>
    );
  };

  return (
    <div className="relative flex flex-col md:flex-row h-full min-w-0 overflow-hidden bg-gradient-to-br from-[#f8f9fc] via-[#f1f2f6] to-[#e8eaf0] dark:from-[#111113] dark:via-[#161619] dark:to-[#0f0f11]">
      {/* Ambient SwiftUI glass luminescence backdrops (static, non-interactive) */}
      <div className="pointer-events-none absolute -top-24 -left-20 w-96 h-96 rounded-[999px] bg-blue-500/10 dark:bg-blue-600/15 blur-[100px]" />
      <div className="pointer-events-none absolute top-1/3 -right-24 w-96 h-96 rounded-[999px] bg-indigo-500/10 dark:bg-indigo-600/15 blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 w-80 h-80 rounded-[999px] bg-sky-400/10 dark:bg-sky-500/10 blur-[90px]" />

      {/* Apple Reminders Sidebar */}
      <div className="w-full md:w-64 lg:w-72 p-4 flex flex-col gap-4 shrink-0 border-r border-white/80 dark:border-white/10 bg-white/60 dark:bg-[#1a1a1d]/65 backdrop-blur-3xl shadow-[inset_-1px_0_0_0_rgba(255,255,255,0.6)] dark:shadow-[inset_-1px_0_0_0_rgba(255,255,255,0.04)]">
        {/* Search Bar in Sidebar (Apple Reminders Location) */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-7 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] backdrop-blur-md border border-black/[0.05] dark:border-white/[0.08] text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[#007AFF]/60 focus:bg-white/80 dark:focus:bg-white/[0.1] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Apple Reminders 2x2 Category Tiles */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Today Tile */}
          <button
            type="button"
            onClick={() => {
              setActiveTaskListId('today');
              if (filterMode === 'archived') setFilterMode('active');
            }}
            className={`apple-reminders-tile flex flex-col justify-between text-left cursor-pointer ${
              activeTaskListId === 'today'
                ? 'ring-2 ring-[#007AFF] bg-blue-50/80 dark:bg-[#007AFF]/25 border-[#007AFF]/40 dark:border-[#007AFF]/50 shadow-[0_4px_16px_rgba(0,122,255,0.18),inset_0_1px_1px_rgba(255,255,255,0.95)] dark:shadow-[0_4px_16px_rgba(0,122,255,0.25),inset_0_1px_1px_rgba(255,255,255,0.25)]'
                : ''
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="h-7 w-7 rounded-lg bg-[#007AFF] text-white flex items-center justify-center shadow-xs">
                <CalendarIcon className="h-4 w-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {todayTasksCount}
              </span>
            </div>
            <span className="text-xs font-semibold mt-2 text-zinc-600 dark:text-zinc-400">
              Today
            </span>
          </button>

          {/* Scheduled / Upcoming Tile */}
          <button
            type="button"
            onClick={() => {
              setActiveTaskListId('upcoming');
              if (filterMode === 'archived') setFilterMode('active');
            }}
            className={`apple-reminders-tile flex flex-col justify-between text-left cursor-pointer ${
              activeTaskListId === 'upcoming'
                ? 'ring-2 ring-[#FF9500] bg-amber-50/80 dark:bg-[#FF9500]/25 border-[#FF9500]/40 dark:border-[#FF9500]/50 shadow-[0_4px_16px_rgba(255,149,0,0.18),inset_0_1px_1px_rgba(255,255,255,0.95)] dark:shadow-[0_4px_16px_rgba(255,149,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.25)]'
                : ''
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="h-7 w-7 rounded-lg bg-[#FF9500] text-white flex items-center justify-center shadow-xs">
                <Clock className="h-4 w-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {upcomingTasksCount}
              </span>
            </div>
            <span className="text-xs font-semibold mt-2 text-zinc-600 dark:text-zinc-400">
              Upcoming
            </span>
          </button>

          {/* All Tasks Tile */}
          <button
            type="button"
            onClick={() => {
              setActiveTaskListId('all');
              if (filterMode === 'archived') setFilterMode('active');
            }}
            className={`apple-reminders-tile flex flex-col justify-between text-left cursor-pointer ${
              activeTaskListId === 'all'
                ? 'ring-2 ring-[#5856D6] bg-indigo-50/80 dark:bg-[#5856D6]/25 border-[#5856D6]/40 dark:border-[#5856D6]/50 shadow-[0_4px_16px_rgba(88,86,214,0.18),inset_0_1px_1px_rgba(255,255,255,0.95)] dark:shadow-[0_4px_16px_rgba(88,86,214,0.25),inset_0_1px_1px_rgba(255,255,255,0.25)]'
                : ''
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="h-7 w-7 rounded-lg bg-[#5856D6] text-white flex items-center justify-center shadow-xs">
                <CheckSquare className="h-4 w-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {totalActiveTasksCount}
              </span>
            </div>
            <span className="text-xs font-semibold mt-2 text-zinc-600 dark:text-zinc-400">
              All Tasks
            </span>
          </button>

          {/* Starred Tile */}
          <button
            type="button"
            onClick={() => {
              setActiveTaskListId('starred');
              if (filterMode === 'archived') setFilterMode('active');
            }}
            className={`apple-reminders-tile flex flex-col justify-between text-left cursor-pointer ${
              activeTaskListId === 'starred'
                ? 'ring-2 ring-[#FF9F0A] bg-amber-50/80 dark:bg-[#FF9F0A]/25 border-[#FF9F0A]/40 dark:border-[#FF9F0A]/50 shadow-[0_4px_16px_rgba(255,159,10,0.18),inset_0_1px_1px_rgba(255,255,255,0.95)] dark:shadow-[0_4px_16px_rgba(255,159,10,0.25),inset_0_1px_1px_rgba(255,255,255,0.25)]'
                : ''
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="h-7 w-7 rounded-lg bg-[#FF9F0A] text-white flex items-center justify-center shadow-xs">
                <Star className="h-4 w-4 fill-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {totalStarredCount}
              </span>
            </div>
            <span className="text-xs font-semibold mt-2 text-zinc-600 dark:text-zinc-400">
              Starred
            </span>
          </button>
        </div>

        {/* My Lists Section */}
        <div className="flex-1 flex flex-col min-h-0 pt-2 border-t border-zinc-200/80 dark:border-white/[0.06]">
          <div className="flex items-center justify-between px-2 mb-1.5">
            <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              My Lists
            </span>
            <button
              type="button"
              onClick={() => setIsNewListModalOpen(true)}
              className="h-6 w-6 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.08] flex items-center justify-center transition-all cursor-pointer swiftui-press"
              title="Create new list"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-0.5 overflow-y-auto flex-1 pr-1">
            {uniqueTaskLists.map((list) => {
              const count = tasks.filter((t) => {
                if (t.archived || t.status === 'completed' || t.completed) return false;
                return isTaskInList(t, list, uniqueTaskLists);
              }).length;

              const isSelected = list.id === activeTaskListId;

              return (
                <button
                  key={list.id}
                  onClick={() => {
                    setActiveTaskListId(list.id);
                    if (activeTaskListId === 'archived_view') setFilterMode('active');
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer swiftui-press ${
                    isSelected
                      ? 'bg-white/80 dark:bg-white/[0.14] text-zinc-950 dark:text-white font-semibold backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] border border-black/[0.04] dark:border-white/[0.08]'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-white/40 dark:hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-[999px] bg-[#007AFF] shrink-0" />
                    <span className="truncate">{list.title}</span>
                  </div>
                  {count > 0 && (
                    <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
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
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-white/50 dark:hover:bg-white/[0.06] rounded-xl transition-all cursor-pointer swiftui-press mt-1"
            >
              <Plus className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
              <span>Create new list</span>
            </button>
          </div>
        </div>

        {/* Tags Section In Sidebar */}
        {allUniqueTags.length > 0 && (
          <div className="pt-2 border-t border-zinc-200/80 dark:border-white/[0.06] space-y-1">
            <div className="flex items-center justify-between px-2 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
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
            <div className="space-y-0.5 max-h-28 overflow-y-auto pr-1">
              {allUniqueTags.map(([tag, count]) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(isSelected ? null : tag)}
                    title={`Filter by tag #${tag}`}
                    className={`w-full flex items-center justify-between px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer swiftui-press ${
                      isSelected
                        ? 'bg-white/80 dark:bg-white/[0.14] text-zinc-950 dark:text-white font-semibold backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] border border-black/[0.04] dark:border-white/[0.08]'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-white/40 dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-zinc-400 font-mono">#</span>
                      <span className="truncate">{tag}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Archived Section In Sidebar */}
        <div className="pt-2 border-t border-zinc-200/80 dark:border-white/[0.06]">
          <button
            onClick={() => {
              setActiveTaskListId('archived_view');
              setFilterMode('archived');
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer swiftui-press ${
              activeTaskListId === 'archived_view'
                ? 'bg-white/80 dark:bg-white/[0.14] text-zinc-950 dark:text-white font-semibold backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] border border-black/[0.04] dark:border-white/[0.08]'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-white/40 dark:hover:bg-white/[0.05]'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Archive className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
              <span className="truncate">Archived Tasks</span>
            </div>
            {totalArchivedTasksCount > 0 && (
              <span className="text-[11px] font-mono text-zinc-400">
                {totalArchivedTasksCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Task List Area (World-Class Clean Canvas) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-5 sm:p-8 w-full max-w-6xl xl:max-w-7xl 2xl:max-w-full mx-auto space-y-5 tasks-zoomout-container">
        {/* Apple Reminders Large Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-2 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                {headerTitle}
              </h1>

              {/* Discreet Sync Status Button */}
              <button
                type="button"
                onClick={handleSyncOrReconnect}
                disabled={isSyncing || isReconnecting}
                className={`p-1.5 rounded-lg transition-all duration-150 swiftui-press cursor-pointer ${
                  isGoogleTokenExpired
                    ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                    : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                }`}
                title={
                  isGoogleTokenExpired
                    ? 'Google session expired. Click to reconnect.'
                    : lastSyncTime
                    ? `Google Tasks Synced ${lastSyncTime.toLocaleTimeString()}`
                    : 'Sync with Google Tasks'
                }
              >
                {isGoogleTokenExpired ? (
                  <AlertCircle className={`h-4 w-4 ${isReconnecting ? 'animate-spin' : ''}`} />
                ) : (
                  <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin text-[#007AFF]' : ''}`} />
                )}
              </button>

              {/* Delete Custom List */}
              {activeList &&
                !activeList.isDefault &&
                activeTaskListId !== 'all' &&
                activeTaskListId !== 'archived_view' &&
                activeTaskListId !== 'starred' &&
                activeTaskListId !== 'today' &&
                activeTaskListId !== 'upcoming' && (
                  <button
                    type="button"
                    onClick={() => deleteTaskList(activeList.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer swiftui-press"
                    title="Delete current task list"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
            </div>

            <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mt-1">
              {displayedTasks.length} {displayedTasks.length === 1 ? 'task' : 'tasks'}
            </p>
          </div>

          {/* Streamlined Apple Segmented Controls Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {completedUnarchivedCount > 0 && activeTaskListId !== 'archived_view' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => archiveCompletedTasks(activeTaskListId)}
                className="h-7 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 gap-1.5 rounded-lg swiftui-press"
                title="Archive completed tasks"
              >
                <Archive className="h-3.5 w-3.5" />
                <span>Archive Completed ({completedUnarchivedCount})</span>
              </Button>
            )}

            {activeTaskListId === 'archived_view' && archivedScopedTasks.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearArchivedTasks(activeTaskListId)}
                className="h-7 text-xs text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1.5 rounded-lg swiftui-press"
                title="Clear all archived tasks"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear All Archived</span>
              </Button>
            )}

            {/* Apple Segmented Density Selector */}
            <div className="flex items-center rounded-xl p-1 liquid-glass-segmented shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]">
              {(['compact', 'comfortable', 'board'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleSetDensityMode(mode)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all duration-150 swiftui-press cursor-pointer ${
                    densityMode === mode
                      ? 'liquid-glass-segment-active text-zinc-950 dark:text-zinc-50'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                  title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} density mode`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            {/* Filter/Group/Sort Toolbar Dropdowns */}
            <div className="flex items-center rounded-xl p-1 liquid-glass-segmented shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]">
              <select
                value={groupBy}
                onChange={(e) => handleSetGroupBy(e.target.value as any)}
                className="bg-transparent text-xs font-medium text-zinc-600 dark:text-zinc-300 px-2 py-1 focus:outline-none cursor-pointer"
              >
                <option value="due" className="dark:bg-zinc-900">Due Date</option>
                <option value="priority" className="dark:bg-zinc-900">Priority</option>
                <option value="none" className="dark:bg-zinc-900">Flat List</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-medium text-zinc-600 dark:text-zinc-300 px-2 py-1 focus:outline-none cursor-pointer border-l border-zinc-300 dark:border-white/10"
              >
                <option value="order" className="dark:bg-zinc-900">Default</option>
                <option value="due" className="dark:bg-zinc-900">Due Date</option>
                <option value="priority" className="dark:bg-zinc-900">Priority</option>
                <option value="title" className="dark:bg-zinc-900">Title</option>
              </select>

              {activeTaskListId !== 'archived_view' && (
                <select
                  value={filterMode}
                  onChange={(e) => setFilterMode(e.target.value as any)}
                  className="bg-transparent text-xs font-medium text-zinc-600 dark:text-zinc-300 px-2 py-1 focus:outline-none cursor-pointer border-l border-zinc-300 dark:border-white/10"
                >
                  <option value="active" className="dark:bg-zinc-900">Active</option>
                  <option value="archived" className="dark:bg-zinc-900">Archived</option>
                  <option value="all" className="dark:bg-zinc-900">All</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Google Session Expiration Alert */}
        {isGoogleTokenExpired && (
          <div className="rounded-2xl border border-amber-300/80 dark:border-amber-800/80 bg-amber-50/90 dark:bg-amber-950/30 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs view-enter">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold text-amber-900 dark:text-amber-200">
                  Google Tasks Session Expired
                </div>
                <p className="text-amber-700 dark:text-amber-300 mt-0.5">
                  OAuth tokens expire after 1 hour. Reconnect your account to resume 2-way sync.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSyncOrReconnect}
              disabled={isReconnecting || isSyncing}
              className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white rounded-xl swiftui-press"
            >
              {isReconnecting ? 'Reconnecting...' : 'Reconnect & Sync'}
            </Button>
          </div>
        )}

        {/* Active Tag Filter Indicator */}
        {selectedTag && (
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-zinc-200/80 dark:bg-white/[0.08] text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">Filtered by tag:</span>
              <span className="font-mono px-2 py-0.5 rounded-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold text-xs">
                #{selectedTag}
              </span>
              <span className="text-zinc-500 font-mono text-xs">
                ({displayedTasks.length} {displayedTasks.length === 1 ? 'task' : 'tasks'})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className="flex items-center gap-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer text-xs"
            >
              <X className="h-3 w-3" />
              <span>Clear Filter</span>
            </button>
          </div>
        )}

        {/* Multi-Task Focus Launch Banner */}
        {focusSelection.size > 0 && (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-lg animate-slide-down">
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              <Clock className="h-4 w-4" />
              <span>{focusSelection.size} {focusSelection.size === 1 ? 'task' : 'tasks'} selected for Pomodoro</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartMultiTaskFocus}
                className="h-7 text-xs px-3 bg-[#007AFF] text-white hover:bg-[#0062cc] rounded-xl swiftui-press"
              >
                Start Multi-Task Focus
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFocusSelection(new Set())}
                className="h-7 text-xs px-2 text-zinc-400 hover:text-white dark:hover:text-black"
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Apple Reminders Task List Card Surface */}
        <div className={`space-y-4 ${densityMode !== 'board' ? 'apple-card-surface liquid-glass-card p-4 sm:p-6' : ''}`}>
          {/* Apple Style Inline Quick Add Bar */}
          {activeTaskListId !== 'archived_view' && (
            <form
              onSubmit={handleQuickAdd}
              className="flex items-center gap-3 pb-3 border-b border-black/[0.05] dark:border-white/[0.06] group focus-within:border-[#007AFF]/60 transition-colors"
            >
              <div className="h-5 w-5 rounded-[999px] border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex items-center justify-center text-zinc-400 group-focus-within:border-[#007AFF] group-focus-within:text-[#007AFF] transition-colors shrink-0">
                <Plus className="h-3 w-3 stroke-[3]" />
              </div>
              <input
                ref={quickInputRef}
                type="text"
                placeholder="Add a task (press Enter to save)..."
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                className="flex-1 bg-transparent text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
              />
              <input
                type="date"
                value={quickDueDate}
                onChange={(e) => setQuickDueDate(e.target.value)}
                className="text-xs font-mono text-zinc-400 bg-transparent border-0 focus:outline-none cursor-pointer"
              />
              {quickTaskTitle && (
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="h-6 px-3 text-[11px] font-semibold rounded-lg bg-[#007AFF] text-white hover:bg-[#0062cc] shadow-[0_2px_8px_rgba(0,122,255,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] swiftui-press"
                >
                  Add
                </Button>
              )}
            </form>
          )}

          {/* Tasks Rendering Area */}
          {displayedTasks.length === 0 ? (
            <div className="py-16 text-center text-xs text-zinc-400 animate-fade-in">
              {searchQuery
                ? 'No tasks match your search.'
                : activeTaskListId === 'starred'
                ? 'No starred tasks found.'
                : activeTaskListId === 'today'
                ? 'No tasks due today. All caught up!'
                : activeTaskListId === 'upcoming'
                ? 'No upcoming tasks scheduled.'
                : activeTaskListId === 'archived_view'
                ? 'No archived tasks yet.'
                : completedScopedTasks.length > 0 && filterMode === 'active'
                ? `All active tasks completed! (${completedScopedTasks.length} completed below)`
                : 'No tasks. Click above to add a task!'}
            </div>
          ) : densityMode === 'board' ? (
            taskGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start animate-fade-in">
                {taskGroups.map((group) => (
                  <div
                    key={group.id}
                    className="apple-card-surface liquid-glass-card p-4 flex flex-col gap-2 min-w-0"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-white/[0.06]">
                      <div className="flex items-center gap-1.5 min-w-0 font-bold text-xs text-zinc-800 dark:text-zinc-200">
                        {group.icon}
                        <span className="truncate">{group.title}</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-zinc-100 dark:bg-white/[0.06] text-zinc-500">
                        {group.tasks.length}
                      </span>
                    </div>
                    <div className="space-y-2 mt-1 overflow-y-auto max-h-[70vh]">
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
                  <div key={group.id} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => toggleGroupCollapse(group.id)}
                      className="flex items-center gap-2 w-full text-left py-1 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors group cursor-pointer swiftui-press"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        {group.icon}
                        <span className={`truncate ${group.accentClass}`}>
                          {group.title}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-400">
                        ({group.tasks.length})
                      </span>
                      <div className="flex-1 h-px bg-zinc-100 dark:bg-white/[0.05] ml-2" />
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${
                          isCollapsed ? '-rotate-90' : ''
                        }`}
                      />
                    </button>

                    {!isCollapsed && (
                      <div
                        className={`animate-slide-down ${
                          densityMode === 'compact'
                            ? 'divide-y divide-zinc-100 dark:divide-white/[0.05]'
                            : 'space-y-2.5 pt-1'
                        }`}
                      >
                        {group.tasks.map(renderTaskItem)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className={
                densityMode === 'compact'
                  ? 'divide-y divide-zinc-100 dark:divide-white/[0.05]'
                  : 'space-y-2.5'
              }
            >
              {displayedTasks.map(renderTaskItem)}
            </div>
          )}
        </div>

        {/* Collapsible Completed Section */}
        {filterMode === 'active' && completedScopedTasks.length > 0 && activeTaskListId !== 'archived_view' && (
          <div className="pt-2 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsCompletedSectionOpen(!isCompletedSectionOpen)}
                className="flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors group cursor-pointer swiftui-press"
              >
                <ChevronRight
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    isCompletedSectionOpen ? 'rotate-90 text-zinc-700 dark:text-zinc-300' : ''
                  }`}
                />
                <span>Completed</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-zinc-200/60 dark:bg-white/[0.06] text-zinc-500">
                  {completedScopedTasks.length}
                </span>
              </button>

              {isCompletedSectionOpen && (
                <button
                  type="button"
                  onClick={() => archiveCompletedTasks(activeTaskListId)}
                  className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer swiftui-press"
                  title="Archive all completed tasks in this list"
                >
                  Archive Completed
                </button>
              )}
            </div>

            {isCompletedSectionOpen && (
              <div
                className={`animate-slide-down ${
                  densityMode === 'compact'
                    ? 'divide-y divide-zinc-100 dark:divide-white/[0.05] apple-card-surface liquid-glass-card p-2 sm:p-4'
                    : 'space-y-2.5 pt-1'
                }`}
              >
                {completedScopedTasks.map(renderTaskItem)}
              </div>
            )}
          </div>
        )}

        {/* Collapsible Archived Section */}
        {filterMode === 'active' && archivedScopedTasks.length > 0 && activeTaskListId !== 'archived_view' && (
          <div className="pt-2 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsArchivedSectionOpen(!isArchivedSectionOpen)}
                className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors group cursor-pointer swiftui-press"
              >
                <ChevronRight
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    isArchivedSectionOpen ? 'rotate-90 text-zinc-700 dark:text-zinc-300' : ''
                  }`}
                />
                <span>Archived Tasks</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-zinc-200/60 dark:bg-white/[0.06] text-zinc-500">
                  {archivedScopedTasks.length}
                </span>
              </button>

              {isArchivedSectionOpen && (
                <button
                  type="button"
                  onClick={() => clearArchivedTasks(activeTaskListId)}
                  className="text-xs text-rose-500 hover:text-rose-600 transition-colors cursor-pointer swiftui-press"
                  title="Clear all archived tasks from this list"
                >
                  Clear Archive
                </button>
              )}
            </div>

            {isArchivedSectionOpen && (
              <div className="space-y-1.5 pt-1 animate-slide-down">
                {archivedScopedTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200/50 dark:border-white/[0.04] bg-white/40 dark:bg-white/[0.02] opacity-75 hover:opacity-100 transition-opacity"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <button
                        onClick={() => unarchiveTask(t.id)}
                        className="apple-checkbox checked rounded-[999px]"
                        title="Click to restore / unarchive"
                      >
                        <Check className="h-2 w-2 stroke-[3.5] text-white" />
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
                        className="h-6 text-xs px-2 gap-1 text-zinc-500 hover:text-zinc-900 rounded-md swiftui-press"
                        title="Restore task"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Restore</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTask(t.id)}
                        className="h-6 w-6 text-zinc-400 hover:text-rose-500 rounded-md swiftui-press"
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
      {/* Edit Task Modal (Streamlined Google Tasks & SwiftUI Experience) */}
      <Modal
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        title="Edit Task Details"
        headerActions={
          <HStack alignment="center" spacing={1}>
            <button
              type="button"
              onClick={() => setEditStarred(!editStarred)}
              className={`p-1.5 rounded-lg transition-all duration-150 swiftui-press cursor-pointer ${
                editStarred
                  ? 'text-[#FF9F0A] bg-amber-500/10'
                  : 'text-zinc-400 hover:text-[#FF9F0A] hover:bg-zinc-100 dark:hover:bg-white/10'
              }`}
              title={editStarred ? 'Starred task' : 'Star task'}
              aria-label={editStarred ? 'Starred task' : 'Star task'}
            >
              <Star className={`h-4 w-4 ${editStarred ? 'fill-[#FF9F0A] text-[#FF9F0A] apple-star-pop' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => {
                if (editingTask) deleteTask(editingTask.id);
                setEditingTask(null);
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors swiftui-press cursor-pointer"
              title="Delete task"
              aria-label="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </HStack>
        }
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          {/* Title row with Google Tasks circular checkbox */}
          <div>
            <label htmlFor="edit-task-title-input" className="sr-only">
              Task Title
            </label>
            <HStack alignment="top" spacing={2.5}>
              <button
                type="button"
                onClick={() => {
                  if (editingTask) toggleTaskComplete(editingTask.id);
                }}
                className={`apple-checkbox mt-0.5 rounded-[999px] ${
                  currentEditingTask?.status === 'completed' ? 'checked' : ''
                }`}
                aria-label="Toggle complete"
              >
                {currentEditingTask?.status === 'completed' && (
                  <Check className="h-2.5 w-2.5 stroke-[3.5] text-white apple-check-spring" />
                )}
              </button>
              <input
                id="edit-task-title-input"
                aria-label="Task Title"
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Task title"
                required
                autoFocus
                className={`flex-1 text-base sm:text-lg font-semibold tracking-tight bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 border-0 focus:outline-none focus:ring-0 p-0 transition-colors ${
                  currentEditingTask?.status === 'completed' ? 'line-through text-zinc-400 dark:text-zinc-500' : ''
                }`}
              />
            </HStack>
          </div>

          {/* Notes area */}
          <div>
            <label htmlFor="edit-task-notes-input" className="sr-only">
              Notes
            </label>
            <textarea
              id="edit-task-notes-input"
              rows={3}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Add details, background context, or links..."
              className="w-full rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] backdrop-blur-md p-3 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 shadow-[0_1px_2px_rgba(0,0,0,0.03),inset_0_1px_0_0_rgba(255,255,255,0.7)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.06)] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF] focus:bg-white/80 dark:focus:bg-[#202024]/80 transition-all resize-none"
            />
          </div>

          {/* Minimal Google Tasks / Apple Reminders Quick Metadata Bar */}
          <HStack alignment="center" spacing={2} wrap className="pt-0.5">
            {/* Due Date Chip */}
            <div className="relative flex items-center">
              <label
                htmlFor="edit-task-due-picker"
                className={`flex items-center gap-1.5 h-7 px-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all swiftui-press ${
                  editDue
                    ? 'bg-blue-500/15 dark:bg-blue-500/20 border-[#007AFF]/40 dark:border-[#0A84FF]/40 text-[#007AFF] dark:text-[#0A84FF] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]'
                    : 'bg-white/50 dark:bg-white/[0.05] backdrop-blur-md border-black/[0.06] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/80 dark:hover:bg-white/10'
                }`}
              >
                <CalendarIcon className="h-3 w-3 shrink-0" />
                <span>{editDue ? formatGoogleTasksDue(editDue) : 'Add date/time'}</span>
                {editDue && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setEditDue('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditDue('');
                      }
                    }}
                    className="ml-1 p-0.5 hover:text-rose-500 rounded-sm cursor-pointer"
                    title="Clear due date"
                  >
                    <X className="h-3 w-3" />
                  </span>
                )}
              </label>
              <input
                id="edit-task-due-picker"
                type="date"
                value={editDue}
                onChange={(e) => setEditDue(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer pointer-events-auto w-full h-full"
              />
            </div>

            {/* Priority Segmented Chip Selector */}
            <HStack alignment="center" spacing={0.5} className="rounded-lg p-0.5 bg-white/50 dark:bg-white/[0.05] backdrop-blur-md border border-black/[0.06] dark:border-white/[0.08]">
              {(['low', 'medium', 'high'] as const).map((p) => {
                const isSelected = editPriority === p;
                const badgeColor =
                  p === 'high'
                    ? isSelected
                    ? 'bg-rose-500 text-white shadow-[0_1px_4px_rgba(244,63,94,0.35),inset_0_1px_0_rgba(255,255,255,0.25)]'
                    : 'text-rose-600 dark:text-rose-400'
                  : p === 'medium'
                  ? isSelected
                    ? 'bg-[#FF9500] text-white shadow-[0_1px_4px_rgba(255,149,0,0.35),inset_0_1px_0_rgba(255,255,255,0.25)]'
                    : 'text-amber-600 dark:text-amber-400'
                  : isSelected
                  ? 'bg-zinc-700 dark:bg-zinc-600 text-white shadow-[0_1px_3px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.25)]'
                  : 'text-zinc-500 dark:text-zinc-400';
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setEditPriority(p)}
                    className={`px-2.5 py-0.5 text-xs font-semibold rounded-md capitalize transition-all duration-150 swiftui-press cursor-pointer ${
                      isSelected
                        ? badgeColor
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </HStack>
          </HStack>

          {/* Subtasks Section (Minimal Google Tasks Checklist) */}
          <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <ListTodo className="h-3.5 w-3.5 text-zinc-400" />
                <span>Subtasks ({currentEditingTask?.subtasks?.length || 0})</span>
              </span>
            </div>

            {currentEditingTask?.subtasks && currentEditingTask.subtasks.length > 0 && (
              <div className="space-y-1 pl-0.5">
                {currentEditingTask.subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="group/st flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-white/60 dark:hover:bg-white/[0.04] backdrop-blur-xs transition-colors"
                  >
                    <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => currentEditingTask && toggleSubtask(currentEditingTask.id, st.id)}
                        className={`apple-checkbox h-4 w-4 rounded-[999px] ${st.completed ? 'checked' : ''}`}
                        aria-label="Toggle subtask complete"
                      >
                        {st.completed && <Check className="h-2 w-2 stroke-[3.5] text-white apple-check-spring" />}
                      </button>
                      <span
                        className={`truncate text-xs ${
                          st.completed ? 'line-through text-zinc-400' : 'text-zinc-800 dark:text-zinc-200'
                        }`}
                      >
                        {st.title}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => currentEditingTask && deleteSubtask(currentEditingTask.id, st.id)}
                      className="text-zinc-400 hover:text-rose-500 p-1 opacity-0 group-hover/st:opacity-100 transition-opacity rounded-md hover:bg-zinc-200/50 dark:hover:bg-zinc-800 cursor-pointer"
                      title="Delete subtask"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Seamless Inline Add Subtask Input (Google Tasks Style) */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/50 dark:bg-white/[0.04] backdrop-blur-md border border-black/[0.06] dark:border-white/[0.08] focus-within:border-[#007AFF]/60 focus-within:bg-blue-50/15 dark:focus-within:bg-blue-950/20 transition-all">
              <Plus className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
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
                className="text-xs bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 flex-1 focus:outline-none"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleModalAddSubtask}
                className="h-5 text-[11px] px-2 text-[#007AFF] hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md swiftui-press"
              >
                Add Subtask
              </Button>
            </div>
          </div>

          {/* Tags Section (Minimal Apple Reminders Style) */}
          <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-zinc-400" />
                <span>Tags ({editTags.length})</span>
              </span>
            </div>

            {editTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                {editTags.map((tg) => (
                  <span
                    key={tg}
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-white/60 dark:bg-white/[0.06] backdrop-blur-md text-zinc-800 dark:text-zinc-200 border border-black/[0.06] dark:border-white/[0.08] animate-scale-in"
                  >
                    <span>#{tg}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEditTag(tg)}
                      className="text-zinc-400 hover:text-rose-500 p-0.5 cursor-pointer rounded-xs"
                      aria-label={`Remove tag ${tg}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Seamless Inline Add Tag Input */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/50 dark:bg-white/[0.04] backdrop-blur-md border border-black/[0.06] dark:border-white/[0.08] focus-within:border-[#007AFF]/60 focus-within:bg-blue-50/15 dark:focus-within:bg-blue-950/20 transition-all">
              <Hash className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
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
                className="text-xs bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 flex-1 focus:outline-none"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleAddEditTag()}
                className="h-5 text-[11px] px-2 text-[#007AFF] hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md swiftui-press"
              >
                Add Tag
              </Button>
            </div>
          </div>

          {/* Footer Actions */}
          <HStack alignment="center" spacing={2} className="justify-end pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingTask(null)}
              className="rounded-xl swiftui-press bg-white/50 dark:bg-white/[0.06] backdrop-blur-md border border-zinc-200/80 dark:border-white/[0.08] hover:bg-white/80 dark:hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="rounded-xl bg-[#007AFF] hover:bg-[#0062cc] text-white font-medium shadow-[0_2px_8px_rgba(0,122,255,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] swiftui-press"
            >
              Save Changes
            </Button>
          </HStack>
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
            className="rounded-xl bg-white/50 dark:bg-white/[0.04] backdrop-blur-md border-black/[0.08] dark:border-white/[0.1]"
            required
            autoFocus
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewListModalOpen(false)}
              className="rounded-xl swiftui-press bg-white/50 dark:bg-white/[0.06] backdrop-blur-md border border-zinc-200/80 dark:border-white/[0.08] hover:bg-white/80 dark:hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="rounded-xl bg-[#007AFF] text-white hover:bg-[#0062cc] shadow-[0_2px_8px_rgba(0,122,255,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] swiftui-press"
            >
              Create List
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
