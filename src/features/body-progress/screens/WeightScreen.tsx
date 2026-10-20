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
import {
  dayKey,
  newId,
  numberInput,
  optionalNumber,
  requireDay,
} from '@/shared/model/wellness.model';
import type { BodyEntry } from '@/shared/model/wellness.types';
export default function WeightScreen() {
  const s = useWellness();
  const [date, setDate] = useState(dayKey),
    [weight, setWeight] = useState(''),
    [fat, setFat] = useState(''),
    [waist, setWaist] = useState(''),
    [notes, setNotes] = useState(''),
    [error, setError] = useState(''),
    [message, setMessage] = useState(''),
    [editing, setEditing] = useState<string | null>(null);
  const sorted = [...s.data.body].sort((a, b) => a.date.localeCompare(b.date));
  const target = s.data.goals.targetWeightKg;
  const baseline = sorted[0]?.weightKg;
  const latest = sorted[sorted.length - 1]?.weightKg;
  const targetProgress =
    baseline !== undefined && latest !== undefined && target !== null
      ? baseline === target
        ? latest === target
          ? 100
          : 0
        : Math.min(100, Math.max(0, ((latest - baseline) / (target - baseline)) * 100))
      : null;
  async function save() {
    setError('');
    setMessage('');
    try {
      const entry: BodyEntry = {
        id: editing ?? newId(),
        date: requireDay(date),
        weightKg: numberInput(weight, 'weight', 1, 500),
        bodyFat: optionalNumber(fat, 'body fat', 0, 100),
        waistCm: optionalNumber(waist, 'waist', 1, 300),
        notes: notes.trim(),
      };
      if (
        await s.update((d) => ({
          ...d,
          body: [entry, ...d.body.filter((e) => e.id !== entry.id && e.date !== entry.date)],
        }))
      ) {
        setEditing(null);
        setWeight('');
        setFat('');
        setWaist('');
        setNotes('');
        setMessage('Measurement saved.');
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function edit(e: BodyEntry) {
    setEditing(e.id);
    setDate(e.date);
    setWeight(String(e.weightKg));
    setFat(e.bodyFat === null ? '' : String(e.bodyFat));
    setWaist(e.waistCm === null ? '' : String(e.waistCm));
    setNotes(e.notes);
    setMessage('Editing in the form above.');
  }
  return (
    <Screen
      title="Weight & measurements"
      subtitle="Record one check-in per date. Saving the same date replaces its measurement."
    >
      <Card title="Recent weight check-ins">
        {sorted.length ? (
          <Bars
            points={sorted.slice(-7).map((e) => ({ label: e.date.slice(5), value: e.weightKg }))}
            unit="kg"
          />
        ) : (
          <Text style={ui.muted}>No weight measurements yet.</Text>
        )}
        <Text style={ui.muted}>
          Target:{' '}
          {s.data.goals.targetWeightKg === null
            ? 'Set a target in Goals'
            : `${s.data.goals.targetWeightKg} kg`}
        </Text>
        {targetProgress !== null && (
          <Text style={ui.text}>
            {targetProgress.toFixed(0)}% of the change from your first recorded weight to your
            target.
          </Text>
        )}
      </Card>
      <Card title={editing ? 'Edit measurement' : 'New check-in'}>
        <Field label="Date (YYYY-MM-DD)" value={date} onChange={setDate} />
        <Field label="Weight (kg)" numeric value={weight} onChange={setWeight} />
        <Field label="Body fat (%, optional)" numeric value={fat} onChange={setFat} />
        <Field label="Waist (cm, optional)" numeric value={waist} onChange={setWaist} />
        <Field label="Notes" multiline value={notes} onChange={setNotes} />
        <ErrorText text={error} />
        <Button
          label={s.saving ? 'Saving...' : 'Save measurement'}
          disabled={s.saving}
          onPress={() => void save()}
        />
        {editing && (
          <Button
            label="Cancel editing"
            secondary
            onPress={() => {
              setEditing(null);
              setWeight('');
              setFat('');
              setWaist('');
              setNotes('');
            }}
          />
        )}
        <Text style={ui.muted}>{message}</Text>
      </Card>
      {sorted.reverse().map((e) => (
        <Card key={e.id} title={e.date}>
          <Text style={ui.big}>{e.weightKg} kg</Text>
          {e.bodyFat !== null && <Text style={ui.text}>Body fat: {e.bodyFat}%</Text>}
          {e.waistCm !== null && <Text style={ui.text}>Waist: {e.waistCm} cm</Text>}
          {!!e.notes && <Text style={ui.muted}>{e.notes}</Text>}
          <Button label="Edit measurement" secondary onPress={() => edit(e)} />
          <DeleteButton
            onDelete={() => s.update((d) => ({ ...d, body: d.body.filter((v) => v.id !== e.id) }))}
          />
        </Card>
      ))}
    </Screen>
  );
}
