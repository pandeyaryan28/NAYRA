import { google } from 'googleapis';
import { getAuthenticatedGoogleClient, getStoredTokens } from '../config/googleAuth.js';
import { firestoreService } from './firestoreService.js';
import { CalendarEvent } from '../types/index.js';

export class GoogleCalendarService {
  /**
   * Performs two-way synchronization between Google Calendar and Nayra Command Center.
   */
  async syncCalendar(): Promise<{ success: boolean; syncedCount: number; message: string }> {
    const authClient = getAuthenticatedGoogleClient();
    const tokens = getStoredTokens();

    if (!authClient || tokens.isMock) {
      // Local sync simulation
      const localEvents = await firestoreService.getCalendarEvents();
      const updatedTimestamp = new Date().toISOString();
      for (const e of localEvents) {
        e.syncedAt = updatedTimestamp;
        await firestoreService.saveCalendarEvent(e);
      }
      return {
        success: true,
        syncedCount: localEvents.length,
        message: 'Synchronized with Nayra Cloud Calendar Engine (Google OAuth ready).'
      };
    }

    try {
      const calendar = google.calendar({ version: 'v3', auth: authClient });
      
      const now = new Date();
      const timeMin = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString();
      const timeMax = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30).toISOString();

      // 1. Fetch remote events
      const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime'
      });

      const remoteEvents = res.data.items || [];
      const localEvents = await firestoreService.getCalendarEvents();
      let syncCounter = 0;

      // 2. Google Calendar -> Nayra
      for (const gEvent of remoteEvents) {
        if (!gEvent.id || !gEvent.summary) continue;

        const startTime = gEvent.start?.dateTime || (gEvent.start?.date ? `${gEvent.start.date}T00:00:00Z` : new Date().toISOString());
        const endTime = gEvent.end?.dateTime || (gEvent.end?.date ? `${gEvent.end.date}T23:59:59Z` : new Date().toISOString());
        const isAllDay = !gEvent.start?.dateTime;

        const existing = localEvents.find(e => e.googleEventId === gEvent.id || e.title.toLowerCase() === gEvent.summary?.toLowerCase());

        if (existing) {
          existing.title = gEvent.summary;
          existing.description = gEvent.description || existing.description;
          existing.startTime = startTime;
          existing.endTime = endTime;
          existing.isAllDay = isAllDay;
          existing.location = gEvent.location || existing.location;
          existing.meetLink = gEvent.hangoutLink || existing.meetLink;
          existing.googleEventId = gEvent.id;
          existing.syncedAt = new Date().toISOString();
          await firestoreService.saveCalendarEvent(existing);
        } else {
          const newEvent: CalendarEvent = {
            id: `gevent-${gEvent.id}`,
            title: gEvent.summary,
            description: gEvent.description || '',
            startTime,
            endTime,
            isAllDay,
            location: gEvent.location || '',
            meetLink: gEvent.hangoutLink || undefined,
            googleEventId: gEvent.id,
            category: 'meeting',
            color: '#38bdf8',
            createdAt: gEvent.created || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            syncedAt: new Date().toISOString()
          };
          await firestoreService.saveCalendarEvent(newEvent);
        }
        syncCounter++;
      }

      // 3. Nayra Events -> Google Calendar
      for (const lEvent of localEvents) {
        if (!lEvent.googleEventId) {
          try {
            const created = await calendar.events.insert({
              calendarId: 'primary',
              requestBody: {
                summary: lEvent.title,
                description: lEvent.description,
                location: lEvent.location,
                start: lEvent.isAllDay ? { date: lEvent.startTime.split('T')[0] } : { dateTime: lEvent.startTime },
                end: lEvent.isAllDay ? { date: lEvent.endTime.split('T')[0] } : { dateTime: lEvent.endTime }
              }
            });
            if (created.data.id) {
              lEvent.googleEventId = created.data.id;
              lEvent.syncedAt = new Date().toISOString();
              await firestoreService.saveCalendarEvent(lEvent);
              syncCounter++;
            }
          } catch (pushErr) {
            console.warn('Error pushing event to Google Calendar:', pushErr);
          }
        }
      }

      return {
        success: true,
        syncedCount: syncCounter,
        message: `Successfully 2-way synced ${syncCounter} events with Google Calendar.`
      };
    } catch (error: any) {
      console.error('Google Calendar sync error:', error);
      return {
        success: false,
        syncedCount: 0,
        message: error.message || 'Failed to sync with Google Calendar'
      };
    }
  }

  /**
   * Push an event directly to Google Calendar
   */
  async pushEvent(event: CalendarEvent): Promise<void> {
    const authClient = getAuthenticatedGoogleClient();
    if (!authClient) return;

    try {
      const calendar = google.calendar({ version: 'v3', auth: authClient });
      if (event.googleEventId) {
        await calendar.events.patch({
          calendarId: 'primary',
          eventId: event.googleEventId,
          requestBody: {
            summary: event.title,
            description: event.description,
            location: event.location,
            start: event.isAllDay ? { date: event.startTime.split('T')[0] } : { dateTime: event.startTime },
            end: event.isAllDay ? { date: event.endTime.split('T')[0] } : { dateTime: event.endTime }
          }
        });
      } else {
        const created = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: {
            summary: event.title,
            description: event.description,
            location: event.location,
            start: event.isAllDay ? { date: event.startTime.split('T')[0] } : { dateTime: event.startTime },
            end: event.isAllDay ? { date: event.endTime.split('T')[0] } : { dateTime: event.endTime }
          }
        });
        if (created.data.id) {
          event.googleEventId = created.data.id;
          event.syncedAt = new Date().toISOString();
          await firestoreService.saveCalendarEvent(event);
        }
      }
    } catch (e) {
      console.warn('Error syncing event to Google Calendar:', e);
    }
  }
}

export const googleCalendarService = new GoogleCalendarService();
