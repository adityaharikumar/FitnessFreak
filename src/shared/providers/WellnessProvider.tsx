import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { dayKey, emptyWellness } from '../model/wellness.model';
import type { WellnessData } from '../model/wellness.types';
import { loadWellness, saveWellness } from '../model/wellness.storage';

type Store = {
  data: WellnessData;
  today: string;
  ready: boolean;
  loading: boolean;
  saving: boolean;
  error: string;
  retry: () => void;
  update: (change: (d: WellnessData) => WellnessData) => Promise<boolean>;
};
const Context = createContext<Store | null>(null);
export function WellnessProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(emptyWellness);
  const dataRef = useRef(data),
    loaded = useRef(false),
    busy = useRef(false),
    mounted = useRef(false);
  const [ready, setReady] = useState(false),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(''),
    [today, setToday] = useState(dayKey),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    let alive = true;
    loadWellness()
      .then((saved) => {
        if (!alive) return;
        dataRef.current = saved;
        loaded.current = true;
        setData(saved);
        setReady(true);
        setError('');
      })
      .catch(() => {
        if (alive)
          setError(
            'Could not read saved entries. Retry loading; existing data will not be overwritten.',
          );
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [attempt]);
  useEffect(() => {
    const refresh = () => setToday(dayKey());
    const timer = setInterval(refresh, 30000);
    const listener = AppState.addEventListener('change', (s) => {
      if (s === 'active') refresh();
    });
    return () => {
      clearInterval(timer);
      listener.remove();
    };
  }, []);
  async function update(change: (d: WellnessData) => WellnessData) {
    if (!loaded.current || busy.current) return false;
    busy.current = true;
    setSaving(true);
    setError('');
    try {
      const next = change(dataRef.current);
      await saveWellness(next);
      dataRef.current = next;
      if (mounted.current) setData(next);
      return true;
    } catch (e) {
      if (mounted.current)
        setError(
          e instanceof Error ? `Could not save: ${e.message}` : 'Could not save. Please retry.',
        );
      return false;
    } finally {
      busy.current = false;
      if (mounted.current) setSaving(false);
    }
  }
  return (
    <Context.Provider
      value={{
        data,
        today,
        ready,
        loading,
        saving,
        error,
        update,
        retry: () => {
          setLoading(true);
          setError('');
          setAttempt((v) => v + 1);
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useWellness() {
  const store = useContext(Context);
  if (!store) throw new Error('WellnessProvider is missing.');
  return store;
}
