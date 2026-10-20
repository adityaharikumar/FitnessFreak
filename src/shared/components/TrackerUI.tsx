import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { useWellness } from '../providers/WellnessProvider';
export function Screen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const s = useWellness();
  return (
    <SafeAreaView style={ui.root} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={ui.page}>
          <Text style={ui.title}>{title}</Text>
          {subtitle && <Text style={ui.muted}>{subtitle}</Text>}
          {s.loading && (
            <ActivityIndicator color={colors.accent} accessibilityLabel="Loading saved entries" />
          )}
          {!!s.error && <ErrorText text={s.error} />}
          {!s.ready && !s.loading && <Button label="Retry loading" onPress={s.retry} />}
          {s.ready && children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <View style={ui.card}>
      {title && <Text style={ui.heading}>{title}</Text>}
      {children}
    </View>
  );
}
export function Button({
  label,
  onPress,
  disabled = false,
  secondary = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[ui.button, secondary && ui.secondary, disabled && { opacity: 0.45 }]}
    >
      <Text style={[ui.buttonText, secondary && { color: colors.accent }]}>{label}</Text>
    </Pressable>
  );
}
export function Field({
  label,
  value,
  onChange,
  numeric = false,
  placeholder = '',
  multiline = false,
  editable = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  numeric?: boolean;
  placeholder?: string;
  multiline?: boolean;
  editable?: boolean;
}) {
  return (
    <View style={ui.field}>
      <Text style={ui.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        keyboardType={numeric ? 'decimal-pad' : 'default'}
        autoCapitalize="none"
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        multiline={multiline}
        editable={editable}
        maxLength={multiline ? 1000 : 120}
        style={[ui.input, multiline && { minHeight: 80 }]}
      />
    </View>
  );
}
export function Choices<T extends string>({
  items,
  value,
  onChange,
}: {
  items: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={ui.wrap}>
      {items.map((item) => (
        <Pressable
          key={item}
          accessibilityRole="button"
          accessibilityState={{ selected: item === value }}
          onPress={() => onChange(item)}
          style={[ui.chip, item === value && ui.selected]}
        >
          <Text style={{ color: item === value ? colors.background : colors.text }}>{item}</Text>
        </Pressable>
      ))}
    </View>
  );
}
export function ErrorText({ text }: { text: string }) {
  return text ? (
    <Text accessibilityRole="alert" style={ui.error}>
      {text}
    </Text>
  ) : null;
}
export function DeleteButton({
  onDelete,
  label = 'Delete entry',
}: {
  onDelete: () => Promise<unknown>;
  label?: string;
}) {
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  return confirm ? (
    <View>
      <Text style={ui.muted}>Delete this saved entry?</Text>
      <View style={ui.wrap}>
        <Button label="Keep" secondary disabled={busy} onPress={() => setConfirm(false)} />
        <Button
          label={busy ? 'Deleting...' : 'Confirm delete'}
          disabled={busy}
          onPress={() => {
            setBusy(true);
            void onDelete().finally(() => {
              setBusy(false);
              setConfirm(false);
            });
          }}
        />
      </View>
    </View>
  ) : (
    <Button label={label} secondary onPress={() => setConfirm(true)} />
  );
}
export function Bars({
  points,
  unit,
}: {
  points: { label: string; value: number }[];
  unit: string;
}) {
  const max = Math.max(1, ...points.map((p) => p.value));
  return (
    <View>
      <View style={ui.chart}>
        {points.map((p, i) => (
          <View
            key={`${p.label}-${i}`}
            style={ui.column}
            accessibilityLabel={`${p.label}: ${p.value.toFixed(1)} ${unit}`}
          >
            <Text style={ui.chartValue}>{Number(p.value.toFixed(1))}</Text>
            <View style={[ui.bar, { height: (p.value / max) * 90 }]} />
            <Text style={ui.chartLabel}>{p.label}</Text>
          </View>
        ))}
      </View>
      {points.every((p) => p.value === 0) && (
        <Text style={ui.muted}>No entries in this period.</Text>
      )}
    </View>
  );
}
export const ui = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  page: {
    padding: 20,
    paddingBottom: 40,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    gap: 16,
  },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  heading: { fontSize: 19, fontWeight: '700', color: colors.accent, marginBottom: 12 },
  muted: { fontSize: 14, color: colors.muted, lineHeight: 21 },
  text: { fontSize: 15, color: colors.text, lineHeight: 23 },
  card: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  field: { gap: 7, marginBottom: 8 },
  label: { color: colors.text, fontSize: 14 },
  input: {
    borderRadius: 12,
    padding: 13,
    minHeight: 46,
    color: colors.text,
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    fontSize: 16,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    marginVertical: 4,
    minHeight: 46,
  },
  buttonText: { color: colors.background, fontWeight: '700', fontSize: 14 },
  secondary: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  chip: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  selected: { backgroundColor: colors.accent },
  error: { color: colors.error, lineHeight: 21, marginVertical: 8 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 5, paddingTop: 10 },
  column: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', minWidth: 0 },
  bar: {
    width: '65%',
    maxWidth: 35,
    backgroundColor: colors.accent,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  chartValue: { color: colors.text, fontSize: 10, marginBottom: 5 },
  chartLabel: { color: colors.muted, fontSize: 10, marginTop: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  big: { fontSize: 30, fontWeight: '800', color: colors.text },
});
