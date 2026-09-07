import { Router } from 'express';
import { firestoreService } from '../services/firestoreService.js';
import { Habit } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET all habits
router.get('/', async (req, res) => {
  try {
    const habits = await firestoreService.getHabits();
    res.json({ habits });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE habit
router.post('/', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category = 'health', 
      frequency = 'daily', 
      targetDaysPerWeek = 7, 
      color = '#38bdf8',
      icon = 'sparkles'
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Habit title is required' });
    }

    const newHabit: Habit = {
      id: uuidv4(),
      title: title.trim(),
      description: description?.trim() || '',
      category,
      frequency,
      targetDaysPerWeek,
      color,
      icon,
      completedDates: [],
      streak: 0,
      bestStreak: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const saved = await firestoreService.saveHabit(newHabit);
    res.status(201).json({ habit: saved });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE habit
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const habits = await firestoreService.getHabits();
    const existing = habits.find(h => h.id === id);

    if (!existing) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    const updatedData: Habit = {
      ...existing,
      ...req.body,
      id,
      updatedAt: new Date().toISOString()
    };

    const saved = await firestoreService.saveHabit(updatedData);
    res.json({ habit: saved });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// TOGGLE habit completion for date (default today)
router.post('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const updated = await firestoreService.toggleHabitCompletion(id, targetDate);
    if (!updated) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    res.json({ 
      success: true, 
      habit: updated,
      isCompletedToday: updated.completedDates.includes(targetDate)
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE habit
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await firestoreService.deleteHabit(id);
    res.json({ success: deleted, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET habit stats
router.get('/stats', async (req, res) => {
  try {
    const habits = await firestoreService.getHabits();
    const todayStr = new Date().toISOString().split('T')[0];

    const totalHabits = habits.length;
    const completedTodayCount = habits.filter(h => h.completedDates?.includes(todayStr)).length;
    const completionRateToday = totalHabits > 0 ? Math.round((completedTodayCount / totalHabits) * 100) : 0;
    const bestActiveStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
    const overallBestStreak = habits.reduce((max, h) => Math.max(max, h.bestStreak || 0), 0);

    res.json({
      totalHabits,
      completedTodayCount,
      completionRateToday,
      bestActiveStreak,
      overallBestStreak,
      habits: habits.map(h => ({
        id: h.id,
        title: h.title,
        streak: h.streak,
        completedToday: h.completedDates?.includes(todayStr)
      }))
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
