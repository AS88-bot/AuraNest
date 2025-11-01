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
import { useFirebase } from '@/firebase';
import { HeartPulse } from 'lucide-react';
import { sendEmergencyAlert } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

export function SOSButton() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const handleSendAlert = () => {
    if (firestore && user) {
      sendEmergencyAlert(firestore, user);
      toast({
        title: 'Emergency Alert Sent',
        description: 'Your location has been sent to your emergency contacts.',
        variant: 'destructive',
      });
    } else {
      console.log(
        'Could not send alert. User not logged in, firestore not available or geolocation is not supported.'
      );
      toast({
        title: 'Could Not Send Alert',
        description:
          'Please make sure you are logged in and have location services enabled.',
        variant: 'destructive',
      });
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
