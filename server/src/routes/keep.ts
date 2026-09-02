import { Router } from 'express';
import { firestoreService } from '../services/firestoreService.js';
import { KeepNote } from '../types/index.js';

const router = Router();

// GET all keep notes
router.get('/', async (req, res) => {
  try {
    const notes = await firestoreService.getKeepNotes();
    res.json({ notes });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE note
router.post('/', async (req, res) => {
  try {
    const noteData: KeepNote = req.body;
    const created = await firestoreService.saveKeepNote(noteData);
    res.status(201).json({ note: created });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE note
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const noteData: KeepNote = { ...req.body, id };
    const updated = await firestoreService.saveKeepNote(noteData);
    res.json({ note: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE note
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await firestoreService.deleteKeepNote(id);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
