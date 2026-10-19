import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isToday, isTomorrow, isYesterday, isPast, differenceInCalendarDays } from 'date-fns';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatDateString(date: Date | string, formatPattern: string = 'MMM d, yyyy'): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, formatPattern);
  } catch {
    return String(date);
  }
}

export function formatTimeRange(startStr: string, endStr: string, allDay: boolean = false): string {
  if (allDay) return 'All day';
  try {
    const start = parseISO(startStr);
    const end = parseISO(endStr);
    return `${format(start, 'h:mm a')} – ${format(end, 'h:mm a')}`;
  } catch {
    return '';
  }
}

export function formatFriendlyDate(dateStr: string): string {
  try {
    const d = parseISO(dateStr);
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'EEE, MMM d');
  } catch {
    return dateStr;
  }
}

export function formatGoogleTasksDue(dateStr: string): string {
  try {
    const d = parseISO(dateStr);
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    if (isYesterday(d)) return 'Yesterday';
    
    if (isPast(d)) {
      const diffDays = Math.max(1, differenceInCalendarDays(new Date(), d));
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      const diffWeeks = Math.floor(diffDays / 7);
      if (diffWeeks === 1) return '1 week ago';
      if (diffWeeks < 5) return `${diffWeeks} weeks ago`;
      return format(d, 'MMM d');
    }
    
    return format(d, 'MMM d');
  } catch {
    return dateStr;
  }
}

export function formatSecondsToTimer(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function formatSecondsToHoursMinutes(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// LocalStorage safe wrapper
export function safeLocalStorageGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = window.localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (e) {
    console.warn(`Error reading localStorage key "${key}":`, e);
    return fallback;
  }
}

/**
 * Proactively cleans up bloated, orphaned, and obsolete localStorage keys
 * to guarantee that the 5MB browser quota is never breached.
 */
export function cleanupLocalStorageQuota(preserveKey?: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;

  try {
    const keysToRemove: string[] = [];
    const keysToTrim: string[] = [];

    // Phase 1: Identify obsolete Firebase client/zombie keys and dead session keys
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (!k) continue;

      // 1. All Firebase WebStorageTabManager heartbeat and client keys
      if (
        k.startsWith('firestore_clients_') ||
        k.startsWith('firestore_zombied_') ||
        k.startsWith('firestore_mutation_') ||
        k.startsWith('firestore_sequence_number_')
      ) {
        keysToRemove.push(k);
        continue;
      }

      // 2. Dead/corrupted keys from undefined or null users
      if (
        k.includes('_null_') ||
        k.includes('_undefined_') ||
        k.startsWith('nayra_null_') ||
        k.startsWith('nayra_undefined_')
      ) {
        if (k !== preserveKey) {
          keysToRemove.push(k);
          continue;
        }
      }

      // 3. Candidate high-volume keys for pruning if needed (focus sessions, events, tasks)
      if (k.endsWith('_focus_sessions') || k.endsWith('_events') || k.endsWith('_tasks') || k.endsWith('_ca_topics')) {
        keysToTrim.push(k);
      }
    }

    // Remove obsolete keys
    keysToRemove.forEach((k) => {
      try {
        window.localStorage.removeItem(k);
      } catch {
        // ignore
      }
    });

    // Phase 2: If keys are huge, trim high-volume array keys to prevent exceeding quota
    for (const k of keysToTrim) {
      if (k === preserveKey) continue;
      try {
        const raw = window.localStorage.getItem(k);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 80) {
            // Keep the most recent 80 items (Firestore has full historical records)
            const trimmed = parsed.slice(-80);
            window.localStorage.setItem(k, JSON.stringify(trimmed));
          }
        }
      } catch {
        // ignore
      }
    }

    return true;
  } catch (e) {
    console.warn('[Storage] Quota cleanup notice:', e);
    return false;
  }
}

export function safeLocalStorageSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e: any) {
    const isQuota =
      e?.name === 'QuotaExceededError' ||
      e?.code === 22 ||
      e?.code === 1014 ||
      e?.number === -2147024882 ||
      (e?.message && typeof e.message === 'string' && (e.message.toLowerCase().includes('quota') || e.message.toLowerCase().includes('storage')));

    if (isQuota) {
      console.warn(`[Storage] Quota exceeded on key "${key}". Running emergency storage cleanup...`);
      cleanupLocalStorageQuota(key);

      // Attempt to save again after cleanup
      try {
        let valueToStore = value;
        if (Array.isArray(value) && value.length > 50) {
          valueToStore = (value as unknown[]).slice(-50) as unknown as T;
        }
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        console.info(`[Storage] Successfully saved "${key}" after quota recovery.`);
        return;
      } catch (retryErr) {
        console.warn(`[Storage] Storage quota still exceeded after cleanup for "${key}". Skipping write.`);
      }
    } else {
      console.warn(`Error writing localStorage key "${key}":`, e);
    }
  }
}
