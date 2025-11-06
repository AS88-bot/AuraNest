'use client';

import { useState, useEffect } from 'react';
import { dailySchedule as initialSchedule } from '@/lib/data';
import PlannerItem from './planner-item';
import { type PlannerItem as PlannerItemType, type IconName } from '@/lib/types';
import { EditPlannerSheet } from './edit-planner-sheet';
import { useLocale } from '@/hooks/use-locale';
import { useReminders } from '@/hooks/use-reminders';

export default function DailyPlanner() {
  const [schedule, setSchedule] = useState<Omit<PlannerItemType, 'onUpdate'>[]>(initialSchedule);
  const [isEditing, setIsEditing] = useState(false);
  const { t } = useLocale();
  const { reminders } = useReminders();
  const [combinedSchedule, setCombinedSchedule] = useState<PlannerItemType[]>([]);

  useEffect(() => {
    const staticScheduleItems: PlannerItemType[] = schedule.map(item => ({
      ...item,
      isCompleted: item.isCompleted || false,
    }));

    const reminderItems: PlannerItemType[] = reminders.map(reminder => ({
      id: reminder.id, // Use the reminder's own id
      time: reminder.time,
      titleKey: reminder.text, // Use text directly as titleKey for custom reminders
      descriptionKey: t('reminders.notificationTitle'), // Generic description
      category: 'activity', 
      icon: 'Bell' as IconName,
      isCompleted: reminder.state === 'completed',
    }));

    const allItems = [...staticScheduleItems, ...reminderItems];

    // Sort by time
    allItems.sort((a, b) => {
      const timeA = new Date(`1970-01-01T${a.time.replace(/ AM| PM/i, '')}:00`);
      const timeB = new Date(`1970-01-01T${b.time.replace(/ AM| PM/i, '')}:00`);

      if (a.time.match(/pm/i) && !a.time.match(/12:/i)) timeA.setHours(timeA.getHours() + 12);
      if (b.time.match(/pm/i) && !b.time.match(/12:/i)) timeB.setHours(timeB.getHours() + 12);
      if (a.time.match(/am/i) && a.time.match(/12:/i)) timeA.setHours(timeA.getHours() - 12);
      if (b.time.match(/am/i) && b.time.match(/12:/i)) timeB.setHours(timeB.getHours() - 12);
      
      return timeA.getTime() - timeB.getTime();
    });

    setCombinedSchedule(allItems);

  }, [schedule, reminders, t]);

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
          triggerText={t('dashboard.editPlan')}
        />
      </div>
      {combinedSchedule.map((item) => (
        <PlannerItem key={item.id} item={item} />
      ))}
    </div>
  );
}
