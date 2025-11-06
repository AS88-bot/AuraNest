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
      id: `reminder-${reminder.id}`,
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
      const timeA = new Date(`1970-01-01 ${a.time.replace(' AM', '').replace(' PM', '')}`);
      const timeB = new Date(`1970-01-01 ${b.time.replace(' AM', '').replace(' PM', '')}`);
      if (a.time.includes('PM') && !a.time.includes('12:')) timeA.setHours(timeA.getHours() + 12);
      if (b.time.includes('PM') && !b.time.includes('12:')) timeB.setHours(timeB.getHours() + 12);
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
