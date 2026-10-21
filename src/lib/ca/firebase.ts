import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Topic, RevisionRecord, TestRecord, CAUserSettings, Lecture, ScheduleEntry } from '@/types/ca';

export const isTestEnv =
  (typeof process !== 'undefined' && (process.env?.NODE_ENV === 'test' || Boolean(process.env?.VITEST))) ||
  (typeof window !== 'undefined' && Boolean((window as unknown as { __VITEST__?: boolean }).__VITEST__));

export const DEFAULT_USER_ID = 'yApeiNzo23bPTvpEXHgNIgiTX0y1';

/**
 * Strips undefined properties so Firestore writes never fail on optional attributes
 */
export function sanitizeForFirestore<T>(data: T): Record<string, unknown> {
  return JSON.parse(JSON.stringify(data));
}

/**
 * User-scoped Firestore Collection & Document Helpers
 */
export const getUserTopicsCollection = (userId: string = DEFAULT_USER_ID) =>
  collection(db, 'users', userId, 'caTopics');

export const getUserCATopicsCollection = (userId: string = DEFAULT_USER_ID) =>
  collection(db, 'users', userId, 'caTopics');

export const getUserTestsCollection = (userId: string = DEFAULT_USER_ID) =>
  collection(db, 'users', userId, 'tests');

export const getUserRevisionsCollection = (userId: string = DEFAULT_USER_ID) =>
  collection(db, 'users', userId, 'revisions');

export const getUserLecturesCollection = (userId: string = DEFAULT_USER_ID) =>
  collection(db, 'users', userId, 'lectures');

export const getUserScheduleCollection = (userId: string = DEFAULT_USER_ID) =>
  collection(db, 'users', userId, 'schedule');

export const getUserSettingsDoc = (userId: string = DEFAULT_USER_ID) =>
  doc(db, 'users', userId, 'settings', 'user_settings');

/**
 * Detects whether the current navigation event is a page refresh or hard reload.
 */
export function isHardReloadOrRefresh(): boolean {
  if (typeof window === 'undefined' || !window.performance) return false;
  try {
    const navEntries = window.performance.getEntriesByType('navigation');
    if (navEntries && navEntries.length > 0) {
      const nav = navEntries[0] as PerformanceNavigationTiming;
      return nav.type === 'reload';
    }
    return (window.performance as any).navigation?.type === 1;
  } catch {
    return false;
  }
}

export async function saveTopicToFirestore(
  topic: Topic,
  userId: string = DEFAULT_USER_ID
): Promise<void> {
  try {
    const topicRef = doc(db, 'users', userId, 'caTopics', topic.id);
    await setDoc(topicRef, sanitizeForFirestore(topic), { merge: true });
  } catch (err) {
    console.warn(`[Firestore Sync] Failed to save topic ${topic.id}:`, err);
  }
}

export async function deleteTopicFromFirestore(
  topicId: string,
  userId: string = DEFAULT_USER_ID
): Promise<void> {
  try {
    const topicRef = doc(db, 'users', userId, 'caTopics', topicId);
    await deleteDoc(topicRef);
  } catch (err) {
    console.warn(`[Firestore Sync] Failed to delete topic ${topicId}:`, err);
  }
}

export async function saveTestToFirestore(
  test: TestRecord,
  userId: string = DEFAULT_USER_ID
): Promise<void> {
  try {
    const testRef = doc(db, 'users', userId, 'tests', test.id);
    await setDoc(testRef, sanitizeForFirestore(test), { merge: true });
  } catch (err) {
    console.warn(`[Firestore Sync] Failed to save test ${test.id}:`, err);
  }
}

export async function deleteTestFromFirestore(
  testId: string,
  userId: string = DEFAULT_USER_ID
): Promise<void> {
  try {
    const testRef = doc(db, 'users', userId, 'tests', testId);
    await deleteDoc(testRef);
  } catch (err) {
    console.warn(`[Firestore Sync] Failed to delete test ${testId}:`, err);
  }
}

