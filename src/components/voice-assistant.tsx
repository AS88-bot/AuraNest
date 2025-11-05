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
import { useFirebase, useUser } from '@/firebase';
import { sendEmergencyAlert } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { contacts } from '@/lib/data';
import type { User } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { useLocale } from '@/hooks/use-locale';


const handleCommand = (
  command: string,
  setFeedback: (feedback: string) => void,
  stopListening: () => void,
  firestore: Firestore | null,
  user: User | null,
  toast: (options: any) => void,
  t: (key: string) => string
) => {
  const lowerCaseCommand = command.toLowerCase();
  setFeedback(`${t('voiceAssistant.heard')}: "${command}"`);

  // --- Command Definitions ---
  const navItems = [
    { key: 'dashboard', route: '' },
    { key: 'contacts', route: 'contacts' },
    { key: 'journal', route: 'journal' },
    { key: 'location', route: 'location' },
    { key: 'reminders', route: 'reminders' },
    { key: 'caregiver', route: 'caregiver' },
    { key: 'settings', route: 'settings' },
  ];

  const commandKeywords = {
    emergency: ['help', 'emergency', 'sos', 'ayuda', 'emergencia', 'socorro', 'aide', 'urgence', 'hilfe', 'notfall', 'मदद', 'आपातकाल', 'aiuto', 'emergenza'],
    call: ['call', 'llama a', 'appelle', 'anrufen', 'बुलाओ', 'chiama'],
    goTo: ['go to', 'navigate to', 'open', 'ir a', 'navegar a', 'abrir', 'aller à', 'naviguer vers', 'ouvrir', 'gehe zu', 'öffne', 'जाओ', 'खोलो', 'vai a', 'apri'],
    remind: ['remind me', 'set a reminder', 'add reminder', 'recuérdame', 'crear recordatorio', 'créer un rappel', 'ajouter un rappel', 'erinnere mich', 'erinnerung hinzufügen', 'मुझे याद दिलाओ', 'अनुस्मारक जोड़ें', 'ricordami', 'imposta un promemoria']
  };

  let actionTaken = false;

  const takeAction = () => {
    actionTaken = true;
    setTimeout(() => stopListening(), 2000);
  };


  // 1. Check for Emergency (High Priority)
  if (commandKeywords.emergency.some(c => lowerCaseCommand.includes(c))) {
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
    takeAction();
    return;
  }
  
  // 2. Check for Navigation
  const goToKeyword = commandKeywords.goTo.find(k => lowerCaseCommand.startsWith(k + ' '));
  if (goToKeyword) {
      const target = lowerCaseCommand.substring(goToKeyword.length).trim();
      for (const navItem of navItems) {
          const translatedPageName = t(`nav.${navItem.key}`).toLowerCase();
          if (target.includes(translatedPageName)) {
               setFeedback(`${t('voiceAssistant.navigatingTo')} ${t('nav.'+navItem.key)}...`);
               window.location.href = `/${navItem.route}`;
               takeAction();
               return;
          }
      }
  }


  // 3. Check for Calling Contact
  const callKeyword = commandKeywords.call.find(k => lowerCaseCommand.startsWith(k + ' '));
  if (callKeyword) {
      const target = lowerCaseCommand.substring(callKeyword.length).trim();
      for (const contact of contacts) {
          const translatedContactName = t(contact.name).toLowerCase();
          if (target.includes(translatedContactName)) {
            if (contact.phone) {
              setFeedback(`${t('voiceAssistant.calling')} ${t(contact.name)}...`);
              window.location.href = `tel:${contact.phone}`;
            } else {
              setFeedback(t('voiceAssistant.contactNotFound').replace('{contactName}', translatedContactName));
            }
            takeAction();
            return;
          }
      }
  }


  // 4. Check for Reminders
  if (commandKeywords.remind.some(c => lowerCaseCommand.includes(c))) {
    setFeedback(t('voiceAssistant.openingReminders'));
    window.location.href = '/reminders';
    takeAction();
    return;
  }
  
  if (!actionTaken) {
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
        const currentTranscript = event.results[0][0].transcript.trim();
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
