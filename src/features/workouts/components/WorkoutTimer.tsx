import { useEffect, useState } from 'react';
import {
  AppState,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type WorkoutTimerProps = {
  startTime: string;
};

export function WorkoutTimer({
  startTime,
}: WorkoutTimerProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    const subscription = AppState.addEventListener(
      'change',
      (state) => {
        if (state === 'active') {
          setNow(Date.now());
        }
      },
    );

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  const startedAt = Date.parse(startTime);

  const elapsedSeconds = Number.isFinite(startedAt)
    ? Math.max(0, Math.floor((now - startedAt) / 1000))
    : 0;

  const hours = String(
    Math.floor(elapsedSeconds / 3600),
  ).padStart(2, '0');

  const minutes = String(
    Math.floor((elapsedSeconds % 3600) / 60),
  ).padStart(2, '0');

  const seconds = String(
    elapsedSeconds % 60,
  ).padStart(2, '0');

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Elapsed time</Text>

      <Text style={styles.time}>
        {hours}:{minutes}:{seconds}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 18,
    borderRadius: 14,
    backgroundColor: '#101513',
    alignItems: 'center',
  },
  label: {
    color: '#AAB8B1',
    fontSize: 14,
    marginBottom: 8,
  },
  time: {
    color: '#C8F169',
    fontSize: 36,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
});