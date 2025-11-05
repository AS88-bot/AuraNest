'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLocale } from './use-locale';
import { Volume2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Reminder {
  id: string;
  time: string; // HH:mm format
  text: string;
  audioSrc: string;
  state: 'active' | 'snoozed' | 'completed';
  snoozeUntil?: number; // Timestamp until which it is snoozed
}

interface ReminderContextType {
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'state'>) => void;
  removeReminder: (id: string) => void;
  activeReminder: Reminder | null;
  completeActiveReminder: () => void;
}

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

const SNOOZE_DURATION = 5 * 60 * 1000; // 5 minutes

export const ReminderProvider = ({ children }: { children: ReactNode }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [activeReminder, setActiveReminder] = useState<Reminder | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    setIsMounted(true);
    const storedReminders = localStorage.getItem('reminders');
    if (storedReminders) {
      // Ensure all reminders from storage have a valid state
      const parsedReminders: Reminder[] = JSON.parse(storedReminders).map((r: any) => ({
        ...r,
        state: r.state || 'active',
      }));
      setReminders(parsedReminders);
    }
  }, []);

  useEffect(() => {
    if(isMounted) {
        localStorage.setItem('reminders', JSON.stringify(reminders));
    }
  }, [reminders, isMounted]);

  const addReminder = (reminder: Omit<Reminder, 'state'>) => {
    const newReminder: Reminder = { ...reminder, state: 'active' };
    setReminders((prev) => [...prev, newReminder]);
  };

  const removeReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    if (activeReminder?.id === id) {
      setActiveReminder(null);
    }
  };

  const completeActiveReminder = () => {
    if (activeReminder) {
      setReminders(prev => prev.map(r => r.id === activeReminder.id ? { ...r, state: 'completed' } : r));
      setActiveReminder(null);
    }
  };

  const snoozeActiveReminder = () => {
    if (activeReminder) {
      const snoozeUntil = Date.now() + SNOOZE_DURATION;
      setReminders(prev => prev.map(r => r.id === activeReminder.id ? { ...r, state: 'snoozed', snoozeUntil } : r));
      setActiveReminder(null);
    }
  };

  const playAudio = (src: string) => {
    const audio = new Audio(src);
    audio.play();
  };

  const checkReminders = useCallback(() => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    if (activeReminder) return; // Don't show a new reminder if one is already active

    for (const reminder of reminders) {
      if (reminder.state === 'completed') continue;

      if (reminder.state === 'snoozed' && reminder.snoozeUntil && reminder.snoozeUntil > Date.now()) {
        continue;
      }

      const [hours, minutes] = reminder.time.split(':').map(Number);
      const reminderTime = new Date();
      reminderTime.setHours(hours, minutes, 0, 0);

      // Check for main reminder time
      if (reminder.time === currentTime) {
          setActiveReminder(reminder);
          break; // Show first due reminder
      }
      // Check for pre-reminders
      else {
        const timeDiffMinutes = Math.ceil((reminderTime.getTime() - now.getTime()) / (1000 * 60));
        if (timeDiffMinutes > 0 && timeDiffMinutes <= 30) {
            setActiveReminder({ ...reminder, text: `${t('reminders.inTime', { time: timeDiffMinutes })}: ${reminder.text}` });
            break;
        }
      }
    }
  }, [reminders, activeReminder, t]);

  useEffect(() => {
    const interval = setInterval(checkReminders, 15 * 1000); // Check every 15 seconds
    return () => clearInterval(interval);
  }, [checkReminders]);


  return (
    <ReminderContext.Provider value={{ reminders, addReminder, removeReminder, activeReminder, completeActiveReminder }}>
      {children}
      {activeReminder && (
         <AlertDialog open={!!activeReminder} onOpenChange={() => snoozeActiveReminder()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-2xl">
                    <Volume2 className="h-8 w-8 text-primary" />
                    {t('reminders.notificationTitle')}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-lg pt-4">
                    {activeReminder.text}
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className='sm:justify-between'>
                    <Button variant="outline" onClick={() => playAudio(activeReminder.audioSrc)}>{t('reminders.playAudio')}</Button>
                    <div className='flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2'>
                        <AlertDialogCancel onClick={() => snoozeActiveReminder()}>{t('reminders.snooze')}</AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <Button onClick={completeActiveReminder}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {t('reminders.markAsDone')}
                            </Button>
                        </AlertDialogAction>
                    </div>
                </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      )}
    </ReminderContext.Provider>
  );
};

export const useReminders = (): ReminderContextType => {
  const context = useContext(ReminderContext);
  if (context === undefined) {
    throw new Error('useReminders must be used within a ReminderProvider');
  }
  return context;
};
