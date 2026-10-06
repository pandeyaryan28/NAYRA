import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Search,
  Clock,
  MapPin,
  Trash2,
  Check,
  CheckSquare,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { CalendarEvent, NayraCalendar, TaskItem, TaskPriority } from '@/types';
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  parseISO,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
} from 'date-fns';
import { formatTimeRange, getTodayDateString } from '@/lib/utils';

type ViewMode = 'day' | 'week' | 'month' | 'agenda';

export const CalendarView: React.FC = () => {
  const {
    calendars,
    events,
    tasks,
    taskLists,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleCalendarVisibility,
    toggleTaskComplete,
    createTask,
    updateTask,
    deleteTask,
    activeTaskListId,
    settings,
    isSyncing,
    syncWithGoogle,
    reconnectAndSync,
    isGoogleTokenExpired,
    lastSyncTime,
  } = useData();

  const [isReconnecting, setIsReconnecting] = useState(false);

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

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>(settings.defaultCalendarView || 'week');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showTasks, setShowTasks] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalTab, setModalTab] = useState<'event' | 'task'>('event');
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  // Form state for Event Modal
  const [formTitle, setFormTitle] = useState('');
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');
  const [formAllDay, setFormAllDay] = useState(false);
  const [formLocation, setFormLocation] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCalendarId, setFormCalendarId] = useState('primary');

  // Form state for Task Modal
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDue, setTaskDue] = useState('');
  const [taskAllDay, setTaskAllDay] = useState(false);
  const [taskListId, setTaskListId] = useState(activeTaskListId || 'list_default');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskNotes, setTaskNotes] = useState('');

  // Filtered events based on calendar selection and search query
  const visibleCalendarIds = useMemo(
    () => new Set(calendars.filter((c) => c.selected).map((c) => c.id)),
    [calendars]
  );

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (!visibleCalendarIds.has(e.calendarId)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [events, visibleCalendarIds, searchQuery]);

  // Filtered tasks scheduled with due dates
  const filteredTasks = useMemo(() => {
    if (!showTasks) return [];
    return tasks.filter((t) => {
      if (!t.due) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [tasks, showTasks, searchQuery]);

  // Navigation handlers
  const handleToday = () => setCurrentDate(new Date());

  const handlePrev = () => {
    if (viewMode === 'day') setCurrentDate((d) => subDays(d, 1));
    else if (viewMode === 'week') setCurrentDate((d) => subDays(d, 7));
    else if (viewMode === 'month') setCurrentDate((d) => subMonths(d, 1));
    else setCurrentDate((d) => subDays(d, 7));
  };

  const handleNext = () => {
    if (viewMode === 'day') setCurrentDate((d) => addDays(d, 1));
    else if (viewMode === 'week') setCurrentDate((d) => addDays(d, 7));
    else if (viewMode === 'month') setCurrentDate((d) => addMonths(d, 1));
    else setCurrentDate((d) => addDays(d, 7));
  };

  const openCreateModal = (presetDate?: Date, hour: number = 9, defaultTab: 'event' | 'task' = 'event') => {
    const d = presetDate || currentDate;
    const dateStr = format(d, 'yyyy-MM-dd');
    const startStr = `${dateStr}T${hour.toString().padStart(2, '0')}:00`;
    const endStr = `${dateStr}T${(hour + 1).toString().padStart(2, '0')}:00`;

    setEditingEvent(null);
    setEditingTask(null);
    setModalTab(defaultTab);

    // Event form defaults
    setFormTitle('');
    setFormStart(startStr);
    setFormEnd(endStr);
    setFormAllDay(false);
    setFormLocation('');
    setFormDescription('');
    setFormCalendarId(calendars[0]?.id || 'primary');

    // Task form defaults
    setTaskTitle('');
    setTaskDue(startStr);
    setTaskAllDay(false);
    setTaskListId(activeTaskListId || taskLists[0]?.id || 'list_default');
    setTaskPriority('medium');
    setTaskNotes('');

    setIsModalOpen(true);
  };

  const openEditModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEditingTask(null);
    setModalTab('event');
    setFormTitle(event.title);
    setFormStart(event.start.slice(0, 16));
    setFormEnd(event.end.slice(0, 16));
    setFormAllDay(event.allDay);
    setFormLocation(event.location || '');
    setFormDescription(event.description || '');
    setFormCalendarId(event.calendarId);
    setIsModalOpen(true);
  };

  const openEditTaskModal = (task: TaskItem) => {
    setEditingTask(task);
    setEditingEvent(null);
    setModalTab('task');
    setTaskTitle(task.title);
    const isAllDay = !task.due?.includes('T');
    setTaskAllDay(isAllDay);
    if (task.due) {
      setTaskDue(task.due.includes('T') ? task.due.slice(0, 16) : `${task.due}T09:00`);
    } else {
      setTaskDue('');
    }
    setTaskListId(task.taskListId || activeTaskListId || 'list_default');
    setTaskPriority(task.priority || 'medium');
    setTaskNotes(task.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalTab === 'event') {
      if (!formTitle.trim()) return;
      if (editingEvent) {
        await updateEvent(editingEvent.id, {
          title: formTitle.trim(),
          start: formStart,
          end: formEnd,
          allDay: formAllDay,
          location: formLocation,
          description: formDescription,
          calendarId: formCalendarId,
        });
      } else {
        await createEvent({
          calendarId: formCalendarId,
          title: formTitle.trim(),
          start: formStart,
          end: formEnd,
          allDay: formAllDay,
          location: formLocation,
          description: formDescription,
        });
      }
    } else {
      if (!taskTitle.trim()) return;
      const computedDue = taskDue
        ? taskAllDay
          ? taskDue.split('T')[0]
          : taskDue
        : undefined;

      if (editingTask) {
        await updateTask(editingTask.id, {
          title: taskTitle.trim(),
          due: computedDue,
          taskListId,
          priority: taskPriority,
          notes: taskNotes,
        });
      } else {
        await createTask({
          title: taskTitle.trim(),
          due: computedDue,
          taskListId,
          priority: taskPriority,
          notes: taskNotes,
        });
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (editingEvent) {
      await deleteEvent(editingEvent.id);
      setIsModalOpen(false);
    } else if (editingTask) {
      await deleteTask(editingTask.id);
      setIsModalOpen(false);
    }
  };

  const handleMoveEvent = async (eventId: string, targetDate: Date, targetHour: number) => {
    const ev = events.find((e) => e.id === eventId);
    if (!ev) return;

    try {
      const startObj = parseISO(ev.start);
      const endObj = parseISO(ev.end);
      const durationMs = Math.max(15 * 60 * 1000, endObj.getTime() - startObj.getTime());

      const newStartDate = new Date(targetDate);
      newStartDate.setHours(targetHour, startObj.getMinutes() || 0, 0, 0);
      const newEndDate = new Date(newStartDate.getTime() + durationMs);

      await updateEvent(eventId, {
        start: newStartDate.toISOString(),
        end: newEndDate.toISOString(),
        allDay: false,
      });
    } catch (err) {
      console.warn('Failed to move event:', err);
    }
  };

  const handleAdjustDuration = async (eventId: string, deltaMinutes: number) => {
    const ev = events.find((e) => e.id === eventId);
    if (!ev) return;

    try {
      const endObj = parseISO(ev.end);
      const newEnd = new Date(endObj.getTime() + deltaMinutes * 60 * 1000).toISOString();
      await updateEvent(eventId, { end: newEnd });
      if (editingEvent && editingEvent.id === eventId) {
        setFormEnd(newEnd.slice(0, 16));
      }
    } catch (err) {
      console.warn('Failed to adjust event duration:', err);
    }
  };

  // Header Title
  const headerDateString = useMemo(() => {
    if (viewMode === 'day') return format(currentDate, 'MMMM d, yyyy');
    if (viewMode === 'month') return format(currentDate, 'MMMM yyyy');
    if (viewMode === 'week') {
      const s = startOfWeek(currentDate, { weekStartsOn: settings.weekStartsOn });
      const e = endOfWeek(currentDate, { weekStartsOn: settings.weekStartsOn });
      return `${format(s, 'MMM d')} – ${format(e, 'MMM d, yyyy')}`;
    }
    return format(currentDate, 'MMMM yyyy');
  }, [currentDate, viewMode, settings.weekStartsOn]);

  // Days for Week View
  const weekDays = useMemo(() => {
    const s = startOfWeek(currentDate, { weekStartsOn: settings.weekStartsOn });
    const e = endOfWeek(currentDate, { weekStartsOn: settings.weekStartsOn });
    return eachDayOfInterval({ start: s, end: e });
  }, [currentDate, settings.weekStartsOn]);

  // Week day headers respecting user's weekStartsOn
  const weekDayLabels = useMemo(() => {
    const s = startOfWeek(currentDate, { weekStartsOn: settings.weekStartsOn });
    return Array.from({ length: 7 }, (_, i) => format(addDays(s, i), 'EEE'));
  }, [currentDate, settings.weekStartsOn]);

  // Days for Month View
  const monthDays = useMemo(() => {
    const s = startOfWeek(startOfMonth(currentDate), { weekStartsOn: settings.weekStartsOn });
    const e = endOfWeek(endOfMonth(currentDate), { weekStartsOn: settings.weekStartsOn });
    return eachDayOfInterval({ start: s, end: e });
  }, [currentDate, settings.weekStartsOn]);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Match event to day and hour, supporting simple recurring rules
  const matchEventDayHour = (ev: CalendarEvent, dayStr: string, hour?: number) => {
    let evDateStr: string;
    try {
      evDateStr = ev.allDay ? ev.start.split('T')[0] : format(parseISO(ev.start), 'yyyy-MM-dd');
    } catch {
      evDateStr = ev.start.split('T')[0];
    }
    let isDayMatch = evDateStr === dayStr;

    if (!isDayMatch && ev.recurrence && ev.recurrence.length > 0) {
      const rule = ev.recurrence[0];
      const targetDate = parseISO(dayStr);
      const origDate = parseISO(evDateStr);
      if (targetDate >= origDate) {
        if (rule.includes('FREQ=DAILY')) {
          isDayMatch = true;
        } else if (rule.includes('FREQ=WEEKLY')) {
          isDayMatch = targetDate.getDay() === origDate.getDay();
        }
      }
    }

    if (!isDayMatch) return false;

    if (hour !== undefined) {
      if (ev.allDay) return false;
      const evHour = parseISO(ev.start).getHours();
      return evHour === hour;
    }
    return true;
  };

  // Match task with due date to calendar day and optional hour
  const matchTaskDay = (t: TaskItem, dayStr: string, hour?: number) => {
    if (!t.due) return false;
    let taskDateStr: string;
    try {
      taskDateStr = t.due.includes('T') ? format(parseISO(t.due), 'yyyy-MM-dd') : t.due;
    } catch {
      taskDateStr = t.due.split('T')[0];
    }
    if (taskDateStr !== dayStr) return false;

    if (hour !== undefined) {
      if (t.due.includes('T')) {
        try {
          const taskHour = parseISO(t.due).getHours();
          return taskHour === hour;
        } catch {
          return false;
        }
      }
      return false; // Task without specific time belongs to all-day section
    }
    return true;
  };

  // Unified drop handler for moving both calendar events and tasks across the calendar
  const handleDropOnSlot = (e: React.DragEvent, targetDate: Date, targetHour?: number) => {
    e.preventDefault();
    const itemType = e.dataTransfer.getData('text/nayra-type');
    const itemId = e.dataTransfer.getData('text/plain');
    if (!itemId) return;

    const targetDayStr = format(targetDate, 'yyyy-MM-dd');

    if (itemType === 'task') {
      if (targetHour !== undefined) {
        updateTask(itemId, { due: `${targetDayStr}T${targetHour.toString().padStart(2, '0')}:00` });
      } else {
        updateTask(itemId, { due: targetDayStr });
      }
    } else {
      handleMoveEvent(itemId, targetDate, targetHour !== undefined ? targetHour : 9);
    }
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-950 overflow-hidden select-none">
      {/* Top Google Calendar Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 gap-4 bg-white/90 dark:bg-zinc-950/90">
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => openCreateModal()}
            className="gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Create</span>
          </Button>

          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handlePrev} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNext} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 min-w-44">
            {headerDateString}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-48 sm:w-60">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search events"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-full rounded-md border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900 pl-8 pr-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.04)] dark:shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.4)] focus:outline-none focus:ring-2 focus:ring-zinc-400/30 transition-all duration-150"
            />
          </div>

          {/* Sync / Reconnect Button */}
          <Button
            variant={isGoogleTokenExpired ? 'outline' : 'ghost'}
            size="sm"
            onClick={handleSyncOrReconnect}
            disabled={isSyncing || isReconnecting}
            className={`h-8 text-xs gap-1.5 px-2.5 rounded-md ${
              isGoogleTokenExpired
                ? 'text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
            title={
              isGoogleTokenExpired
                ? 'Google Calendar session expired (1-hour token limit). Click to reconnect.'
                : lastSyncTime
                ? `Last synced ${lastSyncTime.toLocaleTimeString()}`
                : 'Sync with Google Calendar'
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

          {/* View Switcher */}
          <div className="flex items-center rounded-md border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-50 dark:bg-zinc-900">
            {(['day', 'week', 'month', 'agenda'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2.5 py-1 text-xs font-medium rounded-sm capitalize transition-colors ${
                  viewMode === mode
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Body: Left Mini-Calendar/List + Right Grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side Pane */}
        <div className="hidden lg:flex flex-col w-60 border-r border-zinc-200 dark:border-zinc-800 p-4 space-y-6 overflow-y-auto">
          {/* Calendar List */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              My Calendars
            </h4>
            <div className="space-y-1">
              {calendars.map((cal) => (
                <label
                  key={cal.id}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/60 cursor-pointer text-xs transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={cal.selected}
                    onChange={() => toggleCalendarVisibility(cal.id)}
                    className="h-3.5 w-3.5 rounded-sm border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-0"
                  />
                  <span
                    className="h-2 w-2 rounded-sm shrink-0"
                    style={{ backgroundColor: cal.backgroundColor }}
                  />
                  <span className="truncate text-zinc-800 dark:text-zinc-200">
                    {cal.summary}
                  </span>
                </label>
              ))}

              {/* Tasks Calendar Integration */}
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <label className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/60 cursor-pointer text-xs transition-colors">
                  <input
                    type="checkbox"
                    checked={showTasks}
                    onChange={() => setShowTasks(!showTasks)}
                    className="h-3.5 w-3.5 rounded-sm border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-0"
                  />
                  <span className="h-2 w-2 rounded-sm shrink-0 bg-amber-500" />
                  <span className="truncate text-zinc-800 dark:text-zinc-200 font-medium">
                    Tasks (Google & Myra)
                  </span>
                  <span className="ml-auto text-[10px] font-mono text-zinc-400">
                    ({tasks.filter((t) => t.due).length})
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Calendar Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Week View */}
          {viewMode === 'week' && (
            <div className="min-w-[700px]">
              {/* Day Header Row */}
              <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 sticky top-0 z-10">
                <div className="py-2 text-center text-[10px] text-zinc-400 border-r border-zinc-200 dark:border-zinc-800">
                  GMT
                </div>
                {weekDays.map((d) => {
                  const today = isToday(d);
                  return (
                    <div
                      key={d.toISOString()}
                      className="py-2 text-center border-r border-zinc-200 dark:border-zinc-800 last:border-r-0"
                    >
                      <span className="text-[11px] font-medium text-zinc-500 uppercase block">
                        {format(d, 'EEE')}
                      </span>
                      <span
                        className={`text-sm font-semibold inline-block h-6 w-6 leading-6 rounded-sm ${
                          today
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                            : 'text-zinc-800 dark:text-zinc-200'
                        }`}
                      >
                        {format(d, 'd')}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* All-Day Events & Due Tasks Row in Week View */}
              <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/30 py-1 min-h-[30px]">
                <div className="text-[10px] font-mono text-zinc-400 text-right pr-2 pt-0.5 border-r border-zinc-200 dark:border-zinc-800">
                  Tasks
                </div>
                {weekDays.map((d) => {
                  const dayStr = format(d, 'yyyy-MM-dd');
                  const dayAllDayEvents = filteredEvents.filter((ev) => matchEventDayHour(ev, dayStr) && ev.allDay);
                  const dayAllDayTasks = filteredTasks.filter((t) => matchTaskDay(t, dayStr) && !t.due?.includes('T'));

                  return (
                    <div
                      key={d.toISOString()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                      }}
                      onDrop={(e) => handleDropOnSlot(e, d)}
                      className="border-r border-zinc-200 dark:border-zinc-800 last:border-r-0 px-1 py-0.5 space-y-0.5"
                    >
                      {dayAllDayEvents.map((ev) => (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(ev);
                          }}
                          className="px-1.5 py-0.5 rounded-xs text-[10px] bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 truncate cursor-pointer font-medium"
                        >
                          {ev.title}
                        </div>
                      ))}
                      {dayAllDayTasks.map((t) => {
                        const isCompleted = t.status === 'completed';
                        return (
                          <div
                            key={t.id}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/nayra-type', 'task');
                              e.dataTransfer.setData('text/plain', t.id);
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditTaskModal(t);
                            }}
                            title={`Task: ${t.title}. Click to edit.`}
                            className={`px-1 py-0.5 rounded-xs text-[10px] truncate cursor-pointer flex items-center gap-1 border transition-all ${
                              isCompleted
                                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 line-through opacity-60 border-zinc-200 dark:border-zinc-700'
                                : 'bg-amber-100 dark:bg-amber-950/70 text-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-800/80 font-medium'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTaskComplete(t.id);
                              }}
                              className="p-0.5 hover:opacity-80"
                            >
                              <CheckSquare className="h-2.5 w-2.5 shrink-0 text-amber-600 dark:text-amber-400" />
                            </button>
                            <span className="truncate">{t.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Hourly Grid Rows */}
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {hours.map((hour) => (
                  <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] min-h-[48px]">
                    <div className="text-[10px] font-mono text-zinc-400 text-right pr-2 pt-1 border-r border-zinc-200 dark:border-zinc-800">
                      {hour === 0 ? '' : `${hour}:00`}
                    </div>
                    {weekDays.map((d) => {
                      const dayStr = format(d, 'yyyy-MM-dd');
                      const hourEvents = filteredEvents.filter((ev) => matchEventDayHour(ev, dayStr, hour));
                      const hourTasks = filteredTasks.filter((t) => matchTaskDay(t, dayStr, hour));

                      return (
                        <div
                          key={d.toISOString()}
                          onClick={() => openCreateModal(d, hour)}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                          }}
                          onDrop={(e) => handleDropOnSlot(e, d, hour)}
                          className="border-r border-zinc-200 dark:border-zinc-800 last:border-r-0 p-0.5 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 cursor-pointer relative"
                        >
                          {hourEvents.map((ev) => (
                            <div
                              key={ev.id}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/nayra-type', 'event');
                                e.dataTransfer.setData('text/plain', ev.id);
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(ev);
                              }}
                              className="rounded-sm p-1.5 text-xs bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 shadow-xs mb-1 hover:opacity-90 transition-opacity cursor-grab active:cursor-grabbing"
                            >
                              <div className="font-semibold truncate">{ev.title}</div>
                              <div className="text-[10px] opacity-80 font-mono truncate">
                                {formatTimeRange(ev.start, ev.end)}
                              </div>
                            </div>
                          ))}

                          {hourTasks.map((t) => {
                            const isCompleted = t.status === 'completed';
                            return (
                              <div
                                key={t.id}
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('text/nayra-type', 'task');
                                  e.dataTransfer.setData('text/plain', t.id);
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditTaskModal(t);
                                }}
                                title={`Task: ${t.title}. Click to edit.`}
                                className={`rounded-sm p-1 text-[11px] border mb-1 cursor-grab active:cursor-grabbing transition-opacity flex items-center gap-1 ${
                                  isCompleted
                                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 line-through opacity-60 border-zinc-200 dark:border-zinc-700'
                                    : 'bg-amber-100 dark:bg-amber-950/70 text-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-800/80 font-medium'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleTaskComplete(t.id);
                                  }}
                                  className="p-0.5 hover:opacity-80"
                                >
                                  <CheckSquare className="h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" />
                                </button>
                                <span className="truncate">{t.title}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Day View */}
          {viewMode === 'day' && (
            <div className="max-w-4xl mx-auto py-4 px-4">
              {/* All-Day Events in Day View */}
              {filteredEvents.filter((ev) => matchEventDayHour(ev, format(currentDate, 'yyyy-MM-dd')) && ev.allDay).length > 0 && (
                <div className="p-3 mb-4 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    <CalendarIcon className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" />
                    <span>All-Day Events ({filteredEvents.filter((ev) => matchEventDayHour(ev, format(currentDate, 'yyyy-MM-dd')) && ev.allDay).length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filteredEvents
                      .filter((ev) => matchEventDayHour(ev, format(currentDate, 'yyyy-MM-dd')) && ev.allDay)
                      .map((ev) => (
                        <div
                          key={ev.id}
                          onClick={() => openEditModal(ev)}
                          className="px-2.5 py-1 rounded-sm text-xs bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 cursor-pointer font-medium shadow-xs"
                        >
                          {ev.title}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Tasks Due Today Banner */}
              {filteredTasks.filter((t) => matchTaskDay(t, format(currentDate, 'yyyy-MM-dd'))).length > 0 && (
                <div className="p-3 mb-4 rounded-md border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200">
                    <CheckSquare className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Tasks Scheduled for Today ({filteredTasks.filter((t) => matchTaskDay(t, format(currentDate, 'yyyy-MM-dd'))).length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredTasks
                      .filter((t) => matchTaskDay(t, format(currentDate, 'yyyy-MM-dd')))
                      .map((t) => {
                        const isCompleted = t.status === 'completed';
                        return (
                          <div
                            key={t.id}
                            onClick={() => openEditTaskModal(t)}
                            className={`flex items-center gap-2.5 p-2 rounded-sm border cursor-pointer transition-all ${
                              isCompleted
                                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 line-through border-zinc-200 dark:border-zinc-700 opacity-60'
                                : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-amber-200 dark:border-amber-800/80 shadow-xs'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTaskComplete(t.id);
                              }}
                              className={`h-3.5 w-3.5 rounded-xs border flex items-center justify-center shrink-0 ${isCompleted ? 'bg-amber-600 border-amber-600 text-white' : 'border-amber-600'}`}
                            >
                              {isCompleted && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                            </button>
                            <span className="text-xs font-medium truncate flex-1">{t.title}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {hours.map((hour) => {
                  const dayStr = format(currentDate, 'yyyy-MM-dd');
                  const hourEvents = filteredEvents.filter((ev) => matchEventDayHour(ev, dayStr, hour));
                  const hourTasks = filteredTasks.filter((t) => matchTaskDay(t, dayStr, hour));

                  return (
                    <div key={hour} className="flex min-h-[54px] p-2 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                      <div className="w-16 font-mono text-xs text-zinc-400">
                        {hour}:00
                      </div>
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => openCreateModal(currentDate, hour)}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                        }}
                        onDrop={(e) => handleDropOnSlot(e, currentDate, hour)}
                      >
                        {hourEvents.map((ev) => (
                          <div
                            key={ev.id}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/nayra-type', 'event');
                              e.dataTransfer.setData('text/plain', ev.id);
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(ev);
                            }}
                            className="p-2.5 rounded-md bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 shadow-xs mb-1 max-w-lg cursor-grab active:cursor-grabbing"
                          >
                            <span className="font-semibold text-xs block">{ev.title}</span>
                            <span className="text-[11px] opacity-80 font-mono">
                              {formatTimeRange(ev.start, ev.end, ev.allDay)}
                              {ev.location && ` • ${ev.location}`}
                            </span>
                          </div>
                        ))}

                        {hourTasks.map((t) => {
                          const isCompleted = t.status === 'completed';
                          return (
                            <div
                              key={t.id}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/nayra-type', 'task');
                                e.dataTransfer.setData('text/plain', t.id);
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditTaskModal(t);
                              }}
                              title={`Task: ${t.title}. Click to edit.`}
                              className={`p-2 rounded-md border mb-1 max-w-lg cursor-pointer transition-all flex items-center gap-2 ${
                                isCompleted
                                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 line-through opacity-60 border-zinc-200 dark:border-zinc-700'
                                  : 'bg-amber-100 dark:bg-amber-950/70 text-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-800/80 font-medium'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTaskComplete(t.id);
                                }}
                                className="p-0.5 hover:opacity-80"
                              >
                                <CheckSquare className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                              </button>
                              <span className="font-semibold text-xs truncate flex-1">{t.title}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Month View */}
          {viewMode === 'month' && (
            <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800">
              {weekDayLabels.map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-xs font-semibold text-zinc-500 uppercase border-r border-zinc-200 dark:border-zinc-800 last:border-r-0 bg-zinc-50/50 dark:bg-zinc-900/50"
                >
                  {day}
                </div>
              ))}
              {monthDays.map((d) => {
                const dayStr = format(d, 'yyyy-MM-dd');
                const dayEvents = filteredEvents.filter((ev) => matchEventDayHour(ev, dayStr));
                const dayTasks = filteredTasks.filter((t) => matchTaskDay(t, dayStr));
                const today = isToday(d);

                return (
                  <div
                    key={d.toISOString()}
                    onClick={() => openCreateModal(d)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => handleDropOnSlot(e, d, 9)}
                    className="min-h-[100px] p-1.5 border-r border-b border-zinc-200 dark:border-zinc-800 last:border-r-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 cursor-pointer"
                  >
                    <span
                      className={`inline-block text-xs font-semibold h-5 w-5 leading-5 text-center rounded-sm mb-1 ${
                        today
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                          : 'text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {format(d, 'd')}
                    </span>
                    {(() => {
                      const combined = [
                        ...dayEvents.map((ev) => ({ type: 'event' as const, data: ev })),
                        ...dayTasks.map((t) => ({ type: 'task' as const, data: t })),
                      ];
                      const MAX_VISIBLE = 3;
                      const visible = combined.slice(0, MAX_VISIBLE);
                      const overflow = combined.length - MAX_VISIBLE;

                      return (
                        <div className="space-y-1">
                          {visible.map((item) => {
                            if (item.type === 'event') {
                              const ev = item.data as CalendarEvent;
                              return (
                                <div
                                  key={ev.id}
                                  draggable
                                  onDragStart={(e) => {
                                    e.dataTransfer.setData('text/nayra-type', 'event');
                                    e.dataTransfer.setData('text/plain', ev.id);
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(ev);
                                  }}
                                  className="px-1.5 py-0.5 rounded-sm text-[11px] bg-zinc-900 text-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 truncate cursor-grab"
                                >
                                  {ev.title}
                                </div>
                              );
                            } else {
                              const t = item.data as TaskItem;
                              const isCompleted = t.status === 'completed';
                              return (
                                <div
                                  key={t.id}
                                  draggable
                                  onDragStart={(e) => {
                                    e.dataTransfer.setData('text/nayra-type', 'task');
                                    e.dataTransfer.setData('text/plain', t.id);
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditTaskModal(t);
                                  }}
                                  title={`Task: ${t.title} (${isCompleted ? 'Completed' : 'Pending'}). Click to edit.`}
                                  className={`px-1.5 py-0.5 rounded-sm text-[11px] truncate cursor-pointer transition-all flex items-center gap-1 ${
                                    isCompleted
                                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 line-through opacity-60'
                                      : 'bg-amber-100 dark:bg-amber-950/70 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800/80 font-medium'
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleTaskComplete(t.id);
                                    }}
                                    className="p-0.5 hover:opacity-80"
                                  >
                                    <CheckSquare className="h-2.5 w-2.5 shrink-0 text-amber-600 dark:text-amber-400" />
                                  </button>
                                  <span className="truncate">{t.title}</span>
                                </div>
                              );
                            }
                          })}

                          {overflow > 0 && (
                            <div className="text-[10px] text-zinc-400 pl-1 font-mono">
                              +{overflow} more
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          )}

          {/* Agenda View */}
          {viewMode === 'agenda' && (
            <div className="max-w-3xl mx-auto p-6 space-y-4">
              {filteredEvents.length === 0 && filteredTasks.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-400">
                  No upcoming events or scheduled tasks match your filter.
                </div>
              ) : (
                [
                  ...filteredEvents.map((e) => ({
                    type: 'event' as const,
                    id: e.id,
                    sortDate: e.start,
                    title: e.title,
                    location: e.location,
                    description: e.description,
                    allDay: e.allDay,
                    event: e,
                  })),
                  ...filteredTasks.map((t) => ({
                    type: 'task' as const,
                    id: t.id,
                    sortDate: t.due ? (t.due.includes('T') ? t.due : `${t.due}T09:00:00`) : new Date().toISOString(),
                    title: t.title,
                    location: undefined,
                    description: t.notes,
                    allDay: !t.due?.includes('T'),
                    task: t,
                  })),
                ]
                  .sort((a, b) => a.sortDate.localeCompare(b.sortDate))
                  .map((item) => {
                    if (item.type === 'event') {
                      const ev = item.event;
                      return (
                        <div
                          key={ev.id}
                          onClick={() => openEditModal(ev)}
                          className="flex items-start justify-between p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer"
                        >
                          <div className="space-y-1">
                            <span className="text-xs font-mono text-zinc-400 block">
                              {format(parseISO(ev.start), 'EEEE, MMMM d, yyyy')} • {formatTimeRange(ev.start, ev.end, ev.allDay)}
                            </span>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                {ev.title}
                              </h4>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                Calendar Event
                              </span>
                            </div>
                            {ev.location && (
                              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                <MapPin className="h-3.5 w-3.5" />
                                <span>{ev.location}</span>
                              </div>
                            )}
                            {ev.description && (
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                                {ev.description}
                              </p>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" className="text-xs">
                            Edit
                          </Button>
                        </div>
                      );
                    } else {
                      const t = item.task;
                      const isCompleted = t.status === 'completed';
                      return (
                        <div
                          key={t.id}
                          onClick={() => openEditTaskModal(t)}
                          className={`flex items-start justify-between p-4 rounded-lg border transition-all cursor-pointer ${
                            isCompleted
                              ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 opacity-60'
                              : 'border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/20 hover:border-amber-400 dark:hover:border-amber-700 shadow-xs'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              type="button"
                              role="checkbox"
                              aria-checked={isCompleted}
                              aria-label={`Toggle completion for ${t.title}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTaskComplete(t.id);
                              }}
                              className={`mt-0.5 h-4 w-4 rounded-xs border flex items-center justify-center shrink-0 ${
                                isCompleted
                                  ? 'bg-amber-600 border-amber-600 text-white'
                                  : 'border-amber-600 text-transparent hover:border-amber-700'
                              }`}
                            >
                              {isCompleted && <Check className="h-3 w-3 stroke-[3]" />}
                            </button>
                            <div className="space-y-1">
                              <span className="text-xs font-mono text-zinc-400 block">
                                Due: {t.due}
                              </span>
                              <div className="flex items-center gap-2">
                                <h4 className={`text-sm font-semibold ${isCompleted ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                  {t.title}
                                </h4>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-xs bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200">
                                  Task
                                </span>
                                {t.priority === 'high' && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-xs bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-semibold">
                                    High Priority
                                  </span>
                                )}
                              </div>
                              {t.notes && (
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-0.5">
                                  {t.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditTaskModal(t);
                              }}
                              className="text-xs"
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      );
                    }
                  })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Unified Tabbed Event / Task Creation & Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEvent ? 'Edit Event' : editingTask ? 'Edit Task' : modalTab === 'event' ? 'Create Event' : 'Create Task'}
        description={modalTab === 'event' ? 'Schedule a work session, meeting, or milestone.' : 'Schedule a task with due dates and priorities across your workspace.'}
      >
        {(!editingEvent && !editingTask) && (
          <div className="flex rounded-md border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-100 dark:bg-zinc-900 mb-4">
            <button
              type="button"
              onClick={() => setModalTab('event')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-sm transition-colors ${
                modalTab === 'event'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Event
            </button>
            <button
              type="button"
              onClick={() => setModalTab('task')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-sm transition-colors ${
                modalTab === 'task'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Task
            </button>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {modalTab === 'event' ? (
            <>
              <Input
                label="Event Title"
                placeholder="e.g., Deep Work: Architecture Design"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
                autoFocus
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start"
                  type="datetime-local"
                  value={formStart}
                  onChange={(e) => setFormStart(e.target.value)}
                  required
                />
                <Input
                  label="End"
                  type="datetime-local"
                  value={formEnd}
                  onChange={(e) => setFormEnd(e.target.value)}
                  required
                />
              </div>

              {editingEvent && (
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="text-[11px] text-zinc-500 font-mono">Resize Duration:</span>
                  <button
                    type="button"
                    onClick={() => handleAdjustDuration(editingEvent.id, 15)}
                    className="px-2 py-0.5 text-xs rounded-sm border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono transition-colors"
                  >
                    +15m
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustDuration(editingEvent.id, 30)}
                    className="px-2 py-0.5 text-xs rounded-sm border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono transition-colors"
                  >
                    +30m
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustDuration(editingEvent.id, -15)}
                    className="px-2 py-0.5 text-xs rounded-sm border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono transition-colors"
                  >
                    -15m
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustDuration(editingEvent.id, -30)}
                    className="px-2 py-0.5 text-xs rounded-sm border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono transition-colors"
                  >
                    -30m
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allDayCheckbox"
                  checked={formAllDay}
                  onChange={(e) => setFormAllDay(e.target.checked)}
                  className="h-4 w-4 rounded-sm border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-0"
                />
                <label htmlFor="allDayCheckbox" className="text-xs text-zinc-700 dark:text-zinc-300">
                  All-day event
                </label>
              </div>

              <Select
                label="Calendar"
                value={formCalendarId}
                onChange={(e) => setFormCalendarId(e.target.value)}
                options={calendars.map((c) => ({ value: c.id, label: c.summary }))}
              />

              <Input
                label="Location"
                placeholder="e.g., Engineering Desk / Zoom"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
              />

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Add notes, agenda, or links..."
                  className="w-full rounded-md border border-zinc-300/80 dark:border-zinc-700/80 bg-white dark:bg-zinc-950 p-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_5px_0_rgba(0,0,0,0.45)] focus:outline-none focus:ring-2 focus:ring-zinc-400/30 dark:focus:ring-zinc-600/30 transition-all duration-150"
                />
              </div>
            </>
          ) : (
            <>
              <Input
                label="Task Title"
                placeholder="e.g., Submit balance sheet diligence"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                required
                autoFocus
              />

              <div className="space-y-2">
                <Input
                  label="Due Date & Time"
                  type={taskAllDay ? "date" : "datetime-local"}
                  value={taskAllDay && taskDue.includes('T') ? taskDue.split('T')[0] : taskDue}
                  onChange={(e) => setTaskDue(e.target.value)}
                  required
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="taskAllDayCheckbox"
                    checked={taskAllDay}
                    onChange={(e) => {
                      setTaskAllDay(e.target.checked);
                      if (e.target.checked && taskDue.includes('T')) {
                        setTaskDue(taskDue.split('T')[0]);
                      } else if (!e.target.checked && !taskDue.includes('T') && taskDue) {
                        setTaskDue(`${taskDue}T09:00`);
                      }
                    }}
                    className="h-4 w-4 rounded-sm border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-0"
                  />
                  <label htmlFor="taskAllDayCheckbox" className="text-xs text-zinc-700 dark:text-zinc-300">
                    All-day task
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Task List"
                  value={taskListId}
                  onChange={(e) => setTaskListId(e.target.value)}
                  options={taskLists.map((l) => ({ value: l.id, label: l.title }))}
                />

                <Select
                  label="Priority"
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  placeholder="Add details, checklists, or references..."
                  className="w-full rounded-md border border-zinc-300/80 dark:border-zinc-700/80 bg-white dark:bg-zinc-950 p-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_5px_0_rgba(0,0,0,0.45)] focus:outline-none focus:ring-2 focus:ring-zinc-400/30 dark:focus:ring-zinc-600/30 transition-all duration-150"
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
            {editingEvent || editingTask ? (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleDelete}
                className="gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </Button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                {editingEvent ? 'Save Event' : editingTask ? 'Save Task' : modalTab === 'event' ? 'Create Event' : 'Create Task'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
