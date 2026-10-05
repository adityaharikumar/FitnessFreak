import { colors } from '@/theme/colors';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type ProgressRingProps = {
  progress: number;
};

export default function ProgressRing({ progress }: ProgressRingProps) {
  const size = 160;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;

  const percentage = Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) : 0;

  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);

  return (
    <View style={styles.container} accessibilityLabel={`Daily goal ${percentage}% completed`}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.track}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {percentage > 0 && (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.accent}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
          />
        )}
      </Svg>

      <View style={styles.label}>
        <Text style={styles.percentage}>{percentage}%</Text>
        <Text style={styles.description}>Daily goal</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.text,
  },
  description: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 4,
  },
});
