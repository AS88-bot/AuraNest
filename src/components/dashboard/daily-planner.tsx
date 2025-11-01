'use client';

import { useState } from 'react';
import { dailySchedule as initialSchedule } from '@/lib/data';
import PlannerItem from './planner-item';
import { type PlannerItem as PlannerItemType } from '@/lib/types';
import { Button } from '../ui/button';
import { FilePen, Save } from 'lucide-react';
import { EditPlannerSheet } from './edit-planner-sheet';

export default function DailyPlanner() {
  const [schedule, setSchedule] = useState<PlannerItemType[]>(initialSchedule);
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = (updatedItem: PlannerItemType) => {
    setSchedule((prevSchedule) =>
      prevSchedule.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <EditPlannerSheet
          schedule={schedule}
          onUpdate={handleUpdate}
          onSave={() => setIsEditing(false)}
        />
      </div>
      {schedule.map((item) => (
        <PlannerItem key={item.id} item={item} />
      ))}
    </div>
  );
}
