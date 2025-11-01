'use client';
import CaregiverDashboard from '@/components/caregiver/caregiver-dashboard';
import { useLocale } from '@/hooks/use-locale';

export default function CaregiverPage() {
  const { t } = useLocale();
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t('caregiver.title')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('caregiver.description')}
        </p>
      </header>
      <CaregiverDashboard />
    </div>
  );
}
