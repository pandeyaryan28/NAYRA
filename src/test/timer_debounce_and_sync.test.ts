import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { syncActiveTimerToFirestore, subscribeActiveTimerFromFirestore, OPERATOR_UID } from '../lib/firebase';
import { setDoc, onSnapshot } from 'firebase/firestore';

describe('Timer Sync Debounce & Zero-Redundancy Verification (v2.16.1)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('coalesces rapid consecutive timer state changes into a single Firestore write within 300ms', async () => {
    const state1 = {
      mode: 'focus',
      timerState: 'idle',
      remainingSeconds: 1500,
      targetEndTime: null,
      selectedTaskId: 'task-123',
      activeTaskIds: ['task-123'],
    };

    const state2 = {
      mode: 'focus',
      timerState: 'running',
      remainingSeconds: 1500,
      targetEndTime: Date.now() + 1500000,
      selectedTaskId: 'task-123',
      activeTaskIds: ['task-123'],
    };

    // Trigger state1 (e.g. task selection) and state2 (e.g. immediate timer start) 50ms apart
    syncActiveTimerToFirestore(OPERATOR_UID, state1);
    vi.advanceTimersByTime(50);
    syncActiveTimerToFirestore(OPERATOR_UID, state2);

    // Before debounce fires (at 100ms), 0 writes should have occurred
    vi.advanceTimersByTime(100);
    expect(setDoc).not.toHaveBeenCalled();

    // Advance past the 300ms debounce threshold
    await vi.advanceTimersByTimeAsync(350);

    // Exactly 1 write should have executed with the final state2
    expect(setDoc).toHaveBeenCalledTimes(1);
    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        timerState: 'running',
        selectedTaskId: 'task-123',
      }),
      { merge: true }
    );
  });

  it('suppresses writes when incoming state is identical to remote or local cached hash', async () => {
    const runningState = {
      mode: 'focus',
      timerState: 'running',
      remainingSeconds: 1499,
      targetEndTime: 1729580000000,
      selectedTaskId: 'task-abc',
      activeTaskIds: ['task-abc'],
    };

    // First write
    syncActiveTimerToFirestore(OPERATOR_UID, runningState);
    await vi.advanceTimersByTimeAsync(350);
    expect(setDoc).toHaveBeenCalledTimes(1);

    vi.clearAllMocks();

    // Second write during countdown: remainingSeconds changes, but mode, timerState, targetEndTime, and taskId remain identical
    const countdownTickState = {
      ...runningState,
      remainingSeconds: 1498,
    };
    syncActiveTimerToFirestore(OPERATOR_UID, countdownTickState);
    await vi.advanceTimersByTimeAsync(350);

    // Must be suppressed (0 writes)
    expect(setDoc).not.toHaveBeenCalled();
  });

  it('absorbs incoming remote updates in subscribeActiveTimerFromFirestore to prevent echo writes', async () => {
    let capturedCallback: ((snap: any) => void) | null = null;
    vi.mocked(onSnapshot).mockImplementation((_ref: any, onNext: any) => {
      capturedCallback = onNext;
      return () => {};
    });

    const onUpdateMock = vi.fn();
    subscribeActiveTimerFromFirestore(OPERATOR_UID, onUpdateMock);

    expect(capturedCallback).not.toBeNull();

    // Simulate incoming snapshot from extension or another tab
    const remoteDocData = {
      mode: 'focus',
      timerState: 'running',
      remainingSeconds: 1500,
      targetEndTime: 1729600000000,
      selectedTaskId: 'task-xyz',
      activeTaskIds: ['task-xyz'],
      updatedBy: 'extension',
    };

    capturedCallback!({
      exists: () => true,
      data: () => remoteDocData,
    });

    expect(onUpdateMock).toHaveBeenCalledWith(remoteDocData);

    // If local client now attempts to sync the identical state, it should be recognized as already synced
    vi.clearAllMocks();
    syncActiveTimerToFirestore(OPERATOR_UID, remoteDocData);
    await vi.advanceTimersByTimeAsync(350);

    expect(setDoc).not.toHaveBeenCalled();
  });
});
