'use client';

import { useState, useEffect } from 'react';
import { dailySchedule as initialSchedule } from '@/lib/data';
import PlannerItem from './planner-item';
import { type PlannerItem as PlannerItemType, type IconName } from '@/lib/types';
import { EditPlannerSheet } from './edit-planner-sheet';
import { useLocale } from '@/hooks/use-locale';
import { useReminders } from '@/hooks/use-reminders';
import React from 'react';

// A robust function to parse time strings (e.g., "08:00 AM" or "14:30") into a comparable number.
const parseTime = (timeStr: string): number => {
    // Handle 24-hour format (e.g., "06:00")
    if (/^\d{2}:\d{2}$/.test(timeStr)) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    // Handle 12-hour format (e.g., "08:00 AM")
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return 24 * 60; // Put invalid times at the end

    let [hours, minutes] = [parseInt(match[1]), parseInt(match[2])];
    const period = match[3].toUpperCase();

    if (period === 'PM' && hours !== 12) {
        hours += 12;
    }
    if (period === 'AM' && hours === 12) {
        hours = 0; // Midnight case
    }
    return hours * 60 + minutes;
};


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
      time: reminder.time, // The time is in HH:mm format
      titleKey: reminder.text, // Use text directly as titleKey for custom reminders
      descriptionKey: t('reminders.notificationTitle'), // Generic description
      category: 'activity', 
      icon: 'Bell' as IconName,
      isCompleted: reminder.state === 'completed',
    }));

    const allItems = [...staticScheduleItems, ...reminderItems];

    // Sort by time using the new robust parser
    allItems.sort((a, b) => {
        const timeA = parseTime(a.time);
        const timeB = parseTime(b.time);
        return timeA - timeB;
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
