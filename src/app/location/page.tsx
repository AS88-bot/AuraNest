'use client';

import { useState } from 'react';
import MapView from '@/components/location/map-view';

export default function LocationPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Location & Navigation
        </h1>
        <p className="text-muted-foreground mt-2">
          See your location, check safe zones, and get directions home.
        </p>
      </header>
      <MapView />
    </div>
  );
}
