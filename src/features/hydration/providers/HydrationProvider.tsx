import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';
import {
  dailyTotal,
  emptyHydration,
  entriesForDay,
  isValidGoal,
  localDateKey,
  undoForDay,
} from '../hydration.model';
import type { HydrationData, WaterEntry } from '../hydration.types';
import { loadHydration, saveHydration } from '../storage/hydration.storage';

type HydrationContextValue = {
  totalMl: number;
  goalMl: number;
  progress: number;
  today: string;
  todayEntries: WaterEntry[];
  history: HydrationData['entries'];
  loading: boolean;
  saving: boolean;
  ready: boolean;
  error: string | null;
  canUndo: boolean;
  addWater: (amountMl: number) => Promise<void>;
  undoLastEntry: () => Promise<void>;
  setGoal: (goalMl: number) => Promise<boolean>;
  retryLoad: () => Promise<void>;
};
const HydrationContext = createContext<HydrationContextValue | null>(null);

export function HydrationProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<HydrationData>(emptyHydration);
  const currentData = useRef(data);
  const busy = useRef(false);
  const loaded = useRef(false);
  const sequence = useRef(0);
  const [today, setToday] = useState(localDateKey);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const restore = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    loaded.current = false;
    try {
      const saved = await loadHydration();
      currentData.current = saved;
      setData(saved);
      loaded.current = true;
      setReady(true);
      setError(null);
    } catch {
      setError('Could not load your saved water entries. Retry to keep your existing data safe.');
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    busy.current = true;
    loadHydration()
      .then((saved) => {
        if (!active) return;
        currentData.current = saved;
        loaded.current = true;
        setData(saved);
        setReady(true);
      })
      .catch(() => {
        if (active)
          setError(
            'Could not load your saved water entries. Retry to keep your existing data safe.',
          );
      })
      .finally(() => {
        if (active) {
          busy.current = false;
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    const refreshDate = () => setToday(localDateKey());
    const timer = setInterval(refreshDate, 30000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshDate();
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, []);

  async function commit(change: (previous: HydrationData) => HydrationData): Promise<boolean> {
    if (!loaded.current || busy.current) return false;
    busy.current = true;
    setSaving(true);
    setError(null);
    try {
      const next = change(currentData.current);
      await saveHydration(next);
      currentData.current = next;
      setData(next);
      return true;
    } catch {
      setError(
        'Could not save this change. Your previous entries are unchanged. Please try again.',
      );
      return false;
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }

  async function addWater(amountMl: number) {
    if (!Number.isInteger(amountMl) || amountMl <= 0 || amountMl > 10000) return;
    const now = new Date();
    const date = localDateKey(now);
    setToday(date);
    const entry: WaterEntry = {
      id: `${now.getTime()}-${++sequence.current}-${Math.random().toString(36).slice(2, 10)}`,
      amountMl,
      recordedAt: now.toISOString(),
      localDate: date,
    };
    await commit((previous) => ({ ...previous, entries: [...previous.entries, entry] }));
  }

  async function undoLastEntry() {
    const date = localDateKey();
    setToday(date);
    await commit((previous) => undoForDay(previous, date));
  }

  async function setGoal(goalMl: number) {
    if (!isValidGoal(goalMl)) return false;
    return commit((previous) => ({ ...previous, goalMl }));
  }

  const todayEntries = entriesForDay(data, today);
  const totalMl = dailyTotal(data, today);
  return (
    <HydrationContext.Provider
      value={{
        totalMl,
        goalMl: data.goalMl,
        progress: Math.min((totalMl / data.goalMl) * 100, 100),
        today,
        todayEntries,
        history: data.entries,
        loading,
        saving,
        ready,
        error,
        canUndo: ready && !saving && todayEntries.length > 0,
        addWater,
        undoLastEntry,
        setGoal,
        retryLoad: async () => {
          setReady(false);
          setLoading(true);
          setError(null);
          await restore();
        },
      }}
    >
      {children}
    </HydrationContext.Provider>
  );
}

export function useHydrationContext() {
  const value = useContext(HydrationContext);
  if (!value) throw new Error('useHydration must be used inside HydrationProvider');
  return value;
}