export async function saveRevisionToFirestore(
  revision: RevisionRecord,
  userId: string = DEFAULT_USER_ID
): Promise<void> {
  try {
    const revRef = doc(db, 'users', userId, 'revisions', revision.id);
    await setDoc(revRef, sanitizeForFirestore(revision), { merge: true });
  } catch (err) {
    console.warn(`[Firestore Sync] Failed to save revision ${revision.id}:`, err);
  }
}

export async function deleteRevisionFromFirestore(
  revisionId: string,
  userId: string = DEFAULT_USER_ID
): Promise<void> {
  try {
    const revRef = doc(db, 'users', userId, 'revisions', revisionId);
    await deleteDoc(revRef);
  } catch (err) {
    console.warn(`[Firestore Sync] Failed to delete revision ${revisionId}:`, err);
  }
}

export async function saveSettingsToFirestore(
  settings: CAUserSettings,
  userId: string = DEFAULT_USER_ID
): Promise<void> {
  try {
    const settingsRef = getUserSettingsDoc(userId);
    await setDoc(settingsRef, sanitizeForFirestore(settings), { merge: true });
  } catch (err) {
    console.warn(`[Firestore Sync] Failed to save settings:`, err);
  }
}

export async function fetchUserSettingsFromFirestore(
  userId: string = DEFAULT_USER_ID
): Promise<CAUserSettings | null> {
  try {
    const settingsRef = getUserSettingsDoc(userId);
    const snap = await getDoc(settingsRef);
    if (snap.exists()) {
      return snap.data() as CAUserSettings;
    }
    return null;
  } catch (err) {
    console.warn('[Firestore Sync] Failed to fetch settings from Firestore:', err);
    return null;
  }
}

export async function syncSettingsWithCloud(
  localSettings: CAUserSettings,
  userId: string = DEFAULT_USER_ID
): Promise<CAUserSettings> {
  try {
    const settingsRef = getUserSettingsDoc(userId);
    const snap = await getDoc(settingsRef);
    if (snap.exists()) {
      const cloudData = snap.data() as CAUserSettings;
      const localTime = localSettings.lastSyncedAt ? new Date(localSettings.lastSyncedAt).getTime() : 0;
      const cloudTime = cloudData.lastSyncedAt ? new Date(cloudData.lastSyncedAt).getTime() : 0;

      let resolvedExamDate = (cloudData.examDate && cloudData.examDate.trim()) || localSettings.examDate;
      if (localTime > cloudTime) {
        resolvedExamDate = localSettings.examDate;
      }

      const merged: CAUserSettings = {
        ...localSettings,
        ...cloudData,
        examDate: resolvedExamDate,
      };

      if (localTime > cloudTime) {
        await setDoc(settingsRef, sanitizeForFirestore(merged), { merge: true });
      }

      return merged;
    } else {
      await setDoc(settingsRef, sanitizeForFirestore(localSettings), { merge: true });
      return localSettings;
    }
  } catch (err) {
    console.warn('[Firestore Sync] Failed to sync settings with cloud:', err);
    return localSettings;
  }
}

export async function saveLectureToFirestore(
  lecture: Lecture,
  userId: string = DEFAULT_USER_ID
): Promise<void> {
  try {
    const lecRef = doc(db, 'users', userId, 'lectures', lecture.id);
    await setDoc(lecRef, sanitizeForFirestore(lecture), { merge: true });
  } catch (err) {
    console.warn(`[Firestore Sync] Failed to save lecture ${lecture.id}:`, err);
  }
}

