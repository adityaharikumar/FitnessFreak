import { useState } from 'react';
import { Text } from 'react-native';
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
import {
  dayKey,
  foodTotals,
  newId,
  numberInput,
  requireDay,
  requiredText,
} from '@/shared/model/wellness.model';
import type { FoodEntry, Meal } from '@/shared/model/wellness.types';
import { getDailyWorkoutTotals } from '@/features/dashboard/model/dashboard-workouts.model';
import { useDashboardWorkouts } from '@/features/dashboard/hooks/useDashboardWorkouts';
const meals: Meal[] = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
const nutrients = ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar'] as const;
const empty = { name: '', calories: '', protein: '', carbs: '', fat: '', fiber: '', sugar: '' };
export default function NutritionScreen() {
  const s = useWellness(),
    workouts = useDashboardWorkouts();
  const [date, setDate] = useState(dayKey),
    [meal, setMeal] = useState<Meal>('Breakfast'),
    [form, setForm] = useState(empty),
    [editing, setEditing] = useState<string | null>(null),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');
  const totals = foodTotals(s.data.foods, date);
  const exercise = workouts.ready
    ? getDailyWorkoutTotals(workouts.history, new Date(`${date}T12:00:00`)).calories
    : 0;
  const remaining = s.data.goals.calories - totals.calories + exercise;
  function edit(e: FoodEntry) {
    setDate(e.date);
    setMeal(e.meal);
    setEditing(e.id);
    setForm({
      name: e.name,
      calories: String(e.calories),
      protein: String(e.protein),
      carbs: String(e.carbs),
      fat: String(e.fat),
      fiber: String(e.fiber),
      sugar: String(e.sugar),
    });
    setMessage('Editing entry — update the form above.');
  }
  async function save() {
    setError('');
    setMessage('');
    try {
      const values = Object.fromEntries(
        nutrients.map((k) => [
          k,
          numberInput(
            form[k] || (k === 'calories' ? '' : '0'),
            k,
            0,
            k === 'calories' ? 20000 : 2000,
          ),
        ]),
      ) as Pick<FoodEntry, (typeof nutrients)[number]>;
      const entry: FoodEntry = {
        id: editing ?? newId(),
        date: requireDay(date),
        meal,
        name: requiredText(form.name, 'Food name'),
        ...values,
      };
      if (
        await s.update((d) => ({
          ...d,
          foods: [entry, ...d.foods.filter((e) => e.id !== entry.id)],
        }))
      ) {
        setForm(empty);
        setEditing(null);
        setMessage('Meal saved.');
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <Screen
      title="Food & nutrition"
      subtitle="Log portions you ate. Nutrition values are entered manually."
    >
      <Field
        label="Date (YYYY-MM-DD)"
        value={date}
        onChange={(v) => {
          setDate(v);
          setMessage('');
        }}
      />
      {workouts.error && (
        <>
          <ErrorText text={workouts.error} />
          <Button label="Retry workout calories" onPress={workouts.retry} />
        </>
      )}
      <Card title="Daily balance">
        <Text style={ui.big}>{totals.calories.toFixed(0)} kcal eaten</Text>
        <Text style={ui.text}>
          Goal {s.data.goals.calories} • Exercise {workouts.ready ? exercise.toFixed(0) : '—'}
        </Text>
        <Text style={ui.text}>
          {remaining >= 0 ? 'Remaining' : 'Over budget'}:{' '}
          {workouts.ready ? Math.abs(remaining).toFixed(0) : '—'} kcal
        </Text>
        <Text style={ui.muted}>
          Remaining = goal − food + logged exercise. Exercise credit uses workouts completed on the
          selected date.
        </Text>
        <Text style={ui.text}>
          Protein {totals.protein.toFixed(1)} / {s.data.goals.protein} g
        </Text>
        <Text style={ui.muted}>
          Carbs {totals.carbs.toFixed(1)} g • Fat {totals.fat.toFixed(1)} g{'\n'}Fiber{' '}
          {totals.fiber.toFixed(1)} g • Sugar {totals.sugar.toFixed(1)} g
        </Text>
      </Card>
      <Card title={editing ? 'Edit meal entry' : 'Add food'}>
        <Choices items={meals} value={meal} onChange={setMeal} />
        <Field
          label="Food and portion"
          placeholder="Rice, 1 cup"
          value={form.name}
          onChange={(name) => setForm({ ...form, name })}
        />
        {nutrients.map((k) => (
          <Field
            key={k}
            label={`${k[0].toUpperCase() + k.slice(1)} (${k === 'calories' ? 'kcal, required' : 'g, optional'})`}
            numeric
            value={form[k]}
            onChange={(v) => setForm({ ...form, [k]: v })}
          />
        ))}
        <ErrorText text={error} />
        <Button
          label={s.saving ? 'Saving...' : editing ? 'Update meal' : 'Save meal'}
          disabled={s.saving}
          onPress={() => void save()}
        />
        {editing && (
          <Button
            label="Cancel editing"
            secondary
            onPress={() => {
              setEditing(null);
              setForm(empty);
            }}
          />
        )}
        {!!message && (
          <Text accessibilityLiveRegion="polite" style={ui.muted}>
            {message}
          </Text>
        )}
      </Card>
      {meals.map((m) => (
        <Card key={m} title={m}>
          {s.data.foods.filter((e) => e.date === date && e.meal === m).length === 0 ? (
            <Text style={ui.muted}>No entries.</Text>
          ) : (
            s.data.foods
              .filter((e) => e.date === date && e.meal === m)
              .map((e) => (
                <Card key={e.id}>
                  <Text style={ui.text}>{e.name}</Text>
                  <Text style={ui.muted}>
                    {e.calories} kcal • {e.protein} g protein
                  </Text>
                  <Button label="Edit food" secondary onPress={() => edit(e)} />
                  <DeleteButton
                    onDelete={() =>
                      s.update((d) => ({ ...d, foods: d.foods.filter((v) => v.id !== e.id) }))
                    }
                  />
                </Card>
              ))
          )}
        </Card>
      ))}
    </Screen>
  );
}
