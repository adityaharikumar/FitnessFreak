import { Pressable, StyleSheet, Text } from 'react-native';
import type { WorkoutType } from '../types/workout.types';

type WorkoutTypeCardProps = {
  type: WorkoutType;
  selected: boolean;
  onPress: () => void;
};

const workoutLabels: Record<WorkoutType, string> = {
  walking: 'Walking',
  running: 'Running',
  cycling: 'Cycling',
  gym: 'Gym',
  yoga: 'Yoga',
  swimming: 'Swimming',
  hiit: 'HIIT',
  sports: 'Sports',
};

const workoutIcons: Record<WorkoutType, string> = {
  walking: '🚶',
  running: '🏃',
  cycling: '🚴',
  gym: '🏋️',
  yoga: '🧘',
  swimming: '🏊',
  hiit: '🔥',
  sports: '⚽',
};

export function WorkoutTypeCard({
  type,
  selected,
  onPress,
}: WorkoutTypeCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected && styles.selectedCard]}
    >
      <Text style={styles.icon}>{workoutIcons[type]}</Text>
      <Text style={[styles.label, selected && styles.selectedLabel]}>
        {workoutLabels[type]}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '22%',
    minHeight: 88,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#18221F',
    borderWidth: 1,
    borderColor: '#26332E',
  },
  selectedCard: {
    backgroundColor: '#C8F169',
    borderColor: '#C8F169',
  },
  icon: {
    fontSize: 26,
    marginBottom: 8,
  },
  label: {
    color: '#AAB8B1',
    fontSize: 12,
    fontWeight: '600',
  },
  selectedLabel: {
    color: '#101513',
  },
});