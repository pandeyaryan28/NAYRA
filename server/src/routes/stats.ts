import { Router } from 'express';
import { firestoreService } from '../services/firestoreService.js';

const router = Router();

router.get('/overview', async (req, res) => {
  try {
    const tasks = await firestoreService.getTasks();
    const events = await firestoreService.getCalendarEvents();
    const notes = await firestoreService.getKeepNotes();
    const todayStr = new Date().toISOString().split('T')[0];
    const meals = await firestoreService.getMealEntries(todayStr);
    const target = await firestoreService.getDailyTarget(todayStr);
    const timeLogs = await firestoreService.getTimeLogs();
    const projects = await firestoreService.getProjects();

    const completedTasks = tasks.filter(t => t.status === 'completed');
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    const pendingTasks = tasks.filter(t => t.status !== 'completed');
    const urgentTasks = pendingTasks.filter(t => t.priority === 'urgent' || t.priority === 'high');

    const todayEvents = events.filter(e => e.startTime.startsWith(todayStr));
    const caloriesConsumed = meals.reduce((acc, m) => acc + (m.totalCalories || 0), 0);
    const focusMinutesToday = timeLogs
      .filter(l => l.timestamp.startsWith(todayStr))
      .reduce((acc, l) => acc + (l.durationMinutes || 0), 0);

    res.json({
      tasks: {
        total: tasks.length,
        completed: completedTasks.length,
        inProgress: inProgressTasks.length,
        pending: pendingTasks.length,
        urgent: urgentTasks.length,
        completionRate: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0
      },
      calendar: {
        totalEvents: events.length,
        todayEvents: todayEvents.length
      },
      notes: {
        totalNotes: notes.length,
        pinnedNotes: notes.filter(n => n.isPinned).length
      },
      pomodoro: {
        focusMinutesToday,
        totalSessions: timeLogs.length
      },
      nutrition: {
        caloriesConsumed,
        targetCalories: target.targetCalories,
        proteinConsumed: Number(meals.reduce((acc, m) => acc + (m.totalProtein || 0), 0).toFixed(1)),
        waterIntakeMl: target.waterIntakeMl
      },
      projectsCount: projects.length
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
