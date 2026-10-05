import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useHydration } from '../hooks/useHydration';
import { isValidGoal } from '../hydration.model';
import { colors } from '@/theme/colors';

export default function WaterTrackerCard() {
  const water = useHydration();
  const [editing, setEditing] = useState(false);
  const [goalText, setGoalText] = useState('');
  const [goalError, setGoalError] = useState('');
  const disabled = water.loading || water.saving || !water.ready;

  async function saveGoal() {
    const goal = Number(goalText.trim());
    if (!isValidGoal(goal)) {
      setGoalError('Enter a whole number from 250 to 10,000 ml.');
      return;
    }
    if (await water.setGoal(goal)) setEditing(false);
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Water tracker</Text>
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          style={styles.smallButton}
          onPress={() => {
            setGoalText(String(water.goalMl));
            setGoalError('');
            setEditing(true);
          }}
        >
          <Text style={[styles.link, disabled && styles.disabled]}>Edit goal</Text>
        </Pressable>
      </View>
      <Text style={styles.subtitle}>Today&apos;s intake · {water.today}</Text>
      {water.loading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : (
        <Text accessibilityLiveRegion="polite" testID="water-total" style={styles.amount}>
          {water.ready ? water.totalMl.toLocaleString() : '—'}
          <Text style={styles.goal}> / {water.goalMl.toLocaleString()} ml</Text>
        </Text>
      )}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${water.progress}%` }]} />
      </View>
      <Text style={styles.subtitle}>
        {water.saving
          ? 'Saving…'
          : water.totalMl >= water.goalMl
            ? 'Daily goal reached'
            : `${Math.max(0, water.goalMl - water.totalMl).toLocaleString()} ml to your goal`}
      </Text>
      {water.error && (
        <View accessibilityLiveRegion="polite">
          <Text style={styles.error}>{water.error}</Text>
          {!water.ready && (
            <Pressable
              accessibilityRole="button"
              onPress={() => void water.retryLoad()}
              style={styles.smallButton}
            >
              <Text style={styles.link}>Retry loading</Text>
            </Pressable>
          )}
        </View>
      )}
      <View style={styles.actions}>
        {[250, 500].map((amount) => (
          <Pressable
            key={amount}
            accessibilityRole="button"
            accessibilityLabel={`Add ${amount} milliliters of water`}
            disabled={disabled}
            onPress={() => void water.addWater(amount)}
            style={({ pressed }) => [
              styles.addButton,
              disabled && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.addButtonText}>+{amount} ml</Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        disabled={!water.canUndo}
        onPress={() => void water.undoLastEntry()}
        style={({ pressed }) => [
          styles.undoButton,
          !water.canUndo && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.subtitle}>Undo last entry</Text>
      </Pressable>
      {editing && (
        <View style={styles.editor}>
          <Text style={styles.subtitle}>Daily goal in milliliters</Text>
          <TextInput
            accessibilityLabel="Daily water goal in milliliters"
            keyboardType="number-pad"
            value={goalText}
            onChangeText={(value) => {
              setGoalText(value);
              setGoalError('');
            }}
            editable={!disabled}
            style={styles.input}
          />
          {!!goalError && <Text style={styles.error}>{goalError}</Text>}
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              disabled={disabled}
              onPress={() => void saveGoal()}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>Save goal</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setEditing(false)}
              style={styles.undoButton}
            >
              <Text style={styles.subtitle}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}
      <Text style={styles.logHeading}>Today&apos;s entries</Text>
      {water.ready && water.todayEntries.length === 0 && (
        <Text style={styles.subtitle}>No water logged yet.</Text>
      )}
      {water.todayEntries
        .slice(-5)
        .reverse()
        .map((entry) => (
          <View key={entry.id} style={styles.logRow}>
            <Text style={styles.logAmount}>+{entry.amountMl} ml</Text>
            <Text style={styles.subtitle}>
              {new Date(entry.recordedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        ))}
      {water.todayEntries.length > 5 && (
        <Text style={styles.subtitle}>
          Showing latest 5 of {water.todayEntries.length} entries.
        </Text>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: 6 },
  amount: { fontSize: 32, fontWeight: '800', color: colors.text, marginTop: 18 },
  goal: { fontSize: 16, fontWeight: '400', color: colors.muted },
  track: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.track,
    overflow: 'hidden',
    marginTop: 16,
  },
  fill: { height: '100%', borderRadius: 5, backgroundColor: colors.accent },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  addButton: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 12,
    backgroundColor: colors.accent,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: { color: colors.background, fontSize: 16, fontWeight: '700' },
  undoButton: {
    minHeight: 44,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 },
  link: { color: colors.accent, fontSize: 14 },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.7 },
  loader: { marginTop: 20 },
  error: { color: colors.error, marginTop: 12 },
  editor: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 },
  input: {
    minHeight: 48,
    color: colors.text,
    borderColor: colors.muted,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
  logHeading: { color: colors.text, fontSize: 15, fontWeight: '600', marginTop: 12 },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  logAmount: { color: colors.text },
});
