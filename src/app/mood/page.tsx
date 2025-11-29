'use client';
import MoodTracker from '@/components/mood/mood-tracker';
import { useLocale } from '@/hooks/use-locale';

export default function MoodPage() {
  const { t } = useLocale();
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t('mood.title')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('mood.description')}
        </p>
      </header>
      <MoodTracker />
    </div>
  );
}
