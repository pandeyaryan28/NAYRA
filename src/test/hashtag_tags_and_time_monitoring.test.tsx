import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  extractHashtags,
  cleanTitleWithHashtags,
  normalizeTag,
  getCanonicalTagKey,
  areTagsSimilar,
  calculateComprehensiveTagAnalytics,
} from '@/lib/tagUtils';
import { TaskItem, FocusSession } from '@/types';

describe('Hashtags as Tags & Time Monitoring Engine (v2.10.0)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('1. Hashtag Extraction and Title Normalization', () => {
    it('extracts hashtags from text and normalizes them correctly', () => {
      const text = 'Finish chapter 4 of CA Law #ca_law #study #Audit2026';
      const tags = extractHashtags(text);
      expect(tags).toEqual(['ca_law', 'study', 'audit2026']);
    });

    it('cleans trailing hashtags from titles while keeping in-sentence words', () => {
      const titleWithTrailing = 'Synthesize Neural Matrix #deepwork #ai';
      const resultTrailing = cleanTitleWithHashtags(titleWithTrailing);
      expect(resultTrailing.cleanTitle).toBe('Synthesize Neural Matrix');
      expect(resultTrailing.extractedTags).toEqual(['deepwork', 'ai']);

      const titleWithInline = 'Review #important document before meeting #audit';
      const resultInline = cleanTitleWithHashtags(titleWithInline);
      expect(resultInline.cleanTitle).toBe('Review #important document before meeting');
      expect(resultInline.extractedTags).toEqual(['important', 'audit']);
    });

    it('normalizes tags by stripping symbols, punctuation, and lowercasing', () => {
      expect(normalizeTag('#Deep-Work!')).toBe('deep-work');
      expect(normalizeTag('#CA_LAW,')).toBe('ca_law');
      expect(normalizeTag('  #Focus  ')).toBe('focus');
    });
  });

  describe('2. Similar Hashtag Clustering & Canonical Keys', () => {
    it('computes canonical keys stripping dashes and underscores', () => {
      expect(getCanonicalTagKey('deep-work')).toBe('deepwork');
      expect(getCanonicalTagKey('deep_work')).toBe('deepwork');
      expect(getCanonicalTagKey('deepwork')).toBe('deepwork');
    });

    it('correctly identifies similar hashtags to prevent analytics fragmentation', () => {
      expect(areTagsSimilar('deep-work', 'deepwork')).toBe(true);
      expect(areTagsSimilar('deep_work', 'deep-work')).toBe(true);
      expect(areTagsSimilar('ca-law', 'calaw')).toBe(true);
      expect(areTagsSimilar('study', 'gaming')).toBe(false);
    });
  });

  describe('3. Comprehensive Tag Analytics & Focus Time Monitoring', () => {
    it('clusters similar hashtags (#deepwork, #deep-work, #deep_work) and unifies time', () => {
      const sampleTasks: TaskItem[] = [
        {
          id: 'task-1',
          title: 'Deep coding session',
          taskListId: 'list-1',
          status: 'completed',
          priority: 'high',
          tags: ['deep-work'],
          totalFocusSeconds: 3600, // 1 hour
          pomodoroCount: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
        {
          id: 'task-2',
          title: 'Architecture design',
          taskListId: 'list-1',
          status: 'needsAction',
          priority: 'medium',
          tags: ['deepwork'],
          totalFocusSeconds: 1800, // 30 mins
          pomodoroCount: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const sampleSessions: FocusSession[] = [
        // Autonomous focus session with #deep_work
        {
          id: 'sess-1',
          taskId: null,
          taskTitle: null,
          mode: 'focus',
          durationSeconds: 1200, // 20 mins
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          interrupted: false,
          tags: ['deep_work'],
        },
      ];

      const analytics = calculateComprehensiveTagAnalytics(sampleTasks, sampleSessions, sampleSessions);

      // Should have clustered all 3 variations into a single item
      expect(analytics.length).toBe(1);
      const cluster = analytics[0];

      // Primary tag should be one of the variants, and aliases should include the other variants
      expect(['deep-work', 'deepwork', 'deep_work']).toContain(cluster.tag);
      expect(cluster.totalTasks).toBe(2);
      expect(cluster.completedTasks).toBe(1);
      expect(cluster.pendingTasks).toBe(1);
      expect(cluster.completionRate).toBe(50);

      // Total time: 3600 + 1800 (from tasks) + 1200 (autonomous session) = 6600s
      expect(cluster.totalFocusSeconds).toBe(6600);
      expect(cluster.pomodoroCount).toBe(4); // 2 + 1 + 1 session
      expect(cluster.aliases && cluster.aliases.length > 0).toBe(true);
    });

    it('monitors period-specific focus time allocations accurately', () => {
      const task: TaskItem = {
        id: 't-audit',
        title: 'Tax Audit Prep',
        taskListId: 'list-1',
        status: 'completed',
        priority: 'high',
        tags: ['audit'],
        totalFocusSeconds: 7200, // 2 hours lifetime
        pomodoroCount: 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };

      // Period sessions only includes 1 session today of 1800s
      const todaySession: FocusSession = {
        id: 's-today',
        taskId: 't-audit',
        taskTitle: 'Tax Audit Prep',
        mode: 'focus',
        durationSeconds: 1800,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        interrupted: false,
        tags: ['audit'],
      };

      const analytics = calculateComprehensiveTagAnalytics([task], [todaySession], [todaySession]);

      expect(analytics.length).toBe(1);
      expect(analytics[0].totalFocusSeconds).toBe(7200);
      expect(analytics[0].periodFocusSeconds).toBe(1800);
    });
  });
});
