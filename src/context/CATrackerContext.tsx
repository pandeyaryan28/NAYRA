import React, { createContext, useContext, useReducer, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Topic,
  TopicStatus,
  RevisionRecord,
  TestRecord,
  CAUserSettings,
  ConfidenceLevel,
  ImportExportPayload,
  ImportConflictResolution,
  ResetSyllabusOptions,
  DataState,
  DataAction,
  DataContextValue,
  Lecture,
  ScheduleEntry,
} from '@/types/ca';
import {
  loadSeedSyllabus,
  loadSeedLectures,
  loadSeedSchedule,
  buildSubjectGroups,
  calculateDashboardMetrics,
  generateActionPlan,
} from '@/lib/ca/seedLoader';
import { DEFAULT_CA_SETTINGS, CA_STORAGE_KEYS } from '@/lib/ca/constants';
import {
  generateId,
  getTodayDateString,
  calculateNextRevisionDate,
} from '@/lib/ca/utils';
import { safeLocalStorageSet } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  DEFAULT_USER_ID,
  isTestEnv,
  saveTopicToFirestore,
  deleteTopicFromFirestore,
  saveTestToFirestore,
  deleteTestFromFirestore,
  saveRevisionToFirestore,
  deleteRevisionFromFirestore,
  saveSettingsToFirestore,
  fetchUserSettingsFromFirestore,
  syncLecturesWithCloud,
  saveLectureToFirestore,
  saveScheduleEntryToFirestore,
  deleteScheduleEntryFromFirestore,
  syncScheduleWithCloud,
  batchUploadAllData,
  syncAndFillSyllabusWithCloud,
  subscribeToUserData,
  isHardReloadOrRefresh,
  fetchAllCAUserDataFromFirestore,
  flushPendingCAChangesToFirestore,
  CAPendingSync,
} from '@/lib/ca/firebase';

const seed = loadSeedSyllabus();
const seedLectures = loadSeedLectures();
const seedSchedule = loadSeedSchedule();

function loadCachedSettings(): CAUserSettings {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(CA_STORAGE_KEYS.SETTINGS) : null;
    const dedicatedExamDate =
      typeof window !== 'undefined' && CA_STORAGE_KEYS.TARGET_EXAM_DATE
        ? localStorage.getItem(CA_STORAGE_KEYS.TARGET_EXAM_DATE)
        : null;

    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const resolvedExamDate =
          (dedicatedExamDate && dedicatedExamDate.trim()) ||
          (parsed.examDate && String(parsed.examDate).trim()) ||
          DEFAULT_CA_SETTINGS.examDate;

        return {
          ...DEFAULT_CA_SETTINGS,
          ...parsed,
          examDate: resolvedExamDate,
        };
      }
    }

    if (dedicatedExamDate && dedicatedExamDate.trim()) {
      return {
        ...DEFAULT_CA_SETTINGS,
        examDate: dedicatedExamDate.trim(),
      };
    }
  } catch (err) {
    console.warn('[CATrackerContext] Error reading settings from localStorage:', err);
  }
  return DEFAULT_CA_SETTINGS;
}

function saveCachedSettings(settings: CAUserSettings): void {
  try {
    if (typeof window !== 'undefined') {
      safeLocalStorageSet(CA_STORAGE_KEYS.SETTINGS, settings);
      if (settings.examDate && settings.examDate.trim()) {
        safeLocalStorageSet(CA_STORAGE_KEYS.TARGET_EXAM_DATE, settings.examDate.trim());
      }
    }
  } catch (err) {
    console.warn('[CATrackerContext] Error saving settings to localStorage:', err);
  }
}

function resolveSettingsConflict(cached: CAUserSettings, cloudSettings: CAUserSettings): CAUserSettings {
  const cachedTime = cached.lastSyncedAt ? new Date(cached.lastSyncedAt).getTime() : 0;
  const cloudTime = cloudSettings.lastSyncedAt ? new Date(cloudSettings.lastSyncedAt).getTime() : 0;

  if (cachedTime > cloudTime) {
    return {
      ...cloudSettings,
      ...cached,
      examDate: cached.examDate || cloudSettings.examDate || DEFAULT_CA_SETTINGS.examDate,
    };
  }

  return {
    ...cached,
    ...cloudSettings,
    examDate: (cloudSettings.examDate && cloudSettings.examDate.trim()) || cached.examDate || DEFAULT_CA_SETTINGS.examDate,
  };
}

function loadCachedTopics(): Topic[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(CA_STORAGE_KEYS.TOPICS) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[CATrackerContext] Error reading topics from localStorage:', err);
  }
  saveCachedTopics(seed.topics);
  return seed.topics;
}

function saveCachedTopics(topics: Topic[]): void {
  try {
    if (typeof window !== 'undefined') {
      safeLocalStorageSet(CA_STORAGE_KEYS.TOPICS, topics);
    }
  } catch (err) {
    console.warn('[CATrackerContext] Error saving topics to localStorage:', err);
  }
}

function loadCachedLectures(): Lecture[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(CA_STORAGE_KEYS.LECTURES) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[CATrackerContext] Error reading lectures from localStorage:', err);
  }
  saveCachedLectures(seedLectures);
  return seedLectures;
}

function saveCachedLectures(lectures: Lecture[]): void {
  try {
    if (typeof window !== 'undefined') {
      safeLocalStorageSet(CA_STORAGE_KEYS.LECTURES, lectures);
    }
  } catch (err) {
    console.warn('[CATrackerContext] Error saving lectures to localStorage:', err);
  }
}

function loadCachedSchedule(): ScheduleEntry[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(CA_STORAGE_KEYS.SCHEDULE) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[CATrackerContext] Error reading schedule from localStorage:', err);
  }
  saveCachedSchedule(seedSchedule);
  return seedSchedule;
}

function saveCachedSchedule(schedule: ScheduleEntry[]): void {
  try {
    if (typeof window !== 'undefined') {
      safeLocalStorageSet(CA_STORAGE_KEYS.SCHEDULE, schedule);
    }
  } catch (err) {
    console.warn('[CATrackerContext] Error saving schedule to localStorage:', err);
  }
}

