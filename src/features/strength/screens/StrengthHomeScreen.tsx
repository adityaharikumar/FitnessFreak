import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useWellness } from '@/shared/providers/WellnessProvider';
import {
  Button,
  Card,
  Choices,
  DeleteButton,
  ErrorText,
  Field,
  Screen,
  ui,
} from '@/shared/components/TrackerUI';
import { StrengthSetRow } from '../components/StrengthSetRow';
import {
  addExerciseToSession,
  addSetToExercise,
  createStrengthSession,
  toggleStrengthSetCompleted,
  updateStrengthSet,
} from '../model/strength.model';
import type { StrengthSession } from '../types/strength.types';
import { WorkoutTimer } from '@/features/workouts/components/WorkoutTimer';
export function StrengthHomeScreen() {
  return (
    <Screen
      title="Strength training"
      subtitle="Build a session, complete each set, then save to history."
    >
      <StrengthContent />
    </Screen>
  );
}
function RestTimer({ until, onStop }: { until: number; onStop: () => void }) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const seconds = Math.max(0, Math.ceil((until - now) / 1000));
  return (
    <Card title="Rest timer">
      <Text style={ui.big}>
        {seconds
          ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
          : 'Rest complete'}
      </Text>
      <Button label="Dismiss rest timer" secondary onPress={onStop} />
    </Card>
  );
}
function StrengthContent() {
  const s = useWellness();
  const session = s.data.strengthDraft;
  const [name, setName] = useState(''),
    [exercise, setExercise] = useState(''),
    [error, setError] = useState(''),
    [rest, setRest] = useState('90'),
    [restUntil, setRestUntil] = useState<number | null>(null);
  async function change(fn: (session: StrengthSession) => StrengthSession) {
    setError('');
    return s.update((d) => {
      if (!d.strengthDraft) throw new Error('No active strength session.');
      return { ...d, strengthDraft: fn(d.strengthDraft) };
    });
  }
  async function start() {
    setError('');
    try {
      const next = createStrengthSession(name);
      if (await s.update((d) => ({ ...d, strengthDraft: d.strengthDraft ?? next }))) setName('');
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function finish() {
    setError('');
    if (!session) return;
    const sets = session.exercises.flatMap((e) => e.sets);
    if (
      !sets.length ||
      session.exercises.some((e) => !e.sets.length) ||
      sets.some((e) => !e.completed)
    ) {
      setError('Complete every set before saving, or remove unfinished sets and empty exercises.');
      return;
    }
    if (
      await s.update((d) => {
        if (!d.strengthDraft) throw new Error('No active session.');
        return {
          ...d,
          strength: [
            { ...d.strengthDraft, status: 'completed', endTime: new Date().toISOString() },
            ...d.strength,
          ],
          strengthDraft: null,
        };
      })
    )
      setRestUntil(null);
  }
  const records = new Map<string, number>();
  for (const h of s.data.strength)
    for (const e of h.exercises)
      for (const set of e.sets) {
        if (set.completed && set.weightKg !== null)
          records.set(e.name, Math.max(records.get(e.name) ?? 0, set.weightKg));
      }
  return (
    <>
      <ErrorText text={error} />
      {!session ? (
        <Card title="New session">
          <Choices
            items={['Push Day', 'Pull Day', 'Leg Day', 'Full Body']}
            value={name}
            onChange={setName}
          />
          <Field label="Session name" value={name} onChange={setName} />
          <Button
            label={s.saving ? 'Saving...' : 'Start strength session'}
            disabled={s.saving}
            onPress={() => void start()}
          />
        </Card>
      ) : (
        <>
          <Card title={session.name}>
            <WorkoutTimer startTime={session.startTime} />
            <Text style={ui.muted}>
              Session changes are saved on this device. Update a set before marking it completed.
            </Text>
            <Text style={ui.text}>Rest duration (seconds)</Text>
            <Choices items={['60', '90', '120', '180']} value={rest} onChange={setRest} />
            <Field
              label="Exercise name"
              value={exercise}
              onChange={setExercise}
              placeholder="Bench press"
            />
            <Button
              label="Add exercise"
              disabled={s.saving}
              onPress={() => {
                void change((current) => addExerciseToSession(current, exercise)).then((ok) => {
                  if (ok) setExercise('');
                });
              }}
            />
          </Card>
          {restUntil !== null && <RestTimer until={restUntil} onStop={() => setRestUntil(null)} />}
          {session.exercises.map((e) => (
            <Card key={e.id} title={e.name}>
              {e.sets.map((set, i) => (
                <View key={set.id}>
                  <StrengthSetRow
                    set={set}
                    number={i + 1}
                    disabled={s.saving}
                    onSave={(values) =>
                      change((current) => updateStrengthSet(current, e.id, set.id, values))
                    }
                    onToggleCompleted={() => {
                      void change((current) => {
                        const next = toggleStrengthSetCompleted(current, e.id, set.id);
                        return {
                          ...next,
                          exercises: next.exercises.map((v) =>
                            v.id === e.id
                              ? {
                                  ...v,
                                  sets: v.sets.map((x) =>
                                    x.id === set.id ? { ...x, restSeconds: Number(rest) } : x,
                                  ),
                                }
                              : v,
                          ),
                        };
                      }).then((ok) => {
                        if (ok && !set.completed) setRestUntil(Date.now() + Number(rest) * 1000);
                      });
                    }}
                  />
                  <DeleteButton
                    label={`Remove set ${i + 1}`}
                    onDelete={() =>
                      change((current) => ({
                        ...current,
                        exercises: current.exercises.map((v) =>
                          v.id === e.id ? { ...v, sets: v.sets.filter((x) => x.id !== set.id) } : v,
                        ),
                      }))
                    }
                  />
                </View>
              ))}
              <Button
                label="Add set"
                secondary
                disabled={s.saving}
                onPress={() => void change((current) => addSetToExercise(current, e.id))}
              />
              <DeleteButton
                label="Remove exercise"
                onDelete={() =>
                  change((current) => ({
                    ...current,
                    exercises: current.exercises.filter((v) => v.id !== e.id),
                  }))
                }
              />
            </Card>
          ))}
          <Button
            label={s.saving ? 'Saving...' : 'Finish & save strength session'}
            disabled={s.saving}
            onPress={() => void finish()}
          />
          <DeleteButton
            label="Discard active session"
            onDelete={async () => {
              const ok = await s.update((d) => ({ ...d, strengthDraft: null }));
              if (ok) setRestUntil(null);
              return ok;
            }}
          />
        </>
      )}
      {!!records.size && (
        <Card title="Personal records · highest weight">
          {[...records.entries()].map(([name, weight]) => (
            <Text key={name} style={ui.text}>
              {name}: {weight} kg
            </Text>
          ))}
        </Card>
      )}
      <Text style={ui.heading}>Strength history</Text>
      {!s.data.strength.length && <Text style={ui.muted}>No completed strength sessions yet.</Text>}
      {s.data.strength.map((h) => (
        <Card key={h.id} title={h.name}>
          <Text style={ui.muted}>
            {new Date(h.endTime!).toLocaleString()} •{' '}
            {((Date.parse(h.endTime!) - Date.parse(h.startTime)) / 60000).toFixed(1)} min
          </Text>
          {h.exercises.map((e) => (
            <View key={e.id}>
              <Text style={ui.text}>{e.name}</Text>
              {e.sets.map((set, i) => (
                <Text key={set.id} style={ui.muted}>
                  Set {i + 1}: {set.reps} reps × {set.weightKg} kg
                </Text>
              ))}
            </View>
          ))}
          <DeleteButton
            label="Delete strength session"
            onDelete={() =>
              s.update((d) => ({ ...d, strength: d.strength.filter((v) => v.id !== h.id) }))
            }
          />
        </Card>
      ))}
    </>
  );
}
