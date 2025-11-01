'use client';

import { useState, useEffect, useRef }from 'react';
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
import { contacts } from '@/lib/data';
import type { User } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { useLocale } from '@/hooks/use-locale';


// This function is moved outside the component to prevent it from capturing a stale `user` state.
const handleCommand = (
  command: string, 
  setFeedback: (feedback: string) => void,
  stopListening: () => void,
  firestore: Firestore | null, 
  user: User | null,
  toast: (options: any) => void
) => {
  let actionTaken = false;
  setFeedback(`I heard: "${command}"`);

  // Emergency commands
  if (command.includes('help') || command.includes('emergency') || command.includes('sos')) {
    setFeedback('Sending emergency alert...');
    if (firestore && user) {
        sendEmergencyAlert(firestore, user);
        toast({
            title: 'Emergency Alert Sent',
            description: 'Your location has been sent to your emergency contacts.',
            variant: 'destructive',
        });
    } else {
      toast({
          title: 'Could Not Send Alert',
          description: 'Please log in to send an alert.',
          variant: 'destructive',
      });
    }
    actionTaken = true;
  }
  // Navigation commands
  else if (command.includes('go to') || command.includes('show me') || command.includes('open') || command.includes('ir a') || command.includes('muéstrame')) {
    const targets = ['dashboard', 'contacts', 'journal', 'location', 'reminders', 'caregiver', 'settings'];
    const target = targets.find(t => command.includes(t));
    if (target) {
      setFeedback(`Navigating to ${target}...`);
      window.location.href = `/${target === 'dashboard' ? '' : target}`;
      actionTaken = true;
    }
  }
  // Calling commands
  else if (command.startsWith('call') || command.startsWith('llama a')) {
    const contactName = command.replace('call ', '').replace('llama a', '').trim();
    const contactToCall = contacts.find(c => c.name.toLowerCase() === contactName);
    if (contactToCall && contactToCall.phone) {
      setFeedback(`Calling ${contactToCall.name}...`);
      window.location.href = `tel:${contactToCall.phone}`;
      actionTaken = true;
    } else {
      setFeedback(`Sorry, I couldn't find a contact named ${contactName}.`);
    }
  }
  // Reminder commands
  else if (command.includes('remind me') || command.includes('set a reminder') || command.includes('recuérdame')) {
    setFeedback('Opening reminders...');
    window.location.href = '/reminders';
    actionTaken = true;
  }

  if (actionTaken) {
    setTimeout(() => stopListening(), 2000);
  } else {
     setFeedback('Sorry, I didn\'t understand that. Please try again.');
  }
};


export function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const { locale } = useLocale();
  
  useEffect(() => {
    setIsMounted(true);
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      const recognitionInstance = new SpeechRecognitionAPI();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      
      // Set the language based on the current app locale
      recognitionInstance.lang = locale;

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const currentTranscript = event.results[0][0].transcript.trim().toLowerCase();
        setTranscript(currentTranscript);
        // We pass the current user and firestore instances directly to the handler
        handleCommand(currentTranscript, setFeedback, stopListening, firestore, user, toast);
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
        // Check ref before setting state to avoid updates on unmounted component
        if (recognitionRef.current) {
          setIsListening(false);
        }
      };
      
      recognitionRef.current = recognitionInstance;
    } else {
      console.warn('Speech Recognition API not supported in this browser.');
      toast({
        variant: 'destructive',
        title: 'Voice Assistant Not Supported',
        description: 'Your browser does not support the Web Speech API.',
      });
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore, user, toast, locale]); // Add locale to deps

  const startListening = () => {
    if (recognitionRef.current) {
      // Update language on the recognition instance right before starting
      recognitionRef.current.lang = locale;
      setTranscript('');
      setFeedback('');
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch(e) {
        console.error("Error starting speech recognition: ", e);
        if((e as DOMException).name === 'NotAllowedError') {
             toast({
                variant: 'destructive',
                title: 'Microphone Access Denied',
                description: 'Please enable microphone permissions in your browser settings.',
            });
        }
        setIsListening(false);
      }
    }
  }
  
  const stopListening = () => {
     if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
  if (!isMounted) {
    return null; 
  }
  
  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
     return (
      <Button variant="outline" size="lg" className="h-16 w-16 rounded-full shadow-lg" disabled>
        <MicOff className="h-8 w-8" />
        <span className="sr-only">Voice Commands Not Supported</span>
      </Button>
    );
  }


  return (
    <>
      <Button
        variant="outline"
        size="lg"
        className="h-16 w-16 rounded-full shadow-lg"
        onClick={toggleListening}
      >
        {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
        <span className="sr-only">Voice Command</span>
      </Button>

      <Dialog open={isListening} onOpenChange={setIsListening}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Listening...</DialogTitle>
            <DialogDescription className="text-center text-lg">
              What can I help you with?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-8 gap-6 min-h-[250px]">
            <Mic className="h-24 w-24 text-primary animate-pulse" />
            <p className="text-muted-foreground text-center min-h-[2.5rem] text-xl px-4 py-2 rounded-lg bg-muted w-full">
              {feedback || transcript || 'e.g., "Call Sarah" or "Help me"'}
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
