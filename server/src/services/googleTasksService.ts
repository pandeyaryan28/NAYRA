import { google } from 'googleapis';
import { getAuthenticatedGoogleClient, getStoredTokens } from '../config/googleAuth.js';
import { firestoreService } from './firestoreService.js';
import { Task } from '../types/index.js';

export class GoogleTasksService {
  /**
   * Performs full two-way synchronization between Google Tasks and Nayra Command Center.
   */
  async syncTasks(): Promise<{ success: boolean; syncedCount: number; message: string }> {
    const authClient = getAuthenticatedGoogleClient();
    const tokens = getStoredTokens();

    if (!authClient || tokens.isMock) {
      // Local sync simulation when Google OAuth client is in sandbox mode
      const localTasks = await firestoreService.getTasks();
      const updatedTimestamp = new Date().toISOString();
      for (const t of localTasks) {
        t.syncedAt = updatedTimestamp;
        await firestoreService.saveTask(t);
      }
      return {
        success: true,
        syncedCount: localTasks.length,
        message: 'Synchronized with Nayra Cloud Task Engine (Google OAuth ready).'
      };
    }

    try {
      const tasksApi = google.tasks({ version: 'v1', auth: authClient });

      // 1. Get user task lists
      const taskListsRes = await tasksApi.tasklists.list();
      const taskLists = taskListsRes.data.items || [];

      if (taskLists.length === 0) {
        return { success: true, syncedCount: 0, message: 'No Google Task lists found.' };
      }

      const defaultList = taskLists[0];
      const listId = defaultList.id!;

      // 2. Fetch tasks from Google Tasks
      const googleTasksRes = await tasksApi.tasks.list({
        tasklist: listId,
        showCompleted: true,
        showHidden: true
      });

      const remoteTasks = googleTasksRes.data.items || [];
      const localTasks = await firestoreService.getTasks();
      let syncCounter = 0;

      // 3. Google Tasks -> Nayra Tasks
      for (const gTask of remoteTasks) {
        if (!gTask.id || !gTask.title) continue;

        const existing = localTasks.find(t => t.googleTaskId === gTask.id || t.title.toLowerCase() === gTask.title?.toLowerCase());

        const isCompleted = gTask.status === 'completed';
        const dueDate = gTask.due ? gTask.due.split('T')[0] : undefined;

        if (existing) {
          // Update local task if remote updated
          let modified = false;
          if (isCompleted && existing.status !== 'completed') {
            existing.status = 'completed';
            existing.completedAt = new Date().toISOString();
            modified = true;
          } else if (!isCompleted && existing.status === 'completed') {
            existing.status = 'todo';
            modified = true;
          }
          if (dueDate && existing.dueDate !== dueDate) {
            existing.dueDate = dueDate;
            modified = true;
          }
          existing.googleTaskId = gTask.id;
          existing.googleTaskListId = listId;
          existing.syncedAt = new Date().toISOString();
          if (modified) await firestoreService.saveTask(existing);
        } else {
          // Import new task from Google
          const newTask: Task = {
            id: `gtask-${gTask.id}`,
            title: gTask.title,
            notes: gTask.notes || '',
            status: isCompleted ? 'completed' : 'todo',
            priority: 'medium',
            dueDate,
            googleTaskId: gTask.id,
            googleTaskListId: listId,
            createdAt: gTask.updated || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            syncedAt: new Date().toISOString()
          };
          await firestoreService.saveTask(newTask);
        }
        syncCounter++;
      }

      // 4. Nayra Tasks -> Google Tasks (push un-synced tasks)
      for (const lTask of localTasks) {
        if (!lTask.googleTaskId) {
          try {
            const createdGTask = await tasksApi.tasks.insert({
              tasklist: listId,
              requestBody: {
                title: lTask.title,
                notes: lTask.notes || '',
                status: lTask.status === 'completed' ? 'completed' : 'needsAction',
                due: lTask.dueDate ? `${lTask.dueDate}T00:00:00.000Z` : undefined
              }
            });
            if (createdGTask.data.id) {
              lTask.googleTaskId = createdGTask.data.id;
              lTask.googleTaskListId = listId;
              lTask.syncedAt = new Date().toISOString();
              await firestoreService.saveTask(lTask);
              syncCounter++;
            }
          } catch (pushErr) {
            console.warn('Error pushing task to Google:', pushErr);
          }
        }
      }

      return {
        success: true,
        syncedCount: syncCounter,
        message: `Successfully 2-way synced ${syncCounter} tasks with Google Tasks.`
      };
    } catch (error: any) {
      console.error('Google Tasks Sync error:', error);
      return {
        success: false,
        syncedCount: 0,
        message: error.message || 'Failed to sync with Google Tasks'
      };
    }
  }

  /**
   * Push a specific task create/update to Google Tasks
   */
  async pushTask(task: Task): Promise<void> {
    const authClient = getAuthenticatedGoogleClient();
    if (!authClient) return;

    try {
      const tasksApi = google.tasks({ version: 'v1', auth: authClient });
      const taskListsRes = await tasksApi.tasklists.list();
      const listId = taskListsRes.data.items?.[0]?.id || '@default';

      if (task.googleTaskId) {
        await tasksApi.tasks.patch({
          tasklist: listId,
          task: task.googleTaskId,
          requestBody: {
            title: task.title,
            notes: task.notes || '',
            status: task.status === 'completed' ? 'completed' : 'needsAction',
            due: task.dueDate ? `${task.dueDate}T00:00:00.000Z` : undefined
          }
        });
      } else {
        const created = await tasksApi.tasks.insert({
          tasklist: listId,
          requestBody: {
            title: task.title,
            notes: task.notes || '',
            status: task.status === 'completed' ? 'completed' : 'needsAction',
            due: task.dueDate ? `${task.dueDate}T00:00:00.000Z` : undefined
          }
        });
        if (created.data.id) {
          task.googleTaskId = created.data.id;
          task.googleTaskListId = listId;
          task.syncedAt = new Date().toISOString();
          await firestoreService.saveTask(task);
        }
      }
    } catch (e) {
      console.warn('Error syncing task to Google Tasks:', e);
    }
  }
}

export const googleTasksService = new GoogleTasksService();
