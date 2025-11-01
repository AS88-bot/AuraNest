'use client';
import JournalForm from '@/components/journal/journal-form';
import { useLocale } from '@/hooks/use-locale';

export default function JournalPage() {
  const { t } = useLocale();
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t('journal.title')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('journal.description')}
        </p>
      </header>
      <JournalForm />
    </div>
  );
}
