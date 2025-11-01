'use client';

import MapView from '@/components/location/map-view';
import { useLocale } from '@/hooks/use-locale';

export default function LocationPage() {
  const { t } = useLocale();
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t('location.title')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('location.description')}
        </p>
      </header>
      <MapView />
    </div>
  );
}
