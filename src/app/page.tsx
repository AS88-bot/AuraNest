'use client';
import DailyPlanner from '@/components/dashboard/daily-planner';
import { useLocale } from '@/hooks/use-locale';

export default function Home() {
  const { t } = useLocale();
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t('dashboard.title')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('dashboard.description')}
        </p>
      </header>
      <DailyPlanner />
    </div>
  );
}
