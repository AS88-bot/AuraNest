'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from '@/components/ui/toaster';
import { ReminderProvider } from '@/hooks/use-reminders';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The AppLayout component now handles routing logic based on auth state.
  return (
    <ReminderProvider>
      <AppLayout>
        {children}
        <Toaster />
      </AppLayout>
    </ReminderProvider>
  );
}
