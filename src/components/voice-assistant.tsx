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
  toast: (options: any) => void,
  t: (key: string) => string
) => {
  let actionTaken = false;
  setFeedback(`${t('voiceAssistant.heard')}: "${command}"`);

  const emergencyCommands = ['help', 'emergency', 'sos', 'ayuda', 'emergencia', 'aide', 'urgence', 'hilfe', 'notfall', 'मदद', 'आपातकाल', 'aiuto', 'emergenza'];
  const navigationCommands = ['go to', 'show me', 'open', 'ir a', 'muéstrame', 'abrir', 'aller à', 'montre-moi', 'ouvrir', 'gehe zu', 'zeige mir', 'öffne', 'जाओ', 'मुझे दिखाओ', 'खोलो', 'vai a', 'mostrami', 'apri'];
  const callCommands = ['call', 'llama a', 'appelle', 'anrufen', 'बुलाओ', 'chiama'];
  const navigationTargets: {[key: string]: string} = {
    'dashboard': 'dashboard', 'tablero': 'dashboard', 'tableau de bord': 'dashboard', 'instrumententafel': 'dashboard', 'डैशबोर्ड': 'dashboard', 'cruscotto': 'dashboard',
    'contacts': 'contacts', 'contactos': 'contacts',
    'journal': 'journal', 'diario': 'journal',
    'location': 'location', 'ubicación': 'location', 'localisation': 'location', 'standort': 'location', 'स्थान': 'location', 'posizione': 'location',
    'reminders': 'reminders', 'recordatorios': 'reminders', 'rappels': 'reminders', 'erinnerungen': 'reminders', 'अनुस्मारक': 'reminders', 'promemoria': 'reminders',
    'caregiver': 'caregiver', 'cuidador': 'caregiver', 'aidant': 'caregiver', 'betreuer': 'caregiver', 'देखभालकर्ता': 'caregiver', 'assistente': 'caregiver',
    'settings': 'settings', 'ajustes': 'settings', 'paramètres': 'settings', 'einstellungen': 'settings', 'सेटिंग्स': 'settings', 'impostazioni': 'settings'
  };

  // Emergency commands
  if (emergencyCommands.some(c => command.includes(c))) {
    setFeedback(t('voiceAssistant.sendingAlert'));
    if (firestore && user) {
        sendEmergencyAlert(firestore, user);
        toast({
            title: t('sosButton.sentTitle'),
            description: t('sosButton.sentDescription'),
            variant: 'destructive',
        });
    } else {
      toast({
          title: t('sosButton.errorTitle'),
          description: t('sosButton.errorDescription'),
          variant: 'destructive',
      });
    }
    actionTaken = true;
  }
  
  if (!actionTaken) {
    // Navigation commands
    const navCommand = navigationCommands.find(c => command.startsWith(c));
    if (navCommand) {
        const targetSpoken = command.substring(navCommand.length).trim();
        const targetKey = Object.keys(navigationTargets).find(key => targetSpoken.includes(key.toLowerCase()));

        if (targetKey) {
            const targetPage = navigationTargets[targetKey];
            setFeedback(`${t('voiceAssistant.navigatingTo')} ${t('nav.'+targetPage)}...`);
            window.location.href = `/${targetPage === 'dashboard' ? '' : targetPage}`;
            actionTaken = true;
        }
    }
  }

  if (!actionTaken) {
    // Calling commands
    const callCommand = callCommands.find(c => command.startsWith(c));
    if (callCommand) {
        const contactNameSpoken = command.substring(callCommand.length).trim().toLowerCase();
        const contactToCall = contacts.find(c => t(c.name).toLowerCase() === contactNameSpoken);
        
        if (contactToCall && contactToCall.phone) {
            setFeedback(`${t('voiceAssistant.calling')} ${t(contactToCall.name)}...`);
            window.location.href = `tel:${contactToCall.phone}`;
            actionTaken = true;
        } else {
            setFeedback(t('voiceAssistant.contactNotFound').replace('{contactName}', contactNameSpoken));
        }
    }
  }
  
  // Reminder commands (check if not already handled)
  if (!actionTaken && ['remind me', 'set a reminder', 'recuérdame', 'créer un rappel', 'erinnere mich', 'मुझे याद दिलाओ', 'ricordami'].some(c => command.includes(c))) {
    setFeedback(t('voiceAssistant.openingReminders'));
    window.location.href = '/reminders';
    actionTaken = true;
  }

  if (actionTaken) {
    setTimeout(() => stopListening(), 2000);
  } else {
     setFeedback(t('voiceAssistant.didNotUnderstand'));
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
  const { locale, t } = useLocale();
  
  useEffect(() => {
    setIsMounted(true);
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      const recognitionInstance = new SpeechRecognitionAPI();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      
      recognitionInstance.lang = locale;

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const currentTranscript = event.results[0][0].transcript.trim().toLowerCase();
        setTranscript(currentTranscript);
        handleCommand(currentTranscript, setFeedback, stopListening, firestore, user, toast, t);
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
  }, [firestore, user, toast, locale, t]); // Add locale and t to deps

  const startListening = () => {
    if (recognitionRef.current) {
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
        aria-label={t('voiceAssistant.ariaLabel')}
      >
        {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
      </Button>

      <Dialog open={isListening} onOpenChange={setIsListening}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">{t('voiceAssistant.listeningTitle')}</DialogTitle>
            <DialogDescription className="text-center text-lg">
              {t('voiceAssistant.listeningDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-8 gap-6 min-h-[250px]">
            <Mic className="h-24 w-24 text-primary animate-pulse" />
            <p className="text-muted-foreground text-center min-h-[2.5rem] text-xl px-4 py-2 rounded-lg bg-muted w-full">
              {feedback || transcript || t('voiceAssistant.placeholder')}
            </p>
          </div>
           <DialogFooter>
            <Button variant="destructive" onClick={stopListening}>
              {t('voiceAssistant.cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
