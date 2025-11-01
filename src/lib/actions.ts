'use client';

import { setDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp, Firestore } from 'firebase/firestore';
import type { User } from 'firebase/auth';

/**
 * Gets the user's current location and sends it to Firestore.
 * @param firestore - The Firestore instance.
 * @param user - The authenticated user object.
 */
export const sendEmergencyAlert = (firestore: Firestore, user: User) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // In a real app, this would be fetched from the user's profile or contacts list.
        const mockEmergencyContactIds = ['contact1-uid', 'contact2-uid'];

        const locationData = {
          userId: user.uid,
          latitude,
          longitude,
          timestamp: serverTimestamp(),
          emergencyContactIds: mockEmergencyContactIds,
        };

        // We use a fixed document ID 'latest' to always store the last known location.
        const emergencyLocationRef = doc(
          firestore,
          `users/${user.uid}/emergencyLocation`,
          'latest'
        );

        setDocumentNonBlocking(emergencyLocationRef, locationData, { merge: true });

        console.log('Location sent to emergency contacts.');
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  } else {
    console.log(
      'Could not send alert. Geolocation is not supported by this browser.'
    );
  }
};
