import { FocusSession, TaskItem, TagAnalyticsItem } from '@/types';

/**
 * Normalizes a tag to a clean, canonical string:
 * - Strips leading '#'
 * - Strips leading/trailing punctuation (commas, periods, exclamation points, colons)
 * - Converts to lower-case and trims whitespace
 */
export function normalizeTag(tag: string | null | undefined): string {
  if (!tag || typeof tag !== 'string') return '';
  return tag
    .trim()
    .replace(/^#+/, '')
    .replace(/^[^a-zA-Z0-9_\-]+|[^a-zA-Z0-9_\-]+$/g, '')
    .toLowerCase();
}

/**
 * Produces a canonical clustering key for fuzzy matching similar hashtags:
 * Replaces underscores and hyphens so that #deep-work, #deep_work, and #deepwork
 * can be identified as representing the same conceptual domain.
 */
export function getCanonicalTagKey(tag: string): string {
  const norm = normalizeTag(tag);
  return norm.replace(/[-_]/g, '');
}

/**
 * Checks if two tags are functionally similar (e.g. 'ca-law' and 'ca_law', or 'deepwork' and 'deep-work')
 */
export function areTagsSimilar(tagA: string, tagB: string): boolean {
  const normA = normalizeTag(tagA);
  const normB = normalizeTag(tagB);
  if (!normA || !normB) return false;
  if (normA === normB) return true;
  return getCanonicalTagKey(normA) === getCanonicalTagKey(normB);
}

/**
 * Extracts all valid hashtags from a string:
 * Matches words prefixed by '#' containing letters, numbers, underscores, and hyphens.
 * Returns an array of normalized, unique tags.
 */
export function extractHashtags(text: string | null | undefined): string[] {
  if (!text || typeof text !== 'string') return [];
  // Match # followed by word chars, hyphens or underscores
  const matches = text.match(/#([a-zA-Z0-9_\-]+)/g);
  if (!matches) return [];

  const set = new Set<string>();
  for (const m of matches) {
    const cleaned = normalizeTag(m);
    if (cleaned.length > 0) {
      set.add(cleaned);
    }
  }
  return Array.from(set);
}

/**
 * Cleans a task or event title that contains hashtags:
 * - Extracts all hashtags
 * - If hashtags appear at the end of the title (e.g. "Prepare Q3 filings #finance #compliance"),
 *   strips trailing hashtags so the title reads cleanly ("Prepare Q3 filings")
 * - If the entire string is hashtags (e.g. "#deepwork"), preserves the text
 * - If hashtags appear inline within a sentence (e.g. "Meeting with #investors on Friday"),
 *   preserves the title as-is while extracting the tags.
 */
export function cleanTitleWithHashtags(title: string | null | undefined): {
  cleanTitle: string;
  extractedTags: string[];
} {
  if (!title || typeof title !== 'string') {
    return { cleanTitle: '', extractedTags: [] };
  }

  const extractedTags = extractHashtags(title);
  if (extractedTags.length === 0) {
    return { cleanTitle: title.trim(), extractedTags: [] };
  }

  // Strip trailing hashtags block (e.g. "  #work #urgent")
  const strippedTrailing = title.replace(/(?:\s*#[a-zA-Z0-9_\-]+)+$/, '').trim();

  // If stripping trailing hashtags removed everything, keep original
  const cleanTitle = strippedTrailing.length > 0 ? strippedTrailing : title.trim();

  return { cleanTitle, extractedTags };
}

/**
 * Merges two arrays of tags, normalizing and deduplicating them.
 */
export function mergeTags(existingTags?: string[], newTags?: string[]): string[] {
  const set = new Set<string>();
  if (Array.isArray(existingTags)) {
    existingTags.forEach((t) => {
      const n = normalizeTag(t);
      if (n) set.add(n);
    });
  }
  if (Array.isArray(newTags)) {
    newTags.forEach((t) => {
      const n = normalizeTag(t);
      if (n) set.add(n);
    });
  }
  return Array.from(set);
}

/**
 * Calculates comprehensive tag analytics, clustering similar hashtags
 * and computing both period-specific focus time and lifetime focus time.
 */
export function calculateComprehensiveTagAnalytics(
  tasks: TaskItem[],
  sessions: FocusSession[],
  periodSessions?: FocusSession[]
): TagAnalyticsItem[] {
  // Map of canonical key -> TagAnalyticsItem & list of raw tags seen
  const clusterMap = new Map<
    string,
    {
      primaryTag: string;
      rawTags: Set<string>;
      totalTasks: number;
      completedTasks: number;
      pendingTasks: number;
      totalFocusSeconds: number;
      pomodoroCount: number;
      periodFocusSeconds: number;
      periodPomodoroCount: number;
      sessionCount: number;
      taskIds: Set<string>;
    }
  >();

  const getOrCreateCluster = (rawTag: string) => {
    const norm = normalizeTag(rawTag);
    const key = getCanonicalTagKey(norm);
    let cluster = clusterMap.get(key);
    if (!cluster) {
      cluster = {
        primaryTag: norm,
        rawTags: new Set([norm]),
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        totalFocusSeconds: 0,
        pomodoroCount: 0,
        periodFocusSeconds: 0,
        periodPomodoroCount: 0,
        sessionCount: 0,
        taskIds: new Set(),
      };
      clusterMap.set(key, cluster);
    } else {
      cluster.rawTags.add(norm);
    }
    return cluster;
  };

  // 1. Accumulate task metrics
  tasks.forEach((t) => {
    if (!t || !Array.isArray(t.tags) || t.tags.length === 0) return;
    const taskTags = new Set(t.tags.map(normalizeTag).filter(Boolean));

    taskTags.forEach((tag) => {
      const cluster = getOrCreateCluster(tag);
      if (!cluster.taskIds.has(t.id)) {
        cluster.taskIds.add(t.id);
        cluster.totalTasks += 1;
        if (t.status === 'completed' || t.archived) {
          cluster.completedTasks += 1;
        } else {
          cluster.pendingTasks += 1;
        }
        cluster.totalFocusSeconds += t.totalFocusSeconds || 0;
        cluster.pomodoroCount += t.pomodoroCount || 0;
      }
    });
  });

  // 2. Accumulate focus session metrics (handles autonomous focus blocks with tags)
  const focusOnlySessions = (sessions || []).filter((s) => s && s.mode === 'focus');
  focusOnlySessions.forEach((s) => {
    const sessionTags = new Set<string>();

    if (Array.isArray(s.tags)) {
      s.tags.forEach((tg) => {
        const norm = normalizeTag(tg);
        if (norm) sessionTags.add(norm);
      });
    }

    // If session has no linked tasks but has tags, add focus duration to cluster
    const hasLinkedTasks = (s.taskIds && s.taskIds.length > 0) || Boolean(s.taskId);
    if (!hasLinkedTasks && sessionTags.size > 0) {
      sessionTags.forEach((tag) => {
        const cluster = getOrCreateCluster(tag);
        cluster.totalFocusSeconds += s.durationSeconds || 0;
        cluster.pomodoroCount += 1;
        cluster.sessionCount += 1;
      });
    } else if (sessionTags.size > 0) {
      sessionTags.forEach((tag) => {
        const cluster = getOrCreateCluster(tag);
        cluster.sessionCount += 1;
      });
    }
  });

  // 3. Accumulate period-specific focus session metrics (Today, Yesterday, 7D, 30D, etc.)
  const activePeriodSessions = (periodSessions || focusOnlySessions).filter(
    (s) => s && s.mode === 'focus'
  );

  activePeriodSessions.forEach((s) => {
    const sessionTags = new Set<string>();

    if (Array.isArray(s.tags)) {
      s.tags.forEach((tg) => {
        const norm = normalizeTag(tg);
        if (norm) sessionTags.add(norm);
      });
    }

    // Also look up tags from linked tasks
    if (s.taskTimeAllocations && Object.keys(s.taskTimeAllocations).length > 0) {
      Object.entries(s.taskTimeAllocations).forEach(([taskId, allocatedSec]) => {
        const linkedTask = tasks.find((t) => t.id === taskId);
        if (linkedTask && Array.isArray(linkedTask.tags)) {
          linkedTask.tags.forEach((tg) => {
            const cluster = getOrCreateCluster(tg);
            cluster.periodFocusSeconds += allocatedSec;
            cluster.periodPomodoroCount += 1;
          });
        }
      });
    } else if (s.taskIds && s.taskIds.length > 0) {
      const splitSec = Math.round(s.durationSeconds / s.taskIds.length);
      s.taskIds.forEach((taskId) => {
        const linkedTask = tasks.find((t) => t.id === taskId);
        if (linkedTask && Array.isArray(linkedTask.tags)) {
          linkedTask.tags.forEach((tg) => {
            const cluster = getOrCreateCluster(tg);
            cluster.periodFocusSeconds += splitSec;
            cluster.periodPomodoroCount += 1;
          });
        }
      });
    } else if (s.taskId) {
      const linkedTask = tasks.find((t) => t.id === s.taskId);
      if (linkedTask && Array.isArray(linkedTask.tags)) {
        linkedTask.tags.forEach((tg) => {
          const cluster = getOrCreateCluster(tg);
          cluster.periodFocusSeconds += s.durationSeconds;
          cluster.periodPomodoroCount += 1;
        });
      }
    } else if (sessionTags.size > 0) {
      // Autonomous session
      sessionTags.forEach((tag) => {
        const cluster = getOrCreateCluster(tag);
        cluster.periodFocusSeconds += s.durationSeconds;
        cluster.periodPomodoroCount += 1;
      });
    }
  });

  // Convert clusters to TagAnalyticsItem array
  return Array.from(clusterMap.values()).map((c) => ({
    tag: c.primaryTag,
    totalTasks: c.totalTasks,
    completedTasks: c.completedTasks,
    pendingTasks: c.pendingTasks,
    completionRate:
      c.totalTasks > 0 ? Math.round((c.completedTasks / c.totalTasks) * 100) : 0,
    totalFocusSeconds: c.totalFocusSeconds,
    pomodoroCount: c.pomodoroCount,
    periodFocusSeconds: c.periodFocusSeconds,
    periodPomodoroCount: c.periodPomodoroCount,
    sessionCount: c.sessionCount,
    aliases: Array.from(c.rawTags),
  }));
}