export async function syncLecturesWithCloud(
  seedLectures: Lecture[],
  userId: string = DEFAULT_USER_ID
): Promise<Lecture[]> {
  try {
    const lecCol = getUserLecturesCollection(userId);
    const existingSnap = await getDocs(lecCol);
    const existingMap = new Map<string, Lecture>();

    existingSnap.forEach((docSnap) => {
      existingMap.set(docSnap.id, docSnap.data() as Lecture);
    });

    const mergedLectures: Lecture[] = seedLectures.map((seedLec) => {
      const existing = existingMap.get(seedLec.id);
      if (existing) {
        return {
          ...seedLec,
          watched: existing.watched ?? false,
          watchedAt: existing.watchedAt,
          notes: existing.notes !== undefined ? existing.notes : seedLec.notes,
        };
      }
      return seedLec;
    });

    // Write batch to Firestore
    const batch = writeBatch(db);
    mergedLectures.forEach((lec) => {
      batch.set(doc(db, 'users', userId, 'lectures', lec.id), sanitizeForFirestore(lec), { merge: true });
    });
    await batch.commit();

    return mergedLectures;
  } catch (err) {
    console.warn('[Firestore Sync] syncLecturesWithCloud error:', err);
    return seedLectures;
  }
}

export async function saveScheduleEntryToFirestore(
  entry: ScheduleEntry,
  userId: string = DEFAULT_USER_ID
): Promise<void> {
  try {
    const entryRef = doc(db, 'users', userId, 'schedule', entry.id);
    await setDoc(entryRef, sanitizeForFirestore(entry), { merge: true });
  } catch (err) {
    console.warn(`[Firestore Sync] Failed to save schedule entry ${entry.id}:`, err);
  }
}

export async function deleteScheduleEntryFromFirestore(
  entryId: string,
  userId: string = DEFAULT_USER_ID
): Promise<void> {
  try {
    const entryRef = doc(db, 'users', userId, 'schedule', entryId);
    await deleteDoc(entryRef);
  } catch (err) {
    console.warn(`[Firestore Sync] Failed to delete schedule entry ${entryId}:`, err);
  }
}

export async function syncScheduleWithCloud(
  seedSchedule: ScheduleEntry[],
  userId: string = DEFAULT_USER_ID
): Promise<ScheduleEntry[]> {
  try {
    const schedCol = getUserScheduleCollection(userId);
    const existingSnap = await getDocs(schedCol);
    const existingMap = new Map<string, ScheduleEntry>();

    existingSnap.forEach((docSnap) => {
      existingMap.set(docSnap.id, docSnap.data() as ScheduleEntry);
    });

    const mergedSchedule: ScheduleEntry[] = seedSchedule.map((seedEntry) => {
      const existing = existingMap.get(seedEntry.id);
      if (existing) {
        return {
          ...seedEntry,
          completed: existing.completed ?? false,
          completedAt: existing.completedAt,
          notes: existing.notes !== undefined ? existing.notes : seedEntry.notes,
        };
      }
      return seedEntry;
    });

    existingMap.forEach((entry, id) => {
      if (!mergedSchedule.some((s) => s.id === id)) {
        mergedSchedule.push(entry);
      }
    });

    mergedSchedule.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.order || 0) - (b.order || 0);
    });

    const batch = writeBatch(db);
    mergedSchedule.forEach((entry) => {
      batch.set(doc(db, 'users', userId, 'schedule', entry.id), sanitizeForFirestore(entry), { merge: true });
    });
    await batch.commit();

    return mergedSchedule;
  } catch (err) {
    console.warn('[Firestore Sync] syncScheduleWithCloud error:', err);
    return seedSchedule;
  }
}

