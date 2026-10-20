import { useState } from 'react';
import { Text } from 'react-native';
import { useWellness } from '@/shared/providers/WellnessProvider';
import {
  Button,
  Card,
  DeleteButton,
  ErrorText,
  Field,
  Screen,
  ui,
} from '@/shared/components/TrackerUI';
import { dayKey, newId, requireDay, requiredText } from '@/shared/model/wellness.model';
export default function PlannerScreen() {
  const s = useWellness();
  const [date, setDate] = useState(dayKey),
    [title, setTitle] = useState(''),
    [error, setError] = useState(''),
    [editing, setEditing] = useState<string | null>(null);
  async function save() {
    setError('');
    try {
      const entry = {
        id: editing ?? newId(),
        date: requireDay(date, true),
        title: requiredText(title, 'Workout plan'),
        completed: s.data.plans.find((e) => e.id === editing)?.completed ?? false,
      };
      if (
        await s.update((d) => ({
          ...d,
          plans: [entry, ...d.plans.filter((e) => e.id !== entry.id)],
        }))
      ) {
        setTitle('');
        setEditing(null);
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <Screen
      title="Workout planner"
      subtitle="Plan future workouts and mark them completed manually."
    >
      <Card title={editing ? 'Edit plan' : 'New plan'}>
        <Field label="Date (YYYY-MM-DD)" value={date} onChange={setDate} />
        <Field
          label="Workout or rest day"
          value={title}
          onChange={setTitle}
          placeholder="Chest & triceps"
        />
        <ErrorText text={error} />
        <Button
          label={s.saving ? 'Saving...' : 'Save plan'}
          disabled={s.saving}
          onPress={() => void save()}
        />
        {editing && (
          <Button
            label="Cancel editing"
            secondary
            onPress={() => {
              setEditing(null);
              setTitle('');
            }}
          />
        )}
      </Card>
      {!s.data.plans.length && (
        <Text style={ui.muted}>No plans yet. Add your first workout above.</Text>
      )}
      {[...s.data.plans]
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((e) => (
          <Card key={e.id} title={e.title}>
            <Text style={ui.text}>
              {e.date} • {e.completed ? 'Completed' : e.date < s.today ? 'Missed' : 'Planned'}
            </Text>
            <Button
              label={e.completed ? 'Mark incomplete' : 'Mark completed'}
              disabled={s.saving}
              onPress={() =>
                void s.update((d) => ({
                  ...d,
                  plans: d.plans.map((v) =>
                    v.id === e.id ? { ...v, completed: !v.completed } : v,
                  ),
                }))
              }
            />
            <Button
              label="Edit plan"
              secondary
              onPress={() => {
                setEditing(e.id);
                setTitle(e.title);
                setDate(e.date);
              }}
            />
            <DeleteButton
              onDelete={() =>
                s.update((d) => ({ ...d, plans: d.plans.filter((v) => v.id !== e.id) }))
              }
            />
          </Card>
        ))}
    </Screen>
  );
}
