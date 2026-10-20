import { useState } from 'react';
import { Text } from 'react-native';
import { useWellness } from '@/shared/providers/WellnessProvider';
import {
  Bars,
  Button,
  Card,
  DeleteButton,
  ErrorText,
  Field,
  Screen,
  ui,
} from '@/shared/components/TrackerUI';
import { dayKey, lastDays, newId, numberInput, requireDay } from '@/shared/model/wellness.model';
import type { ActivityEntry } from '@/shared/model/wellness.types';
export default function ActivityScreen() {
  const s = useWellness();
  const [date, setDate] = useState(dayKey),
    [steps, setSteps] = useState(''),
    [distance, setDistance] = useState(''),
    [minutes, setMinutes] = useState(''),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');
  function edit(e: ActivityEntry) {
    setDate(e.date);
    setSteps(String(e.steps));
    setDistance(String(e.distanceKm));
    setMinutes(String(e.activeMinutes));
    setMessage('Editing daily total in the form above.');
  }
  async function save() {
    setError('');
    setMessage('');
    try {
      const entry: ActivityEntry = {
        id: newId(),
        date: requireDay(date),
        steps: numberInput(steps, 'steps', 0, 100000, true),
        distanceKm: numberInput(distance || '0', 'distance', 0, 1000),
        activeMinutes: numberInput(minutes || '0', 'active minutes', 0, 1440),
      };
      if (
        await s.update((d) => ({
          ...d,
          activity: [entry, ...d.activity.filter((e) => e.date !== entry.date)],
        }))
      ) {
        setMessage('Daily total saved.');
        setSteps('');
        setDistance('');
        setMinutes('');
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <Screen
      title="Steps & activity"
      subtitle="Enter the daily totals from your phone or watch. Automatic step tracking is not connected."
    >
      <Card title="Last 7 days">
        <Bars
          points={lastDays(7).map((date) => ({
            label: date.slice(5),
            value: s.data.activity.find((e) => e.date === date)?.steps ?? 0,
          }))}
          unit="steps"
        />
      </Card>
      <Card title="Set a daily total">
        <Text style={ui.muted}>
          Saving replaces the total for that date. It does not add more steps.
        </Text>
        <Field label="Date (YYYY-MM-DD)" value={date} onChange={setDate} />
        <Field label="Total steps" numeric value={steps} onChange={setSteps} />
        <Field
          label="Activity distance (km, optional)"
          numeric
          value={distance}
          onChange={setDistance}
        />
        <Field label="Active minutes (optional)" numeric value={minutes} onChange={setMinutes} />
        <ErrorText text={error} />
        <Button
          label={s.saving ? 'Saving...' : 'Save daily activity'}
          disabled={s.saving}
          onPress={() => void save()}
        />
        <Text style={ui.muted}>{message}</Text>
      </Card>
      <Text style={ui.heading}>Activity history</Text>
      {!s.data.activity.length && (
        <Text style={ui.muted}>Your daily entries will appear here.</Text>
      )}
      {[...s.data.activity]
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((e) => (
          <Card key={e.id} title={e.date}>
            <Text style={ui.big}>{e.steps.toLocaleString()} steps</Text>
            <Text style={ui.muted}>
              {e.distanceKm} km • {e.activeMinutes} active minutes
            </Text>
            <Button label="Edit daily total" secondary onPress={() => edit(e)} />
            <DeleteButton
              onDelete={() =>
                s.update((d) => ({ ...d, activity: d.activity.filter((v) => v.id !== e.id) }))
              }
            />
          </Card>
        ))}
    </Screen>
  );
}
