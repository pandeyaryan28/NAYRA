import type { Task, CalendarEvent } from '../types/index.js';
import { nayraBackend } from './store.js';

export const DEFAULT_GOOGLE_CLIENT_ID = '595101892863-do2qv8thbu5fno4mbbchq4090stfl3de.apps.googleusercontent.com';

export function getEffectiveClientId(): string {
  try {
    const custom = localStorage.getItem('nayra_google_client_id');
    if (custom && custom.trim().length > 10) return custom.trim();
  } catch {}
  return DEFAULT_GOOGLE_CLIENT_ID;
}

export function setCustomClientId(clientId: string): void {
  if (clientId && clientId.trim()) {
    localStorage.setItem('nayra_google_client_id', clientId.trim());
  } else {
    localStorage.removeItem('nayra_google_client_id');
  }
}

export const GOOGLE_CLIENT_ID = DEFAULT_GOOGLE_CLIENT_ID;

export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
].join(' ');

const STORAGE_KEYS = {
  TOKEN: 'nayra_google_access_token',
  EXPIRY: 'nayra_google_token_expiry',
  USER: 'nayra_google_user'
};

export interface GoogleUserProfile {
  name: string;
  email: string;
  picture: string;
  id?: string;
}

export class GoogleClientSyncService {
  public getAccessToken(): string | null {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const expiry = localStorage.getItem(STORAGE_KEYS.EXPIRY);
      if (!token) return null;
      if (expiry && Date.now() > parseInt(expiry, 10)) {
        console.warn('Google access token has expired');
        return null;
      }
      return token;
    } catch {
      return null;
    }
  }

  public getStoredUser(): GoogleUserProfile | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public isConnected(): boolean {
    return Boolean(this.getAccessToken());
  }

  public saveSession(accessToken: string, expiresInSeconds: number = 3600, user?: GoogleUserProfile) {
    const expiryTimestamp = Date.now() + (expiresInSeconds - 60) * 1000;
    localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.EXPIRY, expiryTimestamp.toString());
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  }

  public disconnect() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.EXPIRY);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  /**
   * Request an OAuth access token using Google Identity Services (GIS)
   */
  public async promptGoogleLogin(): Promise<{ accessToken: string; user: GoogleUserProfile }> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        return reject(new Error('Window is not defined'));
      }

      const googleObj = (window as any).google;
      if (!googleObj?.accounts?.oauth2) {
        return reject(
          new Error('Google Identity Services is initializing. Please wait a few seconds and try again, or use manual token.')
        );
      }

      try {
        const client = googleObj.accounts.oauth2.initTokenClient({
          client_id: getEffectiveClientId(),
          scope: GOOGLE_SCOPES,
          prompt: 'consent',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              return reject(new Error(tokenResponse.error_description || tokenResponse.error));
            }

            const token = tokenResponse.access_token;
            const expiresIn = tokenResponse.expires_in ? parseInt(tokenResponse.expires_in, 10) : 3600;

            try {
              const user = await this.fetchUserProfile(token);
              this.saveSession(token, expiresIn, user);
              resolve({ accessToken: token, user });
            } catch (err: any) {
              this.saveSession(token, expiresIn);
              resolve({
                accessToken: token,
                user: {
                  name: 'Aryan Pandey',
                  email: 'aaryanpandey28@gmail.com',
                  picture: 'https://api.dicebear.com/7.x/bottts/svg?seed=GoogleUser'
                }
              });
            }
          }
        });

        client.requestAccessToken();
      } catch (err: any) {
        reject(err);
      }
    });
  }

  /**
   * Fetch user profile from Google UserInfo endpoint
   */
  public async fetchUserProfile(accessToken: string): Promise<GoogleUserProfile> {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch Google profile: ${res.statusText}`);
    }
    const data = await res.json();
    const user: GoogleUserProfile = {
      id: data.id,
      name: data.name || 'Aryan Pandey',
      email: data.email || 'aaryanpandey28@gmail.com',
      picture: data.picture || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + (data.email || 'user')
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  }

  /**
   * Direct token ingestion (for manual token entry or testing)
   */
  public async connectWithManualToken(accessToken: string): Promise<{ success: boolean; user: GoogleUserProfile }> {
    const trimmed = accessToken.trim();
    const user = await this.fetchUserProfile(trimmed);
    this.saveSession(trimmed, 3600, user);
    return { success: true, user };
  }

  /**
   * Fetch all tasks from user's Google Tasks
   */
  public async fetchGoogleTasks(): Promise<Task[]> {
    const token = this.getAccessToken();
    if (!token) return [];

    // 1. Get task lists
    const listsRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!listsRes.ok) {
      if (listsRes.status === 401) {
        this.disconnect();
        throw new Error('Google token expired. Please reconnect.');
      }
      throw new Error(`Failed to fetch task lists (${listsRes.status})`);
    }

    const listsData = await listsRes.json();
    const taskLists = listsData.items || [];
    if (taskLists.length === 0) return [];

    const allTasks: Task[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    // 2. Fetch tasks from primary / each list
    for (const list of taskLists) {
      try {
        const tasksRes = await fetch(
          `https://tasks.googleapis.com/tasks/v1/lists/${list.id}/tasks?showCompleted=true&showHidden=true&maxResults=100`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!tasksRes.ok) continue;

        const tasksData = await tasksRes.json();
        const items = tasksData.items || [];

        for (const item of items) {
          if (!item.title && !item.notes) continue;
          
          const isCompleted = item.status === 'completed';
          let dueDate = todayStr;
          if (item.due) {
            dueDate = item.due.split('T')[0];
          }

          allTasks.push({
            id: `gtask-${item.id}`,
            googleTaskId: item.id,
            googleTaskListId: list.id,
            title: item.title || 'Untitled Google Task',
            notes: item.notes || '',
            status: isCompleted ? 'completed' : 'todo',
            priority: 'high',
            dueDate,
            completedAt: isCompleted ? (item.completed || item.updated) : undefined,
            tags: [list.title || 'Google Tasks'],
            createdAt: item.updated || new Date().toISOString(),
            updatedAt: item.updated || new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn(`Error fetching tasks for list ${list.id}:`, err);
      }
    }

    // Update local store with clean real tasks
    nayraBackend.setTasksDirectly(allTasks);
    return allTasks;
  }

  /**
   * Fetch calendar events from user's primary Google Calendar
   */
  public async fetchGoogleCalendarEvents(): Promise<CalendarEvent[]> {
    const token = this.getAccessToken();
    if (!token) return [];

    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 86400000);
    const twoMonthsAhead = new Date(now.getTime() + 60 * 86400000);

    const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
    url.searchParams.set('singleEvents', 'true');
    url.searchParams.set('orderBy', 'startTime');
    url.searchParams.set('timeMin', oneMonthAgo.toISOString());
    url.searchParams.set('timeMax', twoMonthsAhead.toISOString());
    url.searchParams.set('maxResults', '100');

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      if (res.status === 401) {
        this.disconnect();
        throw new Error('Google token expired. Please reconnect.');
      }
      throw new Error(`Failed to fetch calendar events (${res.status})`);
    }

    const data = await res.json();
    const items = data.items || [];
    const events: CalendarEvent[] = [];

    for (const item of items) {
      const isAllDay = !item.start?.dateTime;
      const startTime = item.start?.dateTime || (item.start?.date ? `${item.start.date}T00:00:00.000Z` : new Date().toISOString());
      const endTime = item.end?.dateTime || (item.end?.date ? `${item.end.date}T23:59:59.000Z` : new Date(Date.now() + 3600000).toISOString());

      let meetLink: string | undefined = undefined;
      if (item.hangoutLink) {
        meetLink = item.hangoutLink;
      } else if (item.conferenceData?.entryPoints) {
        const videoPoint = item.conferenceData.entryPoints.find((ep: any) => ep.entryPointType === 'video');
        if (videoPoint?.uri) meetLink = videoPoint.uri;
      }

      events.push({
        id: `gevent-${item.id}`,
        googleEventId: item.id,
        title: item.summary || 'Untitled Event',
        description: item.description || '',
        startTime,
        endTime,
        isAllDay,
        location: item.location || '',
        meetLink,
        category: 'work',
        createdAt: item.created || new Date().toISOString(),
        updatedAt: item.updated || new Date().toISOString()
      });
    }

    // Update local store with clean real calendar events
    nayraBackend.setCalendarEventsDirectly(events);
    return events;
  }

  /**
   * Create a task directly in Google Tasks
   */
  public async createGoogleTask(task: Partial<Task>): Promise<Task | null> {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      const payload: any = {
        title: task.title || 'New Task',
        notes: task.notes || ''
      };
      if (task.dueDate) {
        payload.due = `${task.dueDate}T00:00:00.000Z`;
      }

      const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) return null;
      const data = await res.json();

      return {
        id: `gtask-${data.id}`,
        googleTaskId: data.id,
        googleTaskListId: '@default',
        title: data.title || task.title || '',
        notes: data.notes || task.notes || '',
        status: data.status === 'completed' ? 'completed' : 'todo',
        priority: task.priority || 'medium',
        dueDate: task.dueDate || new Date().toISOString().split('T')[0],
        createdAt: data.updated || new Date().toISOString(),
        updatedAt: data.updated || new Date().toISOString()
      };
    } catch (e) {
      console.warn('Could not mirror task to Google Tasks:', e);
      return null;
    }
  }

  /**
   * Update task status or title in Google Tasks
   */
  public async updateGoogleTask(googleTaskId: string, updates: Partial<Task>, taskListId: string = '@default'): Promise<boolean> {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const payload: any = {};
      if (updates.title) payload.title = updates.title;
      if (updates.notes !== undefined) payload.notes = updates.notes;
      if (updates.status) {
        payload.status = updates.status === 'completed' ? 'completed' : 'needsAction';
        if (updates.status === 'completed') {
          payload.completed = new Date().toISOString();
        }
      }

      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${googleTaskId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      return res.ok;
    } catch (e) {
      console.warn('Could not patch Google task:', e);
      return false;
    }
  }

  /**
   * Delete task from Google Tasks
   */
  public async deleteGoogleTask(googleTaskId: string, taskListId: string = '@default'): Promise<boolean> {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${googleTaskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  /**
   * Create event directly in Google Calendar
   */
  public async createGoogleEvent(event: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      const payload: any = {
        summary: event.title || 'New Event',
        description: event.description || '',
        location: event.location || ''
      };

      if (event.isAllDay) {
        const startDate = event.startTime?.split('T')[0] || new Date().toISOString().split('T')[0];
        const endDate = event.endTime?.split('T')[0] || startDate;
        payload.start = { date: startDate };
        payload.end = { date: endDate };
      } else {
        payload.start = { dateTime: event.startTime || new Date().toISOString() };
        payload.end = { dateTime: event.endTime || new Date(Date.now() + 3600000).toISOString() };
      }

      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) return null;
      const data = await res.json();

      return {
        id: `gevent-${data.id}`,
        googleEventId: data.id,
        title: data.summary || event.title || '',
        description: data.description || event.description || '',
        startTime: data.start?.dateTime || data.start?.date || event.startTime || '',
        endTime: data.end?.dateTime || data.end?.date || event.endTime || '',
        isAllDay: Boolean(!data.start?.dateTime),
        location: data.location || '',
        meetLink: data.hangoutLink || undefined,
        category: event.category || 'work',
        createdAt: data.created || new Date().toISOString(),
        updatedAt: data.updated || new Date().toISOString()
      };
    } catch (e) {
      console.warn('Could not mirror event to Google Calendar:', e);
      return null;
    }
  }

  /**
   * Delete event from Google Calendar
   */
  public async deleteGoogleEvent(googleEventId: string): Promise<boolean> {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }
}

export const googleClientSync = new GoogleClientSyncService();
