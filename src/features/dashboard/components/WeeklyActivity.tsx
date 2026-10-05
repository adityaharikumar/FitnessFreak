import { colors } from '@/theme/colors';
import { StyleSheet, Text, View } from 'react-native';

const weeklySteps = [
  { day: 'M', steps: 6000 },
  { day: 'T', steps: 8500 },
  { day: 'W', steps: 10500 },
  { day: 'T', steps: 6500 },
  { day: 'F', steps: 7200 },
  { day: 'S', steps: 4200 },
  { day: 'S', steps: 5800 },
];

const chartHeight = 120;
const maximumSteps = 12000;

export default function WeeklyActivity() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>This week</Text>
        <Text style={styles.subtitle}>Sample steps</Text>
      </View>

      <View style={styles.chart}>
        <View style={styles.axis}>
          <Text style={styles.axisLabel}>12K</Text>
          <Text style={styles.axisLabel}>8K</Text>
          <Text style={styles.axisLabel}>4K</Text>
          <Text style={styles.axisLabel}>0</Text>
        </View>

        <View style={styles.plot}>
          <View style={styles.gridLines}>
            {[0, 1, 2, 3].map((line) => (
              <View key={line} style={styles.gridLine} />
            ))}
          </View>

          <View style={styles.bars}>
            {weeklySteps.map((item, index) => {
              const height = Math.min(item.steps / maximumSteps, 1) * chartHeight;

              return (
                <View
                  key={index}
                  style={styles.barColumn}
                  accessibilityLabel={`Day ${index + 1}: ${item.steps} steps`}
                >
                  <View style={[styles.bar, { height }]} />
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.dayLabels}>
        {weeklySteps.map((item, index) => (
          <Text key={index} style={styles.dayLabel}>
            {item.day}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.muted,
  },
  chart: {
    flexDirection: 'row',
    height: chartHeight,
  },
  axis: {
    width: 34,
    justifyContent: 'space-between',
  },
  axisLabel: {
    fontSize: 11,
    color: colors.muted,
  },
  plot: {
    flex: 1,
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: colors.track,
  },
  bars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 20,
    backgroundColor: colors.accent,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  dayLabels: {
    flexDirection: 'row',
    marginLeft: 34,
    marginTop: 10,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: colors.muted,
  },
});
