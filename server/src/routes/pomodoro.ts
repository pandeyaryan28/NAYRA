import { Router } from 'express';
import { firestoreService } from '../services/firestoreService.js';
import { TimeLog } from '../types/index.js';

const router = Router();

// GET all time logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await firestoreService.getTimeLogs();
    res.json({ logs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE / RECORD a time log (from Pomodoro timer or manual entry)
router.post('/log', async (req, res) => {
  try {
    const logData: TimeLog = req.body;
    const created = await firestoreService.saveTimeLog(logData);
    res.status(201).json({ log: created });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET aggregated stats for Pomodoro and focus time
router.get('/stats', async (req, res) => {
  try {
    const logs = await firestoreService.getTimeLogs();
    const todayStr = new Date().toISOString().split('T')[0];

    const todayLogs = logs.filter(l => l.timestamp.startsWith(todayStr));
    const totalMinutesToday = todayLogs.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);
    const pomodoroSessionsToday = todayLogs.filter(l => l.sessionType === 'pomodoro').length;

    // Breakdown by project/task
    const taskBreakdown: Record<string, number> = {};
    for (const log of logs) {
      const key = log.taskTitle || 'General Focus';
      taskBreakdown[key] = (taskBreakdown[key] || 0) + log.durationMinutes;
    }

    res.json({
      totalMinutesToday,
      pomodoroSessionsToday,
      totalSessionsAllTime: logs.length,
      taskBreakdown,
      recentLogs: logs.slice(-10).reverse()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
