import { useEffect, useRef, useState } from 'react';

import {
  clearActiveWorkout,
  loadActiveWorkout,
  saveActiveWorkout,
  type ActiveWorkoutDraft,
} from '../storage/active-workout.storage';

let storageQueue: Promise<void> = Promise.resolve();

function enqueueStorageTask<T>(
  task: () => Promise<T>,
): Promise<T> {
  const result = storageQueue.then(task);

  storageQueue = result.then(
    () => undefined,
    () => undefined,
  );

  return result;
}

export function useWorkoutDraft() {
  const [draft, setDraft] =
    useState<ActiveWorkoutDraft | null>(null);

  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  const mountedRef = useRef(false);
  const readyRef = useRef(false);
  const loadingRef = useRef(true);
  const pendingWritesRef = useRef(0);

  useEffect(() => {
    let active = true;

    mountedRef.current = true;
    readyRef.current = false;
    loadingRef.current = true;

    enqueueStorageTask(loadActiveWorkout)
      .then((savedDraft) => {
        if (!active) return;

        setDraft(savedDraft);
        setReady(true);
        setError(null);
        readyRef.current = true;
      })
      .catch(() => {
        if (!active) return;

        setError(
          'Could not load your unfinished workout. Please retry.',
        );
      })
      .finally(() => {
        if (!active) return;

        loadingRef.current = false;
        setLoading(false);
      });

    return () => {
      active = false;
      mountedRef.current = false;
      readyRef.current = false;
    };
  }, [loadAttempt]);

  function retryLoad() {
    if (
      !mountedRef.current ||
      loadingRef.current ||
      readyRef.current
    ) {
      return;
    }

    loadingRef.current = true;

    setLoading(true);
    setReady(false);
    setError(null);
    setLoadAttempt((current) => current + 1);
  }

  function commit(
    nextDraft: ActiveWorkoutDraft | null,
  ): Promise<boolean> {
    if (!mountedRef.current || !readyRef.current) {
      return Promise.resolve(false);
    }

    const snapshot =
      nextDraft === null
        ? null
        : {
            ...nextDraft,
            details: { ...nextDraft.details },
          };

    pendingWritesRef.current += 1;
    setSaving(true);

    return enqueueStorageTask(async () => {
      try {
        if (snapshot === null) {
          await clearActiveWorkout();
        } else {
          await saveActiveWorkout(snapshot);
        }

        if (mountedRef.current) {
          setDraft(snapshot);
          setError(null);
        }

        return true;
      } catch {
        if (mountedRef.current) {
          setError(
            'Could not update your unfinished workout. Please try again.',
          );
        }

        return false;
      } finally {
        pendingWritesRef.current -= 1;

        if (mountedRef.current) {
          setSaving(pendingWritesRef.current > 0);
        }
      }
    });
  }

  function saveDraft(
    nextDraft: ActiveWorkoutDraft,
  ): Promise<boolean> {
    return commit(nextDraft);
  }

  function clearDraft(): Promise<boolean> {
    return commit(null);
  }

  return {
    draft,
    loading,
    ready,
    saving,
    error,
    saveDraft,
    clearDraft,
    retryLoad,
  };
}