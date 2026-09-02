import { Router } from 'express';
import { firestoreService } from '../services/firestoreService.js';
import { googleTasksService } from '../services/googleTasksService.js';
import { Task } from '../types/index.js';

const router = Router();

// GET all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await firestoreService.getTasks();
    res.json({ tasks });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE task
router.post('/', async (req, res) => {
  try {
    const taskData: Task = req.body;
    const created = await firestoreService.saveTask(taskData);
    
    // Asynchronously push to Google Tasks
    googleTasksService.pushTask(created).catch(e => console.warn('Background gtask push:', e));
    
    res.status(201).json({ task: created });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE task
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const taskData: Task = { ...req.body, id };
    const updated = await firestoreService.saveTask(taskData);
    
    googleTasksService.pushTask(updated).catch(e => console.warn('Background gtask push:', e));
    
    res.json({ task: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await firestoreService.deleteTask(id);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// SYNC tasks with Google Tasks
router.post('/sync', async (req, res) => {
  try {
    const result = await googleTasksService.syncTasks();
    const tasks = await firestoreService.getTasks();
    res.json({ ...result, tasks });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
