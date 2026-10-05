import { CalendarEvent, NayraCalendar, TaskItem, TaskList } from '@/types';

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';
const TASKS_API_BASE = 'https://tasks.googleapis.com/tasks/v1';

export class GoogleApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'GoogleApiError';
    this.status = status;
  }
}

async function fetchGoogleApi<T>(url: string, accessToken: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${accessToken}`);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Google API Error: ${response.status} ${response.statusText}`;
    try {
      const errBody = await response.json();
      if (errBody?.error?.message) {
        errorMsg = errBody.error.message;
      }
    } catch {
      // Use fallback errorMsg
    }
    throw new GoogleApiError(errorMsg, response.status);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ==========================================
// Google Calendar API V3
// ==========================================

export async function fetchGoogleCalendars(accessToken: string): Promise<NayraCalendar[]> {
  const data = await fetchGoogleApi<{ items: any[] }>(
    `${CALENDAR_API_BASE}/users/me/calendarList`,
    accessToken
  );

  return (data.items || []).map((cal) => ({
    id: `gcal_${cal.id}`,
    googleCalendarId: cal.id,
    summary: cal.summary || 'Untitled Calendar',
    description: cal.description,
    colorId: cal.colorId,
    backgroundColor: cal.backgroundColor || '#0284c7',
    foregroundColor: cal.foregroundColor || '#ffffff',
    primary: Boolean(cal.primary),
    selected: cal.selected !== false,
    timeZone: cal.timeZone,
  }));
}

export function resolveGoogleCalendarId(calendarId: string = 'primary', calendars?: NayraCalendar[]): string {
  if (!calendarId || calendarId === 'primary' || calendarId === 'cal_work') {
    return 'primary';
  }
  if (calendars && calendars.length > 0) {
    const found = calendars.find((c) => c.id === calendarId || c.googleCalendarId === calendarId);
    if (found?.googleCalendarId) {
      return found.googleCalendarId;
    }
  }
  return calendarId.startsWith('gcal_') ? calendarId.replace('gcal_', '') : calendarId;
}

export function resolveGoogleTaskListId(taskListId: string = '@default', taskLists?: TaskList[]): string {
  if (!taskListId || taskListId === 'list_default' || taskListId === '@default') {
    return '@default';
  }
  if (taskLists && taskLists.length > 0) {
    const found = taskLists.find((l) => l.id === taskListId || l.googleTaskListId === taskListId);
    if (found?.googleTaskListId) {
      return found.googleTaskListId;
    }
  }
  return taskListId.startsWith('gtl_') ? taskListId.replace('gtl_', '') : taskListId;
}


export function formatGoogleDateTime(iso?: string): string {
  if (!iso) return new Date().toISOString();
  if (iso.includes('Z') || iso.includes('+') || (iso.length > 19 && iso.charAt(19) === '-')) {
    return iso;
  }
  try {
    const d = new Date(iso);
    if (!isNaN(d.getTime())) {
      return d.toISOString();
    }
  } catch {
    // fallback
  }
  return new Date().toISOString();
}

export async function fetchGoogleEvents(
  accessToken: string,
  calendarId: string = 'primary',
  timeMin?: string,
  timeMax?: string,
  calendars?: NayraCalendar[]
): Promise<CalendarEvent[]> {
  const gcalId = resolveGoogleCalendarId(calendarId, calendars);
  const params = new URLSearchParams({
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  });
  if (timeMin) params.set('timeMin', timeMin);
  if (timeMax) params.set('timeMax', timeMax);

  const data = await fetchGoogleApi<{ items: any[] }>(
    `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(gcalId)}/events?${params.toString()}`,
    accessToken
  );

  const activeItems = (data.items || []).filter((ev) => ev.status !== 'cancelled');

  return activeItems.map((ev) => {
    const isAllDay = Boolean(ev.start?.date);
    const start = ev.start?.dateTime || ev.start?.date || new Date().toISOString();
    const end = ev.end?.dateTime || ev.end?.date || start;

    return {
      id: `gev_${ev.id}`,
      googleEventId: ev.id,
      calendarId: calendarId === 'primary' ? 'primary' : (calendarId.startsWith('gcal_') ? calendarId : `gcal_${gcalId}`),
      title: ev.summary || '(No title)',
      description: ev.description,
      start,
      end,
      allDay: isAllDay,
      location: ev.location,
      color: ev.colorId,
      attendees: ev.attendees?.map((a: any) => ({
        email: a.email,
        displayName: a.displayName,
        responseStatus: a.responseStatus,
      })),
      createdAt: ev.created || new Date().toISOString(),
      updatedAt: ev.updated || new Date().toISOString(),
    };
  });
}

export async function createGoogleEvent(
  accessToken: string,
  calendarId: string,
  event: Partial<CalendarEvent>
): Promise<any> {
  const gcalId = resolveGoogleCalendarId(calendarId);
  const payload: any = {
    summary: event.title,
    description: event.description,
    location: event.location,
  };

  if (event.allDay) {
    payload.start = { date: event.start?.split('T')[0] };
    payload.end = { date: event.end?.split('T')[0] };
  } else {
    payload.start = { dateTime: formatGoogleDateTime(event.start) };
    payload.end = { dateTime: formatGoogleDateTime(event.end) };
  }

  return fetchGoogleApi(
    `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(gcalId)}/events`,
    accessToken,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export async function updateGoogleEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  event: Partial<CalendarEvent>
): Promise<any> {
  const gcalId = resolveGoogleCalendarId(calendarId);
  const gevId = eventId.startsWith('gev_') ? eventId.replace('gev_', '') : eventId;

  const payload: any = {};
  if (event.title !== undefined) payload.summary = event.title;
  if (event.description !== undefined) payload.description = event.description;
  if (event.location !== undefined) payload.location = event.location;

  if (event.allDay) {
    if (event.start) payload.start = { date: event.start.split('T')[0] };
    if (event.end) payload.end = { date: event.end.split('T')[0] };
  } else {
    if (event.start) payload.start = { dateTime: formatGoogleDateTime(event.start) };
    if (event.end) payload.end = { dateTime: formatGoogleDateTime(event.end) };
  }

  return fetchGoogleApi(
    `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(gcalId)}/events/${encodeURIComponent(gevId)}`,
    accessToken,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  );
}

export async function deleteGoogleEvent(
  accessToken: string,
  calendarId: string,
  eventId: string
): Promise<void> {
  const gcalId = resolveGoogleCalendarId(calendarId);
  const gevId = eventId.startsWith('gev_') ? eventId.replace('gev_', '') : eventId;

  await fetchGoogleApi(
    `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(gcalId)}/events/${encodeURIComponent(gevId)}`,
    accessToken,
    { method: 'DELETE' }
  );
}

// ==========================================
// Google Tasks API V1
// ==========================================

export async function fetchGoogleTaskLists(accessToken: string): Promise<TaskList[]> {
  let allRawItems: any[] = [];
  let pageToken: string | undefined = undefined;

  do {
    const params = new URLSearchParams({
      maxResults: '100',
    });
    if (pageToken) {
      params.set('pageToken', pageToken);
    }

    const data = await fetchGoogleApi<{ items?: any[]; nextPageToken?: string }>(
      `${TASKS_API_BASE}/users/@me/lists?${params.toString()}`,
      accessToken
    );

    if (data.items && data.items.length > 0) {
      allRawItems = allRawItems.concat(data.items);
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  return allRawItems.map((list, idx) => ({
    id: `gtl_${list.id}`,
    googleTaskListId: list.id,
    title: list.title || 'My Tasks',
    isDefault: idx === 0,
    updatedAt: list.updated || new Date().toISOString(),
  }));
}

export async function createGoogleTaskList(
  accessToken: string,
  title: string
): Promise<any> {
  return fetchGoogleApi(
    `${TASKS_API_BASE}/users/@me/lists`,
    accessToken,
    {
      method: 'POST',
      body: JSON.stringify({ title }),
    }
  );
}

export async function deleteGoogleTaskList(
  accessToken: string,
  taskListId: string
): Promise<void> {
  const gtlId = resolveGoogleTaskListId(taskListId);
  await fetchGoogleApi(
    `${TASKS_API_BASE}/users/@me/lists/${encodeURIComponent(gtlId)}`,
    accessToken,
    { method: 'DELETE' }
  );
}

export async function clearGoogleCompletedTasks(
  accessToken: string,
  taskListId: string = '@default',
  taskLists?: TaskList[]
): Promise<void> {
  const gtlId = resolveGoogleTaskListId(taskListId, taskLists);
  await fetchGoogleApi(
    `${TASKS_API_BASE}/lists/${encodeURIComponent(gtlId)}/clear`,
    accessToken,
    { method: 'POST' }
  );
}

export async function fetchGoogleTasks(
  accessToken: string,
  taskListId: string = '@default',
  localTaskListId?: string,
  taskLists?: TaskList[]
): Promise<TaskItem[]> {
  const gtlId = resolveGoogleTaskListId(taskListId, taskLists);
  let allRawItems: any[] = [];
  let pageToken: string | undefined = undefined;

  do {
    const params = new URLSearchParams({
      showCompleted: 'true',
      showHidden: 'true',
      maxResults: '100',
    });
    if (pageToken) {
      params.set('pageToken', pageToken);
    }

    const data = await fetchGoogleApi<{ items?: any[]; nextPageToken?: string }>(
      `${TASKS_API_BASE}/lists/${encodeURIComponent(gtlId)}/tasks?${params.toString()}`,
      accessToken
    );

    if (data.items && data.items.length > 0) {
      allRawItems = allRawItems.concat(data.items);
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  const resolvedLocalId =
    localTaskListId ||
    (taskListId === '@default' || taskListId === 'list_default'
      ? 'list_default'
      : taskListId.startsWith('gtl_')
      ? taskListId
      : `gtl_${taskListId}`);

  const activeItems = allRawItems.filter((t) => !t.deleted);

  // Group subtasks by parent id
  const itemsById = new Map<string, any>();
  activeItems.forEach((t) => itemsById.set(t.id, t));

  const childItemsByParent = new Map<string, any[]>();
  activeItems.forEach((t) => {
    if (t.parent && itemsById.has(t.parent)) {
      const children = childItemsByParent.get(t.parent) || [];
      children.push(t);
      childItemsByParent.set(t.parent, children);
    }
  });

  return activeItems.map((t) => {
    const isCompleted = t.status === 'completed';
    const subtasks = (childItemsByParent.get(t.id) || []).map((sub) => ({
      id: `gtask_${sub.id}`,
      title: sub.title || 'Untitled Subtask',
      completed: sub.status === 'completed',
    }));

    return {
      id: `gtask_${t.id}`,
      googleTaskId: t.id,
      parentTaskId: t.parent,
      taskListId: resolvedLocalId,
      title: t.title || 'Untitled Task',
      notes: t.notes || '',
      status: isCompleted ? 'completed' : 'needsAction',
      archived: isCompleted || Boolean(t.hidden),
      archivedAt: isCompleted ? (t.completed || t.updated || new Date().toISOString()) : undefined,
      due: t.due ? (t.due.includes('T00:00:00') ? t.due.split('T')[0] : t.due.replace('.000Z', '').replace('Z', '')) : undefined,
      completedAt: t.completed,
      priority: 'medium',
      subtasks: subtasks.length > 0 ? subtasks : undefined,
      totalFocusSeconds: 0,
      pomodoroCount: 0,
      createdAt: t.updated || new Date().toISOString(),
      updatedAt: t.updated || new Date().toISOString(),
    };
  });
}

export async function createGoogleTask(
  accessToken: string,
  taskListId: string,
  task: Partial<TaskItem>,
  taskLists?: TaskList[]
): Promise<any> {
  const gtlId = resolveGoogleTaskListId(taskListId, taskLists);
  const payload: any = {
    title: task.title || 'New Task',
    notes: task.notes || '',
  };
  if (task.status) {
    payload.status = task.status;
  }
  if (task.due) {
    payload.due = task.due.includes('T') ? formatGoogleDateTime(task.due) : `${task.due}T00:00:00.000Z`;
  }

  return fetchGoogleApi(
    `${TASKS_API_BASE}/lists/${encodeURIComponent(gtlId)}/tasks`,
    accessToken,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export async function updateGoogleTask(
  accessToken: string,
  taskListId: string,
  taskId: string,
  task: Partial<TaskItem>,
  taskLists?: TaskList[]
): Promise<any> {
  const gtlId = resolveGoogleTaskListId(taskListId, taskLists);
  const gtId = taskId.startsWith('gtask_') ? taskId.replace('gtask_', '') : taskId;

  const payload: any = {};
  if (task.title !== undefined) payload.title = task.title;
  if (task.notes !== undefined) payload.notes = task.notes;
  if (task.status !== undefined) {
    payload.status = task.status;
    if (task.status === 'completed') {
      payload.completed = task.completedAt || new Date().toISOString();
    }
  }
  if (task.due !== undefined) {
    payload.due = task.due ? (task.due.includes('T') ? formatGoogleDateTime(task.due) : `${task.due}T00:00:00.000Z`) : null;
  }

  return fetchGoogleApi(
    `${TASKS_API_BASE}/lists/${encodeURIComponent(gtlId)}/tasks/${encodeURIComponent(gtId)}`,
    accessToken,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  );
}

export async function updateGoogleTaskStatus(
  accessToken: string,
  taskListId: string,
  taskId: string,
  status: 'needsAction' | 'completed',
  taskLists?: TaskList[]
): Promise<any> {
  const gtlId = resolveGoogleTaskListId(taskListId, taskLists);
  const gtId = taskId.startsWith('gtask_') ? taskId.replace('gtask_', '') : taskId;

  const payload: any = {
    id: gtId,
    status,
  };
  if (status === 'completed') {
    payload.completed = new Date().toISOString();
  }

  return fetchGoogleApi(
    `${TASKS_API_BASE}/lists/${encodeURIComponent(gtlId)}/tasks/${encodeURIComponent(gtId)}`,
    accessToken,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  );
}

export async function deleteGoogleTask(
  accessToken: string,
  taskListId: string,
  taskId: string,
  taskLists?: TaskList[]
): Promise<void> {
  const gtlId = resolveGoogleTaskListId(taskListId, taskLists);
  const gtId = taskId.startsWith('gtask_') ? taskId.replace('gtask_', '') : taskId;

  await fetchGoogleApi(
    `${TASKS_API_BASE}/lists/${encodeURIComponent(gtlId)}/tasks/${encodeURIComponent(gtId)}`,
    accessToken,
    { method: 'DELETE' }
  );
}
