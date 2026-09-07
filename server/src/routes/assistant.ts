import { Router } from 'express';
import { firestoreService } from '../services/firestoreService.js';
import { nutritionEstimatorService } from '../services/nutritionEstimatorService.js';
import { googleTasksService } from '../services/googleTasksService.js';
import { googleCalendarService } from '../services/googleCalendarService.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET daily briefing
router.get('/briefing', async (req, res) => {
  try {
    const tasks = await firestoreService.getTasks();
    const events = await firestoreService.getCalendarEvents();
    const habits = await firestoreService.getHabits();
    const todayStr = new Date().toISOString().split('T')[0];
    const meals = await firestoreService.getMealEntries(todayStr);
    const target = await firestoreService.getDailyTarget(todayStr);
    const timeLogs = await firestoreService.getTimeLogs();

    const pendingTasks = tasks.filter(t => t.status !== 'completed');
    const urgentTasks = pendingTasks.filter(t => t.priority === 'urgent' || t.priority === 'high');
    const todayEvents = events.filter(e => e.startTime.startsWith(todayStr));
    const caloriesLogged = meals.reduce((acc, m) => acc + (m.totalCalories || 0), 0);
    const focusMinutesToday = timeLogs
      .filter(l => l.timestamp.startsWith(todayStr))
      .reduce((acc, l) => acc + (l.durationMinutes || 0), 0);

    const completedHabitsToday = habits.filter(h => h.completedDates?.includes(todayStr)).length;

    const greeting = getGreeting();

    res.json({
      greeting,
      todayStr,
      metrics: {
        pendingTasksCount: pendingTasks.length,
        urgentTasksCount: urgentTasks.length,
        todayEventsCount: todayEvents.length,
        habitsTotal: habits.length,
        habitsCompletedToday: completedHabitsToday,
        caloriesLogged,
        targetCalories: target.targetCalories,
        caloriesRemaining: Math.max(0, target.targetCalories - caloriesLogged),
        focusMinutesToday
      },
      urgentTasks: urgentTasks.slice(0, 3),
      upcomingEvents: todayEvents.slice(0, 3),
      summaryText: `${greeting}, Commander. You have ${pendingTasks.length} active tasks, ${completedHabitsToday}/${habits.length} habits completed today, ${todayEvents.length} scheduled events, and ${focusMinutesToday} minutes of focus logged.`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST chat with Nayra Assistant / Command Interpreter
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const textLower = message.toLowerCase().trim();
    let reply = '';
    let actionTaken = null;

    // 1. Habit command
    if (textLower.includes('habit') || textLower.includes('meditat') || textLower.includes('workout') || textLower.includes('water')) {
      const habits = await firestoreService.getHabits();
      const todayStr = new Date().toISOString().split('T')[0];

      // Find matched habit
      const matchedHabit = habits.find(h => 
        textLower.includes(h.title.toLowerCase()) || 
        (textLower.includes('water') && h.title.toLowerCase().includes('hydrat')) ||
        (textLower.includes('workout') && (h.title.toLowerCase().includes('training') || h.title.toLowerCase().includes('gym'))) ||
        (textLower.includes('meditat') && h.title.toLowerCase().includes('meditat')) ||
        (textLower.includes('deep work') && h.title.toLowerCase().includes('deep work'))
      );

      if (matchedHabit && (textLower.includes('done') || textLower.includes('complete') || textLower.includes('check') || textLower.includes('finish') || textLower.includes('did'))) {
        const updated = await firestoreService.toggleHabitCompletion(matchedHabit.id, todayStr);
        reply = `Awesome work, Commander! Marked "${matchedHabit.title}" as completed for today! Current streak is now 🔥 ${updated?.streak || 1} days.`;
        actionTaken = { type: 'habit_completed', data: updated };
      } else {
        const completedCount = habits.filter(h => h.completedDates?.includes(todayStr)).length;
        reply = `Habit Status: You have completed ${completedCount} of ${habits.length} habits today. Keep up the momentum!`;
      }
    }
    // 2. Food / Calorie command
    else if (textLower.includes('ate') || textLower.includes('had') || textLower.includes('breakfast') || textLower.includes('lunch') || textLower.includes('dinner') || textLower.includes('snack') || textLower.includes('calorie')) {
      const meal = await nutritionEstimatorService.logMealFromAntigravity(message);
      reply = `Logged your meal! Calculated ${meal.totalCalories} kcal (${meal.totalProtein}g Protein, ${meal.totalCarbs}g Carbs, ${meal.totalFat}g Fat).`;
      actionTaken = { type: 'meal_logged', data: meal };
    }
    // 3. Task creation command
    else if (textLower.startsWith('create task') || textLower.startsWith('add task') || textLower.startsWith('todo:')) {
      const title = message.replace(/^(create task|add task|todo:)\s*/i, '').trim();
      const newTask = await firestoreService.saveTask({
        id: uuidv4(),
        title: title || 'New Task',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      googleTasksService.pushTask(newTask).catch(e => console.warn(e));
      reply = `Created task: "${newTask.title}" and queued sync with Google Tasks.`;
      actionTaken = { type: 'task_created', data: newTask };
    }
    // 4. Sync command
    else if (textLower.includes('sync') || textLower.includes('google sync')) {
      const tRes = await googleTasksService.syncTasks();
      const cRes = await googleCalendarService.syncCalendar();
      reply = `2-Way Google Sync: ${tRes.message} | ${cRes.message}`;
      actionTaken = { type: 'sync_completed', data: { tasks: tRes, calendar: cRes } };
    }
    // 5. Default Nayra AI conversational intelligence
    else {
      reply = `Commander, all systems (Tasks, Calendar, Habits, Pomodoro, Nutrition) are online and active. How can I assist you with your schedule or workflow?`;
    }

    res.json({
      reply,
      actionTaken,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default router;
