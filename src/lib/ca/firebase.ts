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
  collection(db, 'users', userId, 'topics');

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

export async function saveTopicToFirestore(
  topic: Topic,
  userId: string = DEFAULT_USER_ID
): Promise<void> {
  try {
    const topicRef = doc(db, 'users', userId, 'topics', topic.id);
    await setDoc(topicRef, sanitizeForFirestore(topic), { merge: true });

    // Also mirror to caTopics so legacy widgets stay in sync
    const legacyRef = doc(db, 'users', userId, 'caTopics', topic.id);
    await setDoc(legacyRef, sanitizeForFirestore(topic), { merge: true });
  } catch (err) {
    console.warn(`[Firestore Sync] Failed to save topic ${topic.id}:`, err);
  }
}

export async function deleteTopicFromFirestore(
  topicId: string,
  userId: string = DEFAULT_USER_ID
): Promise<void> {
  try {
    const topicRef = doc(db, 'users', userId, 'topics', topicId);
    await deleteDoc(topicRef);
    const legacyRef = doc(db, 'users', userId, 'caTopics', topicId);
    await deleteDoc(legacyRef);
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
        batch.set(doc(db, 'users', userId, 'topics', top.id), sanitizeForFirestore(top), { merge: true });
        batch.set(doc(db, 'users', userId, 'caTopics', top.id), sanitizeForFirestore(top), { merge: true });
      });
      await batch.commit();
    }

    if (obsoleteDocIdsToDelete.length > 0) {
      for (let i = 0; i < obsoleteDocIdsToDelete.length; i += BATCH_SIZE) {
        const chunk = obsoleteDocIdsToDelete.slice(i, i + BATCH_SIZE);
        const batch = writeBatch(db);
        chunk.forEach((id) => {
          batch.delete(doc(db, 'users', userId, 'topics', id));
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

export interface UserDataSubscriptions {
  onTopicsChange?: (topics: Topic[]) => void;
  onRevisionsChange?: (revisions: RevisionRecord[]) => void;
  onTestsChange?: (tests: TestRecord[]) => void;
  onLecturesChange?: (lectures: Lecture[]) => void;
  onScheduleChange?: (schedule: ScheduleEntry[]) => void;
  onSettingsChange?: (settings: CAUserSettings) => void;
  onError?: (error: Error) => void;
}

export function subscribeToUserData(
  userId: string = DEFAULT_USER_ID,
  subscriptions: UserDataSubscriptions
): () => void {
  const unsubscribes: Unsubscribe[] = [];

  try {
    // Topics listener
    if (subscriptions.onTopicsChange) {
      const unsubTopics = onSnapshot(
        getUserTopicsCollection(userId),
        (snapshot) => {
          if (!snapshot.empty) {
            const topics = snapshot.docs.map((d) => d.data() as Topic);
            topics.sort((a, b) => (a.order || 0) - (b.order || 0));
            subscriptions.onTopicsChange?.(topics);
          } else {
            subscriptions.onTopicsChange?.([]);
          }
        },
        (err) => {
          console.warn('[Firestore Sync] Topics subscription error:', err);
          subscriptions.onError?.(err);
        }
      );
      unsubscribes.push(unsubTopics);
    }

    // Lectures listener
    if (subscriptions.onLecturesChange) {
      const unsubLectures = onSnapshot(
        getUserLecturesCollection(userId),
        (snapshot) => {
          if (!snapshot.empty) {
            const lectures = snapshot.docs.map((d) => d.data() as Lecture);
            lectures.sort((a, b) => {
              const subA = String(a.subjectId || '');
              const subB = String(b.subjectId || '');
              if (subA !== subB) return subA.localeCompare(subB);
              return (a.order || 0) - (b.order || 0);
            });
            subscriptions.onLecturesChange?.(lectures);
          } else {
            subscriptions.onLecturesChange?.([]);
          }
        },
        (err) => {
          console.warn('[Firestore Sync] Lectures subscription error:', err);
          subscriptions.onError?.(err);
        }
      );
      unsubscribes.push(unsubLectures);
    }

    // Schedule listener
    if (subscriptions.onScheduleChange) {
      const unsubSchedule = onSnapshot(
        getUserScheduleCollection(userId),
        (snapshot) => {
          if (!snapshot.empty) {
            const schedule = snapshot.docs.map((d) => d.data() as ScheduleEntry);
            schedule.sort((a, b) => {
              if (a.date !== b.date) return a.date.localeCompare(b.date);
              return (a.order || 0) - (b.order || 0);
            });
            subscriptions.onScheduleChange?.(schedule);
          } else {
            subscriptions.onScheduleChange?.([]);
          }
        },
        (err) => {
          console.warn('[Firestore Sync] Schedule subscription error:', err);
          subscriptions.onError?.(err);
        }
      );
      unsubscribes.push(unsubSchedule);
    }

    // Revisions listener
    if (subscriptions.onRevisionsChange) {
      const unsubRevs = onSnapshot(
        getUserRevisionsCollection(userId),
        (snapshot) => {
          const revisions = snapshot.docs.map((d) => d.data() as RevisionRecord);
          subscriptions.onRevisionsChange?.(revisions);
        },
        (err) => {
          console.warn('[Firestore Sync] Revisions subscription error:', err);
          subscriptions.onError?.(err);
        }
      );
      unsubscribes.push(unsubRevs);
    }

    // Tests listener
    if (subscriptions.onTestsChange) {
      const unsubTests = onSnapshot(
        getUserTestsCollection(userId),
        (snapshot) => {
          const tests = snapshot.docs.map((d) => d.data() as TestRecord);
          tests.sort(
            (a, b) =>
              new Date(b.createdAt || b.dateAttempted).getTime() -
              new Date(a.createdAt || a.dateAttempted).getTime()
          );
          subscriptions.onTestsChange?.(tests);
        },
        (err) => {
          console.warn('[Firestore Sync] Tests subscription error:', err);
          subscriptions.onError?.(err);
        }
      );
      unsubscribes.push(unsubTests);
    }

    // Settings listener
    if (subscriptions.onSettingsChange) {
      const unsubSettings = onSnapshot(
        getUserSettingsDoc(userId),
        (docSnap) => {
          if (docSnap.exists()) {
            subscriptions.onSettingsChange?.(docSnap.data() as CAUserSettings);
          }
        },
        (err) => {
          console.warn('[Firestore Sync] Settings subscription error:', err);
          subscriptions.onError?.(err);
        }
      );
      unsubscribes.push(unsubSettings);
    }
  } catch (err) {
    console.warn('[Firestore Sync] Failed to setup subscriptions:', err);
  }

  return () => {
    unsubscribes.forEach((unsub) => {
      try {
        unsub();
      } catch {
        // Ignore unmount cleanup errors
      }
    });
  };
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
      batch.set(doc(db, 'users', userId, 'topics', topic.id), sanitizeForFirestore(topic), { merge: true });
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
