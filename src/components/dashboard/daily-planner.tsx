import { dailySchedule } from '@/lib/data';
import PlannerItem from './planner-item';

export default function DailyPlanner() {
  const schedule = dailySchedule;

  return (
    <div className="space-y-4">
      {schedule.map((item) => (
        <PlannerItem key={item.id} item={item} />
      ))}
    </div>
  );
}
