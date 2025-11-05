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
import { Volume2 } from 'lucide-react';

export interface Reminder {
  id: string;
  time: string; // HH:mm format
  text: string;
  audioSrc: string;
}

interface ReminderContextType {
  reminders: Reminder[];
  addReminder: (reminder: Reminder) => void;
  removeReminder: (id: string) => void;
}

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

export const ReminderProvider = ({ children }: { children: ReactNode }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [activeReminder, setActiveReminder] = useState<Reminder | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    setIsMounted(true);
    const storedReminders = localStorage.getItem('reminders');
    if (storedReminders) {
      setReminders(JSON.parse(storedReminders));
    }
  }, []);

  useEffect(() => {
    if(isMounted) {
        localStorage.setItem('reminders', JSON.stringify(reminders));
    }
  }, [reminders, isMounted]);

  const addReminder = (reminder: Reminder) => {
    setReminders((prev) => [...prev, reminder]);
  };

  const removeReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    if (activeReminder?.id === id) {
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

    for (const reminder of reminders) {
      const [hours, minutes] = reminder.time.split(':').map(Number);
      const reminderTime = new Date();
      reminderTime.setHours(hours, minutes, 0, 0);

      const timeDiff = reminderTime.getTime() - now.getTime();
      const timeDiffMinutes = Math.ceil(timeDiff / (1000 * 60));

      // Check for main reminder time
      if (reminder.time === currentTime) {
        if (activeReminder?.id !== reminder.id) {
          setActiveReminder(reminder);
          // Auto-remove after 5 minutes to prevent re-triggering
          setTimeout(() => removeReminder(reminder.id), 5 * 60 * 1000);
        }
      }
      // Check for pre-reminders
      else if (timeDiffMinutes > 0 && timeDiffMinutes <= 30 && timeDiffMinutes % 5 === 0) {
         if (activeReminder?.id !== reminder.id) {
          setActiveReminder({ ...reminder, text: `In ${timeDiffMinutes} minutes: ${reminder.text}` });
        }
      }
    }
  }, [reminders, activeReminder, removeReminder]);

  useEffect(() => {
    const interval = setInterval(checkReminders, 60 * 1000); // Check every minute
    return () => clearInterval(interval);
  }, [checkReminders]);

  const onDismiss = () => {
    if (activeReminder) {
        // If it was the main reminder, remove it. If a pre-reminder, just hide the dialog.
        const [hours, minutes] = activeReminder.time.split(':').map(Number);
        const reminderTime = new Date();
        reminderTime.setHours(hours, minutes, 0, 0);
        const timeDiffMinutes = Math.ceil((reminderTime.getTime() - new Date().getTime()) / (1000 * 60));
        
        if (timeDiffMinutes <= 1) {
            removeReminder(activeReminder.id);
        }
    }
    setActiveReminder(null);
  };


  return (
    <ReminderContext.Provider value={{ reminders, addReminder, removeReminder }}>
      {children}
      {activeReminder && (
         <AlertDialog open={!!activeReminder} onOpenChange={() => onDismiss()}>
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
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onDismiss}>{t('reminders.dismiss')}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => playAudio(activeReminder.audioSrc)}>{t('reminders.playAudio')}</AlertDialogAction>
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