function loadCachedRevisions(): RevisionRecord[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(CA_STORAGE_KEYS.REVISIONS) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[CATrackerContext] Error reading revisions from localStorage:', err);
  }
  return [];
}

function saveCachedRevisions(revisions: RevisionRecord[]): void {
  try {
    if (typeof window !== 'undefined') {
      safeLocalStorageSet(CA_STORAGE_KEYS.REVISIONS, revisions);
    }
  } catch (err) {
    console.warn('[CATrackerContext] Error saving revisions to localStorage:', err);
  }
}

function loadCachedTests(): TestRecord[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(CA_STORAGE_KEYS.TESTS) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[CATrackerContext] Error reading tests from localStorage:', err);
  }
  return [];
}

function saveCachedTests(tests: TestRecord[]): void {
  try {
    if (typeof window !== 'undefined') {
      safeLocalStorageSet(CA_STORAGE_KEYS.TESTS, tests);
    }
  } catch (err) {
    console.warn('[CATrackerContext] Error saving tests to localStorage:', err);
  }
}

function loadPendingSync(): CAPendingSync {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(CA_STORAGE_KEYS.PENDING_SYNC) : null;
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function savePendingSync(pending: CAPendingSync): void {
  try {
    if (typeof window !== 'undefined') {
      safeLocalStorageSet(CA_STORAGE_KEYS.PENDING_SYNC, pending);
    }
  } catch {}
}

function recordPendingSync(partial: Partial<CAPendingSync>): void {
  const current = loadPendingSync();
  const merged: CAPendingSync = {
    ...current,
    topics: { ...(current.topics || {}), ...(partial.topics || {}) },
    deletedTopicIds: Array.from(new Set([...(current.deletedTopicIds || []), ...(partial.deletedTopicIds || [])])),
    lectures: { ...(current.lectures || {}), ...(partial.lectures || {}) },
    schedule: { ...(current.schedule || {}), ...(partial.schedule || {}) },
    deletedScheduleIds: Array.from(new Set([...(current.deletedScheduleIds || []), ...(partial.deletedScheduleIds || [])])),
    revisions: { ...(current.revisions || {}), ...(partial.revisions || {}) },
    deletedRevisionIds: Array.from(new Set([...(current.deletedRevisionIds || []), ...(partial.deletedRevisionIds || [])])),
    tests: { ...(current.tests || {}), ...(partial.tests || {}) },
    deletedTestIds: Array.from(new Set([...(current.deletedTestIds || []), ...(partial.deletedTestIds || [])])),
    settings: partial.settings || current.settings,
  };
  savePendingSync(merged);
}

function getInitialState(): DataState {
  const initialSettings = loadCachedSettings();
  const initialTopics = loadCachedTopics();
  const initialLectures = loadCachedLectures();
  const initialSchedule = loadCachedSchedule();
  const initialRevisions = loadCachedRevisions();
  const initialTests = loadCachedTests();
  return {
    topics: initialTopics,
    revisions: initialRevisions,
    tests: initialTests,
    lectures: initialLectures,
    schedule: initialSchedule,
    settings: initialSettings,
    subjects: seed.subjects,
    chapters: seed.chapters,
    isLoading: false,
    isSyncing: false,
    isCloudConnected: true,
    error: null,
    lastSyncedAt: initialSettings.lastSyncedAt || new Date().toISOString(),
  };
}

function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'INITIALIZE_STATE':
      return {
        ...state,
        topics: action.payload.topics,
        revisions: action.payload.revisions,
        tests: action.payload.tests,
        lectures: action.payload.lectures || state.lectures,
        schedule: action.payload.schedule || state.schedule,
        settings: action.payload.settings,
        isLoading: false,
      };

    case 'SET_TOPICS':
      saveCachedTopics(action.payload);
      return {
        ...state,
        topics: action.payload,
      };

    case 'UPDATE_TOPIC_STATUS': {
      const { topicId, status, customDate } = action.payload;
      let nowIso = new Date().toISOString();
      if (customDate) {
        try {
          const parsed = new Date(customDate);
          if (!isNaN(parsed.getTime())) {
            nowIso = parsed.toISOString();
          }
        } catch {
          nowIso = new Date().toISOString();
        }
      }

      const updatedTopics = state.topics.map((topic) => {
        if (topic.id !== topicId) return topic;

        const updated: Topic = {
          ...topic,
          status,
        };

        if (status === 'in_progress') {
          if (!updated.startedAt) updated.startedAt = nowIso;
        } else if (status === 'completed') {
          if (!updated.startedAt) updated.startedAt = nowIso;
          if (!updated.completedAt) updated.completedAt = nowIso;
        } else if (status === 'pending') {
          updated.completedAt = undefined;
        }

        return updated;
      });

      const updatedSchedule = state.schedule.map((entry) => {
        if (entry.topicIds && entry.topicIds.includes(topicId)) {
          const allDone = entry.topicIds.every((id) => {
            const top = updatedTopics.find((t) => t.id === id);
            return top?.status === 'completed';
          });
          return {
            ...entry,
            completed: allDone,
            completedAt: allDone ? (entry.completedAt || nowIso) : undefined,
          };
        }
        return entry;
      });

      const newRevisions = [...state.revisions];
      const targetTopic = updatedTopics.find((t) => t.id === topicId);
      if (
        status === 'completed' &&
        targetTopic &&
        state.settings.autoScheduleRevisions
      ) {
        const existingRev = newRevisions.find((r) => r.topicId === topicId);
        if (!existingRev) {
          const today = getTodayDateString();
          const nextDate = calculateNextRevisionDate(today, 1, 'low');
          newRevisions.push({
            id: generateId('rev'),
            topicId: targetTopic.id,
            topicTitle: targetTopic.title,
            chapterId: targetTopic.chapterId,
            chapterName: targetTopic.chapterName,
            subjectId: targetTopic.subjectId,
            cycle: 1,
            lastRevisedDate: today,
            nextTargetDate: nextDate,
            confidence: 'medium',
            createdAt: nowIso,
            updatedAt: nowIso,
          });
        }
      }

      saveCachedTopics(updatedTopics);

      return {
        ...state,
        topics: updatedTopics,
        revisions: newRevisions,
        schedule: updatedSchedule,
      };
    }

    case 'BATCH_UPDATE_TOPIC_STATUS': {
      const { topicIds, status, customDate } = action.payload;
      const topicIdSet = new Set(topicIds);
      let nowIso = new Date().toISOString();
      if (customDate) {
        try {
          const parsed = new Date(customDate);
          if (!isNaN(parsed.getTime())) {
            nowIso = parsed.toISOString();
          }
        } catch {
          nowIso = new Date().toISOString();
        }
      }

      const updatedTopics = state.topics.map((topic) => {
        if (!topicIdSet.has(topic.id)) return topic;

        const updated: Topic = {
          ...topic,
          status,
        };

        if (status === 'in_progress') {
          if (!updated.startedAt) updated.startedAt = nowIso;
        } else if (status === 'completed') {
          if (!updated.startedAt) updated.startedAt = nowIso;
          if (!updated.completedAt) updated.completedAt = nowIso;
        } else if (status === 'pending') {
          updated.completedAt = undefined;
        }

        return updated;
      });

      const updatedSchedule = state.schedule.map((entry) => {
        if (entry.topicIds && entry.topicIds.some((id) => topicIdSet.has(id))) {
          const allDone = entry.topicIds.every((id) => {
            const top = updatedTopics.find((t) => t.id === id);
            return top?.status === 'completed';
          });
          return {
            ...entry,
            completed: allDone,
            completedAt: allDone ? (entry.completedAt || nowIso) : undefined,
          };
        }
        return entry;
      });

      const newRevisions = [...state.revisions];
      if (status === 'completed' && state.settings.autoScheduleRevisions) {
        const today = getTodayDateString();
        const nextDate = calculateNextRevisionDate(today, 1, 'low');

        for (const tid of topicIds) {
          const targetTopic = updatedTopics.find((t) => t.id === tid);
          if (targetTopic) {
            const existingRev = newRevisions.find((r) => r.topicId === tid);
            if (!existingRev) {
              newRevisions.push({
                id: generateId('rev'),
                topicId: targetTopic.id,
                topicTitle: targetTopic.title,
                chapterId: targetTopic.chapterId,
                chapterName: targetTopic.chapterName,
                subjectId: targetTopic.subjectId,
                cycle: 1,
                lastRevisedDate: today,
                nextTargetDate: nextDate,
                confidence: 'medium',
                createdAt: nowIso,
                updatedAt: nowIso,
              });
            }
          }
        }
      }

      saveCachedTopics(updatedTopics);

      return {
        ...state,
        topics: updatedTopics,
        revisions: newRevisions,
        schedule: updatedSchedule,
      };
    }

    case 'UPDATE_TOPIC': {
      const { topicId, updates } = action.payload;
      const updatedTopics = state.topics.map((t) => (t.id === topicId ? { ...t, ...updates } : t));
      saveCachedTopics(updatedTopics);
      return {
        ...state,
        topics: updatedTopics,
      };
    }

    case 'ADD_TOPIC': {
      const newTopic = action.payload;
      const newTopics = [...state.topics, newTopic];
      saveCachedTopics(newTopics);
      return {
        ...state,
        topics: newTopics,
      };
    }

    case 'DELETE_TOPIC': {
      const { topicId } = action.payload;
      const filtered = state.topics.filter((t) => t.id !== topicId);
      saveCachedTopics(filtered);
      return {
        ...state,
        topics: filtered,
        revisions: state.revisions.filter((r) => r.topicId !== topicId),
      };
    }

    case 'SET_TESTS':
      return { ...state, tests: action.payload };

    case 'ADD_TEST':
      return { ...state, tests: [action.payload, ...state.tests] };

    case 'UPDATE_TEST': {
      const { testId, updates } = action.payload;
      return {
        ...state,
        tests: state.tests.map((t) => (t.id === testId ? { ...t, ...updates } : t)),
      };
    }

    case 'DELETE_TEST':
      return {
        ...state,
        tests: state.tests.filter((t) => t.id !== action.payload.testId),
      };

    case 'SET_REVISIONS':
      return { ...state, revisions: action.payload };

    case 'ADD_REVISION':
      return { ...state, revisions: [action.payload, ...state.revisions] };

    case 'UPDATE_REVISION': {
      const { revisionId, updates } = action.payload;
      return {
        ...state,
        revisions: state.revisions.map((r) =>
          r.id === revisionId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
        ),
      };
    }

    case 'ADVANCE_REVISION_CYCLE': {
      const { topicId, confidence, mistakesNotes } = action.payload;
      const today = getTodayDateString();
      const existingIndex = state.revisions.findIndex((r) => r.topicId === topicId);
      const nowIso = new Date().toISOString();

      if (existingIndex >= 0) {
        const rev = state.revisions[existingIndex];
        const nextCycle = rev.cycle + 1;
        const nextDate = calculateNextRevisionDate(today, nextCycle, confidence);
        const updatedRev: RevisionRecord = {
          ...rev,
          cycle: nextCycle,
          lastRevisedDate: today,
          nextTargetDate: nextDate,
          confidence,
          mistakesNotes: mistakesNotes !== undefined ? mistakesNotes : rev.mistakesNotes,
          updatedAt: nowIso,
        };
        const updatedList = [...state.revisions];
        updatedList[existingIndex] = updatedRev;
        return { ...state, revisions: updatedList };
      } else {
        const topic = state.topics.find((t) => t.id === topicId);
        if (!topic) return state;
        const nextDate = calculateNextRevisionDate(today, 1, confidence);
        const newRev: RevisionRecord = {
          id: generateId('rev'),
          topicId: topic.id,
          topicTitle: topic.title,
          chapterId: topic.chapterId,
          chapterName: topic.chapterName,
          subjectId: topic.subjectId,
          cycle: 1,
          lastRevisedDate: today,
          nextTargetDate: nextDate,
          confidence,
          mistakesNotes,
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        return { ...state, revisions: [newRev, ...state.revisions] };
      }
    }

    case 'DELETE_REVISION':
      return {
        ...state,
        revisions: state.revisions.filter((r) => r.id !== action.payload.revisionId),
      };

    case 'SET_LECTURES':
      return {
        ...state,
        lectures: action.payload,
      };

    case 'TOGGLE_LECTURE_WATCHED': {
      const { lectureId, watched } = action.payload;
      const nowIso = new Date().toISOString();
      return {
        ...state,
        lectures: state.lectures.map((lec) => {
          if (lec.id !== lectureId) return lec;
          const nextWatched = watched !== undefined ? watched : !lec.watched;
          return {
            ...lec,
            watched: nextWatched,
            watchedAt: nextWatched ? nowIso : undefined,
          };
        }),
      };
    }

    case 'SET_SCHEDULE':
      return {
        ...state,
        schedule: action.payload,
      };

    case 'TOGGLE_SCHEDULE_ENTRY': {
      const { entryId, completed } = action.payload;
      const entry = state.schedule.find((s) => s.id === entryId);
      if (!entry) return state;
      const nextCompleted = completed !== undefined ? completed : !entry.completed;
      const nowIso = new Date().toISOString();

      const updatedSchedule = state.schedule.map((s) =>
        s.id === entryId
          ? { ...s, completed: nextCompleted, completedAt: nextCompleted ? nowIso : undefined }
          : s
      );

      let updatedTopics = state.topics;
      if (entry.topicIds && entry.topicIds.length > 0) {
        const targetStatus: TopicStatus = nextCompleted ? 'completed' : 'pending';
        updatedTopics = state.topics.map((t) => {
          if (entry.topicIds!.includes(t.id)) {
            return {
              ...t,
              status: targetStatus,
              completedAt: nextCompleted ? (t.completedAt || nowIso) : undefined,
              startedAt: nextCompleted ? (t.startedAt || nowIso) : t.startedAt,
            };
          }
          return t;
        });
      }

      return {
        ...state,
        schedule: updatedSchedule,
        topics: updatedTopics,
      };
    }

    case 'ADD_SCHEDULE_ENTRY':
      return {
        ...state,
        schedule: [...state.schedule, action.payload],
      };

    case 'UPDATE_SCHEDULE_ENTRY': {
      const { entryId, updates } = action.payload;
      return {
        ...state,
        schedule: state.schedule.map((s) =>
          s.id === entryId ? { ...s, ...updates } : s
        ),
      };
    }

    case 'DELETE_SCHEDULE_ENTRY':
      return {
        ...state,
        schedule: state.schedule.filter((s) => s.id !== action.payload.entryId),
      };

    case 'UPDATE_SETTINGS': {
      const mergedSettings = { ...state.settings, ...action.payload };
      return {
        ...state,
        settings: mergedSettings,
      };
    }

    case 'RESET_SYLLABUS': {
      const { defaultTopics, options } = action.payload;
      let finalTopics = [...defaultTopics];
      if (options?.preserveCustomTopics) {
        const customTopics = state.topics.filter((t) => t.isCustom);
        finalTopics = [...finalTopics, ...customTopics];
      }

      const shouldPreserveSettings = options?.preserveSettings !== false;
      const finalSettings = shouldPreserveSettings ? state.settings : DEFAULT_CA_SETTINGS;

      saveCachedTopics(finalTopics);

      return {
        ...state,
        topics: finalTopics,
        revisions: options?.preserveRevisions ? state.revisions : [],
        tests: options?.preserveTests ? state.tests : [],
        schedule: options?.preserveSchedule ? state.schedule : seedSchedule,
        settings: finalSettings,
      };
    }

    case 'IMPORT_DATA': {
      const { data, mode } = action.payload;
      if (mode === 'overwrite') {
        const nextTopics = data.topics || state.topics;
        saveCachedTopics(nextTopics);
        return {
          ...state,
          topics: nextTopics,
          revisions: data.revisions || [],
          tests: data.tests || [],
          settings: data.settings ? { ...state.settings, ...data.settings } : state.settings,
        };
      } else if (mode === 'merge') {
        const topicMap = new Map<string, Topic>();
        state.topics.forEach((t) => topicMap.set(t.id, t));
        (data.topics || []).forEach((t) => topicMap.set(t.id, { ...topicMap.get(t.id), ...t }));

        const revMap = new Map<string, RevisionRecord>();
        state.revisions.forEach((r) => revMap.set(r.id, r));
        (data.revisions || []).forEach((r) => revMap.set(r.id, { ...revMap.get(r.id), ...r }));

        const testMap = new Map<string, TestRecord>();
        state.tests.forEach((t) => testMap.set(t.id, t));
        (data.tests || []).forEach((t) => testMap.set(t.id, { ...testMap.get(t.id), ...t }));

        const mergedTopics = Array.from(topicMap.values());
        saveCachedTopics(mergedTopics);

        return {
          ...state,
          topics: mergedTopics,
          revisions: Array.from(revMap.values()),
          tests: Array.from(testMap.values()),
          settings: data.settings ? { ...state.settings, ...data.settings } : state.settings,
        };
      } else {
        const existingTopicIds = new Set(state.topics.map((t) => t.id));
        const newTopics = (data.topics || []).filter((t) => !existingTopicIds.has(t.id));

        const existingRevIds = new Set(state.revisions.map((r) => r.id));
        const newRevs = (data.revisions || []).filter((r) => !existingRevIds.has(r.id));

        const existingTestIds = new Set(state.tests.map((t) => t.id));
        const newTests = (data.tests || []).filter((t) => !existingTestIds.has(t.id));

        const appendedTopics = [...state.topics, ...newTopics];
        saveCachedTopics(appendedTopics);

        return {
          ...state,
          topics: appendedTopics,
          revisions: [...state.revisions, ...newRevs],
          tests: [...state.tests, ...newTests],
        };
      }
    }

    case 'SET_SYNCING':
      return { ...state, isSyncing: action.payload };

    case 'SET_CLOUD_CONNECTED':
      return { ...state, isCloudConnected: action.payload };

    case 'SET_LAST_SYNCED':
      return { ...state, lastSyncedAt: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

const CATrackerContext = createContext<DataContextValue | undefined>(undefined);

export const CATrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const currentUserId = user?.uid || (isTestEnv ? DEFAULT_USER_ID : null);
  const currentUserIdRef = useRef<string | null>(currentUserId);
  currentUserIdRef.current = currentUserId;

  const [state, dispatch] = useReducer(dataReducer, undefined, getInitialState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const initialCloudSyncAttempted = useRef(false);
  const initialLecturesSyncAttempted = useRef(false);
  const initialScheduleSyncAttempted = useRef(false);

  // Synchronize state slices to localStorage whenever state changes
  useEffect(() => {
    saveCachedTopics(state.topics);
  }, [state.topics]);

  useEffect(() => {
    saveCachedLectures(state.lectures);
  }, [state.lectures]);

  useEffect(() => {
    saveCachedSchedule(state.schedule);
  }, [state.schedule]);

  useEffect(() => {
    saveCachedRevisions(state.revisions);
  }, [state.revisions]);

  useEffect(() => {
    saveCachedTests(state.tests);
  }, [state.tests]);

  useEffect(() => {
    saveCachedSettings(state.settings);
  }, [state.settings]);

  // One-time Cloud Sync: flushes dirty/pending local changes and fetches fresh data.
  // NEVER uses continuous snapshot listeners; runs strictly on-demand.
  const syncWithCloud = useCallback(async (force = false): Promise<void> => {
    const uid = currentUserIdRef.current;
    if (!uid) {
      dispatch({ type: 'SET_CLOUD_CONNECTED', payload: false });
      return;
    }

    dispatch({ type: 'SET_SYNCING', payload: true });
    try {
      // 1. Flush any pending/dirty local changes to Firestore in a single batch
      const pending = loadPendingSync();
      await flushPendingCAChangesToFirestore(uid, pending);
      savePendingSync({});

      // 2. Perform an atomic one-time read of all CA collections (NO onSnapshot)
      const cloud = await fetchAllCAUserDataFromFirestore(uid);

      // 3. Merge cloud records into state while preserving custom items
      const localTopics = stateRef.current.topics;
      const cloudTopicsMap = new Map(cloud.topics.map((t) => [t.id, t]));

      let mergedTopics: Topic[];
      if (cloud.topics.length > 0) {
        mergedTopics = seed.topics.map((seedTop) => {
          const cloudTop = cloudTopicsMap.get(seedTop.id);
          const localTop = localTopics.find((t) => t.id === seedTop.id);
          if (cloudTop) {
            return {
              ...seedTop,
              status: cloudTop.status || localTop?.status || 'pending',
              startedAt: cloudTop.startedAt || localTop?.startedAt,
              completedAt: cloudTop.completedAt || localTop?.completedAt,
              targetDate: cloudTop.targetDate || localTop?.targetDate || seedTop.targetDate,
              notes: cloudTop.notes !== undefined ? cloudTop.notes : (localTop?.notes !== undefined ? localTop.notes : seedTop.notes),
              order: seedTop.order,
            };
          }
          return localTop || seedTop;
        });

        cloud.topics.forEach((t) => {
          if (t.isCustom && !mergedTopics.some((m) => m.id === t.id)) {
            mergedTopics.push(t);
          }
        });
      } else {
        mergedTopics = localTopics.length > 0 ? localTopics : seed.topics;
      }

      const mergedLectures = cloud.lectures.length > 0
        ? cloud.lectures
        : (stateRef.current.lectures.length > 0 ? stateRef.current.lectures : seedLectures);

      const mergedSchedule = cloud.schedule.length > 0
        ? cloud.schedule
        : (stateRef.current.schedule.length > 0 ? stateRef.current.schedule : seedSchedule);

      const mergedRevisions = cloud.revisions.length > 0 ? cloud.revisions : stateRef.current.revisions;
      const mergedTests = cloud.tests.length > 0 ? cloud.tests : stateRef.current.tests;
      const mergedSettings = cloud.settings
        ? resolveSettingsConflict(stateRef.current.settings, cloud.settings)
        : stateRef.current.settings;

      const nowIso = new Date().toISOString();
      const updatedSettings = { ...mergedSettings, lastSyncedAt: nowIso };

      dispatch({
        type: 'INITIALIZE_STATE',
        payload: {
          topics: mergedTopics,
          lectures: mergedLectures,
          schedule: mergedSchedule,
          revisions: mergedRevisions,
          tests: mergedTests,
          settings: updatedSettings,
        },
      });

      saveCachedTopics(mergedTopics);
      saveCachedLectures(mergedLectures);
      saveCachedSchedule(mergedSchedule);
      saveCachedRevisions(mergedRevisions);
      saveCachedTests(mergedTests);
      saveCachedSettings(updatedSettings);

      dispatch({ type: 'SET_CLOUD_CONNECTED', payload: true });
      dispatch({ type: 'SET_LAST_SYNCED', payload: nowIso });
    } catch (err) {
      console.warn('[CATrackerContext] Cloud sync notice:', err);
      dispatch({ type: 'SET_CLOUD_CONNECTED', payload: false });
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false });
    }
  }, []);

  // ONLY execute cloud operations if this is a hard reload / browser refresh,
  // or if the local cache has never been initialized. Zero continuous traffic.
  useEffect(() => {
    if (!currentUserId) {
      dispatch({ type: 'SET_CLOUD_CONNECTED', payload: false });
      return;
    }

    const isReload = isHardReloadOrRefresh();
    let isCacheEmpty = false;
    try {
      isCacheEmpty = typeof window !== 'undefined' && !localStorage.getItem(CA_STORAGE_KEYS.TOPICS);
    } catch {
      isCacheEmpty = false;
    }

    if (isReload || isCacheEmpty) {
      syncWithCloud(true);
    }
  }, [currentUserId, syncWithCloud]);

  // Computed values
  const metrics = useMemo(() => {
    return calculateDashboardMetrics(
      state.topics,
      state.tests,
      state.revisions,
      state.settings,
      state.schedule
    );
  }, [state.topics, state.tests, state.revisions, state.settings, state.schedule]);

  const actionPlan = useMemo(() => {
    return generateActionPlan(
      state.topics,
      state.revisions,
      state.tests,
      state.schedule
    );
  }, [state.topics, state.revisions, state.tests, state.schedule]);

  const subjectGroups = useMemo(() => {
    return buildSubjectGroups(state.topics, state.chapters, state.subjects);
  }, [state.topics, state.chapters, state.subjects]);

  const setTopics = (topics: Topic[]) => {
    dispatch({ type: 'SET_TOPICS', payload: topics });
  };

  const updateTopicStatus = (topicId: string, status: TopicStatus, customDate?: string) => {
    let nowIso = new Date().toISOString();
    if (customDate) {
      try {
        const parsed = new Date(customDate);
        if (!isNaN(parsed.getTime())) {
          nowIso = parsed.toISOString();
        }
      } catch {
        nowIso = new Date().toISOString();
      }
    }

    const currentTopic = state.topics.find((t) => t.id === topicId);
    if (currentTopic) {
      const updated: Topic = { ...currentTopic, status };
      if (status === 'in_progress') {
        if (!updated.startedAt) updated.startedAt = nowIso;
      } else if (status === 'completed') {
        if (!updated.startedAt) updated.startedAt = nowIso;
        if (!updated.completedAt) updated.completedAt = nowIso;
      } else if (status === 'pending') {
        updated.completedAt = undefined;
      }

      recordPendingSync({ topics: { [updated.id]: updated } });

      if (status === 'completed' && state.settings.autoScheduleRevisions) {
        const existingRev = state.revisions.find((r) => r.topicId === topicId);
        if (!existingRev) {
          const today = getTodayDateString();
          const nextDate = calculateNextRevisionDate(today, 1, 'low');
          const newRev: RevisionRecord = {
            id: generateId('rev'),
            topicId: updated.id,
            topicTitle: updated.title,
            chapterId: updated.chapterId,
            chapterName: updated.chapterName,
            subjectId: updated.subjectId,
            cycle: 1,
            lastRevisedDate: today,
            nextTargetDate: nextDate,
            confidence: 'medium',
            createdAt: nowIso,
            updatedAt: nowIso,
          };
          recordPendingSync({ revisions: { [newRev.id]: newRev } });
        }
      }
    }

    dispatch({ type: 'UPDATE_TOPIC_STATUS', payload: { topicId, status, customDate } });
  };

  const batchUpdateTopicStatus = async (
    topicIds: string[],
    status: TopicStatus,
    customDate?: string
  ) => {
    let nowIso = new Date().toISOString();
    if (customDate) {
      try {
        const parsed = new Date(customDate);
        if (!isNaN(parsed.getTime())) {
          nowIso = parsed.toISOString();
        }
      } catch {
        nowIso = new Date().toISOString();
      }
    }

    const topicIdSet = new Set(topicIds);
    const updatedTopicsMap: Record<string, Topic> = {};
    const newRevsMap: Record<string, RevisionRecord> = {};

    for (const topic of stateRef.current.topics) {
      if (topicIdSet.has(topic.id)) {
        const updated: Topic = { ...topic, status };
        if (status === 'in_progress') {
          if (!updated.startedAt) updated.startedAt = nowIso;
        } else if (status === 'completed') {
          if (!updated.startedAt) updated.startedAt = nowIso;
          if (!updated.completedAt) updated.completedAt = nowIso;
        } else if (status === 'pending') {
          updated.completedAt = undefined;
        }
        updatedTopicsMap[updated.id] = updated;

        if (status === 'completed' && stateRef.current.settings.autoScheduleRevisions) {
          const existingRev = stateRef.current.revisions.find((r) => r.topicId === topic.id);
          if (!existingRev) {
            const today = getTodayDateString();
            const nextDate = calculateNextRevisionDate(today, 1, 'low');
            const newRev: RevisionRecord = {
              id: generateId('rev'),
              topicId: updated.id,
              topicTitle: updated.title,
              chapterId: updated.chapterId,
              chapterName: updated.chapterName,
              subjectId: updated.subjectId,
              cycle: 1,
              lastRevisedDate: today,
              nextTargetDate: nextDate,
              confidence: 'medium',
              createdAt: nowIso,
              updatedAt: nowIso,
            };
            newRevsMap[newRev.id] = newRev;
          }
        }
      }
    }

    recordPendingSync({ topics: updatedTopicsMap, revisions: newRevsMap });

    dispatch({
      type: 'BATCH_UPDATE_TOPIC_STATUS',
      payload: { topicIds, status, customDate },
    });
  };

  const updateTopic = (topicId: string, updates: Partial<Topic>) => {
    const currentTopic = state.topics.find((t) => t.id === topicId);
    if (currentTopic) {
      const updated = { ...currentTopic, ...updates };
      recordPendingSync({ topics: { [updated.id]: updated } });
    }
    dispatch({ type: 'UPDATE_TOPIC', payload: { topicId, updates } });
  };

  const addTopic = (topicData: Omit<Topic, 'id' | 'order'> & { id?: string }) => {
    const id = topicData.id || generateId('topic-custom');
    const order = state.topics.length + 1;
    const estMinutes = topicData.estimatedMinutes || (topicData.estimatedHours ? topicData.estimatedHours * 60 : 60);
    const estHours = topicData.estimatedHours || Number((estMinutes / 60).toFixed(1));

    const newTopic: Topic = {
      ...topicData,
      id,
      order,
      estimatedMinutes: estMinutes,
      estimatedHours: estHours,
      isCustom: true,
    };
    recordPendingSync({ topics: { [newTopic.id]: newTopic } });
    dispatch({ type: 'ADD_TOPIC', payload: newTopic });
  };

  const deleteTopic = (topicId: string) => {
    const linkedRev = state.revisions.find((r) => r.topicId === topicId);
    recordPendingSync({
      deletedTopicIds: [topicId],
      deletedRevisionIds: linkedRev ? [linkedRev.id] : undefined,
    });
    dispatch({ type: 'DELETE_TOPIC', payload: { topicId } });
  };

  const addTest = (testData: Omit<TestRecord, 'id' | 'percentage' | 'isPassed' | 'createdAt'>) => {
    const totalMarks = (testData.totalMarks && testData.totalMarks > 0) ? testData.totalMarks : 0;
    const marksObtained = (testData.marksObtained && testData.marksObtained >= 0) ? testData.marksObtained : 0;
    const percentage = totalMarks > 0 ? Number(((marksObtained / totalMarks) * 100).toFixed(1)) : 0;
    const isPassed = totalMarks > 0 && percentage >= 40.0;
    const newTest: TestRecord = {
      ...testData,
      totalMarks,
      marksObtained,
      id: generateId('test'),
      percentage,
      isPassed,
      createdAt: new Date().toISOString(),
    };
    recordPendingSync({ tests: { [newTest.id]: newTest } });
    dispatch({ type: 'ADD_TEST', payload: newTest });
  };

  const updateTest = (testId: string, updates: Partial<TestRecord>) => {
    let enrichedUpdates = { ...updates };
    const existing = state.tests.find((t) => t.id === testId);
    if (existing) {
      if (updates.marksObtained !== undefined || updates.totalMarks !== undefined) {
        const rawMarks = updates.marksObtained !== undefined ? updates.marksObtained : existing.marksObtained;
        const rawTotal = updates.totalMarks !== undefined ? updates.totalMarks : existing.totalMarks;
        const totalMarks = (rawTotal && rawTotal > 0) ? rawTotal : 0;
        const marksObtained = (rawMarks && rawMarks >= 0) ? rawMarks : 0;
        const percentage = totalMarks > 0 ? Number(((marksObtained / totalMarks) * 100).toFixed(1)) : 0;
        enrichedUpdates = {
          ...enrichedUpdates,
          totalMarks,
          marksObtained,
          percentage,
          isPassed: totalMarks > 0 && percentage >= 40.0,
        };
      }
      recordPendingSync({ tests: { [testId]: { ...existing, ...enrichedUpdates } } });
    }
    dispatch({ type: 'UPDATE_TEST', payload: { testId, updates: enrichedUpdates } });
  };

  const deleteTest = (testId: string) => {
    recordPendingSync({ deletedTestIds: [testId] });
    dispatch({ type: 'DELETE_TEST', payload: { testId } });
  };

  const addRevision = (revisionData: Omit<RevisionRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const nowIso = new Date().toISOString();
    const newRev: RevisionRecord = {
      ...revisionData,
      id: generateId('rev'),
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    recordPendingSync({ revisions: { [newRev.id]: newRev } });
    dispatch({ type: 'ADD_REVISION', payload: newRev });
  };

  const updateRevision = (revisionId: string, updates: Partial<RevisionRecord>) => {
    const existing = state.revisions.find((r) => r.id === revisionId);
    if (existing) {
      recordPendingSync({
        revisions: { [revisionId]: { ...existing, ...updates, updatedAt: new Date().toISOString() } },
      });
    }
    dispatch({ type: 'UPDATE_REVISION', payload: { revisionId, updates } });
  };

  const advanceRevisionCycle = (topicId: string, confidence: ConfidenceLevel, mistakesNotes?: string) => {
    const today = getTodayDateString();
    const existingIndex = state.revisions.findIndex((r) => r.topicId === topicId);
    const nowIso = new Date().toISOString();

    if (existingIndex >= 0) {
      const rev = state.revisions[existingIndex];
      const nextCycle = rev.cycle + 1;
      const nextDate = calculateNextRevisionDate(today, nextCycle, confidence);
      const updatedRev: RevisionRecord = {
        ...rev,
        cycle: nextCycle,
        lastRevisedDate: today,
        nextTargetDate: nextDate,
        confidence,
        mistakesNotes: mistakesNotes !== undefined ? mistakesNotes : rev.mistakesNotes,
        updatedAt: nowIso,
      };
      recordPendingSync({ revisions: { [updatedRev.id]: updatedRev } });
    } else {
      const topic = state.topics.find((t) => t.id === topicId);
      if (topic) {
        const nextDate = calculateNextRevisionDate(today, 1, confidence);
        const newRev: RevisionRecord = {
          id: generateId('rev'),
          topicId: topic.id,
          topicTitle: topic.title,
          chapterId: topic.chapterId,
          chapterName: topic.chapterName,
          subjectId: topic.subjectId,
          cycle: 1,
          lastRevisedDate: today,
          nextTargetDate: nextDate,
          confidence,
          mistakesNotes,
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        recordPendingSync({ revisions: { [newRev.id]: newRev } });
      }
    }

    dispatch({ type: 'ADVANCE_REVISION_CYCLE', payload: { topicId, confidence, mistakesNotes } });
  };

  const deleteRevision = (revisionId: string) => {
    recordPendingSync({ deletedRevisionIds: [revisionId] });
    dispatch({ type: 'DELETE_REVISION', payload: { revisionId } });
  };

  const updateSettings = async (updates: Partial<CAUserSettings>) => {
    const nowIso = new Date().toISOString();
    const newSettings: CAUserSettings = {
      ...stateRef.current.settings,
      ...updates,
      lastSyncedAt: nowIso,
    };
    saveCachedSettings(newSettings);
    recordPendingSync({ settings: newSettings });
    dispatch({ type: 'UPDATE_SETTINGS', payload: { ...updates, lastSyncedAt: nowIso } });
  };

  const resetToDefaultSyllabus = (options?: ResetSyllabusOptions) => {
    const freshSeed = loadSeedSyllabus();
    let finalTopics = [...freshSeed.topics];
    if (options?.preserveCustomTopics) {
      const customTopics = state.topics.filter((t) => t.isCustom);
      finalTopics = [...finalTopics, ...customTopics];
    }

    const shouldPreserveSettings = options?.preserveSettings !== false;
    const finalSettings = shouldPreserveSettings ? state.settings : DEFAULT_CA_SETTINGS;

    dispatch({
      type: 'RESET_SYLLABUS',
      payload: { defaultTopics: freshSeed.topics, options },
    });

    saveCachedTopics(finalTopics);
    saveCachedSettings(finalSettings);
    const topicsMap: Record<string, Topic> = {};
    finalTopics.forEach((t) => {
      topicsMap[t.id] = t;
    });
    recordPendingSync({ topics: topicsMap, settings: finalSettings });
  };

  const importData = async (data: ImportExportPayload, mode: ImportConflictResolution = 'merge') => {
    dispatch({ type: 'IMPORT_DATA', payload: { data, mode } });
    if (data.topics) {
      const topicsMap: Record<string, Topic> = {};
      data.topics.forEach((t) => {
        topicsMap[t.id] = t;
      });
      recordPendingSync({ topics: topicsMap, settings: data.settings });
    }
  };

  const toggleLectureWatched = async (lectureId: string, watched?: boolean) => {
    const lecture = state.lectures.find((l) => l.id === lectureId);
    if (!lecture) return;
    const nextWatched = watched !== undefined ? watched : !lecture.watched;
    const nowIso = new Date().toISOString();
    const updatedLecture: Lecture = {
      ...lecture,
      watched: nextWatched,
      watchedAt: nextWatched ? nowIso : undefined,
    };
    recordPendingSync({ lectures: { [updatedLecture.id]: updatedLecture } });
    dispatch({ type: 'TOGGLE_LECTURE_WATCHED', payload: { lectureId, watched: nextWatched } });
  };

  const setSchedule = (entries: ScheduleEntry[]) => {
    dispatch({ type: 'SET_SCHEDULE', payload: entries });
  };

  const toggleScheduleEntry = async (entryId: string, completed?: boolean) => {
    const entry = state.schedule.find((s) => s.id === entryId);
    if (!entry) return;
    const nextCompleted = completed !== undefined ? completed : !entry.completed;
    const nowIso = new Date().toISOString();

    const updatedEntry: ScheduleEntry = {
      ...entry,
      completed: nextCompleted,
      completedAt: nextCompleted ? nowIso : undefined,
    };

    recordPendingSync({ schedule: { [updatedEntry.id]: updatedEntry } });
    dispatch({ type: 'TOGGLE_SCHEDULE_ENTRY', payload: { entryId, completed: nextCompleted } });
  };

  const addScheduleEntry = async (entryData: Omit<ScheduleEntry, 'id' | 'order'> & { id?: string }) => {
    const id = entryData.id || generateId('sch');
    const order = stateRef.current.schedule.length + 1;
    const newEntry: ScheduleEntry = {
      ...entryData,
      id,
      order,
    };
    recordPendingSync({ schedule: { [newEntry.id]: newEntry } });
    dispatch({ type: 'ADD_SCHEDULE_ENTRY', payload: newEntry });
  };

  const updateScheduleEntry = async (entryId: string, updates: Partial<ScheduleEntry>) => {
    const existing = stateRef.current.schedule.find((s) => s.id === entryId);
    if (existing) {
      const updated = { ...existing, ...updates };
      recordPendingSync({ schedule: { [updated.id]: updated } });
    }
    dispatch({ type: 'UPDATE_SCHEDULE_ENTRY', payload: { entryId, updates } });
  };

  const deleteScheduleEntry = async (entryId: string) => {
    recordPendingSync({ deletedScheduleIds: [entryId] });
    dispatch({ type: 'DELETE_SCHEDULE_ENTRY', payload: { entryId } });
  };

  const exportData = (format: 'json' | 'csv' = 'json'): string => {
    if (format === 'json') {
      const payload: ImportExportPayload = {
        version: '1.0',
        appVersion: '1.0.0',
        exportedAt: new Date().toISOString(),
        settings: state.settings,
        topics: state.topics,
        revisions: state.revisions,
        tests: state.tests,
        lectures: state.lectures,
        schedule: state.schedule,
        metadata: {
          totalTopics: state.topics.length,
          completedTopics: state.topics.filter((t) => t.status === 'completed').length,
          totalTests: state.tests.length,
          totalRevisions: state.revisions.length,
          totalLectures: state.lectures.length,
          totalScheduleEntries: state.schedule.length,
        },
      };
      return JSON.stringify(payload, null, 2);
    } else {
      const headers = ['TopicID', 'SubjectID', 'ChapterName', 'Title', 'Status', 'EstimatedHours', 'TargetDate', 'StartedAt', 'CompletedAt'];
      const rows = state.topics.map((t) => [
        `"${t.id}"`,
        `"${t.subjectId}"`,
        `"${(t.chapterName || '').replace(/"/g, '""')}"`,
        `"${(t.title || '').replace(/"/g, '""')}"`,
        `"${t.status}"`,
        `"${t.estimatedHours}"`,
        `"${t.targetDate || ''}"`,
        `"${t.startedAt || ''}"`,
        `"${t.completedAt || ''}"`,
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }
  };

  const value: DataContextValue = {
    topics: state.topics,
    revisions: state.revisions,
    tests: state.tests,
    lectures: state.lectures,
    schedule: state.schedule,
    settings: state.settings,
    subjects: state.subjects,
    chapters: state.chapters,
    metrics,
    actionPlan,
    subjectGroups,
    isLoading: state.isLoading,
    isSyncing: state.isSyncing,
    isCloudConnected: state.isCloudConnected,
    lastSyncedAt: state.lastSyncedAt,
    error: state.error,
    syncWithCloud,
    setTopics,
    updateTopicStatus,
    batchUpdateTopicStatus,
    updateTopic,
    addTopic,
    deleteTopic,
    addTest,
    updateTest,
    deleteTest,
    addRevision,
    updateRevision,
    advanceRevisionCycle,
    deleteRevision,
    toggleLectureWatched,
    setSchedule,
    toggleScheduleEntry,
    addScheduleEntry,
    updateScheduleEntry,
    deleteScheduleEntry,
    updateSettings,
    resetToDefaultSyllabus,
    importData,
    exportData,
  };

  return <CATrackerContext.Provider value={value}>{children}</CATrackerContext.Provider>;
};

export function useCATracker(): DataContextValue {
  const context = useContext(CATrackerContext);
  if (!context) {
    throw new Error('useCATracker must be used within a CATrackerProvider');
  }
  return context;
}

// Alias for seamless reuse
export const useData = useCATracker;
