'use client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useFirebase, setDocumentNonBlocking } from '@/firebase';
import { HeartPulse } from 'lucide-react';
import { doc, serverTimestamp } from 'firebase/firestore';

export function SOSButton() {
  const { firestore, user } = useFirebase();

  const handleSendAlert = () => {
    if (navigator.geolocation && user && firestore) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationData = {
            userId: user.uid,
            latitude,
            longitude,
            timestamp: serverTimestamp(),
            // This would be populated with actual caregiver UIDs
            caregiverIds: ['caregiver1-uid', 'caregiver2-uid'], 
          };
          
          // We use a fixed document ID 'latest' to always store the last known location.
          const emergencyLocationRef = doc(firestore, `users/${user.uid}/emergencyLocation`, 'latest');

          setDocumentNonBlocking(emergencyLocationRef, locationData, { merge: true });

          console.log('Location sent to emergency contacts.');
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
        console.log("Could not send alert. User not logged in, firestore not available or geolocation is not supported.");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="lg"
          className="h-16 w-16 rounded-full shadow-lg"
        >
          <HeartPulse className="h-8 w-8" />
          <span className="sr-only">Emergency SOS</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Send Emergency Alert?</AlertDialogTitle>
          <AlertDialogDescription>
            This will immediately send an alert with your current location to
            your emergency contacts. Are you sure you want to proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSendAlert}>
            Send Alert
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

    