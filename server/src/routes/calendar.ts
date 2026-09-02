import { Router } from 'express';
import { firestoreService } from '../services/firestoreService.js';
import { googleCalendarService } from '../services/googleCalendarService.js';
import { CalendarEvent } from '../types/index.js';

const router = Router();

// GET all calendar events
router.get('/', async (req, res) => {
  try {
    const events = await firestoreService.getCalendarEvents();
    res.json({ events });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE calendar event
router.post('/', async (req, res) => {
  try {
    const eventData: CalendarEvent = req.body;
    const created = await firestoreService.saveCalendarEvent(eventData);

    // Asynchronously push to Google Calendar
    googleCalendarService.pushEvent(created).catch(e => console.warn('Background gcal push:', e));

    res.status(201).json({ event: created });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE calendar event
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const eventData: CalendarEvent = { ...req.body, id };
    const updated = await firestoreService.saveCalendarEvent(eventData);

    googleCalendarService.pushEvent(updated).catch(e => console.warn('Background gcal push:', e));

    res.json({ event: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE calendar event
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await firestoreService.deleteCalendarEvent(id);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// SYNC calendar with Google Calendar
router.post('/sync', async (req, res) => {
  try {
    const result = await googleCalendarService.syncCalendar();
    const events = await firestoreService.getCalendarEvents();
    res.json({ ...result, events });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
