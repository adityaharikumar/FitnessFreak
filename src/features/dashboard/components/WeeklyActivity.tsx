import { useWellness } from '@/shared/providers/WellnessProvider';
import { Bars, Card } from '@/shared/components/TrackerUI';
import { lastDays } from '@/shared/model/wellness.model';
export default function WeeklyActivity() {
  const s = useWellness();
  return (
    <Card title="Steps · last 7 days">
      <Bars
        points={lastDays(7).map((date) => ({
          label: date.slice(5),
          value: s.data.activity.find((e) => e.date === date)?.steps ?? 0,
        }))}
        unit="steps"
      />
    </Card>
  );
}
