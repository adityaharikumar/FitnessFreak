import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import ProgressRing from '@/components/ProgressRing';
import MetricCard from '../components/MetricCard';
import WeeklyActivity from '../components/WeeklyActivity';
import WaterTrackerCard from '@/features/hydration/components/WaterTrackerCard';
import { useHydration } from '@/features/hydration/hooks/useHydration';
import { colors } from '@/theme/colors';

export default function HomeScreen() {
  const water = useHydration();
  const now = new Date();
  const greeting =
    now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const today = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topRow}>
          <Text style={styles.logo}>
            FITNESS<Text style={styles.logoAccent}>FREAK</Text>
          </Text>
          <Ionicons name="fitness-outline" color={colors.accent} size={26} />
        </View>
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>{greeting}, Aditya 👋</Text>
          <Text style={styles.date}>{today}</Text>
        </View>
        <View style={styles.activityCard}>
          <Text style={styles.activityTitle}>Today&apos;s activity</Text>
          <Text style={styles.activitySubtitle}>Great pace — keep it going</Text>
          <View style={styles.ringContainer}>
            <ProgressRing progress={72} />
          </View>
          <Text style={styles.demoNote}>
            Activity, nutrition and body metrics are sample data. Water uses your saved entries.
          </Text>
        </View>
        <View style={styles.metricsGrid}>
          <MetricCard icon="👟" label="Steps" value="7,842" unit="/ 10,000" progress={78.42} />
          <MetricCard icon="🔥" label="Calories burned" value="486" unit="kcal" />
          <MetricCard icon="🍴" label="Calorie intake" value="1,650" unit="kcal" />
          <MetricCard icon="🏋️" label="Workout" value="42" unit="min" />
          <MetricCard icon="📍" label="Distance" value="5.6" unit="km" />
          <MetricCard
            icon="💧"
            label="Water"
            value={water.ready ? (water.totalMl / 1000).toFixed(2) : '—'}
            unit={`/ ${water.goalMl / 1000} L`}
            progress={water.progress}
          />
          <MetricCard icon="🌙" label="Sleep" value="7h 20m" unit="" />
          <MetricCard icon="⚖️" label="Weight" value="72.4" unit="kg" />
        </View>
        <WaterTrackerCard />
        <WeeklyActivity />
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: 24, fontWeight: '900', color: colors.text, letterSpacing: 1 },
  logoAccent: { color: colors.accent },
  greeting: { marginTop: 24 },
  greetingText: { fontSize: 24, fontWeight: '700', color: colors.text },
  date: { fontSize: 16, color: colors.muted, marginTop: 6 },
  activityCard: {
    backgroundColor: colors.activity,
    borderRadius: 22,
    padding: 20,
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityTitle: { fontSize: 25, fontWeight: '700', color: colors.text },
  activitySubtitle: { fontSize: 15, color: colors.muted, marginTop: 8 },
  ringContainer: { alignItems: 'center', marginTop: 20 },
  demoNote: { fontSize: 12, color: colors.muted, marginTop: 16, lineHeight: 18 },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});
