import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { StrengthSet } from '../types/strength.types';

type SetValues = {
  reps: number | null;
  weightKg: number | null;
};

type StrengthSetRowProps = {
  set: StrengthSet;
  number: number;
  onSave: (values: SetValues) => boolean | Promise<boolean>;
  disabled?: boolean;
  onToggleCompleted: () => void;
};

export function StrengthSetRow({
  set,
  number,
  onSave,
  onToggleCompleted,
  disabled = false,
}: StrengthSetRowProps) {
  const [repsText, setRepsText] = useState(() => (set.reps === null ? '' : String(set.reps)));

  const [weightText, setWeightText] = useState(() =>
    set.weightKg === null ? '' : String(set.weightKg),
  );

  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const hasPendingChanges =
    repsText !== (set.reps === null ? '' : String(set.reps)) ||
    weightText !== (set.weightKg === null ? '' : String(set.weightKg));

  const canComplete = !hasPendingChanges && set.reps !== null && set.weightKg !== null;

  async function handleSave() {
    const repsInput = repsText.trim();
    const weightInput = weightText.trim().replace(',', '.');

    const reps = Number(repsInput);
    const weightKg = Number(weightInput);

    if (!/^\d+$/.test(repsInput) || !Number.isSafeInteger(reps) || reps <= 0) {
      setError('Enter a positive whole number for reps.');
      return;
    }

    if (
      !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(weightInput) ||
      !Number.isFinite(weightKg) ||
      weightKg < 0
    ) {
      setError('Enter a weight of zero or greater.');
      return;
    }

    if (await onSave({ reps, weightKg })) {
      setRepsText(String(reps));
      setWeightText(String(weightKg));
      setError('');
      setSaved(true);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Set {number}</Text>

      <View style={styles.fields}>
        <View style={styles.field}>
          <Text style={styles.label}>Reps</Text>

          <TextInput
            accessibilityLabel={`Set ${number} reps`}
            editable={!set.completed && !disabled}
            value={repsText}
            onChangeText={(text) => {
              setRepsText(text);
              setSaved(false);
              setError('');
            }}
            keyboardType="number-pad"
            placeholder="10"
            placeholderTextColor="#82958B"
            maxLength={6}
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Weight (kg)</Text>

          <TextInput
            accessibilityLabel={`Set ${number} weight in kilograms`}
            value={weightText}
            editable={!set.completed && !disabled}
            onChangeText={(text) => {
              setWeightText(text);
              setSaved(false);
              setError('');
            }}
            keyboardType="decimal-pad"
            placeholder="50"
            placeholderTextColor="#82958B"
            maxLength={10}
            style={styles.input}
          />
        </View>
      </View>

      {error !== '' && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}

      {!set.completed && (
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={() => void handleSave()}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {saved && !hasPendingChanges ? 'Set updated' : 'Update set'}
          </Text>
        </Pressable>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{
          disabled: disabled || (!set.completed && !canComplete),
        }}
        disabled={disabled || (!set.completed && !canComplete)}
        onPress={onToggleCompleted}
        style={[
          styles.button,
          {
            backgroundColor: set.completed ? '#36483F' : '#C8F169',
            opacity: !set.completed && !canComplete ? 0.45 : 1,
          },
        ]}
      >
        <Text style={[styles.buttonText, { color: set.completed ? '#FFFFFF' : '#101513' }]}>
          {set.completed ? 'Undo completion' : 'Mark completed'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#36483F',
  },
  heading: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 12,
  },
  fields: {
    flexDirection: 'row',
    gap: 12,
  },
  field: {
    flex: 1,
  },
  label: {
    color: '#AAB8B1',
    marginBottom: 6,
  },
  input: {
    color: '#FFFFFF',
    backgroundColor: '#101513',
    borderWidth: 1,
    borderColor: '#36483F',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  button: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#C8F169',
    alignItems: 'center',
  },
  buttonText: {
    color: '#101513',
    fontWeight: '700',
  },
  error: {
    color: '#FF6B6B',
    marginTop: 8,
  },
});
