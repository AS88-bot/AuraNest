'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Mic, MicOff } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { sendEmergencyAlert } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

export function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  
  useEffect(() => {
    setIsMounted(true);
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      const recognitionInstance = new SpeechRecognitionAPI();
      recognitionInstance.continuous = false;
      recognitionInstance.lang = 'en-US';
      recognitionInstance.interimResults = false;

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const currentTranscript = event.results[0][0].transcript.trim().toLowerCase();
        setTranscript(currentTranscript);
        handleCommand(currentTranscript);
        stopListening();
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          toast({
            variant: 'destructive',
            title: 'Microphone Access Denied',
            description: 'Please enable microphone permissions in your browser settings.',
          });
        }
        stopListening();
      };

      recognitionInstance.onend = () => {
        if (recognitionRef.current) {
          setIsListening(false);
        }
      };
      
      recognitionRef.current = recognitionInstance;
    } else {
      console.warn('Speech Recognition API not supported in this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);

  const handleCommand = (command: string) => {
    console.log('Command received:', command);

    if (command.includes('go to dashboard')) {
      window.location.href = '/';
    } else if (command.includes('go to contacts')) {
      window.location.href = '/contacts';
    } else if (command.includes('go to journal')) {
        window.location.href = '/journal';
    } else if (command.includes('go to location')) {
        window.location.href = '/location';
    } else if (command.includes('go to reminders')) {
        window.location.href = '/reminders';
    } else if (command.includes('go to caregiver')) {
        window.location.href = '/caregiver';
    } else if (command.includes('send emergency alert')) {
        if (firestore && user) {
            sendEmergencyAlert(firestore, user);
            toast({
                title: 'Emergency Alert Sent',
                description: 'Your location has been sent to your emergency contacts.',
                variant: 'destructive',
            });
        }
    }
    
    setTimeout(() => {
      setTranscript('');
    }, 3000);
  };
  
  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('');
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch(e) {
        console.error("Error starting speech recognition: ", e);
        setIsListening(false);
      }
    }
  }
  
  const stopListening = () => {
     if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
  if (!isMounted || !recognitionRef.current) {
    return null; 
  }

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        className="h-16 w-16 rounded-full shadow-lg"
        onClick={toggleListening}
      >
        <Mic className="h-8 w-8" />
        <span className="sr-only">Voice Command</span>
      </Button>

      <Dialog open={isListening} onOpenChange={setIsListening}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Listening...</DialogTitle>
            <DialogDescription className="text-center text-lg">
              Please say a command.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-8 gap-6">
            {isListening ? (
                <Mic className="h-24 w-24 text-primary animate-pulse" />
            ) : (
                <MicOff className="h-24 w-24 text-muted-foreground" />
            )}
            <p className="text-muted-foreground text-center min-h-[50px] text-xl">
              {transcript || 'e.g., "Go to contacts" or "Send emergency alert"'}
            </p>
          </div>
           <DialogFooter>
            <Button variant="destructive" onClick={stopListening}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
