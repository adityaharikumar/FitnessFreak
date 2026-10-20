import { useState } from 'react';
import { Text } from 'react-native';
import { useWellness } from '@/shared/providers/WellnessProvider';
import { useHydration } from '@/features/hydration/hooks/useHydration';
import { Button, Card, ErrorText, Field, Screen, ui } from '@/shared/components/TrackerUI';
import { numberInput, optionalNumber } from '@/shared/model/wellness.model';
export default function GoalsScreen() {
  return (
    <Screen
      title="Your goals"
      subtitle="Choose targets that suit you. Initial values are editable starting points."
    >
      <GoalsForm />
    </Screen>
  );
}
function GoalsForm() {
  const s = useWellness(),
    water = useHydration();
  const g = s.data.goals;
  const [steps, setSteps] = useState(String(g.steps)),
    [minutes, setMinutes] = useState(String(g.workoutMinutes)),
    [sleep, setSleep] = useState(String(g.sleepHours)),
    [calories, setCalories] = useState(String(g.calories)),
    [protein, setProtein] = useState(String(g.protein)),
    [weight, setWeight] = useState(g.targetWeightKg === null ? '' : String(g.targetWeightKg)),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');
  async function save() {
    setError('');
    setMessage('');
    try {
      const goals = {
        steps: numberInput(steps, 'step goal', 1, 100000, true),
        workoutMinutes: numberInput(minutes, 'workout goal', 1, 1440),
        sleepHours: numberInput(sleep, 'sleep goal', 1, 24),
        calories: numberInput(calories, 'calorie goal', 1, 20000),
        protein: numberInput(protein, 'protein goal', 1, 1000),
        targetWeightKg: optionalNumber(weight, 'target weight', 1, 500),
      };
      if (await s.update((d) => ({ ...d, goals }))) setMessage('Goals saved.');
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      <Card title="Daily goals">
        <Field label="Steps per day" numeric value={steps} onChange={setSteps} />
        <Field label="Workout minutes per day" numeric value={minutes} onChange={setMinutes} />
        <Field label="Sleep hours per night" numeric value={sleep} onChange={setSleep} />
        <Field
          label="Food calories per day (kcal)"
          numeric
          value={calories}
          onChange={setCalories}
        />
        <Field label="Protein per day (g)" numeric value={protein} onChange={setProtein} />
        <Field label="Target weight (kg, optional)" numeric value={weight} onChange={setWeight} />
        <ErrorText text={error} />
        <Button
          label={s.saving ? 'Saving...' : 'Save goals'}
          disabled={s.saving}
          onPress={() => void save()}
        />
        <Text style={ui.muted}>{message}</Text>
      </Card>
      <Card title="How the daily ring works">
        <Text style={ui.text}>
          The ring averages four goal percentages: steps, water, workout minutes, and sleep. Each is
          capped at 100% so exceeding one goal does not replace another.
        </Text>
        <Text style={ui.muted}>
          Food calories and weight are shown separately; eating more or weighing less does not
          automatically increase the ring.
        </Text>
        <Text style={ui.muted}>
          Water target: {water.ready ? `${water.goalMl} ml` : 'Unavailable'}. Change it in the Home
          water tracker.
        </Text>
      </Card>
    </>
  );
}
