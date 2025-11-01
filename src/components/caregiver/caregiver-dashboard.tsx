'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertTriangle, Clock } from 'lucide-react';
import { useFirebase, useUser } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import { useMemo, useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { useLocale } from '@/hooks/use-locale';

export default function CaregiverDashboard() {
  const mapImage = PlaceHolderImages.find(p => p.id === 'map-placeholder');
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [timeSinceUpdate, setTimeSinceUpdate] = useState('');
  const [isClient, setIsClient] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // This assumes we are finding the location for a specific hardcoded user.
  // In a real app, you would have a way to determine which user the caregiver is looking for.
  const caredForUserId = 'test-user-id'; 

  const emergencyLocationRef = useMemo(() => {
    // Only create the reference if we have a logged-in user and firestore instance
    if (!firestore || !user) return null;
    return doc(firestore, `users/${caredForUserId}/emergencyLocation`, 'latest');
  }, [firestore, user]);

  const { data: locationData, isLoading: isLocationLoading } = useDoc(emergencyLocationRef);
  
  useEffect(() => {
    if (locationData?.timestamp && typeof locationData.timestamp.toDate === 'function') {
      const updateTime = () => {
        setTimeSinceUpdate(formatDistanceToNow(locationData.timestamp.toDate(), { addSuffix: true }));
      };
      updateTime();
      const interval = setInterval(updateTime, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [locationData]);

  const isLoading = isUserLoading || isLocationLoading;

  if (!user && !isUserLoading) {
    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>{t('caregiver.loginPrompt')}</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{t('caregiver.loginDescription')}</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl">{t('caregiver.userLocation')}</CardTitle>
                        <Badge variant="destructive" className="text-md py-2 px-4">
                            <AlertTriangle className="mr-2 h-5 w-5" />
                            {t('caregiver.sosAlert')}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                {mapImage && (
                    <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border-2 border-destructive/40">
                        <Image
                            src={mapImage.imageUrl}
                            alt={mapImage.description}
                            fill
                            style={{ objectFit: 'cover' }}
                            data-ai-hint={mapImage.imageHint}
                        />
                        {/* Mock User Location Pin - this would be driven by real lat/long data */}
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <div className="relative flex items-center justify-center">
                                <span className="absolute h-10 w-10 animate-ping rounded-full bg-destructive opacity-75"></span>
                                <span className="relative rounded-full h-4 w-4 bg-destructive border-2 border-white"></span>
                            </div>
                        </div>

                    </div>
                )}
                </CardContent>
            </Card>
        </div>
        
        <div className="space-y-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">{t('caregiver.locationDetails')}</CardTitle>
                    <CardDescription>{t('caregiver.locationDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoading && (
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-5 w-1/2" />
                            <Skeleton className="h-5 w-1/2" />
                        </div>
                    )}
                    {!isLoading && locationData && (
                         <div className="space-y-2 text-lg">
                            <div className="flex items-center gap-3">
                                <Clock className="h-6 w-6 text-muted-foreground" />
                                {isClient && timeSinceUpdate ? (
                                   <span>{t('caregiver.lastUpdated')} <strong>{timeSinceUpdate}</strong></span>
                                ) : (
                                  <Skeleton className="h-6 w-32" />
                                )}
                            </div>
                            <p>{t('caregiver.latitude')} {locationData.latitude.toFixed(5)}</p>
                            <p>{t('caregiver.longitude')} {locationData.longitude.toFixed(5)}</p>
                        </div>
                    )}
                    {!isLoading && !locationData && <p>{t('caregiver.noData')}</p>}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