export async function syncAndFillSyllabusWithCloud(
  blueprintTopics: Topic[],
  userId: string = DEFAULT_USER_ID
): Promise<{ totalMerged: number; customPreserved: number }> {
  try {
    const topicsCol = getUserTopicsCollection(userId);
    const existingSnap = await getDocs(topicsCol);
    const existingTopicsMap = new Map<string, Topic>();

    existingSnap.forEach((docSnap) => {
      existingTopicsMap.set(docSnap.id, docSnap.data() as Topic);
    });

    const mergedTopics: Topic[] = [];
    const blueprintTopicIds = new Set<string>();

    blueprintTopics.forEach((bTopic) => {
      blueprintTopicIds.add(bTopic.id);
      const existing = existingTopicsMap.get(bTopic.id);
      if (existing) {
        mergedTopics.push({
          ...bTopic,
          status: existing.status || 'pending',
          startedAt: existing.startedAt,
          completedAt: existing.completedAt,
          targetDate: existing.targetDate,
          notes: existing.notes !== undefined ? existing.notes : bTopic.notes,
          isCustom: false,
        });
      } else {
        mergedTopics.push({
          ...bTopic,
          status: 'pending',
        });
      }
    });

    let customPreserved = 0;
    const obsoleteDocIdsToDelete: string[] = [];
    existingTopicsMap.forEach((existing, id) => {
      if (!blueprintTopicIds.has(id)) {
        if (existing.isCustom) {
          mergedTopics.push(existing);
          customPreserved++;
        } else {
          obsoleteDocIdsToDelete.push(id);
        }
      }
    });

    const BATCH_SIZE = 400;
    for (let i = 0; i < mergedTopics.length; i += BATCH_SIZE) {
      const chunk = mergedTopics.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(db);
      chunk.forEach((top) => {
        batch.set(doc(db, 'users', userId, 'caTopics', top.id), sanitizeForFirestore(top), { merge: true });
      });
      await batch.commit();
    }

    if (obsoleteDocIdsToDelete.length > 0) {
      for (let i = 0; i < obsoleteDocIdsToDelete.length; i += BATCH_SIZE) {
        const chunk = obsoleteDocIdsToDelete.slice(i, i + BATCH_SIZE);
        const batch = writeBatch(db);
        chunk.forEach((id) => {
          batch.delete(doc(db, 'users', userId, 'caTopics', id));
        });
        await batch.commit();
      }
    }

    return { totalMerged: mergedTopics.length, customPreserved };
  } catch (err) {
    console.warn('[Firestore Sync] syncAndFillSyllabusWithCloud error:', err);
    throw err;
  }
}

export interface CAPendingSync {
  topics?: Record<string, Topic>;
  deletedTopicIds?: string[];
  lectures?: Record<string, Lecture>;
  schedule?: Record<string, ScheduleEntry>;
  deletedScheduleIds?: string[];
  revisions?: Record<string, RevisionRecord>;
  deletedRevisionIds?: string[];
  tests?: Record<string, TestRecord>;
  deletedTestIds?: string[];
  settings?: CAUserSettings;
}

/**
 * Atomic one-time fetch of all CA Tracker datasets from Firestore.
 * Does NOT open continuous listeners; charges 1 read per document once.
 */
