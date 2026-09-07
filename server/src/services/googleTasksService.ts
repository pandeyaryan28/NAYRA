import { google } from 'googleapis';
import { getAuthenticatedGoogleClient, isGoogleAuthenticated } from '../config/googleAuth.js';
import { firestoreService } from './firestoreService.js';
import { Task } from '../types/index.js';

export class GoogleTasksService {
  /**
   * Performs full two-way synchronization between Google Tasks and Nayra Command Center.
   */
  async syncTasks(): Promise<{ success: boolean; syncedCount: number; message: string; tasks?: Task[] }> {
    const authClient = getAuthenticatedGoogleClient();

    if (!authClient || !isGoogleAuthenticated()) {
      return {
        success: false,
        syncedCount: 0,
        message: 'Google Account is not connected. Connect your Google Account to sync live with Google Tasks.'
      };
    }

    try {
      const tasksApi = google.tasks({ version: 'v1', auth: authClient });

      // 1. Get or find user task lists
      const taskListsRes = await tasksApi.tasklists.list();
      const taskLists = taskListsRes.data.items || [];

      let listId = '@default';
      if (taskLists.length > 0 && taskLists[0].id) {
        listId = taskLists[0].id;
      }

      // 2. Fetch tasks from Google Tasks
      const googleTasksRes = await tasksApi.tasks.list({
        tasklist: listId,
        showCompleted: true,
        showHidden: true,
        maxResults: 100
      });

      const remoteTasks = googleTasksRes.data.items || [];
      const localTasks = await firestoreService.getTasks();
      let syncCounter = 0;

      // 3. Google Tasks -> Nayra Tasks
      for (const gTask of remoteTasks) {
        if (!gTask.id || !gTask.title) continue;

        const existing = localTasks.find(t => t.googleTaskId === gTask.id || t.title.trim().toLowerCase() === gTask.title?.trim().toLowerCase());

        const isCompleted = gTask.status === 'completed';
        const dueDate = gTask.due ? gTask.due.split('T')[0] : undefined;

        if (existing) {
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
          if (gTask.title && existing.title !== gTask.title) {
            existing.title = gTask.title;
            modified = true;
          }
          existing.googleTaskId = gTask.id;
          existing.googleTaskListId = listId;
          existing.syncedAt = new Date().toISOString();
          if (modified) {
            await firestoreService.saveTask(existing);
          }
        } else {
          // Import new task from Google Tasks
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
          } catch (pushErr: any) {
            console.warn('Error pushing task to Google:', pushErr.message);
          }
        }
      }

      const updatedTasks = await firestoreService.getTasks();
      return {
        success: true,
        syncedCount: syncCounter,
        message: `Successfully 2-way synced ${syncCounter} items with actual Google Tasks.`,
        tasks: updatedTasks
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
    if (!authClient || !isGoogleAuthenticated()) return;

    try {
      const tasksApi = google.tasks({ version: 'v1', auth: authClient });
      const listId = task.googleTaskListId || '@default';

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
    } catch (e: any) {
      console.warn('Error syncing task to Google Tasks:', e.message);
    }
  }

  /**
   * Delete a task on Google Tasks
   */
  async deleteTask(googleTaskId: string, googleTaskListId?: string): Promise<void> {
    const authClient = getAuthenticatedGoogleClient();
    if (!authClient || !isGoogleAuthenticated()) return;

    try {
      const tasksApi = google.tasks({ version: 'v1', auth: authClient });
      await tasksApi.tasks.delete({
        tasklist: googleTaskListId || '@default',
        task: googleTaskId
      });
    } catch (e: any) {
      console.warn('Error deleting task on Google Tasks:', e.message);
    }
  }
}

export const googleTasksService = new GoogleTasksService();
