import { colors } from '@/theme/colors';
import { StyleSheet, Text, View } from 'react-native';

type MetricCardProps = {
  icon: string;
  label: string;
  value: string;
  unit: string;
  color?: string;
  progress?: number;
};

export default function MetricCard({
  icon,
  label,
  value,
  unit,
  color = colors.accent,
  progress,
}: MetricCardProps) {
  const percentage =
    progress !== undefined && Number.isFinite(progress)
      ? Math.min(100, Math.max(0, progress))
      : undefined;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{icon}</Text>
        </View>

        <View style={styles.details}>
          <Text style={styles.label}>{label}</Text>

          <Text style={styles.value}>
            {value}
            <Text style={styles.unit}> {unit}</Text>
          </Text>
        </View>
      </View>

      {percentage !== undefined && (
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${percentage}%`,
                backgroundColor: color,
              },
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#26313D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  icon: {
    fontSize: 19,
  },
  details: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 5,
  },
  value: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.text,
  },
  unit: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.muted,
  },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.track,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});