export async function fetchAllCAUserDataFromFirestore(userId: string = DEFAULT_USER_ID): Promise<{
  topics: Topic[];
  lectures: Lecture[];
  schedule: ScheduleEntry[];
  revisions: RevisionRecord[];
  tests: TestRecord[];
  settings: CAUserSettings | null;
}> {
  try {
    const [settingsSnap, caTopicsSnap, legacyTopicsSnap, lecSnap, schedSnap, revSnap, testsSnap] = await Promise.all([
      getDoc(getUserSettingsDoc(userId)).catch(() => null),
      getDocs(getUserCATopicsCollection(userId)).catch(() => null),
      getDocs(collection(db, 'users', userId, 'topics')).catch(() => null),
      getDocs(getUserLecturesCollection(userId)).catch(() => null),
      getDocs(getUserScheduleCollection(userId)).catch(() => null),
      getDocs(getUserRevisionsCollection(userId)).catch(() => null),
      getDocs(getUserTestsCollection(userId)).catch(() => null),
    ]);

    const settings = settingsSnap?.exists() ? (settingsSnap.data() as CAUserSettings) : null;

    let topics: Topic[] = [];
    if (caTopicsSnap && !caTopicsSnap.empty) {
      topics = caTopicsSnap.docs.map((d) => d.data() as Topic);
    } else if (legacyTopicsSnap && !legacyTopicsSnap.empty) {
      topics = legacyTopicsSnap.docs.map((d) => d.data() as Topic);
    }
    topics.sort((a, b) => (a.order || 0) - (b.order || 0));

    const lectures: Lecture[] = lecSnap && !lecSnap.empty ? lecSnap.docs.map((d) => d.data() as Lecture) : [];
    lectures.sort((a, b) => {
      const subA = String(a.subjectId || '');
      const subB = String(b.subjectId || '');
      if (subA !== subB) return subA.localeCompare(subB);
      return (a.order || 0) - (b.order || 0);
    });

    const schedule: ScheduleEntry[] = schedSnap && !schedSnap.empty ? schedSnap.docs.map((d) => d.data() as ScheduleEntry) : [];
    schedule.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.order || 0) - (b.order || 0);
    });

    const revisions: RevisionRecord[] = revSnap && !revSnap.empty ? revSnap.docs.map((d) => d.data() as RevisionRecord) : [];
    const tests: TestRecord[] = testsSnap && !testsSnap.empty ? testsSnap.docs.map((d) => d.data() as TestRecord) : [];
    tests.sort((a, b) => new Date(b.createdAt || b.dateAttempted).getTime() - new Date(a.createdAt || a.dateAttempted).getTime());

    return { topics, lectures, schedule, revisions, tests, settings };
  } catch (err) {
    console.warn('[Firestore Sync] fetchAllCAUserDataFromFirestore error:', err);
    return { topics: [], lectures: [], schedule: [], revisions: [], tests: [], settings: null };
  }
}

/**
 * Pushes only dirty / pending local changes to Firestore in a single batch write.
 */
export async function flushPendingCAChangesToFirestore(
  userId: string = DEFAULT_USER_ID,
  pending: CAPendingSync
): Promise<void> {
  const hasTopics = pending.topics && Object.keys(pending.topics).length > 0;
  const hasDeletedTopics = pending.deletedTopicIds && pending.deletedTopicIds.length > 0;
  const hasLectures = pending.lectures && Object.keys(pending.lectures).length > 0;
  const hasSchedule = pending.schedule && Object.keys(pending.schedule).length > 0;
  const hasDeletedSchedule = pending.deletedScheduleIds && pending.deletedScheduleIds.length > 0;
  const hasRevisions = pending.revisions && Object.keys(pending.revisions).length > 0;
  const hasDeletedRevisions = pending.deletedRevisionIds && pending.deletedRevisionIds.length > 0;
  const hasTests = pending.tests && Object.keys(pending.tests).length > 0;
  const hasDeletedTests = pending.deletedTestIds && pending.deletedTestIds.length > 0;
  const hasSettings = Boolean(pending.settings);

  if (
    !hasTopics &&
    !hasDeletedTopics &&
    !hasLectures &&
    !hasSchedule &&
    !hasDeletedSchedule &&
    !hasRevisions &&
    !hasDeletedRevisions &&
    !hasTests &&
    !hasDeletedTests &&
    !hasSettings
  ) {
    return;
  }

  const batch = writeBatch(db);
  if (pending.settings) {
    batch.set(getUserSettingsDoc(userId), sanitizeForFirestore(pending.settings), { merge: true });
  }
  if (hasTopics) {
    Object.values(pending.topics!).forEach((topic) => {
      batch.set(doc(db, 'users', userId, 'caTopics', topic.id), sanitizeForFirestore(topic), { merge: true });
    });
  }
  if (hasDeletedTopics) {
    pending.deletedTopicIds!.forEach((id) => {
      batch.delete(doc(db, 'users', userId, 'caTopics', id));
    });
  }
  if (hasLectures) {
    Object.values(pending.lectures!).forEach((lec) => {
      batch.set(doc(db, 'users', userId, 'lectures', lec.id), sanitizeForFirestore(lec), { merge: true });
    });
  }
  if (hasSchedule) {
    Object.values(pending.schedule!).forEach((entry) => {
      batch.set(doc(db, 'users', userId, 'schedule', entry.id), sanitizeForFirestore(entry), { merge: true });
    });
  }
  if (hasDeletedSchedule) {
    pending.deletedScheduleIds!.forEach((id) => {
      batch.delete(doc(db, 'users', userId, 'schedule', id));
    });
  }
  if (hasRevisions) {
    Object.values(pending.revisions!).forEach((rev) => {
      batch.set(doc(db, 'users', userId, 'revisions', rev.id), sanitizeForFirestore(rev), { merge: true });
    });
  }
  if (hasDeletedRevisions) {
    pending.deletedRevisionIds!.forEach((id) => {
      batch.delete(doc(db, 'users', userId, 'revisions', id));
    });
  }
  if (hasTests) {
    Object.values(pending.tests!).forEach((test) => {
      batch.set(doc(db, 'users', userId, 'tests', test.id), sanitizeForFirestore(test), { merge: true });
    });
  }
  if (hasDeletedTests) {
    pending.deletedTestIds!.forEach((id) => {
      batch.delete(doc(db, 'users', userId, 'tests', id));
    });
  }

  await batch.commit();
}

