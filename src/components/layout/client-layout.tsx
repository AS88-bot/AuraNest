'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from '@/components/ui/toaster';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout>
      {children}
      <Toaster />
    </AppLayout>
  );
}
