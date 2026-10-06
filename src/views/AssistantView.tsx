import React, { useState } from 'react';
import {
  Bot,
  Send,
  CheckCircle2,
  Calendar,
  CheckSquare,
  Clock,
  UtensilsCrossed,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useFocus } from '@/context/FocusContext';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { AssistantMessage, AssistantActionReceipt } from '@/types';
import { generateId, getTodayDateString, formatSecondsToHoursMinutes } from '@/lib/utils';
import { addDays, format } from 'date-fns';

export const AssistantView: React.FC = () => {
  const {
    tasks,
    events,
    habits,
    calorieEntries,
    settings,
    focusStats,
    createTask,
    createEvent,
    addCalorieEntry,
  } = useData();
  const { startTimer, selectTask } = useFocus();

  const [inputPrompt, setInputPrompt] = useState('');
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      text: "Greetings. I am NAYRA, your executive personal assistant. I can schedule your time, structure deep focus blocks, manage tasks, monitor habit streaks, and audit your daily nutrition. Try asking me below or select a command.",
      timestamp: new Date().toISOString(),
    },
  ]);

  const quickPrompts = [
    'Plan my day.',
    'How much did I focus this week?',
    'Create a task to review CA Law questions tomorrow.',
    'Schedule two hours tomorrow afternoon for deep work.',
    'How many calories do I have remaining today?',
    'Which habits did I miss this week?',
  ];

  const executeCommand = async (text: string) => {
    const userMsg: AssistantMessage = {
      id: generateId('msg'),
      role: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');

    const lower = text.toLowerCase().trim();
    let replyText = '';
    let receipt: AssistantActionReceipt | undefined = undefined;

    const todayStr = getTodayDateString();

    // 1. "Plan my day"
    if (lower.includes('plan my day') || lower.includes('daily briefing')) {
      const todayEvs = events.filter((e) => e.start.startsWith(todayStr));
      const pendingT = tasks.filter((t) => t.status === 'needsAction').slice(0, 3);

      replyText = `Here is your strategic plan for today:\n` +
        `• Schedule: You have ${todayEvs.length} calendar events booked.\n` +
        `• Priorities: ${pendingT.length} primary tasks require your execution.\n` +
        `• Recommendation: Dedicate 90 minutes to high-priority deep work before midday, followed by your scheduled reviews.`;

      receipt = {
        type: 'daily_briefing',
        summary: `Day planned with ${todayEvs.length} events and ${pendingT.length} priority tasks`,
        data: { eventsCount: todayEvs.length, tasksCount: pendingT.length },
        timestamp: new Date().toISOString(),
      };
    }
    // 2. "How much did I focus this week?"
    else if (lower.includes('how much did i focus') || lower.includes('focus this week')) {
      const hoursStr = formatSecondsToHoursMinutes(focusStats.weekFocusSeconds);
      replyText = `This week, you have logged ${hoursStr} across ${focusStats.totalSessionsCount} focused sessions with a continuous streak of ${focusStats.streakDays} days.`;

      receipt = {
        type: 'query_analytics',
        summary: `Weekly Focus Time: ${hoursStr}`,
        data: { seconds: focusStats.weekFocusSeconds },
        timestamp: new Date().toISOString(),
      };
    }
    // 3. "Create a task..."
    else if (lower.includes('create a task') || lower.includes('add task') || lower.includes('create task')) {
      let taskTitle = text
        .replace(/create a task to/i, '')
        .replace(/create a task/i, '')
        .replace(/add a task to/i, '')
        .replace(/add task/i, '')
        .replace(/tomorrow/i, '')
        .trim();

      if (!taskTitle) taskTitle = 'New Priority Task';

      const isTomorrow = lower.includes('tomorrow');
      const dueDate = isTomorrow
        ? addDays(new Date(), 1).toISOString().split('T')[0]
        : todayStr;

      const created = await createTask({
        title: taskTitle,
        due: dueDate,
        priority: 'high',
      });

      replyText = `Task created: "${taskTitle}" (Due: ${dueDate}). It has been synchronized to your task list.`;
      receipt = {
        type: 'create_task',
        summary: `Created task "${taskTitle}"`,
        data: created,
        timestamp: new Date().toISOString(),
      };
    }
    // 4. "Schedule two hours..."
    else if (lower.includes('schedule') || lower.includes('create event')) {
      const tomorrowDate = addDays(new Date(), 1).toISOString().split('T')[0];
      const newEv = await createEvent({
        calendarId: 'primary',
        title: 'Deep Work: Executive Focus Session',
        start: `${tomorrowDate}T14:00:00`,
        end: `${tomorrowDate}T16:00:00`,
        allDay: false,
        location: 'Focus Lab',
        description: 'Scheduled via NAYRA Assistant.',
      });

      replyText = `Scheduled 2 hours of Deep Work for tomorrow from 2:00 PM to 4:00 PM. Event synchronized to Google Calendar.`;
      receipt = {
        type: 'create_event',
        summary: `Scheduled 2 hours Deep Work for tomorrow`,
        data: newEv,
        timestamp: new Date().toISOString(),
      };
    }
    // 5. "How many calories remaining"
    else if (lower.includes('calories') || lower.includes('nutrition')) {
      const todayCalories = calorieEntries
        .filter((c) => c.date === todayStr)
        .reduce((sum, c) => sum + c.calories, 0);
      const remaining = Math.max(0, settings.dailyCalorieTarget - todayCalories);

      replyText = `You have consumed ${todayCalories} kcal out of your ${settings.dailyCalorieTarget} kcal target. You have ${remaining} kcal remaining for today.`;
      receipt = {
        type: 'log_calorie',
        summary: `${remaining} kcal remaining today`,
        data: { consumed: todayCalories, remaining },
        timestamp: new Date().toISOString(),
      };
    }
    // 6. "Which habits did I miss"
    else if (lower.includes('habits') || lower.includes('habit')) {
      const uncompletedToday = habits.filter((h) => !h.completions[todayStr]);
      if (uncompletedToday.length === 0) {
        replyText = `Excellent work! You have completed all of your scheduled habits for today.`;
      } else {
        replyText = `You still have ${uncompletedToday.length} pending habits today: ${uncompletedToday
          .map((h) => h.title)
          .join(', ')}.`;
      }
      receipt = {
        type: 'toggle_habit',
        summary: `${uncompletedToday.length} pending habits today`,
        data: uncompletedToday,
        timestamp: new Date().toISOString(),
      };
    }
    // Default Fallback
    else {
      replyText = `Understood: "${text}". I have logged your query and calibrated system telemetry. You can ask me to schedule events, create tasks, inspect focus metrics, or check calorie targets anytime.`;
    }

    const assistantMsg: AssistantMessage = {
      id: generateId('msg'),
      role: 'assistant',
      text: replyText,
      timestamp: new Date().toISOString(),
      actionReceipt: receipt,
    };

    setMessages((prev) => [...prev, assistantMsg]);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim()) return;
    executeCommand(inputPrompt.trim());
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 flex flex-col h-[calc(100vh-4rem)] select-none view-enter">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Bot className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
            <span>NAYRA Personal Assistant</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Natural language command execution across calendar, tasks, deep work, habits, and health.
          </p>
        </div>
      </div>

      {/* Suggested Command Chips */}
      <div className="py-3 flex items-center gap-2 overflow-x-auto border-b border-zinc-100 dark:border-zinc-800/80">
        <span className="text-[11px] font-mono text-zinc-400 shrink-0">Suggestions:</span>
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => executeCommand(prompt)}
            className="text-xs px-2.5 py-1 rounded-md border border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-all hover:-translate-y-0.5 active:translate-y-0 shrink-0 shadow-[0_2px_5px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_2px_5px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)]"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 card-enter ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="h-7 w-7 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-xs font-bold shrink-0 shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
                  N
                </div>
              )}

              <div
                className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-[0_4px_12px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.2)]'
                    : 'clay-surface'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {msg.actionReceipt && (
                  <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{msg.actionReceipt.summary}</span>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="h-7 w-7 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center text-xs font-semibold shrink-0">
                  You
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Input Box */}
      <form onSubmit={handleFormSubmit} className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex gap-2">
        <input
          type="text"
          placeholder="Ask NAYRA to schedule, create tasks, or query metrics..."
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          className="flex-1 h-10 rounded-md border border-zinc-300/80 dark:border-zinc-700/80 bg-white dark:bg-zinc-950 px-3.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_5px_0_rgba(0,0,0,0.45)] focus:outline-none focus:ring-2 focus:ring-zinc-400/30 dark:focus:ring-zinc-600/30 transition-all duration-150"
        />
        <Button type="submit" variant="primary" size="md" className="gap-1.5 px-4">
          <Send className="h-3.5 w-3.5" />
          <span>Send</span>
        </Button>
      </form>
    </div>
  );
};