export interface UserDataSubscriptions {
  onTopicsChange?: (topics: Topic[]) => void;
  onRevisionsChange?: (revisions: RevisionRecord[]) => void;
  onTestsChange?: (tests: TestRecord[]) => void;
  onLecturesChange?: (lectures: Lecture[]) => void;
  onScheduleChange?: (schedule: ScheduleEntry[]) => void;
  onSettingsChange?: (settings: CAUserSettings) => void;
  onError?: (error: Error) => void;
}

/**
 * Continuous listeners are intentionally disabled in CA Tracker to eliminate background read/write costs.
 * CA Tracker relies on localStorage caching and syncs only on hard refresh or manual trigger.
 */
export function subscribeToUserData(
  _userId: string = DEFAULT_USER_ID,
  _subscriptions: UserDataSubscriptions
): () => void {
  return () => {};
}

export async function batchUploadAllData(
  payload: {
    topics: Topic[];
    revisions: RevisionRecord[];
    tests: TestRecord[];
    lectures?: Lecture[];
    schedule?: ScheduleEntry[];
    settings: CAUserSettings;
  },
  userId: string = DEFAULT_USER_ID
): Promise<void> {
  const { topics, revisions, tests, lectures, schedule, settings } = payload;
  const BATCH_SIZE = 400;
  type BatchOp = (b: ReturnType<typeof writeBatch>) => void;
  const operations: BatchOp[] = [];

  operations.push((batch) => {
    batch.set(getUserSettingsDoc(userId), sanitizeForFirestore(settings), { merge: true });
  });

  topics.forEach((topic) => {
    operations.push((batch) => {
      batch.set(doc(db, 'users', userId, 'caTopics', topic.id), sanitizeForFirestore(topic), { merge: true });
    });
  });

  if (lectures) {
    lectures.forEach((lec) => {
      operations.push((batch) => {
        batch.set(doc(db, 'users', userId, 'lectures', lec.id), sanitizeForFirestore(lec), { merge: true });
      });
    });
  }

  if (schedule) {
    schedule.forEach((entry) => {
      operations.push((batch) => {
        batch.set(doc(db, 'users', userId, 'schedule', entry.id), sanitizeForFirestore(entry), { merge: true });
      });
    });
  }

  revisions.forEach((rev) => {
    operations.push((batch) => {
      batch.set(doc(db, 'users', userId, 'revisions', rev.id), sanitizeForFirestore(rev), { merge: true });
    });
  });

  tests.forEach((test) => {
    operations.push((batch) => {
      batch.set(doc(db, 'users', userId, 'tests', test.id), sanitizeForFirestore(test), { merge: true });
    });
  });

  for (let i = 0; i < operations.length; i += BATCH_SIZE) {
    const chunk = operations.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);
    chunk.forEach((op) => op(batch));
    await batch.commit();
  }
}
