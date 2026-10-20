import { useState } from 'react';
import { Text } from 'react-native';
import { useWellness } from '@/shared/providers/WellnessProvider';
import {
  Bars,
  Button,
  Card,
  Choices,
  DeleteButton,
  ErrorText,
  Field,
  Screen,
  ui,
} from '@/shared/components/TrackerUI';
import { dayKey, lastDays, newId, sleepInterval } from '@/shared/model/wellness.model';
import type { SleepEntry } from '@/shared/model/wellness.types';
const time = (s: string) => {
  const d = new Date(s);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
export default function SleepScreen() {
  const s = useWellness();
  const [bedDate, setBedDate] = useState(() => lastDays(2)[0]),
    [wakeDate, setWakeDate] = useState(dayKey),
    [bed, setBed] = useState('23:00'),
    [wake, setWake] = useState('07:00'),
    [quality, setQuality] = useState<SleepEntry['quality']>('Good'),
    [editing, setEditing] = useState<string | null>(null),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');
  async function save() {
    setError('');
    setMessage('');
    try {
      const entry: SleepEntry = {
        id: editing ?? newId(),
        date: wakeDate,
        ...sleepInterval(bedDate, bed, wakeDate, wake),
        quality,
      };
      if (
        await s.update((d) => ({
          ...d,
          sleep: [entry, ...d.sleep.filter((e) => e.id !== entry.id && e.date !== entry.date)],
        }))
      ) {
        setEditing(null);
        setMessage('Sleep saved.');
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function edit(e: SleepEntry) {
    setEditing(e.id);
    setBedDate(dayKey(new Date(e.bedtime)));
    setWakeDate(dayKey(new Date(e.wakeTime)));
    setBed(time(e.bedtime));
    setWake(time(e.wakeTime));
    setQuality(e.quality);
    setMessage('Editing in the form above.');
  }
  return (
    <Screen
      title="Sleep tracker"
      subtitle="One main sleep session per wake-up date. Saving the same date replaces its entry."
    >
      <Card title="Last 7 days">
        <Bars
          points={lastDays(7).map((date) => ({
            label: date.slice(5),
            value: (s.data.sleep.find((e) => e.date === date)?.minutes ?? 0) / 60,
          }))}
          unit="hours"
        />
      </Card>
      <Card title={editing ? 'Edit sleep' : 'Log sleep'}>
        <Field label="Bedtime date (YYYY-MM-DD)" value={bedDate} onChange={setBedDate} />
        <Field label="Bedtime (HH:mm, 24-hour)" value={bed} onChange={setBed} />
        <Field label="Wake-up date (YYYY-MM-DD)" value={wakeDate} onChange={setWakeDate} />
        <Field label="Wake-up time (HH:mm, 24-hour)" value={wake} onChange={setWake} />
        <Choices items={['Poor', 'Okay', 'Good'] as const} value={quality} onChange={setQuality} />
        <ErrorText text={error} />
        <Button
          label={s.saving ? 'Saving...' : 'Save sleep'}
          disabled={s.saving}
          onPress={() => void save()}
        />
        {editing && <Button label="Cancel editing" secondary onPress={() => setEditing(null)} />}
        <Text style={ui.muted}>{message}</Text>
      </Card>
      {!s.data.sleep.length && <Text style={ui.muted}>No sleep entries yet.</Text>}
      {[...s.data.sleep]
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((e) => (
          <Card key={e.id} title={e.date}>
            <Text style={ui.big}>
              {Math.floor(e.minutes / 60)}h {Math.round(e.minutes % 60)}m
            </Text>
            <Text style={ui.muted}>
              {time(e.bedtime)} → {time(e.wakeTime)} • {e.quality}
            </Text>
            <Button label="Edit sleep" secondary onPress={() => edit(e)} />
            <DeleteButton
              onDelete={() =>
                s.update((d) => ({ ...d, sleep: d.sleep.filter((v) => v.id !== e.id) }))
              }
            />
          </Card>
        ))}
    </Screen>
  );
}
